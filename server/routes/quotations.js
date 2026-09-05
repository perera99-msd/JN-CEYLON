const express = require('express');
const router = express.Router();
const Quotation = require('../models/Quotation');
const { previewNextSequence, consumeNextSequence } = require('../services/sequenceService');
const { logActivity } = require('../services/activityLogger');

// GET /api/quotations - List with status, search filters, and optional pagination
router.get('/', async (req, res) => {
  try {
    const { status, companyId, search, page, limit } = req.query;
    let query = { isDeleted: { $ne: true } };

    if (status && status !== 'ALL') {
      query.status = status;
    }
    if (companyId) {
      query.company = companyId;
    }
    if (search) {
      query.$or = [
        { quotationNo: { $regex: search, $options: 'i' } },
        { custCode: { $regex: search, $options: 'i' } },
        { preparedBy: { $regex: search, $options: 'i' } }
      ];
    }

    if (page) {
      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 15));
      const skip = (pageNum - 1) * limitNum;
      const total = await Quotation.countDocuments(query);
      const quotations = await Quotation.find(query)
        .populate('company')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

      return res.json({
        data: quotations,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      });
    }

    const quotations = await Quotation.find(query)
      .populate('company')
      .sort({ createdAt: -1 });

    res.json(quotations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/quotations/export - Export quotations as CSV
router.get('/export', async (req, res) => {
  try {
    const quotations = await Quotation.find({ isDeleted: { $ne: true } })
      .populate('company')
      .sort({ createdAt: -1 });

    const headers = ['Quotation No', 'Date', 'Customer Code', 'Company', 'Prepared By', 'Total (USD)', 'Status'];
    const rows = quotations.map(q => [
      q.quotationNo || '',
      q.date || '',
      `"${(q.custCode || '').replace(/"/g, '""')}"`,
      `"${(q.company?.name || '').replace(/"/g, '""')}"`,
      `"${(q.preparedBy || '').replace(/"/g, '""')}"`,
      (q.grandTotal || 0).toFixed(2),
      q.status || ''
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="quotations_${new Date().toISOString().slice(0, 10)}.csv"`);
    res.status(200).send(csvContent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/quotations/next-number - Get auto-generated next quotation number
router.get('/next-number', async (req, res) => {
  try {
    const nextNo = await previewNextSequence('QUOTATION');
    res.json({ nextNo });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/quotations/:id - Get single quotation
router.get('/:id', async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id).populate('company');
    if (!quotation) return res.status(404).json({ message: 'Quotation not found' });
    res.json(quotation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/quotations/:id/duplicate - Duplicate quotation with next sequence number
router.post('/:id/duplicate', async (req, res) => {
  try {
    const original = await Quotation.findById(req.params.id);
    if (!original) return res.status(404).json({ message: 'Quotation not found' });

    const nextNo = await consumeNextSequence('QUOTATION');
    const today = new Date().toLocaleDateString('en-GB').replace(/\//g, '.');

    const duplicated = new Quotation({
      quotationNo: nextNo,
      date: today,
      company: original.company,
      custCode: original.custCode,
      preparedBy: original.preparedBy,
      status: 'DRAFT',
      poNumber: '',
      items: (original.items || []).map(item => ({
        no: item.no,
        name: item.name,
        image: item.image,
        qty: item.qty,
        desc: item.desc,
        price: item.price,
        total: item.total
      })),
      subtotal: original.subtotal,
      tax: original.tax,
      discount: original.discount,
      iva: original.iva,
      grandTotal: original.grandTotal,
      terms: original.terms ? {
        price: original.terms.price,
        delivery: original.terms.delivery,
        term: original.terms.term,
        validity: original.terms.validity
      } : undefined
    });

    await duplicated.save();

    logActivity({
      req,
      action: 'DUPLICATE',
      entityType: 'QUOTATION',
      entityId: duplicated._id,
      entityIdentifier: duplicated.quotationNo,
      description: `Duplicated quotation ${original.quotationNo} as ${duplicated.quotationNo}`
    });

    const populated = await Quotation.findById(duplicated._id).populate('company');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/quotations - Create quotation (prevents duplicate number)
router.post('/', async (req, res) => {
  try {
    let { quotationNo, date, company, custCode, preparedBy, items, terms, status, poNumber } = req.body;

    // Check what the auto-increment expects next
    const expectedNextNo = await previewNextSequence('QUOTATION');
    
    if (!quotationNo) {
      // If not provided, we must consume it
      quotationNo = await consumeNextSequence('QUOTATION');
    } else if (quotationNo === expectedNextNo) {
      // If the provided number perfectly matches the expected next sequence, we safely consume it
      await consumeNextSequence('QUOTATION');
    }

    // Check duplicate
    const existing = await Quotation.findOne({ quotationNo: quotationNo.trim() });
    if (existing) {
      return res.status(400).json({ message: `Quotation number "${quotationNo}" already exists! Duplicate numbers are not allowed.` });
    }


    // Calculate totals
    const calculatedItems = (items || []).map(item => {
      const qty = parseFloat(item.qty || 0);
      const price = parseFloat(item.price || 0);
      return {
        ...item,
        qty,
        price,
        total: parseFloat((qty * price).toFixed(2))
      };
    });

    const subtotal = calculatedItems.reduce((sum, item) => sum + item.total, 0);

    const quotation = new Quotation({
      quotationNo: quotationNo.trim(),
      date,
      company,
      custCode,
      preparedBy,
      items: calculatedItems,
      subtotal,
      grandTotal: subtotal,
      terms,
      status: status || 'DRAFT',
      poNumber: poNumber || ''
    });

    await quotation.save();

    logActivity({
      req,
      action: 'CREATE',
      entityType: 'QUOTATION',
      entityId: quotation._id,
      entityIdentifier: quotation.quotationNo,
      description: `Created quotation ${quotation.quotationNo}`
    });

    const populated = await Quotation.findById(quotation._id).populate('company');
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/quotations/:id - Edit quotation
router.put('/:id', async (req, res) => {
  try {
    const { quotationNo, date, company, custCode, preparedBy, items, terms, status, poNumber } = req.body;

    // Check duplicate number if changed
    if (quotationNo) {
      const existing = await Quotation.findOne({
        quotationNo: quotationNo.trim(),
        _id: { $ne: req.params.id }
      });
      if (existing) {
        return res.status(400).json({ message: `Quotation number "${quotationNo}" already belongs to another quotation!` });
      }
    }

    const calculatedItems = (items || []).map(item => {
      const qty = parseFloat(item.qty || 0);
      const price = parseFloat(item.price || 0);
      return {
        ...item,
        qty,
        price,
        total: parseFloat((qty * price).toFixed(2))
      };
    });

    const subtotal = calculatedItems.reduce((sum, item) => sum + item.total, 0);

    const updateData = {
      date,
      company,
      custCode,
      preparedBy,
      items: calculatedItems,
      subtotal,
      grandTotal: subtotal,
      terms
    };

    if (quotationNo) updateData.quotationNo = quotationNo.trim();
    if (status) updateData.status = status;
    if (poNumber !== undefined) updateData.poNumber = poNumber;

    const quotation = await Quotation.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('company');

    if (!quotation) return res.status(404).json({ message: 'Quotation not found' });
    res.json(quotation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PATCH /api/quotations/:id/status - Update status or attach PO number
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, poNumber } = req.body;
    const updateData = {};
    if (status) updateData.status = status;
    if (poNumber !== undefined) updateData.poNumber = poNumber;

    const quotation = await Quotation.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('company');

    if (!quotation) return res.status(404).json({ message: 'Quotation not found' });
    res.json(quotation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/quotations/:id
router.delete('/:id', async (req, res) => {
  try {
    const quotation = await Quotation.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );
    if (!quotation) return res.status(404).json({ message: 'Quotation not found' });

    logActivity({
      req,
      action: 'DELETE',
      entityType: 'QUOTATION',
      entityId: quotation._id,
      entityIdentifier: quotation.quotationNo,
      description: `Moved quotation ${quotation.quotationNo} to Recycle Bin`
    });

    res.json({ message: 'Quotation moved to Recycle Bin' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

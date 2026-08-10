const express = require('express');
const router = express.Router();
const Quotation = require('../models/Quotation');
const { previewNextSequence, consumeNextSequence } = require('../services/sequenceService');

// GET /api/quotations - List with status and search filters
router.get('/', async (req, res) => {
  try {
    const { status, companyId, search } = req.query;
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

    const quotations = await Quotation.find(query)
      .populate('company')
      .sort({ createdAt: -1 });

    res.json(quotations);
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
    res.json({ message: 'Quotation moved to Recycle Bin' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

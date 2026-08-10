const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const Quotation = require('../models/Quotation');
const Payment = require('../models/Payment');
const { previewNextSequence, consumeNextSequence } = require('../services/sequenceService');

// GET /api/invoices - List with filters
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
        { invoiceNo: { $regex: search, $options: 'i' } },
        { poNumber: { $regex: search, $options: 'i' } },
        { quotationNo: { $regex: search, $options: 'i' } },
        { custCode: { $regex: search, $options: 'i' } }
      ];
    }

    const invoices = await Invoice.find(query)
      .populate('company')
      .populate('quotation')
      .sort({ createdAt: -1 });

    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/invoices/next-number - Get next invoice number
router.get('/next-number', async (req, res) => {
  try {
    const nextNo = await previewNextSequence('INVOICE');
    res.json({ nextNo });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/invoices/:id - Get single invoice
router.get('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('company')
      .populate('quotation');
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/invoices - Create invoice (prevents duplicate invoice number)
router.post('/', async (req, res) => {
  try {
    let { invoiceNo, date, company, custCode, preparedBy, poNumber, quotationNo, quotation, items, terms, dueDate, status } = req.body;

    const expectedNextNo = await previewNextSequence('INVOICE');

    if (!invoiceNo) {
      invoiceNo = await consumeNextSequence('INVOICE');
    } else if (invoiceNo === expectedNextNo) {
      await consumeNextSequence('INVOICE');
    }

    // Duplicate check
    const existing = await Invoice.findOne({ invoiceNo: invoiceNo.trim() });
    if (existing) {
      return res.status(400).json({ message: `Invoice number "${invoiceNo}" already exists! Duplicate numbers are strictly prohibited.` });
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

    const invoice = new Invoice({
      invoiceNo: invoiceNo.trim(),
      date,
      company,
      custCode,
      preparedBy,
      poNumber: poNumber || 'PO-PENDING',
      quotationNo: quotationNo || '',
      quotation: quotation || null,
      items: calculatedItems,
      subtotal,
      grandTotal: subtotal,
      amountPaid: 0,
      balanceDue: subtotal,
      dueDate: dueDate || date,
      terms,
      status: status || 'PENDING'
    });

    await invoice.save();

    // If linked to quotation, update quotation status to CONVERTED
    if (quotation) {
      await Quotation.findByIdAndUpdate(quotation, {
        status: 'CONVERTED',
        linkedInvoice: invoice._id,
        poNumber: poNumber || ''
      });
    }

    const populated = await Invoice.findById(invoice._id).populate('company').populate('quotation');
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// POST /api/invoices/from-quotation/:quotationId - Convert Quotation to Invoice
router.post('/from-quotation/:quotationId', async (req, res) => {
  try {
    const { poNumber, invoiceNo, dueDate } = req.body;
    const quotation = await Quotation.findById(req.params.quotationId).populate('company');
    if (!quotation) return res.status(404).json({ message: 'Quotation not found' });

    const expectedNextNo = await previewNextSequence('INVOICE');
    
    let nextInvNo = invoiceNo;
    if (!nextInvNo) {
      nextInvNo = await consumeNextSequence('INVOICE');
    } else if (nextInvNo === expectedNextNo) {
      await consumeNextSequence('INVOICE');
    }

    // Duplicate check
    const existing = await Invoice.findOne({ invoiceNo: nextInvNo.trim() });
    if (existing) {
      return res.status(400).json({ message: `Invoice number "${nextInvNo}" already exists!` });
    }

    const todayStr = new Date().toLocaleDateString('en-GB').replace(/\//g, '.');

    const invoice = new Invoice({
      invoiceNo: nextInvNo.trim(),
      date: todayStr,
      company: quotation.company._id,
      custCode: quotation.custCode,
      preparedBy: quotation.preparedBy,
      poNumber: poNumber || quotation.poNumber || '55806',
      quotationNo: quotation.quotationNo,
      quotation: quotation._id,
      items: quotation.items,
      subtotal: quotation.subtotal,
      grandTotal: quotation.grandTotal,
      amountPaid: 0,
      balanceDue: quotation.grandTotal,
      dueDate: dueDate || todayStr,
      terms: quotation.terms,
      status: 'PENDING'
    });

    await invoice.save();

    // Mark quotation CONVERTED
    quotation.status = 'CONVERTED';
    quotation.linkedInvoice = invoice._id;
    if (poNumber) quotation.poNumber = poNumber;
    await quotation.save();

    const populated = await Invoice.findById(invoice._id).populate('company').populate('quotation');
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/invoices/:id - Edit invoice
router.put('/:id', async (req, res) => {
  try {
    const { invoiceNo, date, company, custCode, preparedBy, poNumber, quotationNo, items, terms, dueDate, status } = req.body;

    if (invoiceNo) {
      const existing = await Invoice.findOne({
        invoiceNo: invoiceNo.trim(),
        _id: { $ne: req.params.id }
      });
      if (existing) {
        return res.status(400).json({ message: `Invoice number "${invoiceNo}" already belongs to another invoice!` });
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

    const existingInv = await Invoice.findById(req.params.id);
    if (!existingInv) return res.status(404).json({ message: 'Invoice not found' });

    const amountPaid = existingInv.amountPaid || 0;
    const balanceDue = Math.max(0, subtotal - amountPaid);

    let calculatedStatus = status || existingInv.status;
    if (balanceDue === 0 && subtotal > 0) {
      calculatedStatus = 'PAID';
    } else if (amountPaid > 0 && balanceDue > 0) {
      calculatedStatus = 'PARTIAL';
    }

    const updateData = {
      date,
      company,
      custCode,
      preparedBy,
      poNumber,
      quotationNo,
      items: calculatedItems,
      subtotal,
      grandTotal: subtotal,
      balanceDue,
      dueDate,
      terms,
      status: calculatedStatus
    };

    if (invoiceNo) updateData.invoiceNo = invoiceNo.trim();

    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('company').populate('quotation');

    res.json(invoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PATCH /api/invoices/:id/due-date - Quick update due date
router.patch('/:id/due-date', async (req, res) => {
  try {
    const { dueDate } = req.body;
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { dueDate },
      { new: true }
    ).populate('company').populate('quotation');
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json(invoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/invoices/:id
router.delete('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    // Cascade soft-delete all payments linked to this invoice
    await Payment.updateMany(
      { invoice: req.params.id },
      { isDeleted: true, deletedAt: new Date() }
    );

    res.json({ message: 'Invoice and associated payments moved to Recycle Bin' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

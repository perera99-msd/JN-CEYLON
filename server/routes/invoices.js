const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const Quotation = require('../models/Quotation');
const Payment = require('../models/Payment');
const { previewNextSequence, consumeNextSequence } = require('../services/sequenceService');
const { logActivity } = require('../services/activityLogger');
const { parseDateString, isPastDueDate } = require('../services/overdueChecker');

/**
 * Calculates a date string 1 month ahead from the given base date (DD.MM.YYYY).
 */
const getOneMonthAhead = (baseDateStr) => {
  let dateObj = new Date();
  if (baseDateStr && typeof baseDateStr === 'string') {
    const parsed = parseDateString(baseDateStr);
    if (parsed) dateObj = parsed;
  }
  const due = new Date(dateObj);
  due.setMonth(due.getMonth() + 1);
  return due.toLocaleDateString('en-GB').replace(/\//g, '.');
};

/**
 * Helper to reconcile an invoice's overdue/pending status in-place.
 */
const reconcileInvoiceStatus = async (inv) => {
  if (!inv || !['PENDING', 'PARTIAL', 'OVERDUE'].includes(inv.status)) return;
  const past = isPastDueDate(inv.dueDate);
  if (!past && inv.status === 'OVERDUE') {
    inv.status = (inv.amountPaid > 0) ? 'PARTIAL' : 'PENDING';
    await Invoice.updateOne({ _id: inv._id }, { status: inv.status });
  } else if (past && inv.status !== 'OVERDUE' && inv.balanceDue > 0) {
    inv.status = 'OVERDUE';
    await Invoice.updateOne({ _id: inv._id }, { status: 'OVERDUE' });
  }
};

// GET /api/invoices - List with filters and optional pagination
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
        { invoiceNo: { $regex: search, $options: 'i' } },
        { poNumber: { $regex: search, $options: 'i' } },
        { quotationNo: { $regex: search, $options: 'i' } },
        { custCode: { $regex: search, $options: 'i' } }
      ];
    }

    if (page) {
      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 15));
      const skip = (pageNum - 1) * limitNum;
      const total = await Invoice.countDocuments(query);
      const invoices = await Invoice.find(query)
        .populate('company')
        .populate('quotation')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

      for (const inv of invoices) {
        await reconcileInvoiceStatus(inv);
      }

      return res.json({
        data: invoices,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      });
    }

    const invoices = await Invoice.find(query)
      .populate('company')
      .populate('quotation')
      .sort({ createdAt: -1 });

    for (const inv of invoices) {
      await reconcileInvoiceStatus(inv);
    }

    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/invoices/export - Export invoices as CSV
router.get('/export', async (req, res) => {
  try {
    const invoices = await Invoice.find({ isDeleted: { $ne: true } })
      .populate('company')
      .sort({ createdAt: -1 });

    const headers = ['Invoice No', 'Date', 'Customer Code', 'Company', 'PO Number', 'Quotation No', 'Total (USD)', 'Paid (USD)', 'Balance Due (USD)', 'Status'];
    const rows = invoices.map(inv => [
      inv.invoiceNo || '',
      inv.date || '',
      `"${(inv.custCode || '').replace(/"/g, '""')}"`,
      `"${(inv.company?.name || '').replace(/"/g, '""')}"`,
      `"${(inv.poNumber || '').replace(/"/g, '""')}"`,
      inv.quotationNo || '',
      (inv.grandTotal || 0).toFixed(2),
      (inv.amountPaid || 0).toFixed(2),
      (inv.balanceDue || 0).toFixed(2),
      inv.status || ''
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="invoices_${new Date().toISOString().slice(0, 10)}.csv"`);
    res.status(200).send(csvContent);
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

    await reconcileInvoiceStatus(invoice);

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
    const finalDueDate = dueDate || getOneMonthAhead(date);

    let initialStatus = status || 'PENDING';
    if (initialStatus !== 'DRAFT') {
      if (isPastDueDate(finalDueDate)) {
        initialStatus = 'OVERDUE';
      }
    }

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
      dueDate: finalDueDate,
      terms,
      status: initialStatus
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
    const finalDueDate = dueDate || getOneMonthAhead(todayStr);

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
      dueDate: finalDueDate,
      terms: quotation.terms,
      status: isPastDueDate(finalDueDate) ? 'OVERDUE' : 'PENDING'
    });

    await invoice.save();

    // Mark quotation CONVERTED
    quotation.status = 'CONVERTED';
    quotation.linkedInvoice = invoice._id;
    if (poNumber) quotation.poNumber = poNumber;
    await quotation.save();

    logActivity({
      req,
      action: 'CONVERT',
      entityType: 'INVOICE',
      entityId: invoice._id,
      entityIdentifier: invoice.invoiceNo,
      description: `Converted quotation ${quotation.quotationNo} to invoice ${invoice.invoiceNo}`
    });

    const populated = await Invoice.findById(invoice._id).populate('company').populate('quotation');
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/invoices/:id - Update invoice
router.put('/:id', async (req, res) => {
  try {
    const { date, invoiceNo, company, custCode, preparedBy, poNumber, quotationNo, items, terms, dueDate, status } = req.body;

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
    } else if (['PENDING', 'PARTIAL', 'OVERDUE'].includes(calculatedStatus)) {
      const effectiveDue = dueDate || existingInv.dueDate;
      if (effectiveDue && isPastDueDate(effectiveDue)) {
        calculatedStatus = 'OVERDUE';
      } else {
        calculatedStatus = (amountPaid > 0) ? 'PARTIAL' : 'PENDING';
      }
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
    const invoice = await Invoice.findById(req.params.id)
      .populate('company')
      .populate('quotation');
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    invoice.dueDate = dueDate;

    // Immediately re-evaluate overdue status if not PAID/DRAFT
    if (['PENDING', 'PARTIAL', 'OVERDUE'].includes(invoice.status)) {
      if (isPastDueDate(dueDate)) {
        invoice.status = 'OVERDUE';
      } else {
        invoice.status = (invoice.amountPaid && invoice.amountPaid > 0) ? 'PARTIAL' : 'PENDING';
      }
    }

    await invoice.save();
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

    logActivity({
      req,
      action: 'DELETE',
      entityType: 'INVOICE',
      entityId: invoice._id,
      entityIdentifier: invoice.invoiceNo,
      description: `Moved invoice ${invoice.invoiceNo} and its payments to Recycle Bin`
    });

    res.json({ message: 'Invoice and associated payments moved to Recycle Bin' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

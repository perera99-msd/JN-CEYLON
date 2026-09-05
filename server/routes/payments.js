const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');
const { logActivity } = require('../services/activityLogger');

// GET /api/payments - List all payment transactions with optional pagination
router.get('/', async (req, res) => {
  try {
    const { page, limit } = req.query;
    const query = { isDeleted: { $ne: true } };

    if (page) {
      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 15));
      const skip = (pageNum - 1) * limitNum;
      const total = await Payment.countDocuments(query);
      const payments = await Payment.find(query)
        .populate('invoice')
        .populate('company')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

      return res.json({
        data: payments,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      });
    }

    const payments = await Payment.find(query)
      .populate('invoice')
      .populate('company')
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/payments/export - Export payments as CSV
router.get('/export', async (req, res) => {
  try {
    const payments = await Payment.find({ isDeleted: { $ne: true } })
      .populate('invoice')
      .populate('company')
      .sort({ createdAt: -1 });

    const headers = ['Payment Date', 'Invoice No', 'Company', 'Amount (USD)', 'Method', 'Reference', 'Recorded By', 'Notes'];
    const rows = payments.map(pay => [
      pay.date || '',
      pay.invoice?.invoiceNo || '',
      `"${(pay.company?.name || '').replace(/"/g, '""')}"`,
      (pay.amount || 0).toFixed(2),
      pay.method || '',
      `"${(pay.reference || '').replace(/"/g, '""')}"`,
      `"${(pay.recordedBy || '').replace(/"/g, '""')}"`,
      `"${(pay.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="payments_${new Date().toISOString().slice(0, 10)}.csv"`);
    res.status(200).send(csvContent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/payments - Record a new payment
router.post('/', async (req, res) => {
  try {
    const { invoiceId, amount, method, reference, date, notes, recordedBy } = req.body;

    const invoice = await Invoice.findById(invoiceId).populate('company');
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    const payAmount = parseFloat(amount || 0);
    if (payAmount <= 0) {
      return res.status(400).json({ message: 'Payment amount must be greater than 0' });
    }

    if (payAmount > (invoice.balanceDue + 0.01)) {
      return res.status(400).json({ message: `Payment amount ($${payAmount}) exceeds balance due ($${invoice.balanceDue.toFixed(2)})!` });
    }

    const payment = new Payment({
      invoice: invoice._id,
      company: invoice.company._id,
      amount: payAmount,
      method: method || 'BANK_TRANSFER',
      reference: reference || '',
      date: date || new Date().toLocaleDateString('en-GB').replace(/\//g, '.'),
      notes: notes || '',
      recordedBy: recordedBy || 'Admin'
    });

    await payment.save();

    // Update Invoice balance & status
    const newAmountPaid = parseFloat(((invoice.amountPaid || 0) + payAmount).toFixed(2));
    const newBalanceDue = Math.max(0, parseFloat(((invoice.grandTotal || 0) - newAmountPaid).toFixed(2)));
    
    let newStatus = invoice.status;
    if (newBalanceDue === 0) {
      newStatus = 'PAID';
    } else if (newAmountPaid > 0) {
      newStatus = 'PARTIAL';
    }

    invoice.amountPaid = newAmountPaid;
    invoice.balanceDue = newBalanceDue;
    invoice.status = newStatus;
    await invoice.save();

    logActivity({
      req,
      action: 'PAYMENT',
      entityType: 'PAYMENT',
      entityId: payment._id,
      entityIdentifier: invoice.invoiceNo,
      description: `Recorded payment of $${payAmount.toFixed(2)} (${payment.method}) for invoice ${invoice.invoiceNo}`
    });

    const populatedPayment = await Payment.findById(payment._id).populate('invoice').populate('company');
    res.status(201).json(populatedPayment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/payments/:id - Revert payment
router.delete('/:id', async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    const invoice = await Invoice.findById(payment.invoice);
    if (invoice) {
      invoice.amountPaid = Math.max(0, parseFloat(((invoice.amountPaid || 0) - payment.amount).toFixed(2)));
      invoice.balanceDue = parseFloat(((invoice.grandTotal || 0) - invoice.amountPaid).toFixed(2));
      
      if (invoice.amountPaid === 0) {
        invoice.status = 'PENDING';
      } else if (invoice.balanceDue > 0) {
        invoice.status = 'PARTIAL';
      } else {
        invoice.status = 'PAID';
      }
      await invoice.save();
    }

    await Payment.findByIdAndUpdate(req.params.id, { isDeleted: true, deletedAt: new Date() });
    res.json({ message: 'Payment moved to Recycle Bin and invoice balance reverted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

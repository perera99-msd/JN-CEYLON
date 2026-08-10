const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');

// GET /api/payments - List all payment transactions
router.get('/', async (req, res) => {
  try {
    const payments = await Payment.find({ isDeleted: { $ne: true } })
      .populate('invoice')
      .populate('company')
      .sort({ createdAt: -1 });
    res.json(payments);
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

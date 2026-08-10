const express = require('express');
const router = express.Router();
const Quotation = require('../models/Quotation');
const Invoice = require('../models/Invoice');
const Company = require('../models/Company');
const Payment = require('../models/Payment');
const CustomStatement = require('../models/CustomStatement');

// GET /api/recycle-bin - Get all soft-deleted items across the system
router.get('/', async (req, res) => {
  try {
    const [quotations, invoices, companies, payments, statements] = await Promise.all([
      Quotation.find({ isDeleted: true }).populate('company'),
      Invoice.find({ isDeleted: true }).populate('company'),
      Company.find({ isDeleted: true }),
      Payment.find({ isDeleted: true }).populate('company').populate('invoice'),
      CustomStatement.find({ isDeleted: true }).populate('company')
    ]);

    const items = [
      ...quotations.map(q => ({
        _id: q._id,
        itemType: 'QUOTATION',
        identifier: q.quotationNo,
        title: `Quotation: ${q.quotationNo}`,
        subtitle: `Customer: ${q.company?.name || 'N/A'} | Total: $${(q.grandTotal || 0).toFixed(2)}`,
        deletedAt: q.deletedAt,
        originalDoc: q
      })),
      ...invoices.map(i => ({
        _id: i._id,
        itemType: 'INVOICE',
        identifier: i.invoiceNo,
        title: `Invoice: ${i.invoiceNo}`,
        subtitle: `Customer: ${i.company?.name || 'N/A'} | Total: $${(i.grandTotal || 0).toFixed(2)}`,
        deletedAt: i.deletedAt,
        originalDoc: i
      })),
      ...companies.map(c => ({
        _id: c._id,
        itemType: 'COMPANY',
        identifier: c.name,
        title: `Company: ${c.name}`,
        subtitle: `Code: ${c.custCode} | Email: ${c.contactEmail || 'N/A'}`,
        deletedAt: c.deletedAt,
        originalDoc: c
      })),
      ...payments.map(p => ({
        _id: p._id,
        itemType: 'PAYMENT',
        identifier: `PAY-$${p.amount}`,
        title: `Payment: $${(p.amount || 0).toFixed(2)}`,
        subtitle: `Invoice: ${p.invoice?.invoiceNo || 'N/A'} | Company: ${p.company?.name || 'N/A'}`,
        deletedAt: p.deletedAt,
        originalDoc: p
      })),
      ...statements.map(s => ({
        _id: s._id,
        itemType: 'STATEMENT',
        identifier: s.title || 'Custom Statement',
        title: `Custom Statement: ${s.title || 'Statement'}`,
        subtitle: `Company: ${s.company?.name || 'N/A'} | Date: ${s.statementDate}`,
        deletedAt: s.deletedAt,
        originalDoc: s
      }))
    ];

    // Sort newest deleted first
    items.sort((a, b) => new Date(b.deletedAt || 0) - new Date(a.deletedAt || 0));

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/recycle-bin/restore/:type/:id - Restore item
router.post('/restore/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    let restored = null;

    if (type.toLowerCase() === 'quotation') {
      restored = await Quotation.findByIdAndUpdate(
        id,
        { isDeleted: false, $unset: { deletedAt: "" } },
        { new: true }
      );
    } else if (type.toLowerCase() === 'invoice') {
      restored = await Invoice.findByIdAndUpdate(
        id,
        { isDeleted: false, $unset: { deletedAt: "" } },
        { new: true }
      );
      if (restored) {
        await Payment.updateMany(
          { invoice: id },
          { isDeleted: false, $unset: { deletedAt: "" } }
        );
      }
    } else if (type.toLowerCase() === 'company') {
      restored = await Company.findByIdAndUpdate(
        id,
        { isDeleted: false, $unset: { deletedAt: "" } },
        { new: true }
      );
    } else if (type.toLowerCase() === 'statement' || type.toLowerCase() === 'customstatement') {
      restored = await CustomStatement.findByIdAndUpdate(
        id,
        { isDeleted: false, $unset: { deletedAt: "" } },
        { new: true }
      );
    } else if (type.toLowerCase() === 'payment') {
      const payment = await Payment.findById(id);
      if (!payment) return res.status(404).json({ message: 'Payment not found' });

      payment.isDeleted = false;
      payment.deletedAt = null;
      await payment.save();

      // Recalculate invoice balance
      const invoice = await Invoice.findById(payment.invoice);
      if (invoice) {
        invoice.amountPaid = parseFloat(((invoice.amountPaid || 0) + payment.amount).toFixed(2));
        invoice.balanceDue = Math.max(0, parseFloat(((invoice.grandTotal || 0) - invoice.amountPaid).toFixed(2)));
        if (invoice.balanceDue === 0) invoice.status = 'PAID';
        else if (invoice.amountPaid > 0) invoice.status = 'PARTIAL';
        await invoice.save();
      }
      restored = payment;
    }

    if (!restored) return res.status(404).json({ message: 'Item not found' });
    res.json({ message: 'Item restored successfully', item: restored });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/recycle-bin/permanent/:type/:id - Permanently purge item
router.delete('/permanent/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    let deleted = null;

    if (type.toLowerCase() === 'quotation') {
      deleted = await Quotation.findByIdAndDelete(id);
    } else if (type.toLowerCase() === 'invoice') {
      deleted = await Invoice.findByIdAndDelete(id);
      if (deleted) {
        await Payment.deleteMany({ invoice: id });
      }
    } else if (type.toLowerCase() === 'company') {
      deleted = await Company.findByIdAndDelete(id);
    } else if (type.toLowerCase() === 'statement' || type.toLowerCase() === 'customstatement') {
      deleted = await CustomStatement.findByIdAndDelete(id);
    } else if (type.toLowerCase() === 'payment') {
      deleted = await Payment.findByIdAndDelete(id);
    }

    if (!deleted) return res.status(404).json({ message: 'Item not found' });
    res.json({ message: 'Item permanently deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

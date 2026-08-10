const express = require('express');
const router = express.Router();
const Quotation = require('../models/Quotation');
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');

// GET /api/dashboard/stats - Overview KPI metrics
router.get('/stats', async (req, res) => {
  try {
    const quotations = await Quotation.find({ isDeleted: { $ne: true } });
    const invoices = await Invoice.find({ isDeleted: { $ne: true } });
    const payments = await Payment.find({ isDeleted: { $ne: true } });

    const totalQuotationValue = quotations.reduce((sum, q) => sum + (q.grandTotal || 0), 0);
    const totalInvoiceValue = invoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);
    const totalPaidValue = invoices.reduce((sum, inv) => sum + (inv.amountPaid || 0), 0);
    const totalPendingValue = invoices.reduce((sum, inv) => sum + (inv.balanceDue || 0), 0);

    const pendingInvoicesCount = invoices.filter(inv => inv.status !== 'PAID').length;
    const paidInvoicesCount = invoices.filter(inv => inv.status === 'PAID').length;

    const recentQuotations = await Quotation.find({ isDeleted: { $ne: true } }).populate('company').sort({ createdAt: -1 }).limit(5);
    const recentInvoices = await Invoice.find({ isDeleted: { $ne: true } }).populate('company').sort({ createdAt: -1 }).limit(5);
    const recentPayments = await Payment.find({ isDeleted: { $ne: true } }).populate('company').populate('invoice').sort({ createdAt: -1 }).limit(5);

    res.json({
      metrics: {
        totalQuotationCount: quotations.length,
        totalQuotationValue: parseFloat(totalQuotationValue.toFixed(2)),
        totalInvoiceCount: invoices.length,
        totalInvoiceValue: parseFloat(totalInvoiceValue.toFixed(2)),
        totalPaidValue: parseFloat(totalPaidValue.toFixed(2)),
        totalPendingValue: parseFloat(totalPendingValue.toFixed(2)),
        pendingInvoicesCount,
        paidInvoicesCount
      },
      recentQuotations,
      recentInvoices,
      recentPayments
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const Quotation = require('../models/Quotation');
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');

// GET /api/dashboard/stats - Overview KPI metrics via high-efficiency MongoDB aggregation
router.get('/stats', async (req, res) => {
  try {
    const [quotationStats, invoiceStats, recentQuotations, recentInvoices, recentPayments] = await Promise.all([
      Quotation.aggregate([
        { $match: { isDeleted: { $ne: true } } },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            totalValue: { $sum: '$grandTotal' }
          }
        }
      ]),
      Invoice.aggregate([
        { $match: { isDeleted: { $ne: true } } },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            totalValue: { $sum: '$grandTotal' },
            totalPaid: { $sum: '$amountPaid' },
            totalPending: { $sum: '$balanceDue' },
            paidCount: { $sum: { $cond: [{ $eq: ['$status', 'PAID'] }, 1, 0] } },
            pendingCount: { $sum: { $cond: [{ $ne: ['$status', 'PAID'] }, 1, 0] } },
            overdueCount: { $sum: { $cond: [{ $eq: ['$status', 'OVERDUE'] }, 1, 0] } }
          }
        }
      ]),
      Quotation.find({ isDeleted: { $ne: true } })
        .populate('company')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Invoice.find({ isDeleted: { $ne: true } })
        .populate('company')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Payment.find({ isDeleted: { $ne: true } })
        .populate('company')
        .populate('invoice')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean()
    ]);

    const qStats = quotationStats[0] || { count: 0, totalValue: 0 };
    const invStats = invoiceStats[0] || {
      count: 0,
      totalValue: 0,
      totalPaid: 0,
      totalPending: 0,
      paidCount: 0,
      pendingCount: 0,
      overdueCount: 0
    };

    res.json({
      metrics: {
        totalQuotationCount: qStats.count,
        totalQuotationValue: parseFloat((qStats.totalValue || 0).toFixed(2)),
        totalInvoiceCount: invStats.count,
        totalInvoiceValue: parseFloat((invStats.totalValue || 0).toFixed(2)),
        totalPaidValue: parseFloat((invStats.totalPaid || 0).toFixed(2)),
        totalPendingValue: parseFloat((invStats.totalPending || 0).toFixed(2)),
        pendingInvoicesCount: invStats.pendingCount,
        paidInvoicesCount: invStats.paidCount,
        overdueInvoicesCount: invStats.overdueCount
      },
      recentQuotations,
      recentInvoices,
      recentPayments
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/dashboard/monthly-trend - Last 6 months invoiced vs received
router.get('/monthly-trend', async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const [invoiceTrend, paymentTrend] = await Promise.all([
      Invoice.aggregate([
        { $match: { isDeleted: { $ne: true }, createdAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            totalInvoiced: { $sum: '$grandTotal' },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      Payment.aggregate([
        { $match: { isDeleted: { $ne: true }, createdAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            totalReceived: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ])
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trend = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const key = `${monthNames[month - 1]} ${year}`;

      const inv = invoiceTrend.find(item => item._id.year === year && item._id.month === month);
      const pay = paymentTrend.find(item => item._id.year === year && item._id.month === month);

      trend.push({
        month: key,
        invoiced: inv ? parseFloat((inv.totalInvoiced || 0).toFixed(2)) : 0,
        received: pay ? parseFloat((pay.totalReceived || 0).toFixed(2)) : 0
      });
    }

    res.json(trend);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

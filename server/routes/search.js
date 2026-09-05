const express = require('express');
const router = express.Router();
const Quotation = require('../models/Quotation');
const Invoice = require('../models/Invoice');
const Company = require('../models/Company');
const Payment = require('../models/Payment');
const { protect } = require('../middleware/authMiddleware');

// GET /api/search?q=keyword - Global search across ERP entities
router.get('/', protect, async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q || q.length < 2) {
      return res.json({ quotations: [], invoices: [], companies: [], payments: [] });
    }

    const regex = new RegExp(q, 'i');

    const [quotations, invoices, companies, payments] = await Promise.all([
      Quotation.find({
        isDeleted: { $ne: true },
        $or: [
          { quotationNo: regex },
          { custCode: regex },
          { preparedBy: regex },
          { poNumber: regex }
        ]
      })
        .populate('company', 'name')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),

      Invoice.find({
        isDeleted: { $ne: true },
        $or: [
          { invoiceNo: regex },
          { poNumber: regex },
          { quotationNo: regex },
          { custCode: regex }
        ]
      })
        .populate('company', 'name')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),

      Company.find({
        isDeleted: { $ne: true },
        $or: [
          { name: regex },
          { custCode: regex },
          { contactEmail: regex },
          { contactPhone: regex }
        ]
      })
        .sort({ isDefault: -1, name: 1 })
        .limit(5)
        .lean(),

      Payment.find({
        isDeleted: { $ne: true },
        $or: [
          { reference: regex },
          { recordedBy: regex },
          { notes: regex }
        ]
      })
        .populate('invoice', 'invoiceNo')
        .populate('company', 'name')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean()
    ]);

    res.json({
      quotations,
      invoices,
      companies,
      payments
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

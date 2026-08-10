const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const Company = require('../models/Company');

// GET /api/statements/overview - Get statement summaries for all companies
router.get('/overview', async (req, res) => {
  try {
    const companies = await Company.find({ isDeleted: { $ne: true } });
    const summaries = await Promise.all(companies.map(async (company) => {
      const invoices = await Invoice.find({ company: company._id, isDeleted: { $ne: true } });
      
      const totalInvoices = invoices.length;
      const pendingInvoices = invoices.filter(inv => inv.status !== 'PAID');
      const totalBalance = invoices.reduce((sum, inv) => sum + (inv.balanceDue || 0), 0);
      const pendingBalance = pendingInvoices.reduce((sum, inv) => sum + (inv.balanceDue || 0), 0);

      return {
        company,
        totalInvoices,
        pendingCount: pendingInvoices.length,
        totalBalance: parseFloat(totalBalance.toFixed(2)),
        pendingBalance: parseFloat(pendingBalance.toFixed(2))
      };
    }));

    res.json(summaries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const parseInvoiceDate = (dateStr) => {
  if (!dateStr) return new Date(0);
  if (dateStr.includes('.')) {
    const parts = dateStr.split('.');
    if (parts.length === 3) {
      return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
    }
  }
  return new Date(dateStr);
};

// GET /api/statements/company/:companyId - Get detailed statement items for a specific company
router.get('/company/:companyId', async (req, res) => {
  try {
    const company = await Company.findById(req.params.companyId);
    if (!company) return res.status(404).json({ message: 'Company not found' });

    const { startDate, endDate, status } = req.query;

    let invoices = await Invoice.find({ company: req.params.companyId, isDeleted: { $ne: true } })
      .sort({ createdAt: 1 });

    // Filter by date range if provided
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      invoices = invoices.filter(inv => parseInvoiceDate(inv.date) >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      invoices = invoices.filter(inv => parseInvoiceDate(inv.date) <= end);
    }

    // Filter by status if provided
    if (status && status !== 'ALL') {
      if (status === 'PENDING') {
        invoices = invoices.filter(inv => inv.status !== 'PAID');
      } else if (status === 'PAID') {
        invoices = invoices.filter(inv => inv.status === 'PAID');
      }
    }

    const statementItems = invoices.map(inv => ({
      _id: inv._id,
      date: inv.date,
      invoice: inv.invoiceNo,
      desc: inv.items.map(i => i.name).filter(Boolean).join(', ') || 'Spare parts supply',
      po: inv.poNumber,
      status: inv.status === 'PAID' ? 'Paid' : 'Pending',
      due: inv.dueDate || inv.date,
      total: parseFloat((inv.grandTotal || 0).toFixed(2)),
      balanceDue: parseFloat((inv.balanceDue || 0).toFixed(2)),
      rawStatus: inv.status
    }));

    const pendingTotalBalance = statementItems
      .filter(item => item.rawStatus !== 'PAID')
      .reduce((sum, item) => sum + item.total, 0);

    const accountTotalBalance = statementItems
      .reduce((sum, item) => sum + item.total, 0);

    res.json({
      company,
      statementDate: new Date().toLocaleDateString('en-GB').replace(/\//g, '.'),
      pendingTotalBalance: parseFloat(pendingTotalBalance.toFixed(2)),
      accountTotalBalance: parseFloat(accountTotalBalance.toFixed(2)),
      totalBalance: parseFloat(accountTotalBalance.toFixed(2)),
      items: statementItems
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

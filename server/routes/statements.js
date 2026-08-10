const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const Company = require('../models/Company');

// GET /api/statements/overview - Get statement summaries for all companies
router.get('/overview', async (req, res) => {
  try {
    const companies = await Company.find();
    const summaries = await Promise.all(companies.map(async (company) => {
      const invoices = await Invoice.find({ company: company._id });
      
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

// GET /api/statements/company/:companyId - Get detailed statement items for a specific company
router.get('/company/:companyId', async (req, res) => {
  try {
    const company = await Company.findById(req.params.companyId);
    if (!company) return res.status(404).json({ message: 'Company not found' });

    const invoices = await Invoice.find({ company: req.params.companyId })
      .sort({ createdAt: 1 });

    const statementItems = invoices.map(inv => ({
      _id: inv._id,
      date: inv.date,
      invoice: inv.invoiceNo,
      desc: inv.items.map(i => i.name).filter(Boolean).join(', ') || 'Spare parts supply',
      po: inv.poNumber,
      status: inv.status === 'PAID' ? 'Paid' : 'Pending',
      due: inv.dueDate || inv.date,
      total: parseFloat((inv.grandTotal || 0).toFixed(2)),
      balanceDue: parseFloat((inv.balanceDue || 0).toFixed(2))
    }));

    const totalBalance = statementItems.reduce((sum, item) => sum + item.balanceDue, 0);

    res.json({
      company,
      statementDate: new Date().toLocaleDateString('en-GB').replace(/\//g, '.'),
      totalBalance: parseFloat(totalBalance.toFixed(2)),
      items: statementItems
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

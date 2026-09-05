const mongoose = require('mongoose');

/**
 * Ensure optimal MongoDB indexes exist for query performance.
 * Called once on server startup after database connection.
 * These indexes are additive and won't affect existing data or queries.
 */
async function ensureIndexes() {
  try {
    const Quotation = require('../models/Quotation');
    const Invoice = require('../models/Invoice');
    const Payment = require('../models/Payment');
    const Company = require('../models/Company');
    const CustomStatement = require('../models/CustomStatement');

    // Quotation indexes
    await Quotation.collection.createIndex(
      { isDeleted: 1, status: 1, createdAt: -1 },
      { background: true, name: 'idx_quotation_list' }
    );
    await Quotation.collection.createIndex(
      { quotationNo: 1 },
      { background: true, name: 'idx_quotation_no', unique: true }
    );

    // Invoice indexes
    await Invoice.collection.createIndex(
      { isDeleted: 1, status: 1, company: 1, createdAt: -1 },
      { background: true, name: 'idx_invoice_list' }
    );
    await Invoice.collection.createIndex(
      { invoiceNo: 1 },
      { background: true, name: 'idx_invoice_no', unique: true }
    );
    await Invoice.collection.createIndex(
      { isDeleted: 1, company: 1, status: 1 },
      { background: true, name: 'idx_invoice_statement' }
    );

    // Payment indexes
    await Payment.collection.createIndex(
      { isDeleted: 1, invoice: 1, createdAt: -1 },
      { background: true, name: 'idx_payment_list' }
    );

    // Company indexes
    await Company.collection.createIndex(
      { isDeleted: 1, name: 1 },
      { background: true, name: 'idx_company_list' }
    );

    // CustomStatement indexes
    await CustomStatement.collection.createIndex(
      { isDeleted: 1, company: 1, createdAt: -1 },
      { background: true, name: 'idx_custom_statement_list' }
    );

    console.log('[INDEX] MongoDB indexes verified successfully.');
  } catch (error) {
    // Don't crash on duplicate index errors — they just mean the index already exists
    if (error.code === 85 || error.code === 86) {
      console.log('[INDEX] Indexes already exist, skipping.');
    } else {
      console.warn('[INDEX] Warning: Could not create indexes:', error.message);
    }
  }
}

module.exports = ensureIndexes;

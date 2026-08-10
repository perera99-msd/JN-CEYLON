const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  no: { type: String, default: '' },
  name: { type: String, default: '' },
  image: { type: String, default: null }, // Base64 data URL
  qty: { type: Number, default: 1 },
  desc: { type: String, default: '' },
  price: { type: Number, default: 0.00 },
  total: { type: Number, default: 0.00 }
});

const QuotationSchema = new mongoose.Schema({
  quotationNo: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  date: {
    type: String,
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  custCode: {
    type: String,
    default: '- Halav 05'
  },
  preparedBy: {
    type: String,
    default: 'JN Ceylon'
  },
  status: {
    type: String,
    enum: ['DRAFT', 'SENT', 'PO_RECEIVED', 'CONVERTED', 'REJECTED'],
    default: 'DRAFT'
  },
  poNumber: {
    type: String,
    default: ''
  },
  linkedInvoice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
    default: null
  },
  items: [ItemSchema],
  subtotal: { type: Number, default: 0.00 },
  tax: { type: Number, default: 0.00 },
  discount: { type: Number, default: 0.00 },
  iva: { type: Number, default: 0.00 },
  grandTotal: { type: Number, default: 0.00 },
  terms: {
    price: { type: String, default: 'All the above prices are mentioned in USD.' },
    delivery: { type: String, default: '3 to 4 weeks from order confirmation.' },
    term: { type: String, default: 'Payment upon order confirmation.' },
    validity: { type: String, default: '30 Days.' }
  },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

QuotationSchema.index({ deletedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('Quotation', QuotationSchema);

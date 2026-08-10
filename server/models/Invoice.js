const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  no: { type: String, default: '' },
  name: { type: String, default: '' },
  image: { type: String, default: null },
  qty: { type: Number, default: 1 },
  desc: { type: String, default: '' },
  price: { type: Number, default: 0.00 },
  total: { type: Number, default: 0.00 }
});

const InvoiceSchema = new mongoose.Schema({
  invoiceNo: {
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
  poNumber: {
    type: String,
    required: true,
    trim: true
  },
  quotationNo: {
    type: String,
    default: ''
  },
  quotation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quotation',
    default: null
  },
  status: {
    type: String,
    enum: ['DRAFT', 'SENT', 'PENDING', 'PARTIAL', 'PAID', 'OVERDUE'],
    default: 'PENDING'
  },
  dueDate: {
    type: String,
    default: ''
  },
  items: [ItemSchema],
  subtotal: { type: Number, default: 0.00 },
  tax: { type: Number, default: 0.00 },
  discount: { type: Number, default: 0.00 },
  iva: { type: Number, default: 0.00 },
  grandTotal: { type: Number, default: 0.00 },
  amountPaid: { type: Number, default: 0.00 },
  balanceDue: { type: Number, default: 0.00 },
  terms: {
    price: { type: String, default: 'All the above prices are mentioned in USD.' },
    delivery: { type: String, default: '3 to 4 weeks from order confirmation.' },
    term: { type: String, default: 'Payment upon order confirmation.' },
    validity: { type: String, default: '30 Days.' }
  },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

InvoiceSchema.index({ deletedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('Invoice', InvoiceSchema);

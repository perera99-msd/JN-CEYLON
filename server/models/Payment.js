const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  invoice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0.01
  },
  method: {
    type: String,
    enum: ['BANK_TRANSFER', 'CHEQUE', 'CASH', 'OTHER'],
    default: 'BANK_TRANSFER'
  },
  reference: {
    type: String,
    default: ''
  },
  date: {
    type: String,
    required: true
  },
  notes: {
    type: String,
    default: ''
  },
  recordedBy: {
    type: String,
    default: 'Admin'
  },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

PaymentSchema.index({ deletedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('Payment', PaymentSchema);

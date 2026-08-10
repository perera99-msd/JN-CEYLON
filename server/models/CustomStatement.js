const mongoose = require('mongoose');

const StatementItemSchema = new mongoose.Schema({
  date: { type: String, default: '' },
  invoice: { type: String, default: '' },
  desc: { type: String, default: '' },
  po: { type: String, default: '' },
  status: { type: String, default: 'Pending' },
  due: { type: String, default: '' },
  total: { type: Number, default: 0.00 }
});

const CustomStatementSchema = new mongoose.Schema({
  title: {
    type: String,
    default: 'Statement of Account'
  },
  statementDate: {
    type: String,
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  items: [StatementItemSchema],
  pendingTotalBalance: {
    type: Number,
    default: 0.00
  },
  accountTotalBalance: {
    type: Number,
    default: 0.00
  },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

CustomStatementSchema.index({ deletedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('CustomStatement', CustomStatementSchema);

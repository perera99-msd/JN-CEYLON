const mongoose = require('mongoose');

const SequenceSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    unique: true, // QUOTATION or INVOICE
    enum: ['QUOTATION', 'INVOICE']
  },
  prefixNumber: {
    type: Number
  },
  code: {
    type: String
  },
  currentNumber: {
    type: Number,
    required: true,
    default: 100
  },
  prefix: {
    type: String // kept temporarily to assist with migration
  }
}, { timestamps: true });

module.exports = mongoose.model('Sequence', SequenceSchema);

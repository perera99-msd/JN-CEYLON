const mongoose = require('mongoose');

const SequenceSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    unique: true, // QUOTATION or INVOICE
    enum: ['QUOTATION', 'INVOICE']
  },
  prefix: {
    type: String,
    required: true
  },
  currentNumber: {
    type: Number,
    required: true,
    default: 100
  }
}, { timestamps: true });

module.exports = mongoose.model('Sequence', SequenceSchema);

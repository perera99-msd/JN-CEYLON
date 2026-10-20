const mongoose = require('mongoose');

const DeliveryItemSchema = new mongoose.Schema({
  no: { type: String, default: '' },
  description: { type: String, required: true, trim: true },
  quantity: { type: String, default: '' },
  remarks: { type: String, default: '' }
});

const DeliveryNoteSchema = new mongoose.Schema({
  deliveryNoteNo: { type: String, required: true, unique: true, trim: true },
  deliveryDate: { type: String, required: true, trim: true },
  invoiceNo: { type: String, default: '', trim: true },
  invoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', default: null },
  poNumber: { type: String, default: '', trim: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  items: { type: [DeliveryItemSchema], default: [] },
  confirmationText: {
    type: String,
    default: 'The above goods have been handed over for delivery to the consignee / authorized representative.'
  },
  releasedByName: { type: String, default: 'M S D Perera', trim: true },
  releasedByTitle: { type: String, default: 'Dispatch In-Charge', trim: true },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

DeliveryNoteSchema.index({ deletedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('DeliveryNote', DeliveryNoteSchema);

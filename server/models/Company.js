const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  address: {
    line1: { type: String, default: 'AlifuAlifu Atoll, Halaveli' },
    line2: { type: String, default: '09130' },
    country: { type: String, default: 'Republic of Maldives' }
  },
  custCode: {
    type: String,
    required: true,
    default: 'Halav 05'
  },
  contactEmail: { type: String, default: '' },
  contactPhone: { type: String, default: '' },
  isDefault: {
    type: Boolean,
    default: false
  },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

CompanySchema.index({ deletedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('Company', CompanySchema);

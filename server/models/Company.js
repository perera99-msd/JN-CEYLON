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
  }
}, { timestamps: true });

module.exports = mongoose.model('Company', CompanySchema);

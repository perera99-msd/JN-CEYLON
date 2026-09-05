const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  userName: {
    type: String,
    default: 'System'
  },
  action: {
    type: String,
    enum: ['CREATE', 'UPDATE', 'DELETE', 'RESTORE', 'LOGIN', 'PAYMENT', 'DUPLICATE', 'STATUS_CHANGE'],
    required: true
  },
  entityType: {
    type: String,
    enum: ['QUOTATION', 'INVOICE', 'PAYMENT', 'COMPANY', 'USER', 'SYSTEM'],
    required: true
  },
  entityId: {
    type: String,
    default: ''
  },
  entityIdentifier: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    required: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  ipAddress: {
    type: String,
    default: ''
  }
}, { timestamps: true });

// Auto-expire logs after 90 days to conserve MongoDB storage on free tier
ActivityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });
ActivityLogSchema.index({ entityType: 1, createdAt: -1 });
ActivityLogSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);

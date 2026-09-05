const ActivityLog = require('../models/ActivityLog');

/**
 * Non-blocking activity logging utility.
 * Records actions taken across the system for security and audit trail.
 */
const logActivity = ({
  req = null,
  userId = null,
  userName = 'System',
  action,
  entityType,
  entityId = '',
  entityIdentifier = '',
  description,
  details = null
}) => {
  // Run asynchronously in the background so it never blocks or delays HTTP responses
  setImmediate(async () => {
    try {
      let resolvedUserId = userId;
      let resolvedUserName = userName;
      let ip = '';

      if (req) {
        if (req.user) {
          resolvedUserId = req.user._id || req.user.id;
          resolvedUserName = req.user.fullName || req.user.username || resolvedUserName;
        } else if (req.session && req.session.userId) {
          resolvedUserId = req.session.userId;
        }
        ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
      }

      await ActivityLog.create({
        user: resolvedUserId || null,
        userName: resolvedUserName,
        action,
        entityType,
        entityId: entityId ? String(entityId) : '',
        entityIdentifier: entityIdentifier || '',
        description,
        details,
        ipAddress: ip
      });
    } catch (err) {
      console.warn('[ActivityLogger] Failed to log activity:', err.message);
    }
  });
};

module.exports = { logActivity };

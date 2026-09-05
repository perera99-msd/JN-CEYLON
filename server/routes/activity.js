const express = require('express');
const router = express.Router();
const ActivityLog = require('../models/ActivityLog');
const { protect } = require('../middleware/authMiddleware');

// GET /api/activity - List recent activities with pagination and filtering
router.get('/', protect, async (req, res) => {
  try {
    const { action, entityType, search, page, limit } = req.query;
    const query = {};

    if (action && action !== 'ALL') {
      query.action = action;
    }
    if (entityType && entityType !== 'ALL') {
      query.entityType = entityType;
    }
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { entityIdentifier: { $regex: search, $options: 'i' } },
        { userName: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [total, logs] = await Promise.all([
      ActivityLog.countDocuments(query),
      ActivityLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean()
    ]);

    res.json({
      data: logs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

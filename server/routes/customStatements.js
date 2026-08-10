const express = require('express');
const router = express.Router();
const CustomStatement = require('../models/CustomStatement');

// GET /api/custom-statements - List custom statements
router.get('/', async (req, res) => {
  try {
    const statements = await CustomStatement.find({ isDeleted: { $ne: true } })
      .populate('company')
      .sort({ createdAt: -1 });
    res.json(statements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/custom-statements/:id - Single custom statement
router.get('/:id', async (req, res) => {
  try {
    const statement = await CustomStatement.findById(req.params.id).populate('company');
    if (!statement) return res.status(404).json({ message: 'Custom statement not found' });
    res.json(statement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/custom-statements - Create custom statement
router.post('/', async (req, res) => {
  try {
    const { title, statementDate, company, items, pendingTotalBalance, accountTotalBalance } = req.body;

    const calculatedItems = (items || []).map(item => ({
      ...item,
      total: parseFloat(item.total || 0)
    }));

    const calculatedPending = pendingTotalBalance !== undefined && pendingTotalBalance !== ''
      ? parseFloat(pendingTotalBalance)
      : calculatedItems.reduce((sum, item) => sum + item.total, 0);

    const calculatedAccount = accountTotalBalance !== undefined && accountTotalBalance !== ''
      ? parseFloat(accountTotalBalance)
      : calculatedPending;

    const statement = new CustomStatement({
      title: title || 'Statement of Account',
      statementDate: statementDate || new Date().toLocaleDateString('en-GB').replace(/\//g, '.'),
      company,
      items: calculatedItems,
      pendingTotalBalance: parseFloat(calculatedPending.toFixed(2)),
      accountTotalBalance: parseFloat(calculatedAccount.toFixed(2))
    });

    await statement.save();
    const populated = await CustomStatement.findById(statement._id).populate('company');
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/custom-statements/:id - Edit custom statement
router.put('/:id', async (req, res) => {
  try {
    const { title, statementDate, company, items, pendingTotalBalance, accountTotalBalance } = req.body;

    const calculatedItems = (items || []).map(item => ({
      ...item,
      total: parseFloat(item.total || 0)
    }));

    const calculatedPending = pendingTotalBalance !== undefined && pendingTotalBalance !== ''
      ? parseFloat(pendingTotalBalance)
      : calculatedItems.reduce((sum, item) => sum + item.total, 0);

    const calculatedAccount = accountTotalBalance !== undefined && accountTotalBalance !== ''
      ? parseFloat(accountTotalBalance)
      : calculatedPending;

    const updateData = {
      title,
      statementDate,
      company,
      items: calculatedItems,
      pendingTotalBalance: parseFloat(calculatedPending.toFixed(2)),
      accountTotalBalance: parseFloat(calculatedAccount.toFixed(2))
    };

    const statement = await CustomStatement.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('company');

    if (!statement) return res.status(404).json({ message: 'Custom statement not found' });
    res.json(statement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/custom-statements/:id - Soft delete
router.delete('/:id', async (req, res) => {
  try {
    const statement = await CustomStatement.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );
    if (!statement) return res.status(404).json({ message: 'Custom statement not found' });
    res.json({ message: 'Custom statement moved to Recycle Bin' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

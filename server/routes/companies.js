const express = require('express');
const router = express.Router();
const Company = require('../models/Company');

// GET /api/companies
router.get('/', async (req, res) => {
  try {
    const companies = await Company.find().sort({ isDefault: -1, name: 1 });
    res.json(companies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/companies/:id
router.get('/:id', async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ message: 'Company not found' });
    res.json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/companies
router.post('/', async (req, res) => {
  try {
    const { name, address, custCode, contactEmail, contactPhone, isDefault } = req.body;
    
    if (isDefault) {
      await Company.updateMany({}, { isDefault: false });
    }

    const company = new Company({
      name,
      address,
      custCode,
      contactEmail,
      contactPhone,
      isDefault: isDefault || false
    });

    await company.save();
    res.status(201).json(company);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/companies/:id
router.put('/:id', async (req, res) => {
  try {
    const { name, address, custCode, contactEmail, contactPhone, isDefault } = req.body;

    if (isDefault) {
      await Company.updateMany({ _id: { $ne: req.params.id } }, { isDefault: false });
    }

    const company = await Company.findByIdAndUpdate(
      req.params.id,
      { name, address, custCode, contactEmail, contactPhone, isDefault },
      { new: true, runValidators: true }
    );

    if (!company) return res.status(404).json({ message: 'Company not found' });
    res.json(company);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/companies/:id
router.delete('/:id', async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);
    if (!company) return res.status(404).json({ message: 'Company not found' });
    res.json({ message: 'Company removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

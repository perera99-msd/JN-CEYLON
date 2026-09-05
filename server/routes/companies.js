const express = require('express');
const router = express.Router();
const Company = require('../models/Company');

// GET /api/companies - List companies with optional pagination
router.get('/', async (req, res) => {
  try {
    const { page, limit } = req.query;
    const query = { isDeleted: { $ne: true } };

    if (page) {
      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 15));
      const skip = (pageNum - 1) * limitNum;
      const total = await Company.countDocuments(query);
      const companies = await Company.find(query)
        .sort({ isDefault: -1, name: 1 })
        .skip(skip)
        .limit(limitNum);

      return res.json({
        data: companies,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      });
    }

    const companies = await Company.find(query).sort({ isDefault: -1, name: 1 });
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
    const company = await Company.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );
    if (!company) return res.status(404).json({ message: 'Company not found' });
    res.json({ message: 'Company moved to Recycle Bin' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

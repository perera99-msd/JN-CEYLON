const express = require('express');
const router = express.Router();
const DeliveryNote = require('../models/DeliveryNote');
const { previewNextSequence, consumeNextSequence } = require('../services/sequenceService');

router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    const query = { isDeleted: { $ne: true } };
    if (search) {
      query.$or = [
        { deliveryNoteNo: { $regex: search, $options: 'i' } },
        { invoiceNo: { $regex: search, $options: 'i' } },
        { poNumber: { $regex: search, $options: 'i' } }
      ];
    }
    const notes = await DeliveryNote.find(query).populate('company').populate('invoice').sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/next-number', async (req, res) => {
  try {
    res.json({ nextNo: await previewNextSequence('DELIVERY_NOTE') });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const note = await DeliveryNote.findOne({ _id: req.params.id, isDeleted: { $ne: true } }).populate('company').populate('invoice');
    if (!note) return res.status(404).json({ message: 'Delivery note not found' });
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    let { deliveryNoteNo, deliveryDate, invoiceNo, invoice, poNumber, company, items, confirmationText, releasedByName, releasedByTitle } = req.body;
    const expectedNextNo = await previewNextSequence('DELIVERY_NOTE');
    if (!deliveryNoteNo) deliveryNoteNo = await consumeNextSequence('DELIVERY_NOTE');
    else if (deliveryNoteNo === expectedNextNo) await consumeNextSequence('DELIVERY_NOTE');

    const existing = await DeliveryNote.findOne({ deliveryNoteNo: deliveryNoteNo.trim() });
    if (existing) return res.status(400).json({ message: `Delivery note number "${deliveryNoteNo}" already exists.` });
    if (!deliveryDate || !company) return res.status(400).json({ message: 'Delivery date and customer company are required.' });

    const note = await DeliveryNote.create({
      deliveryNoteNo: deliveryNoteNo.trim(),
      deliveryDate,
      invoiceNo,
      invoice: invoice || null,
      poNumber,
      company,
      items: (items || []).map((item, index) => ({
        no: item.no || String(index + 1),
        description: item.description || '',
        quantity: item.quantity || '',
        remarks: item.remarks || ''
      })),
      confirmationText,
      releasedByName,
      releasedByTitle
    });
    res.status(201).json(await DeliveryNote.findById(note._id).populate('company').populate('invoice'));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { deliveryNoteNo, deliveryDate, invoiceNo, invoice, poNumber, company, items, confirmationText, releasedByName, releasedByTitle } = req.body;
    const note = await DeliveryNote.findOneAndUpdate(
      { _id: req.params.id, isDeleted: { $ne: true } },
      { deliveryNoteNo, deliveryDate, invoiceNo, invoice: invoice || null, poNumber, company, items, confirmationText, releasedByName, releasedByTitle },
      { new: true, runValidators: true }
    ).populate('company').populate('invoice');
    if (!note) return res.status(404).json({ message: 'Delivery note not found' });
    res.json(note);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const note = await DeliveryNote.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );
    if (!note) return res.status(404).json({ message: 'Delivery note not found' });
    res.json({ message: 'Delivery note moved to Recycle Bin' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

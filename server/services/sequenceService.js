const Sequence = require('../models/Sequence');

async function getNextSequence(type) {
  const defaultPrefix = type === 'QUOTATION' ? '11QUOTE' : 'INV-';
  const defaultStart = type === 'QUOTATION' ? 323 : 351;

  const sequence = await Sequence.findOneAndUpdate(
    { type },
    { $inc: { currentNumber: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  // If newly created, set default prefix and starting number if not set
  if (!sequence.prefix) {
    sequence.prefix = defaultPrefix;
    sequence.currentNumber = defaultStart;
    await sequence.save();
  }

  const numStr = sequence.currentNumber.toString();
  return `${sequence.prefix}${numStr}`;
}

module.exports = { getNextSequence };

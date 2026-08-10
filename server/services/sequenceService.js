const Sequence = require('../models/Sequence');

async function initializeSequence(type) {
  let sequence = await Sequence.findOne({ type });
  if (!sequence || sequence.prefix) {
    const defaultData = type === 'QUOTATION' 
      ? { prefixNumber: 158, code: 'RC', currentNumber: 576 }
      : { prefixNumber: 111, code: 'NVO', currentNumber: 351 };

    sequence = await Sequence.findOneAndUpdate(
      { type },
      { 
        $set: { 
          prefixNumber: defaultData.prefixNumber, 
          code: defaultData.code,
          currentNumber: defaultData.currentNumber
        },
        $unset: { prefix: "" }
      },
      { new: true, upsert: true }
    );
  }
  return sequence;
}

async function previewNextSequence(type) {
  const sequence = await initializeSequence(type);
  
  let nextNumber = sequence.currentNumber + 2;
  let nextPrefixNumber = sequence.prefixNumber;

  if (nextNumber >= 1000) {
    nextPrefixNumber += 1;
    nextNumber = nextNumber % 1000;
  }

  const numStr = nextNumber.toString().padStart(3, '0');
  return `${nextPrefixNumber}${sequence.code}${numStr}`;
}

async function consumeNextSequence(type) {
  const sequence = await initializeSequence(type);
  
  let nextNumber = sequence.currentNumber + 2;
  let nextPrefixNumber = sequence.prefixNumber;

  if (nextNumber >= 1000) {
    nextPrefixNumber += 1;
    nextNumber = nextNumber % 1000;
  }

  const updatedSequence = await Sequence.findOneAndUpdate(
    { type },
    {
      $set: {
        currentNumber: nextNumber,
        prefixNumber: nextPrefixNumber
      }
    },
    { new: true }
  );

  const numStr = updatedSequence.currentNumber.toString().padStart(3, '0');
  return `${updatedSequence.prefixNumber}${updatedSequence.code}${numStr}`;
}

module.exports = { previewNextSequence, consumeNextSequence };


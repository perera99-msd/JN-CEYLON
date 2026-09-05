const assert = require('node:assert/strict');
const test = require('node:test');

// Test the date arithmetic helper function
const getOneMonthAhead = (baseDateStr) => {
  let dateObj = new Date();
  if (baseDateStr && typeof baseDateStr === 'string' && baseDateStr.includes('.')) {
    const parts = baseDateStr.split('.');
    if (parts.length === 3) {
      const d = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const y = parseInt(parts[2], 10);
      const parsed = new Date(y, m, d);
      if (!isNaN(parsed.getTime())) {
        dateObj = parsed;
      }
    }
  }
  const due = new Date(dateObj);
  due.setMonth(due.getMonth() + 1);
  return due.toLocaleDateString('en-GB').replace(/\//g, '.');
};

test('getOneMonthAhead computes exactly 1 month ahead in DD.MM.YYYY format', () => {
  // 15.01.2026 -> 15.02.2026
  const due1 = getOneMonthAhead('15.01.2026');
  assert.equal(due1, '15.02.2026');

  // 05.09.2026 -> 05.10.2026
  const due2 = getOneMonthAhead('05.09.2026');
  assert.equal(due2, '05.10.2026');

  // Year transition: 15.12.2026 -> 15.01.2027
  const due3 = getOneMonthAhead('15.12.2026');
  assert.equal(due3, '15.01.2027');
});

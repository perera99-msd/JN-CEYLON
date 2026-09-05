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

const { parseDateString, isPastDueDate } = require('../server/services/overdueChecker');

test('parseDateString accurately parses multiple formats (DD.MM.YYYY, DD/MM/YYYY, YYYY-MM-DD)', () => {
  const d1 = parseDateString('26.09.2026');
  assert.equal(d1.getDate(), 26);
  assert.equal(d1.getMonth(), 8); // 0-indexed, 8 = September
  assert.equal(d1.getFullYear(), 2026);

  const d2 = parseDateString('26/09/2026');
  assert.equal(d2.getDate(), 26);
  assert.equal(d2.getMonth(), 8);
  assert.equal(d2.getFullYear(), 2026);

  const d3 = parseDateString('2026-09-26');
  assert.equal(d3.getFullYear(), 2026);
});

test('isPastDueDate returns false for future dates like 26.09.2026 and true for past dates', () => {
  // A date far in the future
  assert.equal(isPastDueDate('26.09.2099'), false);

  // A date far in the past
  assert.equal(isPastDueDate('01.01.2020'), true);
  assert.equal(isPastDueDate('26.08.2020'), true);

  // Today's date with end-of-day should NOT be past due today
  const todayStr = new Date().toLocaleDateString('en-GB').replace(/\//g, '.');
  assert.equal(isPastDueDate(todayStr), false);
});


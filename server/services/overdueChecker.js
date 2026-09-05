const Invoice = require('../models/Invoice');

/**
 * Parses date string in common formats (DD.MM.YYYY, DD/MM/YYYY, YYYY-MM-DD)
 */
const parseDateString = (str) => {
  if (!str || typeof str !== 'string') return null;
  const trimmed = str.trim();
  if (trimmed.includes('.')) {
    const parts = trimmed.split('.');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return isNaN(d.getTime()) ? null : d;
    }
  }
  if (trimmed.includes('/')) {
    const parts = trimmed.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return isNaN(d.getTime()) ? null : d;
    }
  }
  const parsed = new Date(trimmed);
  return isNaN(parsed.getTime()) ? null : parsed;
};

/**
 * Checks if a given due date string has already passed.
 * The due date includes the full calendar day until 23:59:59.999.
 */
const isPastDueDate = (dueDateStr) => {
  if (!dueDateStr) return false;
  const due = parseDateString(dueDateStr);
  if (!due) return false;
  // End of day - invoice is not overdue until the due day has completely passed
  due.setHours(23, 59, 59, 999);
  return due.getTime() < Date.now();
};

/**
 * Check, flag, and reconcile overdue invoices.
 * - Invoices with past due dates are marked as OVERDUE.
 * - Invoices previously marked OVERDUE whose due dates are in the future (e.g. edited)
 *   are automatically reverted back to PENDING or PARTIAL.
 */
const checkOverdueInvoices = async () => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const candidates = await Invoice.find({
      isDeleted: { $ne: true },
      status: { $in: ['PENDING', 'PARTIAL', 'OVERDUE'] }
    });

    let flaggedCount = 0;
    let revertedCount = 0;

    for (const inv of candidates) {
      // If invoice is fully paid, ensure status is PAID
      if (inv.balanceDue <= 0 && inv.grandTotal > 0) {
        if (inv.status !== 'PAID') {
          inv.status = 'PAID';
          await inv.save();
        }
        continue;
      }

      let isOverdue = false;

      if (inv.dueDate) {
        isOverdue = isPastDueDate(inv.dueDate);
      } else if (inv.date) {
        const invDate = parseDateString(inv.date);
        if (invDate) {
          const defaultDue = new Date(invDate);
          defaultDue.setMonth(defaultDue.getMonth() + 1);
          defaultDue.setHours(23, 59, 59, 999);
          if (defaultDue.getTime() < Date.now()) {
            isOverdue = true;
          }
        }
      } else if (inv.createdAt && inv.createdAt < thirtyDaysAgo) {
        isOverdue = true;
      }

      if (isOverdue && inv.status !== 'OVERDUE') {
        inv.status = 'OVERDUE';
        await inv.save();
        flaggedCount++;
      } else if (!isOverdue && inv.status === 'OVERDUE') {
        // Due date is in the future or today! Revert from OVERDUE back to PENDING or PARTIAL
        inv.status = (inv.amountPaid && inv.amountPaid > 0) ? 'PARTIAL' : 'PENDING';
        await inv.save();
        revertedCount++;
      }
    }

    if (flaggedCount > 0 || revertedCount > 0) {
      console.log(`[OverdueChecker] Reconciled: ${flaggedCount} flagged as overdue, ${revertedCount} reverted to pending/partial.`);
    }
  } catch (err) {
    console.warn('[OverdueChecker] Error checking overdue invoices:', err.message);
  }
};

/**
 * Start periodic overdue checking (runs shortly after startup, then every 6 hours)
 */
const startOverdueChecker = () => {
  // Initial check 2 seconds after startup
  setTimeout(checkOverdueInvoices, 2000);
  // Recurring every 6 hours
  setInterval(checkOverdueInvoices, 6 * 60 * 60 * 1000);
};

module.exports = {
  parseDateString,
  isPastDueDate,
  checkOverdueInvoices,
  startOverdueChecker
};

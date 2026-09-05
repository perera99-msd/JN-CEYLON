const Invoice = require('../models/Invoice');

/**
 * Parses date string in common formats (DD.MM.YYYY, YYYY-MM-DD)
 */
const parseDateString = (str) => {
  if (!str) return null;
  if (str.includes('.')) {
    const parts = str.split('.');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
  }
  const parsed = new Date(str);
  return isNaN(parsed.getTime()) ? null : parsed;
};

/**
 * Check and flag overdue invoices.
 * Invoices that are PENDING or PARTIAL where due date is in the past
 * (or created > 30 days ago if no explicit due date is provided)
 * are marked as OVERDUE.
 */
const checkOverdueInvoices = async () => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const candidates = await Invoice.find({
      isDeleted: { $ne: true },
      status: { $in: ['PENDING', 'PARTIAL'] }
    });

    let updatedCount = 0;

    for (const inv of candidates) {
      let isOverdue = false;

      if (inv.dueDate) {
        const due = parseDateString(inv.dueDate);
        if (due && due < now) {
          isOverdue = true;
        }
      } else if (inv.date) {
        const invDate = parseDateString(inv.date);
        if (invDate) {
          const defaultDue = new Date(invDate);
          defaultDue.setDate(defaultDue.getDate() + 30);
          if (defaultDue < now) {
            isOverdue = true;
          }
        }
      } else if (inv.createdAt && inv.createdAt < thirtyDaysAgo) {
        isOverdue = true;
      }

      if (isOverdue) {
        inv.status = 'OVERDUE';
        await inv.save();
        updatedCount++;
      }
    }

    if (updatedCount > 0) {
      console.log(`[OverdueChecker] Flagged ${updatedCount} overdue invoices.`);
    }
  } catch (err) {
    console.warn('[OverdueChecker] Error checking overdue invoices:', err.message);
  }
};

/**
 * Start periodic overdue checking (runs immediately, then every 6 hours)
 */
const startOverdueChecker = () => {
  // Initial check after 10 seconds of startup
  setTimeout(checkOverdueInvoices, 10000);
  // Recurring every 6 hours
  setInterval(checkOverdueInvoices, 6 * 60 * 60 * 1000);
};

module.exports = { checkOverdueInvoices, startOverdueChecker };

export const formatMoney = (value) => {
  if (value === undefined || value === null || value === '') return '';

  const amount = Number(value);
  return Number.isFinite(amount) ? amount.toFixed(2) : String(value);
};
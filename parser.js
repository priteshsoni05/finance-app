
export function parseAmountFromText(text = '') {
  const amtMatch = text.match(/(?:INR|Rs\.?|₹)\s*([\d,]+(?:\.[\d]{1,2})?)/i);
  const raw = amtMatch?.[1];
  const amount = raw ? Number(raw.replace(/,/g, '')) : null;
  const isDebit = /\b(debited|spent|purchase|payment|paid)\b/i.test(text);
  const isCredit = /\b(credited|received|refund|deposited)\b/i.test(text);
  if (amount !== null) {
    if (isDebit) return { amount: -Math.abs(amount), detected: 'expense' };
    if (isCredit) return { amount: Math.abs(amount), detected: 'income' };
    return { amount: -Math.abs(amount), detected: 'expense' };
  }
  return { amount: null, detected: 'none' };
}

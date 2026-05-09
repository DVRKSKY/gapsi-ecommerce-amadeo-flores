export function formatMoney(amount: number, locale = "es-MX", currency = "MXN") {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount);
}

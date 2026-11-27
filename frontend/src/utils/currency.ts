const currencyFormatter = new Intl.NumberFormat(
  'pt-BR',
  {
    style: 'currency',
    currency: 'BRL',
  },
);

export function formatCurrency(amountInCents: number): string {
  return currencyFormatter.format(amountInCents / 100);
}
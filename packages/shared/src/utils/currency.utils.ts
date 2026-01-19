export const formatCurrency = (value: number | string): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numValue);
};

export const parseCurrency = (value: string): number => {
  // Remove "R$", spaces, and convert , to .
  const cleaned = value.replace(/R\$\s?/, '').replace(/\./g, '').replace(/,/, '.');
  return parseFloat(cleaned);
};

export const formatCurrencySimple = (value: number | string): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return numValue.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const calculateDifference = (value1: number, value2: number): number => {
  return value1 - value2;
};

export const calculatePercentage = (part: number, total: number): number => {
  if (total === 0) return 0;
  return (part / total) * 100;
};

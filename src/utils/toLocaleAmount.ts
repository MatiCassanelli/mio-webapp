export const toLocaleAmount = (amount: number | string) => {
  const stringAmount = amount.toLocaleString('es-ar', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 8
  });
  return stringAmount;
};

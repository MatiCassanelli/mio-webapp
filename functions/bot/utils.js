export const toLocaleAmount = (amount) => {
  const stringAmount = amount.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return stringAmount;
};
export const formatCurrency = (value, currencyCode = 'INR') => {
    if (!value && value !== 0) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };
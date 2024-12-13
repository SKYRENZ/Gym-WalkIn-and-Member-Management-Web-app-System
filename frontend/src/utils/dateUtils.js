export const getCurrentDayLabel = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };
  
  export const getAvailableYears = () => {
    const currentYear = new Date().getFullYear();
    return [
      currentYear,
      currentYear - 1,
      currentYear - 2
    ];
  };
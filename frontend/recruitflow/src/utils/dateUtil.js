export const getMinDate = () => {
  const currentYear = new Date().getFullYear();
  return `${currentYear - 50}-01-01`; // Oldest allowed date (50 years ago)
};

export const getMaxDate = () => {
  const currentYear = new Date().getFullYear();
  return `${currentYear - 18}-12-31`; // Latest allowed date (18 years ago)
};

export const getDefaultDOB = () => getMaxDate(); // Default date is the max date (youngest 18-year-old)

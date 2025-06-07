const getFiscalYear = (date) => {
  const givenDate = new Date(date);
  const year = givenDate.getFullYear();
  const month = givenDate.getMonth();

  return month >= 3 ? year : year - 1;
};

// Add this function
function getMonthNameFromNumber(monthNumber) {
  const fiscalMonthMap = {
    1: 'Jan',
    2: 'Feb',
    3: 'Mar',
    4: 'Apr',
    5: 'May',
    6: 'Jun',
    7: 'Jul',
    8: 'Aug',
    9: 'Sep',
    10: 'Oct',
    11: 'Nov',
    12: 'Dec',
  };
  return fiscalMonthMap[monthNumber];
}

module.exports = {
  getFiscalYear,
  getMonthNameFromNumber,  // Export the new function
};
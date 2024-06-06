const startOfWeekend = function (date) {
  return date.getDay() === 0; // Disable Sundays
};

const getDisabledDatesArray = async (req, res) => {
  // const today = new Date();
  // // If startDate and endDate are present in the query parameters, use them. Otherwise, set defaults.
  // const startDate = req.query.startDate ? new Date(req.query.startDate) : today;
  // const endDate = req.query.endDate
  //   ? new Date(req.query.endDate)
  //   : new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());

  // const disabledDates = convertToArray(startDate, endDate, [
  //   ...req.disabledDateRanges,
  //   startOfWeekend,
  // ]);
  try {
    res.json([...req.disabledDateRanges]).status(200);
  } catch (error) {
    console.log(error);
    errorResponse(res, error.message, 400);
  }
};

module.exports = getDisabledDatesArray;

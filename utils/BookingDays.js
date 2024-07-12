const moment = require("moment-timezone");

function calculateTotalDays(bookings, useMealCounts = false) {
  return bookings.reduce((totalDays, booking) => {
    const days = countDaysBetween(
      booking.Dates.startDate,
      booking.Dates.endDate
    );
    if (useMealCounts && booking.MealCounts) {
      return totalDays + days * booking.MealCounts;
    }
    return totalDays + days;
  }, 0);
}

function countDaysBetween(startDate, endDate) {
  const start = moment(startDate);
  const end = moment(endDate);
  const diffInDays = end.diff(start, "days");
  return diffInDays + 1;
}

function addDays(TotalDays, ValidDays, endDate) {
  // Parse the end date, add the calculated days, and set timezone to IST
  const end = moment(endDate)
    .add(TotalDays - ValidDays, "days")
    .tz("Asia/Kolkata");

  // Return the new end date in ISO 8601 format with local timezone offset
  return end.format("YYYY-MM-DDTHH:mm:ss.SSSZ");
}

module.exports = { calculateTotalDays, countDaysBetween, addDays };

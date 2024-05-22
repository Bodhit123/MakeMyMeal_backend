const moment = require("moment-timezone");

function calculateTotalDays(bookings, useMealCounts = false) {
  return bookings.reduce((totalDays, booking) => {
    const days = countDaysBetween(booking.Dates.startDate, booking.Dates.endDate);
    if (useMealCounts && booking.MealCounts) {
      return totalDays + (days * booking.MealCounts);
    }
    return totalDays + days;
  }, 0);
}


function countDaysBetween(startDate, endDate) {
  // Parse the dates
  const start = moment(startDate);
  const end = moment(endDate);
  // Calculate the difference in days
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

// const TotalDaysCount = countDaysBetween(startDate, endDate);

// let from, to;
// if (TotalDaysCount === ValidDays) {
//   start = startDate;
//   end = endDate;
// } else {
//   start = startDate;
//   end = addDays(TotalDaysCount, ValidDays, endDate);
// }

module.exports = { calculateTotalDays, countDaysBetween, addDays };



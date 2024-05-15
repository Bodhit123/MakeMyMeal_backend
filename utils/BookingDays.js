// Include Moment.js and Moment Timezone library
const moment = require("moment-timezone");

function countDaysBetween(startDate, endDate) {
  // Parse the dates
  const start = moment(startDate);
  const end = moment(endDate);
  // Calculate the difference in days
  const diffInDays = end.diff(start, "days");
  return diffInDays;
}

function addDays(TotalDays, ValidDays, endDate) {
  // Parse the end date, add the calculated days, and set timezone to IST
  const end = moment(endDate)
    .add(TotalDays - ValidDays, "days")
    .tz("Asia/Kolkata");

  // Return the new end date in ISO 8601 format with local timezone offset
  return end.format("YYYY-MM-DDTHH:mm:ss.SSSZ");
}

module.exports = { countDaysBetween, addDays };

// const TotalDaysCount = BookingDays(startDate, endDate);

// let from, to;
// if (TotalDaysCount === ValidDays) {
//   start = startDate;
//   end = endDate;
// } else {
//   start = startDate;
//   end = addDays(TotalDaysCount, ValidDays, endDate);
// }



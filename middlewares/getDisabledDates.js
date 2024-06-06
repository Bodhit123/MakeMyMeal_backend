const DisableDateModel = require('../models/disable.model');
const moment = require("moment")

exports.getDisabledDates = async (req, res, next) => {
  try {
    // Fetch disabled date objects from the database
    const DisabledDateObjects = await DisableDateModel.find()

    // Map the results to the format you need
    const disabledDateRanges = DisabledDateObjects.map(doc => ({
      from: moment(doc.Dates.from).format("YYYY-MM-DD"),
      to: moment(doc.Dates.to).format("YYYY-MM-DD"),
    }));
    
    // Attach the date ranges to the request object
    req.disabledDateRanges = disabledDateRanges;

    // Call the next middleware or route handler
    next();
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

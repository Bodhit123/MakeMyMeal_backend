const { successResponse, errorResponse } = require("../utils/apiResponse");
const BookingModel = require("../models/booking.model");
const {
  calculateTotalDays,
  countDaysBetween,
} = require("../utils/BookingDays");
const moment = require("moment");

exports.getEmployeeBookings = async (req, res) => {
  const { dept, month, year } = req.query;
  const { start, length, search, sortColumn, sortDirection, draw } = req.body;

  const query = { BookingPerson: "Employee" };

  if (year) {
    let startDate = moment(year, "YYYY").startOf("year").toDate();
    let endDate   = moment(year, "YYYY").endOf("year").toDate();

    if (month && month.trim() !== "") {
      const m = moment(`${year}-${month}`, "YYYY-MMMM");
      startDate = m.startOf("month").toDate();
      endDate   = m.endOf("month").toDate();
    }

    // capture all overlap cases via $or
    query["$or"] = [
      {
        // starts before & ends inside
        "Dates.startDate": { $lt: startDate },
        "Dates.endDate":   { $gte: startDate, $lte: endDate },
      },
      {
        // starts before & ends after
        "Dates.startDate": { $lt: startDate },
        "Dates.endDate":   { $gt: endDate },
      },
      {
        // starts inside & ends after
        "Dates.startDate": { $gte: startDate, $lte: endDate },
        "Dates.endDate":   { $gt: endDate },
      },
      {
        // fully inside
        "Dates.startDate": { $gte: startDate, $lte: endDate },
        "Dates.endDate":   { $gte: startDate, $lte: endDate },
      },
    ];
  }

  // sorting
  const sortBy = {};
  if (sortColumn && sortDirection) {
    sortBy[sortColumn] = sortDirection === "asc" ? 1 : -1;
  }

  try {
    const pipeline = [
      { $match: query },
      {
        $lookup: {
          from:         "employee_details",
          localField:   "Employee",
          foreignField: "_id",
          as:           "EmployeeDetails",
        }
      },
    ];

    // search
    if (search?.trim()) {
      pipeline.push({
        $match: {
          $or: [
            { "EmployeeDetails.emp_name": { $regex: search, $options: "i" } },
            { "EmployeeDetails.dept_name": { $regex: search, $options: "i" } },
            { BookingCategory:             { $regex: search, $options: "i" } },
          ]
        }
      });
    }

    // department filter
    if (dept && dept !== "All") {
      pipeline.push({ $match: { "EmployeeDetails.dept_name": dept } });
    }

    // facet for pagination + filtered count
    pipeline.push({
      $facet: {
        paginatedResults: [
          ...(Object.keys(sortBy).length ? [{ $sort: sortBy }] : []),
          { $skip:  parseInt(start  || 0, 10) },
          { $limit: parseInt(length || 10, 10) },
        ],
        totalCount: [
          { $count: "count" }
        ]
      }
    });

    const results = await BookingModel.aggregate(pipeline);
    const paginatedResults = results[0]?.paginatedResults || [];
    const filteredCount    = results[0]?.totalCount[0]?.count || 0;

    const totalRecords = await BookingModel.countDocuments({ BookingPerson: "Employee" });

    return res.json({
      draw,
      recordsTotal:    totalRecords,
      recordsFiltered: filteredCount,
      data:            paginatedResults
    });

  } catch (err) {
    console.error(err);
    return errorResponse(res, "Something went wrong while fetching bookings", 400);
  }
};

exports.getRiseBookings = async (req, res) => {
  const { month, year } = req.query;
  const { start, length, search, sortColumn, sortDirection, draw } = req.body;

  const query = { BookingPerson: "Rise" };

  if (year) {
    let startDate = moment(year, "YYYY").startOf("year").toDate();
    let endDate   = moment(year, "YYYY").endOf("year").toDate();

    if (month && month.trim() !== "") {
      const m = moment(`${year}-${month}`, "YYYY-MMMM");
      startDate = m.startOf("month").toDate();
      endDate   = m.endOf("month").toDate();
    }

    // apply exact same $or overlap logic
    query["$or"] = [
      {
        "Dates.startDate": { $lt: startDate },
        "Dates.endDate":   { $gte: startDate, $lte: endDate },
      },
      {
        "Dates.startDate": { $lt: startDate },
        "Dates.endDate":   { $gt: endDate },
      },
      {
        "Dates.startDate": { $gte: startDate, $lte: endDate },
        "Dates.endDate":   { $gt: endDate },
      },
      {
        "Dates.startDate": { $gte: startDate, $lte: endDate },
        "Dates.endDate":   { $gte: startDate, $lte: endDate },
      },
    ];
  }

  const sortBy = {};
  if (sortColumn && sortDirection) {
    sortBy[sortColumn] = sortDirection === "asc" ? 1 : -1;
  }

  try {
    const pipeline = [{ $match: query }];

    if (search?.trim()) {
      pipeline.push({
        $match: {
          $or: [
            { BookingCategory: { $regex: search, $options: "i" } },
            { Notes:           { $regex: search, $options: "i" } },
          ]
        }
      });
    }

    pipeline.push({
      $facet: {
        paginatedResults: [
          ...(Object.keys(sortBy).length ? [{ $sort: sortBy }] : []),
          { $skip:  parseInt(start  || 0,  10) },
          { $limit: parseInt(length || 10, 10) },
        ],
        totalCount: [
          { $count: "count" }
        ]
      }
    });

    const results = await BookingModel.aggregate(pipeline);
    const paginatedResults = results[0]?.paginatedResults || [];
    const filteredCount    = results[0]?.totalCount[0]?.count || 0;

    const totalRecords = await BookingModel.countDocuments({ BookingPerson: "Rise" });

    return res.json({
      draw,
      recordsTotal:    totalRecords,
      recordsFiltered: filteredCount,
      data:            paginatedResults
    });

  } catch (err) {
    console.error(err);
    return errorResponse(res, "Something went wrong while fetching bookings", 400);
  }
};



exports.createBooking = async (req, res) => {
  try {
    const {
      BookingPerson,
      BookingCategory,
      isWeekend,
      Dates,
      MealCounts,
      Notes,
      Employees,
    } = req.body;
    const { startDate, endDate } = Dates;
    const TotalDays = countDaysBetween(startDate, endDate);
    var TotalMeals = 0;

    if (BookingPerson === "Employee") {
      // Iterate over the Employees array and add bookings for each one
      for (const employeeId of Employees) {
        // Create a new booking instance for the current employee
        const bookingForEmployee = new BookingModel({
          BookingPerson,
          BookingCategory,
          isWeekend,
          Dates,
          MealCounts,
          Notes,
          Employee: employeeId,
          CreatedBy: req.user._id,
          CreatedAt: new Date(),
        });
        // Save the booking for the current employee
        await bookingForEmployee.save();
        TotalMeals += TotalDays;
      }
    } else if (BookingPerson === "Rise") {
      const model = new BookingModel({
        BookingPerson,
        BookingCategory,
        Dates,
        MealCounts,
        Notes,
        CreatedBy: req.user._id,
        CreatedAt: new Date(),
      });

      await model.save();
      TotalMeals += TotalDays;
    } else {
      TotalMeals += TotalDays * MealCounts;
    }
    // Respond with success message
    successResponse(
      res,
      { TotalMeals, BookingPerson },
      "Successfully booked meals.",
      201
    );
  } catch (error) {
    // Respond with error message
    console.log(error);
    return errorResponse(res, error, 400);
  }
};

exports.deleteBooking = async (req, res) => {
  const id = req.params.id;

  try {
    const booking = await BookingModel.findById(id); // Find the booking before deleting it
    if (!booking) {
      return errorResponse(res, "No booking exists with the given id", 404);
    }

    // Capture necessary information before deleting
    const { BookingPerson, Dates, MealCounts } = booking;
    const TotalDays = countDaysBetween(Dates.startDate, Dates.endDate);
    const TotalMeals = TotalDays * MealCounts;

    // Delete the booking
    await BookingModel.findByIdAndDelete(id);

    // Respond with the captured information
    return successResponse(
      res,
      { BookingPerson, TotalMeals },
      "Booking deleted successfully",
      200
    );
  } catch (e) {
    return errorResponse(res, e.message, 400);
  }
};

exports.getTotalCounts = async (req, res) => {
  const { month, year } = req.query;
  console.log("Fetching counts for:", month, year);

  let query = {};
  if (year && month) {
    const startDate = moment(`${year}-${month}`, "YYYY-MMMM")
      .startOf("month")
      .toDate();
    const endDate = moment(`${year}-${month}`, "YYYY-MMMM")
      .endOf("month")
      .toDate();

    // Include bookings that overlap with the month range
    query["$or"] = [
      {
        "Dates.startDate": { $lt: startDate },
        "Dates.endDate": { $gte: startDate, $lte: endDate },
      },
      {
        "Dates.startDate": { $lt: startDate },
        "Dates.endDate": { $gt: endDate },
      },
      {
        "Dates.startDate": { $gte: startDate, $lte: endDate },
        "Dates.endDate": { $gt: endDate },
      },
      {
        "Dates.startDate": { $gte: startDate, $lte: endDate },
        "Dates.endDate": { $gte: startDate, $lte: endDate },
      },
    ];
  }

  try {
    const employeeBookings = await BookingModel.find({
      BookingPerson: "Employee",
      ...query,
    }).select("Dates MealCounts BookingPerson");

    const riseBookings = await BookingModel.find({
      BookingPerson: "Rise",
      ...query,
    }).select("Dates MealCounts BookingPerson");

    const othersBookings = await BookingModel.find({
      BookingPerson: "Others",
      ...query,
    }).select("Dates MealCounts BookingPerson");
    
    res
      .status(200)
      .json({ employeeBookings, riseBookings, othersBookings });
  } catch (error) {
    console.error("Error in getTotalCounts:", error);
    res.status(500).json({ error: "Failed to fetch counts" });
  }
};

exports.updateBookingCount = async (req, res) => {
  try {
    const { id } = req.params;
    const { MealCounts } = req.body; // Assuming the request body contains the MealCounts field

    // Find booking if it exists
    const booking = await BookingModel.findById(id);

    if (!booking) {
      return errorResponse(res, "Booking not found", 404);
    }

    // Update only the MealCounts field
    booking.MealCounts = MealCounts;

    // Save updates
    await booking.save();

    successResponse(res, booking, "MealCounts updated successfully", 200);
  } catch (error) {
    console.log(error);
    errorResponse(res, error.message, 400);
  }
};

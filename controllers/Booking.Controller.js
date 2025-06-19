const { successResponse, errorResponse } = require("../utils/apiResponse");
const BookingModel = require("../models/booking.model");
const {
  calculateTotalDays,
  countDaysBetween,
} = require("../utils/BookingDays");
const moment = require("moment");

// exports.getEmployeeBookings = async (req, res) => {
//   const { dept, month, year } = req.query;
//   const { start, length, search, sortColumn, sortDirection } = req.body;
//   const perPage = length;
//   const query = {};
//   // console.log(req.cookies)

//   query["BookingPerson"] = "Employee";
//   if (year) {
//     const Year = moment(year, "YYYY");
//     query["Dates.startDate"] = {
//       $gte: Year.startOf("year").toDate(),
//       $lte: Year.endOf("year").toDate(),
//     };
//     if (month) {
//       const Month = moment(`${year}-${month}`, "YYYY-MMMM");
//       query["Dates.startDate"].$gte = Month.startOf("month").toDate();
//       query["Dates.startDate"].$lte = Month.endOf("month").toDate();
//     }
//   }

//   try {
//     let pipeline = [
//       {
//         $match: query,
//       },
//       {
//         $lookup: {
//           from: "employee_details",
//           localField: "Employee",
//           foreignField: "_id",
//           as: "EmployeeDetails",
//         },
//       },
//     ];

//     if (dept && dept !== "All") {
//       pipeline.push({
//         $match: { "EmployeeDetails.dept_name": dept },
//       });
//     }

//     pipeline.push({
//       $limit: perPage,
//     });

//     const fetchedBookingResults = await BookingModel.aggregate(pipeline);
//     const totalResults = fetchedBookingResults.length;
//     if (fetchedBookingResults.length > 0) {
//       return successResponse(
//         res,
//         { totalResults, fetchedBookingResults },
//         "Bookings retrieved successfully",
//         200
//       );
//     } else {
//       return errorResponse(res, "No data available.", 404);
//     }
//   } catch (error) {
//     errorResponse(res, "Something went wrong while fetching bookings", 400);
//     console.log(error.message);
//   }
// };
exports.getEmployeeBookings = async (req, res) => {
  const { dept, month, year } = req.query;
  const { start, length, search, sortColumn, sortDirection, draw } = req.body;

  const query = { BookingPerson: "Employee" };

  if (year) {
    let startDate = moment(year, "YYYY").startOf("year").toDate();
    let endDate = moment(year, "YYYY").endOf("year").toDate();

    if (month && month.trim() !== "") {
      const monthMoment = moment(`${year}-${month}`, "YYYY-MMMM");
      startDate = monthMoment.startOf("month").toDate();
      endDate = monthMoment.endOf("month").toDate();
    }

    // Use $or to capture all 3 overlapping cases
    query["$or"] = [
      {
        // Case 1: started before range, ended within range
        "Dates.startDate": { $lt: startDate},
        "Dates.endDate": { $gte: startDate, $lte: endDate},
      },
      {
        // Case 2: started before range, ended after range (spans entire range)
        "Dates.startDate": { $lt: startDate},
        "Dates.endDate": { $gt: endDate},
      },
      {
        // Case 3: started within range, ended after range
        "Dates.startDate": { $gte: startDate, $lte: endDate},
        "Dates.endDate": { $gt: endDate},
      },
      {
        // Additional case: fully inside the range (optional, if needed)
        "Dates.startDate": { $gte: startDate, $lte: endDate},
        "Dates.endDate": { $gte: startDate, $lte: endDate},
      },
    ];
  }
  
  const sortBy = {};
  if (sortColumn && sortDirection) {
    sortBy[sortColumn] = sortDirection === "asc" ? 1 : -1;
  }

  try {
    const pipeline = [
      { $match: query },
      {
        $lookup: {
          from: "employee_details",
          localField: "Employee",
          foreignField: "_id",
          as: "EmployeeDetails",
        },
      },
    ];

    // ✅ Apply search if given
    const searchTerm = search || "";
    if (searchTerm && searchTerm.trim() !== "") {
      pipeline.push({
        $match: {
          $or: [
            {
              "EmployeeDetails.emp_name": { $regex: searchTerm, $options: "i" },
            },
            {
              "EmployeeDetails.dept_name": {
                $regex: searchTerm,
                $options: "i",
              },
            },
            { BookingCategory: { $regex: searchTerm, $options: "i" } },
          ],
        },
      });
    }

    if (dept && dept !== "All") {
      pipeline.push({ $match: { "EmployeeDetails.dept_name": dept } });
    }

    // ✅ Pagination and total count (filtered)
    pipeline.push({
      $facet: {
        paginatedResults: [
          ...(Object.keys(sortBy).length > 0 ? [{ $sort: sortBy }] : []),
          { $skip: parseInt(start || 0) },
          { $limit: parseInt(length || 10) },
        ],
        totalCount: [
          { $count: "count" }, // Total after filters, before pagination
        ],
      },
    });

    const results = await BookingModel.aggregate(pipeline);

    const paginatedResults = results[0]?.paginatedResults || [];
    const filteredCount = results[0]?.totalCount[0]?.count || 0;

    // ✅ Get full count for recordsTotal (before filtering)
    const totalRecords = await BookingModel.countDocuments(query); // This count is unfiltered

    return res.json({
      draw,
      recordsTotal: totalRecords,
      recordsFiltered: filteredCount,
      data: paginatedResults,
    });
  } catch (error) {
    console.error(error.message);
    return errorResponse(
      res,
      "Something went wrong while fetching bookings",
      400
    );
  }
};


// exports.getRiseBookings = async (req, res) => {
//   const { month, year } = req.query;
//   const perPage = 6;
//   let query = {
//     BookingPerson: "Rise",
//   };

//   if (year) {
//     const Year = moment(year, "YYYY");
//     query["Dates.startDate"] = {
//       $gte: Year.startOf("year").toDate(),
//       $lte: Year.endOf("year").toDate(),
//     };
//     if (month) {
//       const Month = moment(`${year}-${month}`, "YYYY-MMMM");
//       query["Dates.startDate"].$gte = Month.startOf("month").toDate();
//       query["Dates.startDate"].$lte = Month.endOf("month").toDate();
//     }
//   }
//   // console.log(query);
//   // console.log(req.query);
//   try {
//     const fetchedBookingResults = await BookingModel.find(query).limit(
//       perPage * 5
//     );
//     const totalResults = fetchedBookingResults.length;
//     if (fetchedBookingResults.length > 0) {
//       return successResponse(
//         res,
//         { totalResults, fetchedBookingResults },
//         "Bookings retrieved successfully",
//         200
//       );
//     } else {
//       return errorResponse(res, "No data available.", 404);
//     }
//   } catch (error) {
//     errorResponse(res, "Something went wrong while fetching bookings", 400);
//     console.log(error.message);
//   }
// };

exports.getRiseBookings = async (req, res) => {
  const { month, year } = req.query;
  const { start, length, search, sortColumn, sortDirection, draw } = req.body;

  const query = { BookingPerson: "Rise" };
  if (year) {
    let startDate = moment(year, "YYYY").startOf("year");
    let endDate = moment(year, "YYYY").endOf("year");

    if (month && month.trim() !== "") {
      const monthMoment = moment(`${year}-${month}`, "YYYY-MMMM");
      startDate = monthMoment.startOf("month");
      endDate = monthMoment.endOf("month");
    }

    // Use $or to capture all 3 overlapping cases
    query["$or"] = [
      {
        // Case 1: started before range, ended within range
        "Dates.startDate": { $lt: startDate.toDate() },
        "Dates.endDate": { $gte: startDate.toDate(), $lte: endDate.toDate() },
      },
      {
        // Case 2: started before range, ended after range (spans entire range)
        "Dates.startDate": { $lt: startDate.toDate() },
        "Dates.endDate": { $gt: endDate.toDate() },
      },
      {
        // Case 3: started within range, ended after range
        "Dates.startDate": { $gte: startDate.toDate(), $lte: endDate.toDate() },
        "Dates.endDate": { $gt: endDate.toDate() },
      },
      {
        // Additional case: fully inside the range (optional, if needed)
        "Dates.startDate": { $gte: startDate.toDate(), $lte: endDate.toDate() },
        "Dates.endDate": { $gte: startDate.toDate(), $lte: endDate.toDate() },
      },
    ];
  }

  const sortBy = {};
  if (sortColumn && sortDirection) {
    sortBy[sortColumn] = sortDirection === "asc" ? 1 : -1;
  }

  try {
    const pipeline = [{ $match: query }];

    // ✅ Add search condition if provided
    const searchTerm = search || "";
    if (searchTerm.trim() !== "") {
      pipeline.push({
        $match: {
          $or: [
            { BookingCategory: { $regex: searchTerm, $options: "i" } },
            { Notes: { $regex: searchTerm, $options: "i" } },
          ],
        },
      });
    }

    // ✅ Pagination + filtered count
    pipeline.push({
      $facet: {
        paginatedResults: [
          ...(Object.keys(sortBy).length > 0 ? [{ $sort: sortBy }] : []),
          { $skip: parseInt(start || 0) },
          { $limit: parseInt(length || 10) },
        ],
        totalCount: [{ $count: "count" }], // count after filtering
      },
    });

    const results = await BookingModel.aggregate(pipeline);

    const paginatedResults = results[0]?.paginatedResults || [];
    const filteredCount = results[0]?.totalCount[0]?.count || 0;

    // ✅ Get full unfiltered total
    const totalRecords = await BookingModel.countDocuments({
      BookingPerson: "Rise",
    });

    return res.json({
      draw,
      recordsTotal: totalRecords, // total before any filters
      recordsFiltered: filteredCount, // total after search filters
      data: paginatedResults,
    });
  } catch (error) {
    console.error(error.message);
    return errorResponse(
      res,
      "Something went wrong while fetching bookings",
      400
    );
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
  console.log(month, year);
  // Initialize the query for the specified period
  let query = {};
  if (year && month) {
    const startOfMonth = moment(`${year}-${month}`, "YYYY-MMMM")
      .startOf("month")
      .toDate();
    const endOfMonth = moment(`${year}-${month}`, "YYYY-MMMM")
      .endOf("month")
      .toDate();
    query["Dates.startDate"] = {
      $gte: startOfMonth,
      $lte: endOfMonth,
    };
  }

  try {
    // Fetch the booking documents based on the constructed query
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

    // Calculate the total days for each category
    let Counts = {
      TotalEmployeeCount: calculateTotalDays(employeeBookings),
      TotalRiseCount: calculateTotalDays(riseBookings),
      TotalBufferCount: calculateTotalDays(othersBookings, true),
    };

    // console.log(employeeBookings);
    // Respond with the counts
    res
      .status(200)
      .json({ Counts, employeeBookings, riseBookings, othersBookings });
  } catch (error) {
    // Handle any errors that occur during the process
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

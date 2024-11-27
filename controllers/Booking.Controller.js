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
  console.log(req.body)
  console.log(req.query)
  const { start, length, search, sortColumn, sortDirection } = req.body;
  // console.log(req.body)
  const query = { BookingPerson: "Employee" };

  if (year) {
    const Year = moment(year, "YYYY");
    query["Dates.startDate"] = {
      $gte: Year.startOf("year").toDate(),
      $lte: Year.endOf("year").toDate(),
    };

    if (month) {
      const Month = moment(`${year}-${month}`, "YYYY-MMMM");
      query["Dates.startDate"].$gte = Month.startOf("month").toDate();
      query["Dates.startDate"].$lte = Month.endOf("month").toDate();
    }
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
    // Add search logic
    if(search){
    if (search.value && search.value.trim() !== "") {
      pipeline.push({
        $match: {
          $or: [
            { "EmployeeDetails.emp_name": { $regex: search, $options: "i" } },
            { "EmployeeDetails.dept_name": { $regex: search, $options: "i" } },
            { BookingCategory: { $regex: search, $options: "i" } },
          ],
        },
      });
    }}
    
    if (dept && dept !== "All") {
      pipeline.push({ $match: { "EmployeeDetails.dept_name": dept } });
    }
   
    pipeline.push({
      $facet: {
        paginatedResults: [
          ...(Object.keys(sortBy).length > 0 ? [{ $sort: sortBy }] : []),
          { $skip: parseInt(start || 0) },
          { $limit: parseInt(length || 5) },
        ],
        totalCount: [{ $count: "count" }],
      },
    });

    // console.log(pipeline)
    const results = await BookingModel.aggregate(pipeline);
    const paginatedResults = results[0]?.paginatedResults || [];
    const totalRecords = results[0]?.totalCount[0]?.count || 0;
    // console.log(results)
    return res.json({
      draw: req.body.draw,
      recordsTotal: totalRecords, // Total records before filtering
      recordsFiltered: totalRecords, // Total records after filtering (same as total if no search applied)
      data: paginatedResults, // Data for the current page
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
  const { start, length, search, sortColumn, sortDirection } = req.body;
  const query = { BookingPerson: "Rise" };

  if (year) {
    const Year = moment(year, "YYYY");
    query["Dates.startDate"] = {
      $gte: Year.startOf("year").toDate(),
      $lte: Year.endOf("year").toDate(),
    };

    if (month) {
      const Month = moment(`${year}-${month}`, "YYYY-MMMM");
      query["Dates.startDate"].$gte = Month.startOf("month").toDate();
      query["Dates.startDate"].$lte = Month.endOf("month").toDate();
    }
  }

  const sortBy = {};
  if (sortColumn && sortDirection) {
    sortBy[sortColumn] = sortDirection === "asc" ? 1 : -1;
  }

  // Add search logic
  if (search.value && search.value.trim() !== "") {
    pipeline.push({
      $match: {
        $or: [
          { BookingCategory: { $regex: search, $options: "i" } },
          { Notes: { $regex: search, $options: "i" } },
        ],
      },
    });
  }

  try {
    const pipeline = [
      { $match: query },
      {
        $facet: {
          paginatedResults: [
            ...(Object.keys(sortBy).length > 0 ? [{ $sort: sortBy }] : []),
            { $skip: parseInt(start || 0) },
            { $limit: parseInt(length || 5) },
          ],
          totalCount: [{ $count: "count" }],
        },
      },
    ];

    const results = await BookingModel.aggregate(pipeline);
    const paginatedResults = results[0]?.paginatedResults || [];
    const totalRecords = results[0]?.totalCount[0]?.count || 0;
    console.log(paginatedResults)

    return res.json({
      draw: req.body.draw,
      recordsTotal: totalRecords, // Total records before filtering
      recordsFiltered: totalRecords, // Total records after filtering (same as total if no search applied)
      data: paginatedResults, // Data for the current page
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

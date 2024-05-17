const { successResponse, errorResponse } = require("../utils/apiResponse");
const BookingModel = require("../models/booking.model");
const moment = require("moment");

exports.getEmployeeBookings = async (req, res) => {
  const { dept, month, year } = req.query;
  const perPage = 6;
  const query = {};

  query["BookingPerson"] = "Employee"
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
  console.log(query,req.query);
  try {
    let pipeline = [
      {
        $match: query,
      },
      {
        $lookup: {
          from: "employee_details",
          localField: "Employee",
          foreignField: "_id",
          as: "EmployeeDetails",
        },
      },
    ];

    if (dept && dept !== "All") {
      pipeline.push({
        $match: { "EmployeeDetails.dept_name": dept },
      });
    }

    pipeline.push({
      $limit: perPage * 5,
    });

    const fetchedBookingResults = await BookingModel.aggregate(pipeline);
    const totalResults = fetchedBookingResults.length;
    if (fetchedBookingResults.length > 0) {
      return successResponse(
        res,
        { totalResults, fetchedBookingResults },
        "Bookings retrieved successfully",
        200
      );
    } else {
      return errorResponse(res, "No data available.", 404);
    }
  } catch (error) {
    errorResponse(res, "Something went wrong while fetching bookings", 400);
    console.log(error.message);
  }
};

exports.getRiseBookings = async (req, res) => {
  const { month, year } = req.query;
  const perPage = 6;
  let query = {
    BookingPerson: "Rise",
  };

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
  console.log(query);
  console.log(req.query);
  try {
    const fetchedBookingResults = await BookingModel.find(query).limit(
      perPage * 5
    );
    const totalResults = fetchedBookingResults.length;
    if (fetchedBookingResults.length > 0) {
      return successResponse(
        res,
        { totalResults, fetchedBookingResults },
        "Bookings retrieved successfully",
        200
      );
    } else {
      return errorResponse(res, "No data available.", 404);
    }
  } catch (error) {
    errorResponse(res, "Something went wrong while fetching bookings", 400);
    console.log(error.message);
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
    }

    // Respond with success message
    successResponse(res, "Successfully booked meals.", 201);
  } catch (error) {
    console.error(error);
    // Respond with error message
    errorResponse(res, error.message, 400);
  }
};

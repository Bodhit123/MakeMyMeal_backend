const { successResponse, errorResponse } = require("../utils/apiResponse");
const BookingModel = require("../models/booking.model");
const moment = require("moment");

exports.getBookings = async (req, res) => {
  const { dept, month, year } = req.query;
  const { page, perPage } = req.params;

  const query = {};

  if (year) {
    const startOfYear = moment(year, "YYYY");
    query["Dates.startDate"] = {
      $gte: startOfYear.startOf("year").toDate(),
      $lte: startOfYear.endOf("year").toDate(),
    };
    if (month) {
      const startOfMonth = moment(`${year}-${month}`, "YYYY-MMMM");
      query["Dates.startDate"].$gte = startOfMonth.startOf("month").toDate();
      query["Dates.startDate"].$lte = startOfMonth.endOf("month").toDate();
    }
  }

  const pageNumber = parseInt(page) || 1;
  const resultsPerPage = parseInt(perPage) || 5;

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

    if (dept) {
      pipeline.push({
        $match: { "EmployeeDetails.dept_name": dept },
      });
    }

    pipeline.push(
      {
        $skip: (pageNumber - 1) * resultsPerPage,
      },
      {
        $limit: resultsPerPage,
      }
    );

    const fetchedBookingResults = await BookingModel.aggregate(pipeline);

    if (fetchedBookingResults.length > 0) {
      return successResponse(
        res,
        fetchedBookingResults,
        "Bookings retrieved successfully"
      );
    } else {
      return errorResponse(res, "No data available.", 404);
    }
  } catch (error) {
    return errorResponse(
      res,
      "Something went wrong while fetching bookings",
      400
    );
    console.log(error.message);
  }
};

exports.createBooking = async (req, res) => {
  try {
    const { BookingCategory, isWeekend, Dates, MealCounts, Notes, Employees } =
      req.body;

    // Iterate over the Employees array and add bookings for each one
    for (const employeeId of Employees) {
      // Create a new booking instance for the current employee
      const bookingForEmployee = new BookingModel({
        BookingPerson: "Employee",
        BookingCategory,
        isWeekend,
        Dates: {
          startDate: startDateIST,
          endDate: endDateIST,
        },
        MealCounts,
        Notes,
        Employee: employeeId,
        CreatedBy: req.user._id,
        CreatedAt: new Date(),
      });

      // Save the booking for the current employee
      await bookingForEmployee.save();
    }

    // Respond with success message
    successResponse(res, "Successfully booked meals.", 201);
  } catch (error) {
    console.error(error);
    // Respond with error message
    errorResponse(res, error.message, 400);
  }
};

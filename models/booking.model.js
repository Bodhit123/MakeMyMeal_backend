const mongoose = require("mongoose");
const moment = require("moment-timezone");

const BookingSchema = new mongoose.Schema({
  BookingPerson: {
    type: String,
    required: true,
  },

  BookingCategory: {
    type: String,
    required: false,
  },

  isWeekend: {
    type: Boolean,
    required: false,
  },
  Dates: {
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
  },

  MealCounts: {
    type: Number,
    required: true,
  },

  Notes: {
    type: String,
    required: false,
  },

  Employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "employee_details",
    required: function () {
      return this.BookingPerson === "Employee";
      // Required if user is an employee.Read more about population in mongodb or chatgpt.
    },
  },

  CreatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserSignup", // Reference to the signupModel
    required: true,
  },

  CreatedAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

const BookingModel = mongoose.model("bookings", BookingSchema, "bookings");

module.exports = BookingModel;

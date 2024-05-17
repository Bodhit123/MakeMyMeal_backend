const express = require("express");
const Router = express.Router();
const { BookingEmployeeValidationMiddleware,BookingRiseValidationMiddleware} = require("../middlewares/validation");
const BookingController = require("../controllers/Booking.Controller");

Router.route("/employee").get(BookingController.getEmployeeBookings);
Router.route("/rise").get(BookingController.getRiseBookings);
Router.route("/").post(BookingEmployeeValidationMiddleware,BookingController.createBooking);

module.exports = Router;
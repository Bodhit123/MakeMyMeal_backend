const express = require("express");
const Router = express.Router();
const { BookingValidationMiddleware,BookingRiseValidationMiddleware} = require("../middlewares/validation");
const BookingController = require("../controllers/Booking.Controller");

Router.route("/employee").post(BookingController.getEmployeeBookings);
Router.route("/rise").post(BookingController.getRiseBookings);
Router.route("/").post(BookingValidationMiddleware,BookingController.createBooking);
Router.route("/:id").delete(BookingController.deleteBooking);
Router.route("/:id").patch(BookingController.updateBookingCount);
Router.route("/counts").get(BookingController.getTotalCounts);

module.exports = Router;
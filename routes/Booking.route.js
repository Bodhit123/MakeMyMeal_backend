const express = require("express");
const Router = express.Router();
const { BookingValidationMiddleware} = require("../middlewares/validation");
const BookingController = require("../controllers/Booking.Controller");

Router.route("/:page/:perPage").get(BookingController.getBookings);
Router.route("/").post(BookingValidationMiddleware,BookingController.createBooking);

module.exports = Router;
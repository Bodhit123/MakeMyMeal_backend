const express = require("express");
const app = express();
const {
  signUpValidationMiddleware,
  loginValidationMiddleware,
} = require("./middlewares/validation.js");
const bookingRoute = require("./routes/Booking.route.js");
const settingRoute = require("./routes/settings.route.js");
const loginRoute = require("./routes/Login.Route");
const logoutRoute = require("./routes/logout.route");
const SignupRoute = require("./routes/Signup.Route");
const errorMiddleware = require("./middlewares/errorhandler");
const changePasswordRoute = require("./routes/changePassword.route.js");
const employeeRoute = require("./routes/Employee.route.js");
const disabledDatesRoute = require('./routes/disabledDates.route.js');
const checkUserAuth = require("./middlewares/auth-middleware.js");
const cors = require("cors");
const helmet = require("helmet");

app.use(
  helmet({
    contentSecurityPolicy: false, // Disable contentSecurityPolicy to avoid conflicts
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
  })
);

app.use(cors());
app.use(express.json());
/*---routes---*/
app.use("/change/password", checkUserAuth, changePasswordRoute);
app.use("/booking", checkUserAuth, bookingRoute);
app.use("/employee", checkUserAuth, employeeRoute);
app.use("/settings", settingRoute);
app.use("/login", loginValidationMiddleware, loginRoute);
app.use("/signup", signUpValidationMiddleware, SignupRoute);
app.use("/logout", logoutRoute);
app.use("/api", disabledDatesRoute);
app.use(errorMiddleware);

module.exports = app;

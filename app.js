const express = require("express");
const app = express();
const {
  signUpValidationMiddleware,
  loginValidationMiddleware,
} = require("./middlewares/validation.js");
const bookingRoute = require("./routes/Booking.route.js");
const settingRoute = require("./routes/settings.route.js");
const loginRoute = require("./routes/Login.Route");
const RefreshTokenRoute = require("./routes/refreshToken.route.js");
const logoutRoute = require("./routes/logout.route");
const SignupRoute = require("./routes/Signup.Route");
const errorMiddleware = require("./middlewares/errorhandler");
const changePasswordRoute = require("./routes/changePassword.route.js");
const employeeRoute = require("./routes/Employee.route.js");
const disabledDatesRoute = require("./routes/disabledDates.route.js");
const checkUserAuth = require("./middlewares/auth-middleware.js");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");

app.use(express.json());
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

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, authorization"
  );
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  next();
});

// Cross Origin Resource Sharing
app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
    ],
  })
);

app.use(cookieParser());
/*---routes---*/
app.use("/signup", signUpValidationMiddleware, SignupRoute);
app.use("/login", loginValidationMiddleware, loginRoute);
app.use("/logout", logoutRoute);
app.use("/settings", settingRoute);
app.use("/api", disabledDatesRoute);
app.use("/refresh", RefreshTokenRoute);
app.use("/change/password", checkUserAuth, changePasswordRoute);
app.use("/booking", checkUserAuth, bookingRoute);
app.use("/employee", checkUserAuth, employeeRoute);
app.use(errorMiddleware);

module.exports = app;

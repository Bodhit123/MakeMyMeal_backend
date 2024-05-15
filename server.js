const express = require("express");
const app = express();
const helmet = require("helmet");
const cors = require("cors");
const {
  signUpValidationMiddleware,
  loginValidationMiddleware,
} = require("./middlewares/validation.js");
const bookingRoute = require("./routes/Booking.route.js");
const loginRoute = require("./routes/Login.Route");
const logoutRoute = require("./routes/logout.route");
const SignupRoute = require("./routes/Signup.Route");
const ConnectDb = require("./config/connection");
const dotenv = require("dotenv");
const errorMiddleware = require("./middlewares/errorhandler");
const changePasswordRoute = require("./routes/changePassword.route.js");
const employeeRoute = require("./routes/Employee.route.js");
const checkUserAuth = require("./middlewares/auth-middleware.js");

ConnectDb();

dotenv.config({ path: "./config/config.env" });

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
app.use("/change/password", checkUserAuth, changePasswordRoute);
app.use("/booking", checkUserAuth, bookingRoute);
app.use("/employee", checkUserAuth, employeeRoute);
app.use("/login", loginValidationMiddleware, loginRoute);
app.use("/signup", signUpValidationMiddleware, SignupRoute);
app.use("/logout", logoutRoute);
app.use(errorMiddleware);

app.listen(process.env.PORT, () => {
  console.log(`Server is working on ${process.env.PORT}`);
});

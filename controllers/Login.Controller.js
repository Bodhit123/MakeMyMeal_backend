const bcrypt = require("bcrypt");
const { successResponse, errorResponse } = require("../utils/apiResponse");
const LoginModel = require("../models/login.model.js");
const jwt = require("jsonwebtoken");
const sendMail = require("../utils/nodemailservice.js");

const LoginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Find user by email
    const user = await LoginModel.findOne({ email });

    if (!user) {
      console.log("User not found");
      return errorResponse(res, "Invalid email or password", 404);
    }
    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      console.log("Password does not match");
      return errorResponse(res, "Invalid email or password", 401);
    }

    //create jwt token after user logged in successfully.
    const token = jwt.sign({ userId: user._id }, process.env.jwt_secret_key, {
      expiresIn: "1h",
    });

    // If passwords match, login successful
    return successResponse(res, { user, token }, "Login successful");
  } catch (error) {
    // If an error occurs, send error response
    console.error("Error occurred during login:", error);
    return errorResponse(res, "An error occurred during login.");
  }
};

//ChangePassword can be done when user is logged in so we have declared it here.it doesn't matter.
async function ChangeUserPassword(req, res) {
  const { old_password, password, password_confirmation } = req.body;
  if (password && password_confirmation) {
    if (password == old_password) {
      return errorResponse(
        res,
        "Please create a different password.New password should not be same as previous.",
        401
      );
    } else if (password !== password_confirmation) {
      return errorResponse(
        res,
        "New Password and Confirm New Password does't match",
        401
      );
    } else {
      const salt = await bcrypt.genSalt(10);
      const newHashPassword = await bcrypt.hash(password, salt);
      await LoginModel.findByIdAndUpdate(req.user._id, {
        $set: { password: newHashPassword },
      });
      successResponse(
        res,
        newHashPassword,
        "Password changed successfully",
        201
      );
      await sendMail(req.user.email, password);
    }
  } else {
    //Bad Request
    errorResponse(res, "All Fields are Required.", 400);
  }
}

function Logout(req, res) {
  res.cookie("token", null, { expires: new Date(0) }); // Set token cookie to null and expire immediately
  // Optionally, you may also clear any session or user data stored on the server side.
  // For example:
  // req.session.destroy(); // If using session-based authentication
  // Or clear any user data from the database, etc.
  res.status(200).send("Logged out successfully");
}

module.exports = { LoginController, ChangeUserPassword, Logout };
// res.set("Content-Type", "application/json");
// res.set("Cache-Control", "no-store");

const bcrypt = require("bcrypt");
const { successResponse, errorResponse } = require("../utils/apiResponse");
const LoginModel = require("../models/login.model.js");
const jwt = require("jsonwebtoken");
const sendMail = require("../utils/nodemailservice.js");

const LoginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Find user by email
    const foundUser = await LoginModel.findOne({ email });

    if (!foundUser) {
      console.log("User not found");
      return errorResponse(res, "Invalid email or password", 404);
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, foundUser.password);
    if (!passwordMatch) {
      console.log("Password does not match");
      return errorResponse(res, "Invalid email or password", 401);
    }

    //only user with admin role can access
    if (!foundUser.isAdmin) {
      console.log("Admin only can login.");
      return errorResponse(res, "Admin Only Can Login", 409);
    }

    //create jwt token after user logged in successfully.
    const token = jwt.sign(
      { userId: foundUser._id },
      process.env.jwt_access_token_secret_key,
      {
        expiresIn: "2m",
      }
    );

    const RefreshToken = jwt.sign(
      { userId: foundUser._id },
      process.env.jwt_refresh_token_secret_key,
      {
        expiresIn: "1d",
      }
    );

    foundUser.refreshToken = RefreshToken;
    await foundUser.save();

    // Set refresh token as a cookie
    res.cookie("refreshToken", RefreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, //1 day
      secure: false,
      sameSite: "lax",
      path: "/",
    });
    // If passwords match, login successful
    return successResponse(res, { foundUser, token }, "Login successful");
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
      console.log(req.user.email);
      await sendMail(req.user.email, password);
    }
  } else {
    //Bad Request
    errorResponse(res, "All Fields are Required.", 400);
  }
}

async function Logout(req, res) {
  // res.cookie("token", null, { expires: new Date(0) }); // Set token cookie to null and expire immediately
  // Optionally, you may also clear any session or user data stored on the server side.
  // For example:
  // req.session.destroy(); // If using session-based authentication
  // Or clear any user data from the database, etc.
  // res.status(200).send("Logged out successfully");

  const cookies = req.cookies;
  if (!cookies?.refreshToken)
    return successResponse(res, "logout successfully1", 204); //No content
  //indicating there’s nothing to do since the user is already logged out.
  const refreshToken = cookies.refreshToken;

  // Is refreshToken in db?
  const foundUser = await LoginModel.findOne({ refreshToken }).exec();
  //If no match is found, the server assumes the user is not logged in or the refresh token is already invalid.
  //In this case, it clears the jwt cookie on the client and responds with 204 No Content.
  if (!foundUser) {
    res.clearCookie("refreshToken", {
      httpOnly: false,
      secure: false,
      sameSite: "lax",
      path: "/",
    });
    return successResponse(res, "logout successfully2", 204);
  }
  //else delete refreshToken in db
  foundUser.refreshToken = "";
  foundUser.save();
  //remove the cookie from client side(browser)
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
  });
  console.log("logout successfully");
  return successResponse(res, "logout successfully3", 204);
}

module.exports = { LoginController, ChangeUserPassword, Logout };
// res.set("Content-Type", "application/json");
// res.set("Cache-Control", "no-store");

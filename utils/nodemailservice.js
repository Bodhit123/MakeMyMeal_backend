const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../config/config.env") });

const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

async function sendMail(email, pass) {
  try {
    const { token } = await oAuth2Client.getAccessToken();

    if (!token) {
      throw new Error("Failed to retrieve access token");
    }

    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.NodeMailer_USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: token,
      },
    });

    const mailOptions = {
      from: `bodhit📮<${process.env.NodeMailer_USER}>`,
      to: email,
      subject: "Hello from makeMyMeal app",
      text: "Hello from MakeMyMeal web application.",
      html: `<b>Hey User! Here is your password for the MakeMyMeal: ${pass}</b>`,
    };

    const result = await transport.sendMail(mailOptions);
    console.log("Email sent.....", result);
    return result;
  } catch (error) {
    console.error("Error in sending email:", error);
    throw error;
  }
}

// const sendMail = require('./path/to/sendMail.js');

// async function someFunction() {
//   try {
//     const email = 'hirrendarji@gmail.com';
//     const password = 'password123';
//     const result = await sendMail(email, password);
//     console.log('Email sent successfully:', result);
//   } catch (error) {
//     console.error('Failed to send email:', error);
//   }
// }

// someFunction();

module.exports = sendMail;

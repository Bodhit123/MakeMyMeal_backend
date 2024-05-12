const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config({ path: "../config/config.env" });

const transporter = nodemailer.createTransport({
  service:"gmail",
  auth: {
    user: process.env.NodeMailer_USER,
    pass: process.env.NodeMailer_PASS
  }
});

async function Main(pass, email) {
  try {
    // Verify transporter credentials
    await transporter.verify();
    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: "dhvandarji@gmail.com", // Sender address
      to: email, // List of receivers
      subject: "Hello ✔",
      html: `<b>Hey User! Here is your password for the MakeMyMeal: ${pass}</b>`,
    });

    console.log("Message sent: %s", info.messageId);
    // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
  } catch (error) {
    console.error("Error sending email:", error);
    throw error; // Rethrow the error for handling in the calling function
  }
}
// Main("dummyPassword", "bodhit.150410107015@gmail.com")
//   .then(() => console.log("Email sent successfully"))
//   .catch((error) => console.error("Failed to send email:", error));

module.exports = Main;

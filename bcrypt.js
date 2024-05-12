const bcrypt = require("bcrypt");

async function generateHashedPassword() {
  try {
    // Password to hash
    const password = "pass123";
    // // Fixed salt value
    const salt = "$2b$10$eySay7IoMUc2.vcncW4VIO";
    // Generate a random salt synchronously
    // const salt = bcrypt.genSaltSync(10);
    console.log("Generated Salt:", salt);
    // Hash the password using bcrypt with the fixed salt
    const hashedPassword = await bcrypt.hash(password, salt);

    // Log the hashed password
    console.log("Hashed password:", hashedPassword);
  } catch (error) {
    // Handle any errors
    console.error("Error generating hashed password:", error);
  }
}

// Call the function to generate hashed password
generateHashedPassword();

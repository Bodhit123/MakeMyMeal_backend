const mongoose = require("mongoose");

const ConnectDb = async () => {
  try {
    const connection = await mongoose.connect("mongodb://127.0.0.1:27017/makeMyMeal");
    console.log(`Connected to MongoDB on ${connection.connection.host}!`);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1); // Exit with failure
  }
};

module.exports = ConnectDb;

const mongoose = require("mongoose");

const disableSchema = new mongoose.Schema({
  Dates: {
    from: {
      type: Date,
      required: true,
    },
    to: {
      type: Date,
      required: true,
    },
  },
  Reason: {
    type: String,
    required: true,
  },
  MealType:{
    type: Array,
    required: true
  }
});

const Model = mongoose.model("settings", disableSchema, "settings");

module.exports = Model;

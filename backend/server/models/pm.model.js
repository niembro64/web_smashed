const mongoose = require("mongoose");

const PMSchema = new mongoose.Schema({
  title: String,
  price: Number,
  description: String,
});

const PM = mongoose.model("PM", PMSchema);

module.exports = PM;

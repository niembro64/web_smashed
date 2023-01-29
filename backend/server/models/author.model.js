const mongoose = require("mongoose");

const minLength = 3;

const AuthorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    minLength: [minLength, `Name must be at least ${minLength} characters`],
  },

}, { timestamps: true });

const Author = mongoose.model("Author", AuthorSchema);

module.exports = Author;

// ${minLength}
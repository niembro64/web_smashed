const mongoose = require("mongoose");

const JokeSchema = new mongoose.Schema({
	joke_text: String,
	funny_level: Number
});

const Joke = mongoose.model("Joke", JokeSchema);

module.exports = Joke;
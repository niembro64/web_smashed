const Joke = require("../models/jokes.model");

module.exports.test = (req, res) => {
  Joke.find()
    .then(res.json({ joke: "test joke" }))
    .catch((err) =>
      res.status(400).json({ message: "Something went wrong", error: err })
    );
};

module.exports.findAllJokes = (req, res) => {
  Joke.find()
    .then((allJokes) => res.json(allJokes))
    .catch((err) =>
      res.status(400).json({ message: "Something went wrong", error: err })
    );
};

module.exports.findOneSingleJoke = (req, res) => {
  Joke.findOne({ _id: req.params._id })
    .then((oneSingleJoke) => res.json(oneSingleJoke))
    .catch((err) =>
      res.status(400).json({ message: "Something went wrong", error: err })
    );
};

module.exports.createNewJoke = (req, res) => {
  Joke.create(req.body)
    .then((newlyCreatedJoke) => res.json(newlyCreatedJoke))
    .catch((err) =>
      res.status(400).json({ message: "Something went wrong", error: err })
    );
};

module.exports.deleteAnExistingJoke = (req, res) => {
  Joke.deleteOne({ _id: req.params._id })
    .then((result) => res.json(result))
    .catch((err) =>
      res.status(400).json({ message: "Something went wrong", error: err })
    );
};

///////////

module.exports.updateExistingJoke = (req, res) => {
  Joke.findOneAndUpdate({ _id: req.params._id }, req.body, { new: true })
    .then((updatedJoke) => res.json(updatedJoke))
    .catch((err) =>
      res.status(400).json({ message: "Something went wrong", error: err })
    );
};

// module.exports.updateExistingJokePart = (req, res) => {
//   Joke.updateOne({ _id: req.params._id }, req.body)
//     .then((results) => res.json( results ))
//     .catch((err) => res.status(400).json({ message: "that didn't work", err }));
// };

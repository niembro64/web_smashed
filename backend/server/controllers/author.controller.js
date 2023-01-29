const Author = require("../models/author.model");

module.exports.test = (req, res) => {
  Author.find()
    .then(res.json({ author: "test author" }))
    .catch((err) =>
      res.status(400).json({ message: "Something went wrong", error: err })
    );
};

module.exports.findAllAuthor = (req, res) => {
  Author.find()
    .then((allAuthor) => res.json(allAuthor))
    .catch((err) =>
      res.status(400).json({ message: "Something went wrong", error: err })
    );
};

module.exports.findOneSingleAuthor = (req, res) => {
  Author.findOne({ _id: req.params._id })
    .then((oneSingleAuthor) => res.json(oneSingleAuthor))
    .catch((err) =>
      res.status(400).json({ message: "Something went wrong", error: err })
    );
};

module.exports.createNewAuthor = (req, res) => {
  Author.create(req.body)
    .then((newlyCreatedAuthor) => res.json(newlyCreatedAuthor))
    .catch((err) =>
      res.status(400).json({ message: "Something went wrong", error: err })
    );
};

module.exports.deleteAnExistingAuthor = (req, res) => {
  Author.deleteOne({ _id: req.params._id })
    .then((result) => res.json(result))
    .catch((err) =>
      res.status(400).json({ message: "Something went wrong", error: err })
    );
};

///////////

// module.exports.updateExistingAuthor = (req, res) => {
//   Author.findOneAndUpdate({ _id: req.params._id }, req.body, { new: true })
//     .then((updatedAuthor) => res.json(updatedAuthor))
//     .catch((err) =>
//       res.status(400).json({ message: "Something went wrong", error: err })
//     );
// };
module.exports.updateExistingAuthor = (req, res) => {
  Author.findOneAndUpdate({ _id: req.params._id }, req.body,{runValidators: true})
    .then((updatedAuthor) => res.json(updatedAuthor))
    .catch((err) =>
      res.status(400).json({ message: "Something went wrong", error: err })
    );
};

// module.exports.updateExistingAuthorePart = (req, res) => {
//   Author.updateOne({ _id: req.params._id }, req.body)
//     .then((results) => res.json( results ))
//     .catch((err) => res.status(400).json({ message: "that didn't work", err }));
// };

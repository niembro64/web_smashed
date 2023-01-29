const PM = require("../models/pm.model");

module.exports.test = (req, res) => {
  PM.find()
    .then(res.json({ pm: "test pm" }))
    .catch((err) =>
      res.status(400).json({ message: "Something went wrong", error: err })
    );
};

module.exports.findAllPM = (req, res) => {
  PM.find()
    .then((allPM) => res.json(allPM))
    .catch((err) =>
      res.status(400).json({ message: "Something went wrong", error: err })
    );
};

module.exports.findOneSinglePM = (req, res) => {
  PM.findOne({ _id: req.params._id })
    .then((oneSinglePM) => res.json(oneSinglePM))
    .catch((err) =>
      res.status(400).json({ message: "Something went wrong", error: err })
    );
};

module.exports.createNewPM = (req, res) => {
  PM.create(req.body)
    .then((newlyCreatedPM) => res.json(newlyCreatedPM))
    .catch((err) =>
      res.status(400).json({ message: "Something went wrong", error: err })
    );
};

module.exports.deleteAnExistingPM = (req, res) => {
  PM.deleteOne({ _id: req.params._id })
    .then((result) => res.json(result))
    .catch((err) =>
      res.status(400).json({ message: "Something went wrong", error: err })
    );
};

///////////

module.exports.updateExistingPM = (req, res) => {
  PM.findOneAndUpdate({ _id: req.params._id }, req.body, { new: true })
    .then((updatedPM) => res.json(updatedPM))
    .catch((err) =>
      res.status(400).json({ message: "Something went wrong", error: err })
    );
};

// module.exports.updateExistingPMePart = (req, res) => {
//   PM.updateOne({ _id: req.params._id }, req.body)
//     .then((results) => res.json( results ))
//     .catch((err) => res.status(400).json({ message: "that didn't work", err }));
// };

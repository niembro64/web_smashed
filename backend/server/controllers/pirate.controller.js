const Pirate = require("../models/pirate.model");

module.exports.test = (req, res) => {
  Pirate.find()
    .then(res.json({ pirate: "test pirate" }))
    .catch((err) =>
      res.status(400).json({ message: "Something went wrong", error: err })
    );
};

module.exports.findAllPirate = (req, res) => {
  Pirate.find().collation({locale: 'en', strength: 2}).sort({pirateName:1})
    .then((allPirate) => res.json(allPirate))
    .catch((err) =>
      res.status(400).json({ message: "Something went wrong", error: err })
    );
};
// module.exports.findAllPirate = (req, res) => {
//   Pirate.find()
//     .then((allPirate) => res.json(allPirate))
//     .catch((err) =>
//       res.status(400).json({ message: "Something went wrong", error: err })
//     );
// };

module.exports.findOneSinglePirate = (req, res) => {
  Pirate.findOne({ _id: req.params._id })
    .then((oneSinglePirate) => res.json(oneSinglePirate))
    .catch((err) =>
      res.status(400).json({ message: "Something went wrong", error: err })
    );
};

module.exports.createNewPirate = (req, res) => {
  Pirate.create(req.body)
    .then((newlyCreatedPirate) => res.json(newlyCreatedPirate))
    .catch((err) =>
      res.status(400).json({ message: "Something went wrong", error: err })
    );
};

module.exports.deleteAnExistingPirate = (req, res) => {
  Pirate.deleteOne({ _id: req.params._id })
    .then((result) => res.json(result))
    .catch((err) =>
      res.status(400).json({ message: "Something went wrong", error: err })
    );
};

///////////

// module.exports.updateExistingPirate = (req, res) => {
//   Pirate.findOneAndUpdate({ _id: req.params._id }, req.body, { new: true })
//     .then((updatedPirate) => res.json(updatedPirate))
//     .catch((err) =>
//       res.status(400).json({ message: "Something went wrong", error: err })
//     );
// };
module.exports.updateExistingPirate = (req, res) => {
  Pirate.findOneAndUpdate({ _id: req.params._id }, req.body,{runValidators: true})
    .then((updatedPirate) => res.json(updatedPirate))
    .catch((err) =>
      res.status(400).json({ message: "Something went wrong", error: err })
    );
};

// module.exports.updateExistingPirateePart = (req, res) => {
//   Pirate.updateOne({ _id: req.params._id }, req.body)
//     .then((results) => res.json( results ))
//     .catch((err) => res.status(400).json({ message: "that didn't work", err }));
// };

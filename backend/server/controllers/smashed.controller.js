const Smashed = require('../models/smashed.model');

module.exports.test = (req, res) => {
  Smashed.find()
    .then(res.json({ smashed: 'test smashed' }))
    .catch((err) =>
      res.status(400).json({ message: 'Something went wrong', error: err })
    );
};

module.exports.findAllSmashed = (req, res) => {
  Smashed.find()
    .collation({ locale: 'en', strength: 2 })
    .sort({ momentCreated: -1 })
    .then((allSmashed) => res.json(allSmashed))
    .catch((err) =>
      res.status(400).json({ message: 'Something went wrong', error: err })
    );
};
// module.exports.findAllSmashed = (req, res) => {
//   Smashed.find()
//     .then((allSmashed) => res.json(allSmashed))
//     .catch((err) =>
//       res.status(400).json({ message: "Something went wrong", error: err })
//     );
// };

module.exports.findOneSingleSmashed = (req, res) => {
  Smashed.findOne({ _id: req.params._id })
    .then((oneSingleSmashed) => res.json(oneSingleSmashed))
    .catch((err) =>
      res.status(400).json({ message: 'Something went wrong', error: err })
    );
};

module.exports.createNewSmashed = (req, res) => {
  Smashed.create(req.body)
    .then((newlyCreatedSmashed) => res.json(newlyCreatedSmashed))
    .catch((err) =>
      res.status(400).json({ message: 'Something went wrong', error: err })
    );
};

module.exports.deleteAnExistingSmashed = (req, res) => {
  Smashed.deleteOne({ _id: req.params._id })
    .then((result) => res.json(result))
    .catch((err) =>
      res.status(400).json({ message: 'Something went wrong', error: err })
    );
};

///////////

// module.exports.updateExistingSmashed = (req, res) => {
//   Smashed.findOneAndUpdate({ _id: req.params._id }, req.body, { new: true })
//     .then((updatedSmashed) => res.json(updatedSmashed))
//     .catch((err) =>
//       res.status(400).json({ message: "Something went wrong", error: err })
//     );
// };
module.exports.updateExistingSmashed = (req, res) => {
  Smashed.findOneAndUpdate({ _id: req.params._id }, req.body, {
    runValidators: true,
  })
    .then((updatedSmashed) => res.json(updatedSmashed))
    .catch((err) =>
      res.status(400).json({ message: 'Something went wrong', error: err })
    );
};

// module.exports.updateExistingSmashedePart = (req, res) => {
//   Smashed.updateOne({ _id: req.params._id }, req.body)
//     .then((results) => res.json( results ))
//     .catch((err) => res.status(400).json({ message: "that didn't work", err }));
// };

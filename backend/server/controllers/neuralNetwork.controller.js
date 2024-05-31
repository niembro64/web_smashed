// controllers/neuralNetwork.controller.js
const NeuralNetwork = require('../models/NeuralNetwork');

module.exports.getNeuralNetwork = (req, res) => {
  NeuralNetwork.findOne()
    .then((network) => res.json(network))
    .catch((err) =>
      res.status(400).json({ message: 'Something went wrong', error: err })
    );
};

module.exports.saveNeuralNetwork = (req, res) => {
  NeuralNetwork.findOneAndUpdate({}, req.body, {
    upsert: true,
    new: true,
    runValidators: true,
  })
    .then((network) => res.json(network))
    .catch((err) =>
      res.status(400).json({ message: 'Something went wrong', error: err })
    );
};

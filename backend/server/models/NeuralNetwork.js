// models/NeuralNetwork.js
const mongoose = require('mongoose');

const NeuralNetworkSchema = new mongoose.Schema({
  type: { type: String, required: true },
  sizes: [Number],
  layers: [
    {
      weights: [[Number]],
      biases: [Number],
    },
  ],
  options: {
    inputSize: Number,
    outputSize: Number,
    binaryThresh: Number,
    hiddenLayers: [Number],
    useGpu: Boolean,
  },
  trainOpts: {
    activation: String,
    iterations: Number,
    errorThresh: Number,
    log: Boolean,
    logPeriod: Number,
    leakyReluAlpha: Number,
    learningRate: Number,
    momentum: Number,
    callbackPeriod: Number,
    timeout: String,
    beta1: Number,
    beta2: Number,
    epsilon: Number,
  },
});

const NeuralNetwork = mongoose.model('NeuralNetwork', NeuralNetworkSchema);
module.exports = NeuralNetwork;

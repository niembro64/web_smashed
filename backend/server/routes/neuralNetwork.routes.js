// routes/neuralNetwork.routes.js
const NeuralNetworkController = require('../controllers/neuralNetwork.controller');

module.exports = (app) => {
  app.get('/api/neural-network', NeuralNetworkController.getNeuralNetwork);
  app.post('/api/neural-network', NeuralNetworkController.saveNeuralNetwork);
};

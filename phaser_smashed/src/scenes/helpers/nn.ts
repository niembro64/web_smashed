import { NeuralNetwork } from 'brain.js';
import Game from '../Game';
import { NNObject } from '../interfaces';
import { netJson } from './nnJson';

export const nnConfigBaby = {
  inputSize: 2,
  outputSize: 2,
  learningRate: 0.1,
  activation: 'sigmoid',
  hiddenLayers: [3],
};
export const nnConfig = {
  inputSize: 19,
  outputSize: 11,
  learningRate: 0.1,
  activation: 'sigmoid',
  hiddenLayers: [],
};

// export const NNCreate = (game: Game): void => {
//   game.net = new NeuralNetwork(nnConfig);
//   game.net = game.net.fromJSON(netJson);
// };

export const NNTrain = (game: Game): void => {
  game.net = new NeuralNetwork(nnConfig);
  game.net.train(game.nnObjects);
  let netJson = game.net.toJSON();
  console.log('netJson', JSON.stringify(netJson, null, 2));
};

export const NNGetOutput = (game: Game): number[] => {
  let player = game.players[0];
  let enemy = game.players[1];
  let input = [
    game.flag.completedCurr ? 1 : 0,
    player.state.name === 'player-state-alive' ? 1 : 0,
    player.emitterDark.visible ? 1 : 0,
    player.char.sprite.x,
    player.char.sprite.y,
    player.char.sprite.body.velocity.x,
    player.char.sprite.body.velocity.y,
    player.char.attackEnergy.sprite.x,
    player.char.attackEnergy.sprite.y,
    player.char.attackEnergy.sprite.body.velocity.x,
    player.char.attackEnergy.sprite.body.velocity.y,
    enemy.char.sprite.x,
    enemy.char.sprite.y,
    enemy.char.sprite.body.velocity.x,
    enemy.char.sprite.body.velocity.y,
    enemy.char.attackEnergy.sprite.x,
    enemy.char.attackEnergy.sprite.y,
    enemy.char.attackEnergy.sprite.body.velocity.x,
    enemy.char.attackEnergy.sprite.body.velocity.y,
  ];

  let output = game.net.run(input);
  return output;
};

export const NNSetPlayer2Output = (game: Game): void => {
  let player = game.players[1];
  let output = NNGetOutput(game);

  player.padCurr.up = output[0] > 0.5 ? true : false;
  player.padCurr.down = output[1] > 0.5 ? true : false;
  player.padCurr.left = output[2] > 0.5 ? true : false;
  player.padCurr.right = output[3] > 0.5 ? true : false;
  player.padCurr.A = output[4] > 0.5 ? true : false;
  player.padCurr.B = output[5] > 0.5 ? true : false;
  player.padCurr.X = output[6] > 0.5 ? true : false;
  player.padCurr.Y = output[7] > 0.5 ? true : false;
  player.padCurr.L = output[8] > 0.5 ? true : false;
  player.padCurr.R = output[9] > 0.5 ? true : false;
  player.padCurr.start = false;
  // player.padCurr.start = output[10] > 0.5 ? true : false;
  player.padCurr.select = output[11] > 0.5 ? true : false;

  console.log('padCurr', JSON.stringify(player.padCurr, null, 2));
};

export const addPlayerOneNNObjects = (game: Game): void => {
  let player = game.players[0];
  let enemy = game.players[1];

  let newNNObject: NNObject = {
    input: [
      game.flag.completedCurr ? 1 : 0,
      player.state.name === 'player-state-alive' ? 1 : 0,
      player.emitterDark.visible ? 1 : 0,
      player.char.sprite.x,
      player.char.sprite.y,
      player.char.sprite.body.velocity.x,
      player.char.sprite.body.velocity.y,
      player.char.attackEnergy.sprite.x,
      player.char.attackEnergy.sprite.y,
      player.char.attackEnergy.sprite.body.velocity.x,
      player.char.attackEnergy.sprite.body.velocity.y,
      enemy.char.sprite.x,
      enemy.char.sprite.y,
      enemy.char.sprite.body.velocity.x,
      enemy.char.sprite.body.velocity.y,
      enemy.char.attackEnergy.sprite.x,
      enemy.char.attackEnergy.sprite.y,
      enemy.char.attackEnergy.sprite.body.velocity.x,
      enemy.char.attackEnergy.sprite.body.velocity.y,
    ],
    output: [
      player.padCurr.up ? 1 : 0,
      player.padCurr.down ? 1 : 0,
      player.padCurr.left ? 1 : 0,
      player.padCurr.right ? 1 : 0,
      player.padCurr.A ? 1 : 0,
      player.padCurr.B ? 1 : 0,
      player.padCurr.X ? 1 : 0,
      player.padCurr.Y ? 1 : 0,
      player.padCurr.L ? 1 : 0,
      player.padCurr.R ? 1 : 0,
      player.padCurr.start ? 1 : 0,
      player.padCurr.select ? 1 : 0,
    ],
  };

  game.nnObjects.push(newNNObject);

  console.log('game.nnObjects', game.nnObjects);
};

export const NNDownloadNNObjects = (game: Game): void => {
  let nnObjects = game.nnObjects;
  let nnObjectsString = JSON.stringify(nnObjects, null, 2);
  let blob = new Blob([nnObjectsString], { type: 'text/plain' });
  let url = URL.createObjectURL(blob);
  // Create an anchor tag with the download attribute
  const downloadLink = document.createElement('a');
  downloadLink.setAttribute('href', url);
  downloadLink.setAttribute('download', 'example.txt');

  // Simulate a click on the anchor tag to trigger the download
  downloadLink.click();

  // Clean up the URL object
  URL.revokeObjectURL(url);
};
import { NeuralNetwork } from 'brain.js';
import Game from '../Game';
import { NNObject, NNOutput, Player } from '../interfaces';
import { getNearestAttackEnergyXY, getNearestPlayerAliveXY } from './movement';
import { NNJsonRatiosTrueOutput } from './nnJson';

export const nnConfigBaby = {
  inputSize: 2,
  outputSize: 2,
  learningRate: 0.1,
  activation: 'sigmoid',
  hiddenLayers: [3],
};
export const nnConfig = {
  inputSize: 6,
  outputSize: 11,
  learningRate: 0.1,
  activation: 'sigmoid',
  hiddenLayers: [10],
};

// export const NNCreate = (game: Game): void => {
//   game.net = new NeuralNetwork(nnConfig);
//   game.net = game.net.fromJSON(netJson);
// };

export const NNTrain = (game: Game): void => {
  if (!game.debug.P1TrainNN) {
    return;
  }

  game.net = new NeuralNetwork(nnConfig);
  game.net.train(game.nnObjects);
  let netJson = game.net.toJSON();
  console.log('netJson', JSON.stringify(netJson, null, 2));
};

export const NNGetOutput = (
  player: Player,
  enemyX: number,
  enemyY: number,
  enemyAEX: number,
  enemyAEY: number,
  game: Game
): number[] => {
  let input = [
    player.char.sprite.x - enemyX,
    player.char.sprite.y - enemyY,
    player.char.sprite.body.velocity.x - enemyAEX,
    player.char.sprite.body.velocity.y - enemyAEY,
    player.char.sprite.body.touching.down ? 1 : 0,
    player.char.sprite.body.touching.left ||
    player.char.sprite.body.touching.right
      ? 1
      : 0,
  ];

  let output = game.net.run(input);
  return output;
};

export const NNSetPlayerPad = (
  player: Player,
  playerIndex: number,
  game: Game
): void => {
  if (game.debug.P1TrainNN) {
    return;
  }

  let enemy = getNearestPlayerAliveXY(player, playerIndex, game);
  let enemyAE = getNearestAttackEnergyXY(player, playerIndex, game);

  let output = NNGetOutput(
    player,
    enemy.x,
    enemy.y,
    enemyAE.x,
    enemyAE.y,
    game
  );

  let r: NNOutput = NNJsonRatiosTrueOutput;

  player.padCurr.up = output[0] > r.controllerUp ? true : false;
  player.padCurr.down = output[1] > r.controllerDown ? true : false;
  player.padCurr.left = output[2] > r.controllerLeft ? true : false;
  player.padCurr.right = output[3] > r.controllerRight ? true : false;
  player.padCurr.A = output[4] > r.controllerA ? true : false;
  player.padCurr.B = output[5] > r.controllerB ? true : false;
  player.padCurr.X = output[6] > r.controllerX ? true : false;
  player.padCurr.Y = output[7] > r.controllerY ? true : false;
  player.padCurr.L = output[8] > r.controllerL ? true : false;
  player.padCurr.R = output[9] > r.controllerR ? true : false;
  player.padCurr.start = false;
  // player.padCurr.start = output[10] > r. ? true : false;
  player.padCurr.select = output[11] > r.controllerSelect ? true : false;
  // console.log('output', JSON.stringify(output, null, 2));
  // console.log('padCurr', JSON.stringify(player.padCurr, null, 2));
};

export const addPlayerOneNNObjects = (game: Game): void => {
  if (!game.debug.P1TrainNN) {
    return;
  }

  let p = game.players[0];
  let enemy = game.players[1];

  let newNNObject: NNObject = {
    input: [
      p.char.sprite.x - enemy.char.sprite.x,
      p.char.sprite.y - enemy.char.sprite.y,
      p.char.sprite.body.velocity.x - enemy.char.sprite.body.velocity.x,
      p.char.sprite.body.velocity.y - enemy.char.sprite.body.velocity.y,
      p.char.sprite.body.touching.down ? 1 : 0,
      p.char.sprite.body.touching.left || p.char.sprite.body.touching.right
        ? 1
        : 0,
    ],
    output: [
      p.padCurr.up ? 1 : 0,
      p.padCurr.down ? 1 : 0,
      p.padCurr.left ? 1 : 0,
      p.padCurr.right ? 1 : 0,
      p.padCurr.A ? 1 : 0,
      p.padCurr.B ? 1 : 0,
      p.padCurr.X ? 1 : 0,
      p.padCurr.Y ? 1 : 0,
      p.padCurr.L ? 1 : 0,
      p.padCurr.R ? 1 : 0,
      p.padCurr.start ? 1 : 0,
      p.padCurr.select ? 1 : 0,
    ],
  };
  console.log('newNNObject', JSON.stringify(newNNObject, null, 2));

  game.nnObjects.push(newNNObject);

  // console.log('game.nnObjects', game.nnObjects);
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

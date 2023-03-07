import { NeuralNetwork, Recurrent, recurrent } from 'brain.js';
import Game, { SCREEN_DIMENSIONS } from '../Game';
import { NNObject, Player } from '../interfaces';
import { getNearestAttackEnergyXY, getNearestPlayerAliveXY } from './movement';
import { nnConfigLSTM } from './nnJsonLSTM';
import { nnConfigNN, NNRatiosNN } from './nnJsonNN';

export const NNTrainNN = async (game: Game): Promise<void> => {
  if (!game.debug.NNP1Train) {
    return;
  }

  console.log('NNTrain');

  game.nnNet = new NeuralNetwork(nnConfigNN);
  console.log('game.nnNet', game.nnNet);
  const maxIterations = 1000;
  game.nnNet.train(game.nnObjects, {
    // log: true,
    iterations: maxIterations,
    learningRate: 0.01,
    errorThresh: 0.005,
    logPeriod: 1,
    log: (stats: any) => {
      // console.log(stats);
      console.log(
        Math.floor((stats.iterations / maxIterations) * 1000) * 0.1 + '%'
      );
      console.log('error', Math.floor(stats.error * 1000) * 0.1 + '%');
    },
    // callback: (res: any) => {
    //   console.log('game.nnObjects.length', game.nnObjects.length);
    //   console.log('res.iterations', res.iterations);
    //   console.log('res.error', res.error);
    //   // console.log('res.time', res.time);
    //   // console.log(
    //   //   '%',
    //   //   Math.floor((res.iterations * 100) / game.nnObjects.length)
    //   // );
    // },
  });
  console.log('game.nnNet after train', game.nnNet);
  let netJson = game.nnNet.toJSON();
  console.log('netJson', JSON.stringify(netJson, null, 2));

  let newOutRatios = NNGetOutputRatios(game);
  console.log('newOutRatios', newOutRatios);
};

export const NNTrainLSTM = async (game: Game): Promise<void> => {
  if (!game.debug.NNP1Train) {
    return;
  }

  console.log('NNTrain');

  // game.nnNet = new NeuralNetwork(nnConfig);
  // game.nnNet = new recurrent.RNN(nnConfig);
  game.nnNet = new recurrent.LSTM(nnConfigLSTM);
  console.log('game.nnNet', game.nnNet);
  await game.nnNet.train(game.nnObjects, {
    // log: true,
    iterations: 100,
    learningRate: 0.01,
    errorThresh: 0.05,
    logPeriod: 1,
    log: (stats: any) => console.log(stats),
    // callback: (res: any) => {
    //   console.log('game.nnObjects.length', game.nnObjects.length);
    //   console.log('res.iterations', res.iterations);
    //   console.log('res.error', res.error);
    //   // console.log('res.time', res.time);
    //   // console.log(
    //   //   '%',
    //   //   Math.floor((res.iterations * 100) / game.nnObjects.length)
    //   // );
    // },
  });
  console.log('game.nnNet after train', game.nnNet);
  let netJson = game.nnNet.toJSON();
  console.log('netJson', JSON.stringify(netJson, null, 2));

  let newOutRatios = NNGetOutputRatios(game);
  console.log('newOutRatios', newOutRatios);
};

export const NNGetOutputRatios = (game: Game): number[] => {
  let numObj: number = game.nnObjects.length;
  let numObjOuts: number = game.nnObjects[0].output.length;

  let btnUsedNumber: number[] = [];
  let btnUsedRatio: number[] = [];

  for (let i = 0; i < numObjOuts; i++) {
    btnUsedNumber.push(0);
  }

  game.nnObjects.forEach((object: NNObject, objIndex) => {
    object.output.forEach((button: number, btnIndex: number) => {
      btnUsedNumber[btnIndex] += button;
    });
  });

  btnUsedNumber.forEach((button: number, btnIndex: number) => {
    btnUsedRatio.push(button / numObj);
  });

  return btnUsedRatio;
};

export const NNGetOutput = (
  player: Player,
  enemyX: number,
  enemyY: number,
  enemyAEX: number,
  enemyAEY: number,
  game: Game
): number[] => {
  // is p facing enemy
  let isPFacingEnemy: boolean = false;
  if (player.char.sprite.x < enemyX) {
    if (player.char.sprite.flipX) {
      isPFacingEnemy = true;
    }
  } else {
    if (!player.char.sprite.flipX) {
      isPFacingEnemy = true;
    }
  }
  let pCurr = player.padCurr;

  let input: number[] = [
    pCurr.up ? 1 : 0,
    pCurr.down ? 1 : 0,
    pCurr.left ? 1 : 0,
    pCurr.right ? 1 : 0,
    pCurr.A ? 1 : 0,
    pCurr.B ? 1 : 0,
    pCurr.X ? 1 : 0,
    pCurr.Y ? 1 : 0,
    player.char.sprite.x - enemyX,
    player.char.sprite.y - enemyY,
    player.char.sprite.body.velocity.x - enemyAEX,
    player.char.sprite.body.velocity.y - enemyAEY,
    player.char.sprite.body.touching.down ? 1 : 0,
    player.char.sprite.body.touching.left ? 1 : 0,
    player.char.sprite.body.touching.right ? 1 : 0,
    isPFacingEnemy ? 1 : 0,
  ];

  let output: number[] = game.nnNet.run(input);

  console.log('input', JSON.stringify(input, null, 2));
  console.log('output', JSON.stringify(output, null, 2));
  return output;
};

export const NNSetPlayerPad = (
  player: Player,
  playerIndex: number,
  game: Game
): void => {
  // if (game.debug.P1TrainNN) {
  //   return;
  // }

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

  let r: number[] = NNRatiosNN;

  player.padCurr.up = output[0] > 1 - r[0] ? true : false;
  player.padCurr.down = output[1] > 1 - r[1] ? true : false;
  player.padCurr.left = output[2] > 1 - r[2] ? true : false;
  player.padCurr.right = output[3] > 1 - r[3] ? true : false;
  player.padCurr.A = output[4] > 1 - r[4] ? true : false;
  player.padCurr.B = output[5] > 1 - r[5] ? true : false;
  player.padCurr.X = output[6] > 1 - r[6] ? true : false;
  player.padCurr.Y = output[7] > 1 - r[7] ? true : false;
  // player.padCurr.L = output[8] > 1 - r[8] ? true : false;
  // player.padCurr.R = output[9] > 1 - r[9] ? true : false;
  // player.padCurr.start = output[10] > 1 - r[10] ? true : false;
  // player.padCurr.select = output[11] > 1 - r[11] ? true : false;

  // console.log('output', JSON.stringify(output, null, 2));
};

export const addPlayerOneNNObjects = (game: Game): void => {
  if (!game.debug.NNP1Train) {
    return;
  }

  if (game.gameState.nameCurr !== 'game-state-play') {
    return;
  }

  if (
    game.players[0].state.name === 'player-state-dead' ||
    game.players[0].state.name === 'player-state-start'
  ) {
    return;
  }

  let p = game.players[0];
  let enemy = game.players[1];

  let isPFacingEnemy: boolean = false;
  if (p.char.sprite.x < enemy.char.sprite.x) {
    if (p.char.sprite.flipX) {
      isPFacingEnemy = true;
    }
  } else {
    if (!p.char.sprite.flipX) {
      isPFacingEnemy = true;
    }
  }

  let newNNObject: NNObject = {
    input: [
      // p.padCurr.up ? 1 : 0,
      // p.padCurr.down ? 1 : 0,
      // p.padCurr.left ? 1 : 0,
      // p.padCurr.right ? 1 : 0,
      // p.padCurr.A ? 1 : 0,
      // p.padCurr.B ? 1 : 0,
      // p.padCurr.X ? 1 : 0,
      // p.padCurr.Y ? 1 : 0,
      p.padDebounced.up,
      p.padDebounced.down,
      p.padDebounced.left,
      p.padDebounced.right,
      p.padDebounced.A,
      p.padDebounced.B,
      p.padDebounced.X,
      p.padDebounced.Y,
      p.char.sprite.x - enemy.char.sprite.x / SCREEN_DIMENSIONS.WIDTH,
      p.char.sprite.y - enemy.char.sprite.y / SCREEN_DIMENSIONS.HEIGHT,
      p.char.sprite.body.velocity.x - enemy.char.sprite.body.velocity.x,
      p.char.sprite.body.velocity.y - enemy.char.sprite.body.velocity.y,
      p.char.sprite.body.touching.down ? 1 : 0,
      p.char.sprite.body.touching.left ? 1 : 0,
      p.char.sprite.body.touching.right ? 1 : 0,
      isPFacingEnemy ? 1 : 0,
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
      // p.padCurr.L ? 1 : 0,
      // p.padCurr.R ? 1 : 0,
      // p.padCurr.start ? 1 : 0,
      // p.padCurr.select ? 1 : 0,
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

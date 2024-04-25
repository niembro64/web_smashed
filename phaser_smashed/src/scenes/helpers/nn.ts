import { NeuralNetwork, recurrent } from 'brain.js';
import { print } from '../../views/client';
import Game from '../Game';
import { NNObject, Player } from '../interfaces';
import {
  getNearestAttackEnergyXYFromPlayer,
  getNearestPlayerAliveFromPlayer,
  getNearestPlayerAliveFromXY,
  getNearestPlayerFromPlayer,
} from './movement';
import { nnConfigLSTM } from './nnJsonLSTM';
import { NNRatiosNN, nnConfigNN } from './nnJsonNN';

export const NNTrainNN = async (game: Game): Promise<void> => {
  if (!game.debug.NNP1Train) {
    return;
  }

  print('NNTrain');

  game.nnNet = new NeuralNetwork(nnConfigNN);
  print('game.nnNet', game.nnNet);
  const maxIterations = 1000;

  const randomizedNnObjects = game.nnObjects.sort(() => Math.random());

  game.nnNet.train(randomizedNnObjects, {
    iterations: maxIterations,
    randomize: true,
    learningRate: 0.01,
    errorThresh: 0.005,
    callbackPeriod: 1,
    logPeriod: 1,
    log: (stats: any) => {
      print(Math.floor((stats.iterations / maxIterations) * 100) + '%');
      print('error', Math.floor(stats.error * 100) + '%');
    },
  });

  print('game.nnNet after train', game.nnNet);
  const netJson = game.nnNet.toJSON();
  print('netJson', JSON.stringify(netJson, null, 2));

  const newOutRatios = NNGetOutputRatios(game);
  print('newOutRatios', newOutRatios);
};

export const NNTrainLSTM = async (game: Game): Promise<void> => {
  if (!game.debug.NNP1Train) {
    return;
  }

  print('NNTrain');

  game.nnNet = new recurrent.LSTM(nnConfigLSTM);
  print('game.nnNet', game.nnNet);
  await game.nnNet.train(game.nnObjects, {
    iterations: 100,
    learningRate: 0.01,
    errorThresh: 0.05,
    logPeriod: 1,
    log: (stats: any) => print(stats),
  });
  print('game.nnNet after train', game.nnNet);
  const netJson = game.nnNet.toJSON();
  print('netJson', JSON.stringify(netJson, null, 2));

  const newOutRatios = NNGetOutputRatios(game);
  print('newOutRatios', newOutRatios);
};

export const NNGetOutputRatios = (game: Game): number[] => {
  const numObj: number = game.nnObjects.length;
  const numObjOuts: number = game.nnObjects[0].output.length;

  const btnUsedNumber: number[] = [];
  const btnUsedRatio: number[] = [];

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

export const NNGetOutputStatic = (
  player: Player,
  playerIndex: number,
  game: Game
): number[] => {
  const { player: enemyNearest } = getNearestPlayerFromPlayer(
    player,
    playerIndex,
    game
  );
  const { player: enemyAlive } = getNearestPlayerAliveFromPlayer(
    player,
    playerIndex,
    game
  );

  let enemy = enemyAlive;

  if (enemy === null) {
    enemy = enemyNearest;
  }

  const { x: enemyAEX, y: enemyAEY } = getNearestAttackEnergyXYFromPlayer(
    player,
    playerIndex,
    game
  );

  const enemyPositionX = enemy.char.sprite.x;
  const enemyPositionY = enemy.char.sprite.y;

  const enemyVelocyX = enemy.char.sprite.body.velocity.x;
  const enemyVelocyY = enemy.char.sprite.body.velocity.y;

  // is p facing enemy
  let isPFacingEnemy: boolean = false;
  if (player.char.sprite.x < enemyPositionX) {
    if (player.char.sprite.flipX) {
      isPFacingEnemy = true;
    }
  } else {
    if (!player.char.sprite.flipX) {
      isPFacingEnemy = true;
    }
  }
  const pCurr = player.padCurr;
  const pDeb = player.padDebounced;

  const nnInput: number[] = [
    player.state.name === 'player-state-hurt' ? 1 : 0,
    pCurr.up ? 1 : 0,
    pCurr.down ? 1 : 0,
    pCurr.left ? 1 : 0,
    pCurr.right ? 1 : 0,
    pCurr.A ? 1 : 0,
    pCurr.B ? 1 : 0,
    pCurr.X ? 1 : 0,
    pCurr.Y ? 1 : 0,
    pDeb.up,
    pDeb.down,
    pDeb.left,
    pDeb.right,
    pDeb.A,
    pDeb.B,
    pDeb.X,
    pDeb.Y,

    player.char.sprite.body.position.x,
    player.char.sprite.body.position.y,
    player.char.sprite.body.velocity.x,
    player.char.sprite.body.velocity.y,

    player.char.sprite.body.position.x - enemyPositionX,
    player.char.sprite.body.position.y - enemyPositionY,
    player.char.sprite.body.velocity.x - enemyVelocyX,
    player.char.sprite.body.velocity.y - enemyVelocyY,
    player.char.sprite.body.position.x - enemyAEX,
    player.char.sprite.body.position.y - enemyAEY,
    player.char.sprite.body.touching.down ? 1 : 0,
    player.char.sprite.body.touching.left ? 1 : 0,
    player.char.sprite.body.touching.right ? 1 : 0,
    isPFacingEnemy ? 1 : 0,
    player.char.sprite.flipX ? 1 : 0,
  ];

  const nnOutput: number[] = game.nnNet.run(nnInput);

  // print('input', JSON.stringify(input, null, 2));
  // print('output', JSON.stringify(output, null, 2));
  return nnOutput;
};

export const NNSetPlayerPadStatic = (
  player: Player,
  playerIndex: number,
  game: Game
): void => {
  const nnOutput = NNGetOutputStatic(player, playerIndex, game);

  const r: number[] = NNRatiosNN;

  player.padCurr.up = nnOutput[0] > r[0];
  player.padCurr.down = nnOutput[1] > r[1];
  player.padCurr.left = nnOutput[2] > r[2];
  player.padCurr.right = nnOutput[3] > r[3];
  player.padCurr.A = nnOutput[4] > r[4];
  player.padCurr.B = nnOutput[5] > r[5];
  player.padCurr.X = nnOutput[6] > r[6];
  player.padCurr.Y = nnOutput[7] > r[7];
};

export const addPlayerOneNNObjectsStatic = (game: Game): void => {
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

  const player: Player = game.players[0];

  const { player: enemy } = getNearestPlayerAliveFromXY(
    player.char.sprite.body.position.x,
    player.char.sprite.body.position.y,
    game
  );

  const { x: enemyAttackEnergyX, y: enemyAttackEnergyY } =
    getNearestAttackEnergyXYFromPlayer(player, 0, game);

  let isPFacingEnemy: boolean = false;
  if (player.char.sprite.x < enemy.char.sprite.x) {
    if (player.char.sprite.flipX) {
      isPFacingEnemy = true;
    }
  } else {
    if (!player.char.sprite.flipX) {
      isPFacingEnemy = true;
    }
  }

  const newNNObject: NNObject = {
    input: [
      player.state.name === 'player-state-hurt' ? 1 : 0,
      player.padCurr.up ? 1 : 0,
      player.padCurr.down ? 1 : 0,
      player.padCurr.left ? 1 : 0,
      player.padCurr.right ? 1 : 0,
      player.padCurr.A ? 1 : 0,
      player.padCurr.B ? 1 : 0,
      player.padCurr.X ? 1 : 0,
      player.padCurr.Y ? 1 : 0,
      player.padDebounced.up,
      player.padDebounced.down,
      player.padDebounced.left,
      player.padDebounced.right,
      player.padDebounced.A,
      player.padDebounced.B,
      player.padDebounced.X,
      player.padDebounced.Y,

      // SPRITE POSITIONS
      player.char.sprite.body.position.x,
      player.char.sprite.body.position.y,
      player.char.sprite.body.velocity.x,
      player.char.sprite.body.velocity.y,

      // DIFF SPRITE POSITIONS
      player.char.sprite.x - enemy.char.sprite.x,
      player.char.sprite.y - enemy.char.sprite.y,

      // DIFF SPRITE VELOCITIES
      player.char.sprite.body.velocity.x - enemy.char.sprite.body.velocity.x,
      player.char.sprite.body.velocity.y - enemy.char.sprite.body.velocity.y,

      // DIFF SPRITE AE POSITIONS
      player.char.sprite.body.position.x - enemyAttackEnergyX,
      player.char.sprite.body.position.y - enemyAttackEnergyY,

      player.char.sprite.body.touching.down ? 1 : 0,
      player.char.sprite.body.touching.left ? 1 : 0,
      player.char.sprite.body.touching.right ? 1 : 0,
      isPFacingEnemy ? 1 : 0,
      player.char.sprite.flipX ? 1 : 0,
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
    ],
  };

  print('newNNObject', JSON.stringify(newNNObject, null, 2));

  game.nnObjects.push(newNNObject);
};

export const NNDownloadNNObjects = (game: Game): void => {
  const nnObjects = game.nnObjects;
  const nnObjectsString = JSON.stringify(nnObjects, null, 2);
  const blob = new Blob([nnObjectsString], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  // Create an anchor tag with the download attribute
  const downloadLink = document.createElement('a');
  downloadLink.setAttribute('href', url);
  downloadLink.setAttribute('download', 'example.txt');

  // Simulate a click on the anchor tag to trigger the download
  downloadLink.click();

  // Clean up the URL object
  URL.revokeObjectURL(url);
};

export const saveTextStringAsFileToBaseOfDirectory = (
  text: string,
  filename: string
): void => {
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  // Create an anchor tag with the download attribute
  const downloadLink = document.createElement('a');
  downloadLink.setAttribute('href', url);
  downloadLink.setAttribute('download', filename);

  // Simulate a click on the anchor tag to trigger the download
  downloadLink.click();

  // Clean up the URL object
  URL.revokeObjectURL(url);
};

export const deleteLastNNObjects = (
  player: Player,
  playerIndex: number,
  numToDelete: number,
  game: Game
): void => {
  if (!game.debug.NNP1Train) {
    return;
  }

  if (playerIndex !== 0) {
    return;
  }

  if (numToDelete > game.nnObjects.length) {
    print('numToDelete > game.nnObjects.length');
    return;
  }

  print('deleting prev', game.nnObjects.length);

  game.nnObjects = game.nnObjects.slice(0, game.nnObjects.length - numToDelete);

  print('deleting post', game.nnObjects.length);
};

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

  // player.padCurr.up = output[0] > 1 - r[0] ? true : false;
  // player.padCurr.down = output[1] > 1 - r[1] ? true : false;
  // player.padCurr.left = output[2] > 1 - r[2] ? true : false;
  // player.padCurr.right = output[3] > 1 - r[3] ? true : false;
  // player.padCurr.A = output[4] > 1 - r[4] ? true : false;
  // player.padCurr.B = output[5] > 1 - r[5] ? true : false;
  // player.padCurr.X = output[6] > 1 - r[6] ? true : false;
  // player.padCurr.Y = output[7] > 1 - r[7] ? true : false;
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

  const p = game.players[0];

  const { player: enemy } = getNearestPlayerAliveFromXY(
    p.char.sprite.body.position.x,
    p.char.sprite.body.position.y,
    game
  );

  const { x: enemyAttackEnergyX, y: enemyAttackEnergyY } =
    getNearestAttackEnergyXYFromPlayer(p, 0, game);

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

  const newNNObject: NNObject = {
    input: [
      p.padCurr.up ? 1 : 0,
      p.padCurr.down ? 1 : 0,
      p.padCurr.left ? 1 : 0,
      p.padCurr.right ? 1 : 0,
      p.padCurr.A ? 1 : 0,
      p.padCurr.B ? 1 : 0,
      p.padCurr.X ? 1 : 0,
      p.padCurr.Y ? 1 : 0,
      p.padDebounced.up,
      p.padDebounced.down,
      p.padDebounced.left,
      p.padDebounced.right,
      p.padDebounced.A,
      p.padDebounced.B,
      p.padDebounced.X,
      p.padDebounced.Y,

      // DIFF SPRITE POSITIONS
      p.char.sprite.x - enemy.char.sprite.x,
      p.char.sprite.y - enemy.char.sprite.y,

      // DIFF SPRITE VELOCITIES
      p.char.sprite.body.velocity.x - enemy.char.sprite.body.velocity.x,

      p.char.sprite.body.velocity.y - enemy.char.sprite.body.velocity.y,

      // DIFF SPRITE AE POSITIONS
      p.char.sprite.body.position.x - enemyAttackEnergyX,
      p.char.sprite.body.position.y - enemyAttackEnergyY,

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

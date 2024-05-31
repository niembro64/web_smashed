import { NeuralNetwork } from 'brain.js';
import { print } from '../../views/client';
import SmashedGame from '../SmashedGame';
import { NNObject, Player } from '../types';
import {
  getNearestAttackEnergyXYFromPlayer,
  getNearestAttackPhysicalXYFromPlayer,
  getNearestPlayerAliveFromPlayer,
  getNearestPlayerFromPlayer,
} from './movement';
import { NNRatiosNN } from './nnRatios';
import { nnJsonNN } from './nnJson';

export const nnConfigNN = {
  hiddenLayers: [40],
  useGpu: true,
};

export const nnNumTrainingBarTicks: number = 25;

export const NNTrainNN = async (game: SmashedGame): Promise<void> => {
  if (!game.debug.NN_Train) {
    return;
  }

  print('NNTrain');

  game.nnNet = new NeuralNetwork(nnConfigNN);
  game.nnNet = game.nnNet.fromJSON(nnJsonNN);
  print('game.nnNet', game.nnNet);

  let randomizedNnObjects: NNObject[] = game.nnObjects.sort(() =>
    Math.random()
  );

  if (game.debug.Dur_Seconds) {
    // duplicate training date 60 times

    const newArray: NNObject[] = [];

    for (let i = 0; i < 60; i++) {
      newArray.push(...randomizedNnObjects);
    }

    randomizedNnObjects = newArray;
  }

  print('randomizedNnObjects', randomizedNnObjects);

  const numObj: number = randomizedNnObjects.length;

  const numIter = Math.floor(100 * Math.exp(-numObj * 0.0001) + 10);
  const logPeriod = 1;

  window.dispatchEvent(
    new CustomEvent('nn-train', {
      detail: {
        name: 'netStart',
        value: null,
        error: null,
        numIter: numIter,
        numObj: numObj,
        logPeriod: logPeriod,
      },
    })
  );
  await game.nnNet.trainAsync(randomizedNnObjects, {
    iterations: numIter,
    randomize: true,
    learningRate: 0.0001,
    logPeriod: logPeriod,
    log: (stats: any) => {
      const percentDone = Math.min(1, stats.iterations / numIter);

      const error = stats.error;

      window.dispatchEvent(
        new CustomEvent('nn-train', {
          detail: {
            name: 'netProgress',
            value: percentDone,
            error: error,
            numIter: numIter,
            numObj: numObj,
            logPeriod: logPeriod,
          },
        })
      );
    },
  });

  print('game.nnNet after train', game.nnNet);
  const netJson = game.nnNet.toJSON();
  // print('netJson', JSON.stringify(netJson, null, 2));
  window.dispatchEvent(
    new CustomEvent('nn-train', {
      detail: {
        name: 'netJson',
        value: JSON.stringify(netJson, null, 2),
        error: null,
        numIter: numIter,
        numObj: numObj,
        logPeriod: logPeriod,
      },
    })
  );

  const outputButtonRatios = NNGetOutputRatios(game);
  // print('outputButtonRatios', outputButtonRatios);
  window.dispatchEvent(
    new CustomEvent('nn-train', {
      detail: {
        name: 'netRatios',
        value: JSON.stringify(outputButtonRatios, null, 2),
        error: null,
        numIter: numIter,
        numObj: numObj,
        logPeriod: logPeriod,
      },
    })
  );
};

const NNGetOutputRatios = (game: SmashedGame): number[] => {
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

const NNGetInputArrayFromWorld = (
  player: Player,
  playerIndex: number,
  game: SmashedGame
): number[] => {
  const largeNumber = 9999;
  const nearestPlayerAlive = getNearestPlayerAliveFromPlayer(
    player,
    playerIndex,
    game
  );
  const nearestPlayer = getNearestPlayerFromPlayer(player, playerIndex, game);

  const enemyNearestAlive: Player | null = nearestPlayerAlive?.player || null;
  const enemyNearest = nearestPlayer?.player || null;

  let enemy = enemyNearestAlive;

  if (enemy === null) {
    enemy = enemyNearest;
  }

  const z = getNearestAttackEnergyXYFromPlayer(player, playerIndex, game);
  const enemyAEX: number = z?.x || largeNumber;
  const enemyAEY: number = z?.y || largeNumber;

  const e = getNearestAttackPhysicalXYFromPlayer(player, playerIndex, game);

  const enemyAPX: number = e?.x || largeNumber;
  const enemyAPY: number = e?.y || largeNumber;

  const enemyPositionX = enemy?.char.sprite.x || largeNumber;
  const enemyPositionY = enemy?.char.sprite.y || largeNumber;

  const enemyVelocyX = enemy?.char.sprite.body.velocity.x || 0;
  const enemyVelocyY = enemy?.char.sprite.body.velocity.y || 0;

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
  const pPrev = player.padPrev;
  const pDeb = player.padDebounced;

  const nnInput: number[] = [
    // STATES
    player.emitterPlayer.on ? 1 : 0,
    player.char.powerStateCurr.name === 'none' ? 0 : 1,
    player.state.name === 'player-state-hurt' ? 1 : 0,

    // BUTTONS
    pCurr.up ? 1 : 0,
    pCurr.down ? 1 : 0,
    pCurr.left ? 1 : 0,
    pCurr.right ? 1 : 0,
    pCurr.A ? 1 : 0,
    pCurr.B ? 1 : 0,
    pCurr.X ? 1 : 0,
    pCurr.Y ? 1 : 0,
    pPrev.up ? 1 : 0,
    pPrev.down ? 1 : 0,
    pPrev.left ? 1 : 0,
    pPrev.right ? 1 : 0,
    pPrev.A ? 1 : 0,
    pPrev.B ? 1 : 0,
    pPrev.X ? 1 : 0,
    pPrev.Y ? 1 : 0,
    pDeb.up,
    pDeb.down,
    pDeb.left,
    pDeb.right,
    pDeb.A,
    pDeb.B,
    pDeb.X,
    pDeb.Y,

    // SPRITE POSITIONS
    player.char.sprite.body.position.x,
    player.char.sprite.body.position.y,
    player.char.sprite.body.velocity.x,
    player.char.sprite.body.velocity.y,

    // DIFF SPRITE POSITIONS
    player.char.sprite.body.position.x - enemyPositionX,
    player.char.sprite.body.position.y - enemyPositionY,
    player.char.sprite.body.velocity.x - enemyVelocyX,
    player.char.sprite.body.velocity.y - enemyVelocyY,

    // DIFF SPRITE AE POSITIONS
    // DIFF SPRITE AP POSITIONS
    enemyAEX === null
      ? largeNumber
      : player.char.sprite.body.position.x - enemyAEX,
    enemyAEY === null
      ? largeNumber
      : player.char.sprite.body.position.y - enemyAEY,
    enemyAPX === null
      ? largeNumber
      : player.char.sprite.body.position.x - enemyAPX,
    enemyAPY === null
      ? largeNumber
      : player.char.sprite.body.position.y - enemyAPY,

    // TOUCHING
    player.char.sprite.body.touching.up ? 1 : 0,
    player.char.sprite.body.touching.down ? 1 : 0,
    player.char.sprite.body.touching.left ? 1 : 0,
    player.char.sprite.body.touching.right ? 1 : 0,

    // FACING
    isPFacingEnemy ? 1 : 0,
    player.char.sprite.flipX ? 1 : 0,
  ];

  return nnInput;
};

const NNGetOutputArrayFromWorld = (
  player: Player,
  playerIndex: number,
  game: SmashedGame
): number[] => {
  const pCurr = player.padCurr;

  const nnOutput: number[] = [
    pCurr.up ? 1 : 0,
    pCurr.down ? 1 : 0,
    pCurr.left ? 1 : 0,
    pCurr.right ? 1 : 0,
    pCurr.A ? 1 : 0,
    pCurr.B ? 1 : 0,
    pCurr.X ? 1 : 0,
    pCurr.Y ? 1 : 0,
  ];

  return nnOutput;
};

export const NNSetPlayerPadStatic = (
  player: Player,
  playerIndex: number,
  game: SmashedGame
): void => {
  const nnInput = NNGetInputArrayFromWorld(player, playerIndex, game);
  const nnOutput: number[] = game.nnNet.run(nnInput);

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

export const addPlayerNNObjectsStatic = (game: SmashedGame): void => {
  if (!game.debug.NN_Train) {
    return;
  }

  if (game.gameState.nameCurr !== 'game-state-play') {
    return;
  }

  const playerIndex = 0;

  if (
    game.players[playerIndex].state.name === 'player-state-dead' ||
    game.players[playerIndex].state.name === 'player-state-start'
  ) {
    return;
  }

  const player: Player = game.players[playerIndex];

  const inputArray = NNGetInputArrayFromWorld(player, playerIndex, game);
  const outputArray = NNGetOutputArrayFromWorld(player, playerIndex, game);

  const newNNObject: NNObject = {
    input: inputArray,
    output: outputArray,
  };

  print('newNNObject', JSON.stringify(newNNObject, null, 2));

  game.nnObjects.push(newNNObject);
};

const NNDownloadNNObjects = (game: SmashedGame): void => {
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

const saveTextStringAsFileToBaseOfDirectory = (
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
  game: SmashedGame
): void => {
  if (!game.debug.NN_Train) {
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

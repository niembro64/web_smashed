import { NeuralNetwork } from 'brain.js';
import { print } from '../../views/client';
import Game from '../Game';
import { NNObject, Player } from '../interfaces';
import {
  getNearestAttackEnergyXYFromPlayer,
  getNearestAttackPhysicalXYFromPlayer,
  getNearestPlayerAliveFromPlayer,
  getNearestPlayerAliveFromXY,
  getNearestPlayerFromPlayer,
} from './movement';
import { NNRatiosNN } from './nnRatios';

export const nnConfigNN = {
  hiddenLayers: [40, 40],
  useGpu: true,
};

export const nnNumTrainingBarTicks: number = 25;

export const NNTrainNN = async (game: Game): Promise<void> => {
  if (!game.debug.NNetTrainP1) {
    return;
  }

  print('NNTrain');

  game.nnNet = new NeuralNetwork(nnConfigNN);
  print('game.nnNet', game.nnNet);

  let randomizedNnObjects: NNObject[] = game.nnObjects.sort(() =>
    Math.random()
  );

  if (game.debug.DurSeconds) {
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
  const nearP = getNearestPlayerAliveFromPlayer(player, playerIndex, game);

  const enemyNearest: Player | null = nearP?.player || null;

  const aliveP = getNearestPlayerFromPlayer(player, playerIndex, game);

  const enemyAlive = aliveP?.player || null;

  let enemy = enemyAlive;

  if (enemy === null) {
    enemy = enemyNearest;
  }

  const z = getNearestAttackEnergyXYFromPlayer(player, playerIndex, game);
  const enemyAEX: number | null = z?.x || null;
  const enemyAEY: number | null = z?.y || null;

  const e = getNearestAttackPhysicalXYFromPlayer(player, playerIndex, game);

  const enemyAPX: number | null = e?.x || null;
  const enemyAPY: number | null = e?.y || null;

  const enemyPositionX = enemy?.char.sprite.x || null;
  const enemyPositionY = enemy?.char.sprite.y || null;

  const enemyVelocyX = enemy?.char.sprite.body.velocity.x || null;
  const enemyVelocyY = enemy?.char.sprite.body.velocity.y || null;

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

    // DIFF SPRITE VELOCITIES
    player.char.sprite.body.velocity.x - enemyVelocyX,
    player.char.sprite.body.velocity.y - enemyVelocyY,

    // DIFF SPRITE AE POSITIONS
    enemyAEX === null ? 0 : player.char.sprite.body.position.x - enemyAEX,
    enemyAEY === null ? 0 : player.char.sprite.body.position.y - enemyAEY,

    // DIFF SPRITE AP POSITIONS
    enemyAPX === null ? 0 : player.char.sprite.body.position.x - enemyAPX,
    enemyAPY === null ? 0 : player.char.sprite.body.position.y - enemyAPY,

    // TOUCHING
    player.char.sprite.body.touching.up ? 1 : 0,
    player.char.sprite.body.touching.down ? 1 : 0,
    player.char.sprite.body.touching.left ? 1 : 0,
    player.char.sprite.body.touching.right ? 1 : 0,

    // FACING
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
  if (!game.debug.NNetTrainP1) {
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

  const e_or_null = getNearestPlayerAliveFromXY(
    player.char.sprite.body.position.x,
    player.char.sprite.body.position.y,
    game
  );

  const enemy: Player | null = e_or_null?.player || null;

  const EAE_XY = getNearestAttackEnergyXYFromPlayer(player, 0, game);

  const enemyAttackEnergyX: number | null = EAE_XY?.x || null;
  const enemyAttackEnergyY: number | null = EAE_XY?.y || null;

  const eap_XY = getNearestPlayerFromPlayer(player, 0, game);

  const enemyAttackPhysicalX = eap_XY?.player?.char.sprite.x || null;
  const enemyAttackPhysicalY = eap_XY?.player?.char.sprite.y || null;

  let isPFacingEnemy: boolean = false;
  if (enemy !== null) {
    if (player.char.sprite.x < enemy.char.sprite.x) {
      if (player.char.sprite.flipX) {
        isPFacingEnemy = true;
      }
    } else {
      if (!player.char.sprite.flipX) {
        isPFacingEnemy = true;
      }
    }
  }

  const newNNObject: NNObject = {
    input: [
      // STATES
      player.emitterPlayer.on ? 1 : 0,
      player.char.powerStateCurr.name === 'none' ? 0 : 1,
      player.state.name === 'player-state-hurt' ? 1 : 0,

      // BUTTONS
      player.padCurr.up ? 1 : 0,
      player.padCurr.down ? 1 : 0,
      player.padCurr.left ? 1 : 0,
      player.padCurr.right ? 1 : 0,
      player.padCurr.A ? 1 : 0,
      player.padCurr.B ? 1 : 0,
      player.padCurr.X ? 1 : 0,
      player.padCurr.Y ? 1 : 0,
      player.padPrev.up ? 1 : 0,
      player.padPrev.down ? 1 : 0,
      player.padPrev.left ? 1 : 0,
      player.padPrev.right ? 1 : 0,
      player.padPrev.A ? 1 : 0,
      player.padPrev.B ? 1 : 0,
      player.padPrev.X ? 1 : 0,
      player.padPrev.Y ? 1 : 0,
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
      enemy === null ? 0 : player.char.sprite.x - enemy.char.sprite.x,
      enemy === null ? 0 : player.char.sprite.y - enemy.char.sprite.y,

      // DIFF SPRITE VELOCITIES
      enemy === null
        ? 0
        : player.char.sprite.body.velocity.x -
          enemy.char.sprite.body.velocity.x,
      enemy === null
        ? 0
        : player.char.sprite.body.velocity.y -
          enemy.char.sprite.body.velocity.y,

      // DIFF SPRITE AE POSITIONS
      enemyAttackEnergyX === null
        ? 0
        : player.char.sprite.body.position.x - enemyAttackEnergyX,
      enemyAttackEnergyY === null
        ? 0
        : player.char.sprite.body.position.y - enemyAttackEnergyY,

      // DIFF SPRITE AP POSITIONS
      player.char.sprite.body.position.x - enemyAttackPhysicalX,
      player.char.sprite.body.position.y - enemyAttackPhysicalY,

      // TOUCHING
      player.char.sprite.body.touching.up ? 1 : 0,
      player.char.sprite.body.touching.down ? 1 : 0,
      player.char.sprite.body.touching.left ? 1 : 0,
      player.char.sprite.body.touching.right ? 1 : 0,

      // FACING
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
  if (!game.debug.NNetTrainP1) {
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

import { NeuralNetwork } from 'brain.js';
import {
  getBarsFromPercent,
  nodeEnvIsProduction,
  print,
  saveNeuralNetwork,
} from '../../views/client';
import SmashedGame from '../SmashedGame';
import {
  InputType,
  InputTypeBot,
  InputTypeKeyboard,
  InputTypeNNClient,
  InputTypeNNExpress,
  InputTypePad,
  NNObject,
  Player,
  PlayerIndexAndScore,
  inputTypeNNExpress,
} from '../types';
import {
  getNumberOfDeathsGiven,
  getNumberOfDeathsTaken,
  getNumberOfHitsGiven,
  getNumberOfHitsTaken,
  getNumberOfShotsGiven,
  getNumberOfShotsTaken,
} from './damage';
import { normalRandom } from './math';
import {
  getNearestAttackEnergyXYFromPlayer,
  getNearestAttackPhysicalXYFromPlayer,
  getNearestPlayerAliveFromPlayer,
  getNearestPlayerFromPlayer,
  getPercentOfScreenTravelled,
  getPlayerLRBalanced,
  getPlayerXYBalanced,
  updatePlayerControllerCountersAndPositionCounters,
} from './movement';
import { nnJsonNNClient } from './nnJson';

/////////////////////////////////
// CLIENT
/////////////////////////////////
export const nnConfigNNClient = {
  hiddenLayers: [100],
  useGpu: true,
};
export const NNRatiosNNClient: number[] = [
  0.07072905331882481, 0.21201975391311625, 0.5024273876286934,
  0.4975726123713066, 0.06851092324432911, 0.3027538294132418,
  0.35364526659412404, 0.05285845819034067,
];
/////////////////////////////////
// EXPRESS
/////////////////////////////////
export const nnConfigNNExpress = nnConfigNNClient;
export const NNRatiosNNExpress: number[] = NNRatiosNNClient;

export const nnNumTrainingBarTicks: number = 25;

export const NNTrainNN = async (game: SmashedGame): Promise<void> => {
  if (!game.debug.NN_Train_Static) {
    return;
  }

  if (isFirstPlayerAnExpressNeuralNetwork(game)) {
    return;
  }

  game.nnExpressNets = [new NeuralNetwork(nnConfigNNExpress)];

  if (!game.debug.NN_Brand_New) {
    const nnjson = nnJsonNNClient;

    if (nnjson === null) {
      print('nnjson === null');
      return;
    }

    game.nnExpressNets = [game.nnExpressNets[0].fromJSON(nnjson)];
  }

  print('NNTrain');

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
  await game.nnExpressNets[0].trainAsync(randomizedNnObjects, {
    iterations: numIter,
    randomize: true,
    learningRate: game.debug.NN_Brand_New ? 0.00001 : 0.0000001,
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

  print('game.nnNet after train', game.nnExpressNets);
  const netJson = game.nnExpressNets[0].toJSON();
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
  game: SmashedGame,
  isForTraining: boolean
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

  const t: boolean = isForTraining;

  const nnInput: number[] = [
    // STATES
    player.emitterPlayer.on ? 1 : 0,
    player.char.powerStateCurr.name === 'none' ? 0 : 1,
    player.state.name === 'player-state-hurt' ? 1 : 0,

    // BUTTONS

    t ? (pPrev.up ? 1 : 0) : pCurr.up ? 1 : 0,
    t ? (pPrev.down ? 1 : 0) : pCurr.down ? 1 : 0,
    t ? (pPrev.left ? 1 : 0) : pCurr.left ? 1 : 0,
    t ? (pPrev.right ? 1 : 0) : pCurr.right ? 1 : 0,
    t ? (pPrev.A ? 1 : 0) : pCurr.A ? 1 : 0,
    t ? (pPrev.B ? 1 : 0) : pCurr.B ? 1 : 0,
    t ? (pPrev.X ? 1 : 0) : pCurr.X ? 1 : 0,
    t ? (pPrev.Y ? 1 : 0) : pCurr.Y ? 1 : 0,

    // pCurr.up ? 1 : 0,
    // pCurr.down ? 1 : 0,
    // pCurr.left ? 1 : 0,
    // pCurr.right ? 1 : 0,
    // pCurr.A ? 1 : 0,
    // pCurr.B ? 1 : 0,
    // pCurr.X ? 1 : 0,
    // pCurr.Y ? 1 : 0,

    // pPrev.up ? 1 : 0,
    // pPrev.down ? 1 : 0,
    // pPrev.left ? 1 : 0,
    // pPrev.right ? 1 : 0,
    // pPrev.A ? 1 : 0,
    // pPrev.B ? 1 : 0,
    // pPrev.X ? 1 : 0,
    // pPrev.Y ? 1 : 0,

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
  game: SmashedGame,
  inputType_NN: InputTypeNNClient | InputTypeNNExpress
): void => {
  const nnInput = NNGetInputArrayFromWorld(player, playerIndex, game, false);
  let nnOutput: number[] | null = null;
  let ratioThresh: number[] | null = null;

  const numPlayersBelowMeWithSameNNType = () => {
    let num = 0;
    game.players.forEach((p, i) => {
      if (i < playerIndex && p.inputType === inputType_NN) {
        num++;
      }
    });
    return num;
  };

  const nnIndexToUse = numPlayersBelowMeWithSameNNType();
  updatePlayerControllerCountersAndPositionCounters(player);

  switch (inputType_NN) {
    case 4:
      ratioThresh = NNRatiosNNClient;
      nnOutput = game.nnClientNets[nnIndexToUse].run(nnInput);
      break;
    case 5:
      ratioThresh = NNRatiosNNExpress;
      nnOutput = game.nnExpressNets[nnIndexToUse].run(nnInput);
      break;
    default:
      throw new Error('inputType_NN not recognized');
  }

  if (nnOutput === null) {
    throw new Error('nnOutput === null');
  }

  // let canChangeDirection = false;
  // const amt = 8;
  // if (player.padDebounced.left > amt || player.padDebounced.right > amt) {
  //   canChangeDirection = true;
  // }

  // if (canChangeDirection) {
  //   const padPrev = player.padPrev;
  //   const padPrevRight = padPrev.right;
  //   const padPrevLeft = padPrev.left;

  //   const shouldGoLeft = nnOutput[2] > nnOutput[3];

  // }

  player.padCurr.up = nnOutput[0] > ratioThresh[0];
  player.padCurr.down = nnOutput[1] > ratioThresh[1];

  player.padCurr.left = nnOutput[2] > ratioThresh[2];
  player.padCurr.right = !player.padCurr.left;
  // player.padCurr.left = nnOutput[2] > ratioThresh[2];
  // player.padCurr.right = nnOutput[3] > ratioThresh[3];

  player.padCurr.A = nnOutput[4] > ratioThresh[4];
  player.padCurr.B = nnOutput[5] > ratioThresh[5];
  player.padCurr.X = nnOutput[6] > ratioThresh[6];
  player.padCurr.Y = nnOutput[7] > ratioThresh[7];
};

export const isNNTrainingObjectOk = (nnObject: NNObject): boolean => {
  for (let i = 0; i < nnObject.input.length; i++) {
    if (typeof nnObject.input[i] !== 'number' || isNaN(nnObject.input[i])) {
      return false;
    }
  }

  for (let i = 0; i < nnObject.output.length; i++) {
    if (typeof nnObject.output[i] !== 'number' || isNaN(nnObject.output[i])) {
      return false;
    }
  }

  return true;
};

export const addToNNTrainingArray = (game: SmashedGame): void => {
  if (!game.debug.NN_Train_Static) {
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

  if (isFirstPlayerAnExpressNeuralNetwork(game)) {
    return;
  }

  const player: Player = game.players[playerIndex];

  // SKIP IF PLAYER IS NOT MOVING
  if (
    (player.padCurr.left && player.padCurr.right) ||
    (!player.padCurr.left && !player.padCurr.right)
  ) {
    return;
  }

  const inputArray = NNGetInputArrayFromWorld(player, playerIndex, game, true);
  const outputArray = NNGetOutputArrayFromWorld(player, playerIndex, game);

  const newNNObject: NNObject = {
    input: inputArray,
    output: outputArray,
  };

  if (!isNNTrainingObjectOk(newNNObject)) {
    print('BAD | newNNObject', newNNObject);
    return;
  }

  // print statement that overwrites itself
  print('newNNObject', JSON.stringify(newNNObject, null, 2));

  game.nnObjects.push(newNNObject);
};

export const isFirstPlayerAnExpressNeuralNetwork = (
  game: SmashedGame
): boolean => {
  return game.players[0].inputType === 5;
};

export const deleteLastNNObjects = (
  player: Player,
  playerIndex: number,
  numToDelete: number,
  game: SmashedGame
): void => {
  if (!game.debug.NN_Train_Static) {
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

interface NeuralNetworkJsonPartial {
  layers: Array<{
    weights: number[][];
    biases: number[];
  }>;
}

export function printWeightsAndBiases(nn: NeuralNetworkJsonPartial): void {
  nn.layers.forEach((layer, layerIndex) => {
    console.log(`Layer ${layerIndex + 1}:`);
    console.log(`  Weights:`);
    layer.weights.forEach((weightChunk: number[], weightChunkIndex) => {
      console.log(`    WeightChunkIndex: ${weightChunkIndex + 1}}`);

      weightChunk.forEach((weight, weightIndex) => {
        console.log(`      Weight ${weightIndex + 1}: ${weight}`);
      });
    });
    console.log(`  Biases:`);
    layer.biases.forEach((bias, biasIndex) => {
      console.log(`    Bias ${biasIndex + 1}: ${bias}`);
    });
  });
}

export const getNewModifiedWeights = (
  nn: NeuralNetworkJsonPartial,
  index_of_type: number
): NeuralNetworkJsonPartial => {
  if (!nn) {
    throw new Error('nn is null');
  }

  const maxPlayerIndex = 3;
  const exponent = 3;
  const modAmt =
    Math.pow(index_of_type, exponent) / Math.pow(maxPlayerIndex, exponent);

  const newNNJson: NeuralNetworkJsonPartial = JSON.parse(JSON.stringify(nn));

  newNNJson.layers.forEach((layer) => {
    layer.weights.forEach((weightChunk: number[]) => {
      weightChunk.forEach((weight, weightIndex) => {
        weightChunk[weightIndex] += weight * normalRandom(0, modAmt);
      });
    });
    layer.biases.forEach((bias, biasIndex) => {
      layer.biases[biasIndex] += bias * normalRandom(0, modAmt);
    });
  });

  return newNNJson;
};

export const getNumberOfInputTypeFromGame = (
  game: SmashedGame,
  inputType:
    | InputTypeNNClient
    | InputTypeNNExpress
    | InputTypeBot
    | InputTypeKeyboard
    | InputTypePad
): number => {
  let num = 0;

  game.players.forEach((player) => {
    if (player.inputType === inputType) {
      num++;
    }
  });

  return num;
};

export const getNumberOfInputTypeUnderMeFromGame = (
  game: SmashedGame,
  playerIndex: number,
  inputType: InputType
): number => {
  let num = 0;

  for (let i = 0; i < playerIndex; i++) {
    if (i === playerIndex) {
      break;
    }

    if (game.players[i].inputType === inputType) {
      num++;
    }
  }

  return num;
};

export const getNumberOfNeuralNetworkTypeFromInputArray = (
  inputs: InputType[],
  nn_Type: InputTypeNNClient | InputTypeNNExpress
): number => {
  let num = 0;

  inputs.forEach((input) => {
    // @ts-ignore
    if (input === nn_Type) {
      num++;
    }
  });

  return num;
};

export const getNeuralNetworkBestInstancePlayerIndex = (
  game: SmashedGame,
  inputType: InputTypeNNExpress
): PlayerIndexAndScore | null => {
  let bestIndexCurr: number | null = null;
  let bestScoreCurr: number | null = null;

  const numOfNNType = getNumberOfInputTypeFromGame(game, inputType);
  let nnIndexOfType: InputType | null = null;

  if (numOfNNType === 0) {
    return null;
  }

  for (let playerIndex = 0; playerIndex < game.players.length; playerIndex++) {
    const player = game.players[playerIndex];

    if (player.inputType === inputType) {
      if (nnIndexOfType === null) {
        nnIndexOfType = 0;
      } else {
        nnIndexOfType++;
      }

      if (bestIndexCurr === null || bestScoreCurr === null) {
        bestIndexCurr = playerIndex;
        bestScoreCurr = getRatingOfInstance(game, playerIndex, inputType);
      } else {
        const newScore = getRatingOfInstance(game, playerIndex, inputType);

        if (newScore > bestScoreCurr) {
          bestIndexCurr = playerIndex;
          bestScoreCurr = newScore;
        }
      }
    }
  }

  if (bestIndexCurr === null || bestScoreCurr === null) {
    return null;
  }

  return {
    playerIndex: bestIndexCurr,
    score: bestScoreCurr,
  };
};

export const getRatingOfInstance = (
  game: SmashedGame,
  playerIndex: number,
  inputType: InputType
): number => {
  const shotsGiven = getNumberOfShotsGiven(playerIndex, game);
  const shotsTaken = getNumberOfShotsTaken(playerIndex, game);
  const deathsGiven = getNumberOfDeathsGiven(playerIndex, game);
  const deathsTaken = getNumberOfDeathsTaken(playerIndex, game);
  const hitsGiven = getNumberOfHitsGiven(playerIndex, game);
  const hitsTaken = getNumberOfHitsTaken(playerIndex, game);
  const playerIndexOfInputType = getNumberOfInputTypeUnderMeFromGame(
    game,
    playerIndex,
    inputType
  );

  const player = game.players[playerIndex];

  const balanceXY = getPlayerXYBalanced(player, playerIndex, game);
  const balanceLR = getPlayerLRBalanced(player, playerIndex, game);
  const { percentX } = getPercentOfScreenTravelled(player, playerIndex, game);

  const timeRatio: number =
    playerIndexOfInputType === 0 && inputType === inputTypeNNExpress
      ? 1
      : getNNReductionRatioFromGame(game);

  const shot_w = 0;
  const death_w = 2;
  const hit_w = 1;

  const shot_give = 0;
  const shot_take = 0;
  const death_give = 3;
  const death_take = -1;
  const hit_give = 3;
  const hit_take = -1;

  const scoreActions =
    shot_w * shot_give * shotsGiven +
    shot_w * shot_take * shotsTaken +
    death_w * death_give * deathsGiven +
    death_w * death_take * deathsTaken +
    hit_w * hit_give * hitsGiven +
    hit_w * hit_take * hitsTaken;

  const scoreXY = 1 - balanceXY.error;
  const scoreLR = 1 - balanceLR.error;
  const scorePercentX = percentX;
  const scoreTime = timeRatio;

  let rating: number | null = null;
  if (scoreActions >= 0) {
    rating = scoreActions * scoreXY * scoreLR * scorePercentX * scoreTime;
  } else {
    rating = 0;
  }

  player.nnRating = rating;

  if (!nodeEnvIsProduction) {
    const maxRating = findMaxNNRating(game);
    const bars = getBarsFromPercent(rating / maxRating);

    print(playerIndex, 'NN Rating', bars, Math.round(rating));
  }

  return rating;
};

export const replaceNNExpressWithNNClient = async (): Promise<void> => {
  const clientNNJson = nnJsonNNClient;

  await saveNeuralNetwork(clientNNJson);
};

export const getNNReductionRatioFromGame = (game: SmashedGame): number => {
  const minutes: number = game.gameSeconds / 60;

  return getNNTimeRatioFromMinutes(minutes);
};

export function getNNTimeRatioFromMinutes(minutes: number): number {
  return minutes / (1 + minutes);
}

export const getFirstPlayerIndexThatIsOfInputType = (
  game: SmashedGame,
  inputType: InputType
): number | null => {
  for (let i = 0; i < game.players.length; i++) {
    if (game.players[i].inputType === inputType) {
      return i;
    }
  }

  return null;
};

export const findMaxNNRating = (game: SmashedGame): number => {
  let maxRating = -999999;

  for (let i = 0; i < game.players.length; i++) {
    const player = game.players[i];

    if (player.nnRating === null) {
      continue;
    }

    if (player.nnRating > maxRating) {
      maxRating = player.nnRating;
    }
  }

  return maxRating;
};

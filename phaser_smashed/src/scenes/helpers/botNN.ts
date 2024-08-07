import SmashedGame from '../SmashedGame';
import {
  InputType,
  InputTypeBot,
  InputTypeNNClient,
  InputTypeNNExpress,
  Player,
  Velocity,
} from '../types';
import {
  allPadToFalse,
  getIsBotInPitArea,
  getIsBotInPitAreaLeft,
  getIsBotInPitAreaRight,
  getIsBotTooFarLeft,
  getIsBotTooFarMiddleLeft,
  getIsBotTooFarMiddleRight,
  getIsBotTooFarRight,
  getIsBotTooFarUp,
} from './botRB';
import { NNSetPlayerPadStatic, getRatingOfInstance } from './nn';

export function updateBotNN(
  player: Player,
  playerIndex: number,
  game: SmashedGame,
  inputType: InputTypeNNClient | InputTypeNNExpress
): void {
  const padCurr = player.padCurr;
  if (game.gameState.nameCurr !== 'game-state-play') {
    if (game.timeSeconds % 2 === 0) {
      allPadToFalse(player);
    } else {
      padCurr.L = true;
    }
    return;
  }

  NNSetPlayerPadStatic(player, playerIndex, game, inputType);

  const pVelocity: Velocity = player.char.sprite.body.velocity;

  ////////////////////////////////
  // EVERYTHING HERE HELPS OUT
  // THE NN TO NOT DO STUPID STUFF
  ////////////////////////////////

  //////////////////////
  // TOO FAR LEFT RIGHT CENTER
  //////////////////////
  if (game.debug.NN_Help_Centerize) {
    const r = 0.01;
    if (
      Math.round(game.gameSeconds / 2) % 2 === playerIndex % 2 &&
      Math.random() > r
    ) {
      if (getIsBotTooFarMiddleLeft(player, game)) {
        padCurr.right = true;
        padCurr.left = false;
      } else if (getIsBotTooFarMiddleRight(player, game)) {
        padCurr.left = true;
        padCurr.right = false;
      }
    }
  }

  //////////////////////
  // LEFT SIDE OF PIT
  //////////////////////
  if (game.debug.NN_Help_Pit && getIsBotInPitArea(player, game)) {
    if (pVelocity.y >= 0) {
      padCurr.X = Math.random() > 0.5;

      if (getIsBotInPitAreaLeft(player, game)) {
        padCurr.left = true;
        padCurr.right = false;
      }
      if (getIsBotInPitAreaRight(player, game)) {
        padCurr.left = false;
        padCurr.right = true;
      }
    }

    padCurr.up = true;
    padCurr.down = false;
  }

  //////////////////////
  // IF BOT IS TOUCHING LEFT OR RIGHT, JUMP
  //////////////////////
  if (game.debug.NN_Help_Wall) {
    if (
      player.char.sprite.body.touching.right ||
      player.char.sprite.body.touching.left
    ) {
      if (Math.random() > 0.98) {
        padCurr.Y = !padCurr.Y;
      }
    }
  }

  //////////////////////
  // HELP SCREEN
  //////////////////////
  if (game.debug.NN_Help_Screen) {
    //////////////////////
    // TOO FAR LEFT RIGHT
    //////////////////////
    if (getIsBotTooFarLeft(player, game)) {
      padCurr.right = true;
      padCurr.left = false;
      padCurr.B = false;
      padCurr.X = false;
      padCurr.A = false;
    } else if (getIsBotTooFarRight(player, game)) {
      padCurr.left = true;
      padCurr.right = false;
      padCurr.B = false;
      padCurr.X = false;
      padCurr.A = false;
    }

    //////////////////////
    // TOO FAR UP
    //////////////////////
    if (getIsBotTooFarUp(player, game)) {
      // print('toofar high');

      padCurr.down = true;
      padCurr.up = false;
      padCurr.A = false;
      padCurr.B = false;
      padCurr.X = false;
      padCurr.Y = false;
    }
  }

  const score = getRatingOfInstance(game, playerIndex, inputType);

  // print('score: ' + score);
}

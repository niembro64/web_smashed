import Game from '../Game';
import { Player, Velocity } from '../interfaces';
import {
  allPadToFalse, getIsBotInPitAreaLeft,
  getIsBotInPitAreaRight, getIsBotTooFarLeft,
  getIsBotTooFarRight,
  getIsBotTooFarUp
} from './bot';
import { NNSetPlayerPad } from './nn';

export function updateBotNN(
  player: Player,
  playerIndex: number,
  game: Game
): void {
  let p = player.padCurr;
  if (game.gameState.nameCurr !== 'game-state-play') {
    if (game.timeSeconds % 2 === 0) {
      allPadToFalse(player);
    } else {
      p.L = true;
    }
    return;
  }

  NNSetPlayerPad(player, playerIndex, game);

  let helpNNBot = true;
  if (!helpNNBot) {
    return;
  }

  let pVelocity: Velocity = player.char.sprite.body.velocity;

  let jumps = player.char.jumps;
  let jumpIndex = player.char.jumpIndex;
  let onLastJump = jumpIndex === jumps.length - 1;

  //////////////////////
  // TOO FAR LEFT RIGHT
  //////////////////////
  if (getIsBotTooFarLeft(player, game) && Math.random() > 0.01) {
    p.right = true;
    p.left = false;
  } else if (getIsBotTooFarRight(player, game) && Math.random() > 0.01) {
    p.left = true;
    p.right = false;
  }

  //////////////////////
  // TOO FAR UP
  //////////////////////
  if (getIsBotTooFarUp(player, game) && Math.random() > 0.01) {
    p.Y = false;
    p.down = true;
    p.up = false;
  } else {
    p.down = false;
  }

  //////////////////////
  // LEFT SIDE OF PIT
  //////////////////////
  if (
    pVelocity.y > 0 &&
    onLastJump &&
    getIsBotInPitAreaLeft(player, game) &&
    Math.random() > 0.01
  ) {
    p.left = true;
    p.right = false;
  }

  //////////////////////
  // RIGHT SIDE OF PIT
  //////////////////////
  if (
    pVelocity.y > 0 &&
    onLastJump &&
    getIsBotInPitAreaRight(player, game) &&
    Math.random() > 0.01
  ) {
    p.right = true;
    p.left = false;
  }
}

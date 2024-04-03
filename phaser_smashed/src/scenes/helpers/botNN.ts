import Game from '../Game';
import { Player, Velocity } from '../interfaces';
import {
  allPadToFalse,
  getIsBotInPitAreaLeft,
  getIsBotInPitAreaRight,
  getIsBotTooFarCenterLeft,
  getIsBotTooFarCenterRight,
  getIsBotTooFarUp,
} from './botRB';
import { NNSetPlayerPadStatic } from './nn';

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

  NNSetPlayerPadStatic(player, playerIndex, game);

  let helpNNBot = true;
  if (!helpNNBot) {
    return;
  }

  const pVelocity: Velocity = player.char.sprite.body.velocity;

  const jumps = player.char.jumps;
  const jumpIndex = player.char.jumpIndex;
  const onLastJump = jumpIndex === jumps.length - 1;

  let allow = false;

  if (playerIndex % 2 === 0) {
    allow = game.timeSeconds % 2 === 0;
  } else {
    allow = game.timeSeconds % 2 === 1;
  }

  //////////////////////
  // TOO FAR LEFT RIGHT
  //////////////////////
  if (getIsBotTooFarCenterLeft(player, game) && Math.random() > 0.5 && allow) {
    p.right = true;
    p.left = false;
    p.Y = Math.random() > 0.5;
  } else if (
    getIsBotTooFarCenterRight(player, game) &&
    Math.random() > 0.5 &&
    allow
  ) {
    p.left = true;
    p.right = false;
    p.Y = Math.random() > 0.5;
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

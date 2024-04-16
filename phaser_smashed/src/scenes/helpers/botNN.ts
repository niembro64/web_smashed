import Game from '../Game';
import { Player, Velocity } from '../interfaces';
import {
  allPadToFalse,
  getIsBotInPitAreaLeft,
  getIsBotInPitAreaRight,
  getIsBotTooFarCenterLeft,
  getIsBotTooFarCenterRight,
  getIsBotTooFarLeft,
  getIsBotTooFarMiddleLeft,
  getIsBotTooFarMiddleRight,
  getIsBotTooFarRight,
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

  if (!game.debug.NNHelpBot) {
    return;
  }
  const pVelocity: Velocity = player.char.sprite.body.velocity;
  const jumps = player.char.jumps;
  const jumpIndex = player.char.jumpIndex;
  const onLastJump = jumpIndex === jumps.length - 1;
  // //////////////////////
  // // TOO FAR LEFT RIGHT CENTER
  // //////////////////////
  const r = 0.01;
  if (
    Math.round(game.gameSeconds / 2) % 2 === playerIndex % 2 &&
    Math.random() > r
  ) {
    if (getIsBotTooFarMiddleLeft(player, game)) {
      p.right = true;
      p.left = false;
    } else if (getIsBotTooFarMiddleRight(player, game)) {
      p.left = true;
      p.right = false;
    }
  }
  //////////////////////
  // TOO FAR LEFT RIGHT
  //////////////////////
  if (getIsBotTooFarLeft(player, game)) {
    p.right = true;
    p.left = false;
  } else if (getIsBotTooFarRight(player, game)) {
    p.left = true;
    p.right = false;
  }
  //////////////////////
  // TOO FAR UP
  //////////////////////
  if (getIsBotTooFarUp(player, game) && Math.random() > 0.1) {
    p.Y = false;
    p.down = true;
    p.up = false;
  } else {
    p.down = false;
  }
  //////////////////////
  // LEFT SIDE OF PIT
  //////////////////////
  if (pVelocity.y >= 0 && getIsBotInPitAreaLeft(player, game)) {
    p.X = !p.X;
  }
  if (pVelocity.y >= 0 && onLastJump && getIsBotInPitAreaLeft(player, game)) {
    p.left = true;
    p.right = false;
  }
  //////////////////////
  // RIGHT SIDE OF PIT
  //////////////////////
  if (pVelocity.y >= 0 && getIsBotInPitAreaRight(player, game)) {
    p.X = !p.X;
  }
  if (pVelocity.y >= 0 && onLastJump && getIsBotInPitAreaRight(player, game)) {
    p.right = true;
    p.left = false;
  }

  //////////////////////
  // IF BOT IS TOUCHING LEFT OR RIGHT, JUMP
  //////////////////////
  if (
    player.char.sprite.body.touching.right ||
    player.char.sprite.body.touching.left
  ) {
    if (Math.random() > 0.3) {
      p.Y = !p.Y;
    }
  }
}

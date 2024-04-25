import Game from '../Game';
import { Player, Velocity } from '../interfaces';
import {
  allPadToFalse,
  getIsBotInPitAreaLeft,
  getIsBotInPitAreaRight,
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
  const p = player.padCurr;
  if (game.gameState.nameCurr !== 'game-state-play') {
    if (game.timeSeconds % 2 === 0) {
      allPadToFalse(player);
    } else {
      p.L = true;
    }
    return;
  }

  NNSetPlayerPadStatic(player, playerIndex, game);

  const pVelocity: Velocity = player.char.sprite.body.velocity;
  const jumps = player.char.jumps;
  const jumpIndex = player.char.jumpIndex;
  const onLastJump = jumpIndex === jumps.length - 1;

  ////////////////////////////////
  // EVERYTHING HERE HELPS OUT
  // THE NN TO NOT DO STUPID STUFF
  ////////////////////////////////

  if (game.debug.NNHelpScreen) {
    //////////////////////
    // TOO FAR LEFT RIGHT
    //////////////////////
    if (getIsBotTooFarLeft(player, game)) {
      p.right = true;
      p.left = false;
      p.B = false;
    } else if (getIsBotTooFarRight(player, game)) {
      p.left = true;
      p.right = false;
      p.B = false;
    }

    //////////////////////
    // TOO FAR UP
    //////////////////////
    if (getIsBotTooFarUp(player, game) && Math.random() > 0.1) {
      p.Y = false;
      p.down = true;
      p.up = false;
      p.B = false;
    }
  }

  //////////////////////
  // TOO FAR LEFT RIGHT CENTER
  //////////////////////
  if (game.debug.NNHelpCenterize) {
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
  }

  //////////////////////
  // LEFT SIDE OF PIT
  //////////////////////
  if (game.debug.NNHelpPit) {
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
    if (
      pVelocity.y >= 0 &&
      onLastJump &&
      getIsBotInPitAreaRight(player, game)
    ) {
      p.right = true;
      p.left = false;
    }
  }

  //////////////////////
  // IF BOT IS TOUCHING LEFT OR RIGHT, JUMP
  //////////////////////

  if (game.debug.NNHelpWall) {
    if (
      player.char.sprite.body.touching.right ||
      player.char.sprite.body.touching.left
    ) {
      if (Math.random() > 0.3) {
        p.Y = !p.Y;
      }
    }
  }
}

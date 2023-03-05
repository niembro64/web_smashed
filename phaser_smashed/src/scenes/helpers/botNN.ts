import Game from '../Game';
import { Player, Position, Velocity, xyVector } from '../interfaces';
import { getIsPlayerInAir } from './attacks';
import {
  allPadToFalse,
  getIsBotFacingNearestPlayer,
  getIsBotInPitAreaLeft,
  getIsBotInPitAreaRight,
  getIsBotNearNearestPlayer,
  getIsBotTooFarLeft,
  getIsBotTooFarRight,
  getIsBotTooFarUp,
  getIsNearestAttackEnergyThisCloseAbove,
  getSameHorizontalSlice,
  getSameVerticalSlice,
  updatePlayerDodgeIfAttackEnergyTooClose,
} from './bot';
import { getNormalizedVector } from './damage';
import {
  getDistance,
  getNearestPlayerAliveXY,
  hasPlayerTouchedWallRecently,
} from './movement';
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

  let helpNNBot = false;
  if (!helpNNBot) {
    return;
  }

  let nearestP: Position = getNearestPlayerAliveXY(player, playerIndex, game);

  let botSprite = player.char.sprite;

  let enemyVector: xyVector = getNormalizedVector(
    botSprite.x,
    botSprite.y,
    nearestP.x,
    nearestP.y
  );

  let pVelocity: Velocity = player.char.sprite.body.velocity;

  let d = player.padDebounced;
  let t = player.char.sprite.body.touching;
  let jumps = player.char.jumps;
  let jumpIndex = player.char.jumpIndex;
  let hasJump = player.char.jumps[jumpIndex] > 0.3;
  let onLastJump = jumpIndex === jumps.length - 1;

  let nearestPDistance = getDistance(
    botSprite.x,
    botSprite.y,
    nearestP.x,
    nearestP.y
  );

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

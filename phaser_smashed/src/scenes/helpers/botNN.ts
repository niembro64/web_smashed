import Game from '../Game';
import { Player, Position, Velocity, xyVector } from '../interfaces';
import { getIsPlayerInAir } from './attacks';
import { allPadToFalse, getIsBotFacingNearestPlayer, getIsBotInPitAreaLeft, getIsBotInPitAreaRight, getIsBotNearNearestPlayer, getIsBotTooFarLeft, getIsBotTooFarRight, getIsBotTooFarUp, getIsNearestAttackEnergyThisCloseAbove, getSameHorizontalSlice, getSameVerticalSlice, updatePlayerDodgeIfAttackEnergyTooClose } from './bot';
import { getNormalizedVector } from './damage';
import { getDistance, getNearestPlayerAliveXY, hasPlayerTouchedWallRecently } from './movement';
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

  if (player.inputType === 4) {
    // console.log('playerIndex', playerIndex, 'inputType', player.inputType);
    NNSetPlayerPad(player, playerIndex, game);
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

  // p.select = true;
  // p.L = true;

  //////////////////////
  // DODGING
  //////////////////////
  updatePlayerDodgeIfAttackEnergyTooClose(player, playerIndex, game);

  //////////////////////
  // MOVEMENT
  //////////////////////
  if (getSameVerticalSlice(player, game)) {
  } else {
    if (enemyVector.x > 0) {
      p.right = true;
      p.left = false;
    } else {
      p.left = true;
      p.right = false;
    }
  }

  //////////////////////
  // MOVE TO FLAG | TOUCHING
  //////////////////////
  if (!game.flag.completedCurr) {
    ///////////////////////
    // ON GROUND
    ///////////////////////
    if (t.down && Math.random() > 0.1) {
      if (botSprite.x < game.flag.spriteFlagPole.x - botSprite.width * 0.2) {
        p.right = true;
        p.left = false;
      } else if (
        botSprite.x >
        game.flag.spriteFlagPole.x + botSprite.width * 0.4
      ) {
        p.left = true;
        p.right = false;
      } else {
        if (
          !getIsBotFacingNearestPlayer(player, playerIndex, game) &&
          getIsBotNearNearestPlayer(player, playerIndex, game, 200) &&
          Math.random() > 0.99
        ) {
          p.right = !p.right;
          p.left = !p.right;
        } else {
          p.right = false;
          p.left = false;
        }
      }
    }
    ///////////////////////
    // IN AIR
    ///////////////////////
    if (
      !t.down &&
      Math.random() > (game.flag.toucherCurr.id === null ? 0.95 : 0.7)
    ) {
      if (botSprite.x < game.flag.spriteFlagPole.x - 300) {
        p.right = true;
        p.left = false;
      }
    }
  }

  //////////////////////
  // MOVE TO FLAG | AIR
  //////////////////////
  // if (!game.flag.completedCurr && !t.down) {
  //   if (botSprite.x < game.flag.spriteFlagPole.x - 200) {
  //     p.right = true;
  //     p.left = false;
  //   } else if (botSprite.x > game.flag.spriteFlagPole.x + 200) {
  //     p.left = true;
  //     p.right = false;
  //   } else {
  //     p.right = false;
  //     p.left = false;
  //   }
  // }

  if (
    //////////////////////
    // WALL JUMPING
    //////////////////////
    (t.left || t.right) &&
    hasPlayerTouchedWallRecently(player) &&
    Math.random() > 0.01
  ) {
    p.Y = p.Y ? false : true;
  } else if (
    //////////////////////
    // JUMPING OFF GROUND
    //////////////////////
    pVelocity.x < 50 &&
    pVelocity.x > -50 &&
    (d.left === 9 || d.right === 9) &&
    t.down &&
    Math.random() > 0.01
  ) {
    p.Y = !p.Y;
    // p.Y = true;
  } else if (
    //////////////////////
    // AIR JUMPING
    //////////////////////
    enemyVector.y < 0 &&
    pVelocity.y > 0 &&
    Math.random() > 0.9
  ) {
    p.Y = true;
  } else if (
    //////////////////////
    // JUMPING AWAY FROM AE
    //////////////////////
    !getIsPlayerInAir(player) &&
    getIsNearestAttackEnergyThisCloseAbove(player, playerIndex, game, 200) &&
    Math.random() > 0.01
  ) {
    p.A = !p.A;
  } else {
    p.Y = false;
  }

  //////////////////////
  // ENERGY ATTACK
  //////////////////////
  if (
    !getSameHorizontalSlice(player, game) &&
    !getIsBotNearNearestPlayer(player, playerIndex, game, 200) &&
    getIsBotFacingNearestPlayer(player, playerIndex, game) &&
    Math.random() > 0.01
  ) {
    p.X = true;
  } else {
    p.X = false;
  }

  //////////////////////
  // PHYSICAL ATTACK
  //////////////////////
  if (
    getIsBotNearNearestPlayer(player, playerIndex, game, 200) &&
    getIsBotFacingNearestPlayer(player, playerIndex, game) &&
    Math.random() > 0.01
  ) {
    if (Math.random() > 0.9) {
      p.A = !p.A;
    }
  } else {
    p.A = false;
  }

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

  // //////////////////////
  // // WAKE UP BOT
  // //////////////////////
  // if (!p.left && !p.right) {
  //   p.right = true;
  //   p.Y = !p.Y;
  // }
}

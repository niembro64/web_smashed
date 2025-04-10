import SmashedGame, { SCREEN_DIMENSIONS } from '../SmashedGame';
import {
  AveragePositionXY,
  ControllerNumButtonPresses,
  MMaxPositionsXY as MaxPositionsXY,
  Player,
} from '../types';
import { print } from '../../views/client';
import { getIsAttackEnergyOffscreen } from './attacks';
import { getGameHitbackMultiplier, getNormalizedVector } from './damage';

export function updateCirclesLocations(game: SmashedGame): void {
  if (!game.debug.Player_ID_Visible || game.debug.Chars_Colored) {
    return;
  }

  game.colorCircles.forEach((circle, circleIndex) => {
    if (circleIndex < game.players.length) {
      circle.graphic.setRadius((1 / game.cameras.main.zoom) * 10);
      circle.graphic.setPosition(
        game.players[circleIndex].char.sprite.x,
        game.players[circleIndex].char.sprite.y +
          game.circleOffset +
          game.players[circleIndex].circleOffset
      );
    }
  });
}

export function updateTable(game: SmashedGame): void {
  if (game.TABLE.body.touching.down) {
    game.TABLE.body.setVelocityX(game.TABLE.body.velocity.x * 0.9);
  }
}

export function updateAttackEnergyWrapScreen(game: SmashedGame): void {
  if (!game.debug.AE_Wrap_Screen) {
    return;
  }
  game.players.forEach((player) => {
    if (player.char.attackEnergy.sprite.x < 0) {
      player.char.attackEnergy.sprite.x = SCREEN_DIMENSIONS.WIDTH;
    }
    if (player.char.attackEnergy.sprite.x > SCREEN_DIMENSIONS.WIDTH) {
      player.char.attackEnergy.sprite.x = 0;
    }
  });
}

export function updateKeepOnScreenPlayer(game: SmashedGame): void {
  game.players.forEach((player) => {
    if (player.char.sprite.y < 0) {
      player.char.sprite.y = SCREEN_DIMENSIONS.HEIGHT;
    }
    if (player.char.sprite.y > SCREEN_DIMENSIONS.HEIGHT) {
      player.char.sprite.y = 0;
    }
    if (player.char.sprite.x < 0) {
      player.char.sprite.x = SCREEN_DIMENSIONS.WIDTH;
    }
    if (player.char.sprite.x > SCREEN_DIMENSIONS.WIDTH) {
      player.char.sprite.x = 0;
    }
  });
}
export function isAnyPlayerOffscreen(game: SmashedGame): boolean {
  for (let i = 0; i < game.players.length; i++) {
    if (getIsPlayerOffscreen(game.players[i], game)) {
      return true;
    }
  }
  return false;
}
export function getIsPlayerOffscreen(
  player: Player,
  game: SmashedGame
): boolean {
  if (
    player.char.sprite.y < 0 ||
    player.char.sprite.y > SCREEN_DIMENSIONS.HEIGHT ||
    player.char.sprite.x < 0 ||
    player.char.sprite.x > SCREEN_DIMENSIONS.WIDTH
  ) {
    return true;
  }
  return false;
}

export function setRespawn(player: Player, game: SmashedGame): void {
  player.char.sprite.x =
    SCREEN_DIMENSIONS.WIDTH / 2 + player.char.initializeCharPosition.x;
  player.char.sprite.y = player.char.initializeCharPosition.y;

  player.char.sprite.body.setVelocityX(0);
  player.char.sprite.body.setVelocityY(0);
}

export function updateLastDirectionTouched(player: Player): void {
  if (player.char.sprite.body.touching.up) {
    player.char.lastDirectionTouched = 'up';
  } else if (player.char.sprite.body.touching.down) {
    player.char.lastDirectionTouched = 'down';
  } else if (player.char.sprite.body.touching.left) {
    player.char.lastDirectionTouched = 'left';
  } else if (player.char.sprite.body.touching.right) {
    player.char.lastDirectionTouched = 'right';
  }
}

export function updateWallTouchArray(game: SmashedGame): void {
  game.players.forEach((player) => {
    let t = player.char.sprite.body.touching;
    let i = game.allPlayersWallTouchIterator;
    let w = player.char.wallTouchArray;

    if (!t.down && (t.left || t.right)) {
      w[i] = true;
    } else {
      w[i] = false;
    }
  });

  game.allPlayersWallTouchIterator =
    (game.allPlayersWallTouchIterator + 1) %
    game.players[0].char.wallTouchArray.length;
}

export function hasPlayerTouchedWallRecently(player: Player): boolean {
  return !player.char.wallTouchArray.every((b) => b === false);
}

export function updateJumpPhysicalOnWall(
  player: Player,
  game: SmashedGame
): void {
  if (
    player.char.sprite.body.touching.down ||
    player.char.sprite.body.touching.left ||
    player.char.sprite.body.touching.right
  ) {
    player.char.jumpIndex = 0;
  }
}

export function updateJumpPhysical(player: Player, game: SmashedGame): void {
  if (player.padCurr.Y && !player.padPrev.Y) {
    if (
      !player.char.sprite.body.touching.down &&
      !player.char.sprite.body.touching.left &&
      !player.char.sprite.body.touching.right &&
      !hasPlayerTouchedWallRecently(player) &&
      player.char.jumpIndex < 1
    ) {
      player.char.jumpIndex = 1;
    }

    if (player.char.jumpIndex !== player.char.jumps.length - 1) {
      game.SOUND_JUMP_PHYSICAL.volume =
        player.char.jumps[player.char.jumpIndex];
      game.SOUND_JUMP_PHYSICAL.play();
    }

    player.char.sprite.body.setVelocityY(
      player.char.sprite.body.velocity.y *
        (1 - player.char.jumps[player.char.jumpIndex]) +
        game.BASE_PLAYER_JUMP_PHYSICAL *
          player.char.jumpPower *
          player.char.jumps[player.char.jumpIndex]
    );

    player.char.jumpIndex +=
      player.char.jumpIndex === player.char.jumps.length - 1 ? 0 : 1;

    // // horizontal stuff WAS TOUCHING
    if (
      game.debug.Wall_Jumps_Active &&
      player.char.lastDirectionTouched === 'left' &&
      hasPlayerTouchedWallRecently(player)
    ) {
      player.char.sprite.body.setVelocityX(
        game.BASE_PLAYER_JUMP_WALL *
          player.char.speed *
          (player.padCurr.left ? 2 : 1)
      );
      return;
    }

    if (
      game.debug.Wall_Jumps_Active &&
      player.char.lastDirectionTouched === 'right' &&
      hasPlayerTouchedWallRecently(player)
    ) {
      player.char.sprite.body.setVelocityX(
        -game.BASE_PLAYER_JUMP_WALL *
          player.char.speed *
          (player.padCurr.right ? 2 : 1)
      );
      return;
    }
  }
}

export function updateJumpFloat(player: Player, game: SmashedGame): void {
  if (player.emitterPlayer.on) {
    return;
  }
  if (player.padCurr.Y && player.padPrev.Y) {
    player.char.sprite.body.setVelocityY(
      player.char.sprite.body.velocity.y +
        -game.BASE_PLAYER_SPEED.y *
          player.char.speed *
          player.char.fast *
          player.char.jumpFloat
    );
  }
}

export function updateFrictionWallY(player: Player, game: SmashedGame): void {
  if (!game.debug.Wall_Jumps_Active) {
    return;
  }

  if (player.char.sprite.body.velocity.y < 0) {
    return;
  }
  if (
    (player.padCurr.left && player.char.sprite.body.touching.left) ||
    (player.padCurr.right && player.char.sprite.body.touching.right)
  ) {
    player.char.sprite.body.setVelocityY(0);
  }
}

export function updateFrictionAirY(player: Player, game: SmashedGame): void {
  if (!game.debug.Friction_Air_Active) {
    return;
  }

  if (!player.char.sprite.body.touching.down) {
    player.char.sprite.body.setVelocityY(
      player.char.sprite.body.velocity.y * (1 - player.char.friction_air)
    );
  }
}

export function updateFrictionAirX(player: Player, game: SmashedGame): void {
  if (!game.debug.Friction_Air_Active) {
    return;
  }

  if (!player.char.sprite.body.touching.down) {
    player.char.sprite.body.setVelocityX(
      player.char.sprite.body.velocity.x * (1 - player.char.friction_air)
    );
  }
}

export function updateFrictionGroundX(player: Player, game: SmashedGame): void {
  if (
    player.char.sprite.body.touching.down &&
    !player.padCurr.left &&
    !player.padCurr.right
  ) {
    player.char.sprite.body.setVelocityX(
      player.char.sprite.body.velocity.x * (1 - player.char.friction_ground)
    );
  }
}

export function hitbackFly(
  player: Player,
  game: SmashedGame,
  hitbackx: number,
  hitbacky: number
): void {
  let hbm = game.basePlayerHitbackGameMultiplier;
  hbm = getGameHitbackMultiplier(game);
  player.char.sprite.body.setVelocityY(
    hitbacky * game.BASE_PLAYER_HITBACK.y +
      ((hitbacky > 0 ? 1 : -1) *
        (game.BASE_PLAYER_HITBACK.y * player.char.damageCurr * hbm)) /
        5
  );
  player.char.sprite.body.setVelocityX(
    hitbackx * game.BASE_PLAYER_HITBACK.x +
      ((hitbackx > 0 ? 1 : -1) *
        (game.BASE_PLAYER_HITBACK.x * player.char.damageCurr * hbm)) /
        5
  );
}

export function setGravityTrue(player: Player): void {
  player.char.sprite.body.allowGravity = true;
}

export function setGravityFalse(player: Player): void {
  player.char.sprite.body.allowGravity = false;
}

export function updateKeepObjectsFromFallingLikeCrazy(game: SmashedGame): void {
  game.players.forEach((player, playerIndex) => {
    if (player.char.attackEnergy.sprite.y > SCREEN_DIMENSIONS.HEIGHT) {
      player.char.attackEnergy.sprite.y = SCREEN_DIMENSIONS.HEIGHT + 200;
      player.char.attackEnergy.sprite.body.setVelocityY(0);
      player.char.attackEnergy.sprite.body.setVelocityX(0);
    }
  });
}

export function updateAttackEnergyFollow(game: SmashedGame): void {
  game.players.forEach((player, playerIndex) => {
    const ae = player.char.attackEnergy;
    if (!getIsAttackEnergyOffscreen(ae)) {
      if (
        ae.findAndFollowAcceleration.x !== 0 &&
        ae.findAndFollowAcceleration.y === 0
      ) {
        const goHere: { x: number; y: number } | null =
          getNearestPlayerAliveXYFromPlayer(player, playerIndex, game);

        if (goHere !== null) {
          ae.sprite.body.setVelocityX(
            ae.sprite.body.velocity.x * 0.98 +
              (goHere.x < ae.sprite.x ? -1 : 1) *
                100 *
                ae.findAndFollowAcceleration.x
          );
        }
      } else if (
        ae.findAndFollowAcceleration.x !== 0 &&
        ae.findAndFollowAcceleration.y !== 0
      ) {
        const goHere: { x: number; y: number } | null =
          getNearestPlayerAliveXYFromPlayer(player, playerIndex, game);

        if (goHere !== null) {
          const goHereMultiplier: { x: number; y: number } =
            getNormalizedVector(ae.sprite.x, ae.sprite.y, goHere.x, goHere.y);
          ae.sprite.body.setVelocityX(
            ae.sprite.body.velocity.x * 0.98 +
              goHereMultiplier.x * 100 * ae.findAndFollowAcceleration.x
          );
          ae.sprite.body.setVelocityY(
            ae.sprite.body.velocity.y * 0.98 +
              goHereMultiplier.y * 100 * ae.findAndFollowAcceleration.y
          );
        }
      }
    }
  });
}

export function getNearestPlayerXFromPlayer(
  player: Player,
  pIndex: number,
  game: SmashedGame
): number | null {
  let goToX = Infinity;
  let myX = player.char.attackEnergy.sprite.x;
  let diffX = Math.abs(goToX - myX);
  game.players.forEach((player, playerIndex) => {
    if (pIndex !== playerIndex) {
      const otherPlayerX = player.char.sprite.x;
      const newDiffX = Math.abs(otherPlayerX - myX);
      if (newDiffX < diffX) {
        goToX = otherPlayerX;
        diffX = newDiffX;
      }
    }
  });

  if (goToX === Infinity) {
    return null;
  }

  return goToX;
}

export function getNearestPlayerYFromPlayer(
  player: Player,
  pIndex: number,
  game: SmashedGame
): number | null {
  let goToY = Infinity;
  let myY = player.char.attackEnergy.sprite.y;
  let diffY = Math.abs(goToY - myY);
  game.players.forEach((player, playerIndex) => {
    if (pIndex !== playerIndex) {
      const otherPlayerY = player.char.sprite.y;
      const newDiffY = Math.abs(otherPlayerY - myY);
      if (newDiffY < diffY) {
        goToY = otherPlayerY;
        diffY = newDiffY;
      }
    }
  });

  if (goToY === Infinity) {
    return null;
  }

  return goToY;
}

export function getNearestPlayerAliveXYFromPlayer(
  player: Player,
  pIndex: number,
  game: SmashedGame
): { x: number; y: number } | null {
  let goToXCurr = Infinity;
  let goToYCurr = Infinity;
  const myX = player.char.sprite.body.position.x;
  const myY = player.char.sprite.body.position.y;

  for (let i = 0; i < game.players.length; i++) {
    if (pIndex !== i && game.players[i].state.name === 'player-state-alive') {
      const otherPlayerX = game.players[i].char.sprite.body.position.x;
      const otherPlayerY = game.players[i].char.sprite.body.position.y;

      const distanceOld = getDistance(myX, myY, goToXCurr, goToYCurr);

      const distanceNew = getDistance(myX, myY, otherPlayerX, otherPlayerY);

      if (distanceNew < distanceOld) {
        goToXCurr = otherPlayerX;
        goToYCurr = otherPlayerY;
      }
    }
  }

  if (goToXCurr === Infinity || goToYCurr === Infinity) {
    return null;
  }

  return { x: goToXCurr, y: goToYCurr };
}

export function getNearestPlayerAliveFromXY(
  x: number,
  y: number,
  game: SmashedGame
): { player: Player; playerIndex: number } | null {
  const players = game.players.filter(
    (player) => player.state.name === 'player-state-alive'
  ); // Assuming isAlive is a boolean property
  if (players.length === 0) return null; // If there are no alive players, return null

  let nearestPlayer: Player = players[0];
  let nearestPlayerIndex: number = 0;
  let shortestDistance: number = Infinity;

  players.forEach((player, index) => {
    const sprite = player.char.sprite;
    const newDistance: number = getDistance(x, y, sprite.x, sprite.y);

    if (newDistance < shortestDistance) {
      shortestDistance = newDistance;
      nearestPlayerIndex = index;
      nearestPlayer = player;
    }
  });

  return { player: nearestPlayer, playerIndex: nearestPlayerIndex };
}

export function getNearestAttackEnergyXYFromPlayer(
  player: Player,
  pIndex: number,
  game: SmashedGame
): { x: number; y: number } | null {
  let currX = Infinity;
  let currY = Infinity;

  game.players.forEach((player, playerIndex) => {
    if (pIndex !== playerIndex) {
      const newX = player.char.attackEnergy.sprite.x;
      const newY = player.char.attackEnergy.sprite.y;
      const myX = player.char.sprite.x;
      const myY = player.char.sprite.y;
      if (
        getDistance(myX, myY, newX, newY) < getDistance(myX, myY, currX, currY)
      ) {
        currX = newX;
        currY = newY;
      }
    }
  });

  if (currX === Infinity || currY === Infinity) {
    return null;
  }

  return { x: currX, y: currY };
}

export function getNearestAttackPhysicalXYFromPlayer(
  player: Player,
  pIndex: number,
  game: SmashedGame
): { x: number; y: number } | null {
  let currX = Infinity;
  let currY = Infinity;

  game.players.forEach((player, playerIndex) => {
    if (pIndex !== playerIndex) {
      const newX = player.char.attackEnergy.sprite.x;
      const newY = player.char.attackEnergy.sprite.y;
      const myX = player.char.sprite.x;
      const myY = player.char.sprite.y;
      if (
        getDistance(myX, myY, newX, newY) < getDistance(myX, myY, currX, currY)
      ) {
        currX = newX;
        currY = newY;
      }
    }
  });

  if (currX === Infinity || currY === Infinity) {
    return null;
  }

  return { x: currX, y: currY };
}

export function getNearestPlayerAliveFromPlayer(
  player: Player,
  pIndex: number,
  game: SmashedGame
): { player: Player; playerIndex: number } | null {
  let currentEnemyX = Infinity;
  let currentEnemyY = Infinity;
  let enemyIndex: number | null = null;
  let enemy: Player | null = null;

  game.players.forEach((player, playerIndex) => {
    if (pIndex !== playerIndex && player.state.name === 'player-state-alive') {
      let newEnemyX = player.char.sprite.x;
      let newEnemyY = player.char.sprite.y;
      let myX = player.char.sprite.x;
      let myY = player.char.sprite.y;
      if (
        getDistance(myX, myY, newEnemyX, newEnemyY) <
        getDistance(myX, myY, currentEnemyX, currentEnemyY)
      ) {
        currentEnemyX = newEnemyX;
        currentEnemyY = newEnemyY;

        enemy = player;
        enemyIndex = playerIndex;
      }
    }
  });

  if (enemy === null || enemyIndex === null) {
    return null;
  }

  return { player: enemy, playerIndex: enemyIndex };
}
export function getNearestPlayerFromPlayer(
  player: Player,
  pIndex: number,
  game: SmashedGame
): { player: Player; playerIndex: number } | null {
  let currentEnemyX = Infinity;
  let currentEnemyY = Infinity;
  let enemyIndex: number = (pIndex + 1) % game.players.length;
  let enemy: Player = game.players[enemyIndex];

  game.players.forEach((player, playerIndex) => {
    if (pIndex !== playerIndex) {
      let newEnemyX = player.char.sprite.x;
      let newEnemyY = player.char.sprite.y;
      let myX = player.char.sprite.x;
      let myY = player.char.sprite.y;
      if (
        getDistance(myX, myY, newEnemyX, newEnemyY) <
        getDistance(myX, myY, currentEnemyX, currentEnemyY)
      ) {
        currentEnemyX = newEnemyX;
        currentEnemyY = newEnemyY;

        enemy = player;
        enemyIndex = playerIndex;
      }
    }
  });

  if (enemy === null) {
    return null;
  }

  return { player: enemy, playerIndex: enemyIndex };
}

export function getNearestAttackEnergyXYAboveFromPlayer(
  player: Player,
  pIndex: number,
  game: SmashedGame
): { x: number; y: number } | null {
  let goToX = Infinity;
  let goToY = Infinity;
  let ae = player.char.attackEnergy;

  game.players.forEach((player, playerIndex) => {
    if (pIndex !== playerIndex) {
      let aeX = player.char.attackEnergy.sprite.x;
      let aeY = player.char.attackEnergy.sprite.y;
      let myX = ae.sprite.x;
      let myY = ae.sprite.y;
      if (aeY < myY + player.char.sprite.height * 0.5) {
        if (
          getDistance(myX, myY, aeX, aeY) < getDistance(myX, myY, goToX, goToY)
        ) {
          goToX = aeX;
          goToY = aeY;
        }
      }
    }
  });

  if (goToX === Infinity || goToY === Infinity) {
    return null;
  }

  return { x: goToX, y: goToY };
}

export function getDistance(
  startX: number,
  startY: number,
  endX: number,
  endY: number
): number {
  return Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
}

export function updateAttackEnergyFlipXVel(game: SmashedGame): void {
  for (let i = 0; i < game.players.length; i++) {
    const ae = game.players[i].char.attackEnergy;

    if (ae.sprite.body.velocity.x > 0) {
      ae.sprite.flipX = false;
    }
    if (ae.sprite.body.velocity.x < 0) {
      ae.sprite.flipX = true;
    }
  }
}
export function updateAttackEnergyFlipXAcc(game: SmashedGame): void {
  for (let i = 0; i < game.players.length; i++) {
    const ae = game.players[i].char.attackEnergy;

    if (ae.accX > 0) {
      ae.sprite.flipX = false;
    }
    if (ae.accX < 0) {
      ae.sprite.flipX = true;
    }
  }
}

export function updateAttackEnergyVelPrev(game: SmashedGame): void {
  for (let i = 0; i < game.players.length; i++) {
    game.players[i].char.attackEnergy.accX =
      game.players[i].char.attackEnergy.sprite.body.velocity.x -
      game.players[i].char.attackEnergy.velPrevX;
    game.players[i].char.attackEnergy.accY =
      game.players[i].char.attackEnergy.sprite.body.velocity.y -
      game.players[i].char.attackEnergy.velPrevY;

    game.players[i].char.attackEnergy.velPrevX =
      game.players[i].char.attackEnergy.sprite.body.velocity.x;
    game.players[i].char.attackEnergy.velPrevY =
      game.players[i].char.attackEnergy.sprite.body.velocity.y;
  }
}

export function getIsSpriteMoving(
  sprite: Phaser.Physics.Arcade.Sprite
): boolean {
  const tolerance = 0.1;
  const isMoving = Math.abs(sprite.body.velocity.x) > tolerance;
  return isMoving;
}

export function updatePlayerPositionIfUndefined(game: SmashedGame): void {
  for (let playerIndex = 0; playerIndex < game.players.length; playerIndex++) {
    const player = game.players[playerIndex];

    const playerX = player.char.sprite.body.position.x;
    const playerY = player.char.sprite.body.position.y;

    if (!playerX || !playerY) {
      print(
        'player position bad: ',
        playerIndex,
        player.char.sprite.body.position
      );
      // player.char.sprite.body.position.x = SCREEN_DIMENSIONS.WIDTH * 0.5;
      // player.char.sprite.body.position.y = SCREEN_DIMENSIONS.HEIGHT * 0.2;
    }
  }
}

export function updatePlayerControllerCountersAndPositionCounters(
  player: Player
): void {
  const padCurr = player.padCurr;
  const cbp: ControllerNumButtonPresses = player.controllerButtonPresses;
  const apxy: AveragePositionXY = player.averagePositionXY;
  const mpxy: MaxPositionsXY = player.maxPositionsXY;

  const centerX = SCREEN_DIMENSIONS.WIDTH * 0.5;
  const centerY = SCREEN_DIMENSIONS.HEIGHT * 0.5;

  mpxy.x.start =
    mpxy.x.start !== null
      ? Math.min(mpxy.x.start, player.char.sprite.body.position.x || centerX)
      : player.char.sprite.body.position.x || centerX;
  mpxy.x.end =
    mpxy.x.end !== null
      ? Math.max(mpxy.x.end, player.char.sprite.body.position.x || centerX)
      : player.char.sprite.body.position.x || centerX;
  mpxy.y.start =
    mpxy.y.start !== null
      ? Math.min(mpxy.y.start, player.char.sprite.body.position.y || centerY)
      : player.char.sprite.body.position.y || centerY;
  mpxy.y.end =
    mpxy.y.end !== null
      ? Math.max(mpxy.y.end, player.char.sprite.body.position.y || centerY)
      : player.char.sprite.body.position.y || centerY;

  apxy.x.positionSum +=
    (player.char.sprite.body.position?.x || 0) / SCREEN_DIMENSIONS.WIDTH;
  apxy.x.positionCount += 1;
  apxy.x.positionAverage = apxy.x.positionSum / apxy.x.positionCount;
  apxy.y.positionSum +=
    (player.char.sprite.body.position?.y || 0) / SCREEN_DIMENSIONS.HEIGHT;
  apxy.y.positionCount += 1;
  apxy.y.positionAverage = apxy.y.positionSum / apxy.y.positionCount;

  if (padCurr.up) {
    cbp.up.pressed += 1;
  } else {
    cbp.up.released += 1;
  }

  if (padCurr.down) {
    cbp.down.pressed += 1;
  } else {
    cbp.down.released += 1;
  }

  if (padCurr.left) {
    cbp.left.pressed += 1;
  } else {
    cbp.left.released += 1;
  }

  if (padCurr.right) {
    cbp.right.pressed += 1;
  } else {
    cbp.right.released += 1;
  }

  if (padCurr.A) {
    cbp.A.pressed += 1;
  } else {
    cbp.A.released += 1;
  }

  if (padCurr.B) {
    cbp.B.pressed += 1;
  } else {
    cbp.B.released += 1;
  }

  if (padCurr.X) {
    cbp.X.pressed += 1;
  } else {
    cbp.X.released += 1;
  }

  if (padCurr.Y) {
    cbp.Y.pressed += 1;
  } else {
    cbp.Y.released += 1;
  }

  if (padCurr.L) {
    cbp.L.pressed += 1;
  } else {
    cbp.L.released += 1;
  }

  if (padCurr.R) {
    cbp.R.pressed += 1;
  } else {
    cbp.R.released += 1;
  }

  if (padCurr.start) {
    cbp.start.pressed += 1;
  } else {
    cbp.start.released += 1;
  }

  if (padCurr.select) {
    cbp.select.pressed += 1;
  } else {
    cbp.select.released += 1;
  }

  cbp.up.ratio = cbp.up.pressed / (cbp.up.pressed + cbp.up.released);
  cbp.down.ratio = cbp.down.pressed / (cbp.down.pressed + cbp.down.released);
  cbp.left.ratio = cbp.left.pressed / (cbp.left.pressed + cbp.left.released);
  cbp.right.ratio =
    cbp.right.pressed / (cbp.right.pressed + cbp.right.released);
  cbp.A.ratio = cbp.A.pressed / (cbp.A.pressed + cbp.A.released);
  cbp.B.ratio = cbp.B.pressed / (cbp.B.pressed + cbp.B.released);
  cbp.X.ratio = cbp.X.pressed / (cbp.X.pressed + cbp.X.released);
  cbp.Y.ratio = cbp.Y.pressed / (cbp.Y.pressed + cbp.Y.released);
  cbp.L.ratio = cbp.L.pressed / (cbp.L.pressed + cbp.L.released);
  cbp.R.ratio = cbp.R.pressed / (cbp.R.pressed + cbp.R.released);
  cbp.start.ratio =
    cbp.start.pressed / (cbp.start.pressed + cbp.start.released);
  cbp.select.ratio =
    cbp.select.pressed / (cbp.select.pressed + cbp.select.released);
}

export const getPlayerLRBalanced = (
  player: Player,
  playerIndex: number,
  game: SmashedGame
): { isBalanced: boolean; error: number } => {
  const cbp = player.controllerButtonPresses;

  const seconds = game.gameSeconds;

  // Exponential decay constant can be adjusted for a more intuitive control over tolerance decrease
  const decayRate = 0.99; // Adjust this value as needed to control the decay rate
  const initialTolerance = 0.2; // Starting tolerance value

  const tolerance = initialTolerance * Math.pow(decayRate, seconds);

  const error = Math.abs(cbp.left.ratio - cbp.right.ratio);

  const isBalanced = error < tolerance;
  // print('LR', playerIndex, 'tolerance:', tolerance);
  // print('LR', playerIndex, 'error:', error);
  // print('LR', playerIndex, 'isBalanced:', isBalanced);

  return {
    isBalanced: isBalanced,
    error: error,
  };
};

export const getPlayerXYBalanced = (
  player: Player,
  playerIndex: number,
  game: SmashedGame
): { isBalanced: boolean; error: number } => {
  const apxy = player.averagePositionXY;

  const seconds = game.gameSeconds;

  // Exponential decay constant can be adjusted for a more intuitive control over tolerance decrease
  const decayRate = 0.99; // Adjust this value as needed to control the decay rate
  const initialTolerance = 0.8; // Starting tolerance value

  const tolerance = initialTolerance * Math.pow(decayRate, seconds);

  const error = Math.abs(0.5 - apxy.x.positionAverage);

  const isBalanced = error < tolerance;
  // print('XY', playerIndex, 'tolerance:', tolerance);
  // print('XY', playerIndex, 'error:', error);
  // print('XY', playerIndex, 'isBalanced:', isBalanced);

  return {
    isBalanced: isBalanced,
    error: error,
  };
};

export const getPercentOfScreenTravelled = (
  player: Player,
  playerIndex: number,
  game: SmashedGame
): { percentX: number; percentY: number } => {
  const { x, y }: MaxPositionsXY = player.maxPositionsXY;

  const xStart = x.start;
  const xEnd = x.end;
  const yStart = y.start;
  const yEnd = y.end;

  const percentX = Math.abs(xEnd - xStart) / SCREEN_DIMENSIONS.WIDTH;
  const percentY = Math.abs(yEnd - yStart) / SCREEN_DIMENSIONS.HEIGHT;

  return {
    percentX: percentX,
    percentY: percentY,
  };
};

export const getNearestPlayerAliveInRadiusFromPoint = (params: {
  x: number;
  y: number;
  radius: number;
  game: SmashedGame;
}): { player: Player | null; playerIndex: number | null } => {
  const { x, y, radius, game } = params;

  let nearestPlayer: Player | null = null;
  let nearestPlayerIndex: number | null = null;

  let shortestDistance = Infinity;
  for (let i = 0; i < game.players.length; i++) {
    const player = game.players[i];
    if (player.state.name !== 'player-state-alive') {
      continue;
    }

    const distance = getDistance(
      x,
      y,
      player.char.sprite.x,
      player.char.sprite.y
    );

    if (distance < radius && distance < shortestDistance) {
      shortestDistance = distance;
      nearestPlayer = player;
      nearestPlayerIndex = i;
    }
  }

  return {
    player: nearestPlayer,
    playerIndex: nearestPlayerIndex,
  };
};

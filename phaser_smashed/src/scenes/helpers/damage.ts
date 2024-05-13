import { print } from '../../views/client';
import Game, { SCREEN_DIMENSIONS } from '../Game';
import {
  AttackEnergy,
  AttackPhysical,
  FireFlower,
  Player,
  xyVector,
} from '../interfaces';
import {
  setAttackEnergyOffscreen,
  setBulletOffscreen,
  setFireBallOffscreen,
  setPhysicsAttackEnergyOff,
} from './attacks';
import { getNearestPlayerAliveFromXY, hitbackFly } from './movement';
import { getHasBeenGameDurationSinceMoment } from './powers';
import { setPauseSoundPowerup, setResumeSoundPowerup } from './sound';
import { setPlayerState } from './state';

export function onHitHandlerAttackPhysical(
  player: Player,
  playerIndex: number,
  attackPhysical: AttackPhysical,
  j: number,
  damage: number,
  game: Game
): void {
  if (player.state.name !== 'player-state-alive') {
    return;
  }

  if (
    game.players[j].char.attackPhysical.state.name !== 'attackphysical-state-on'
  ) {
    return;
  }

  setPlayerState(player, playerIndex, 'player-state-hurt', game);

  game.overlappingPlayerIAttackPhysicalJ[playerIndex][j] = true;

  for (let bj = 0; bj < game.players.length; bj++) {
    if (bj === j) {
      game.wasLastHitByMatrix[playerIndex][bj] = true;
      game.numberHitByMatrix[playerIndex][j]++;
    } else {
      game.wasLastHitByMatrix[playerIndex][bj] = false;
    }
  }

  const vector = getNormalizedVectorAP(attackPhysical, player);

  player.char.damageCurr += damage;

  if (game.debug.Default_Hitback) {
    hitbackFly(
      player,
      game,
      game.DEFAULT_ATTACK_HITBACK.x * vector.x,
      game.DEFAULT_ATTACK_HITBACK.y * vector.y
    );
    return;
  }

  hitbackFly(
    player,
    game,
    attackPhysical.hitback.x * vector.x,
    attackPhysical.hitback.y * vector.y
  );
}

export function onHitHandlerAttackEnergy(
  playerHit: Player,
  playerHitIndex: number,
  attackEnergy: AttackEnergy,
  j: number,
  damage: number,
  game: Game
): void {
  if (playerHit.state.name !== 'player-state-alive') {
    return;
  }

  if (playerHit.emitterPlayer.on) {
    return;
  }

  game.overlappingPlayerIAttackEnergyJ[playerHitIndex][j] = true;

  for (let bj = 0; bj < game.players.length; bj++) {
    if (bj === j) {
      game.wasLastHitByMatrix[playerHitIndex][bj] = true;
      game.numberHitByMatrix[playerHitIndex][j]++;
    } else {
      game.wasLastHitByMatrix[playerHitIndex][bj] = false;
    }
  }

  const vector = getNormalizedVectorAP(attackEnergy, playerHit);

  playerHit.char.damageCurr += damage;

  if (game.debug.Default_Hitback) {
    hitbackFly(
      playerHit,
      game,
      game.DEFAULT_ATTACK_HITBACK.x * vector.x,
      game.DEFAULT_ATTACK_HITBACK.y * vector.y
    );
    return;
  }

  hitbackFly(
    playerHit,
    game,
    attackEnergy.hitback.x * vector.x,
    attackEnergy.hitback.y * vector.y
  );

  if (attackEnergy.diesOnHitbox) {
    setAttackEnergyOffscreen(game.players[j], j, game);
    setPhysicsAttackEnergyOff(game.players[j]);
  }
}

export function onHitHandlerFireBall(
  playerHit: Player,
  playerHitIndex: number,
  bullet: Phaser.GameObjects.GameObject,
  bulletIndex: number,
  j: number,
  damage: number,
  game: Game
): void {
  if (playerHit.emitterPlayer.on) {
    return;
  }

  const b = game.fireFlower.attackBullets?.bullets?.getChildren()[bulletIndex];

  if (!b) {
    return;
  }

  if (bullet === null) {
    return;
  }

  if (
    playerHit.state.name === 'player-state-start' ||
    playerHit.state.name === 'player-state-dead'
  ) {
    return;
  }

  for (let bj = 0; bj < game.players.length; bj++) {
    if (bj === j) {
      game.wasLastHitByMatrix[playerHitIndex][bj] = true;
    } else {
      game.wasLastHitByMatrix[playerHitIndex][bj] = false;
    }
  }

  const vector = {
    x: b.body.gameObject.body.velocity.x,
    y: b.body.gameObject.body.velocity.y,
  };

  playerHit.char.damageCurr += damage;

  const pHit = playerHit.char.sprite;

  const mult = 0.0002;

  pHit.setVelocityX(
    pHit.body.velocity.x +
      vector.x * game.fireFlower.hitback.x * playerHit.char.damageCurr * mult
  );
  pHit.setVelocityY(
    pHit.body.velocity.y +
      vector.y * game.fireFlower.hitback.y * playerHit.char.damageCurr * mult
  );

  if (game.fireFlower.diesOnHitbox) {
    setFireBallOffscreen(bulletIndex, game);
  }
}

export function onHitHandlerBullets(
  playerHit: Player,
  playerHitIndex: number,
  pj: Player,
  attackEnergy: AttackEnergy,
  bullet: Phaser.GameObjects.GameObject,
  bulletIndex: number,
  j: number,
  damage: number,
  game: Game
): void {
  if (playerHit.emitterPlayer.on) {
    return;
  }

  const b = attackEnergy.attackBullets?.bullets?.getChildren()[bulletIndex];

  if (!b) {
    return;
  }

  if (bullet === null) {
    return;
  }

  if (
    playerHit.state.name === 'player-state-start' ||
    playerHit.state.name === 'player-state-dead'
  ) {
    return;
  }

  for (let bj = 0; bj < game.players.length; bj++) {
    if (bj === j) {
      game.wasLastHitByMatrix[playerHitIndex][bj] = true;
    } else {
      game.wasLastHitByMatrix[playerHitIndex][bj] = false;
    }
  }

  const vector = {
    x: b.body.gameObject.body.velocity.x,
    y: b.body.gameObject.body.velocity.y,
  };

  playerHit.char.damageCurr += damage;

  const pHit = playerHit.char.sprite;
  const ae = pj.char.attackEnergy;

  pHit.setVelocityX(pHit.body.velocity.x + vector.x * 3 * ae.hitback.x);
  pHit.setVelocityY(pHit.body.velocity.y + vector.y * 2 * ae.hitback.y - 25);

  if (attackEnergy.diesOnHitbox) {
    setBulletOffscreen(bulletIndex, pj, j, game);
  }
}

export function setEmitterPlayerOnFalse(player: Player): void {
  player.emitterPlayer.on = false;
}
export function setEmitterPlayerOnTrue(player: Player): void {
  player.emitterPlayer.on = true;
}
export function setEmitterHurtActiveTrue(player: Player): void {
  player.emitterHurt.active = true;
}
export function setEmitterHurtActiveFalse(player: Player): void {
  player.emitterHurt.active = false;
}

export function setEmitterHurtVisibleTrue(player: Player): void {
  player.emitterHurt.visible = true;
}
export function setEmitterHurtVisibleFalse(player: Player): void {
  player.emitterHurt.visible = false;
}

export function setEmitterPlayerActiveTrue(player: Player): void {
  player.emitterPlayer.active = true;
}
export function setEmitterPlayerActiveFalse(player: Player): void {
  player.emitterPlayer.active = false;
}

export function setEmitterPlayerVisibleTrue(player: Player): void {
  player.emitterPlayer.visible = true;
}
export function setEmitterPlayerVisibleFalse(player: Player): void {
  player.emitterPlayer.visible = false;
}

export function setOnDeadUpdateMatrix(playerIndex: number, game: Game): void {
  let killedSelf: boolean = true;
  for (let j = 0; j < game.players.length; j++) {
    if (game.wasLastHitByMatrix[playerIndex][j]) {
      killedSelf = false;
      game.numberKilledByMatrix[playerIndex][j]++;
    }
  }
  if (killedSelf) {
    game.numberKilledByMatrix[playerIndex][playerIndex]++;
  }
}

export function updateDeathsAndKillsMatrices(game: Game): void {
  game.players.forEach((player, playerIndex) => {
    updatePlayerNumberDeaths(player, playerIndex, game);
    updatePlayerNumberKills(player, playerIndex, game);
  });
}

export function updatePlayerNumberDeaths(
  player: Player,
  playerIndex: number,
  game: Game
): void {
  player.deathCount = game.numberKilledByMatrix[playerIndex].reduce(
    (partialSum, a) => partialSum + a,
    0
  );
}
export function updatePlayerNumberKills(
  player: Player,
  playerIndex: number,
  game: Game
): void {
  player.killCount = 0;
  for (let i = 0; i < game.players.length; i++) {
    if (i !== playerIndex) {
      player.killCount += game.numberKilledByMatrix[i][playerIndex];
    }
  }
}

export function removeDamage(player: Player, damage: number): void {
  if (player.state.name === 'player-state-alive') {
    player.char.damageCurr -= damage;
  }
}

export function setResetDamage(player: Player): void {
  player.char.damageCurr = 0;
}

// export function addHit(player: Player, game: Game): void {
// }

export function getNormalizedVectorAP(
  attack: AttackEnergy | AttackPhysical,
  player: Player
): xyVector {
  const newX = player.char.sprite.x - attack.sprite.x;
  const newY = player.char.sprite.y - attack.sprite.y;
  const newRatio = Math.sqrt(newX * newX + newY * newY);

  return { x: newX / newRatio, y: newY / newRatio };
}
// not working yet
export function getLaunchVector(
  v0: number, // Initial velocity
  x0: number, // Initial x-position of the cannon
  y0: number, // Initial y-position of the cannon
  x: number, // x-position of the target
  y: number, // y-position of the target
  g: number = 9.81 // Acceleration due to gravity (m/s^2)
): { x: number; y: number } {
  const precision = 0.01; // Precision of the angle in radians
  let bestAngle = 0;
  let minDistance = Infinity;

  for (let angle = 0; angle < Math.PI / 2; angle += precision) {
    const time = (x - x0) / (v0 * Math.cos(angle));
    const calculatedY =
      y0 + v0 * Math.sin(angle) * time - 0.5 * g * time * time;

    const distance = Math.abs(calculatedY - y);
    if (distance < minDistance) {
      minDistance = distance;
      bestAngle = angle;
    }
  }

  return {
    // angleDegrees: bestAngle * (180 / Math.PI), // Convert radians to degrees for output
    x: Math.cos(bestAngle), // Cosine of the angle
    y: Math.sin(bestAngle), // Sine of the angle
  };
}

export function getNormalizedVector(
  startX: number,
  startY: number,
  endX: number,
  endY: number
): xyVector {
  const newX = endX - startX;
  const newY = endY - startY;
  const newRatio = Math.sqrt(newX * newX + newY * newY);

  return { x: newX / newRatio, y: newY / newRatio };
}

export function getVector(
  startX: number,
  startY: number,
  endX: number,
  endY: number
): xyVector {
  const newX = endX - startX;
  const newY = endY - startY;

  return { x: newX, y: newY };
}

export function getDistance(
  startX: number,
  startY: number,
  endX: number,
  endY: number
): number {
  const newX = endX - startX;
  const newY = endY - startY;
  const newRatio = Math.sqrt(newX * newX + newY * newY);

  return newRatio;
}

export function getGameHitbackMultiplier(game: Game): number {
  const t = game.gameNanoseconds * 0.001;
  let h: number = 0;
  const m = t / 60;

  h = Math.pow(1 + m * 0.1, 1.7);
  // print('HBM', h);

  return h;
}

export function updateSuicide(game: Game): void {
  const lengthOfSuicideHold = 5000;

  game.players.forEach((player, playerIndex) => {
    // print('updateSuicide', playerIndex, player.LRStamp);
    // print(
    //   'currL',
    //   player.padCurr.L,
    //   'currR',
    //   player.padCurr.R,
    //   'prevL',
    //   player.padPrev.L,
    //   'prevR',
    //   player.padPrev.R
    // );
    if (
      player.padCurr.up ||
      player.padCurr.down ||
      player.padCurr.left ||
      player.padCurr.right ||
      player.padCurr.A ||
      player.padCurr.B ||
      player.padCurr.X ||
      player.padCurr.Y ||
      player.state.name !== 'player-state-alive' ||
      !player.padCurr.L ||
      !player.padCurr.R
    ) {
      player.LRStamp = null;
      return;
    }

    if (player.LRStamp === null && (player.padPrev.L || player.padPrev.R)) {
      player.LRStamp = game.gameNanoseconds;
      print('LRStamp', player.LRStamp);
    }

    if (
      player.LRStamp &&
      getHasBeenGameDurationSinceMoment(
        lengthOfSuicideHold,
        player.LRStamp,
        game
      )
    ) {
      print('SUICIDE');
      player.char.sprite.y = -200;
      player.char.sprite.x = SCREEN_DIMENSIONS.WIDTH * 0.5;
    }
  });
}

// export function updateTableGiveHealthOld(game: Game): void {
//   const t = game.TABLE.body;

//   const p = getNearestPlayerAliveFromXY(t.x, t.y, game);
//   if (p === null) {
//     setPauseSoundPowerup(game);
//     game.powerupActive = false;
//     return;
//   }

//   if (
//     t.touching.up &&
//     // p.char.sprite.body.touching.down &&
//     p.player.char.damageCurr !== 0
//   ) {
//     p.player.char.damageCurr = Math.max(0, p.player.char.damageCurr - 0.5);
//     if (!game.powerupActive) {
//       setResumeSoundPowerup(game);
//       game.powerupActive = true;
//     }
//   } else {
//     if (game.powerupActive) {
//       setPauseSoundPowerup(game);
//       game.powerupActive = false;
//     }
//   }
// }

export function updateTableGiveHealth(game: Game): void {
  const { body } = game.TABLE;

  let charging: boolean = false;

  for (let i = 0; i < game.players.length; i++) {
    const p = game.players[i];

    const isCloseEnough: boolean =
      getDistance(body.x + 60, body.y, p.char.sprite.x, p.char.sprite.y) < 100;

    if (isCloseEnough && p.char.damageCurr !== 0) {
      charging = true;
      p.char.damageCurr = Math.max(0, p.char.damageCurr - 0.5);
    }
  }

  if (charging) {
    setResumeSoundPowerup(game);
    if (Math.floor(game.timeNanoseconds / 2) % 2 === 0) {
      // game.TABLE.setTexture('table2');
      // game.TABLE.setTintFill(0x00ffff);
      game.TABLE.setTint(0xffffff);
    } else {
      // game.TABLE.setTexture('table');
      game.TABLE.setTintFill(0xffffff);
    }
  } else {
    game.TABLE.setTint(0xffffff);
    setPauseSoundPowerup(game);
  }
}

export function updateDamagePrev(game: Game): void {
  game.players.forEach((p, pIndex) => {
    p.char.damagePrev = p.char.damageCurr;
  });
}

import { print } from '../../views/client';
import SmashedGame, { SCREEN_DIMENSIONS } from '../SmashedGame';
import {
  AttackEnergy,
  AttackPhysical,
  Player,
  Velocity,
  xyVector,
} from '../types';
import {
  setAttackEnergyOffscreen,
  setBulletOffscreen,
  setFireBallOffscreen,
  setPhysicsAttackEnergyOff,
} from './attacks';
import { hitbackFly } from './movement';
import {
  getHasBeenGameDurationSinceMomentBoolean,
  getHowLongSinceGameMomentAsRatio,
} from './powers';
import { setPauseSoundPowerup, setResumeSoundPowerup } from './sound';
import { setPlayerState } from './state';

export function onHitHandlerChompAttack(params: {
  playerHit: Player;
  playerHitIndex: number;
  game: SmashedGame;
}): void {
  const { playerHit, playerHitIndex, game } = params;

  if (playerHit.emitterPlayer.on) {
    return;
  }

  // update last hit by matrix for playerHit

  for (let bj = 0; bj < game.players.length; bj++) {
    if (bj === playerHitIndex) {
      game.wasLastHitByMatrix[playerHitIndex][bj] = true;
      game.numberHitByMatrix[playerHitIndex][bj]++;
    } else {
      game.wasLastHitByMatrix[playerHitIndex][bj] = false;
    }
  }

  const vector = getNormalizedVector(
    game.chomp.sprite.x,
    game.chomp.sprite.y,
    playerHit.char.sprite.x,
    playerHit.char.sprite.y
  );

  playerHit.char.damageCurr += 500;

  const pHit = playerHit.char.sprite;

  pHit.setVelocityX(vector.x);

  pHit.setVelocityY(vector.y);
}
export function onHitHandlerArbitraryAttack(params: {
  playerHit: Player;
  playerHitIndex: number;
  direction: xyVector;
  j: number;
  damage: number;
  game: SmashedGame;
}): void {
  const { playerHit, playerHitIndex, direction, j, damage, game } = params;

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

  const vector = direction;

  playerHit.char.damageCurr += damage;

  const pHit = playerHit.char.sprite;

  pHit.setVelocityX(vector.x);

  pHit.setVelocityY(vector.y);
}

export function onHitHandlerAttackPhysical(
  player: Player,
  playerIndex: number,
  attackPhysical: AttackPhysical,
  j: number,
  damage: number,
  game: SmashedGame
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
  game: SmashedGame
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
  damage: number,
  game: SmashedGame
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
  game: SmashedGame
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

export function setOnDeadUpdateMatrix(
  playerIndex: number,
  game: SmashedGame
): void {
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

export function updateDeathsAndKillsMatrices(game: SmashedGame): void {
  game.players.forEach((player, playerIndex) => {
    updatePlayerNumberDeaths(player, playerIndex, game);
    updatePlayerNumberKills(player, playerIndex, game);
  });
}

export function updatePlayerNumberDeaths(
  player: Player,
  playerIndex: number,
  game: SmashedGame
): void {
  player.deathCount = game.numberKilledByMatrix[playerIndex].reduce(
    (partialSum, a) => partialSum + a,
    0
  );
}
export function updatePlayerNumberKills(
  player: Player,
  playerIndex: number,
  game: SmashedGame
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

export function getGameHitbackMultiplier(game: SmashedGame): number {
  const t = game.gameNanoseconds * 0.001;
  let h: number = 0;
  const m = t / 60;

  h = Math.pow(1 + m * 0.1, 1.7);
  // print('HBM', h);

  return h;
}

const lengthOfSuicideHold = 5000;
export function updateSuicide(game: SmashedGame): void {
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
      player.LRGameStamp = null;
      return;
    }

    if (player.LRGameStamp === null && (player.padPrev.L || player.padPrev.R)) {
      player.LRGameStamp = game.gameNanoseconds;
      print('LRStamp', player.LRGameStamp);
    }

    if (
      player.LRGameStamp &&
      getHasBeenGameDurationSinceMomentBoolean(
        lengthOfSuicideHold,
        player.LRGameStamp,
        game
      )
    ) {
      forceSuicide(player);
    }
  });
}

export function forceSuicide(player: Player) {
  print('SUICIDE');
  player.char.sprite.y = -200;
  player.char.sprite.x = SCREEN_DIMENSIONS.WIDTH * 0.5;
}

export function updateEmitterPlayerSuicide(game: SmashedGame): void {
  // print('game.players[0].emitterGamestamp', game.players[0].emitterGamestamp);

  game.players.forEach((player: Player, playerIndex: number) => {
    if (player.emitterPlayer.on && player.emitterGamestamp === null) {
      player.emitterGamestamp = game.gameNanoseconds;
    } else if (!player.emitterPlayer.on && player.emitterGamestamp !== null) {
      player.emitterGamestamp = null;
    }

    if (
      player.emitterGamestamp !== null &&
      getHasBeenGameDurationSinceMomentBoolean(
        lengthOfSuicideHold,
        player.emitterGamestamp,
        game
      )
    ) {
      // if too long commit suicide
      forceSuicide(player);
    }

    if (player.emitterGamestamp === null) {
      return;
    }

    const ratio = getHowLongSinceGameMomentAsRatio(
      lengthOfSuicideHold,
      player.emitterGamestamp,
      game
    );

    const v = getRandomVelocitiesBasedOnRatio(ratio, 1000);

    const newX = player.char.sprite.body.velocity.x + v.x;
    const newY = player.char.sprite.body.velocity.y + v.y;

    player.char.sprite.body.setVelocityX(newX);
    player.char.sprite.body.setVelocityY(newY);
  });
}

export const getRandomVelocitiesBasedOnRatio = (
  ratio: number,
  amount: number
): Velocity => {
  const ratioPow = Math.pow(ratio, 3);

  const randomX = (Math.random() - 0.5) * amount * ratioPow;
  const randomY = (Math.random() - 0.5) * amount * ratioPow;

  return {
    x: randomX,
    y: randomY,
  };
};

export function updateTableGiveHealth(game: SmashedGame): void {
  const { body } = game.TABLE;

  let charging: boolean = false;

  for (let i = 0; i < game.players.length; i++) {
    const p = game.players[i];

    const isCloseEnough: boolean =
      getDistance(body.x + 60, body.y, p.char.sprite.x, p.char.sprite.y) < 100;

    if (isCloseEnough && p.char.damageCurr !== 0) {
      charging = true;
      p.char.damageCurr = Math.max(
        0,
        p.char.damageCurr - game.table_health_give
      );
    }
  }

  if (charging) {
    setResumeSoundPowerup(game);
    if (Math.floor(game.timeNanoseconds / 2) % 2 === 0) {
      game.TABLE.setTint(0xffffff);
    } else {
      game.TABLE.setTintFill(0xffffff);
    }
  } else {
    game.TABLE.setTint(0xffffff);
    setPauseSoundPowerup(game);
  }
}

export function updateDamagePrev(game: SmashedGame): void {
  game.players.forEach((p, pIndex) => {
    p.char.damagePrev = p.char.damageCurr;
  });
}

export function onHitHandlerBulletBill(
  player: Player,
  playerIndex: number,
  game: SmashedGame
): void {
  if (player.state.name !== 'player-state-alive') {
    return;
  }

  const bulletBillOwnerIndex = game.bulletBillCombo.bullet.playerIndexOwns;

  if (playerIndex === bulletBillOwnerIndex) {
    return;
  }

  // Update "last hit by" information
  for (let bj = 0; bj < game.players.length; bj++) {
    if (bj === bulletBillOwnerIndex) {
      game.wasLastHitByMatrix[playerIndex][bj] = true;
      game.numberHitByMatrix[playerIndex][bj]++;
    } else {
      game.wasLastHitByMatrix[playerIndex][bj] = false;
    }
  }

  setPlayerState(player, playerIndex, 'player-state-hurt', game);

  player.char.damageCurr += game.bulletBillCombo.bullet.damage;

  const normalizedVector = getNormalizedVector(
    game.bulletBillCombo.bullet.sprite.x,
    game.bulletBillCombo.bullet.sprite.y,
    player.char.sprite.x,
    player.char.sprite.y
  );

  const hitback = game.bulletBillCombo.bullet.hitback;

  hitbackFly(
    player,
    game,
    normalizedVector.x * hitback.x,
    normalizedVector.y * hitback.y
  );
}

export const getNumberOfHitsTaken = (
  playerIndex: number,
  game: SmashedGame
): number => {
  return game.numberHitByMatrix[playerIndex].reduce((a, b) => a + b, 0);
};

export const getNumberOfHitsGiven = (
  playerIndex: number,
  game: SmashedGame
): number => {
  return game.numberHitByMatrix.reduce((a, b) => a + b[playerIndex], 0);
};

export const getNumberOfDeathsTaken = (
  playerIndex: number,
  game: SmashedGame
): number => {
  return game.numberKilledByMatrix[playerIndex].reduce((a, b) => a + b, 0);
};

export const getNumberOfDeathsGiven = (
  playerIndex: number,
  game: SmashedGame
): number => {
  return game.numberKilledByMatrix.reduce((a, b) => a + b[playerIndex], 0);
};

export const getNumberOfShotsTaken = (
  playerIndex: number,
  game: SmashedGame
): number => {
  return game.numberShotsTakenByMeMatrix[playerIndex].reduce(
    (a, b) => a + b,
    0
  );
};

export const getNumberOfShotsGiven = (
  playerIndex: number,
  game: SmashedGame
): number => {
  return game.numberShotsTakenByMeMatrix.reduce(
    (a, b) => a + b[playerIndex],
    0
  );
};

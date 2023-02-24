import Game, { SCREEN_DIMENSIONS } from '../Game';
import {
  AttackEnergy,
  Player,
  Position,
  Velocity,
  xyVector,
} from '../interfaces';
import { updateCanPlayerDodge } from './attacks';
import { getNormalizedVector } from './damage';
import {
  getDistance,
  getNearestAttackEnergyXY,
  getNearestPlayerAliveXY,
  hasPlayerTouchedWallRecently,
} from './movement';

export function getIsBot(player: Player, game: Game): boolean {
  if (player.inputType === 3) {
    return true;
  }
  return false;
}

export function getIsBotNearAnotherPlayerMedium(
  player: Player,
  game: Game,
  amount: number
): boolean {
  let nearestPlayerPosition: Position = {
    x: SCREEN_DIMENSIONS.WIDTH / 2,
    y: SCREEN_DIMENSIONS.HEIGHT / 2,
  };

  game.players.forEach((player, playerIndex) => {
    nearestPlayerPosition = getNearestPlayerAliveXY(player, playerIndex, game);
  });

  let distance = Math.sqrt(
    Math.pow(player.char.sprite.x - nearestPlayerPosition.x, 2) +
      Math.pow(player.char.sprite.y - nearestPlayerPosition.y, 2)
  );

  if (distance < amount) {
    return true;
  }

  return false;
}

export function getSameHorizontalSlice(player: Player, game: Game): boolean {
  let nearestPlayerPosition: Position = {
    x: SCREEN_DIMENSIONS.WIDTH / 2,
    y: SCREEN_DIMENSIONS.HEIGHT / 2,
  };

  game.players.forEach((player, playerIndex) => {
    nearestPlayerPosition = getNearestPlayerAliveXY(player, playerIndex, game);
  });

  let bot = player.char.sprite;

  if (
    nearestPlayerPosition.y > bot.Y + 120 &&
    nearestPlayerPosition.y < bot.Y - 50
  ) {
    return true;
  }

  return false;
}

export function getSameVerticalSlice(player: Player, game: Game): boolean {
  let nearestPlayerPosition: Position = {
    x: SCREEN_DIMENSIONS.WIDTH / 2,
    y: SCREEN_DIMENSIONS.HEIGHT / 2,
  };

  let bot = player.char.sprite;

  game.players.forEach((player, playerIndex) => {
    nearestPlayerPosition = getNearestPlayerAliveXY(player, playerIndex, game);
  });

  if (
    nearestPlayerPosition.x > bot.x - 200 &&
    nearestPlayerPosition.x < bot.x + 200
  ) {
    return true;
  }

  return false;
}

export function getIsBotFacingAnotherPlayer(
  player: Player,
  game: Game
): boolean {
  let nearestPlayerPosition: Position = {
    x: SCREEN_DIMENSIONS.WIDTH / 2,
    y: SCREEN_DIMENSIONS.HEIGHT / 2,
  };

  let bot = player.char.sprite;

  game.players.forEach((player, playerIndex) => {
    nearestPlayerPosition = getNearestPlayerAliveXY(player, playerIndex, game);
  });

  if (
    (bot.x > nearestPlayerPosition.x && bot.flipX) ||
    (bot.x < nearestPlayerPosition.x && !bot.flipX)
  ) {
    return true;
  }

  return false;
}

export function getIsBotTooFarLeft(player: Player, game: Game): boolean {
  let bot = player.char.sprite;
  let left = SCREEN_DIMENSIONS.WIDTH * 0.18;
  if (bot.x < left) {
    return true;
  }
  return false;
}
export function getIsBotTooFarRight(player: Player, game: Game): boolean {
  let bot = player.char.sprite;
  let right = SCREEN_DIMENSIONS.WIDTH * 0.93;
  if (bot.x > right) {
    return true;
  }
  return false;
}
export function getIsBotTooFarUp(player: Player, game: Game): boolean {
  let bot = player.char.sprite;
  let up = SCREEN_DIMENSIONS.HEIGHT * 0.2;
  if (bot.y < up) {
    return true;
  }
  return false;
}
export function getIsBotTooFarDown(player: Player, game: Game): boolean {
  let bot = player.char.sprite;
  let down = SCREEN_DIMENSIONS.HEIGHT * 0.9;
  if (bot.y > down) {
    return true;
  }
  return false;
}

export function getIsBotInPitAreaLeft(player: Player, game: Game): boolean {
  let bot = player.char.sprite;
  let left = SCREEN_DIMENSIONS.WIDTH * (17 / 34);
  let right = SCREEN_DIMENSIONS.WIDTH * (22 / 34);
  let center = (left + right) / 2;
  let up = SCREEN_DIMENSIONS.HEIGHT * (12 / 19);
  if (bot.x > left && bot.x < center && bot.y > up) {
    return true;
  }
  return false;
}
export function getIsBotInPitAreaRight(player: Player, game: Game): boolean {
  let bot = player.char.sprite;
  let left = SCREEN_DIMENSIONS.WIDTH * (17 / 34);
  let right = SCREEN_DIMENSIONS.WIDTH * (22 / 34);
  let center = (left + right) / 2;
  let up = SCREEN_DIMENSIONS.HEIGHT * (12 / 19);
  if (bot.x > center && bot.x < right && bot.y > up) {
    return true;
  }
  return false;
}
export function getIsBotInPitArea(player: Player, game: Game): boolean {
  let bot = player.char.sprite;
  let left = SCREEN_DIMENSIONS.WIDTH * (17 / 34);
  let right = SCREEN_DIMENSIONS.WIDTH * (22 / 34);
  let up = SCREEN_DIMENSIONS.HEIGHT * (12 / 19);
  if (bot.x > left && bot.x < right && bot.y > up) {
    return true;
  }
  return false;
}

export function allPadToFalse(player: Player): void {
  player.padCurr = {
    up: false,
    down: false,
    left: false,
    right: false,
    A: false,
    B: false,
    X: false,
    Y: false,
    L: false,
    R: false,
    start: false,
    select: false,
  };
}

export function updateBot(
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

  let nearestPlayerPosition: Position = getNearestPlayerAliveXY(
    player,
    playerIndex,
    game
  );

  let bot = player.char.sprite;

  let enemyVector: xyVector = getNormalizedVector(
    nearestPlayerPosition.x,
    nearestPlayerPosition.y,
    bot.x,
    bot.y
  );

  let v: Velocity = player.char.sprite.body.velocity;

  let d = player.padDebounced;
  let t = player.char.sprite.body.touching;
  let jumps = player.char.jumps;
  let jumpIndex = player.char.jumpIndex;
  let hasJump = player.char.jumps[jumpIndex] > 0.3;
  let onLastJump = jumpIndex === jumps.length - 1;

  // p.select = true;
  // p.L = true;

  //////////////////////
  // MOVEMENT
  //////////////////////
  if (getSameVerticalSlice(player, game)) {
  } else {
    if (enemyVector.x < 0) {
      p.right = true;
      p.left = false;
    } else {
      p.left = true;
      p.right = false;
    }
  }

  if (
    //////////////////////
    // WALL JUMPING
    //////////////////////
    (t.left || t.right) &&
    hasPlayerTouchedWallRecently(player)
  ) {
    p.Y = p.Y ? false : true;
  } else if (
    //////////////////////
    // JUMPING OFF GROUND
    //////////////////////
    v.x < 50 &&
    v.x > -50 &&
    (d.left === 9 || d.right === 9) &&
    t.down
  ) {
    p.Y = true;
  } else if (
    //////////////////////
    // AIR JUMPING
    //////////////////////
    enemyVector.y > 0 &&
    v.y > 0
  ) {
    p.Y = true;
  } else {
    p.Y = false;
  }

  //////////////////////
  // ENERGY ATTACK
  //////////////////////
  if (
    !getSameHorizontalSlice(player, game) &&
    !getIsBotNearAnotherPlayerMedium(player, game, 200) &&
    getIsBotFacingAnotherPlayer(player, game)
  ) {
    p.X = true;
  } else {
    p.X = false;
  }

  //////////////////////
  // PHYSICAL ATTACK
  //////////////////////
  if (
    getIsBotNearAnotherPlayerMedium(player, game, 200) &&
    getIsBotFacingAnotherPlayer(player, game)
  ) {
    p.A = true;
  } else {
    p.A = false;
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
  if (getIsBotTooFarUp(player, game)) {
    p.Y = false;
  }

  //////////////////////
  // LEFT SIDE OF PIT
  //////////////////////
  if (v.y > 0 && onLastJump && getIsBotInPitAreaLeft(player, game)) {
    p.left = true;
    p.right = false;
  }

  //////////////////////
  // RIGHT SIDE OF PIT
  //////////////////////
  if (v.y > 0 && onLastJump && getIsBotInPitAreaRight(player, game)) {
    p.right = true;
    p.left = false;
  }

  //////////////////////
  // DODGING
  //////////////////////
  updatePlayerDodgeIfAttackEnergyTooClose(player, playerIndex, game);
}

export type DodgeDirection =
  | 'up'
  | 'down'
  | 'left'
  | 'right'
  | 'up-left'
  | 'up-right'
  | 'down-left'
  | 'down-right';

export function getDodgeDirectionFromNormalizedVector(
  x: number,
  y: number
): DodgeDirection {
  const tolerance = 0.25;
  if (y < -tolerance) {
    if (x < -tolerance) {
      return 'up-left';
    } else if (x > tolerance) {
      return 'up-right';
    } else {
      return 'up';
    }
  } else if (y > tolerance) {
    if (x < -tolerance) {
      return 'down-left';
    } else if (x > tolerance) {
      return 'down-right';
    } else {
      return 'down';
    }
  } else {
    if (x < -tolerance) {
      return 'left';
    } else if (x > tolerance) {
      return 'right';
    } else {
      return 'up'; // ideally not possible
    }
  }
}

export const getDodgeDirectionPlayerToAttackEnergy = (
  p: Position,
  a: Position
): DodgeDirection => {
  let v: xyVector = getNormalizedVector(p.x, p.y, a.x, a.y);
  let direction: DodgeDirection = getDodgeDirectionFromNormalizedVector(
    v.x,
    v.y
  );
  console.log('direction', direction);
  return direction;
};

export const getIsNearestAttackEnergyTooClose = (
  player: Player,
  playerIndex: number,
  game: Game
): boolean => {
  let ae: Position = getNearestAttackEnergyXY(player, playerIndex, game);
  let distance: number = getDistance(
    player.char.sprite.x,
    player.char.sprite.y,
    ae.x,
    ae.y
  );
  return distance < 100;
};

export const updatePlayerDodgeInThisDirection = (
  player: Player,
  direction: DodgeDirection
): void => {
  let pc = player.padCurr;
  pc.B = true;

  switch (direction) {
    case 'up':
      pc.up = true;
      pc.down = false;
      pc.left = false;
      pc.right = false;
      break;
    case 'down':
      pc.down = true;
      pc.up = false;
      pc.left = false;
      pc.right = false;
      break;
    case 'left':
      pc.left = true;
      pc.right = false;
      pc.up = false;
      pc.down = false;
      break;
    case 'right':
      pc.right = true;
      pc.left = false;
      pc.up = false;
      pc.down = false;
      break;
    case 'up-left':
      pc.up = true;
      pc.left = true;
      pc.down = false;
      pc.right = false;
      break;
    case 'up-right':
      pc.up = true;
      pc.right = true;
      pc.down = false;
      pc.left = false;
      break;
    case 'down-left':
      pc.down = true;
      pc.left = true;
      pc.up = false;
      pc.right = false;
      break;
    case 'down-right':
      pc.down = true;
      pc.right = true;
      pc.up = false;
      pc.left = false;
      break;
  }
};

export const updatePlayerDodgeIfAttackEnergyTooClose = (
  player: Player,
  playerIndex: number,
  game: Game
): void => {
  if (
    updateCanPlayerDodge(player) &&
    getIsNearestAttackEnergyTooClose(player, playerIndex, game)
  ) {
    let ae: Position = getNearestAttackEnergyXY(player, playerIndex, game);
    let ps: Position = { x: player.char.sprite.x, y: player.char.sprite.y };
    let direction: DodgeDirection = getDodgeDirectionPlayerToAttackEnergy(
      ps,
      ae
    );
    updatePlayerDodgeInThisDirection(player, direction);
  } else {
    player.padCurr.B = false;
  }
};

import SmashedGame, { SCREEN_DIMENSIONS } from '../SmashedGame';
import {
  BulletBillButton,
  Player,
  Position,
  Velocity,
  xyVector,
} from '../types';
import { getIsPlayerInAir } from './attacks';
import { getNormalizedVector } from './damage';
import {
  getDistance,
  getNearestAttackEnergyXYAboveFromPlayer,
  getNearestAttackEnergyXYFromPlayer,
  getNearestPlayerAliveXYFromPlayer,
  hasPlayerTouchedWallRecently,
} from './movement';
export function getIsBot(player: Player, game: SmashedGame): boolean {
  if (player.inputType === 3) {
    return true;
  }
  return false;
}
export function getIsBotNearNearestPlayer(
  player: Player,
  playerIndex: number,
  game: SmashedGame,
  amount: number
): boolean {
  // let nearestPlayerPosition: Position | null = {
  //   x: SCREEN_DIMENSIONS.WIDTH / 2,
  //   y: SCREEN_DIMENSIONS.HEIGHT / 2,
  // };

  const nearestPlayerPosition: Position | null =
    getNearestPlayerAliveXYFromPlayer(player, playerIndex, game);

  if (nearestPlayerPosition === null) {
    return false;
  }

  const distance = Math.sqrt(
    Math.pow(player.char.sprite.x - nearestPlayerPosition.x, 2) +
      Math.pow(player.char.sprite.y - nearestPlayerPosition.y, 2)
  );

  if (distance < amount) {
    return true;
  }
  return false;
}
export function getSameHorizontalSlice(
  player: Player,
  playerIndex: number,
  game: SmashedGame
): boolean {
  const nearestPlayerPosition: Position | null =
    getNearestPlayerAliveXYFromPlayer(player, playerIndex, game);

  if (nearestPlayerPosition === null) {
    return false;
  }

  const bot = player.char.sprite;

  if (
    nearestPlayerPosition.y > bot.Y + 120 &&
    nearestPlayerPosition.y < bot.Y - 50
  ) {
    return true;
  }
  return false;
}
export function getSameVerticalSlice(
  player: Player,
  playerIndex: number,
  game: SmashedGame
): boolean {
  const nearestPlayerPosition: Position | null =
    getNearestPlayerAliveXYFromPlayer(player, playerIndex, game);
  const bot = player.char.sprite;
  if (nearestPlayerPosition === null) {
    return false;
  }

  if (
    nearestPlayerPosition.x > bot.x - 200 &&
    nearestPlayerPosition.x < bot.x + 200
  ) {
    return true;
  }
  return false;
}
export function getIsBotFacingNearestPlayer(
  player: Player,
  playerIndex: number,
  game: SmashedGame
): boolean {
  let bot = player.char.sprite;
  const nearestPlayerPosition: Position | null =
    getNearestPlayerAliveXYFromPlayer(player, playerIndex, game);

  if (nearestPlayerPosition === null) {
    return false;
  }

  if (
    (bot.x > nearestPlayerPosition.x && bot.flipX) ||
    (bot.x < nearestPlayerPosition.x && !bot.flipX)
  ) {
    return true;
  }
  return false;
}
export function getIsBotTooFarMiddleLeft(
  player: Player,
  game: SmashedGame
): boolean {
  let bot = player.char.sprite;
  let left = SCREEN_DIMENSIONS.WIDTH * 0.49;
  if (bot.x < left) {
    return true;
  }
  return false;
}
export function getIsBotTooFarMiddleRight(
  player: Player,
  game: SmashedGame
): boolean {
  let bot = player.char.sprite;
  let right = SCREEN_DIMENSIONS.WIDTH * 0.51;
  if (bot.x > right) {
    return true;
  }
  return false;
}
export function getIsBotTooFarCenterLeft(
  player: Player,
  game: SmashedGame
): boolean {
  let bot = player.char.sprite;
  let left = SCREEN_DIMENSIONS.WIDTH * 0.35;
  if (bot.x < left) {
    return true;
  }
  return false;
}
export function getIsBotTooFarCenterRight(
  player: Player,
  game: SmashedGame
): boolean {
  let bot = player.char.sprite;
  let right = SCREEN_DIMENSIONS.WIDTH * 0.65;
  if (bot.x > right) {
    return true;
  }
  return false;
}
export function getIsBotTooFarLeft(player: Player, game: SmashedGame): boolean {
  let bot = player.char.sprite;
  let left = SCREEN_DIMENSIONS.WIDTH * 0.07;
  if (bot.x < left) {
    return true;
  }
  return false;
}
export function getIsBotTooFarRight(
  player: Player,
  game: SmashedGame
): boolean {
  let bot = player.char.sprite;
  let right = SCREEN_DIMENSIONS.WIDTH * 0.892;
  if (bot.x > right) {
    return true;
  }
  return false;
}
export function getIsBotTooFarUp(player: Player, game: SmashedGame): boolean {
  const bot = player.char.sprite;
  const up = SCREEN_DIMENSIONS.HEIGHT * 0.33;

  return bot.y < up;
}
export function getIsBotTooFarDown(player: Player, game: SmashedGame): boolean {
  const bot = player.char.sprite;
  const down = SCREEN_DIMENSIONS.HEIGHT * 0.9;
  if (bot.y > down) {
    return true;
  }
  return false;
}
export function getIsBotInPitAreaLeft(
  player: Player,
  game: SmashedGame
): boolean {
  const bot = player.char.sprite;
  const pit = game.pit;
  const isInPitArea = bot.x > pit.left && bot.x < pit.middle && bot.y > pit.top;

  return isInPitArea;
}

export function getIsBotInPitArea(player: Player, game: SmashedGame): boolean {
  const p = player.char.sprite;
  const pit = game.pit;

  const isInPitArea = p.x >= pit.left && p.x <= pit.right && p.y >= pit.top;

  return isInPitArea;
}

export function getIsBotInPitAreaRight(
  player: Player,
  game: SmashedGame
): boolean {
  const bot = player.char.sprite;
  const pit = game.pit;

  const isInPitArea =
    bot.x >= pit.middle && bot.x <= pit.right && bot.y >= pit.top;

  return isInPitArea;
}
export function getIsBotInPitAreaBottom(
  player: Player,
  game: SmashedGame
): boolean {
  const bot = player.char.sprite;
  const p = game.pit;

  const isInPitArea = bot.x > p.left && bot.x < p.right && bot.y > p.lower;

  return isInPitArea;
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
  const v: xyVector = getNormalizedVector(p.x, p.y, a.x, a.y);
  const direction: DodgeDirection = getDodgeDirectionFromNormalizedVector(
    v.x,
    v.y
  );
  return direction;
};
export const getIsNearestAttackEnergyThisClose = (
  player: Player,
  playerIndex: number,
  game: SmashedGame,
  distance: number
): boolean => {
  const ae: Position | null = getNearestAttackEnergyXYFromPlayer(
    player,
    playerIndex,
    game
  );

  if (ae === null) {
    return false;
  }

  const dCalc: number = getDistance(
    player.char.sprite.x,
    player.char.sprite.y,
    ae.x,
    ae.y
  );
  return dCalc < distance;
};
export const getIsNearestAttackEnergyThisCloseAbove = (
  player: Player,
  playerIndex: number,
  game: SmashedGame,
  distance: number
): boolean => {
  const ae: Position | null = getNearestAttackEnergyXYAboveFromPlayer(
    player,
    playerIndex,
    game
  );

  if (ae === null) {
    return false;
  }

  const dCalc: number = getDistance(
    player.char.sprite.x,
    player.char.sprite.y,
    ae.x,
    ae.y
  );
  return dCalc < distance;
};
export const updatePlayerDodgeInThisDirection = (
  player: Player,
  direction: DodgeDirection
): void => {
  const pc = player.padCurr;
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
  game: SmashedGame
): void => {
  const shortRange = SCREEN_DIMENSIONS.HEIGHT * 0.2;
  const longRange = SCREEN_DIMENSIONS.HEIGHT * 0.5;
  const pCurr = player.padCurr;
  if (
    pCurr.B &&
    (getIsBotTooFarUp(player, game) ||
      getIsBotTooFarLeft(player, game) ||
      getIsBotTooFarRight(player, game))
  ) {
    player.padCurr.B = false;
    return;
  }
  if (
    pCurr.B &&
    !player.char.upB.canUse &&
    !getIsNearestAttackEnergyThisClose(player, playerIndex, game, longRange)
  ) {
    player.padCurr.B = false;
  }
  if (
    !pCurr.B &&
    getIsPlayerInAir(player) &&
    getIsNearestAttackEnergyThisClose(player, playerIndex, game, shortRange)
  ) {
    const ae: Position | null = getNearestAttackEnergyXYFromPlayer(
      player,
      playerIndex,
      game
    );

    if (ae === null) {
      return;
    }

    const ps: Position = { x: player.char.sprite.x, y: player.char.sprite.y };
    const direction: DodgeDirection = getDodgeDirectionPlayerToAttackEnergy(
      ps,
      ae
    );
    updatePlayerDodgeInThisDirection(player, direction);
  }
};

export function updateBotRules(
  player: Player,
  playerIndex: number,
  game: SmashedGame
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
  const nearestP: Position | null = getNearestPlayerAliveXYFromPlayer(
    player,
    playerIndex,
    game
  );
  const botSprite = player.char.sprite;

  let enemyVector: xyVector | null = null;
  if (nearestP !== null) {
    enemyVector = getNormalizedVector(
      botSprite.x,
      botSprite.y,
      nearestP.x,
      nearestP.y
    );
  }

  const pVelocity: Velocity = player.char.sprite.body.velocity;
  const d = player.padDebounced;
  const t = player.char.sprite.body.touching;
  const jumps = player.char.jumps;
  const jumpIndex = player.char.jumpIndex;
  const onLastJump = jumpIndex === jumps.length - 1;

  const button: BulletBillButton = game.bulletBillCombo.button;

  const isPlayerOneAndTraining: boolean =
    game.debug.Simple_Stage && playerIndex === 0;

  //////////////////////
  // DODGING
  //////////////////////
  updatePlayerDodgeIfAttackEnergyTooClose(player, playerIndex, game);
  //////////////////////
  // MOVEMENT
  //////////////////////
  if (getSameVerticalSlice(player, playerIndex, game)) {
  } else {
    if (enemyVector !== null && enemyVector.x > 0) {
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
  if (
    !game.debug.Simple_Stage &&
    !isPlayerOneAndTraining &&
    !game.flag.completedCurr
  ) {
    ///////////////////////
    // ON GROUND
    ///////////////////////
    if (
      t.down &&
      Math.random() >
        (player.emitterDark.visible
          ? 0
          : game.flag.toucherCurr.id === null
          ? 0.5
          : game.flag.ownerCurr.id === null
          ? 0.1
          : game.flag.ownerCurr.id === playerIndex
          ? 0.001
          : player.emitterDark.visible
          ? 0
          : 0.5)
    ) {
      if (botSprite.x < game.flag.spriteFlagPole.x - botSprite.width * 0.1) {
        p.right = true;
        p.left = false;
      } else if (
        botSprite.x >
        game.flag.spriteFlagPole.x + botSprite.width * 0.2
      ) {
        p.left = true;
        p.right = false;
      } else if (
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
    ///////////////////////
    // IN AIR
    ///////////////////////
    if (
      !t.down &&
      Math.random() >
        (player.emitterDark.visible
          ? 0
          : game.flag.toucherCurr.id === null
          ? 0.5
          : game.flag.ownerCurr.id === null
          ? 0.1
          : game.flag.ownerCurr.id === playerIndex
          ? 0.001
          : player.emitterDark.visible
          ? 0
          : 0.5)
    ) {
      if (botSprite.x < game.flag.spriteFlagPole.x - 300) {
        p.right = true;
        p.left = false;
      }
    }
  }

  if (
    //////////////////////
    // WALL JUMPING
    //////////////////////
    (t.left || t.right) &&
    hasPlayerTouchedWallRecently(player) &&
    Math.random() > 0.01
  ) {
    p.Y = !p.Y;
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
    enemyVector !== null &&
    enemyVector.y < 0 &&
    pVelocity.y > 0 &&
    Math.random() > 0.9
  ) {
    p.Y = !p.Y;
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
    !getSameHorizontalSlice(player, playerIndex, game) &&
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
  if (getIsBotTooFarUp(player, game)) {
    p.Y = false;
    p.down = true;
    p.up = false;
  } else {
    p.down = false;
  }
  //////////////////////
  // LEFT SIDE OF PIT AND FALLING
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
  // RIGHT SIDE OF PIT AND FALLING
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
  //////////////////////
  // PIT AND TOUCHING DOWN
  //////////////////////
  if (
    pVelocity.y > 0 &&
    getIsBotInPitAreaBottom(player, game) &&
    Math.random() > 0.01
  ) {
    p.Y = !p.Y;
  }

  //////////////////////
  // IF BUTTON STATE IS NOT FIRING RUN TOWARDS BUTTON
  //////////////////////
  if (game.bulletBillCombo.stateCurr !== 'shooting' && Math.random() < 0.01) {
    if (
      player.char.sprite.body.position.x + player.char.sprite.body.width / 2 <
      button.posInit.x
    ) {
      p.right = true;
      p.left = false;
    } else {
      p.left = true;
      p.right = false;
    }
  }

  //////////////////////
  // STOP IF TOUCHING BUTTON
  //////////////////////

  if (!isPlayerOneAndTraining && button.playerIndexPressing === playerIndex) {
    const buttonPosition = button.spriteDown.body.position.x;
    const buttonWidth = button.spriteDown.width / 6;
    const playerPosition = player.char.sprite.body.position.x;

    if (playerPosition < buttonPosition) {
      p.right = true;
      p.left = false;
    } else if (buttonPosition < playerPosition) {
      p.left = true;
      p.right = false;
    }
  }

  //////////////////////
  // STOP IF HEALTH CURR GREATER THAN HEALTH PREV
  //////////////////////
  // if (
  //   !isPlayerOneAndTraining &&
  //   player.char.damageCurr < player.char.damagePrev
  // ) {
  //   p.up = false;
  //   p.down = false;
  //   p.left = false;
  //   p.right = false;

  //   p.Y = false;
  // }
}

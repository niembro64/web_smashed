import { print } from '../../views/client';
import SmashedGame, { SCREEN_DIMENSIONS } from '../SmashedGame';
import { InputType, Player } from '../types';
import {
  getIsAttackEnergyOffscreen,
  isAttackEnergyNearPlayer,
  setPhysicsAttackEnergyOff,
  setPhysicsAttackEnergyOn,
} from './attacks';
import { updateBotNN } from './botNN';
import { updateBotRules } from './botRB';
import { updatePadCurrKeyboard } from './keyboard';
import { getIsSpriteMoving } from './movement';
import { getHasBeenGameDurationSinceMomentBoolean } from './powers';
import { GamepadManager } from './GamepadManager';

const gamepadManager = GamepadManager.getInstance();

export function updateGamePadsMaster(game: SmashedGame): void {
  let numPlayers = game.players.length;
  const connectedGamepads = gamepadManager.getConnectedGamepads();
  let padIndex = 0;

  // Assign gamepads to players who need them
  for (let i = 0; i < numPlayers; i++) {
    if (game.players[i].inputType === 1 && padIndex < connectedGamepads.length) {
      game.players[i].gamepad = game.input.gamepad.getPad(connectedGamepads[padIndex].index);
      padIndex++;
    }
  }

  // Update each player's input
  game.players.forEach((player, playerIndex) => {
    let inputType: InputType = player.inputType;

    switch (inputType) {
      case 0: // None
        break;
      case 1: // Gamepad
        if (player?.gamepad) {
          updatePadCurrGamepad(player, playerIndex, game);
        }
        break;
      case 2: // Keyboard
        updatePadCurrKeyboard(player, game);
        break;
      case 3: // Rule-based Bot
        updateBotRules(player, playerIndex, game);
        break;
      case 4: // Neural Network Client
        updateBotNN(player, playerIndex, game, inputType);
        break;
      case 5: // Neural Network Express
        updateBotNN(player, playerIndex, game, inputType);
        break;
      default:
        break;
    }
  });
}

export function updatePadCurrGamepad(
  player: Player,
  playerIndex: number,
  game: SmashedGame
): void {
  // Get the gamepad state using the new GamepadManager
  const gamepadState = gamepadManager.getGamepadState(player.gamepad.index);
  
  if (!gamepadState) {
    // Reset all inputs to false when no gamepad state is available
    player.padCurr.A = false;
    player.padCurr.B = false;
    player.padCurr.X = false;
    player.padCurr.Y = false;
    player.padCurr.L = false;
    player.padCurr.R = false;
    player.padCurr.start = false;
    player.padCurr.select = false;
    player.padCurr.up = false;
    player.padCurr.down = false;
    player.padCurr.left = false;
    player.padCurr.right = false;
    return;
  }
  
  // Update player's pad current state
  player.padCurr.A = gamepadState.A;
  player.padCurr.B = gamepadState.B;
  player.padCurr.X = gamepadState.X;
  player.padCurr.Y = gamepadState.Y;
  player.padCurr.L = gamepadState.L;
  player.padCurr.R = gamepadState.R;
  player.padCurr.start = gamepadState.start;
  player.padCurr.select = gamepadState.select;
  
  // D-pad / movement
  player.padCurr.up = gamepadState.up;
  player.padCurr.down = gamepadState.down;
  player.padCurr.left = gamepadState.left;
  player.padCurr.right = gamepadState.right;
  
  // Debug logging
  if (game.debug.Console_Log_Buttons) {
    const buttons = ['A', 'B', 'X', 'Y', 'L', 'R', 'start', 'select', 'up', 'down', 'left', 'right'];
    buttons.forEach(button => {
      if (gamepadState[button]) {
        print(`Player ${playerIndex} pressed ${button}`);
      }
    });
  }
}

// Keep the old functions for backwards compatibility but mark as deprecated
/** @deprecated Use updatePadCurrGamepad instead */
export function updatePadCurrControllerTypePro(
  player: Player,
  game: SmashedGame
): void {
  updatePadCurrGamepad(player, 0, game);
}

/** @deprecated Use updatePadCurrGamepad instead */
export function updatePadCurrControllerTypeHat(
  player: Player,
  game: SmashedGame
): void {
  updatePadCurrGamepad(player, 0, game);
}

/** @deprecated Use updatePadCurrGamepad instead */
export function updatePadCurrControllerTypeButtons(
  player: Player,
  playerIndex: number,
  game: SmashedGame
): void {
  updatePadCurrGamepad(player, playerIndex, game);
}

export function getControllerIsRealController(gamepad: Gamepad): boolean {
  return gamepadManager.isRealController(gamepad);
}

export function getIsAnyPlayerPausing(game: SmashedGame): boolean {
  for (let i = 0; i < game.players.length; i++) {
    if (getPlayerPauses(game.players[i], game)) {
      return true;
    }
  }
  return false;
}

export function getPlayerPauses(player: Player, game: SmashedGame): boolean {
  return getPlayerPressedStart(player, game);
  // getPlayerPressedBothLR(player, game) || getPlayerPressedStart(player, game)
}

export function getPlayerPressedStart(
  player: Player,
  game: SmashedGame
): boolean {
  if (player.padCurr.start) {
    return true;
  }

  return false;
}
export function getPlayerPressedBothLR(
  player: Player,
  game: SmashedGame
): boolean {
  if (player.padCurr.L && player.padCurr.R) {
    return true;
  }

  return false;
}

export function getIsPlayerReady(player: Player, game: SmashedGame): boolean {
  if (player.padCurr.L && player.padCurr.R) {
    return false;
  }

  if (player.padCurr.start) {
    return false;
  }

  if (
    !player.padCurr.up &&
    !player.padCurr.down &&
    !player.padCurr.left &&
    !player.padCurr.right &&
    !player.padCurr.A &&
    !player.padCurr.B &&
    !player.padCurr.X &&
    !player.padCurr.Y &&
    !player.padCurr.R &&
    !player.padCurr.L &&
    !player.padCurr.select
  ) {
    return false;
  }
  return true;
}

export function getIsAllPlayersReady(game: SmashedGame): boolean {
  for (let i = 0; i < game.players.length; i++) {
    if (
      !game.players[i].padCurr.up &&
      !game.players[i].padCurr.down &&
      !game.players[i].padCurr.left &&
      !game.players[i].padCurr.right &&
      !game.players[i].padCurr.A &&
      !game.players[i].padCurr.B &&
      !game.players[i].padCurr.X &&
      !game.players[i].padCurr.Y &&
      !game.players[i].padCurr.R &&
      !game.players[i].padCurr.L
    ) {
      return false;
    }
  }
  return true;
}

export function resetMyHitByMatrix(
  player: Player,
  playerIndex: number,
  game: SmashedGame
): void {
  if (player.state.name === 'player-state-hurt') {
    return;
  }
  for (let j = 0; j < game.players.length; j++) {
    game.wasLastHitByMatrix[playerIndex][j] = false;
  }
}

export function updateAttackEnergyFrictionGroundRotation(
  game: SmashedGame
): void {
  game.players.forEach((player, playerIndex) => {
    if (player.char.attackEnergy.sprite.body.touching.down) {
      player.char.attackEnergy.sprite.setAngularVelocity(
        player.char.attackEnergy.sprite.body.angularVelocity *
          player.char.attackEnergy.friction.ground
      );
    }
  });
}

export function updateAttackEnergyFrictionGroundMovement(
  game: SmashedGame
): void {
  game.players.forEach((player, playerIndex) => {
    if (player.char.attackEnergy.sprite.body.touching.down) {
      player.char.attackEnergy.sprite.setVelocityX(
        player.char.attackEnergy.sprite.body.velocity.x *
          player.char.attackEnergy.friction.ground
      );
    }
  });
}

export function updateAttackEnergyFrictionWall(game: SmashedGame): void {
  game.players.forEach((player, playerIndex) => {
    if (
      player.char.attackEnergy.friction.wallInvertRotation &&
      (player.char.attackEnergy.sprite.body.touching.left ||
        player.char.attackEnergy.sprite.body.touching.right)
    ) {
      player.char.attackEnergy.sprite.setAngularVelocity(
        -player.char.attackEnergy.sprite.body.angularVelocity
      );

      if (player.char.attackEnergy.friction.wallInvertSprite) {
        player.char.attackEnergy.sprite.flipX =
          !player.char.attackEnergy.sprite.flipX;
      }
    }
  });
}

export function updatePlayerHoldAttackEnergy(player: Player): void {
  player.char.attackEnergy.sprite.body.allowGravity = false;

  // player.char.attackEnergy.sprite.body.setVelocityX(0);
  // player.char.attackEnergy.sprite.body.setVelocityY(0);

  if (player.char.sprite.flipX) {
    player.char.attackEnergy.sprite.x =
      player.char.sprite.x - player.char.attackEnergy.posFromCenter.x;
    player.char.attackEnergy.sprite.y =
      player.char.sprite.y + player.char.attackEnergy.posFromCenter.y;

    player.char.attackEnergy.sprite.flipX = true;
    player.char.attackEnergy.sprite.setRotation(
      (player.char.attackEnergy.rotation.initial * Math.PI) / 2
    );
    player.char.attackEnergy.sprite.setAngularVelocity(0);
  } else {
    player.char.attackEnergy.sprite.x =
      player.char.sprite.x + player.char.attackEnergy.posFromCenter.x;
    player.char.attackEnergy.sprite.y =
      player.char.sprite.y + player.char.attackEnergy.posFromCenter.y;

    player.char.attackEnergy.sprite.flipX = false;
    player.char.attackEnergy.sprite.setRotation(
      player.char.attackEnergy.rotation.initial
    );
    player.char.attackEnergy.sprite.setAngularVelocity(0);
  }
}

// export function playerReturnedAttackEnergy(player: Player): void {
//   if (!player.char.attackEnergy.followOnOffscreen) {
//     return;
//   }

//   player.char.attackEnergy.sprite.body.allowGravity = false;

//   // player.char.attackEnergy.sprite.body.setVelocityX(0);
//   // player.char.attackEnergy.sprite.body.setVelocityY(0);

//   if (player.char.sprite.flipX) {
//     player.char.attackEnergy.sprite.x =
//       player.char.sprite.x - player.char.attackEnergy.followOnOffscreenOffset.x;
//     player.char.attackEnergy.sprite.y =
//       player.char.sprite.y + player.char.attackEnergy.followOnOffscreenOffset.y;

//     player.char.attackEnergy.sprite.flipX = true;
//     player.char.attackEnergy.sprite.setRotation(
//       (player.char.attackEnergy.rotation.initial * Math.PI) / 2
//     );
//     player.char.attackEnergy.sprite.setAngularVelocity(0);
//   } else {
//     player.char.attackEnergy.sprite.x =
//       player.char.sprite.x + player.char.attackEnergy.followOnOffscreenOffset.x;
//     player.char.attackEnergy.sprite.y =
//       player.char.sprite.y + player.char.attackEnergy.followOnOffscreenOffset.y;

//     player.char.attackEnergy.sprite.flipX = false;
//     player.char.attackEnergy.sprite.setRotation(
//       player.char.attackEnergy.rotation.initial
//     );
//     player.char.attackEnergy.sprite.setAngularVelocity(0);
//   }
// }

export function playerShootAttackEnergy(
  player: Player,
  game: SmashedGame
): void {
  let ae = player.char.attackEnergy;
  const vX =
    player.char.sprite.body.velocity.x * player.char.attackEnergy.VEL.x * 0.5;
  let vY = 0;
  if (ae.allowVelocityY) {
    vY = 300 * ae.VEL.y;
    vY += player.char.sprite.body.velocity.y * 0.5;
  }

  if (ae.allowVelocityY && ae.gravity) {
    ae.sprite.body.allowGravity = true;
  }

  if (player.char.sprite.flipX) {
    ae.sprite.x = player.char.sprite.x - ae.posFromCenter.x;
    ae.sprite.y = player.char.sprite.y + ae.posFromCenter.y;

    ae.sprite.body.setVelocityX(-1 * game.BASE_PLAYER_ATTACKENERGY.x + vX);
    ae.sprite.body.setVelocityY(vY);

    ae.sprite.flipX = true;
    ae.sprite.setRotation((ae.rotation.initial * Math.PI) / 2);
    ae.sprite.setAngularVelocity(ae.rotation.speed * Math.PI * -1);
  } else {
    ae.sprite.x = player.char.sprite.x + ae.posFromCenter.x;
    ae.sprite.y = player.char.sprite.y + ae.posFromCenter.y;

    ae.sprite.body.setVelocityX(game.BASE_PLAYER_ATTACKENERGY.x + vX);
    ae.sprite.body.setVelocityY(vY);

    ae.sprite.flipX = false;
    ae.sprite.setRotation(ae.rotation.initial);
    ae.sprite.setAngularVelocity(ae.rotation.speed * Math.PI);
  }
}

export function playerGrabAttackEnergy(player: Player): void {
  player.char.attackEnergy.sprite.body.setVelocityX(0);
  player.char.attackEnergy.sprite.body.setVelocityY(0);
}

export function updateAttackEnergy(player: Player, game: SmashedGame): void {
  let ae = player.char.attackEnergy;
  let b = player.char.sprite.body;
  let s = player.char.sprite;
  if (
    game.debug.Bullets_Allow_Groups &&
    ae.attackBullets !== null &&
    ae.attackBullets.bullets !== null
  ) {
    // if (player.padCurr.X && !player.padPrev.X) {
    if (player.padCurr.X) {
      let ps = player.char.sprite;

      let pos: { x: number; y: number };
      if (s.flipX) {
        pos = { x: ps.x - ae.posFromCenter.x, y: ps.y + ae.posFromCenter.y };
      } else {
        pos = { x: ps.x + ae.posFromCenter.x, y: ps.y + ae.posFromCenter.y };
      }

      let vX = b.velocity.x * ae.VEL.x;

      let vY = 0;
      let vYRandom = Math.random() * 1000 - 250;
      vY = 300 * player.char.attackEnergy.VEL.y + vYRandom;
      vY += b.velocity.y * 0.5;
      vY = vY * 0.8;

      let velX: number = 0;
      let velY: number = 0;

      // y^2 == r^2 - x^2
      // y == sqrt(r^2 - x^2)
      vX = Math.sqrt(Math.pow(750, 2) - Math.pow(vY, 2));

      if (player.char.sprite.flipX) {
        velX = -1 * vX;
        velY = vY;
      } else {
        velX = vX;
        velY = vY;
      }
      let vel: { x: number; y: number } = { x: velX, y: velY };
      let firstFire = !player.padPrev.X;
      ae.attackBullets.bullets.fireBullet(pos, vel, player, firstFire, game);
      // ae.bullets.soundBullets.play();
    }
    return;
  }

  ////////////////////////////////////////////////
  //////////// NORMAL ATTACK ENERGY
  ////////////////////////////////////////////////

  if (
    !getIsAttackEnergyOffscreen(player.char.attackEnergy) &&
    !isAttackEnergyNearPlayer(player) &&
    getIsSpriteMoving(player.char.attackEnergy.sprite)
  ) {
    return;
  }

  // STATE HOLD
  if (
    player.padCurr.X &&
    getHasBeenGameDurationSinceMomentBoolean(
      player.char.attackEnergy.durationCooldown,
      player.char.attackEnergy.timestampThrow,
      game
    )
  ) {
    // print('holding');
    player.char.attackEnergy.state = 'holding';
    setPhysicsAttackEnergyOff(player);
    updatePlayerHoldAttackEnergy(player);
  } else if (
    !player.padCurr.X &&
    player.padPrev.X &&
    getHasBeenGameDurationSinceMomentBoolean(
      player.char.attackEnergy.durationCooldown,
      player.char.attackEnergy.timestampThrow,
      game
    )
  ) {
    // print('released');
    game.SOUND_GUN.play();
    player.char.attackEnergy.timestampThrow = game.gameNanoseconds;
    player.char.attackEnergy.state = 'released';
    setPhysicsAttackEnergyOn(player);
    playerShootAttackEnergy(player, game);
  }

  // STATE RETURNED
  // if (
  //   !player.char.attackEnergy.offscreenCurr &&
  //   player.char.attackEnergy.offscreenPrev &&
  //   game.gameNanoseconds >
  //     player.char.attackEnergy.timestampThrow +
  //       player.char.attackEnergy.durationCooldown
  // ) {
  //   player.char.attackEnergy.state = 'returned';
  //   setPhysicsAttackEnergyOff(player);
  //   // playerReturnedAttackEnergy(player);
  // }
}

export function isSpriteOffscreen(
  sprite: Phaser.GameObjects.Sprite,
  game: SmashedGame
): boolean {
  if (
    sprite.x > SCREEN_DIMENSIONS.WIDTH ||
    sprite.x < 0 ||
    sprite.y > SCREEN_DIMENSIONS.HEIGHT ||
    sprite.y < 0
  ) {
    return true;
  }
  return false;
}

export function updatePadPreviousAndDebounced(game: SmashedGame): void {
  game.players.forEach((player) => {
    const c = player.padCurr;
    const p = player.padPrev;
    const d = player.padDebounced;
    const k = game.GAMEPAD_DEBOUNCE_NUMBER_CYCLES;

    // if (c.up !== p.up) {
    //   print('c.up', c.up, 'p.up', p.up);
    // }
    p.up = c.up;
    p.down = c.down;
    p.left = c.left;
    p.right = c.right;
    p.A = c.A;
    p.B = c.B;
    p.X = c.X;
    p.Y = c.Y;
    p.L = c.L;
    p.R = c.R;
    p.start = c.start;
    p.select = c.select;

    // player.char.sprite.zoom = 1;

    if (c.up) {
      d.up += d.up >= k ? 0 : 1;
    } else {
      d.up += d.up <= 0 ? 0 : -1;
    }
    if (c.down) {
      d.down += d.down >= k ? 0 : 1;
    } else {
      d.down += d.down <= 0 ? 0 : -1;
    }
    if (c.left) {
      d.left += d.left >= k ? 0 : 1;
    } else {
      d.left += d.left <= 0 ? 0 : -1;
    }
    if (c.right) {
      d.right += d.right >= k ? 0 : 1;
    } else {
      d.right += d.right <= 0 ? 0 : -1;
    }

    if (c.A) {
      d.A += d.A >= k ? 0 : 1;
    } else {
      d.A += d.A <= 0 ? 0 : -1;
    }
    if (c.B) {
      d.B += d.B >= k ? 0 : 1;
    } else {
      d.B += d.B <= 0 ? 0 : -1;
    }
    if (c.X) {
      d.X += d.X >= k ? 0 : 1;
    } else {
      d.X += d.X <= 0 ? 0 : -1;
    }
    if (c.Y) {
      d.Y += d.Y >= k ? 0 : 1;
    } else {
      d.Y += d.Y <= 0 ? 0 : -1;
    }

    if (c.L) {
      d.L += d.L >= k ? 0 : 1;
    } else {
      d.L += d.L <= 0 ? 0 : -1;
    }
    if (c.R) {
      d.R += d.R >= k ? 0 : 1;
    } else {
      d.R += d.R <= 0 ? 0 : -1;
    }

    if (c.start) {
      d.start += d.start >= k ? 0 : 1;
    } else {
      d.start += d.start <= 0 ? 0 : -1;
    }
    if (c.select) {
      d.select += d.select >= k ? 0 : 1;
    } else {
      d.select += d.select <= 0 ? 0 : -1;
    }
  });
}

export function debugUpdateControllersPrintConnected(game: SmashedGame): void {
  if (!game.debug.Console_Log_Connected) {
    return;
  }
  const connectedGamepads = gamepadManager.getConnectedGamepads();
  connectedGamepads.forEach((gamepad, index) => {
    print(`Connected Gamepad ${index}: ${gamepad.id}`);
  });
}

export function updateControllerMovement(
  player: Player,
  game: SmashedGame
): void {
  if (!player.gamepad) {
    print('NO GAMEPAD');
    return;
  }

  if (
    !player.padCurr.left &&
    !player.padCurr.right &&
    !player.padCurr.up &&
    !player.padCurr.down
  ) {
    return;
  }

  if (player.emitterPlayer.on) {
    return;
  }

  if (player.padCurr.up) {
    player.char.sprite.body.setVelocityY(
      player.char.sprite.body.velocity.y +
        -game.BASE_PLAYER_SPEED.y *
          player.char.speed *
          player.char.fast *
          (1 - game.RATIO_ACCELERATION_VELOCITY)
    );
  }
  if (player.padCurr.down) {
    player.char.sprite.body.setVelocityY(
      player.char.sprite.body.velocity.y +
        game.BASE_PLAYER_SPEED.y *
          player.char.speed *
          player.char.fast *
          (1 - game.RATIO_ACCELERATION_VELOCITY)
    );
  }
  if (player.padCurr.left) {
    player.char.sprite.body.setVelocityX(
      player.char.sprite.body.velocity.x *
        game.RATIO_ACCELERATION_VELOCITY *
        Math.pow(1 - player.char.friction_air, 3) +
        -game.BASE_PLAYER_SPEED.x *
          player.char.speed *
          player.char.fast *
          (1 - game.RATIO_ACCELERATION_VELOCITY)
    );
  }
  if (player.padCurr.right) {
    player.char.sprite.body.setVelocityX(
      player.char.sprite.body.velocity.x *
        game.RATIO_ACCELERATION_VELOCITY *
        Math.pow(1 - player.char.friction_air, 3) +
        game.BASE_PLAYER_SPEED.x *
          player.char.speed *
          player.char.fast *
          (1 - game.RATIO_ACCELERATION_VELOCITY)
    );
  }
}

export function debugUpdatePrintAllControllerButtonsWhenActive(
  game: SmashedGame
): void {
  if (!game.debug.Console_Log_Buttons) {
    return;
  }
  // Buttons
  game.players.forEach((player, playerIndex) => {
    if (player.gamepad) {
      if (player.padCurr.B) {
        print(player.playerId, 'B');
      }
      if (player.padCurr.A) {
        print(player.playerId, 'A');
      }
      if (player.padCurr.X) {
        print(player.playerId, 'X');
      }
      if (player.padCurr.Y) {
        print(player.playerId, 'Y');
        // player.char.fast = 2;
      }

      //  D Pad
      if (player.padCurr.down) {
        print(player.playerId, 'down');
      }
      if (player.padCurr.up) {
        print(player.playerId, 'up');
      }
      if (player.padCurr.left) {
        print(player.playerId, 'left');
      }
      if (player.padCurr.right) {
        print(player.playerId, 'right');
      }

      // L R Buttons
      if (player.padCurr.L) {
        print(player.playerId, 'L');
      }
      if (player.padCurr.R) {
        print(player.playerId, 'R');
      }
    }
  });
}
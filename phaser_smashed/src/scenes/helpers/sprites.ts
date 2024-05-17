import { print } from '../../views/client';
import SmashedGame from '../SmashedGame';
import { Player, SpriteStateName } from '../interfaces';
import { hasPlayerTouchedWallRecently } from './movement';
import { getHasBeenGameDurationSinceMoment } from './powers';

export function updateSpritesFlipX(game: SmashedGame): void {
  game.players.forEach((player) => {
    if (!hasPlayerTouchedWallRecently(player)) {
      if (player.char.sprite.body.velocity.x === 0) {
      } else if (player.char.sprite.body.velocity.x > 0) {
        player.char.sprite.flipX = false;
      } else {
        player.char.sprite.flipX = true;
      }
    }
  });
}

export function updateAllSpriteFilters(game: SmashedGame): void {
  game.players.forEach((player, playerIndex) => {
    updateSpriteFilter(player, playerIndex, game);
  });
}

export function updateSpriteFilter(
  player: Player,
  playerIndex: number,
  game: SmashedGame
): void {
  const isFlicker =
    Math.floor(
      (game.gameNanoseconds - player.state.gameStamp) /
        game.DURATION_PLAYER_FILTER_FLICKER_SLOW
    ) %
      2 ===
    0;

  if (player.char.colorFilterBlink) {
    if (player.state.name === 'player-state-hurt') {
      if (player.char.powerStateCurr.name === 'dark') {
        filterPlayer(player, playerIndex, game, isFlicker ? 'Red' : 'Dark');
        return;
      }
      filterPlayer(player, playerIndex, game, isFlicker ? 'Red' : 'Normal');
      return;
    }
    filterPlayer(player, playerIndex, game, isFlicker ? 'Dark' : 'Normal');
    return;
  }

  if (player.char.powerStateCurr.name === 'dark') {
    filterPlayerDark(player, playerIndex, game);
    return;
  }

  if (player.emitterPlayer.on) {
    filterPlayerID(player, playerIndex, game);
    return;
  }

  if (player.char.damageCurr < player.char.damagePrev) {
    const isFastFlicker =
      Math.floor(
        (game.gameNanoseconds - player.state.gameStamp) /
          game.DURATION_PLAYER_FILTER_FLICKER_FAST
      ) %
        2 ===
      0;
    filterPlayer(player, playerIndex, game, isFastFlicker ? 'White' : 'Normal');
    return;
  }

  filterPlayerNormal(player, playerIndex, game);
}

function filterPlayer(
  player: Player,
  playerIndex: number,
  game: SmashedGame,
  filterType: string
) {
  switch (filterType) {
    case 'Red':
      filterPlayerRed(player, playerIndex, game);
      break;
    case 'Dark':
      filterPlayerDark(player, playerIndex, game);
      break;
    case 'White':
      filterPlayerWhite(player, playerIndex, game);
      break;
    case 'Normal':
    default:
      filterPlayerNormal(player, playerIndex, game);
      break;
  }
}

////////////////////////
// FILTER PLAYERS
////////////////////////

export function filterPlayerTDark(
  player: Player,
  playerIndex: number,
  game: SmashedGame
): void {
  if (game.debug.Chars_Colored) {
    setFillPlayerTDark(player, game);
  } else {
    setTintPlayerTDark(player, game);
  }
}
export function filterPlayerDark(
  player: Player,
  playerIndex: number,
  game: SmashedGame
): void {
  if (game.debug.Chars_Colored) {
    setFillPlayerDark(player, game);
  } else {
    setTintPlayerDark(player, game);
  }
}

export function filterPlayerNormal(
  player: Player,
  playerIndex: number,
  game: SmashedGame
): void {
  if (game.debug.Chars_Colored) {
    setFillPlayerID(player, game.colorCircles[playerIndex].colorNumber);
  } else {
    setTintPlayerNormal(player, game);
  }
}

export function filterPlayerTRed(
  player: Player,
  playerIndex: number,
  game: SmashedGame
): void {
  if (game.debug.Chars_Colored) {
    setFillPlayerTRed(player, game);
  } else {
    setTintPlayerTRed(player, game);
  }
}
export function filterPlayerRed(
  player: Player,
  playerIndex: number,
  game: SmashedGame
): void {
  if (game.debug.Chars_Colored) {
    setFillPlayerRed(player, game);
  } else {
    setTintPlayerRed(player, game);
  }
}
export function filterPlayerWhite(
  player: Player,
  playerIndex: number,
  game: SmashedGame
): void {
  if (game.debug.Chars_Colored) {
    setFillPlayerWhite(player, game);
  } else {
    setFillPlayerWhiteT(player, game);
  }
}

export function filterPlayerID(
  player: Player,
  playerIndex: number,
  game: SmashedGame
): void {
  if (game.debug.Chars_Colored) {
    setFillPlayerID(player, game.colorCircles[playerIndex].colorNumber);
  } else {
    setTintPlayerID(player, game.colorCircles[playerIndex].colorNumber);
  }
}

export function setTintPlayerNormal(player: Player, game: SmashedGame): void {
  player.char.sprite.setTint(0xffffff);
  player.char.sprite.setAlpha(1);
}
export function setTintPlayerID(player: Player, circleColor: number): void {
  player.char.sprite.setTint(circleColor);
  player.char.sprite.setAlpha(1);
}
export function setTintPlayerRed(player: Player, game: SmashedGame): void {
  player.char.sprite.setTint(0xaa3333);
  player.char.sprite.setAlpha(1);
}
export function setTintPlayerTRed(player: Player, game: SmashedGame): void {
  player.char.sprite.setTint(0xaa3333);
  player.char.sprite.setAlpha(0.8);
}
export function setTintPlayerDark(player: Player, game: SmashedGame): void {
  player.char.sprite.setTint(0x444444);
  player.char.sprite.setAlpha(1);
}
export function setTintPlayerTDark(player: Player, game: SmashedGame): void {
  player.char.sprite.setTint(0x444444);
  player.char.sprite.setAlpha(0.8);
}
export function setTintPlayerLight(player: Player, game: SmashedGame): void {
  player.char.sprite.setTint(0xaaaaaa);
  player.char.sprite.setAlpha(1);
}
export function setTintPlayerTLight(player: Player, game: SmashedGame): void {
  player.char.sprite.setTint(0xaaaaaa);
  player.char.sprite.setAlpha(0.8);
}

// FILL
export function setFillPlayerID(player: Player, circleColor: number): void {
  player.char.sprite.setTint('transparent');
  player.char.sprite.setTintFill(circleColor);
  player.char.sprite.setAlpha(1);
}
export function setFillPlayerTDark(player: Player, game: SmashedGame): void {
  player.char.sprite.setTint('transparent');
  player.char.sprite.setTintFill(0x444444);
  player.char.sprite.setAlpha(0.8);
}
export function setFillPlayerDark(player: Player, game: SmashedGame): void {
  player.char.sprite.setTint('transparent');
  player.char.sprite.setTintFill(0x444444);
  player.char.sprite.setAlpha(1);
}
export function setFillPlayerRed(player: Player, game: SmashedGame): void {
  player.char.sprite.setTint('transparent');
  player.char.sprite.setTintFill(0xaa3333);
  player.char.sprite.setAlpha(1);
}
export function setFillPlayerTRed(player: Player, game: SmashedGame): void {
  player.char.sprite.setTint('transparent');
  player.char.sprite.setTintFill(0xaa3333);
  player.char.sprite.setAlpha(0.8);
}
export function setFillPlayerWhite(player: Player, game: SmashedGame): void {
  player.char.sprite.setTint(0xffffff);
  player.char.sprite.setTintFill(0xffffff);
  player.char.sprite.setAlpha(1);
}
export function setFillPlayerWhiteT(player: Player, game: SmashedGame): void {
  player.char.sprite.setTint(0xffffff);
  player.char.sprite.setTintFill(0xffffff);
  player.char.sprite.setAlpha(0.7);
}

// BLINK
export function setBlinkTrue(player: Player): void {
  player.char.colorFilterBlink = true;
}
export function setBlinkFalse(player: Player): void {
  player.char.colorFilterBlink = false;
}

////////////////
// FILTER ATTACKS
////////////////

export function filterAttackEnergyNormal(
  player: Player,
  playerIndex: number,
  game: SmashedGame
): void {
  if (game.debug.Chars_Colored) {
    setFillAttackPhysicalID(player, game.colorCircles[playerIndex].colorNumber);
    setFillAttackEnergyID(player, game.colorCircles[playerIndex].colorNumber);
  } else {
    setTintAttackEnergyNormal(player);
    if (player.char.name === 'Link') {
      setTintAttackPhysicalNormal(player);
    } else {
      setFillAttackPhysicalID(
        player,
        game.colorCircles[playerIndex].colorNumber
      );
    }
  }
}

export function setTintAttackEnergyID(
  player: Player,
  circleColor: number
): void {
  player.char.attackEnergy.sprite.setTint(circleColor);
  player.char.attackEnergy.sprite.setAlpha(1);
}
export function setTintAttackPhysicalID(
  player: Player,
  circleColor: number
): void {
  player.char.attackPhysical.sprite.setTint(circleColor);
  player.char.attackPhysical.sprite.setAlpha(1);
}
export function setTintAttackPhysicalNormal(player: Player): void {
  player.char.attackPhysical.sprite.setTint(0xffffff);
  player.char.attackPhysical.sprite.setAlpha(1);
}
export function setTintAttackEnergyNormal(player: Player): void {
  player.char.attackEnergy.sprite.setTint(0xffffff);
  player.char.attackEnergy.sprite.setAlpha(1);
}
export function setFillAttackPhysicalID(
  player: Player,
  circleColor: number
): void {
  player.char.attackPhysical.sprite.setTint('transparent');
  player.char.attackPhysical.sprite.setTintFill(circleColor);
  player.char.attackPhysical.sprite.setAlpha(1);
}
export function setFillAttackEnergyID(
  player: Player,
  circleColor: number
): void {
  player.char?.attackEnergy?.sprite.setTint('transparent');
  player.char?.attackEnergy?.sprite.setTintFill(circleColor);
  player.char?.attackEnergy?.sprite.setAlpha(1);
  const aebs = player.char.attackEnergy.attackBullets;
  print('aebs.bullets', aebs);
}

export function setAnimationsOff(game: SmashedGame): void {
  game.players.forEach((player) => {
    if (player.char.sprite?.anims) {
      player.char.sprite.anims.pause();
    }
    if (player.char.attackPhysical.sprite?.anims) {
      player.char.attackPhysical.sprite?.anims.pause();
    }

    if (player.emitterPlayer.on) {
      player.emitterPlayer.active = false;
    }
  });
  if (game.chomp.sprite?.anims) {
    game.chomp.sprite.anims.pause();
  }
  for (let i = 0; i < game.lavas.length; i++) {
    game.lavas[i].sprite.anims.pause();
  }
  for (let i = 0; i < game.chomp.darknessMoments.explosions.length; i++) {
    game.chomp.darknessMoments.explosions[i].sprite.anims.pause();
  }
}

export function setAnimationsOn(game: SmashedGame): void {
  game.players.forEach((player) => {
    if (player.char.sprite?.anims) {
      player.char.sprite.anims.resume();
    }

    if (player.char.attackPhysical.sprite?.anims) {
      player.char.attackPhysical.sprite?.anims.resume();
    }

    if (player.emitterPlayer.on) {
      player.emitterPlayer.active = true;
    }
  });
  if (game.chomp.sprite?.anims) {
    game.chomp.sprite.anims.resume();
  }
  for (let i = 0; i < game.lavas.length; i++) {
    game.lavas[i].sprite.anims.resume();
  }
  for (let i = 0; i < game.chomp.darknessMoments.explosions.length; i++) {
    game.chomp.darknessMoments.explosions[i].sprite.anims.resume();
  }
}

export function updateSpritesheets(game: SmashedGame): void {
  const movingXThreshold = 10;
  const movingYThreshold = 40;
  // update player spritesheets
  game.players.forEach((player, playerIndex) => {
    if (player.char.srcSpriteSheet !== '') {
      const s = player.char.sprite;

      const tDown = s.body.touching.down;
      const tWall = s.body.touching.left || s.body.touching.right;
      const mUp = s.body.velocity.y < -movingYThreshold;
      const mDown = s.body.velocity.y > movingYThreshold;
      const mHoriz =
        s.body.velocity.x > movingXThreshold ||
        s.body.velocity.x < -movingXThreshold;

      let newSpriteStateName: SpriteStateName | null = null;

      if (tWall && !tDown && mDown) {
        newSpriteStateName = 'climb';
      } else if (tDown) {
        newSpriteStateName = mHoriz ? 'walk' : 'idle';
      } else if (mUp) {
        newSpriteStateName = 'jumpUp';
      } else if (mDown) {
        newSpriteStateName = 'jumpDown';
      }

      if (newSpriteStateName !== null) {
        updateSpriteState(newSpriteStateName, player, game);
      }
    }
  });
}

export function updateSpriteState(
  newState: SpriteStateName,
  player: Player,
  game: SmashedGame
): void {
  if (player.char.srcSpriteSheet !== '') {
    if (newState === player.char.ssCurr.name) {
      return;
    }

    if (
      !getHasBeenGameDurationSinceMoment(
        100,
        player.char.ssCurr.timeStamp,
        game
      )
    ) {
      return;
    }

    player.char.ssPrev.name = player.char.ssCurr.name;
    player.char.ssPrev.timeStamp = player.char.ssCurr.timeStamp;
    player.char.ssCurr.name = newState;
    player.char.ssCurr.timeStamp = game.gameNanoseconds;

    const curr = player.char.ssCurr.name;
    const n = player.char.name;
    const s = player.char.sprite;

    switch (curr) {
      case 'idle':
        s.anims.play(n + '_idle', true);
        break;
      case 'walk':
        s.anims.play(n + '_walk', true);
        break;
      case 'jumpUp':
        s.anims.play(n + '_jumpUp', true);
        break;
      case 'jumpDown':
        s.anims.play(n + '_jumpDown', true);
        break;
      case 'climb':
        s.anims.play(n + '_climb', true);
        break;
    }
  }
}

// export const updateAllSpritesAlpha = (game: Game): void => {
//   game.players.forEach((player) => {
//     if (getIsPlayerOffscreen(player, game)) {
//       player.char.sprite.setActive(0);
//     } else {
//       player.char.sprite.setActive(1);
//     }

//     if (getIsAttackEnergyOffscreen(player.char.attackEnergy)) {
//       player.char.attackPhysical.sprite.setActive(0);
//     } else {
//       player.char.attackPhysical.sprite.setActive(1);
//     }

//     if (getIsAttackPhysicalOffscreen(player.char.attackPhysical)) {
//       player.char.attackPhysical.sprite.setActive(0);
//     } else {
//       player.char.attackPhysical.sprite.setActive(1);
//     }
//   });
// };

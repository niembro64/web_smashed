import { print } from '../../views/client';
import SmashedGame, { SCREEN_DIMENSIONS } from '../SmashedGame';
import {
  ChompFilterStateName,
  Player,
  PowerStateCharacterName,
  PowerStateChompName,
  xyVector,
} from '../types';
import { getNormalizedVector } from './damage';
import { setMusicChompSheepRate } from './sound';
import { setPlayerState } from './state';
import { addToMotionSlowdown } from './time';

export function setPlayerPowerState(
  stateName: PowerStateCharacterName,
  player: Player,
  game: SmashedGame
): void {
  const p = player;
  const curr = p.char.powerStateCurr;
  const prev = p.char.powerStatePrev;

  if (stateName === curr.name) {
    return;
  }

  prev.name = curr.name;
  prev.gameStamp = curr.gameStamp;

  curr.name = stateName;
  curr.gameStamp = game.gameNanoseconds;

  switch (curr.name) {
    case 'none':
      p.emitterDark.visible = false;
      break;
    case 'dark':
      p.emitterDark.visible = true;
      game.chomp.darknessMoments.passed = game.gameNanoseconds;
      setMusicChompSheepRate(game, game.chomp.musicRates.player);
      break;
    case 'light':
      p.emitterDark.visible = false;
      break;
  }
}

export function setChompFilterState(
  stateName: ChompFilterStateName,
  game: SmashedGame
): void {
  const curr = game.chomp.filterStateCurr;
  const prev = game.chomp.filterStatePrev;

  switch (curr.name) {
    case 'none':
      print('setChompFilterState none');
      // game.chomp.sprite.clearTint();
      break;
    case 'cooldown':
      print('setChompFilterState cooldown');
      // game.chomp.sprite.clearTint();
      break;
    case 'hurt':
      game.chomp.soundHurt.play();
      print('setChompFilterState hurt');
      // game.chomp.sprite.clearTint();
      // game.chomp.sprite.setTintFill(0xffffff);

      break;
  }

  prev.name = curr.name;
  prev.gameStamp = curr.gameStamp;

  curr.name = stateName;
  curr.gameStamp = game.gameNanoseconds;
}

export function updateChompFilterState(game: SmashedGame): void {
  game.players.forEach((player) => {
    updateChompFilterStatePlayer(player, 0, game);
  });
}

export function updateChompFilterStatePlayer(
  player: Player,
  damage: number,
  game: SmashedGame
): void {
  const c = game.chomp;
  const curr = c.filterStateCurr;

  switch (curr.name) {
    case 'none':
      if (damage <= 0) {
        break;
      }

      setChompFilterState('hurt', game);
      c.damage += damage;

      const { x, y }: xyVector = getNormalizedVector(
        player.char.attackEnergy.sprite.x,
        player.char.attackEnergy.sprite.y,
        c.sprite.x,
        c.sprite.y
      );

      const b = c.sprite.body;

      b.setVelocityX(b.velocity.x + x * 500);
      b.setVelocityY(b.velocity.y + y * 500);

      break;
    case 'cooldown':
      if (
        getHasBeenGameDurationSinceMomentBoolean(
          game.flashCooldownMs,
          curr.gameStamp,
          game
        )
      ) {
        setChompFilterState('none', game);
      }
      break;
    case 'hurt':
      if (
        getHasBeenGameDurationSinceMomentBoolean(
          game.flashActiveMs,
          curr.gameStamp,
          game
        )
      ) {
        setChompFilterState('cooldown', game);
      }
      break;
  }
}

export function setChompPowerState(
  stateName: PowerStateChompName,
  game: SmashedGame
): void {
  const c = game.chomp;
  const curr = c.powerStateCurr;
  const prev = c.powerStatePrev;

  if (stateName === curr.name) {
    return;
  }

  prev.name = curr.name;
  prev.gameStamp = curr.gameStamp;

  curr.name = stateName;
  curr.gameStamp = game.gameNanoseconds;

  switch (curr.name) {
    case 'none':
      c.emitterDark.visible = false;
      c.darknessMoments.chomp = game.gameNanoseconds;
      c.sprite.play('chompanimation_walking');
      c.sprite.setScale(c.scaleChompNormal);

      // grayscale
      c.sprite.setTint(c.tintMuted);

      c.soundHurt.play();

      c.links.forEach((link) => {
        link.sprite.setScale(c.scaleLinksNormal);
        link.sprite.setTint(c.tintMuted);
      });

      break;
    case 'dark':
      c.emitterDark.visible = true;
      c.darknessMoments.chomp = game.gameNanoseconds;
      c.sprite.play('chompanimation_chomping');
      c.sprite.setScale(c.scaleChompMad);
      game.chomp.soundBBWoah.setRate(1);
      game.chomp.sprite.setTint(c.tintNormal);
      setMusicChompSheepRate(game, game.chomp.musicRates.chomp);
      c.links.forEach((link) => {
        link.sprite.setScale(c.scaleLinksMad);
        link.sprite.setTint(c.tintNormal);
      });
      break;
  }
}

export function updateChompStateLightIfHasBeenLongEnough(
  game: SmashedGame
): void {
  if (game.chomp.powerStateCurr.name !== 'dark') {
    return;
  }

  const hasBeen: boolean = getHasBeenGameDurationSinceMomentBoolean(
    3000,
    game.chomp.darknessMoments.chomp,
    game
  );

  if (hasBeen) {
    setChompPowerState('none', game);
  }
}

export function getDoesAnyPlayerHaveDark(game: SmashedGame): boolean {
  for (let i = 0; i < game.players.length; i++) {
    if (game.players[i].char.powerStateCurr.name === 'dark') {
      return true;
    }
  }

  return false;
}

export function getDoesAnythingHaveDark(game: SmashedGame): boolean {
  if (
    game.chomp.powerStateCurr.name === 'dark' ||
    getDoesAnyPlayerHaveDark(game)
  ) {
    return true;
  }

  return false;
}

export function getHowLongSinceGameMoment(
  moment: number,
  game: SmashedGame
): number {
  const duration = game.gameNanoseconds - moment;

  if (duration < 0) {
    throw new Error('getHowLongSinceGameMoment: duration < 0');
  }

  return duration;
}

export function getHowLongSinceGameMomentAsRatio(
  baseDuration: number,
  moment: number,
  game: SmashedGame
): number {
  if (baseDuration <= 0) {
    throw new Error('getHowLongSinceGameMomentAsRatio: baseDuration === 0');
  }

  return getHowLongSinceGameMoment(moment, game) / baseDuration;
}

export function getHasBeenGameDurationSinceMomentBoolean(
  durationNano: number,
  moment: number,
  game: SmashedGame
): boolean {
  if (game.gameNanoseconds > moment + durationNano) {
    return true;
  }
  return false;
}

export function updatePlayerDarknessEvents(game: SmashedGame): void {
  game.players.forEach((player, playerIndex) => {
    if (player.char.powerStateCurr.name === 'dark') {
      const s = player.char.sprite;
      const b = player.char.sprite.body;
      const pj = game.chomp.darknessMoments.percentExplosion;

      player.char.damageCurr += 1;
      if (game.debug.Chomp_Explosion && Math.random() > 1 - pj) {
        const baseAmount = 2000;
        const amount =
          baseAmount +
          Math.pow(
            game.gameNanoseconds - game.chomp.darknessMoments.chomp,
            0.7
          ) *
            Math.pow(Math.random(), 0.4);

        addToMotionSlowdown(amount / baseAmount, game);
        player.char.damageCurr += amount / 100;

        playNextExplosion(s.x, s.y, game, amount);
        game.shake?.shake(amount / 20, amount / 100);

        if (game.debug.Chomp_Velocities) {
          const { x, y } = getRandomUnitVector();

          setPlayerState(player, playerIndex, 'player-state-hurt', game);

          b.setVelocityX(b.velocity.x + x * amount);
          b.setVelocityY(b.velocity.y + y * amount);
        }
      }
    }
  });
}

export function playNextExplosion(
  x: number,
  y: number,
  game: SmashedGame,
  amount: number
): void {
  const c = game.chomp;
  const eIndex = c.darknessMoments.explosionsIndex;
  const eArr = c.darknessMoments.explosions;
  const eFrontArr = c.darknessMoments.explosionsFront;

  game.chomp.darknessMoments.explosionsIndex = (eIndex + 1) % eArr.length;

  eArr[eIndex].sprite.x = x;
  eArr[eIndex].sprite.y = y;

  eFrontArr[eIndex].sprite.x = x;
  eFrontArr[eIndex].sprite.y = y;

  // eArr[eIndex].sprite.anims.stop();
  eArr[eIndex].sprite.setScale(amount / 500);
  eArr[eIndex].sprite.anims.play('explsionanimation');
  eArr[eIndex].sound.volume = amount / 3000;
  eArr[eIndex].sound.rate = Math.pow(500, 0.3) / Math.pow(amount, 0.3);
  eArr[eIndex].sound.play();

  eFrontArr[eIndex].sprite.setScale(amount / 500);
  eFrontArr[eIndex].sprite.anims.play('explsionanimationFront');
}

export function getRandomUnitVector(): xyVector {
  const xPositive = Math.random() > 0.5 ? 1 : -1;
  const yPositive = Math.random() > 0.5 ? 1 : -1;

  const randX = xPositive * Math.random();

  const randY = Math.sqrt(1 - randX * randX) * yPositive;

  return { x: randX, y: randY };
}

import { print } from '../../views/client';
import Game from '../Game';
import {
  ChompFilterStateName,
  Player,
  PowerStateCharacterName,
  PowerStateChompName,
  xyVector,
} from '../interfaces';
import { getNormalizedVector } from './damage';
import { setMusicChompSheepPause, setMusicChompSheepResume } from './sound';
import { setPlayerState } from './state';
import { addToMotionSlowdown } from './time';

export function setPlayerPowerState(
  stateName: PowerStateCharacterName,
  player: Player,
  game: Game
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
      break;
    case 'light':
      p.emitterDark.visible = false;
      break;
  }
}

export function setChompFilterState(
  stateName: ChompFilterStateName,
  game: Game
): void {
  const curr = game.chomp.filterStateCurr;
  const prev = game.chomp.filterStatePrev;

  prev.name = curr.name;
  prev.gameStamp = curr.gameStamp;

  curr.name = stateName;
  curr.gameStamp = game.gameNanoseconds;

  switch (curr.name) {
    case 'none':
      print('setChompFilterState none');
      game.chomp.sprite.clearTint();
      break;
    case 'cooldown':
      print('setChompFilterState cooldown');
      game.chomp.sprite.clearTint();
      break;
    case 'hurt':
      game.chomp.soundHurt.play();
      print('setChompFilterState hurt');
      game.chomp.sprite.setTintFill(0xffffff);

      break;
  }
}

export function updateChompFilterState(game: Game): void {
  game.players.forEach((player) => {
    updateChompFilterStatePlayer(player, 0, game);
  });
}

export function updateChompFilterStatePlayer(
  player: Player,
  damage: number,
  game: Game
): void {
  const c = game.chomp;
  const curr = c.filterStateCurr;

  if (damage > 0 && curr.name === 'none') {
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
  }

  switch (curr.name) {
    case 'none':
      break;
    case 'cooldown':
      if (
        getHasBeenGameDurationSinceMoment(
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
        getHasBeenGameDurationSinceMoment(
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
  game: Game
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
      break;
    case 'dark':
      c.emitterDark.visible = true;
      c.darknessMoments.chomp = game.gameNanoseconds;
      c.sprite.play('chompanimation_chomping');
      game.chomp.soundBBWoah.setRate(1);
      break;
  }
}

export function getDoesAnyPlayerHaveDark(game: Game): boolean {
  for (let i = 0; i < game.players.length; i++) {
    if (game.players[i].char.powerStateCurr.name === 'dark') {
      return true;
    }
  }

  return false;
}

export function getDoesAnythingHaveDark(game: Game): boolean {
  if (
    game.chomp.powerStateCurr.name === 'dark' ||
    getDoesAnyPlayerHaveDark(game)
  ) {
    return true;
  }

  return false;
}

export function getHasBeenGameDurationSinceMoment(
  durationNano: number,
  moment: number,
  game: Game
): boolean {
  if (game.gameNanoseconds > moment + durationNano) {
    return true;
  }
  return false;
}

export function updatePlayerDarknessEvents(game: Game): void {
  game.players.forEach((player, playerIndex) => {
    if (player.char.powerStateCurr.name === 'dark') {
      const s = player.char.sprite;
      const b = player.char.sprite.body;
      const pj = game.chomp.darknessMoments.percentExplosion;

      if (Math.random() > 1 - pj) {
        const baseAmount = 10000;
        const amount =
          baseAmount +
          Math.pow(
            game.gameNanoseconds - game.chomp.darknessMoments.chomp,
            0.7
          ) *
            Math.pow(Math.random(), 0.4);

        addToMotionSlowdown(amount / baseAmount, game);

        if (game.debug.ChompExplosions) {
          playNextExplosion(s.x, s.y, game, amount);
        }
        const { x, y } = getRandomUnitVector();

        player.char.damageCurr += amount / 100;
        setPlayerState(player, playerIndex, 'player-state-hurt', game);

        if (game.debug.ChompVelocities) {
          b.setVelocityX(b.velocity.x + x * amount * 10);
          b.setVelocityY(b.velocity.y + y * amount * 10);
        }

        if (game.debug.ChompExplosions) {
          game.shake?.shake(amount / 2, amount / 10);
        }
      }
    }
  });
}

export function playNextExplosion(
  x: number,
  y: number,
  game: Game,
  amount: number
): void {
  const c = game.chomp;
  const eIndex = c.darknessMoments.explosionsIndex;
  const eArr = c.darknessMoments.explosions;

  game.chomp.darknessMoments.explosionsIndex = (eIndex + 1) % eArr.length;

  eArr[eIndex].sprite.x = x;
  eArr[eIndex].sprite.y = y;

  // eArr[eIndex].sprite.anims.stop();
  eArr[eIndex].sprite.setScale(amount / 500);
  eArr[eIndex].sprite.anims.play('explsionanimation');
  eArr[eIndex].sound.volume = amount / 3000;
  eArr[eIndex].sound.rate = Math.pow(500, 0.3) / Math.pow(amount, 0.3);
  eArr[eIndex].sound.play();
}

export function getRandomUnitVector(): xyVector {
  const xPositive = Math.random() > 0.5 ? 1 : -1;
  const yPositive = Math.random() > 0.5 ? 1 : -1;

  const randX = xPositive * Math.random();

  const randY = Math.sqrt(1 - randX * randX) * yPositive;

  return { x: randX, y: randY };
}

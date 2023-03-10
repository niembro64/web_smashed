import moment, { Moment } from 'moment';
import Game from '../Game';

export function updateTimeSlowdown(game: Game): void {
  if (!game.debug.SlowMoExplosions) {
    return;
  }

  let actualSlowdown: number;
  if (game.motionSlowdown > 3) {
    actualSlowdown = 3;
  } else {
    actualSlowdown = game.motionSlowdown;
  }

  game.tweens.timeScale = actualSlowdown;
  game.physics.world.timeScale = actualSlowdown;
  game.time.timeScale = actualSlowdown;

  game.motionSlowdown = game.motionSlowdown * 0.95 + 0.05;
  // console.log('game.motionSlowdown', game.motionSlowdown);
  // console.log('actualSlowdown', actualSlowdown);
}

export function isAnyExplosionActive(game: Game): boolean {
  let found = false;
  game.chomp.darknessMoments.explosions.forEach((e, eIndex) => {
    if (e.sprite.anims.isPlaying) {
      found = true;
    }
  });
  return found;
}

export function addToMotionSlowdown(amount: number, game: Game): void {
  game.motionSlowdown *= amount;
}

// Function to convert a moment.js object to a Date object
export function momentToDate(momentObj: Moment): Date {
  return momentObj.toDate();
}

// Function to convert a Date object to a moment.js object
export function dateToMoment(dateObj: Date): Moment {
  return moment(dateObj);
}

export function momentStringToMoment(momentString: string): Moment {
  return moment(momentString, 'YYYY-MM-DDTHH:mm:ss.SSSZ');
}

import moment, { Moment } from 'moment';
import SmashedGame from '../SmashedGame';

export function updateTimeSlowdown(game: SmashedGame): void {
  if (!game.debug.Allow_SlowMo) {
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
}

export function addToMotionSlowdown(amount: number, game: SmashedGame): void {
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

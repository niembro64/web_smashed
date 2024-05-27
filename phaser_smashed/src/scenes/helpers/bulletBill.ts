import SmashedGame, { SCREEN_DIMENSIONS } from '../SmashedGame';
import { BulletBillCombo } from '../interfaces';

export const updateBulletBill = (game: SmashedGame): void => {
  const bbCombo: BulletBillCombo = game.bulletBillCombo;

  const screenWidth: number = SCREEN_DIMENSIONS.WIDTH;

  if (bbCombo.bullet.sprite.body.x > screenWidth * 1.2) {
    bbCombo.bullet.sprite.body.x = 0 - screenWidth * 0.2;
  }
};

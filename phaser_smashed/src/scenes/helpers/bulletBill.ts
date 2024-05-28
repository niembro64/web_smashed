import { print } from '../../views/client';
import SmashedGame, { SCREEN_DIMENSIONS } from '../SmashedGame';
import {
  BulletBillBullet,
  BulletBillCombioState,
  BulletBillCombo,
} from '../interfaces';

export const updateBulletBill = (game: SmashedGame): void => {
  const bbCombo: BulletBillCombo = game.bulletBillCombo;
  const bbBullet: BulletBillBullet = bbCombo.bullet;

  const state: BulletBillCombioState = bbCombo.state;

  switch (state) {
    case 'button-up':
      if (game.players[0].char.sprite.body.touching.down) {
        setBulletBillState(game, 'button-down');
      }
      break;
    case 'button-down':
      bbCombo.sparkDistance += 0.01;
      // print('sparkDistance:', bbCombo.sparkDistance);

      if (bbCombo.sparkDistance >= 1) {
        setBulletBillState(game, 'shooting');
      }

      if (!game.players[0].char.sprite.body.touching.down) {
        setBulletBillState(game, 'button-up');
      }
      break;
    case 'shooting':
      if (bbBullet.sprite.body.x > SCREEN_DIMENSIONS.WIDTH * 1.2) {
        setBulletBillState(game, 'button-up');
      }
      break;
    case 'cooldown':
      break;
    default:
      throw new Error(`Invalid BulletBillComboState: ${state}`);
  }
};

export const setBulletBillState = (
  game: SmashedGame,
  stateNew: BulletBillCombioState
): void => {
  const bbCombo: BulletBillCombo = game.bulletBillCombo;
  const bbBullet: BulletBillBullet = bbCombo.bullet;

  switch (stateNew) {
    case 'button-up':
      print('setBulletBillState: button-up');
      break;
    case 'button-down':
      print('setBulletBillState: button-down');
      break;
    case 'shooting':
      print('setBulletBillState: shooting');

      bbCombo.sparkDistance = 0;
      bbBullet.sprite.body.x = bbBullet.posInit.x;
      bbBullet.sprite.body.y = bbBullet.posInit.y;

      bbBullet.sprite.body.setVelocityX(bbBullet.velInit.x);
      bbBullet.sprite.body.setVelocityY(bbBullet.velInit.y);
      break;
    case 'cooldown':
      print('setBulletBillState: cooldown');

      break;
    default:
      throw new Error(`Invalid BulletBillComboState: ${stateNew}`);
  }

  bbCombo.state = stateNew;
};

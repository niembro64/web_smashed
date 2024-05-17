import { print } from '../../views/client';
import SmashedGame, { SCREEN_DIMENSIONS } from '../SmashedGame';

export function updateBulletBill(game: SmashedGame): void {
  if (!game.debug.BulletBill_Active) {
    return;
  }

  if (!resetBulletBillPosition(game)) {
    return;
  }

  print('updateBulletBill');

  game.bulletBillCombo.bullet.sprite.body.position.x =
    game.bulletBillCombo.bullet.posInit.x;
  game.bulletBillCombo.bullet.sprite.body.position.y =
    game.bulletBillCombo.bullet.posInit.y;

  game.bulletBillCombo.bullet.sprite.body.setVelocity(
    game.bulletBillCombo.bullet.velInit.x,
    game.bulletBillCombo.bullet.velInit.y
  );
}

export function resetBulletBillPosition(game: SmashedGame): boolean {
  print('resetBulletBillPosition');
  if (!game.debug.BulletBill_Active) {
    return false;
  }

  if (
    game.bulletBillCombo.bullet.sprite.body.velocity.y === 0 ||
    game.bulletBillCombo.bullet.sprite.body.velocity.x === 0
  ) {
    return true;
  }

  if (
    game.bulletBillCombo.bullet.sprite.body.position.y < 0 ||
    game.bulletBillCombo.bullet.sprite.body.position.y >
      SCREEN_DIMENSIONS.HEIGHT ||
    game.bulletBillCombo.bullet.sprite.body.position.x < 0 ||
    game.bulletBillCombo.bullet.sprite.body.position.x > SCREEN_DIMENSIONS.WIDTH
  ) {
    return false;
  }

  return true;
}

import Game, { SCREEN_DIMENSIONS } from '../Game';

export function updateBulletBill(game: Game): void {
  if (!game.debug.BulletBillActive) {
    return;
  }

  if (!getResetBulletBillPosition(game)) {
    return;
  }

  game.bulletBillCombo.bullet.sprite.body.setPosition(
    game.bulletBillCombo.bullet.posInit.x,
    game.bulletBillCombo.bullet.posInit.y
  );

  game.bulletBillCombo.bullet.sprite.body.setVelocity(
    game.bulletBillCombo.bullet.velInit.x,
    game.bulletBillCombo.bullet.velInit.y
  );
}

export function getResetBulletBillPosition(game: Game): boolean {
  if (!game.debug.BulletBillActive) {
    return false;
  }

  if (
    game.bulletBillCombo.bullet.sprite.body.y < 0 ||
    game.bulletBillCombo.bullet.sprite.body.y > SCREEN_DIMENSIONS.HEIGHT ||
    game.bulletBillCombo.bullet.sprite.body.x < 0 ||
    game.bulletBillCombo.bullet.sprite.body.x > SCREEN_DIMENSIONS.WIDTH
  ) {
    return true;
  }

  return false;
}

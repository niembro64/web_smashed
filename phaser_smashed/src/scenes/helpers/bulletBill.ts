import { print } from '../../views/client';
import SmashedGame, { SCREEN_DIMENSIONS } from '../SmashedGame';
import {
  BulletBillBullet,
  BulletBillCombo,
  BulletBillComboState,
  BulletBillSparkLine,
  Position,
} from '../interfaces';

const updateSparkOnSparkLine = (game: SmashedGame): void => {
  const bbSparkLine: BulletBillSparkLine = game.bulletBillCombo.sparkLine;
  const numPaths = bbSparkLine.pathPoints.length;
  const percentCompleted = bbSparkLine.percentPathCurrCompleted;

  bbSparkLine.percentPathCurrCompleted = Math.min(1, percentCompleted + 0.01);

  if (bbSparkLine.percentPathCurrCompleted >= 1) {
    bbSparkLine.percentPathCurrCompleted = 0;
    bbSparkLine.pathPointsIndexCurr =
      (bbSparkLine.pathPointsIndexCurr + 1) % numPaths;

    const isLastPath = bbSparkLine.pathPointsIndexCurr === numPaths - 1;

    if (isLastPath) {
      setBulletBillState(game, 'shooting');
    }
    return;
  }

  const pathPositionStart =
    bbSparkLine.pathPoints[bbSparkLine.pathPointsIndexCurr];
  const pathPositionEnd =
    bbSparkLine.pathPoints[(bbSparkLine.pathPointsIndexCurr + 1) % numPaths];

  putSparkAtPercentageAlongPath(
    game,
    pathPositionStart,
    pathPositionEnd,
    bbSparkLine.percentPathCurrCompleted
  );
};

const putSparkAtPercentageAlongPath = (
  game: SmashedGame,
  positionStart: Position,
  positionEnd: Position,
  percentage: number
): void => {
  const bbSparkLine: BulletBillSparkLine = game.bulletBillCombo.sparkLine;

  bbSparkLine.spark.x =
    positionStart.x + (positionEnd.x - positionStart.x) * percentage;
  bbSparkLine.spark.y =
    positionStart.y + (positionEnd.y - positionStart.y) * percentage;
};

export const updateBulletBill = (game: SmashedGame): void => {
  const bbCombo: BulletBillCombo = game.bulletBillCombo;
  const bbBullet: BulletBillBullet = bbCombo.bullet;
  // const bbSparkLine: BulletBillSparkLine = bbCombo.sparkLine;

  const state: BulletBillComboState = bbCombo.stateCurr;

  switch (state) {
    case 'button-up':
      if (game.players[0].char.sprite.body.touching.down) {
        setBulletBillState(game, 'button-down');
      }
      break;
    case 'button-down':
      updateSparkOnSparkLine(game);

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
  stateNew: BulletBillComboState
): void => {
  const bbCombo: BulletBillCombo = game.bulletBillCombo;
  const bbBullet: BulletBillBullet = bbCombo.bullet;
  const bbSparkLine: BulletBillSparkLine = bbCombo.sparkLine;

  bbCombo.statePrev = bbCombo.stateCurr;
  bbCombo.stateCurr = stateNew;

  if (bbCombo.stateCurr === bbCombo.statePrev) {
    return;
  }

  switch (bbCombo.stateCurr) {
    case 'button-up':
      print('setBulletBillState: button-up');
      break;
    case 'button-down':
      print('setBulletBillState: button-down');
      bbSparkLine.emitter.on = true;
      break;
    case 'shooting':
      print('setBulletBillState: shooting');

      bbSparkLine.percentPathCurrCompleted = 0;
      bbBullet.sprite.body.x = bbBullet.posInit.x;
      bbBullet.sprite.body.y = bbBullet.posInit.y;

      bbBullet.sprite.body.setVelocityX(bbBullet.velInit.x);
      bbBullet.sprite.body.setVelocityY(bbBullet.velInit.y);

      bbSparkLine.emitter.on = false;
      bbSparkLine.pathPointsIndexCurr = 0;
      break;
    case 'cooldown':
      print('setBulletBillState: cooldown');

      break;
    default:
      throw new Error(`Invalid BulletBillComboState: ${stateNew}`);
  }
};

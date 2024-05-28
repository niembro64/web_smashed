import { print } from '../../views/client';
import SmashedGame, { SCREEN_DIMENSIONS } from '../SmashedGame';
import {
  BulletBillBullet,
  BulletBillCombo,
  BulletBillComboState,
  BulletBillSparkLine,
  Position,
} from '../interfaces';

// export type BulletBillBullet = {
//   scale: number;
//   mass: number;
//   sprite: any;
//   sound: any;
//   damage: number;
//   hitback: Hitback;
//   diesOnHitbox: boolean;
//   srcImage: any;
//   posInit: Position;
//   velInit: Position;
// };

// export type BulletBillCannon = {
//   scale: number;
//   sprite: any;
//   sound: any;
//   srcImage: any;
//   posInit: Position;
// };

// export type BulletBillComboState =
//   | 'button-up'
//   | 'button-down'
//   | 'shooting'
//   | 'cooldown';

// export type BulletBillCombo = {
//   state: BulletBillComboState;
//   sparkDistance: number;
//   pathPoints: Position[];
//   path: Phaser.Curves.Path | null;
//   spark: any;
//   graphics: Phaser.GameObjects.Graphics | null;
//   bullet: BulletBillBullet;
//   cannon: BulletBillCannon;
//   shootingDistanceThreshold: number;
//   numUpdateIndexesToWait: number;
//   numUpdateIndexesToWaitFast: number;
// };

// function createBulletBillSparkLine(game: SmashedGame) {
//   const bbCombo: BulletBillCombo = game.bulletBillCombo;

//   bbCombo.graphics = game.add.graphics();

//   // Draw the path
//   bbCombo.graphics.lineStyle(30, 0x666666, 1);
//   bbCombo.graphics.beginPath();
//   bbCombo.graphics.moveTo(bbCombo.pathPoints[0].x, bbCombo.pathPoints[0].y);
//   bbCombo.pathPoints.slice(1).forEach((point: Position) => {
//     if (!bbCombo.graphics) {
//       return;
//     }
//     bbCombo.graphics.lineTo(point.x, point.y);
//   });
//   bbCombo.graphics.strokePath();

//   // Create a dot to animate along the path
//   bbCombo.spark = game.add.circle(
//     bbCombo.pathPoints[0].x,
//     bbCombo.pathPoints[0].y,
//     30,
//     0xff5555
//   );
// }

const updateSparkOnSparkLine = (game: SmashedGame): void => {
  const bbSparkLine: BulletBillSparkLine = game.bulletBillCombo.sparkLine;

  bbSparkLine.percentCompleted = Math.min(
    1,
    bbSparkLine.percentCompleted + 0.01
  );

  const currPathPoints = bbSparkLine.pathPoints[0];
  const nextPathPoints = bbSparkLine.pathPoints[1];

  putSparkAtPercentageAlongPapth(
    game,
    currPathPoints,
    nextPathPoints,
    bbSparkLine.percentCompleted
  );
};

const putSparkAtPercentageAlongPapth = (
  game: SmashedGame,
  position1: Position,
  position2: Position,
  percentage: number
): void => {
  const bbSparkLine: BulletBillSparkLine = game.bulletBillCombo.sparkLine;

  bbSparkLine.spark.x = position1.x + (position2.x - position1.x) * percentage;
  bbSparkLine.spark.y = position1.y + (position2.y - position1.y) * percentage;
};

export const updateBulletBill = (game: SmashedGame): void => {
  const bbCombo: BulletBillCombo = game.bulletBillCombo;
  const bbBullet: BulletBillBullet = bbCombo.bullet;
  const bbSparkLine: BulletBillSparkLine = bbCombo.sparkLine;

  const state: BulletBillComboState = bbCombo.state;

  switch (state) {
    case 'button-up':
      if (game.players[0].char.sprite.body.touching.down) {
        setBulletBillState(game, 'button-down');
      }
      break;
    case 'button-down':
      updateSparkOnSparkLine(game);
      // print('sparkDistance:', bbSparkLine.sparkDistance);

      if (bbSparkLine.percentCompleted >= 1) {
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
  stateNew: BulletBillComboState
): void => {
  const bbCombo: BulletBillCombo = game.bulletBillCombo;
  const bbBullet: BulletBillBullet = bbCombo.bullet;
  const bbSparkLine: BulletBillSparkLine = bbCombo.sparkLine;

  switch (stateNew) {
    case 'button-up':
      print('setBulletBillState: button-up');
      break;
    case 'button-down':
      print('setBulletBillState: button-down');
      break;
    case 'shooting':
      print('setBulletBillState: shooting');

      bbSparkLine.percentCompleted = 0;
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

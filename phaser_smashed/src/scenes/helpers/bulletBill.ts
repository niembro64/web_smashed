import { print } from '../../views/client';
import SmashedGame, { SCREEN_DIMENSIONS } from '../SmashedGame';
import {
  BulletBillBullet,
  BulletBillButton,
  BulletBillCombo,
  BulletBillComboState,
  BulletBillSparkLine,
  Player,
  Position,
} from '../interfaces';

const updateSparkOnSparkLine = (game: SmashedGame): void => {
  const bbSparkLine: BulletBillSparkLine = game.bulletBillCombo.sparkLine;
  const numPaths = bbSparkLine.pathPoints.length;
  const percentCompleted = bbSparkLine.percentPathCurrCompleted;

  bbSparkLine.percentPathCurrCompleted = Math.min(
    1,
    percentCompleted + bbSparkLine.speed
  );

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
  const stateCurr: BulletBillComboState = bbCombo.stateCurr;

  switch (stateCurr) {
    case 'button-up':
      if (isAnyPlayerNearAndTouchingDown(game)) {
        setBulletBillState(game, 'button-down');
      }
      break;
    case 'button-down':
      updateSparkOnSparkLine(game);

      if (!isAnyPlayerNearAndTouchingDown(game)) {
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
      throw new Error(`Invalid BulletBillComboState: ${stateCurr}`);
  }
};

const isAnyPlayerNearAndTouchingDown = (game: SmashedGame): boolean => {
  const players: Player[] = game.players;
  const bbButton: BulletBillButton = game.bulletBillCombo.button;

  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    const playerBody = player.char.sprite.body;

    if (playerBody.touching.down) {
      const playerX = playerBody.x + playerBody.width / 2;
      const playerY = playerBody.y + playerBody.height;

      const dx = playerX - bbButton.posInit.x;
      const dy = playerY - bbButton.posInit.y;

      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < bbButton.distanceTrigger) {
        return true;
      }
    }
  }

  return false;
};

export const setBulletBillState = (
  game: SmashedGame,
  stateNew: BulletBillComboState
): void => {
  const bbCombo: BulletBillCombo = game.bulletBillCombo;
  const bbBullet: BulletBillBullet = bbCombo.bullet;
  const bbSparkLine: BulletBillSparkLine = bbCombo.sparkLine;
  const bbButton: BulletBillButton = bbCombo.button;

  bbCombo.statePrev = bbCombo.stateCurr;
  bbCombo.stateCurr = stateNew;

  if (bbCombo.stateCurr === bbCombo.statePrev) {
    return;
  }

  switch (bbCombo.stateCurr) {
    case 'button-up':
      print('setBulletBillState: button-up');
      bbButton.spriteUp.setAlpha(1);
      bbButton.spriteDown.setAlpha(0);

      break;
    case 'button-down':
      print('setBulletBillState: button-down');
      bbButton.spriteUp.setAlpha(0);
      bbButton.spriteDown.setAlpha(1);

      bbSparkLine.emitter.on = true;
      break;
    case 'shooting':
      print('setBulletBillState: shooting');
      bulletBillPlayExplosion(game);

      bbSparkLine.percentPathCurrCompleted = 0;
      bbBullet.sprite.body.x = bbBullet.posInit.x;
      bbBullet.sprite.body.y = bbBullet.posInit.y;

      bbBullet.sprite.body.setVelocityX(bbBullet.velInit.x);
      bbBullet.sprite.body.setVelocityY(bbBullet.velInit.y);

      bbSparkLine.emitter.on = false;
      bbSparkLine.pathPointsIndexCurr = 0;
      bbSparkLine.spark.x = bbSparkLine.pathPoints[0].x;
      bbSparkLine.spark.y = bbSparkLine.pathPoints[0].y;
      break;
    case 'cooldown':
      print('setBulletBillState: cooldown');

      break;
    default:
      throw new Error(`Invalid BulletBillComboState: ${stateNew}`);
  }
};

const bulletBillPlayExplosion = (game: SmashedGame): void => {
  print('bulletBillPlayExplosion');
  const bbCombo: BulletBillCombo = game.bulletBillCombo;
  const bbBullet: BulletBillBullet = bbCombo.bullet;

  bbBullet.explosionSprite.play('explsionanimationBulletBillCannon');
  bbBullet.sound.play();

  game.shake?.shake(3000, 300);
};

import { print } from '../../views/client';
import SmashedGame, { SCREEN_DIMENSIONS } from '../SmashedGame';
import { Player, Position, Velocity } from '../interfaces';
import { getNormalizedVector } from './damage';
import { getDistance, getNearestPlayerAliveFromXY } from './movement';
import { setPlaySoundFireBall } from './sound';

const calculateProjectileVelocity = (
  gravity: number,
  cannonPosition: Position,
  targetPosition: Position,
  baseVelocity: number
): Velocity | null => {
  const dx = targetPosition.x - cannonPosition.x;
  const dy = targetPosition.y - cannonPosition.y;

  const velocitySquared = baseVelocity * baseVelocity;
  const gravitySquared = gravity * gravity;

  const a = gravitySquared * dx * dx;
  const b = 2 * gravity * dy * velocitySquared;
  const c = velocitySquared * velocitySquared - gravitySquared * dx * dx;

  const discriminant = b * b - 4 * a * c;

  if (discriminant < 0) {
    return null;
  }

  const discriminantSqrt = Math.sqrt(discriminant);

  const t1 = (-b + discriminantSqrt) / (2 * a);
  const t2 = (-b - discriminantSqrt) / (2 * a);

  const t = Math.max(t1, t2);

  if (t <= 0) {
    return null;
  }

  const vx = dx / t;
  const vy = dy / t + 0.5 * gravity * t;

  return { x: vx, y: vy };
};

export const updateFireFlowerShooting = (game: SmashedGame) => {
  if (game.debug.NN_Train_P1 || game.fireFlower.attackBullets === null) {
    return;
  }

  if (game.debug.Flower_On_Init || game.flag.completedCurr) {
    game.fireFlower.sprite.setTint(0xffffff);

    if (game.updateIndex % game.fireFlower.numUpdateIndexesToWait !== 0) {
      return;
    }

    // if (game.gameSeconds % 2 === 0) {
    //   return;
    // }

    const z = getNearestPlayerAliveFromXY(
      game.fireFlower.posInit.x,
      game.fireFlower.posInit.y,
      game
    );

    const enemy: Player | null = z?.player || null;

    // print('enemy', enemy.char.sprite.body.position.x, enemy.char.sprite.body.position.y);

    let distance: number | null = null;
    if (enemy !== null) {
      distance = getDistance(
        game.fireFlower.posInit.x,
        game.fireFlower.posInit.y,
        enemy.char.sprite.body.position.x,
        enemy.char.sprite.body.position.y
      );
    }

    // print('distance', distance, game.fireFlower.shootingDistanceThreshold);
    if (
      distance === null ||
      distance >
        (game.debug.Flower_Full_Screen
          ? SCREEN_DIMENSIONS.WIDTH
          : game.fireFlower.shootingDistanceThreshold)
    ) {
      print(enemy?.char.name, 'TOO FAR');
      return;
    }

    print(enemy?.char.name, 'GOOD DISTANCE');
    let v: { x: number; y: number } | null = null;

    if (enemy !== null) {
      v = getNormalizedVector(
        game.fireFlower.posInit.x,
        game.fireFlower.posInit.y,
        enemy.char.sprite.body.position.x,
        enemy.char.sprite.body.position.y
      );
    }

    if (v === null) {
      return;
    }

    const randY: number =
      (Math.random() - 0.5) * 500 * game.debug.Flower_ShootRndAmt;
    const randX: number =
      (Math.random() - 0.5) * 500 * game.debug.Flower_ShootRndAmt;

    game.fireFlower.attackBullets.bullets.fireBullet(
      game.fireFlower.posInit,
      { x: v.x * 1000 + randX, y: v.y * 1000 + randY },
      game
    );

    setPlaySoundFireBall(game);
  } else {
    game.fireFlower.sprite.setTint(getInactiveBackgroundTintColor());
  }
};

export const getInactiveBackgroundTintColor = (): number => {
  const white = 0xffffff;
  const darkBlockTopEdge = 0x836c64;
  const whiteBlockTopEdge = 0xf3c6b5;

  const diffBlocks = hexColorSubtraction(whiteBlockTopEdge, darkBlockTopEdge);

  const diffWhites = hexColorSubtraction(white, diffBlocks);

  return diffWhites;
};

export const hexColorSubtraction = (color1: number, color2: number): number => {
  const r1 = (color1 >> 16) & 0xff;
  const g1 = (color1 >> 8) & 0xff;
  const b1 = color1 & 0xff;

  const r2 = (color2 >> 16) & 0xff;
  const g2 = (color2 >> 8) & 0xff;
  const b2 = color2 & 0xff;

  const r = r1 - r2;
  const g = g1 - g2;
  const b = b1 - b2;

  return (r << 16) + (g << 8) + b;
};

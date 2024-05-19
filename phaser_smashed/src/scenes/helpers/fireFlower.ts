import { tmpdir } from 'os';
import { baseGravity } from '../../views/Main';
import { print } from '../../views/client';
import SmashedGame from '../SmashedGame';
import { Player, Position, Velocity } from '../interfaces';
import { getDistance, getNearestPlayerAliveFromXY } from './movement';
import { setPlaySoundFireBall } from './sound';
const calculateProjectileVelocity = (
  gravity: number,
  cannonPosition: Position,
  targetPosition: Position,
  baseVelocity: number
): Velocity | null => {
  const dx = targetPosition.x - cannonPosition.x;
  const dy = targetPosition.y - cannonPosition.y; // Note: Y is not reversed here, ensure correct handling in function usage

  const velocitySquared = baseVelocity * baseVelocity;
  const gravitySquared = gravity * gravity;

  const a = gravitySquared * dx * dx;
  const b = -2 * gravity * dy * velocitySquared; // Note: Reversed sign for correct formulation
  const c = velocitySquared * velocitySquared - gravitySquared * dx * dx;

  const discriminant = b * b - 4 * a * c;

  // print(
  //   `dx: ${dx}, dy: ${dy}, a: ${a}, b: ${b}, c: ${c}, discriminant: ${discriminant}`
  // );

  if (discriminant < 0) {
    return null;
  }

  const discriminantSqrt = Math.sqrt(discriminant);

  const t1 = (-b + discriminantSqrt) / (2 * a);
  const t2 = (-b - discriminantSqrt) / (2 * a);

  const tMin = Math.min(t1, t2);
  const tMax = Math.max(t1, t2);

  // print(`tMin: ${tMin}, tMax: ${tMax}`);

  let t = tMin;

  if (tMin <= 0) {
    t = tMax;
    // print('MAX');
  } else {
    // print('MIN');
  }

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

    const z = getNearestPlayerAliveFromXY(
      game.fireFlower.posInit.x,
      game.fireFlower.posInit.y,
      game
    );

    const enemy: Player | null = z?.player || null;

    if (enemy === null) {
      return;
    }

    const currDistance = getDistance(
      game.fireFlower.posInit.x,
      game.fireFlower.posInit.y,
      enemy.char.sprite.body.position.x,
      enemy.char.sprite.body.position.y
    );

    if (
      !game.debug.Flower_Full_Screen &&
      currDistance > game.fireFlower.shootingDistanceThreshold
    ) {
      return;
    }

    const invertedYProjectileVelocity: Velocity | null =
      calculateProjectileVelocity(
        game.game.config.physics.arcade?.gravity?.y || 0,
        {
          x: game.fireFlower.posInit.x,
          y: -game.fireFlower.posInit.y,
        },
        {
          x:
            enemy.char.sprite.body.position.x +
            enemy.char.sprite.body.width / 2,
          y:
            -1 *
            (enemy.char.sprite.body.position.y +
              enemy.char.sprite.body.height / 2),
        },
        0
      );

    if (invertedYProjectileVelocity === null) {
      // print('No valid projectile velocity calculated.');
      return;
    }

    const projectileVelocity = {
      x: invertedYProjectileVelocity.x,
      y: -invertedYProjectileVelocity.y,
    };

    const randomX = (Math.random() - 0.5) * 100 * game.debug.Flower_ShootRndAmt;
    const randomY = (Math.random() - 0.5) * 100 * game.debug.Flower_ShootRndAmt;

    game.fireFlower.attackBullets.bullets.fireBullet(
      game.fireFlower.posInit,
      { x: projectileVelocity.x + randomX, y: projectileVelocity.y + randomY },
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

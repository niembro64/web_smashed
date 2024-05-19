import { print } from '../../views/client';
import { baseGravity } from '../../views/reactHelpers';
import SmashedGame from '../SmashedGame';
import { Player, Position, Velocity } from '../interfaces';
import { getNearestPlayerAliveFromXY } from './movement';
import { setPlaySoundFireBall } from './sound';

const calculateProjectileVelocity = (
  gravity: number,
  cannonPosition: Position,
  targetPosition: Position,
  baseVelocity: number
): Velocity | null => {
  const dx = targetPosition.x - cannonPosition.x;
  const dy = -1 * (targetPosition.y - cannonPosition.y); // Reversing y-coordinates

  const velocitySquared = baseVelocity * baseVelocity;

  print('velocitySquared', velocitySquared);
  const gravitySquared = gravity * gravity;

  const a = gravitySquared * dx * dx;
  const b = 2 * gravity * dy * velocitySquared;
  const c = velocitySquared * velocitySquared - gravitySquared * dx * dx;

  const discriminant = b * b - 4 * a * c;

  print('discriminant', discriminant);
  if (discriminant < 0) {
    return null;
  }

  const discriminantSqrt = Math.sqrt(discriminant);

  const t1 = (-b + discriminantSqrt) / (2 * a);
  const t2 = (-b - discriminantSqrt) / (2 * a);

  print('t1', t1);
  print('t2', t2);

  const t = Math.max(t1, t2);

  if (t <= 0) {
    return null;
  }

  const vx = dx / t;
  const vy = dy / t + 0.5 * gravity * t;

  return { x: vx, y: -vy }; // Reversing y-velocity
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

    const projectileVelocity: Velocity | null = calculateProjectileVelocity(
      3000,
      game.fireFlower.posInit,
      {
        x: enemy.char.sprite.body.position.x,
        y: enemy.char.sprite.body.position.y,
      },
      0 // Setting baseVelocity to zero
    );

    if (projectileVelocity === null) {
      print('No valid projectile velocity calculated.');
      return;
    }

    game.fireFlower.attackBullets.bullets.fireBullet(
      game.fireFlower.posInit,
      { x: projectileVelocity.x, y: projectileVelocity.y },
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

import SmashedGame from '../SmashedGame';
import { Player, Position, Velocity } from '../types';
import { getDistance, getNearestPlayerAliveFromXY } from './movement';
import { setPlaySoundFireBall } from './sound';

const calculateProjectileVelocityLowTrajectory = (
  gravity: number,
  cannonPosition: Position,
  targetPosition: Position,
  muzzleSpeed: number
): Velocity | null => {
  const dx = targetPosition.x - cannonPosition.x;
  const dy = targetPosition.y - cannonPosition.y;

  const velocitySquared = muzzleSpeed * muzzleSpeed;

  // Calculate the discriminant for the quadratic equation
  const discriminant =
    velocitySquared * velocitySquared -
    gravity * (gravity * dx * dx + 2 * dy * velocitySquared);

  if (discriminant < 0) {
    return null;
  }

  // Calculate the angles for the possible trajectories
  const discriminantSqrt = Math.sqrt(discriminant);

  const angle1 = Math.atan(
    (velocitySquared + discriminantSqrt) / (gravity * dx)
  );
  const angle2 = Math.atan(
    (velocitySquared - discriminantSqrt) / (gravity * dx)
  );

  // Calculate the time for both angles
  const t1 = dx / (muzzleSpeed * Math.cos(angle1));
  const t2 = dx / (muzzleSpeed * Math.cos(angle2));

  // Ensure both angles result in a valid time
  const validAngle1 = t1 > 0 ? angle1 : null;
  const validAngle2 = t2 > 0 ? angle2 : null;

  // Choose the angle that gives the smallest positive time
  const angle =
    validAngle1 && validAngle2
      ? t1 < t2
        ? validAngle1
        : validAngle2
      : validAngle1 || validAngle2;

  if (!angle) {
    return null;
  }

  const vx = muzzleSpeed * Math.cos(angle);
  const vy = muzzleSpeed * Math.sin(angle);

  return { x: vx, y: vy };
};

const calculateProjectileVelocityHighTrajectory = (
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

  if (discriminant < 0) {
    return null;
  }

  const discriminantSqrt = Math.sqrt(discriminant);

  const t1 = (-b + discriminantSqrt) / (2 * a);
  const t2 = (-b - discriminantSqrt) / (2 * a);

  const tMin = Math.min(t1, t2);
  const tMax = Math.max(t1, t2);

  let t = tMin;

  if (tMin <= 0) {
    t = tMax;
  }

  if (t <= 0) {
    return null;
  }

  const vx = dx / t;
  const vy = dy / t + 0.5 * gravity * t;

  return { x: vx, y: vy };
};

export const updateFireFlowerShooting = (game: SmashedGame) => {
  if (game.debug.Simple_Stage || game.fireFlower.attackBullets === null) {
    return;
  }

  if (
    game.debug.Flower_On_Init ||
    game.flag.flagStateCurr === 'flag-completed'
  ) {
    // game.fireFlower.sprite.setTint(0xffffff);

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
      game.fireFlower.sprite.setTint(getInactiveBackgroundTintColor());
      return;
    }

    game.fireFlower.sprite.setTint(0xffffff);

    let invertedYProjectileVelocity: Velocity | null = null;

    let shootHighTrajectory: null | boolean = null;

    switch (game.debug.Flower_HighTrajectory) {
      case 0:
        shootHighTrajectory = false;
        break;
      case 1:
        shootHighTrajectory = true;
        break;
      case 2:
        shootHighTrajectory = game.fireFlower.doNextHighTrajectory;
        game.fireFlower.doNextHighTrajectory =
          !game.fireFlower.doNextHighTrajectory;
        break;
    }

    if (!game.debug.Flower_Gravity) {
      const angle = Math.atan2(
        enemy.char.sprite.body.position.y - game.fireFlower.posInit.y,
        enemy.char.sprite.body.position.x - game.fireFlower.posInit.x
      );

      invertedYProjectileVelocity = {
        x: Math.cos(angle) * 1200,
        y: -Math.sin(angle) * 1200,
      };
    } else if (shootHighTrajectory) {
      ///////////////////////////////////////////////
      // Lobbed Projectile
      ///////////////////////////////////////////////
      invertedYProjectileVelocity = calculateProjectileVelocityHighTrajectory(
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
    } else {
      ///////////////////////////////////////////////
      // Direct Projectile
      ///////////////////////////////////////////////

      const shootLeftToRight =
        game.fireFlower.posInit.x < enemy.char.sprite.body.position.x;

      const muzzleSpeed = 1200;

      if (shootLeftToRight) {
        invertedYProjectileVelocity = calculateProjectileVelocityLowTrajectory(
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
          muzzleSpeed
        );
      } else {
        invertedYProjectileVelocity = calculateProjectileVelocityLowTrajectory(
          game.game.config.physics.arcade?.gravity?.y || 0,
          {
            x: -game.fireFlower.posInit.x,
            y: -game.fireFlower.posInit.y,
          },
          {
            x:
              -1 *
              (enemy.char.sprite.body.position.x +
                enemy.char.sprite.body.width / 2),
            y:
              -1 *
              (enemy.char.sprite.body.position.y +
                enemy.char.sprite.body.height / 2),
          },
          muzzleSpeed
        );

        if (invertedYProjectileVelocity !== null) {
          invertedYProjectileVelocity.x *= -1;
        }
      }
    }

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

export const white = 0xffffff;
export const darkBlockTopEdge = 0x836c64;
export const whiteBlockTopEdge = 0xf3c6b5;
export const getInactiveBackgroundTintColor = (): number => {
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

export const isPlayerInFireFlowerRange = (
  player: Player,
  game: SmashedGame
): boolean => {
  if (game.debug.Simple_Stage) {
    return true;
  }

  const distance = getDistance(
    player.char.sprite.body.position.x,
    player.char.sprite.body.position.y,
    game.fireFlower.sprite.body.position.x,
    game.fireFlower.sprite.body.position.y
  );

  return distance < game.fireFlower.shootingDistanceThreshold;
};

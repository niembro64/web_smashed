import { print } from '../../views/client';
import Game, { SCREEN_DIMENSIONS } from '../Game';
import { Player } from '../interfaces';
import { getNormalizedVector } from './damage';
import { getDistance, getNearestPlayerAliveFromXY } from './movement';
import { setPlaySoundFireBall } from './sound';

export const updateFireFlowerShooting = (game: Game) => {
  if (game.debug.nn_train_p1 || game.fireFlower.attackBullets === null) {
    return;
  }

  if (game.debug.flower_on_init || game.flag.completedCurr) {
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
        (game.debug.flower_full_screen
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

    const randMult = 300;

    const randY = (Math.random() - 0.5) * randMult;
    const randX = (Math.random() - 0.5) * randMult;

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

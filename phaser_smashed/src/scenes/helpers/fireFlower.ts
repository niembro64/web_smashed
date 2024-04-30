import Game from '../Game';
import { getNormalizedVector } from './damage';
import { getDistance, getNearestPlayerAliveFromXY } from './movement';
import { setPlaySoundFireBall } from './sound';

export const updateFireFlowerShooting = (game: Game) => {
  if (game.debug.NNP1Train || game.fireFlower.attackBullets === null) {
    return;
  }

  if (game.debug.FireflowerOnInit || game.flag.completedCurr) {
    game.fireFlower.sprite.setTint(0xffffff);

    if (game.updateIndex % game.fireFlower.numUpdateIndexesToWait !== 0) {
      return;
    }

    // if (game.gameSeconds % 2 === 0) {
    //   return;
    // }

    const { player: enemy } = getNearestPlayerAliveFromXY(
      game.fireFlower.posInit.x,
      game.fireFlower.posInit.y,
      game
    );
    if (
      getDistance(
        game.fireFlower.posInit.x,
        game.fireFlower.posInit.y,
        enemy.char.sprite.body.position.x,
        enemy.char.sprite.body.position.y
      ) > game.fireFlower.shootingDistanceThreshold
    ) {
      return;
    }

    const v: { x: number; y: number } = getNormalizedVector(
      game.fireFlower.posInit.x,
      game.fireFlower.posInit.y,
      enemy.char.sprite.body.position.x,
      enemy.char.sprite.body.position.y
    );

    const randMult = 300;

    const randY = (Math.random() - 0.5) * randMult;
    const randX = (Math.random() - 0.5) * randMult;

    game.fireFlower.attackBullets.bullets.fireBullet(
      game.fireFlower.posInit,
      { x: v.x * 1000 + randX, y: v.y * 1000 + randY },
      game
    );
    // game.fireFlower.attackBullets.bullets.fireBullet(
    //   game.fireFlower.posInit,
    //   { x: (Math.random() - 0.5) * 1000, y: -Math.random() * 1000 + 100 },
    //   game
    // );
    setPlaySoundFireBall(game);
  } else {
    const white = 0xffffff;
    const darkBlockTopEdge = 0x836c64;
    const whiteBlockTopEdge = 0xf3c6b5;

    const diffBlocks = hexColorSubtraction(whiteBlockTopEdge, darkBlockTopEdge);

    const diffWhites = hexColorSubtraction(white, diffBlocks);

    game.fireFlower.sprite.setTint(diffWhites);
  }
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

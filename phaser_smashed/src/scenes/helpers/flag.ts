import Game, { SCREEN_DIMENSIONS } from '../Game';

export const updateFlag = (game: Game): void => {
  let f = game.flag;

  // f.yPosition = Math.sin(game.time.now / 1000);

  // game.flag.sprite.y = f.yPosition * 100 + 200;

  const top = SCREEN_DIMENSIONS.HEIGHT * 0.382;
  const bottom = SCREEN_DIMENSIONS.HEIGHT * 0.561;

  if (f.sprite.y > bottom) {
    f.sprite.body.setVelocityY(-100);
  } else if (f.sprite.y < top) {
    f.sprite.body.setVelocityY(100);
  }
};

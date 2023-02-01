import Game from '../Game';

export const updateFlag = (game: Game): void => {
  let f = game.flag;

  f.yPosition = Math.sin(game.time.now / 1000) * 100 + 200;

  game.flag.sprite.y = f.yPosition;
};

import Game, { SCREEN_DIMENSIONS } from '../Game';
import { getDistance, getNormalizedVector, getVector } from './damage';
import { getDoesAnythingHaveDark } from './powers';
import {
  setBGMusicSpeedNormal,
  setBGMusicSpeedSlower,
  setMusicChompSheepPause,
  setMusicChompSheepResume,
} from './sound';

export function updateChomp(game: Game): void {
  if (game.debug.NNP1Train) {
    return;
  }

  updateChompSpriteDirection(game);
  updateChompVelocity(game);
  updateChompLinkPositions(game);
  updateChompAudio(game);
}

export function updateChompAudio(game: Game): void {
  if (getDoesAnythingHaveDark(game)) {
    setMusicChompSheepResume(game);
    setBGMusicSpeedSlower(game);
  } else {
    setMusicChompSheepPause(game);
    setBGMusicSpeedNormal(game);
  }
}

export function updateAtThreeShots(game: Game): void {
  if (game.shotsLeftCurr === game.shotsLeftPrev) {
    return;
  }

  if (game.shotsLeftCurr === 3) {
  }
}

export function updateChompSpriteDirection(game: Game): void {
  const c = game.chomp;

  if (c.sprite.body.velocity.x > 0) {
    c.sprite.flipX = false;
  } else if (c.sprite.body.velocity.x < 0) {
    c.sprite.flipX = true;
  }
}

export function updateChompVelocity(game: Game): void {
  const c = game.chomp;
  const b = c.sprite.body;
  const x = c.originX;
  const y = c.originY;
  const r = c.radius;

  const spriteX = c.sprite.x;
  const spriteY = c.sprite.y;

  if (!isChompInsideCircle(game)) {
    const { x: xNew, y: yNew } = getNormalizedVector(spriteX, spriteY, x, y);

    b.setVelocityX(xNew * 100);
    b.setVelocityY(yNew * 200);
    return;
  }

  c.percentFramesJump = Math.pow(
    (1 - getClosestDistance(game) / SCREEN_DIMENSIONS.WIDTH) * 0.9,
    15
  );

  if (
    Math.random() >
    (game.chomp.powerStateCurr.name === 'none'
      ? c.PERCENT_FRAMES_WALK
      : c.percentFramesJump)
  ) {
    return;
  }

  if (isChompInsideCircle(game)) {
    if (b.touching.down) {
      const randomX = Math.random() * r * 2 - r + x;
      const randomY = getCircleYfromX(randomX, game);

      const { x: xNew, y: yNew } = getNormalizedVector(
        spriteX,
        spriteY,
        randomX,
        randomY
      );
      if (c.powerStateCurr.name === 'dark') {
        c.soundAttack.play();
        b.setVelocityY(-1 * Math.abs(yNew + 0.3) * 1000);
        b.setVelocityX(xNew * 500);
      } else {
        b.setVelocityX(xNew * 100);
      }
    }
  }
}

export function isChompInsideCircle(game: Game): boolean {
  const c = game.chomp;
  const x = c.sprite.x;
  const y = c.sprite.y;
  const originX = c.originX;
  const originY = c.originY;
  const radius = c.radius;

  const distance = Math.sqrt(
    (x - originX) * (x - originX) + (y - originY) * (y - originY)
  );

  return distance < radius;
}

export function getCircleYfromX(x: number, game: Game): number {
  const c = game.chomp;
  const originX = c.originX;
  const originY = c.originY;
  const radius = c.radius;
  const y =
    Math.sqrt(radius * radius - (x - originX) * (x - originX)) + originY;

  return y;
}

export function updateChompLinkPositions(game: Game): void {
  const c = game.chomp;
  const endX = c.sprite.x;
  const endY = c.sprite.y;
  const startX = c.block.x;
  const startY = c.block.y;
  const links = c.links;
  const numLinks = links.length;

  const { x, y } = getVector(startX, startY, endX, endY);

  links.forEach((link, i) => {
    const percent = i / numLinks;
    const newX = startX + x * percent;
    const newY = startY + y * percent;

    link.sprite.x = newX;
    link.sprite.y = newY;
  });
}

export function getClosestDistance(game: Game): number {
  const c = game.chomp;
  const b = c.sprite.body;
  let shortestDistance = Infinity;

  // find closest player
  game.players.forEach((player, playerIndex) => {
    const playerX = player.char.sprite.body.x;
    const playerY = player.char.sprite.body.y;

    const distance = getDistance(b.x, b.y, playerX, playerY);

    if (distance < shortestDistance) {
      shortestDistance = distance;
    }
  });

  return shortestDistance;
}

import { Scale } from 'phaser';
import SmashedGame, { SCREEN_DIMENSIONS } from '../SmashedGame';
import { Player } from '../types';
import { getDistance, getNormalizedVector, getVector } from './damage';
import { getNearestPlayerAliveFromXY } from './movement';
import { getDoesAnythingHaveDark } from './powers';
import {
  setBGMusicSpeedNormal,
  setBGMusicSpeedSlower,
  setMusicChompSheepPause,
  setMusicChompSheepResume,
} from './sound';

export function updateChomp(game: SmashedGame): void {
  if (game.debug.Simple_Stage) {
    return;
  }

  updateChompSpriteDirection(game);
  updateChompVelocity(game);
  updateChompLinkPositions(game);
  updateChompAudio(game);
}

export function updateChompAudio(game: SmashedGame): void {
  if (getDoesAnythingHaveDark(game)) {
    setMusicChompSheepResume(game);
    setBGMusicSpeedSlower(game);
  } else {
    setMusicChompSheepPause(game);
    setBGMusicSpeedNormal(game);
  }
}

export function updateAtThreeShots(game: SmashedGame): void {
  if (game.shotsLeftCurr === game.shotsLeftPrev) {
    return;
  }

  if (game.shotsLeftCurr === 3) {
  }
}

export function updateChompSpriteDirection(game: SmashedGame): void {
  const c = game.chomp;

  if (c.sprite.body.velocity.x > 0) {
    c.sprite.flipX = false;
  } else if (c.sprite.body.velocity.x < 0) {
    c.sprite.flipX = true;
  }
}

export function updateChompVelocity(game: SmashedGame): void {
  const { chomp } = game;
  const {
    sprite,
    originX,
    originY,
    radius,
    percentFramesWalk,
    percentFramesAttack,
    powerStateCurr,
  } = chomp;
  const { body } = sprite;

  ////////////////////////////
  // Return chomp to circle
  ////////////////////////////
  if (!isChompInsideCircle(game)) {
    const { x: xNew, y: yNew } = getNormalizedVector(
      sprite.x,
      sprite.y,
      originX,
      originY
    );

    const newX: number = xNew * (powerStateCurr.name === 'dark' ? 500 : 50);

    body.setVelocityX(newX);
    body.setVelocityY(yNew * 200);
    return;
  }

  if (
    !body.touching.down ||
    Math.random() >
      (powerStateCurr.name === 'none' ? percentFramesWalk : percentFramesAttack)
  ) {
    return;
  }

  const p = getNearestPlayerAliveFromXY(body.position.x, body.position.y, game);

  if (!p) {
    return;
  }

  const { player } = p;

  const { x: xNew, y: yNew } = getNormalizedVector(
    sprite.x,
    sprite.y,
    player.char.sprite.x,
    player.char.sprite.y
  );

  if (powerStateCurr.name === 'dark') {
    chomp.soundAttack.play();
    body.setVelocityY(-1 * Math.abs(yNew + 0.3) * 700 - 400);
    body.setVelocityX(xNew * 700);
  } else {
    body.setVelocityX(xNew * 50);
  }
}

export function isChompInsideCircle(game: SmashedGame): boolean {
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

export function getCircleYfromX(x: number, game: SmashedGame): number {
  const c = game.chomp;
  const originX = c.originX;
  const originY = c.originY;
  const radius = c.radius;
  const y =
    Math.sqrt(radius * radius - (x - originX) * (x - originX)) + originY;

  return y;
}

export function updateChompLinkPositions(game: SmashedGame): void {
  const c = game.chomp;
  const endX = c.sprite.x;
  const endY = c.sprite.y;
  const startX = c.block.x;
  const startY = c.block.y;
  const links = c.links;
  const numLinks = links.length;

  const { x, y } = getVector(startX, startY, endX, endY);

  const chompY: number = y;
  const chompX: number = x;

  links.forEach((link, i) => {
    const percent = i / numLinks;
    const newX = startX + chompX * percent;
    const newY = startY + chompY * percent;

    link.sprite.x = newX;
    link.sprite.y = newY;
  });
}

export function getChompClosestDistance(game: SmashedGame): number {
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

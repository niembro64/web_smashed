import SmashedGame, { SCREEN_DIMENSIONS } from '../SmashedGame';
import { Line, Player, Position } from '../types';

export function normalRandom(mean: number = 0, stdev: number = 1) {
  let u, v, s;
  do {
    u = 2 * Math.random() - 1;
    v = 2 * Math.random() - 1;
    s = u * u + v * v;
  } while (s >= 1 || s === 0);
  s = Math.sqrt((-2 * Math.log(s)) / s);
  return mean + stdev * u * s;
}

export function getDistanceFromOrigin(end: Position, start: Position): number {
  return Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
}

/**
 * Check if a point is on a line segment
 */
function isPointOnLine(p: Position, line: Line): boolean {
  const { x: x1, y: y1 } = line.start;
  const { x: x2, y: y2 } = line.end;
  const { x, y } = p;

  // Check if the point (x, y) lies on the line segment from (x1, y1) to (x2, y2)
  return (
    x <= Math.max(x1, x2) &&
    x >= Math.min(x1, x2) &&
    y <= Math.max(y1, y2) &&
    y >= Math.min(y1, y2) &&
    (x2 - x1) * (y - y1) === (x - x1) * (y2 - y1)
  );
}

/**
 * Check if a line segment intersects another line segment
 */
function doLinesIntersect(line1: Line, line2: Line): boolean {
  const { x: x1, y: y1 } = line1.start;
  const { x: x2, y: y2 } = line1.end;
  const { x: x3, y: y3 } = line2.start;
  const { x: x4, y: y4 } = line2.end;

  const denominator = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
  const numerator1 = (x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3);
  const numerator2 = (x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3);

  if (denominator === 0) {
    return numerator1 === 0 && numerator2 === 0;
  }

  const r = numerator1 / denominator;
  const s = numerator2 / denominator;

  return r >= 0 && r <= 1 && s >= 0 && s <= 1;
}

/**
 * Check if a point is inside an irregular shape using ray tracing
 */
export function isPlayerInGameBoundary(
  player: Player,
  game: SmashedGame
): boolean {
  const point: Position = player.char.sprite.body.position;

  if (!point || !point.x || !point.y) return false;

  const boundaryPoints: Position[] = game.gamePathPoints;

  const shape: Line[] = [];
  for (let i = 0; i < boundaryPoints.length; i++) {
    const start = boundaryPoints[i];
    const end = boundaryPoints[(i + 1) % boundaryPoints.length];
    shape.push({ start, end });
  }

  let intersections = 0;
  const rayEndPoint: Position = { x: SCREEN_DIMENSIONS.WIDTH, y: point.y }; // Horizontal ray to the right

  for (const line of shape) {
    const ray = { start: point, end: rayEndPoint };

    // Check if the point is exactly on a line segment
    if (isPointOnLine(point, line)) {
      return true;
    }

    // Count intersections of the ray with shape edges
    if (doLinesIntersect(ray, line)) {
      intersections++;
    }
  }

  // Position is inside if the number of intersections is odd, outside if even
  return intersections % 2 !== 0;
}

export function willPlayerBeInBoundaryNextFrame(
  player: Player,
  game: SmashedGame
): boolean {
  const point: Position = player.char.sprite.body.position;

  if (!point || !point.x || !point.y) return false;

  const nextPoint: Position = {
    x: point.x + player.char.sprite.body.velocity.x,
    y: point.y + player.char.sprite.body.velocity.y,
  };
  const boundaryPoints: Position[] = game.gamePathPoints;

  const shape: Line[] = [];
  for (let i = 0; i < boundaryPoints.length; i++) {
    const start = boundaryPoints[i];
    const end = boundaryPoints[(i + 1) % boundaryPoints.length];
    shape.push({ start, end });
  }

  let intersections = 0;
  const rayEndPoint: Position = { x: SCREEN_DIMENSIONS.WIDTH, y: point.y }; // Horizontal ray to the right

  for (const line of shape) {
    const ray = { start: nextPoint, end: rayEndPoint };

    // Check if the point is exactly on a line segment
    if (isPointOnLine(nextPoint, line)) {
      return true;
    }

    // Count intersections of the ray with shape edges
    if (doLinesIntersect(ray, line)) {
      intersections++;
    }
  }

  // Position is inside if the number of intersections is odd, outside if even
  return intersections % 2 !== 0;
}

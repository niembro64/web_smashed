import SmashedGame from '../SmashedGame';

////////////////////////////////////////////////////////////
// Custom slope physics.
//
// Arcade physics only knows axis-aligned boxes, so the stage's
// staircases used to be zig-zag block collisions. This module is
// our own thin physics layer on top: the stairs are described as
// smooth line segments and every frame each character is landed
// on / glided along the line, exactly like a real ramp. The
// underlying blocks remain as interior fill (and for bullets,
// the table and the chain beast), but characters interact with
// the smooth surface.
////////////////////////////////////////////////////////////

export interface SlopeSegment {
  x1: number;
  y1: number; // surface height at x1 (x1 < x2)
  x2: number;
  y2: number;
}

// Stage 12: the big staircase from the low floor up to the rampart,
// as one smooth ramp through the old step corners. It continues
// below the lava line so anyone sliding all the way down burns.
export const STAGE_12_SLOPES: SlopeSegment[] = [
  { x1: 990, y1: 1383, x2: 1633, y2: 720 },
];

export function getSlopesForStage(game: SmashedGame): SlopeSegment[] {
  if (game.debug.Simple_Stage || game.debug.Stage !== 12) {
    return [];
  }
  return STAGE_12_SLOPES;
}

export function updateSlopePhysics(game: SmashedGame): void {
  const slopes = getSlopesForStage(game);
  if (slopes.length === 0) {
    return;
  }

  game.players.forEach((player) => {
    const sprite = player.char.sprite;
    const body = sprite?.body;
    if (!body) {
      return;
    }
    const halfHeight = sprite.displayHeight / 2;
    const foot = sprite.y + halfHeight;

    slopes.forEach((slope) => {
      if (sprite.x < slope.x1 || sprite.x > slope.x2) {
        return;
      }
      const t = (sprite.x - slope.x1) / (slope.x2 - slope.x1);
      const lineY = slope.y1 + (slope.y2 - slope.y1) * t;

      // land on / glide along the ramp when falling onto it or walking:
      // snap the feet to the surface line and ground the character
      if (body.velocity.y >= 0 && foot >= lineY - 10 && foot <= lineY + 44) {
        sprite.y = lineY - halfHeight;
        body.velocity.y = 0;
        body.touching.down = true;
        body.blocked.down = true;
      }
    });
  });
}

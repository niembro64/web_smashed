import SmashedGame from '../SmashedGame';
import { FlagSpikesState } from '../types';
import { onHitHandlerArbitraryAttack } from './damage';
import { getNearestPlayerAliveInRadiusFromPoint } from './movement';

////////////////////////////////////////////////////////////
// Left-wall spikes + trigger button.
//
// Works exactly like the spikes under the flag: a button on the
// lowest standable platform extends the spikes out of the left
// wall while a player stands on it, and touching the extended
// spikes while the button is held is lethal, launching the
// victim to the right.
////////////////////////////////////////////////////////////

export const LEFT_WALL_BUTTON_POS = { x: 900, y: 966 };
const SPIKES_Y = 700;
const SPIKES_X_EXTENDED = 30;
const SPIKES_X_RETRACTED = -60;

export function createLeftWallCombo(game: SmashedGame): void {
  if (game.debug.Simple_Stage) {
    return;
  }

  const lw = game.leftWallCombo;

  // spikes: same art/physics pattern as the flag spikes, rotated to
  // point out of the left wall
  lw.spikes.sprite = game.physics.add.sprite(
    SPIKES_X_RETRACTED,
    SPIKES_Y,
    'flag_spikes'
  );
  lw.spikes.sprite.setRotation(Math.PI / 2);
  lw.spikes.sprite.setImmovable(true);
  lw.spikes.sprite.body.allowGravity = false;
  lw.spikes.sound = game.sound.add('flag_spikes', {
    volume: 0.04,
    rate: 1,
  });

  // trigger button on the lowest standable platform, at the bottom
  // of the stairs
  lw.button.spriteUp = game.physics.add.sprite(
    LEFT_WALL_BUTTON_POS.x,
    LEFT_WALL_BUTTON_POS.y,
    'button_up'
  );
  lw.button.spriteUp.setScale(lw.button.scale);
  lw.button.spriteUp.setImmovable(true);
  lw.button.spriteUp.body.allowGravity = false;
  lw.button.spriteUp.setOrigin(0.5, 1);
  lw.button.spriteUp.setAlpha(1);

  lw.button.spriteDown = game.physics.add.sprite(
    LEFT_WALL_BUTTON_POS.x,
    LEFT_WALL_BUTTON_POS.y,
    'button_down'
  );
  lw.button.spriteDown.setScale(lw.button.scale);
  lw.button.spriteDown.setImmovable(true);
  lw.button.spriteDown.body.allowGravity = false;
  lw.button.spriteDown.setOrigin(0.5, 1);
  lw.button.spriteDown.setAlpha(0);

  // lethal overlap — identical consequence to the flag spikes, but
  // launching victims rightward, away from the wall
  game.players.forEach((player, playerIndex) => {
    game.physics.add.overlap(player.char.sprite, lw.spikes.sprite, () => {
      if (
        lw.spikes.state === 'spikes-up' &&
        lw.button.playerIndexPressing !== null
      ) {
        lw.spikes.sound.play();
        onHitHandlerArbitraryAttack({
          playerHit: player,
          playerHitIndex: playerIndex,
          direction: { x: 5000, y: -1000 },
          j: 0,
          damage: 1000,
          game: game,
        });
      }
    });
  });
}

function setLeftWallSpikesState(
  game: SmashedGame,
  stateNew: FlagSpikesState
): void {
  const lw = game.leftWallCombo;

  switch (stateNew) {
    case 'spikes-up': // extended out of the wall
      lw.spikes.sprite.setPosition(SPIKES_X_EXTENDED, SPIKES_Y);
      lw.button.spriteUp.setAlpha(0);
      lw.button.spriteDown.setAlpha(1);
      lw.spikes.sound.play();
      break;
    case 'spikes-down': // retracted into the wall
      lw.spikes.sprite.setPosition(SPIKES_X_RETRACTED, SPIKES_Y);
      lw.button.spriteUp.setAlpha(1);
      lw.button.spriteDown.setAlpha(0);
      break;
  }
  lw.spikes.state = stateNew;
}

export function updateLeftWallCombo(game: SmashedGame): void {
  if (game.debug.Simple_Stage || !game.leftWallCombo.spikes.sprite) {
    return;
  }

  const lw = game.leftWallCombo;

  const { playerIndex } = getNearestPlayerAliveInRadiusFromPoint({
    x: lw.button.spriteUp?.x || LEFT_WALL_BUTTON_POS.x,
    y: lw.button.spriteUp?.y || LEFT_WALL_BUTTON_POS.y,
    radius: 64,
    game: game,
  });

  lw.button.playerIndexPressing = playerIndex;

  if (playerIndex !== null && lw.spikes.state === 'spikes-down') {
    setLeftWallSpikesState(game, 'spikes-up');
  }
  if (playerIndex === null && lw.spikes.state === 'spikes-up') {
    setLeftWallSpikesState(game, 'spikes-down');
  }
}

import SmashedGame from '../SmashedGame';
import {
  Flag,
  FlagButton,
  FlagSpikes,
  FlagSpikesState,
  Player,
} from '../types';
import { getNearestPlayerAliveInRadiusFromPoint } from './movement';
import { setPlayerPowerState } from './powers';
import { setBGMusicResume, setMusicBoxPause, setMusicBoxResume } from './sound';

export const getIsInPoleArea = (
  x: number,
  y: number,
  game: SmashedGame
): boolean => {
  const f = game.flag;
  if (f.completedCurr === 'flag-completed') {
    return false;
  }

  const pole = game.flag.spriteFlagPole;

  const xMin = pole.x - 3.5 * pole.width;
  const xMax = pole.x + 2 * pole.width;
  const yMin = pole.y - pole.height / 2;
  const yMax = pole.y + pole.height / 2;

  return x >= xMin && x <= xMax && y >= yMin && y <= yMax;
};

export const updateFlagToucher = (game: SmashedGame): void => {
  if (game.debug.Simple_Stage) {
    return;
  }

  const f = game.flag;

  if (f.completedCurr === 'flag-completed') {
    return;
  }

  const ptStamps = f.poleTouchStamps;

  game.players.forEach((player, pIndex) => {
    const pTouchingDown = player.char.sprite.body.touching.down;

    // currently touching if
    // in flag area
    // and touching down
    if (
      pTouchingDown &&
      getIsInPoleArea(player.char.sprite.x, player.char.sprite.y, game)
    ) {
      if (!ptStamps[pIndex].touching) {
        // setBGMusicPause(game);
        setMusicBoxResume(game);
        ptStamps[pIndex].touching = true;
        ptStamps[pIndex].gameStamp = game.gameNanoseconds;
      }
    } else if (ptStamps[pIndex].touching) {
      // setBGMusicResume(game);
      setMusicBoxPause(game);
      ptStamps[pIndex].touching = false;
      ptStamps[pIndex].gameStamp = game.gameNanoseconds;
    }
  });
  let newToucherId: null | number = null;
  let toucherGameStamp = Infinity;

  ptStamps.forEach((ptStamp, ptIndex) => {
    if (ptStamp.touching && ptStamp.gameStamp < toucherGameStamp) {
      newToucherId = ptIndex;
      toucherGameStamp = ptStamp.gameStamp;
    }
  });

  f.toucherPrev.id = f.toucherCurr.id;
  f.toucherPrev.gameStamp = f.toucherCurr.gameStamp;

  f.toucherCurr.id = newToucherId;
  f.toucherCurr.gameStamp = toucherGameStamp;
};

export const updateFlagMovement = (game: SmashedGame): void => {
  if (game.debug.Simple_Stage) {
    return;
  }

  const { flag } = game;

  if (flag.completedPrev === 'flag-completed') return;

  flag.completedPrev = flag.completedCurr;

  if (flag.completedCurr === 'flag-completed') {
    flag.spriteFlagMover.body.setVelocityY(0);
    return;
  }

  const toucherId = flag.toucherCurr.id;
  const ownerId = flag.ownerCurr.id;

  if (ownerId !== null && flag.spriteFlagMover.y < flag.box.top) {
    flag.completedCurr = 'flag-completed';
    const playerOwner = game.players[ownerId];
    setPlayerPowerState('none', playerOwner, game);
    setBGMusicResume(game);
    setMusicBoxPause(game);
    flag.spriteFlagMover.body.setVelocityY(0);
  } else if (toucherId === null) {
    flag.spriteFlagMover.body.setVelocityY(0);
  } else if (toucherId === ownerId) {
    const speed = game.players[toucherId].emitterDark.visible
      ? -flag.flagSpeedDark
      : -flag.flagSpeed;
    flag.spriteFlagMover.body.setVelocityY(speed);
  } else if (toucherId !== ownerId) {
    const speed = game.players[toucherId].emitterDark.visible
      ? flag.flagSpeedDark
      : flag.flagSpeed;
    flag.spriteFlagMover.body.setVelocityY(speed);
  }
};

export const updateFlagOwner = (game: SmashedGame): void => {
  if (game.debug.Simple_Stage) {
    return;
  }

  const { toucherCurr, ownerCurr, spriteFlagMover, box, completedCurr } =
    game.flag;

  if (completedCurr === 'flag-completed' || toucherCurr.id === null) return;

  if (spriteFlagMover.y > box.bottom && toucherCurr.id !== ownerCurr.id) {
    ownerCurr.id = toucherCurr.id;
    ownerCurr.gameStamp = game.gameNanoseconds;
    game.flag.soundFlagCapture.play();
  }
};

export const updateFlagColor = (game: SmashedGame): void => {
  if (game.debug.Simple_Stage) {
    return;
  }

  const {
    spriteFlagMover,
    spriteFlagStationary,
    spriteFlagChar,
    ownerCurr,
    completedCurr,
    completedPrev,
  } = game.flag;

  if (
    completedCurr === 'flag-completed' &&
    completedPrev === 'flag-not-completed'
  )
    return;

  const color =
    ownerCurr.id === null
      ? 0xffffff
      : game.colorCircles[ownerCurr.id].colorNumber;
  spriteFlagMover.setTint(color);
  spriteFlagStationary.setTint(color);

  if (ownerCurr.id !== null) {
    const { char } = game.players[ownerCurr.id];
    const texture =
      char.srcSpriteSheet !== '' ? char.name + '_spritesheet' : char.src;
    spriteFlagChar.setTexture(texture, 0);
  }
};

export const getIsFlagShots = (game: SmashedGame): boolean => {
  if (game.debug.Simple_Stage) {
    return false;
  }

  return (
    game.flag.completedCurr === 'flag-completed' &&
    game.flag.completedPrev === 'flag-not-completed'
  );
};

export const setFlagOwnerNullIfDead = (
  player: Player,
  game: SmashedGame
): void => {
  if (game.debug.Simple_Stage) {
    return;
  }

  const { ownerCurr, ownerPrev, completedCurr } = game.flag;

  if (
    completedCurr === 'flag-not-completed' &&
    ownerCurr.id === player.playerId
  ) {
    ownerPrev.id = ownerCurr.id;
    ownerPrev.gameStamp = ownerCurr.gameStamp;

    ownerCurr.id = null;
    ownerCurr.gameStamp = game.gameNanoseconds;
  }
};

export const setFlagSpikesState = (params: {
  game: SmashedGame;
  stateNew: FlagSpikesState;
}): void => {
  const { game, stateNew } = params;

  const flagSpikes: FlagSpikes = game.flag.flagSpikes;
  const button: FlagButton = game.flag.flagButton;

  switch (stateNew) {
    case 'spikes-up':
      flagSpikes.sprite.setPosition(flagSpikes.posUp.x, flagSpikes.posUp.y);

      button.spriteUp.setAlpha(0);
      button.spriteDown.setAlpha(1);

      flagSpikes.sound.play();
      break;
    case 'spikes-down':
      flagSpikes.sprite.setPosition(flagSpikes.posDown.x, flagSpikes.posDown.y);

      button.spriteUp.setAlpha(1);
      button.spriteDown.setAlpha(0);
      break;
    default:
      throw new Error('setFlagSpikesState: stateNew not recognized' + stateNew);
  }

  flagSpikes.state = stateNew;
};

export const updateFlagButton = (game: SmashedGame): void => {
  const button: FlagButton = game.flag.flagButton;
  const flag: Flag = game.flag;

  const { player, playerIndex } = getNearestPlayerAliveInRadiusFromPoint({
    x: button.spriteUp.x,
    y: button.spriteUp.y,
    radius: 64,
    game: game,
  });

  button.playerIndexPressing = playerIndex;

  if (
    button.playerIndexPressing !== null &&
    flag.flagSpikes.state === 'spikes-down'
  ) {
    setFlagSpikesState({ game, stateNew: 'spikes-up' });
  }

  if (
    button.playerIndexPressing === null &&
    flag.flagSpikes.state === 'spikes-up'
  ) {
    setFlagSpikesState({ game, stateNew: 'spikes-down' });
  }
};

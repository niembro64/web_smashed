import SmashedGame from '../SmashedGame';
import { Player } from '../interfaces';
import { setPlayerPowerState } from './powers';
import {
  setBGMusicPause,
  setBGMusicResume,
  setMusicBoxPause,
  setMusicBoxResume,
} from './sound';

export const getIsInPoleExact = (
  x: number,
  y: number,
  game: SmashedGame
): boolean => {
  const f = game.flag;
  if (f.completedCurr) {
    return false;
  }

  const pole = game.flag.spriteFlagPole;

  const xMin = pole.x - pole.width / 2;
  const xMax = pole.x + pole.width / 2;
  const yMin = pole.y - pole.height / 2;
  const yMax = pole.y + pole.height / 2;

  return x >= xMin && x <= xMax && y >= yMin && y <= yMax;
};

export const getIsInPoleArea = (
  x: number,
  y: number,
  game: SmashedGame
): boolean => {
  const f = game.flag;
  if (f.completedCurr) {
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
  const f = game.flag;

  if (f.completedCurr) {
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
        setBGMusicPause(game);
        setMusicBoxResume(game);
        ptStamps[pIndex].touching = true;
        ptStamps[pIndex].gameStamp = game.gameNanoseconds;
      }
    } else if (ptStamps[pIndex].touching) {
      setBGMusicResume(game);
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
  const { flag } = game;

  if (flag.completedPrev) return;

  flag.completedPrev = flag.completedCurr;

  if (flag.completedCurr) {
    flag.spriteFlagMover.body.setVelocityY(0);
    return;
  }

  const toucher = flag.toucherCurr.id;
  const owner = flag.ownerCurr.id;

  if (owner !== null && flag.spriteFlagMover.y < flag.box.top) {
    flag.completedCurr = true;
    const playerOwner = game.players[owner];
    setPlayerPowerState('none', playerOwner, game);
    setBGMusicResume(game);
    setMusicBoxPause(game);
    flag.spriteFlagMover.body.setVelocityY(0);
  } else if (toucher === null) {
    flag.spriteFlagMover.body.setVelocityY(0);
  } else if (toucher === owner) {
    const speed = game.players[toucher].emitterDark.visible
      ? -flag.flagSpeedDark
      : -flag.flagSpeed;
    flag.spriteFlagMover.body.setVelocityY(speed);
  } else if (toucher !== owner) {
    const speed = game.players[toucher].emitterDark.visible
      ? flag.flagSpeedDark
      : flag.flagSpeed;
    flag.spriteFlagMover.body.setVelocityY(speed);
  }
};

export const updateFlagOwner = (game: SmashedGame): void => {
  const { toucherCurr, ownerCurr, spriteFlagMover, box, completedCurr } =
    game.flag;

  if (completedCurr || toucherCurr.id === null) return;

  if (spriteFlagMover.y > box.bottom && toucherCurr.id !== ownerCurr.id) {
    ownerCurr.id = toucherCurr.id;
    ownerCurr.gameStamp = game.gameNanoseconds;
    game.flag.soundFlagCapture.play();
  }
};

export const updateFlagColor = (game: SmashedGame): void => {
  const {
    spriteFlagMover,
    spriteFlagStationary,
    spriteFlagChar,
    ownerCurr,
    completedCurr,
    completedPrev,
  } = game.flag;

  if (completedCurr && !completedPrev) return;

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
  return game.flag.completedCurr && !game.flag.completedPrev;
};

export const setFlagOwnerNullIfDead = (
  player: Player,
  game: SmashedGame
): void => {
  const { ownerCurr, ownerPrev, completedCurr } = game.flag;

  if (!completedCurr && ownerCurr.id === player.playerId) {
    ownerPrev.id = ownerCurr.id;
    ownerPrev.gameStamp = ownerCurr.gameStamp;

    ownerCurr.id = null;
    ownerCurr.gameStamp = game.gameNanoseconds;
  }
};

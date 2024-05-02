import Game from '../Game';
import { Player } from '../interfaces';
import { setPlayerPowerState } from './powers';
import {
  setBGMusicPause,
  setBGMusicResume,
  setMusicBoxPause,
  setMusicBoxResume,
} from './sound';

export const getIsInPoleExact = (x: number, y: number, game: Game): boolean => {
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

export const getIsInPoleArea = (x: number, y: number, game: Game): boolean => {
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

export const updateFlagToucher = (game: Game): void => {
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

export const updateFlagMovement = (game: Game): void => {
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

export const updateFlagOwner = (game: Game): void => {
  const f = game.flag;

  if (f.completedCurr) {
    return;
  }

  const toucher = game.flag.toucherCurr.id;
  const owner = game.flag.ownerCurr.id;
  const fs = game.flag.spriteFlagMover;

  // do nothing
  // if no one is touching the flat
  if (toucher === null) {
    return;
  }

  // if the flag is down
  // and the toucher is not the owner
  // make the toucher the owner
  if (fs.y > f.box.bottom && toucher !== owner) {
    f.ownerPrev.id = f.ownerCurr.id;
    f.ownerPrev.gameStamp = f.ownerCurr.gameStamp;

    f.ownerCurr.id = toucher;
    f.ownerCurr.gameStamp = game.gameNanoseconds;
    f.soundFlagCapture.play();
  }
};

export const updateFlagColor = (game: Game): void => {
  const f = game.flag;
  const fs = game.flag.spriteFlagMover;
  const fb = game.flag.spriteFlagStationary;
  const owner = game.flag.ownerCurr.id;

  if (f.completedCurr && f.completedCurr && !f.completedPrev) {
    return;
  }

  if (owner === null) {
    fs.setTint(0xffffff);
    fb.setTint(0xffffff);
    return;
  }

  const color = game.colorCircles[owner].colorNumber;
  fs.setTint(color);
  fb.setTint(color);

  const player = game.players[owner];

  if (player.char.srcSpriteSheet !== '') {
    f.spriteFlagChar.setTexture(player.char.name + '_spritesheet', 0);
  } else {
    f.spriteFlagChar.setTexture(player.char.src);
  }
};

export const getIsFlagShots = (game: Game): boolean => {
  return game.flag.completedCurr && !game.flag.completedPrev;
};

export const setFlagOwnerNullIfDead = (player: Player, game: Game): void => {
  if (game.flag.completedCurr) {
    return;
  }

  const f = game.flag;
  const owner = f.ownerCurr.id;

  if (owner === null) {
    return;
  }

  if (owner === player.playerId) {
    f.ownerPrev.id = f.ownerCurr.id;
    f.ownerPrev.gameStamp = f.ownerCurr.gameStamp;

    f.ownerCurr.id = null;
    f.ownerCurr.gameStamp = game.gameNanoseconds;
  }
};

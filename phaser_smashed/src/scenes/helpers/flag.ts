import Game from '../Game';
import { Player } from '../interfaces';

export const getIsInPole = (x: number, y: number, game: Game): boolean => {
  let f = game.flag;
  if (f.completedCurr) {
    return false;
  }

  let pole = game.POLE;

  let xMin = pole.x - pole.width / 2;
  let xMax = pole.x + pole.width / 2;
  let yMin = pole.y - pole.height / 2;
  let yMax = pole.y + pole.height / 2;

  return x >= xMin && x <= xMax && y >= yMin && y <= yMax;
};

export const updateFlagToucher = (game: Game): void => {
  let f = game.flag;

  if (f.completedCurr) {
    return;
  }

  let ptStamps = f.poleTouchStamps;

  game.players.forEach((player, pIndex) => {
    let pTouchingDown = player.char.sprite.body.touching.down;

    // currently touching if
    // in flag area
    // and touching down
    if (
      pTouchingDown &&
      getIsInPole(player.char.sprite.x, player.char.sprite.y, game)
    ) {
      if (ptStamps[pIndex].touching) {
      } else {
        ptStamps[pIndex].touching = true;
        ptStamps[pIndex].gameStamp = game.gameNanoseconds;
      }
    } else {
      ptStamps[pIndex].touching = false;
      ptStamps[pIndex].gameStamp = game.gameNanoseconds;
    }
  });
  let toucherId: null | number = null;
  let toucherGameStamp = Infinity;

  ptStamps.forEach((ptStamp, ptIndex) => {
    if (ptStamp.touching && ptStamp.gameStamp < toucherGameStamp) {
      toucherId = ptIndex;
      toucherGameStamp = ptStamp.gameStamp;
    }
  });

  if (f.toucherPrev.id === toucherId) {
    return;
  }

  f.toucherPrev.id = f.toucherCurr.id;
  f.toucherPrev.gameStamp = f.toucherCurr.gameStamp;

  f.toucherCurr.id = toucherId;
  f.toucherCurr.gameStamp = toucherGameStamp;
};

export const updateFlagMovement = (game: Game): void => {
  let f = game.flag;

  if (f.completedPrev) {
    return;
  }

  f.completedPrev = f.completedCurr;

  if (f.completedCurr) {
    // f.soundFlagComplete.play();
    f.spriteFlagMove.body.setVelocityY(0);
    return;
  }

  let toucher = game.flag.toucherCurr.id;
  let owner = game.flag.ownerCurr.id;

  if (owner !== null && f.spriteFlagMove.y < f.box.top) {
    f.completedCurr = true;

    if (f.completedCurr && !f.completedPrev) {
      // f.soundFlagComplete.play();
      f.spriteFlagMove.body.setVelocityY(0);
    }
  }

  // no one toucher
  // no movement
  if (toucher === null) {
    f.spriteFlagMove.body.setVelocityY(0);
    return;
  }

  // owner is toucher
  // go up
  if (toucher === owner) {
    let v = game.players[toucher].emitterDark.visible
      ? -game.flagSpeedDark
      : -game.flagSpeed;
    f.spriteFlagMove.body.setVelocityY(v);
    return;
  }

  // another player is toucher
  // go down
  if (toucher !== owner) {
    let v = game.players[toucher].emitterDark.visible
      ? game.flagSpeedDark
      : game.flagSpeed;
    f.spriteFlagMove.body.setVelocityY(v);
  }
};

export const updateFlagOwner = (game: Game): void => {
  let f = game.flag;

  if (f.completedCurr) {
    return;
  }

  let toucher = game.flag.toucherCurr.id;
  let owner = game.flag.ownerCurr.id;
  let fs = game.flag.spriteFlagMove;

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

export const printFlagOwnerAndToucher = (game: Game): void => {
  let toucher = game.flag.toucherCurr.id;
  let owner = game.flag.ownerCurr.id;

  console.log('t:', toucher, 'o:', owner);
};

export const updateFlagColor = (game: Game): void => {
  let f = game.flag;
  let fs = game.flag.spriteFlagMove;
  let fb = game.flag.spriteFlagPost;
  let owner = game.flag.ownerCurr.id;

  if (f.completedCurr && f.completedCurr && !f.completedPrev) {
    // fs.setAlpha(0.5);
    // game.POLE.setAlpha(0.5);
    // fire.setScale(3);
    // fire.setAlpha(1);
    // fire.play('firework');
    return;
  }

  if (owner === null) {
    // console.log('fs', fs);
    // console.log('fb', fb);
    fs.setTint(0xffffff);
    fb.setTint(0xffffff);
    return;
  }

  let color = game.colorCircles[owner].colorNumber;
  fs.setTint(color);
  fb.setTint(color);

  let player = game.players[owner];

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

  let f = game.flag;
  let owner = f.ownerCurr.id;

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

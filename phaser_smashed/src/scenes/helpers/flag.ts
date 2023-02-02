import Game from '../Game';

export const getIsInPole = (x: number, y: number, game: Game): boolean => {
  let f = game.flag;
  if (f.completed) {
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

  if (f.completed) {
    return;
  }

  let ptStamps = f.poleTouchStamps;

  game.players.forEach((player, pIndex) => {
    if (getIsInPole(player.char.sprite.x, player.char.sprite.y, game)) {
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

  if (f.completed) {
    f.sprite.body.setVelocityY(0);
    return;
  }

  let toucher = game.flag.toucherCurr.id;
  let owner = game.flag.ownerCurr.id;

  if (owner !== null && f.sprite.y < f.box.top) {
    f.completed = true;
    f.sprite.body.setVelocityY(0);
  }

  // no one toucher
  // no movement
  if (toucher === null) {
    f.sprite.body.setVelocityY(0);
    return;
  }

  // owner is toucher
  // go up
  if (toucher === owner) {
    f.sprite.body.setVelocityY(-50);
    return;
  }

  // another player is toucher
  // go down
  if (toucher !== owner) {
    f.sprite.body.setVelocityY(50);
  }
};

export const updateFlagOwner = (game: Game): void => {
  let f = game.flag;

  if (f.completed) {
    return;
  }

  let toucher = game.flag.toucherCurr.id;
  let owner = game.flag.ownerCurr.id;
  let fs = game.flag.sprite;

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
  }
};

export const printFlagOwnerAndToucher = (game: Game): void => {
  let toucher = game.flag.toucherCurr.id;
  let owner = game.flag.ownerCurr.id;

  console.log('t:', toucher, 'o:', owner);
};

export const updateFlagColor = (game: Game): void => {
  let f = game.flag;
  let fs = game.flag.sprite;
  let owner = game.flag.ownerCurr.id;

  if (owner === null) {
    fs.setTint(0xffffff);
    return;
  }

  let color = game.colorCircles[owner].colorNumber;
  fs.setTint(color);
};

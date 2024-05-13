import Game, { SCREEN_DIMENSIONS } from '../Game';
import { emoji, SplashName } from '../interfaces';
import { updatePlayerWinningPositions } from './drinking';
import { getIsPlayerReady } from './pad';
import { pauseReadySoundPlayer, playReadySoundPlayer } from './sound';

export function updateText(game: Game): void {
  const dataTitleY = 65;
  const dataY = dataTitleY + 45;
  const splashY = SCREEN_DIMENSIONS.HEIGHT / 2;
  const controllerY = SCREEN_DIMENSIONS.HEIGHT - 220;
  const glassY = SCREEN_DIMENSIONS.HEIGHT - 180;
  const glassYCups = SCREEN_DIMENSIONS.HEIGHT - 280;
  const glassNumY = SCREEN_DIMENSIONS.HEIGHT - 180;
  const readyY = SCREEN_DIMENSIONS.HEIGHT - 140;
  const damageY = SCREEN_DIMENSIONS.HEIGHT - 76;
  const gameTimeY = SCREEN_DIMENSIONS.HEIGHT - 85;
  const timeTimeY = SCREEN_DIMENSIONS.HEIGHT - 95;
  const killsY = SCREEN_DIMENSIONS.HEIGHT - 75;
  const bgY = SCREEN_DIMENSIONS.HEIGHT / 2;

  const zoom = game.cameras.main.zoom;
  const redOffsetY =
    game.cameraMover.char.sprite.y - game.cameraCenter.char.sprite.y;

  const newDataTitleY =
    dataTitleY * (1 / zoom) +
    redOffsetY * (1 / zoom) +
    game.cameraMover.char.sprite.y * (-1 / zoom + 1);
  const newDataY =
    dataY * (1 / zoom) +
    redOffsetY * (1 / zoom) +
    game.cameraMover.char.sprite.y * (-1 / zoom + 1);
  const newSplashY =
    splashY * (1 / zoom) +
    redOffsetY * (1 / zoom) +
    game.cameraMover.char.sprite.y * (-1 / zoom + 1);
  const newControllerY =
    controllerY * (1 / zoom) +
    redOffsetY * (1 / zoom) +
    game.cameraMover.char.sprite.y * (-1 / zoom + 1);
  const newTopY =
    glassY * (1 / zoom) +
    redOffsetY * (1 / zoom) +
    game.cameraMover.char.sprite.y * (-1 / zoom + 1);
  const newTopYCups =
    glassYCups * (1 / zoom) +
    redOffsetY * (1 / zoom) +
    game.cameraMover.char.sprite.y * (-1 / zoom + 1);
  const newTopNumY =
    glassNumY * (1 / zoom) +
    redOffsetY * (1 / zoom) +
    game.cameraMover.char.sprite.y * (-1 / zoom + 1);
  const newReadyY =
    readyY * (1 / zoom) +
    redOffsetY * (1 / zoom) +
    game.cameraMover.char.sprite.y * (-1 / zoom + 1);
  const newGameTimeY =
    gameTimeY * (1 / zoom) +
    redOffsetY * (1 / zoom) +
    game.cameraMover.char.sprite.y * (-1 / zoom + 1);
  const newUpperY =
    damageY * (1 / zoom) +
    redOffsetY * (1 / zoom) +
    game.cameraMover.char.sprite.y * (-1 / zoom + 1);
  const newTimeTimeY =
    timeTimeY * (1 / zoom) +
    redOffsetY * (1 / zoom) +
    game.cameraMover.char.sprite.y * ((-1 * 1) / Math.pow(zoom, 1) + 1);
  const newLowerY =
    killsY * (1 / zoom) +
    redOffsetY * (1 / zoom) +
    game.cameraMover.char.sprite.y * ((-1 * 1) / Math.pow(zoom, 1) + 1);
  const newBgY =
    bgY * (1 / zoom) +
    redOffsetY * (1 / zoom) +
    game.cameraMover.char.sprite.y * ((-1 * 1) / Math.pow(zoom, 1) + 1);

  updateClockTextLower(game, zoom, newTimeTimeY);
  updatePlaceCups(game, zoom, newTopYCups);
  updateShotGlasses(game, zoom, newTopY);
  updateGlassesNumberShots(game, zoom, newTopNumY);
  updateDamageShotsText(game, zoom, newUpperY);
  updateControllerText(game, zoom, newControllerY);
  updateReadyText(game, zoom, newReadyY);
  updateSplashRules(game, zoom, newSplashY);
  updateDeathsKillsText(game, zoom, newLowerY);
  updateEndDataMatrices(game, zoom, newDataY, newDataTitleY);
  updateBgLocation(game, zoom, newBgY);
  updateClockTextUpper(game, zoom, newGameTimeY);
}

export function updateBgLocation(game: Game, zoom: number, newY: number): void {
  // game.BACKGROUND.setScale(1.1, 1.1);
  game.BACKGROUND.setScale(1.2 / zoom, 1.2 / zoom);
  let x = SCREEN_DIMENSIONS.WIDTH / 2;
  let y = SCREEN_DIMENSIONS.HEIGHT / 2;
  game.BACKGROUND.x = game.cameraMover.char.sprite.x * 0.7 + x * 0.3;
  game.BACKGROUND.y = game.cameraMover.char.sprite.y * 0.7 + y * 0.3;
}

export function setSplashDataOn(game: Game): void {
  if (game.debug.Matrices_Always) {
    return;
  }
  game.splashesEndData.forEach((splash, splashIndex) => {
    splash.textTitle.visible = true;
    splash.textData.visible = true;
  });
}

export function setSplashDataOff(game: Game): void {
  if (game.debug.Matrices_Always) {
    return;
  }
  game.splashesEndData.forEach((splash, splashIndex) => {
    splash.textTitle.visible = false;
    splash.textData.visible = false;
  });
}

export function updateSplashRules(
  game: Game,
  zoom: number,
  newY: number
): void {
  game.splashRules.forEach((splash, splashIndex) => {
    splash.text.setScale(1 / zoom, 1 / zoom);
    splash.text.x = game.cameraMover.char.sprite.x;
    splash.text.y = newY;
  });
}

export function setRuleSplashOn(game: Game, splashName: SplashName): void {
  game.splashRules.forEach((splash, splashIndex) => {
    splash.text.setAlpha(0);
    if (splash.name === splashName) {
      splash.text.setAlpha(1);
    }
  });

  if (splashName !== 'splash-none') {
    game.splashRules[0].text.setAlpha(1);
  } else {
    game.splashRules[0].text.setAlpha(0);
  }
}

export function updateClockTextUpper(
  game: Game,
  zoom: number,
  newUpperY: number
): void {
  game.scoreBoardTimeGame.x = game.cameraMover.char.sprite.x;
  // game.cameraMover.char.sprite.x + game.textLocationLROffset * (1 / zoom);
  game.scoreBoardTimeGame.y = newUpperY;

  if (game.debug.Mode_Infinity) {
    game.scoreBoardTimeGame.setScale(1 / zoom, 1 / zoom);
    let shotsString: string = '';

    for (let i = 0; i < game.debug.Shots - game.shotsLeftCurr; i++) {
      shotsString += emoji.redX;
    }

    for (let i = 0; i < game.shotsLeftCurr; i++) {
      shotsString += emoji.beer;
    }

    game.scoreBoardTimeGame.setText(shotsString);
  } else {
    game.scoreBoardTimeGame.setScale(1 / zoom, 1 / zoom);
    game.scoreBoardTimeGame.setText(
      game.gameClock.minutes.toString() +
        ':' +
        (game.gameClock.seconds < 10 ? '0' : '') +
        game.gameClock.seconds.toString()
    );
  }
}
export function updateClockTextLower(
  game: Game,
  zoom: number,
  newLowerY: number
): void {
  game.scoreBoardTimeTime.setScale(1 / zoom, 1 / zoom);
  game.scoreBoardTimeTime.x = game.cameraMover.char.sprite.x;
  game.scoreBoardTimeTime.y = newLowerY;

  game.scoreBoardTimeTime.setText(
    game.timeClock.minutes.toString() +
      ':' +
      (game.timeClock.seconds < 10 ? '0' : '') +
      game.timeClock.seconds.toString()
  );
}

export function updateShotsOnPlayers(game: Game) {
  game.players.forEach((player, playerIndex) => {
    player.shotCountPrev = player.shotCountCurr;
    player.shotCountCurr = 0;
    for (let j = 0; j < game.players.length; j++) {
      player.shotCountCurr += game.numberShotsTakenByMeMatrix[playerIndex][j];
    }
  });
}

export function updatePlaceCups(game: Game, zoom: number, newY: number): void {
  let players = game.players;
  let ecs = game.endCups;
  if (game.gameState.nameCurr === 'game-state-finished') {
    ecs.forEach((ec, ecIndex) => {
      ec.sprite.setAlpha(1);
    });
  } else if (
    game.gameState.nameCurr === 'game-state-screen-clear' ||
    game.gameState.nameCurr === 'game-state-first-blood' ||
    game.gameState.nameCurr === 'game-state-captured-flag'
  ) {
    if (game.debug.Trophies_On_Shots || game.debug.Trophies_Always) {
      ecs.forEach((ec, ecIndex) => {
        ec.sprite.setAlpha(0.5);
      });
    } else {
      ecs.forEach((ec, ecIndex) => {
        ec.sprite.setAlpha(0);
      });
      return;
    }
  } else {
    if (game.debug.Trophies_Always) {
      ecs.forEach((ec, ecIndex) => {
        ec.sprite.setAlpha(0.5);
      });
    } else {
      ecs.forEach((ec, ecIndex) => {
        ec.sprite.setAlpha(0);
      });
      return;
    }
  }

  // | 'game-state-start'
  // | 'game-state-play'
  // | 'game-state-paused'
  // | 'game-state-first-blood'
  // | 'game-state-screen-clear'
  // | 'game-state-captured-flag'
  // | 'game-state-finished';

  updatePlayerWinningPositions(game);

  for (let i = 0; i < ecs.length; i++) {
    let p = players[i].endPlace;

    ecs[p].sprite.setScale(0.682 / zoom, 0.682 / zoom);

    ecs[p].sprite.x =
      game.cameraMover.char.sprite.x +
      (game.textLocations[game.playerSpawnOrder[i]] +
        game.glassLocationLROffset) *
        (1 / zoom);

    ecs[p].sprite.y = newY;
  }
}

export function updateShotGlasses(
  game: Game,
  zoom: number,
  newY: number
): void {
  if (game.gameState.nameCurr === 'game-state-play') {
    game.players.forEach((player, playerIndex) => {
      player.shotGlassImage.setAlpha(0);
    });
    return;
  }
  // update shotGlassImage
  game.players.forEach((player, playerIndex) => {
    let show: boolean = player.shotCountCurr - player.shotCountPrev > 0;

    if (!show) {
      player.shotGlassImage.setAlpha(0);
      return;
    }

    if (player.shotCountCurr <= player.shotCountPrev) {
      player.shotGlassImage.setAlpha(0);
      return;
    }

    player.shotGlassImage.setAlpha(1);

    player.shotGlassImage.setScale(0.7 / zoom, 0.7 / zoom);
    player.shotGlassImage.x =
      game.cameraMover.char.sprite.x +
      (game.textLocations[game.playerSpawnOrder[playerIndex]] +
        game.glassLocationLROffset) *
        (1 / zoom);

    player.shotGlassImage.y = newY;
  });
}

export function updateGlassesNumberShots(
  game: Game,
  zoom: number,
  newY: number
): void {
  if (game.gameState.nameCurr === 'game-state-play') {
    game.players.forEach((player, playerIndex) => {
      player.shotGlassNumber.setAlpha(0);
    });
    return;
  }

  game.players.forEach((player, playerIndex) => {
    let show: boolean = player.shotCountCurr - player.shotCountPrev > 0;
    if (!show) {
      player.shotGlassNumber.setAlpha(0);
      return;
    }

    if (player.shotCountCurr <= player.shotCountPrev) {
      player.shotGlassNumber.setAlpha(0);
      return;
    }

    player.shotGlassNumber.setAlpha(1);

    player.shotGlassNumber.setScale(1 / zoom, 1 / zoom);
    player.shotGlassNumber.x =
      game.cameraMover.char.sprite.x +
      (game.textLocations[game.playerSpawnOrder[playerIndex]] +
        game.glassLocationLROffset) *
        (1 / zoom);

    player.shotGlassNumber.y = newY - 60;

    player.shotGlassNumber.setText(player.shotCountCurr - player.shotCountPrev);
  });
}

export function updateDamageShotsText(
  game: Game,
  zoom: number,
  newY: number
): void {
  // if (game.debug.statsInit) {
  game.players.forEach((player, playerIndex) => {
    player.scoreBoardUpper
      .setScale(1 / zoom, 1 / zoom)
      .setText(
        Math.round(
          game.debug.Health_Inverted
            ? (100 / (100 + player.char.damageCurr)) * 100
            : player.char.damageCurr
        ).toString() +
          game.TEXT_GAMEBAR_CHARS.damage +
          '  ' +
          player.shotCountCurr.toString() +
          game.TEXT_GAMEBAR_CHARS.shots
      );
    player.scoreBoardUpper.x =
      game.cameraMover.char.sprite.x +
      (game.textLocations[game.playerSpawnOrder[playerIndex]] +
        game.upperTextLocationLROffset) *
        (1 / zoom);

    player.scoreBoardUpper.y = newY;
  });
  return;
}

export function updateReadyText(game: Game, zoom: number, newY: number): void {
  game.players.forEach((player, playerIndex) => {
    if (
      game.gameState.nameCurr === 'game-state-play' ||
      game.gameState.nameCurr === 'game-state-finished'
    ) {
      player.scoreBoardReady.setAlpha(0);
    } else {
      if (getIsPlayerReady(player, game)) {
        player.scoreBoardReady.setAlpha(1);
        playReadySoundPlayer(player);
      } else {
        player.scoreBoardReady.setAlpha(0);
        pauseReadySoundPlayer(player);
      }
    }
  });

  game.players.forEach((player, playerIndex) => {
    player.scoreBoardReady.setScale(1 / zoom, 1 / zoom);

    player.scoreBoardReady.x =
      game.cameraMover.char.sprite.x +
      (game.textLocations[game.playerSpawnOrder[playerIndex]] +
        game.readyLocationLROffset) *
        (1 / zoom);

    player.scoreBoardReady.y = newY;
  });
  return;
}
export function updateControllerText(
  game: Game,
  zoom: number,
  newY: number
): void {
  game.players.forEach((player, playerIndex) => {
    if (
      game.gameState.nameCurr === 'game-state-play' ||
      game.gameState.nameCurr === 'game-state-finished'
    ) {
      player.scoreBoardController.setAlpha(0);
    } else {
      if (getIsPlayerReady(player, game)) {
        player.scoreBoardController.setAlpha(1);
        playReadySoundPlayer(player);
      } else {
        player.scoreBoardController.setAlpha(0);
        pauseReadySoundPlayer(player);
      }
    }
  });

  game.players.forEach((player, playerIndex) => {
    player.scoreBoardController.setScale(1 / zoom, 1 / zoom);

    player.scoreBoardController.x =
      game.cameraMover.char.sprite.x +
      (game.textLocations[game.playerSpawnOrder[playerIndex]] +
        game.readyLocationLROffset) *
        (1 / zoom);

    player.scoreBoardController.y = newY;
  });
  return;
}

export function updateDeathsKillsText(
  game: Game,
  zoom: number,
  newY: number
): void {
  game.players.forEach((player, playerIndex) => {
    player.scoreBoardLower
      .setScale(1 / zoom, 1 / zoom)
      .setText(
        player.killCount.toString() +
          game.TEXT_GAMEBAR_CHARS.kills +
          '' +
          player.deathCount.toString() +
          game.TEXT_GAMEBAR_CHARS.deaths
      );
    player.scoreBoardLower.x =
      game.cameraMover.char.sprite.x +
      (game.textLocations[game.playerSpawnOrder[playerIndex]] +
        game.lowerTextLocationLROffset) *
        (1 / zoom);

    player.scoreBoardLower.y = newY;
  });
  return;
}
export function updateEndDataMatrices(
  game: Game,
  zoom: number,
  newY: number,
  newTitleY: number
): void {
  let numSplashes: number = game.splashesEndData.length;

  game.splashesEndData.forEach((splash, splashIndex) => {
    splash.textTitle.setScale(1 / zoom, 1 / zoom);
    splash.textData.setScale(1 / zoom, 1 / zoom);
    for (let i = 0; i < game.players.length; i++) {
      switch (splashIndex) {
        case 0:
          splash.words[i] = game.colorCircles[i].text;
          splash.words[i] += '[';
          break;
        case 1:
          splash.words[i] = game.colorCircles[i].text;
          splash.words[i] += '[';
          break;
        case 2:
          splash.words[i] = game.colorCircles[i].text;
          splash.words[i] += '[';
          break;
        default:
          if (splashIndex !== game.splashesEndData.length - 1) {
            splash.words[i] = '[';
          }
      }
      for (let j = 0; j < game.players.length; j++) {
        switch (splashIndex) {
          case 0:
            if (game.numberHitByMatrix[i][j] < 10) {
              splash.words[i] += ' ';
            }
            if (game.numberHitByMatrix[i][j] === 0) {
              splash.words[i] += ' ';
            } else {
              splash.words[i] += game.numberHitByMatrix[i][j].toString();
            }
            break;
          case 1:
            if (game.numberKilledByMatrix[i][j] < 10) {
              splash.words[i] += ' ';
            }
            if (game.numberKilledByMatrix[i][j] === 0) {
              splash.words[i] += ' ';
            } else {
              splash.words[i] += game.numberKilledByMatrix[i][j].toString();
            }
            break;
          case 2:
            if (game.numberShotsTakenByMeMatrix[i][j] < 10) {
              splash.words[i] += ' ';
            }
            if (game.numberShotsTakenByMeMatrix[i][j] === 0) {
              splash.words[i] += ' ';
            } else {
              splash.words[i] +=
                game.numberShotsTakenByMeMatrix[i][j].toString();
            }
            break;
          default:
            if (splashIndex !== game.splashesEndData.length - 1) {
              splash.words[i] += 'XXX';
            }
        }
        if (splashIndex !== game.splashesEndData.length - 1) {
          splash.words[i] += j === game.players.length - 1 ? '' : ',';
        }
      }
      if (splashIndex !== game.splashesEndData.length - 1) {
        splash.words[i] += ']';
      }
    }
    splash.textTitle.x =
      game.cameraMover.char.sprite.x +
      ((game.splashEndDataOffset +
        SCREEN_DIMENSIONS.WIDTH * (Math.floor(numSplashes / 2) - splashIndex)) /
        (numSplashes + 1)) *
        (1 / zoom);

    splash.textData.setText(splash.words);
    splash.textData.x =
      game.cameraMover.char.sprite.x +
      ((game.splashEndDataOffset +
        SCREEN_DIMENSIONS.WIDTH * (Math.floor(numSplashes / 2) - splashIndex)) /
        (numSplashes + 1)) *
        (1 / zoom);

    splash.textTitle.y = newTitleY;
    splash.textData.y = newY;
  });
}

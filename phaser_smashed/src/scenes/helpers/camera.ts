import SmashedGame, { SCREEN_DIMENSIONS } from '../SmashedGame';
import { BulletBillSparkLine, Loc } from '../types';

export function updateCamera(game: SmashedGame): void {
  if (game.debug.Dev_Mode || !game.debug.Use_Camera) {
    game.cameras.main.zoom = game.debug.Dev_Zoom / 10;
    return;
  }
  const cPlayer = getCameraPlayerStatus(game);
  const cMover = getCameraMoverStatus(game);
  const cBorder = getCameraBorderStatus(game);
  const cBox = getCameraBoxStatus(game);
  const cSpark = {
    x: game.bulletBillCombo.sparkLine.spark.x,
    y: game.bulletBillCombo.sparkLine.spark.y,
  };

  game.cameraPlayers.char.sprite.x = cPlayer.x;
  game.cameraPlayers.char.sprite.y = cPlayer.y;
  game.cameraPlayers.char.zoom = cPlayer.zoom;

  game.cameraActual.char.sprite.x =
    game.cameraActual.char.sprite.x * game.ZOOM_RATIO_FAST +
    cMover.x * (1 - game.ZOOM_RATIO_FAST);

  game.cameraActual.char.sprite.y =
    game.cameraActual.char.sprite.y * game.ZOOM_RATIO_FAST +
    (cMover.y + game.CAMERA_OFFSET_Y) * (1 - game.ZOOM_RATIO_FAST);

  game.cameraActual.char.zoom = cMover.zoom;

  game.cameraPlayersHalfway.char.sprite.x = cBorder.x;
  game.cameraPlayersHalfway.char.sprite.y = cBorder.y;
  game.cameraPlayersHalfway.char.zoom = cBorder.zoom;

  game.cameraBox.char.sprite.x = cBox.x;
  game.cameraBox.char.sprite.y = cBox.y;
  game.cameraBox.char.zoom = cBox.zoom;

  const newZoom = game.cameraPlayers.char.zoom;
  // const newZoom = game.cameraPlayers.char.zoom * game.ZOOM_MULTIPLIER_X;
  // const newZoom = Math.max(game.cameraPlayers.char.zoom, 1);

  game.cameras.main.startFollow(game.cameraActual.char.sprite);

  if (game.cameras.main.zoom < newZoom) {
    game.cameras.main.zoom =
      game.cameras.main.zoom * game.ZOOM_RATIO_SLOW +
      newZoom * (1 - game.ZOOM_RATIO_SLOW);
  } else {
    game.cameras.main.zoom =
      game.cameras.main.zoom * game.ZOOM_RATIO_FAST +
      newZoom * (1 - game.ZOOM_RATIO_FAST);
  }
  // const newZoom = game.cameraPlayers.char.zoom;

  // if (game.cameras.main.zoom < newZoom) {
  //   game.cameras.main.zoom =
  //     game.cameras.main.zoom * game.zoomRatioSlow + newZoom * (1 - game.zoomRatioSlow);
  // } else {
  //   game.cameras.main.zoom =
  //     game.cameras.main.zoom * game.zoomRatioFast + newZoom * (1 - game.zoomRatioFast);
  // }
}

export function getBorderZoom(game: SmashedGame): number {
  let curr_x: number = 0;
  let curr_y: number = 0;

  if (game.cameraPlayers.char.sprite.x < SCREEN_DIMENSIONS.WIDTH / 2) {
    curr_x = game.BORDER_PADDING_X + game.cameraPlayers.char.sprite.x;
  } else {
    curr_x =
      game.BORDER_PADDING_X +
      SCREEN_DIMENSIONS.WIDTH -
      game.cameraPlayers.char.sprite.x;
  }

  if (game.cameraPlayers.char.sprite.y < SCREEN_DIMENSIONS.HEIGHT / 2) {
    curr_y = game.BORDER_PADDING_Y + game.cameraPlayers.char.sprite.y;
  } else {
    curr_y =
      game.BORDER_PADDING_Y +
      SCREEN_DIMENSIONS.HEIGHT -
      game.cameraPlayers.char.sprite.y;
  }

  let return_x = 1 / ((curr_x * 2) / SCREEN_DIMENSIONS.WIDTH);
  let return_y = 1 / ((curr_y * 2) / SCREEN_DIMENSIONS.HEIGHT);

  return Math.max(return_x, return_y);
}

export function getPlayerZoom(game: SmashedGame): number {
  let curr_x = 0;
  let curr_y = 0;

  game.players.forEach((player, playerIndex) => {
    if (
      Math.abs(
        game.BORDER_PADDING_X +
          player.char.sprite.x -
          game.cameraPlayers.char.sprite.x
      ) > curr_x
    ) {
      curr_x = Math.abs(
        game.BORDER_PADDING_X +
          player.char.sprite.x -
          game.cameraPlayers.char.sprite.x
      );
    }
  });
  game.players.forEach((player, playerIndex) => {
    if (
      Math.abs(
        game.BORDER_PADDING_Y +
          player.char.sprite.y -
          game.cameraPlayers.char.sprite.y
      ) > curr_y
    ) {
      curr_y = Math.abs(
        game.BORDER_PADDING_Y +
          player.char.sprite.y -
          game.cameraPlayers.char.sprite.y
      );
    }
  });

  const sparkLine: BulletBillSparkLine = game.bulletBillCombo.sparkLine;
  const sparkCircleX = sparkLine.spark.x + 100;
  const sparkCircleY = sparkLine.spark.y - 120;
  // const isSparkActive = sparkLine.emitter.active && sparkLine.emitter.on;

  if (
    // isSparkActive &&
    Math.abs(sparkCircleX - game.cameraPlayers.char.sprite.x) > curr_x
  ) {
    curr_x = Math.abs(sparkCircleX - game.cameraPlayers.char.sprite.x);
  }

  if (
    // isSparkActive &&
    Math.abs(sparkCircleY - game.cameraPlayers.char.sprite.y) > curr_y
  ) {
    curr_y = Math.abs(sparkCircleY - game.cameraPlayers.char.sprite.y);
  }

  let return_x = 1 / ((curr_x * 2) / SCREEN_DIMENSIONS.WIDTH);
  let return_y = 1 / ((curr_y * 2) / SCREEN_DIMENSIONS.HEIGHT);

  return Math.min(
    return_x * game.ZOOM_MULTIPLIER_X,
    return_y * game.ZOOM_MULTIPLIER_Y
  );
}

export function getCameraBorderStatus(game: SmashedGame): Loc {
  let x_low: number = Infinity;
  let x_high: number = 0;
  let y_low: number = Infinity;
  let y_high: number = 0;

  game.players.forEach((player, playerIndex) => {
    x_low = player.char.sprite.x > x_low ? x_low : player.char.sprite.x;
    x_high = player.char.sprite.x < x_high ? x_high : player.char.sprite.x;
    y_low = player.char.sprite.y > y_low ? y_low : player.char.sprite.y;
    y_high = player.char.sprite.y < y_high ? y_high : player.char.sprite.y;
  });

  return {
    x: ((x_low + x_high) / 2 + SCREEN_DIMENSIONS.WIDTH / 2) / 2,
    y: ((y_low + y_high) / 2 + SCREEN_DIMENSIONS.HEIGHT / 2) / 2,
    zoom: getBorderZoom(game),
  };
}

export function getCameraPlayerStatus(game: SmashedGame): Loc {
  let x_low: number = Infinity;
  let x_high: number = 0;
  let y_low: number = Infinity;
  let y_high: number = 0;

  game.players.forEach((player, playerIndex) => {
    x_low = player.char.sprite.x > x_low ? x_low : player.char.sprite.x;
    x_high = player.char.sprite.x < x_high ? x_high : player.char.sprite.x;
    y_low = player.char.sprite.y > y_low ? y_low : player.char.sprite.y;
    y_high = player.char.sprite.y < y_high ? y_high : player.char.sprite.y;
  });

  x_low =
    game.cameraCenter.char.sprite.x > x_low
      ? x_low
      : game.cameraCenter.char.sprite.x;
  x_high =
    game.cameraCenter.char.sprite.x < x_high
      ? x_high
      : game.cameraCenter.char.sprite.x;
  y_low =
    game.cameraCenter.char.sprite.y > y_low
      ? y_low
      : game.cameraCenter.char.sprite.y;
  y_high =
    game.cameraCenter.char.sprite.y < y_high
      ? y_high
      : game.cameraCenter.char.sprite.y;

  return {
    x: (x_low + x_high) / 2,
    y: (y_low + y_high) / 2,
    zoom: getPlayerZoom(game),
  };
}

export function getCameraMoverStatus(game: SmashedGame): Loc {
  // const x_low: number = Infinity;
  // const x_high: number = 0;
  // const y_low: number = Infinity;
  // const y_high: number = 0;

  const spritePlayer = game.cameraPlayers.char.sprite;
  // const spriteMover = game.cameraMover.char.sprite;
  const spriteCenter = game.cameraCenter.char.sprite;

  game.cameraMoverZoomStatusKeeper =
    game.cameraMoverZoomStatusKeeper * game.ZOOM_RATIO_SLOW +
    Math.max(getPlayerZoom(game), 1) * (1 - game.ZOOM_RATIO_SLOW);

  const percentCloseToCenter = Math.pow(
    1 / game.cameraMoverZoomStatusKeeper,
    3
  );

  let x =
    spritePlayer.x * (1 - percentCloseToCenter) +
    spriteCenter.x * percentCloseToCenter;
  let y =
    spritePlayer.y * (1 - percentCloseToCenter) +
    spriteCenter.y * percentCloseToCenter;

  return {
    x: x,
    y: y,
    zoom: getPlayerZoom(game),
  };
}

export function getCameraBoxStatus(game: SmashedGame): Loc {
  let x_low: number = Infinity;
  let x_high: number = 0;
  let y_low: number = Infinity;
  let y_high: number = 0;

  game.players.forEach((player, playerIndex) => {
    x_low = player.char.sprite.x > x_low ? x_low : player.char.sprite.x;
    x_high = player.char.sprite.x < x_high ? x_high : player.char.sprite.x;
    y_low = player.char.sprite.y > y_low ? y_low : player.char.sprite.y;
    y_high = player.char.sprite.y < y_high ? y_high : player.char.sprite.y;
  });

  let x = Math.max(SCREEN_DIMENSIONS.WIDTH / 4, (x_low + x_high) / 2);
  let y = Math.max(SCREEN_DIMENSIONS.HEIGHT / 4, (y_low + y_high) / 2);

  x = Math.min((SCREEN_DIMENSIONS.WIDTH / 4) * 3, x);
  y = Math.min((SCREEN_DIMENSIONS.HEIGHT / 4) * 3, y);

  return {
    x: x,
    y: y,
    zoom: 2,
  };
}

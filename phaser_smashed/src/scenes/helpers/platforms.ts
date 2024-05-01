import { print } from '../../views/client';
import Game, { SCREEN_DIMENSIONS } from '../Game';

export function createPlatforms(game: Game): void {
  print(
    'createPlatforms',
    game.debug.Level,
    'game.debug.Level',
    game.debug.Level
  );
  switch (game.debug.Level) {
    case 0:
      createPlatforms0(game);
      break;
    case 1:
      createPlatforms1(game);
      break;
    case 2:
      createPlatforms2(game);
      break;
    case 3:
      createPlatforms3(game);
      break;
    case 4:
      createPlatforms4(game);
      break;
    case 5:
      createPlatforms5(game);
      break;
    case 6:
      createPlatforms6(game);
      break;
    case 7:
      createPlatforms7(game);
      break;
    case 8:
      createPlatforms8(game);
      break;
    case 9:
      createPlatforms9(game);
      break;
    default:
      createPlatforms0(game);
      print('createPlatforms', 'DEFAULT', 'game.debug.Level', game.debug.Level);
      break;
  }
}

export function createPlatforms0(game: Game): void {
  game.PLATFORMS = game.physics.add.staticGroup();

  game.PLATFORMS.create(
    SCREEN_DIMENSIONS.WIDTH / 2,
    SCREEN_DIMENSIONS.HEIGHT / 2,
    'platformHorizontal'
  );
}
export function createPlatforms1(game: Game): void {
  game.PLATFORMS = game.physics.add.staticGroup();

  game.PLATFORMS.create(
    SCREEN_DIMENSIONS.WIDTH / 2,
    SCREEN_DIMENSIONS.HEIGHT / 3 + 320,
    'platformVertical'
  );
  game.PLATFORMS.create(
    SCREEN_DIMENSIONS.WIDTH / 2,
    SCREEN_DIMENSIONS.HEIGHT / 2,
    'platformHorizontal'
  );
}
export function createPlatforms2(game: Game): void {
  game.PLATFORMS = game.physics.add.staticGroup();

  game.PLATFORMS.create(
    SCREEN_DIMENSIONS.WIDTH / 2,
    SCREEN_DIMENSIONS.HEIGHT / 2,
    'platformHorizontal'
  );
  game.PLATFORMS.create(
    SCREEN_DIMENSIONS.WIDTH / 2 - 34 * 10,
    SCREEN_DIMENSIONS.HEIGHT / 2 - 34,
    'brick'
  );
  game.PLATFORMS.create(
    SCREEN_DIMENSIONS.WIDTH / 2 + 34 * 10,
    SCREEN_DIMENSIONS.HEIGHT / 2 - 34,
    'brick'
  );
}

export function createPlatforms3(game: Game): void {
  game.PLATFORMS = game.physics.add.staticGroup();
  game.PLATFORMS.create(
    1200 * game.SCREEN_SCALE.WIDTH,
    700 * game.SCREEN_SCALE.HEIGHT,
    'platformVertical'
  );
  game.PLATFORMS.create(
    1200 * game.SCREEN_SCALE.WIDTH,
    850 * game.SCREEN_SCALE.HEIGHT,
    'platformShort'
  );
  game.PLATFORMS.create(
    800 * game.SCREEN_SCALE.WIDTH,
    900 * game.SCREEN_SCALE.HEIGHT,
    'platformShort'
  );
  game.PLATFORMS.create(
    SCREEN_DIMENSIONS.WIDTH / 2,
    SCREEN_DIMENSIONS.HEIGHT / 2,
    'platformHorizontal'
  );
  game.PLATFORMS.create(
    300 * game.SCREEN_SCALE.WIDTH,
    (1080 / 1.5) * game.SCREEN_SCALE.HEIGHT,
    'platformHorizontal'
  );
  game.PLATFORMS.create(
    1700 * game.SCREEN_SCALE.WIDTH,
    (1080 / 1.5) * game.SCREEN_SCALE.HEIGHT,
    'platformHorizontal'
  );

  game.PLATFORMS.create(
    400 * game.SCREEN_SCALE.WIDTH,
    500 * game.SCREEN_SCALE.HEIGHT,
    'platformShort'
  );
  game.PLATFORMS.create(
    320 * game.SCREEN_SCALE.WIDTH,
    (500 - 33) * game.SCREEN_SCALE.HEIGHT,
    'brick'
  );
  game.PLATFORMS.create(
    480 * game.SCREEN_SCALE.WIDTH,
    (500 - 33) * game.SCREEN_SCALE.HEIGHT,
    'brick'
  );
}

export function createPlatforms4(game: Game): void {
  game.PLATFORMS = game.physics.add.staticGroup();

  for (let i = 0; i < 3; i++) {
    game.PLATFORMS.create(
      1207 * game.SCREEN_SCALE.WIDTH + i * game.ASSET_BRICK_WIDTH,
      710 * game.SCREEN_SCALE.HEIGHT,
      'platformVertical'
    );
  }

  for (let i = 0; i < 20; i++) {
    game.PLATFORMS.create(
      600,
      SCREEN_DIMENSIONS.HEIGHT / 2 + 300 + i * game.ASSET_BRICK_HEIGHT,
      'platformHorizontal'
    );
  }

  for (let i = 0; i < 2; i++) {
    game.PLATFORMS.create(
      SCREEN_DIMENSIONS.WIDTH / 2,
      SCREEN_DIMENSIONS.HEIGHT / 2 + i * game.ASSET_BRICK_HEIGHT,
      'platformHorizontal'
    );
  }

  for (let i = 0; i < 25; i++) {
    game.PLATFORMS.create(
      1700 * game.SCREEN_SCALE.WIDTH,
      (1080 / 1.5) * game.SCREEN_SCALE.HEIGHT + game.ASSET_BRICK_HEIGHT * i,
      'platformShort'
    );
  }

  for (let i = 0; i < 5; i++) {
    game.PLATFORMS.create(
      1617 * game.SCREEN_SCALE.WIDTH,
      (686 + i * game.ASSET_BRICK_HEIGHT) * game.SCREEN_SCALE.HEIGHT,
      'brick'
    );
  }
  for (let i = 0; i < 5; i++) {
    game.PLATFORMS.create(
      1783 * game.SCREEN_SCALE.WIDTH,
      (686 + i * game.ASSET_BRICK_HEIGHT) * game.SCREEN_SCALE.HEIGHT,
      'brick'
    );
  }
}
export function createPlatforms5(game: Game): void {
  game.PLATFORMS = game.physics.add.staticGroup();

  for (let i = 0; i < 2; i++) {
    game.PLATFORMS.create(
      SCREEN_DIMENSIONS.WIDTH / 2,
      SCREEN_DIMENSIONS.HEIGHT / 2 + i * game.ASSET_BRICK_HEIGHT,
      'platformHorizontal'
    );
  }

  for (let i = 0; i < 2; i++) {
    game.PLATFORMS.create(
      614 * game.SCREEN_SCALE.WIDTH + i * game.ASSET_BRICK_WIDTH,
      710 * game.SCREEN_SCALE.HEIGHT,
      'platformVertical'
    );
  }

  for (let i = 0; i < 2; i++) {
    game.PLATFORMS.create(
      (1207 + 34 * 5) * game.SCREEN_SCALE.WIDTH + i * game.ASSET_BRICK_WIDTH,
      (710 - 34) * game.SCREEN_SCALE.HEIGHT,
      'platformVertical'
    );
  }

  for (let i = 0; i < 6; i++) {
    game.PLATFORMS.create(
      (1518 + 0 * 33) * game.SCREEN_SCALE.WIDTH + i * game.ASSET_BRICK_WIDTH,
      (924 - 34 * 2) * game.SCREEN_SCALE.HEIGHT,
      'platformVertical'
    );
  }
}

export function createPlatforms6(game: Game): void {
  game.PLATFORMS = game.physics.add.staticGroup();

  for (let i = 0; i < 1; i++) {
    game.PLATFORMS.create(
      SCREEN_DIMENSIONS.WIDTH / 2,
      SCREEN_DIMENSIONS.HEIGHT / 2 + i * game.ASSET_BRICK_HEIGHT + 3 * 34,
      'platformHorizontal'
    );
  }
  for (let i = 0; i < 3; i++) {
    game.PLATFORMS.create(
      SCREEN_DIMENSIONS.WIDTH / 2 - 10 * 33,
      SCREEN_DIMENSIONS.HEIGHT / 2 +
        10 * 34 +
        i * game.ASSET_BRICK_HEIGHT +
        3 * 34,
      'platformHorizontal'
    );
  }

  for (let i = 0; i < 3; i++) {
    game.PLATFORMS.create(
      (614 - 8 * 33) * game.SCREEN_SCALE.WIDTH + i * game.ASSET_BRICK_WIDTH,
      (710 + 5 * 34) * game.SCREEN_SCALE.HEIGHT,
      'platformVertical'
    );
  }

  for (let i = 0; i < 1; i++) {
    game.PLATFORMS.create(
      (1207 + 33 * 5) * game.SCREEN_SCALE.WIDTH +
        i * game.ASSET_BRICK_WIDTH +
        13,
      (710 - 5 * 34) * game.SCREEN_SCALE.HEIGHT + 3 * 34,
      'platformVertical'
    );
  }

  for (let i = 0; i < 5; i++) {
    game.PLATFORMS.create(
      (1518 + 1 * 33) * game.SCREEN_SCALE.WIDTH +
        i * game.ASSET_BRICK_WIDTH +
        3 * 33,
      (924 - 34 * 2) * game.SCREEN_SCALE.HEIGHT,
      'platformVertical'
    );
  }

  for (let i = 0; i < 5; i++) {
    game.PLATFORMS.create(
      1617 * game.SCREEN_SCALE.WIDTH,
      (686 + i * game.ASSET_BRICK_HEIGHT) * game.SCREEN_SCALE.HEIGHT,
      'brick'
    );
  }
  for (let j = 0; j < 20; j++) {
    for (let i = 0; i < 9; i++) {
      game.PLATFORMS.create(
        1617 * game.SCREEN_SCALE.WIDTH - j * 33,
        (686 - 68 + i * game.ASSET_BRICK_HEIGHT) * game.SCREEN_SCALE.HEIGHT +
          j * 34 +
          4 * 34,
        'brick'
      );
    }
  }
  for (let j = 0; j < 2; j++) {
    for (let i = 0; i < 2; i++) {
      game.PLATFORMS.create(
        1617 * game.SCREEN_SCALE.WIDTH - j * 33 + 33 * 6,
        (686 - 68 + i * game.ASSET_BRICK_HEIGHT) * game.SCREEN_SCALE.HEIGHT +
          j * 34 +
          2 * 34,
        'brick'
      );
    }
  }

  for (let j = 0; j < 6; j++) {
    for (let i = 0; i < 2; i++) {
      game.PLATFORMS.create(
        1617 * game.SCREEN_SCALE.WIDTH - j * 33 - 33 * 8,
        (686 - 68 + i * game.ASSET_BRICK_HEIGHT) * game.SCREEN_SCALE.HEIGHT +
          j * 34 +
          5 * 34,
        'brick'
      );
    }
  }
}

export function createPlatforms7(game: Game): void {
  game.PLATFORMS = game.physics.add.staticGroup();

  for (let i = 0; i < 2; i++) {
    game.PLATFORMS.create(
      SCREEN_DIMENSIONS.WIDTH / 2,
      SCREEN_DIMENSIONS.HEIGHT / 2 - i * game.ASSET_BRICK_HEIGHT + 3 * 34,
      'platformHorizontal'
    );
  }
  for (let i = 0; i < 8; i++) {
    game.PLATFORMS.create(
      SCREEN_DIMENSIONS.WIDTH / 2 - 10 * 33,
      SCREEN_DIMENSIONS.HEIGHT / 2 +
        10 * 34 +
        i * game.ASSET_BRICK_HEIGHT +
        3 * 34,
      'platformHorizontal'
    );
  }

  for (let i = 0; i < 10; i++) {
    game.PLATFORMS.create(
      (614 - 13 * 33) * game.SCREEN_SCALE.WIDTH + i * game.ASSET_BRICK_WIDTH,
      (710 + 8 * 34) * game.SCREEN_SCALE.HEIGHT + i * game.ASSET_BRICK_HEIGHT,
      'platformVertical'
    );
  }

  for (let j = 0; j < 3; j++) {
    for (let i = 0; i < 4; i++) {
      game.PLATFORMS.create(
        (614 - 7 * 33) * game.SCREEN_SCALE.WIDTH + i * game.ASSET_BRICK_WIDTH,
        (710 + 0 * 34) * game.SCREEN_SCALE.HEIGHT + j * game.ASSET_BRICK_HEIGHT,
        'brick'
      );
    }
  }

  for (let i = 0; i < 1; i++) {
    game.PLATFORMS.create(
      (1207 + 33 * 5) * game.SCREEN_SCALE.WIDTH +
        i * game.ASSET_BRICK_WIDTH +
        13,
      (710 - 5 * 34) * game.SCREEN_SCALE.HEIGHT + 3 * 34,
      'platformVertical'
    );
  }

  for (let i = 0; i < 5; i++) {
    game.PLATFORMS.create(
      (1518 + 1 * 33) * game.SCREEN_SCALE.WIDTH +
        i * game.ASSET_BRICK_WIDTH +
        3 * 33,
      (924 - 34 * 2) * game.SCREEN_SCALE.HEIGHT,
      'platformVertical'
    );
  }
  for (let j = 0; j < 20; j++) {
    for (let i = 0; i < 9; i++) {
      game.PLATFORMS.create(
        1617 * game.SCREEN_SCALE.WIDTH - j * 33,
        (686 - 68 + i * game.ASSET_BRICK_HEIGHT) * game.SCREEN_SCALE.HEIGHT +
          j * 34 +
          4 * 34,
        'brick'
      );
    }
  }
  for (let j = 0; j < 2; j++) {
    for (let i = 0; i < 2; i++) {
      game.PLATFORMS.create(
        1617 * game.SCREEN_SCALE.WIDTH - j * 33 + 33 * 6,
        (686 - 68 + i * game.ASSET_BRICK_HEIGHT) * game.SCREEN_SCALE.HEIGHT +
          j * 34 +
          2 * 34,
        'brick'
      );
    }
  }

  for (let j = 0; j < 5; j++) {
    for (let i = 0; i < 2; i++) {
      game.PLATFORMS.create(
        1617 * game.SCREEN_SCALE.WIDTH - j * 33 - 33 * 8,
        (686 - 68 + i * game.ASSET_BRICK_HEIGHT) * game.SCREEN_SCALE.HEIGHT +
          j * 34 +
          5 * 34,
        'brick'
      );
    }
  }

  for (let i = 0; i < 6; i++) {
    game.PLATFORMS.create(
      SCREEN_DIMENSIONS.WIDTH * 0.766,
      SCREEN_DIMENSIONS.HEIGHT * 1.0122 + i * game.ASSET_BRICK_HEIGHT,
      'platformHorizontal'
    );
  }
}

export function createPlatforms8(game: Game): void {
  game.PLATFORMS = game.physics.add.staticGroup();

  for (let i = 0; i < 2; i++) {
    game.PLATFORMS.create(
      SCREEN_DIMENSIONS.WIDTH / 2,
      SCREEN_DIMENSIONS.HEIGHT / 2 - i * game.ASSET_BRICK_HEIGHT + 3 * 34,
      'platformHorizontal'
    );
  }
  for (let i = 0; i < 12; i++) {
    if (i < 4) {
      game.PLATFORMS.create(
        SCREEN_DIMENSIONS.WIDTH / 2 - 13 * 33 + i * game.ASSET_BRICK_WIDTH,
        SCREEN_DIMENSIONS.HEIGHT / 2 +
          10 * 34 +
          i * game.ASSET_BRICK_HEIGHT +
          3 * 34,
        'platformHorizontal'
      );
    } else {
      game.PLATFORMS.create(
        SCREEN_DIMENSIONS.WIDTH / 2 - 10 * 33,
        SCREEN_DIMENSIONS.HEIGHT / 2 +
          10 * 34 +
          i * game.ASSET_BRICK_HEIGHT +
          3 * 34,
        'platformHorizontal'
      );
    }
  }

  for (let i = 0; i < 10; i++) {
    game.PLATFORMS.create(
      (614 - 13 * 33) * game.SCREEN_SCALE.WIDTH + i * game.ASSET_BRICK_WIDTH,
      (710 + 8 * 34) * game.SCREEN_SCALE.HEIGHT + i * game.ASSET_BRICK_HEIGHT,
      'platformVertical'
    );
  }

  for (let j = 0; j < 3; j++) {
    for (let i = 0; i < 4; i++) {
      game.PLATFORMS.create(
        (614 - 7 * 33) * game.SCREEN_SCALE.WIDTH + i * game.ASSET_BRICK_WIDTH,
        (710 + 0 * 34) * game.SCREEN_SCALE.HEIGHT + j * game.ASSET_BRICK_HEIGHT,
        'brick'
      );
    }
  }

  for (let i = 0; i < 1; i++) {
    game.PLATFORMS.create(
      (1207 + 33 * 5) * game.SCREEN_SCALE.WIDTH +
        i * game.ASSET_BRICK_WIDTH +
        13,
      (710 - 5 * 34) * game.SCREEN_SCALE.HEIGHT + 3 * 34,
      'platformVertical'
    );
  }

  for (let i = 0; i < 5; i++) {
    game.PLATFORMS.create(
      (1518 + 1 * 33) * game.SCREEN_SCALE.WIDTH +
        i * game.ASSET_BRICK_WIDTH +
        3 * 33,
      (924 - 34 * 2) * game.SCREEN_SCALE.HEIGHT,
      'platformVertical'
    );
  }

  for (let j = 0; j < 20; j++) {
    for (let i = 0; i < 9; i++) {
      game.PLATFORMS.create(
        1617 * game.SCREEN_SCALE.WIDTH - j * 33,
        (686 - 68 + i * game.ASSET_BRICK_HEIGHT) * game.SCREEN_SCALE.HEIGHT +
          j * 34 +
          4 * 34,
        'brick'
      );
    }
  }
  for (let j = 0; j < 2; j++) {
    for (let i = 0; i < 2; i++) {
      game.PLATFORMS.create(
        1617 * game.SCREEN_SCALE.WIDTH - j * 33 + 33 * 6,
        (686 - 68 + i * game.ASSET_BRICK_HEIGHT) * game.SCREEN_SCALE.HEIGHT +
          j * 34 +
          2 * 34,
        'brick'
      );
    }
  }

  for (let j = 0; j < 5; j++) {
    for (let i = 0; i < 2; i++) {
      game.PLATFORMS.create(
        1617 * game.SCREEN_SCALE.WIDTH - j * 33 - 33 * 8,
        (686 - 68 + i * game.ASSET_BRICK_HEIGHT) * game.SCREEN_SCALE.HEIGHT +
          j * 34 +
          5 * 34,
        'brick'
      );
    }
  }

  for (let i = 0; i < 6; i++) {
    game.PLATFORMS.create(
      SCREEN_DIMENSIONS.WIDTH * 0.766,
      SCREEN_DIMENSIONS.HEIGHT * 1.0122 + i * game.ASSET_BRICK_HEIGHT,
      'platformHorizontal'
    );
  }
}

export function createPlatforms9(game: Game): void {
  game.PLATFORMS = game.physics.add.staticGroup();

  for (let i = 0; i < 2; i++) {
    game.PLATFORMS.create(
      SCREEN_DIMENSIONS.WIDTH / 2,
      SCREEN_DIMENSIONS.HEIGHT / 2 - i * game.ASSET_BRICK_HEIGHT + 3 * 34,
      'platformHorizontal'
    );
  }
  for (let i = 0; i < 12; i++) {
    if (i < 4) {
      game.PLATFORMS.create(
        SCREEN_DIMENSIONS.WIDTH / 2 - 13 * 33 + i * game.ASSET_BRICK_WIDTH,
        SCREEN_DIMENSIONS.HEIGHT / 2 +
          10 * 34 +
          i * game.ASSET_BRICK_HEIGHT +
          3 * 34,
        'platformHorizontal'
      );
    } else {
      game.PLATFORMS.create(
        SCREEN_DIMENSIONS.WIDTH / 2 - 10 * 33,
        SCREEN_DIMENSIONS.HEIGHT / 2 +
          10 * 34 +
          i * game.ASSET_BRICK_HEIGHT +
          3 * 34,
        'platformHorizontal'
      );
    }
  }

  for (let i = 0; i < 10; i++) {
    game.PLATFORMS.create(
      (614 - 13 * 33) * game.SCREEN_SCALE.WIDTH + i * game.ASSET_BRICK_WIDTH,
      (710 + 8 * 34) * game.SCREEN_SCALE.HEIGHT + i * game.ASSET_BRICK_HEIGHT,
      'platformVertical'
    );
  }

  for (let j = 0; j < 3; j++) {
    for (let i = 0; i < 4; i++) {
      game.PLATFORMS.create(
        (614 - 7 * 33) * game.SCREEN_SCALE.WIDTH + i * game.ASSET_BRICK_WIDTH,
        (710 + 0 * 34) * game.SCREEN_SCALE.HEIGHT + j * game.ASSET_BRICK_HEIGHT,
        'brick'
      );
    }
  }

  for (let i = 0; i < 1; i++) {
    game.PLATFORMS.create(
      (1207 + 33 * 5) * game.SCREEN_SCALE.WIDTH +
        i * game.ASSET_BRICK_WIDTH +
        13,
      (718.2 - 5 * 34) * game.SCREEN_SCALE.HEIGHT + 3 * 34,
      'platformVertical'
    );
  }
  for (let i = 0; i < 2; i++) {
    game.PLATFORMS.create(
      (1207 + 33 * 5) * game.SCREEN_SCALE.WIDTH +
        i * game.ASSET_BRICK_WIDTH +
        13,
      (718.2 - 5 * 34) * game.SCREEN_SCALE.HEIGHT +
        3 * 34 -
        game.ASSET_BRICK_HEIGHT,
      'platformVertical'
    );
  }

  for (let i = 0; i < 5; i++) {
    game.PLATFORMS.create(
      (1518 + 1 * 33) * game.SCREEN_SCALE.WIDTH +
        i * game.ASSET_BRICK_WIDTH +
        3 * 33,
      (924 - 34 * 2) * game.SCREEN_SCALE.HEIGHT,
      'platformVertical'
    );
  }

  for (let j = 0; j < 20; j++) {
    for (let i = 0; i < 9; i++) {
      game.PLATFORMS.create(
        1617 * game.SCREEN_SCALE.WIDTH - j * 33,
        (686 - 68 + i * game.ASSET_BRICK_HEIGHT) * game.SCREEN_SCALE.HEIGHT +
          j * 34 +
          4 * 34,
        'brick'
      );
    }
  }
  for (let j = 0; j < 2; j++) {
    for (let i = 0; i < 2; i++) {
      game.PLATFORMS.create(
        1617 * game.SCREEN_SCALE.WIDTH - j * 33 + 33 * 6,
        (686 - 68 + i * game.ASSET_BRICK_HEIGHT) * game.SCREEN_SCALE.HEIGHT +
          j * 34 +
          2 * 34,
        'brick'
      );
    }
  }

  for (let j = 0; j < 5; j++) {
    for (let i = 0; i < 2; i++) {
      game.PLATFORMS.create(
        1617 * game.SCREEN_SCALE.WIDTH - j * 33 - 33 * 8,
        (686 - 68 + i * game.ASSET_BRICK_HEIGHT) * game.SCREEN_SCALE.HEIGHT +
          j * 34 +
          5 * 34,
        'brick'
      );
    }
  }

  for (let i = 0; i < 6; i++) {
    game.PLATFORMS.create(
      SCREEN_DIMENSIONS.WIDTH * 0.766,
      SCREEN_DIMENSIONS.HEIGHT * 1.0122 + i * game.ASSET_BRICK_HEIGHT,
      'platformHorizontal'
    );
  }
}

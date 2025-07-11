import { print } from '../../views/client';
import SmashedGame, { SCREEN_DIMENSIONS } from '../SmashedGame';

export function createPlatforms(game: SmashedGame): void {
  print(
    'createPlatforms',
    game.debug.Stage,
    'game.debug.Level',
    game.debug.Stage
  );
  switch (game.debug.Stage) {
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
    case 10:
      createPlatforms10(game);
      break;
    case 11:
      createPlatforms11(game);
      break;
    case 12:
      createPlatforms12(game);
      break;
    default:
      throw new Error(`Invalid Stage: ${game.debug.Stage}`);
  }
}

export function createPlatforms0(game: SmashedGame): void {
  game.PLATFORMS = game.physics.add.staticGroup();

  game.PLATFORMS.create(
    SCREEN_DIMENSIONS.WIDTH / 2,
    SCREEN_DIMENSIONS.HEIGHT / 2,
    'platformHorizontal'
  );
}
export function createPlatforms1(game: SmashedGame): void {
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
export function createPlatforms2(game: SmashedGame): void {
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

export function createPlatforms3(game: SmashedGame): void {
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

export function createPlatforms4(game: SmashedGame): void {
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
export function createPlatforms5(game: SmashedGame): void {
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

export function createPlatforms6(game: SmashedGame): void {
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

export function createPlatforms7(game: SmashedGame): void {
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

export function createPlatforms8(game: SmashedGame): void {
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

export function createPlatforms9(game: SmashedGame): void {
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

export function createPlatforms10(game: SmashedGame): void {
  game.PLATFORMS = game.physics.add.staticGroup();

  for (let i = 0; i < 2; i++) {
    game.PLATFORMS.create(
      SCREEN_DIMENSIONS.WIDTH / 2,
      SCREEN_DIMENSIONS.HEIGHT / 2 -
        (i + 1) * game.ASSET_BRICK_HEIGHT +
        3 * game.ASSET_BRICK_HEIGHT,
      'platformHorizontal'
    );
  }

  const numFromCenter: number = 9.5;

  game.PLATFORMS.create(
    SCREEN_DIMENSIONS.WIDTH / 2 - numFromCenter * game.ASSET_BRICK_WIDTH,
    SCREEN_DIMENSIONS.HEIGHT / 2,
    'brick'
  );
  game.PLATFORMS.create(
    SCREEN_DIMENSIONS.WIDTH / 2 + numFromCenter * game.ASSET_BRICK_WIDTH,
    SCREEN_DIMENSIONS.HEIGHT / 2,
    'brick'
  );

  for (let i = 0; i < 12; i++) {
    if (i < 4) {
      game.PLATFORMS.create(
        SCREEN_DIMENSIONS.WIDTH / 2 -
          13 * game.ASSET_BRICK_WIDTH +
          i * game.ASSET_BRICK_WIDTH,
        SCREEN_DIMENSIONS.HEIGHT / 2 +
          10 * game.ASSET_BRICK_HEIGHT +
          i * game.ASSET_BRICK_HEIGHT +
          3 * game.ASSET_BRICK_HEIGHT,
        'platformHorizontal'
      );
    } else {
      game.PLATFORMS.create(
        SCREEN_DIMENSIONS.WIDTH / 2 - 10 * game.ASSET_BRICK_WIDTH,
        SCREEN_DIMENSIONS.HEIGHT / 2 +
          10 * game.ASSET_BRICK_HEIGHT +
          i * game.ASSET_BRICK_HEIGHT +
          3 * game.ASSET_BRICK_HEIGHT,
        'platformHorizontal'
      );
    }
  }

  for (let i = -5; i < 10; i++) {
    if (i < -2) {
      game.PLATFORMS.create(
        (614 - 13 * game.ASSET_BRICK_WIDTH) * game.SCREEN_SCALE.WIDTH +
          i * game.ASSET_BRICK_WIDTH,
        (710 + 8 * game.ASSET_BRICK_HEIGHT) * game.SCREEN_SCALE.HEIGHT +
          -3 * game.ASSET_BRICK_HEIGHT,
        'platformVertical'
      );
    } else {
      game.PLATFORMS.create(
        (614 - 13 * game.ASSET_BRICK_WIDTH) * game.SCREEN_SCALE.WIDTH +
          i * game.ASSET_BRICK_WIDTH,
        (710 + 8 * game.ASSET_BRICK_HEIGHT) * game.SCREEN_SCALE.HEIGHT +
          i * game.ASSET_BRICK_HEIGHT,
        'platformVertical'
      );
    }
  }

  for (let j = 0; j < 3; j++) {
    for (let i = 0; i < 4; i++) {
      game.PLATFORMS.create(
        (614 - 7 * game.ASSET_BRICK_WIDTH) * game.SCREEN_SCALE.WIDTH +
          i * game.ASSET_BRICK_WIDTH,
        (710 + 0 * game.ASSET_BRICK_HEIGHT) * game.SCREEN_SCALE.HEIGHT +
          j * game.ASSET_BRICK_HEIGHT,
        'brick'
      );
    }
  }

  for (let i = 0; i < 2; i++) {
    game.PLATFORMS.create(
      (1207 + game.ASSET_BRICK_WIDTH * 5) * game.SCREEN_SCALE.WIDTH +
        i * game.ASSET_BRICK_WIDTH +
        13,
      (718.2 - 5 * game.ASSET_BRICK_HEIGHT) * game.SCREEN_SCALE.HEIGHT +
        game.ASSET_BRICK_HEIGHT,
      'platformVertical'
    );
  }

  for (let i = 0; i < 5; i++) {
    game.PLATFORMS.create(
      (1518 + 1 * game.ASSET_BRICK_WIDTH) * game.SCREEN_SCALE.WIDTH +
        i * game.ASSET_BRICK_WIDTH +
        3 * game.ASSET_BRICK_WIDTH,
      (924 - game.ASSET_BRICK_HEIGHT * 2) * game.SCREEN_SCALE.HEIGHT,
      'platformVertical'
    );
  }

  for (let j = 0; j < 20; j++) {
    for (let i = 0; i < 9; i++) {
      game.PLATFORMS.create(
        1617 * game.SCREEN_SCALE.WIDTH - j * game.ASSET_BRICK_WIDTH,
        (686 - 68 + i * game.ASSET_BRICK_HEIGHT) * game.SCREEN_SCALE.HEIGHT +
          j * game.ASSET_BRICK_HEIGHT +
          4 * game.ASSET_BRICK_HEIGHT,
        'brick'
      );
    }
  }
  for (let j = 0; j < 2; j++) {
    for (let i = 0; i < 2; i++) {
      game.PLATFORMS.create(
        1617 * game.SCREEN_SCALE.WIDTH -
          j * game.ASSET_BRICK_WIDTH +
          game.ASSET_BRICK_WIDTH * 6,
        (686 - 68 + i * game.ASSET_BRICK_HEIGHT) * game.SCREEN_SCALE.HEIGHT +
          j * game.ASSET_BRICK_HEIGHT +
          2 * game.ASSET_BRICK_HEIGHT,
        'brick'
      );
    }
  }

  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 2; j++) {
      if (i === 0 && j === 0) {
        continue;
      }

      if (i === 5 && j === 1) {
        continue;
      }

      game.PLATFORMS.create(
        1616 * game.SCREEN_SCALE.WIDTH -
          i * game.ASSET_BRICK_WIDTH -
          game.ASSET_BRICK_WIDTH * 7,
        (685 - 68 + j * game.ASSET_BRICK_HEIGHT) * game.SCREEN_SCALE.HEIGHT +
          i * game.ASSET_BRICK_HEIGHT +
          3 * game.ASSET_BRICK_HEIGHT,
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

export function createPlatforms11(game: SmashedGame): void {
  game.PLATFORMS = game.physics.add.staticGroup();

  for (let i = 0; i < 2; i++) {
    game.PLATFORMS.create(
      SCREEN_DIMENSIONS.WIDTH / 2,
      SCREEN_DIMENSIONS.HEIGHT / 2 -
        (i + 1) * game.ASSET_BRICK_HEIGHT +
        3 * game.ASSET_BRICK_HEIGHT,
      'platformHorizontal'
    );
  }

  const numFromCenter: number = 9.5;

  game.PLATFORMS.create(
    SCREEN_DIMENSIONS.WIDTH / 2 - numFromCenter * game.ASSET_BRICK_WIDTH,
    SCREEN_DIMENSIONS.HEIGHT / 2,
    'brick'
  );
  game.PLATFORMS.create(
    SCREEN_DIMENSIONS.WIDTH / 2 + numFromCenter * game.ASSET_BRICK_WIDTH,
    SCREEN_DIMENSIONS.HEIGHT / 2,
    'brick'
  );

  for (let i = 0; i < 12; i++) {
    game.PLATFORMS.create(
      SCREEN_DIMENSIONS.WIDTH / 2 - 10 * game.ASSET_BRICK_WIDTH,
      SCREEN_DIMENSIONS.HEIGHT / 2 +
        10 * game.ASSET_BRICK_HEIGHT +
        i * game.ASSET_BRICK_HEIGHT +
        3 * game.ASSET_BRICK_HEIGHT,
      'platformHorizontal'
    );
  }

  // for (let j = 0; j < 3; j++) {
  //   for (let i = 0; i < 4; i++) {
  //     game.PLATFORMS.create(
  //       (614 - 7 * game.ASSET_BRICK_WIDTH) * game.SCREEN_SCALE.WIDTH +
  //         i * game.ASSET_BRICK_WIDTH,
  //       (710 + 0 * game.ASSET_BRICK_HEIGHT) * game.SCREEN_SCALE.HEIGHT +
  //         j * game.ASSET_BRICK_HEIGHT,
  //       'brick'
  //     );
  //   }
  // }

  for (let i = 0; i < 2; i++) {
    game.PLATFORMS.create(
      (1207 + game.ASSET_BRICK_WIDTH * 5) * game.SCREEN_SCALE.WIDTH +
        i * game.ASSET_BRICK_WIDTH +
        13,
      (718.2 - 5 * game.ASSET_BRICK_HEIGHT) * game.SCREEN_SCALE.HEIGHT +
        game.ASSET_BRICK_HEIGHT,
      'platformVertical'
    );
  }

  for (let i = 0; i < 5; i++) {
    game.PLATFORMS.create(
      (1518 + 1 * game.ASSET_BRICK_WIDTH) * game.SCREEN_SCALE.WIDTH +
        i * game.ASSET_BRICK_WIDTH +
        3 * game.ASSET_BRICK_WIDTH,
      (924 - game.ASSET_BRICK_HEIGHT * 2) * game.SCREEN_SCALE.HEIGHT,
      'platformVertical'
    );
  }

  for (let j = 0; j < 20; j++) {
    for (let i = 0; i < 9; i++) {
      game.PLATFORMS.create(
        1617 * game.SCREEN_SCALE.WIDTH - j * game.ASSET_BRICK_WIDTH,
        (686 - 68 + i * game.ASSET_BRICK_HEIGHT) * game.SCREEN_SCALE.HEIGHT +
          j * game.ASSET_BRICK_HEIGHT +
          4 * game.ASSET_BRICK_HEIGHT,
        'brick'
      );
    }
  }
  for (let j = 0; j < 2; j++) {
    for (let i = 0; i < 2; i++) {
      game.PLATFORMS.create(
        1617 * game.SCREEN_SCALE.WIDTH -
          j * game.ASSET_BRICK_WIDTH +
          game.ASSET_BRICK_WIDTH * 6,
        (686 - 68 + i * game.ASSET_BRICK_HEIGHT) * game.SCREEN_SCALE.HEIGHT +
          j * game.ASSET_BRICK_HEIGHT +
          2 * game.ASSET_BRICK_HEIGHT,
        'brick'
      );
    }
  }

  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 2; j++) {
      if (i === 0 && j === 0) {
        continue;
      }

      if (i === 5 && j === 1) {
        continue;
      }

      game.PLATFORMS.create(
        1616 * game.SCREEN_SCALE.WIDTH -
          i * game.ASSET_BRICK_WIDTH -
          game.ASSET_BRICK_WIDTH * 7,
        (685 - 68 + j * game.ASSET_BRICK_HEIGHT) * game.SCREEN_SCALE.HEIGHT +
          i * game.ASSET_BRICK_HEIGHT +
          3 * game.ASSET_BRICK_HEIGHT,
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

export function createPlatforms12(game: SmashedGame): void {
  game.PLATFORMS = game.physics.add.staticGroup();

  for (let i = 0; i < 2; i++) {
    game.PLATFORMS.create(
      SCREEN_DIMENSIONS.WIDTH / 2,
      SCREEN_DIMENSIONS.HEIGHT / 2 -
        (i + 1) * game.ASSET_BRICK_HEIGHT +
        3 * game.ASSET_BRICK_HEIGHT,
      'platformHorizontal'
    );
  }

  const numFromCenter: number = 9.5;

  game.PLATFORMS.create(
    SCREEN_DIMENSIONS.WIDTH / 2 - numFromCenter * game.ASSET_BRICK_WIDTH,
    SCREEN_DIMENSIONS.HEIGHT / 2,
    'brick'
  );
  game.PLATFORMS.create(
    SCREEN_DIMENSIONS.WIDTH / 2 + numFromCenter * game.ASSET_BRICK_WIDTH,
    SCREEN_DIMENSIONS.HEIGHT / 2,
    'brick'
  );

  for (let i = 0; i < 12; i++) {
    game.PLATFORMS.create(
      SCREEN_DIMENSIONS.WIDTH / 2 - 10 * game.ASSET_BRICK_WIDTH,
      SCREEN_DIMENSIONS.HEIGHT / 2 +
        10 * game.ASSET_BRICK_HEIGHT +
        i * game.ASSET_BRICK_HEIGHT +
        3 * game.ASSET_BRICK_HEIGHT,
      'platformHorizontal'
    );
  }

  for (let i = 0; i < 2; i++) {
    game.PLATFORMS.create(
      (1207 + game.ASSET_BRICK_WIDTH * 5) * game.SCREEN_SCALE.WIDTH +
        i * game.ASSET_BRICK_WIDTH +
        13,
      (718.2 - 5 * game.ASSET_BRICK_HEIGHT) * game.SCREEN_SCALE.HEIGHT +
        game.ASSET_BRICK_HEIGHT,
      'platformVertical'
    );
  }

  for (let i = 0; i < 5; i++) {
    game.PLATFORMS.create(
      (1518 + 1 * game.ASSET_BRICK_WIDTH) * game.SCREEN_SCALE.WIDTH +
        i * game.ASSET_BRICK_WIDTH +
        3 * game.ASSET_BRICK_WIDTH,
      (924 - game.ASSET_BRICK_HEIGHT * 2) * game.SCREEN_SCALE.HEIGHT,
      'platformVertical'
    );
  }

  for (let j = 0; j < 20; j++) {
    for (let i = 0; i < 9; i++) {
      game.PLATFORMS.create(
        1617 * game.SCREEN_SCALE.WIDTH - j * game.ASSET_BRICK_WIDTH,
        (686 - 68 + i * game.ASSET_BRICK_HEIGHT) * game.SCREEN_SCALE.HEIGHT +
          j * game.ASSET_BRICK_HEIGHT +
          4 * game.ASSET_BRICK_HEIGHT,
        'brick'
      );
    }
  }
  for (let j = 0; j < 2; j++) {
    for (let i = 0; i < 2; i++) {
      game.PLATFORMS.create(
        1617 * game.SCREEN_SCALE.WIDTH -
          j * game.ASSET_BRICK_WIDTH +
          game.ASSET_BRICK_WIDTH * 6,
        (686 - 68 + i * game.ASSET_BRICK_HEIGHT) * game.SCREEN_SCALE.HEIGHT +
          j * game.ASSET_BRICK_HEIGHT +
          2 * game.ASSET_BRICK_HEIGHT,
        'brick'
      );
    }
  }

  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 2; j++) {
      if (i === 0 && j === 0) {
        continue;
      }

      if (i === 5 && j === 1) {
        continue;
      }

      game.PLATFORMS.create(
        1616 * game.SCREEN_SCALE.WIDTH -
          i * game.ASSET_BRICK_WIDTH -
          game.ASSET_BRICK_WIDTH * 7,
        (684 - 68 + j * game.ASSET_BRICK_HEIGHT) * game.SCREEN_SCALE.HEIGHT +
          i * game.ASSET_BRICK_HEIGHT +
          3 * game.ASSET_BRICK_HEIGHT,
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

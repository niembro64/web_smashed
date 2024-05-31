import ShakePosition from 'phaser3-rex-plugins/plugins/behaviors/shake/ShakePosition';
import { print } from '../views/client';
import SmashedGame, { SCREEN_DIMENSIONS } from './SmashedGame';
import { setAttackPhysicalOffscreen } from './helpers/attacks';
import { BulletsFireFlower, BulletsPlayer } from './helpers/bullets';
import {
  onHitHandlerAttackEnergy,
  onHitHandlerAttackPhysical,
  onHitHandlerBulletBill,
  onHitHandlerBullets,
  onHitHandlerFireBall,
} from './helpers/damage';
import { getInactiveBackgroundTintColor } from './helpers/fireFlower';
import { createPlatforms } from './helpers/platforms';
import {
  getDoesAnythingHaveDark,
  getHasBeenGameDurationSinceMoment,
  setChompPowerState,
  setPlayerPowerState,
  updateChompFilterStatePlayer,
} from './helpers/powers';
import { filterAttackEnergyNormal, setBlinkTrue } from './helpers/sprites';
import {
  BulletBillBullet,
  BulletBillButton,
  BulletBillCombo,
  BulletBillSparkLine,
  FireFlower,
  Player,
  Position,
} from './interfaces';
import { setPreUpdate } from './update';

export function create(game: SmashedGame) {
  createPreCreate(game);
  createDataMatrices(game);
  createSoundsGame(game);
  createBackground(game);
  createSplashBlack(game);
  createBackgroundOutlineBack(game);
  createExplosionBulletBillCannon(game);
  createBulletBill(game);
  createBackgroundOutlineFront(game);
  createLavas(game);
  createSplashes(game);
  createSplashRuleFinished(game); // MAYBE
  createPSwitch(game);
  createFireFlower(game);
  createBulletBillSparkLine(game);
  createExplosionsBack(game);
  createFirework(game);
  createPole(game);
  createFlag(game);
  createEmitterChomp(game);
  createEmittersPlayers(game);
  createPlatforms(game);
  createTable(game);
  createColliderTablePlatforms(game);
  createAttackPhysicals(game);
  createColliderTableAttackPhysicals(game);
  createAttackEnergies(game);
  createColliderTableAttackEnergies(game);
  createScoreboardShotGlass(game);
  createScoreboardShotGlassNumber(game);
  createScoreboardController(game);
  createScoreboardReady(game);
  createChomp(game);
  createEmitterChompFollowChomp(game);
  createPlayers(game);
  createExplosionsFront(game);
  createEmittersFollowPlayers(game);
  createColliderTablePlayers(game);
  createKeyboards(game);
  createPlayerIdCircles(game);
  createScoreboard(game);
  createCameras(game);
  createCollidersPvP(game);
  createCollidersPvAP(game);
  createCollidersPvAE(game);
  createCollidersAEvAE(game);
  createCollidersAEvAP(game);
  createCollidersFireFlower(game);
  createCollidersBulletBill(game);
  createHitboxOverlap(game);
  createEndDataMatrices(game);
  createShake(game);
  // createBulletBillSparkLine(game);
  createBulletBillSparkLineEmitter(game);

  // INIT UPDATE
  setPreUpdate(game);
}

function createBulletBillSparkLine(game: SmashedGame) {
  const tower = game.bulletBillCombo.tower;
  // add image to tower sprite
  tower.sprite = game.physics.add.sprite(
    tower.posInit.x,
    tower.posInit.y,
    'bullet_bill_tower'
  );

  // tower.sprite.setBounce(0);
  tower.sprite.setScale(tower.scale);
  tower.sprite.setBounce(0);
  tower.sprite.setImmovable(true);
  tower.sprite.setOrigin(0.5, 0.5);
  tower.sprite.body.allowGravity = false;

  const bbCombo: BulletBillCombo = game.bulletBillCombo;
  const bbSparkLine: BulletBillSparkLine = bbCombo.sparkLine;

  bbSparkLine.graphics = game.add.graphics();

  // Draw the path
  bbSparkLine.graphics.lineStyle(10, 0x000000, 1);
  bbSparkLine.graphics.beginPath();
  bbSparkLine.graphics.moveTo(
    bbSparkLine.pathPoints[0].x,
    bbSparkLine.pathPoints[0].y
  );
  bbSparkLine.pathPoints.slice(1).forEach((point: Position) => {
    if (!bbSparkLine.graphics) {
      return;
    }
    bbSparkLine.graphics.lineTo(point.x, point.y);
  });
  bbSparkLine.graphics.strokePath();

  // Create a dot to animate along the path
  bbSparkLine.spark = game.add.circle(
    bbSparkLine.pathPoints[0].x,
    bbSparkLine.pathPoints[0].y,
    0,
    0xffffff
  );

  // game.bulletBillCombo.sparkLine.emitter.startFollow(bbSparkLine.spark);
}

function createPSwitch(game: SmashedGame): void {
  const button: BulletBillButton = game.bulletBillCombo.button;

  button.spriteUp = game.physics.add.sprite(
    button.posInit.x,
    button.posInit.y,
    'button_up'
  );
  button.spriteUp.setBounce(0);
  button.spriteUp.setScale(button.scale);
  button.spriteUp.setImmovable(true);
  button.spriteUp.setOrigin(0.5, 1);
  button.spriteUp.body.allowGravity = false;
  button.spriteUp.setAlpha(1);

  button.spriteDown = game.physics.add.sprite(
    button.posInit.x,
    button.posInit.y,
    'button_down'
  );

  button.spriteDown.setBounce(0);
  button.spriteDown.setScale(button.scale);
  button.spriteDown.setImmovable(true);
  button.spriteDown.body.allowGravity = false;
  button.spriteDown.setOrigin(0.5, 1);
  button.spriteDown.setAlpha(0);

  button.sound = game.sound.add('pmusic', {
    volume: 0.4,
    loop: true,
  });
}

function createBulletBillSparkLineEmitter(game: SmashedGame) {
  const bbSparkLine: BulletBillSparkLine = game.bulletBillCombo.sparkLine;
  bbSparkLine.particles = game.add.particles('tail_' + 0);

  bbSparkLine.emitter = bbSparkLine.particles.createEmitter({
    // speed: 80,
    speed: { min: 0, max: 11 },
    // scale: { start: 0.05, end: 0 },
    scale: { start: 0.22, end: 0 },
    // alpha: { start: 1, end: 1 },
    // color: { start: '0xffffff', end: '0xffff00' },
    // blendMode: 'SUBTRACT',
    blendMode: 'ADD',
    // NORMAL
    // ADD
    // MULTIPLY
    // SCREEN
    // OVERLAY
    // DARKEN
    // LIGHTEN
    // COLOR_DODGE
    // COLOR_BURN
    // HARD_LIGHT
    // SOFT_LIGHT
    // DIFFERENCE
    // EXCLUSION
    // HUE
    // SATURATION
    // COLOR
    // LUMINOSITY

    // bounce: 1,
    // length: 100,
    gravityY: -250,

    follow: bbSparkLine.spark,
  });

  // make it red
  bbSparkLine.emitter.setTint(0xff3333);
  // bbSparkLine.emitter.setTint(0xffffff);
  bbSparkLine.emitter.on = false;
}

function createFlag(game: SmashedGame): void {
  const f = game.flag;

  const flagAtTopOfPole = 0.382;
  const horizOffset = 57 - game.ASSET_BRICK_WIDTH * 4;

  f.spriteFlagMover = game.physics.add.sprite(
    (1920 - 100 - game.ASSET_BRICK_WIDTH * 3) * game.SCREEN_SCALE.WIDTH +
      horizOffset,
    f.yPositionInit,
    'flag'
  );
  f.spriteFlagMover.setBounce(0);
  f.spriteFlagMover.setScale(0.65);
  f.spriteFlagMover.setImmovable(true);
  f.spriteFlagMover.body.allowGravity = false;

  f.spriteFlagStationary = game.physics.add.sprite(
    (1920 - 100 - game.ASSET_BRICK_WIDTH * 3) * game.SCREEN_SCALE.WIDTH +
      horizOffset,
    f.box.top,
    'blank'
  );
  f.spriteFlagStationary.setBounce(0);
  f.spriteFlagStationary.setScale(0.65);
  f.spriteFlagStationary.setImmovable(true);
  f.spriteFlagStationary.body.allowGravity = false;
  f.spriteFlagStationary.setAlpha(0);

  if (game.smashConfig) {
    if (
      game.playerOptions[game.smashConfig.players[0].characterId].char
        .srcSpriteSheet !== ''
    ) {
      f.spriteFlagChar = game.physics.add.sprite(
        (1920 - 100 - game.ASSET_BRICK_WIDTH * 3) * game.SCREEN_SCALE.WIDTH +
          horizOffset,
        SCREEN_DIMENSIONS.HEIGHT * flagAtTopOfPole,
        game.playerOptions[game.smashConfig.players[0].characterId].char.name +
          '_spritesheet',
        0
      );
    } else {
      f.spriteFlagChar = game.physics.add.sprite(
        (1920 - 100 - game.ASSET_BRICK_WIDTH * 3) * game.SCREEN_SCALE.WIDTH +
          horizOffset,
        SCREEN_DIMENSIONS.HEIGHT * flagAtTopOfPole,
        game.playerOptions[game.smashConfig.players[0].characterId].char.name
      );
    }
  }
  f.spriteFlagChar.setBounce(0);
  f.spriteFlagChar.displayWidth = 60;
  f.spriteFlagChar.scaleY = f.spriteFlagChar.scaleX;
  f.spriteFlagChar.setImmovable(true);
  f.spriteFlagChar.body.allowGravity = false;
  f.spriteFlagChar.setTintFill(0xffffff);
  f.spriteFlagChar.setAlpha(0);

  f.poleTouchStamps = [];
  game.players.forEach((player, playerIndex) => {
    f.poleTouchStamps.push({ touching: false, gameStamp: 0 });
  });

  f.soundFlagCapture = game.sound.add('flag_capture', {
    volume: 0.5,
  });
  f.soundFlagComplete = game.sound.add('flag_complete', {
    volume: 0.5,
  });
  f.soundFlagMusicBox = game.sound.add('flag_music_box', {
    volume: 0.35,
    loop: true,
  });
}

function createPole(game: SmashedGame): void {
  game.flag.spriteFlagPole = game.physics.add.sprite(
    (1920 - 105 - game.ASSET_BRICK_WIDTH * 3) * game.SCREEN_SCALE.WIDTH,
    (1080 - 557) * game.SCREEN_SCALE.HEIGHT,
    'pole'
  );
  game.flag.spriteFlagPole.setScale(1);
  game.flag.spriteFlagPole.setImmovable(true);
  game.flag.spriteFlagPole.body.allowGravity = false;
  game.flag.spriteFlagPole.setImmovable(false);
  game.flag.spriteFlagPole.setOrigin(0.5, 0.5);
}

function createFireFlower(game: SmashedGame): void {
  if (game.debug.NN_Train) {
    return;
  }

  const ff: FireFlower = game.fireFlower;

  ff.sprite = game.physics.add.sprite(ff.posInit.x, ff.posInit.y, 'cannon');

  ff.numUpdateIndexesToWait = game.debug.Flower_Rapid_Fire
    ? ff.numUpdateIndexesToWaitFast
    : ff.numUpdateIndexesToWait;

  ff.damage = game.debug.Flower_Rapid_Fire
    ? ff.damage * (ff.numUpdateIndexesToWaitFast / ff.numUpdateIndexesToWait)
    : ff.damage;

  ff.sprite.setScale(0.85);
  ff.sprite.setImmovable(true);
  ff.sprite.body.allowGravity = false;
  ff.sprite.setImmovable(false);
  ff.sprite.setOrigin(0.5, 0.5);
  ff.sprite.setTint(getInactiveBackgroundTintColor());

  ff.attackBullets.bullets = new BulletsFireFlower(game);

  for (let i = 0; i < 6; i++) {
    ff.fireBallSounds.push(
      game.sound.add('fire_ball_sound', {
        volume: 0.05,
      })
    );
  }
}

function createCollidersFireFlower(game: SmashedGame): void {
  if (game.debug.NN_Train) {
    return;
  }

  const aebs = game.fireFlower.attackBullets.bullets;
  game.physics.add.collider(aebs, game.PLATFORMS);

  for (let i = 0; i < game.players.length; i++) {
    // game.physics.add.collider(aebs, game.players[i].char.sprite);
    game.physics.add.collider(aebs, game.players[i].char.attackEnergy.sprite);
    game.physics.add.collider(aebs, game.players[i].char.attackPhysical.sprite);
  }

  game.physics.add.collider(aebs, game.chomp.sprite);
  aebs.children.iterate((child: any) => {
    child.body.allowGravity = game.debug.Flower_Gravity;

    game.physics.add.collider(child, game.PLATFORMS);
    game.physics.add.collider(child, game.chomp.sprite);
    game.physics.add.collider(child, game.TABLE);

    // bounce off of game world boundary
    // child.setCollideWorldBounds(false, false, false, false);
    if (game.debug.Flower_Bounce_Wall) {
      // bounce off world boundary
      child.setCollideWorldBounds(true, 1, 1);
    }
  });

  // collide with table
  game.physics.add.collider(aebs, game.TABLE);

  // collide with chomp
  game.physics.add.collider(aebs, game.chomp.sprite);

  // // collide with world bounds
  // game.physics.world.setBoundsCollision(true, true, true, true);

  // // collide with screen bounds
  // game.physics.world.setBounds(
  //   0,
  //   0,
  //   SCREEN_DIMENSIONS.WIDTH,
  //   SCREEN_DIMENSIONS.HEIGHT
  // );
}

function createShake(game: SmashedGame): void {
  const shakeConfig: ShakePosition.IConfig = {
    duration: 400,
    magnitude: 100,
    magnitudeMode: 'decay',
  };

  game.shake = new ShakePosition(game.cameraPlayers.char.sprite, shakeConfig);
  game.shake.setEnable(true);
}

function createExplosionsBack(game: SmashedGame): void {
  const config = {
    key: 'explsionanimation',
    frames: game.anims.generateFrameNumbers('explosion256', {
      start: 0,
      end: 47,
      first: 0,
    }),
    frameRate: game.chomp.explosionFPS,
    repeat: 0,
  };

  game.anims.create(config);

  const c = game.chomp;
  const eArray = c.darknessMoments.explosions;

  eArray.forEach((e, eIndex) => {
    e.sprite = game.physics.add.sprite(
      SCREEN_DIMENSIONS.WIDTH / 2,
      -500,
      'explosion256'
    );
    e.sprite.setScale(2);
    e.sprite.body.allowGravity = false;
    e.sprite.setBounce(0);
    e.sprite.setOrigin(0.5, 0.5);
    e.sprite.setImmovable(true);
    e.sprite.setRotation(
      ((2 * Math.PI) / c.darknessMoments.explosions.length) * eIndex
    );
    // add sounds to explosions
    e.sound = game.sound.add(
      eIndex % 2 === 0 ? 'boom_short_01' : 'boom_short_02',
      {
        volume: game.debug.Dev_Mode ? 0 : 0.12,
      }
    );
  });
}

function createExplosionBulletBillCannon(game: SmashedGame): void {
  const config = {
    key: 'explsionanimationBulletBillCannon',
    frames: game.anims.generateFrameNumbers('explosion256', {
      start: 0,
      end: 47,
      first: 0,
    }),
    frameRate: 30,
    repeat: 0,
  };

  game.anims.create(config);

  const bbCombo: BulletBillCombo = game.bulletBillCombo;
  const bbBullet: BulletBillBullet = bbCombo.bullet;

  bbBullet.explosionSprite = game.physics.add.sprite(
    bbBullet.explosionPosInit.x,
    bbBullet.explosionPosInit.y,
    'explosion256'
  );

  bbBullet.explosionSprite.setScale(5);
  bbBullet.explosionSprite.body.allowGravity = false;
  bbBullet.explosionSprite.setBounce(0);
  bbBullet.explosionSprite.setOrigin(0.5, 0.5);

  bbBullet.sound = game.sound.add('boom_short_01', {
    volume: game.debug.Dev_Mode ? 0 : 0.3,
  });
  bbBullet.sound.setRate(0.4);
}

function createExplosionsFront(game: SmashedGame): void {
  const config = {
    key: 'explsionanimationFront',
    frames: game.anims.generateFrameNumbers('explosion256', {
      start: 0,
      end: 47,
      first: 0,
    }),
    frameRate: game.chomp.explosionFPS * 0.8,
    repeat: 0,
  };

  game.anims.create(config);

  const eFrontArray = game.chomp.darknessMoments.explosionsFront;

  eFrontArray.forEach((e, eIndex) => {
    e.sprite = game.physics.add.sprite(
      SCREEN_DIMENSIONS.WIDTH / 2,
      -500,
      'explosion256'
    );
    e.sprite.setScale(1);
    e.sprite.body.allowGravity = false;
    e.sprite.setBounce(0);
    e.sprite.setOrigin(0.5, 0.5);
    e.sprite.setImmovable(true);
    e.sprite.setAlpha(0.3);
    e.sprite.setRotation(
      ((2 * Math.PI) / game.chomp.darknessMoments.explosionsFront.length) *
        (eIndex - 1)
    );
  });
}

function createChomp(game: SmashedGame): void {
  if (game.debug.NN_Train) {
    return;
  }

  const c = game.chomp;
  const b = c.block;

  c.soundAttack = game.sound.add('chainChompAttack', {
    volume: game.debug.Dev_Mode ? 0 : 0.2,
  });

  c.soundHurt = game.sound.add('chainChompHurt', {
    volume: game.debug.Dev_Mode ? 0 : 0.2,
  });

  c.soundSheep = game.sound.add('chainChompSheep', {
    volume: game.debug.Dev_Mode ? 0 : 0.2,
    loop: true,
  });

  c.soundBBBambalam = game.sound.add('bb_bam', {
    volume: game.debug.Dev_Mode ? 0 : 0.4,
  });

  c.soundBBWoah = game.sound.add('bb_woah', {
    volume: game.debug.Dev_Mode ? 0 : 0.25,
  });

  for (let i = 0; i < c.NUM_LINKS; i++) {
    c.links.push({ sprite: null });
    c.links[i].sprite = game.physics.add.sprite(b.x, b.y, 'chomp_link');
    c.links[i].sprite.setScale(0.5);
    c.links[i].sprite.body.allowGravity = false;
    c.links[i].sprite.setBounce(0);
    c.links[i].sprite.setOrigin(0.5, 1);
    c.links[i].sprite.setImmovable(true);
    game.physics.add.collider(c.links[i].sprite, game.PLATFORMS);
  }

  const config_chomping = {
    key: 'chompanimation_chomping',
    frames: game.anims.generateFrameNumbers('chomp', {
      start: 0,
      end: 3,
      first: 0,
    }),
    frameRate: 45,
    repeat: -1,
    yoyo: true,
  };

  const config_walking = {
    key: 'chompanimation_walking',
    frames: game.anims.generateFrameNumbers('chomp', {
      start: 2,
      end: 3,
      first: 2,
    }),
    frameRate: 8,
    repeat: -1,
    yoyo: true,
  };

  game.anims.create(config_chomping);
  game.anims.create(config_walking);

  c.sprite = game.physics.add.sprite(c.originX, c.originY - 10, 'chomp');
  c.sprite.setScale(1.3);
  c.sprite.body.allowGravity = true;
  c.sprite.setBounceX(1);
  c.sprite.setBounceY(0.5);
  c.sprite.setOrigin(0.5, 1);
  c.sprite.setVelocityX(30);
  c.sprite.setVelocityY(-100);
  c.sprite.setMass(c.MASS);
  c.sprite.play('chompanimation_walking');

  game.physics.add.collider(c.sprite, game.PLATFORMS);
}

function createPreCreate(game: SmashedGame): void {
  for (let i = 0; i < game.playerChoicesCharacterType.length; i++) {
    game.players.push(
      JSON.parse(
        JSON.stringify(game.playerOptions[game.playerChoicesCharacterType[i]])
      )
    );
  }

  game.players.forEach((player, playerIndex) => {
    player.gamepad = Phaser.Input.Gamepad.Gamepad;
  });
}

function createEndDataMatrices(game: SmashedGame): void {
  const numSplashes: number = game.splashesEndData.length;
  // const splashSizeTitleDefault = "40px";
  let splashSize = '';
  game.splashesEndData.forEach((splash, splashIndex) => {
    for (let i = 0; i < game.players.length; i++) {
      if (i === 0) {
        splashSize = splash.size;
      } else {
        splashSize = game.splashSizeTitleDefault;
      }
      splash.words[i] =
        game.players[i].char.name + ' ' + game.colorCircles[i].text;
    }
    splash.textTitle = game.add
      .text(
        SCREEN_DIMENSIONS.WIDTH * ((splashIndex + 1) / (numSplashes + 1)),
        SCREEN_DIMENSIONS.HEIGHT / 6,
        splash.name + ' ' + splash.emoji,
        {
          align: 'right',
          fontSize: splashSize,
          fontFamily: game.FONT_DEFAULT_VIDEOGAME,
          // fontFamily: game.FONT_DEFAULT_MONOSPACE,
          color: splash.color,
          stroke: splash.backgroundColor,
          strokeThickness: splash.strokeThickness,
          shadow: {
            offsetX: 0,
            offsetY: splash.offsetY,
            color: 'black',
            blur: splash.blur,
            stroke: true,
            fill: true,
          },
        }
      )
      .setOrigin(0.5, 0)
      .setAlpha(1);
    splash.textData = game.add
      .text(
        SCREEN_DIMENSIONS.WIDTH * ((splashIndex + 1) / (numSplashes + 1)),
        SCREEN_DIMENSIONS.HEIGHT / 6,
        splash.words,
        {
          align: 'right',
          fontSize: splash.size,
          fontFamily: game.FONT_DEFAULT_MONOSPACE,
          color: splash.color,
          stroke: splash.backgroundColor,
          strokeThickness: splash.strokeThickness,
          shadow: {
            offsetX: 0,
            offsetY: splash.offsetY,
            color: 'black',
            blur: splash.blur,
            stroke: true,
            fill: true,
          },
        }
      )
      .setOrigin(0.5, 0)
      .setAlpha(1);
  });
}

function createDataMatrices(game: SmashedGame): void {
  game.overlappingPlayerIAttackPhysicalJ = [];
  game.overlappingPlayerIAttackEnergyJ = [];
  game.wasLastHitByMatrix = [];
  game.numberHitByMatrix = [];
  game.numberKilledByMatrix = [];
  game.numberShotsTakenByMeMatrix = [];
  for (let i = 0; i < game.players.length; i++) {
    game.overlappingPlayerIAttackPhysicalJ.push([]);
    game.overlappingPlayerIAttackEnergyJ.push([]);
    game.wasLastHitByMatrix.push([]);
    game.numberHitByMatrix.push([]);
    game.numberKilledByMatrix.push([]);
    game.numberShotsTakenByMeMatrix.push([]);
    for (let j = 0; j < game.players.length; j++) {
      game.overlappingPlayerIAttackPhysicalJ[i].push(false);
      game.overlappingPlayerIAttackEnergyJ[i].push(false);
      game.wasLastHitByMatrix[i].push(false);
      game.numberHitByMatrix[i].push(0);
      game.numberKilledByMatrix[i].push(0);
      game.numberShotsTakenByMeMatrix[i].push(0);
    }
  }
}

function createSoundsGame(game: SmashedGame): void {
  game.SOUND_INTRO = game.sound.add('intro', { volume: 0.1 });
  game.SOUND_GUN = game.sound.add('gun', { volume: 0.6 });
  game.SOUND_HIT = game.sound.add('hit', { volume: 0.25 });
  game.SOUND_JUMP_PHYSICAL = game.sound.add('jump', { volume: 1 });
  game.SOUND_JUMP_ENERGY = game.sound.add('jumpPower', { volume: 0.8 });
  game.SOUND_FIRST_BLOOD = game.sound.add('firstBlood', { volume: 0.8 });
  game.SOUND_SQUISH = game.sound.add('squish', { volume: 0.2 });
  game.SOUND_DIE = game.sound.add('die', { volume: 0.8 });
  game.SOUND_START_LIQUID = game.sound.add('startLiquid', { volume: 0.1 });
  game.SOUND_START = game.sound.add('start', { volume: 0.4 });
  game.SOUND_READY = game.sound.add('ready', { volume: 0.6 });
  game.SOUND_READY_REPEAT = game.sound.add('readyRepeat', {
    volume: 0.3,
    loop: true,
  });

  game.players.forEach((player, playerIndex) => {
    player.playerReadySound = game.sound.add(
      'readyRepeat' + playerIndex.toString(),
      { volume: 0.3, loop: true }
    );
    if (!game.debug.Ready_Sound_Active) {
      player.playerReadySound.volume = 0;
    }
  });

  game.ENERJA_AH = game.sound.add('enerja_ah', { volume: 0.2 });
  game.ENERJA_DO_AGAIN = game.sound.add('enerja_again', { volume: 0.2 });
  game.ENERJA_FINISH = game.sound.add('enerja_finish', { volume: 0.2 });
  game.ENERJA_GYA = game.sound.add('enerja_gya', { volume: 0.2 });
  game.ENERJA_HAPPEN = game.sound.add('enerja_shit', { volume: 0.2 });
  game.ENERJA_SMASHED = game.sound.add('enerja_smashed', { volume: 0.8 });
  game.ENERJA_TURTLE = game.sound.add('enerja_turtle', { volume: 0.2 });
  game.ENERJA_TWO_SHOTS = game.sound.add('enerja_shots', { volume: 0.2 });
  game.ENERJA_UGH = game.sound.add('enerja_ugh', { volume: 0.8 });

  game.SOUND_GARAGE_REPEAT = game.sound.add('garage_repeat', {
    volume: 0.1,
    loop: true,
  });
  game.SOUND_PAUSED = game.sound.add('mii', { volume: 0.1, loop: true });
  game.soundBGM = game.sound.add('bgm', {
    volume: game.debug.Game_Music === 3 ? 0.15 : 0.2,
    loop: true,
  });

  if (!game.debug.Music_Active) {
    game.soundBGM.volume = 0;
  }

  if (!game.debug.Ready_Sound_Active) {
    game.SOUND_READY_REPEAT.volume = 0;
  }
}

function createPlayerIdCircles(game: SmashedGame): void {
  if (!game.debug.Player_ID_Visible || game.debug.Chars_Colored) {
    return;
  }

  // game.circles.forEach((circle, circleIndex) => {
  game.players.forEach((player, playerIndex) => {
    game.colorCircles[playerIndex].graphic = game.add.circle(
      0,
      0,
      10,
      game.colorCircles[playerIndex].colorNumber
    );
  });
  // });
}

function createHitboxOverlap(game: SmashedGame): void {
  // ATTACK PHYSICAL CHOMP OVERLAP
  game.players.forEach((player, playerIndex) => {
    game.physics.add.overlap(
      player.char.attackPhysical.sprite,
      game.chomp.sprite,
      function () {
        if (game.debug.NN_Train) {
          return;
        }

        updateChompFilterStatePlayer(
          player,
          player.char.attackPhysical.damage,
          game
        );

        if (!getDoesAnythingHaveDark(game)) {
          game.chomp.emitterDark.visible = true;
          setChompPowerState('dark', game);
          game.chomp.soundAttack.play();
          game.SOUND_HIT.play();
        }
      }
    );
  });

  // ATTACK ENERGY CHOMP OVERLAP
  game.players.forEach((player, playerIndex) => {
    game.physics.add.overlap(
      player.char.attackEnergy.sprite,
      game.chomp.sprite,
      function () {
        updateChompFilterStatePlayer(
          player,
          player.char.attackEnergy.damage,
          game
        );
        if (!getDoesAnythingHaveDark(game)) {
          game.chomp.emitterDark.visible = true;
          setChompPowerState('dark', game);
          game.chomp.soundAttack.play();
          game.SOUND_HIT.play();
        }
      }
    );
  });

  // PLAYER BULLET BILL BULLET OVERLAP
  game.players.forEach((player, playerIndex) => {
    game.physics.add.overlap(
      player.char.sprite,
      game.bulletBillCombo.bullet.sprite,
      function () {
        onHitHandlerBulletBill(player, playerIndex, game);
      }
    );
  });

  // PLAYER CHOMP OVERLAP
  game.players.forEach((player, playerIndex) => {
    game.physics.add.overlap(
      player.char.sprite,
      game.chomp.sprite,
      function () {
        if (game.chomp.powerStateCurr.name === 'dark') {
          setPlayerPowerState('dark', player, game);
          setChompPowerState('none', game);
          game.chomp.soundBBBambalam.play();
        }
      }
    );

    game.players.forEach((pj, j) => {
      if (player !== pj) {
        // PLAYER PLAYER OVERLAP
        game.physics.add.overlap(
          player.char.sprite,
          pj.char.sprite,
          function () {
            const hasBeen = getHasBeenGameDurationSinceMoment(
              2000,
              game.chomp.darknessMoments.passed,
              game
            );

            if (player.char.powerStateCurr.name === 'dark' && hasBeen) {
              setPlayerPowerState('dark', pj, game);
              setPlayerPowerState('none', player, game);
              game.chomp.soundBBWoah.setRate(
                game.chomp.soundBBWoah.rate * 0.95
              );
              game.chomp.soundBBWoah.play();
            }
          }
        );

        // PLAYER ATTACK PHYSICAL OVERLAP
        game.physics.add.overlap(
          player.char.sprite,
          pj.char.attackPhysical.sprite,
          function () {
            if (game.debug.Default_Damage) {
              onHitHandlerAttackPhysical(
                player,
                playerIndex,
                pj.char.attackPhysical,
                j,
                game.DEFAULT_ATTACK_DAMAGE,
                game
              );
              return;
            }
            onHitHandlerAttackPhysical(
              player,
              playerIndex,
              pj.char.attackPhysical,
              j,
              pj.char.attackPhysical.damage,
              game
            );
          }
        );

        // PLAYER ATTACK ENERGY OVERLAP
        game.physics.add.overlap(
          player.char.sprite,
          pj.char.attackEnergy.sprite,
          function () {
            if (game.debug.Default_Damage) {
              onHitHandlerAttackEnergy(
                player,
                playerIndex,
                pj.char.attackEnergy,
                j,
                game.DEFAULT_ATTACK_DAMAGE,
                game
              );
              return;
            }
            onHitHandlerAttackEnergy(
              player,
              playerIndex,
              pj.char.attackEnergy,
              j,
              pj.char.attackEnergy.damage,
              game
            );
          }
        );

        if (
          pj.char.attackEnergy.attackBullets !== null &&
          pj.char.attackEnergy.attackBullets.bullets !== null
        ) {
          pj.char.attackEnergy.attackBullets.bullets
            .getChildren()
            .forEach((bullet, bi) => {
              // PLAYER BULLETS OVERLAP
              game.physics.add.overlap(player.char.sprite, bullet, function () {
                // p('BULLET OVERLAP', bi);

                if (game.debug.Default_Damage) {
                  onHitHandlerBullets(
                    player,
                    playerIndex,
                    pj,
                    pj.char.attackEnergy,
                    bullet,
                    bi,
                    j,
                    game.DEFAULT_ATTACK_DAMAGE,
                    game
                  );
                  return;
                }
                onHitHandlerBullets(
                  player,
                  playerIndex,
                  pj,
                  pj.char.attackEnergy,
                  bullet,
                  bi,
                  j,
                  pj.char.attackEnergy.damage,
                  game
                );
              });
            });
        }

        // fireflower bullets
        game.fireFlower.attackBullets !== null &&
          game.fireFlower.attackBullets.bullets !== null &&
          game.fireFlower.attackBullets.bullets
            .getChildren()
            .forEach((bullet: any, bi: number) => {
              game.physics.add.overlap(player.char.sprite, bullet, function () {
                onHitHandlerFireBall(
                  player,
                  playerIndex,
                  bullet,
                  bi,
                  j,
                  game.fireFlower.damage,
                  game
                );
              });
            });
      }
    });
  });
}

function createKeyboards(game: SmashedGame): void {
  let kIndex = 0;

  for (let i = 0; i < game.players.length; i++) {
    if (game.players[i].inputType === 2) {
      game.players[i].keyboard = game.input.keyboard.addKeys(
        game.keyboardHandPositions[kIndex]
      );
      kIndex++;
      if (kIndex >= game.keyboardHandPositions.length) {
        return;
      }
    }
  }
}

function setPlayersInitialPositions(game: SmashedGame): void {
  game.players.forEach((player, playerIndex) => {
    player.char.initializeCharPosition.x =
      game.playerSpawnLocationsX[game.playerSpawnOrder[playerIndex]];

    player.char.initializeCharPosition.y =
      game.playerSpawnLocationsY[game.playerSpawnOrder[playerIndex]];
  });
}

function createEmitterChomp(game: SmashedGame): void {
  const c = game.chomp;
  c.particles = game.add.particles('tail_0');
  c.emitterDark = c.particles.createEmitter({
    speed: 1500,
    // scale: { start: 0.05, end: 0 },
    scale: { start: 1 * 2.5 * 2, end: 1.5 * 2 },
    blendMode: 'SUBTRACT',
    // bounce: 1,
    // length: 100,
    lifespan: 40,
    // gravityY: 1000,
  });
}

function createEmittersPlayers(game: SmashedGame): void {
  const m = 1;
  const n = 4;

  game.players.forEach((player, playerIndex) => {
    player.particles = game.add.particles('tail_' + playerIndex);
    player.particlesShield = game.add.particles('shield_' + playerIndex);

    player.emitterLight = player.particles.createEmitter({
      speed: 10,
      // scale: { start: 0.05, end: 0 },
      scale: { start: 1.5 * player.char.scaleCharSpriteReality * m, end: 0 },
      blendMode: 'ADD',
      // bounce: 1,
      // length: 100,
      lifespan: 30,
    });

    player.emitterDark = player.particles.createEmitter({
      // speed: 1000,
      speed: { min: 100, max: 1000 },
      // scale: { start: 0.05, end: 0 },
      scale: {
        start: 1 * player.char.scaleCharSpriteReality * m,
        end: 0.5 * m,
      },
      blendMode: 'SUBTRACT',
      // bounce: 1,
      // length: 100,
      lifespan: 40,
      // gravityY: 1000,
    });
    // player.emitterDark.setRotation(0, 360);

    player.emitterPlayer = player.particles.createEmitter({
      // speed: 80,
      speed: { min: 0, max: 80 },
      // scale: { start: 0.05, end: 0 },
      scale: { start: 0.7 * player.char.scaleCharSpriteReality * m, end: 0 },
      // blendMode: 'SUBTRACT',
      blendMode: 'ADD',
      // bounce: 1,
      // length: 100,
      gravityY: -500,
    });
    // player.emitterPlayer.setRotation(0, 360);

    player.emitterHurt = player.particlesShield.createEmitter({
      speed: 0,
      // scale: { start: 0.05, end: 0 },
      scale: { start: 0.3 * player.char.scaleCharSpriteReality * n, end: 0 },
      // blendMode: 'SUBTRACT'3,
      // bounce: 1,
      // length: 100,
    });
    // player.emitterHurt.setRotation(0, 360);
  });
}

function createColliderTablePlayers(game: SmashedGame): void {
  game.players.forEach((player, playerIndex) => {
    game.physics.add.collider(player.char.sprite, game.TABLE);
  });
}

function createColliderTableAttackPhysicals(game: SmashedGame): void {
  game.players.forEach((player, playerIndex) => {
    game.physics.add.collider(player.char.attackPhysical.sprite, game.TABLE);
  });
}
function createColliderTableAttackEnergies(game: SmashedGame): void {
  game.players.forEach((player, playerIndex) => {
    if (player.char.attackEnergy.bouncePlatforms) {
      game.physics.add.collider(player.char.attackEnergy.sprite, game.TABLE);
    }
  });
}

function createEmitterChompFollowChomp(game: SmashedGame): void {
  game.chomp.emitterDark
    .startFollow(game.chomp.block)
    .setAlpha(1)
    .setTint(0x000000);

  game.chomp.emitterDark.active = true;
  game.chomp.emitterDark.on = true;
  game.chomp.emitterDark.visible = false;
}

function createEmittersFollowPlayers(game: SmashedGame): void {
  game.players.forEach((player, playerIndex) => {
    // player.emitterLight.setScale(player.char.scaleCharSpriteReality);
    // player.emitterDark.setScale(player.char.scaleCharSpriteReality);
    // player.emitterPlayer.setScale(player.char.scaleCharSpriteReality);
    // player.emitterHurt.setScale(player.char.scaleCharSpriteReality);

    player.emitterLight.startFollow(player.char.sprite);
    player.emitterDark.startFollow(player.char.sprite);
    player.emitterPlayer.startFollow(player.char.sprite);
    player.emitterHurt.startFollow(player.char.sprite);

    player.emitterLight.setAlpha(0.3);
    player.emitterDark.setAlpha(1);
    player.emitterPlayer.setAlpha(1);
    player.emitterHurt.setAlpha(0.5);
    // player.emitterPlayer.setAlpha(0.3);

    player.emitterLight.setTint(0xffffff);
    player.emitterDark.setTint(0x000000);
    player.emitterPlayer.setTint(game.colorCircles[playerIndex].colorNumber);
    player.emitterHurt.setTint(game.colorCircles[playerIndex].colorNumber);

    // EMN ACTIVE
    player.emitterLight.active = false;
    player.emitterDark.active = true;
    player.emitterPlayer.active = false;
    player.emitterHurt.active = false;

    player.emitterLight.on = false;
    player.emitterDark.on = true;
    player.emitterPlayer.on = false;
    player.emitterHurt.on = true; // always on

    player.emitterLight.visible = false;
    player.emitterDark.visible = false;
    // player.emitterPlayer.visible = false;
    // player.emitterHurt.visible = false;
  });
}

function createLavas(game: SmashedGame): void {
  const initialLeftMostLava = (-1 * SCREEN_DIMENSIONS.WIDTH) / 2;

  for (let i = 0; i < game.lavas.length; i++) {
    createLava(i, game, initialLeftMostLava + i * game.lavas[i].width);
  }
}

function createFirework(game: SmashedGame): void {
  // const f = game.flag;
  // const fire = f.firework;
  game.flag.firework = game.physics.add.sprite(
    SCREEN_DIMENSIONS.WIDTH * 0.86,
    SCREEN_DIMENSIONS.HEIGHT * 0.47,
    'firework'
  );

  const configFireworkActive = {
    key: 'firework-active',
    frames: game.anims.generateFrameNumbers('firework', {
      start: 0,
      end: 5 * 6 - 1,
      first: 0,
    }),

    frameRate: 10,
    repeat: 0,
    yoyo: false,
  };
  const configFireworkPassive = {
    key: 'firework-passive',
    frames: game.anims.generateFrameNumbers('firework', {
      start: 0,
      end: 1,
      first: 0,
    }),

    frameRate: 10,
    repeat: 0,
    yoyo: false,
  };

  game.anims.create(configFireworkActive);
  game.anims.create(configFireworkPassive);
  game.flag.firework.setScale(5);
  game.flag.firework.setImmovable(true);
  game.flag.firework.body.allowGravity = false;
  game.flag.firework.setOrigin(0.5, 0.5);

  game.flag.firework.play('firework-passive');
  // game.flag.firework.play('firework-active');
  game.flag.firework.setAlpha(0);
  game.flag.firework.on('animationcomplete', function () {
    game.flag.firework.setAlpha(0);
  });
}

function createLava(i: number, game: SmashedGame, posX: number): void {
  const bottomOfMap = SCREEN_DIMENSIONS.HEIGHT + 10;
  // const bottomOfMap = SCREEN_DIMENSIONS.HEIGHT + 28;

  game.lavas[i].sprite = game.physics.add.sprite(posX, bottomOfMap, 'lava');

  const config_lava = {
    key: 'lava_moving',
    frames: game.anims.generateFrameNumbers('lava', {
      start: 0,
      end: game.lavas[i].numFrames - 1,
      first: 0,
    }),
    frameRate: game.lavas[i].rate,
    repeat: -1,
    yoyo: false,
  };

  game.anims.create(config_lava);
  game.lavas[i].sprite.setScale(3);
  game.lavas[i].sprite.setImmovable(true);
  game.lavas[i].sprite.body.allowGravity = false;
  game.lavas[i].sprite.play('lava_moving');
  game.lavas[i].sprite.setOrigin(0, 0);
}

function createPlayers(game: SmashedGame): void {
  setPlayersInitialPositions(game);

  game.players.forEach((player, playerIndex) => {
    player.inputType = game.playerChoicesInputType[playerIndex];
  });

  game.players.forEach((player, playerIndex) => {
    if (player.char.srcSpriteSheet === '') {
      player.char.sprite = game.physics.add.sprite(
        SCREEN_DIMENSIONS.WIDTH / 2 + player.char.initializeCharPosition.x,
        game.BASE_PLAYER_INITIAL_POSITION.POSITION.PLAYER_Y,
        player.char.name
      );
    } else {
      player.char.sprite = game.physics.add.sprite(
        SCREEN_DIMENSIONS.WIDTH / 2 + player.char.initializeCharPosition.x,
        game.BASE_PLAYER_INITIAL_POSITION.POSITION.PLAYER_Y,
        player.char.name + '_spritesheet'
      );

      const config_idle = {
        key: player.char.name + '_idle',
        frames: game.anims.generateFrameNumbers(
          player.char.name + '_spritesheet',
          {
            start: 0,
            end: 0,
            first: 0,
          }
        ),
        frameRate: 1,
        repeat: -1,
      };

      const config_walk = {
        key: player.char.name + '_walk',
        frames: game.anims.generateFrameNumbers(
          player.char.name + '_spritesheet',
          {
            start: 1,
            end: 3,
            first: 1,
          }
        ),
        frameRate: 20 * player.char.runRate,
        repeat: -1,
      };

      const config_jumpUp = {
        key: player.char.name + '_jumpUp',
        frames: game.anims.generateFrameNumbers(
          player.char.name + '_spritesheet',
          {
            start: 4,
            end: 4,
            first: 4,
          }
        ),
        frameRate: 1,
        repeat: -1,
      };

      const config_jumpDown = {
        key: player.char.name + '_jumpDown',
        frames: game.anims.generateFrameNumbers(
          player.char.name + '_spritesheet',
          {
            start: 7,
            end: 7,
            first: 7,
          }
        ),
        frameRate: 1,
        repeat: -1,
      };

      const config_climb = {
        key: player.char.name + '_climb',
        frames: game.anims.generateFrameNumbers(
          player.char.name + '_spritesheet',
          {
            start: 5,
            end: 6,
            first: 5,
          }
        ),
        frameRate: 10 * player.char.runRate,
        repeat: -1,
      };

      game.anims.create(config_idle);
      game.anims.create(config_walk);
      game.anims.create(config_jumpUp);
      game.anims.create(config_jumpDown);
      game.anims.create(config_climb);
    }
  });

  game.players.forEach((player, playerIndex) => {
    player.char.attackPhysical.audio = game.sound.add('gun', { volume: 0.6 });
  });

  game.players.forEach((player, playerIndex) => {
    // for (let i = 0; i < 15; i++) {
    for (let i = 0; i < 10; i++) {
      player.char.wallTouchArray.push(false);
    }

    player.char.sprite.setScale(player.char.scaleCharSpriteImage);
    // player.char.sprite.flipX = !player.char.initializeCharPosition.lookingRight;
    player.char.sprite.flipX = playerIndex % 2 ? true : false;

    player.char.sprite.setCollideWorldBounds(false);

    player.char.sprite.setOrigin(0.5, 0.5);

    game.physics.add.collider(player.char.sprite, game.PLATFORMS);

    // player.keyboard = game.input.keyboard.addKeys(player.keyboard_static);
  });

  game.players.forEach((player, playerIndex) => {
    setBlinkTrue(player);
  });

  game.players.forEach((player, playerIndex) => {
    // IF RULE BOT
    if (player.inputType === 3) {
      player.padCurr.right = true;
      player.padCurr.left = false;
    }

    // IF NN BOT
    if (player.inputType === 4) {
      player.padCurr.right = false;
      player.padCurr.left = true;
    }
  });
}

function createAttackPhysicals(game: SmashedGame): void {
  game.players.forEach((player, playerIndex) => {
    player.char.attackPhysical.sprite = game.physics.add
      .sprite(-500, -500, player.char.attackPhysical.srcImage)
      .setMass(player.char.attackPhysical.mass)
      .setScale(player.char.attackPhysical.scale)
      .setOrigin(0.5, 0.5)
      .setActive(true)
      .setVisible(true)
      .setTint(game.colorCircles[playerIndex].colorNumber)
      .setAlpha(0.5);

    player.char.attackPhysical.sprite.body.allowGravity = false;

    setAttackPhysicalOffscreen(player, game);
  });
}
function createAttackEnergies(game: SmashedGame): void {
  game.players.forEach((player, playerIndex) => {
    const ae = player.char.attackEnergy;
    ae.sprite = game.physics.add
      .sprite(-300, -300, ae.srcImage)
      .setMass(ae.mass)
      .setScale(ae.scale)
      .setRotation(ae.rotation.initial * Math.PI)
      .setAngularVelocity(ae.rotation.speed * Math.PI);

    ae.sprite.body.allowGravity = ae.gravity;
    ae.sprite.body.bounce.set(ae.bounceX, ae.bounceY);
    // ae.sprite.body.gravity.set(0, 0);
    if (ae.bouncePlatforms) {
      game.physics.add.collider(ae.sprite, game.PLATFORMS);
    }

    filterAttackEnergyNormal(player, playerIndex, game);

    // game.players.forEach((p, i) => {
    //   game.physics.add.collider(ae.sprite, bbCombo.cannon.sprite);
    // });
  });

  game.players.forEach((player, playerIndex) => {
    const ae = player.char.attackEnergy;
    if (game.debug.Bullets_Allow_Groups && ae.attackBullets) {
      ae.attackBullets.bullets = new BulletsPlayer(game, player);
      const aebs = ae.attackBullets.bullets;
      const x = ae.attackBullets;
      ae.attackBullets.soundB1 = game.sound.add(x.sB1, {
        volume: x.vB1,
      });
      ae.attackBullets.soundB2 = game.sound.add(x.sB2, { volume: x.vB2 });
      ae.attackBullets.soundP1 = game.sound.add(x.sP1, { volume: x.vP1 });
      ae.attackBullets.soundP2 = game.sound.add(x.sP2, { volume: x.vP2 });

      game.physics.add.collider(aebs, game.PLATFORMS);

      for (let i = 0; i < game.players.length; i++) {
        game.physics.add.collider(aebs, game.players[i].char.sprite);

        if (game.debug.Colliders_AB_v_AE) {
          game.physics.add.collider(
            aebs,
            game.players[i].char.attackEnergy.sprite
          );
        }
        if (game.debug.Colliders_AB_v_AP) {
          game.physics.add.collider(
            aebs,
            game.players[i].char.attackPhysical.sprite
          );
        }
      }

      game.physics.add.collider(aebs, game.chomp.sprite);
      game.physics.add.collider(aebs, game.TABLE);

      // colliders with fireballs (fireflower bullets)
      if (!game.debug.NN_Train) {
        for (
          let i = 0;
          i < game.fireFlower.attackBullets.bullets.getChildren().length;
          i++
        ) {
          game.physics.add.collider(
            aebs,
            game.fireFlower.attackBullets.bullets.getChildren()[i]
          );
        }
      }
      // turn off gravity for bullets
      aebs.children.iterate((child: any) => {
        if (player.char.attackEnergy.gravity) {
          child.body.allowGravity = true;
        } else {
          child.body.allowGravity = false;
        }
      });
    }
  });
}

function createCollidersPvP(game: SmashedGame): void {
  if (!game.debug.Colliders_P_v_P) {
    return;
  }

  game.players.forEach((iPlayer, i) => {
    game.colliderPvP.push([]);
    game.players.forEach((jPlayer, j) => {
      if (j !== i) {
        game.colliderPvP[i].push(
          game.physics.add.collider(iPlayer.char.sprite, jPlayer.char.sprite)
        );
      } else {
        game.colliderPvP[i].push('XXX');
      }
    });
  });
}

function createCollidersPvAP(game: SmashedGame): void {
  if (!game.debug.Colliders_P_v_AP) {
    return;
  }

  game.players.forEach((iPlayer, i) => {
    game.colliderPvAP.push([]);
    game.players.forEach((jPlayer, j) => {
      if (i !== j) {
        game.colliderPvAP[i].push(
          game.physics.add.collider(
            iPlayer.char.sprite,
            jPlayer.char.attackPhysical.sprite
          )
        );
      } else {
        game.colliderPvAP[i].push('XXX');
      }
    });
  });
}
function createCollidersPvAE(game: SmashedGame): void {
  if (!game.debug.Colliders_P_v_AE) {
    return;
  }

  game.players.forEach((iPlayer, i) => {
    game.colliderPvAE.push([]);
    game.players.forEach((jPlayer, j) => {
      if (i !== j) {
        game.colliderPvAE[i].push(
          game.physics.add.collider(
            iPlayer.char.sprite,
            jPlayer.char.attackEnergy.sprite
          )
        );
      } else {
        game.colliderPvAE[i].push('XXX');
      }
    });
  });

  print('game.colliderPvAE', game.colliderPvAE);
}
function createCollidersAEvAE(game: SmashedGame): void {
  if (!game.debug.Colliders_AE_v_AE) {
    return;
  }

  game.players.forEach((iPlayer, i) => {
    game.colliderAEvAE.push([]);
    game.players.forEach((jPlayer, j) => {
      if (i !== j) {
        game.colliderAEvAE[i].push(
          game.physics.add.collider(
            iPlayer.char.attackEnergy.sprite,
            jPlayer.char.attackEnergy.sprite
          )
        );
      } else {
        game.colliderAEvAE[i].push('XXX');
      }
    });
  });
}
function createCollidersAEvAP(game: SmashedGame): void {
  if (!game.debug.Colliders_AE_v_AP) {
    return;
  }

  game.players.forEach((iPlayer, i) => {
    game.colliderAEvAP.push([]);
    game.players.forEach((jPlayer, j) => {
      if (i !== j) {
        game.colliderAEvAP[i].push(
          game.physics.add.collider(
            iPlayer.char.attackEnergy.sprite,
            jPlayer.char.attackPhysical.sprite
          )
        );
      } else {
        game.colliderAEvAP[i].push('XXX');
      }
    });
  });
}

function createBulletBill(game: SmashedGame): void {
  const bbCombo: BulletBillCombo = game.bulletBillCombo;

  // CREATE BASE BULLET
  bbCombo.bullet.sprite = game.physics.add.sprite(
    bbCombo.bullet.posInit.x,
    bbCombo.bullet.posInit.y,
    bbCombo.bullet.srcImage
  );

  bbCombo.bullet.sprite.setScale(bbCombo.bullet.scale);
  bbCombo.bullet.sprite.body.allowGravity = false;
  bbCombo.bullet.sprite.setOrigin(0.5, 0.5);
  bbCombo.bullet.sprite.body.setMass(bbCombo.bullet.mass);
  bbCombo.bullet.sprite.setImmovable(true);

  for (let i = 0; i < game.players.length; i++) {
    const newColoredBullet = game.physics.add.sprite(
      bbCombo.bullet.posInit.x,
      bbCombo.bullet.posInit.y,
      bbCombo.bullet.srcImage + '_' + i
    );

    newColoredBullet.setScale(bbCombo.bullet.scale);
    newColoredBullet.body.allowGravity = false;
    newColoredBullet.setOrigin(0.5, 0.5);
    newColoredBullet.body.setMass(bbCombo.bullet.mass);
    newColoredBullet.setImmovable(true);

    bbCombo.bullet.sprites_colored.push(newColoredBullet);
  }
  // CREATE CANNON
  bbCombo.cannon.sprite = game.physics.add.sprite(
    bbCombo.cannon.posInit.x,
    bbCombo.cannon.posInit.y,
    bbCombo.cannon.srcImage
  );

  bbCombo.cannon.sprite.setScale(bbCombo.cannon.scale);
  bbCombo.cannon.sprite.setImmovable(true);
  bbCombo.cannon.sprite.body.allowGravity = false;
  bbCombo.cannon.sprite.setOrigin(0.5, 0.5);
}

function createCollidersBulletBill(game: SmashedGame): void {
  const bbCombo: BulletBillCombo = game.bulletBillCombo;
  const bbBullet = bbCombo.bullet;
  const bbCannon = bbCombo.cannon;
  const players: Player[] = game.players;
  const ff: FireFlower = game.fireFlower;
  const fireFlowerBullets = game.fireFlower.attackBullets.bullets;

  game.physics.add.collider(bbCannon.sprite, game.PLATFORMS);
  game.physics.add.collider(bbCannon.sprite, game.TABLE);
  game.physics.add.collider(bbCannon.sprite, ff.attackBullets);

  players.forEach((player, playerIndex) => {
    game.physics.add.collider(player.char.sprite, bbCannon.sprite);

    if (player.char.attackEnergy.bouncePlatforms) {
      game.physics.add.collider(
        player.char.attackEnergy.sprite,
        bbCannon.sprite
      );
      // game.physics.add.collider(
      //   player.char.attackEnergy.sprite,
      //   bbBullet.sprite
      // );

      if (
        player.char.attackEnergy?.attackBullets !== null &&
        player.char.attackEnergy?.attackBullets?.bullets !== null
      ) {
        player.char.attackEnergy.attackBullets.bullets
          .getChildren()
          .forEach((bullet, bi) => {
            game.physics.add.collider(bullet, bbCannon.sprite);
          });
      }
    }
  });

  game.physics.add.collider(bbBullet.sprite, ff.attackBullets);

  if (!game.debug.NN_Train) {
    fireFlowerBullets.children.iterate((child: any) => {
      child.body.allowGravity = game.debug.Flower_Gravity;

      game.physics.add.collider(child, bbBullet.sprite);
      game.physics.add.collider(child, bbCannon.sprite);
      game.physics.add.collider(child, game.TABLE);
    });
  }
}

function createBackground(game: SmashedGame): void {
  const scaleUp = 1.1;

  game.BACKGROUND = game.physics.add.sprite(
    SCREEN_DIMENSIONS.WIDTH / 2,
    SCREEN_DIMENSIONS.HEIGHT / 2,
    'background'
  );
  game.BACKGROUND.setScale(
    game.SCREEN_SCALE.WIDTH * scaleUp,
    game.SCREEN_SCALE.HEIGHT * scaleUp
  );
  // game.BACKGROUND.setOrigin(0.5, 0.5);
  game.BACKGROUND.setImmovable(true);
  game.BACKGROUND.body.allowGravity = false;
}

function createBackgroundOutlineFront(game: SmashedGame): void {
  game.BACKGROUND_OUTLINE_FRONT = game.physics.add.sprite(
    SCREEN_DIMENSIONS.WIDTH / 2,
    SCREEN_DIMENSIONS.HEIGHT / 2,
    'background_outline_front'
  );
  game.BACKGROUND_OUTLINE_FRONT.setScale(
    game.SCREEN_SCALE.WIDTH,
    game.SCREEN_SCALE.HEIGHT
  );
  // game.BACKGROUND_OUTLINE.setOrigin(0.5, 0.5);
  game.BACKGROUND_OUTLINE_FRONT.setImmovable(true);
  game.BACKGROUND_OUTLINE_FRONT.body.allowGravity = false;
}

function createBackgroundOutlineBack(game: SmashedGame): void {
  game.BACKGROUND_OUTLINE_BACK = game.physics.add.sprite(
    SCREEN_DIMENSIONS.WIDTH / 2,
    SCREEN_DIMENSIONS.HEIGHT / 2,
    'background_outline_back'
  );
  game.BACKGROUND_OUTLINE_BACK.setScale(
    game.SCREEN_SCALE.WIDTH,
    game.SCREEN_SCALE.HEIGHT
  );
  // game.BACKGROUND_OUTLINE.setOrigin(0.5, 0.5);
  game.BACKGROUND_OUTLINE_BACK.setImmovable(true);
  game.BACKGROUND_OUTLINE_BACK.body.allowGravity = false;
}

function createTable(game: SmashedGame): void {
  game.TABLE = game.physics.add.sprite(
    (SCREEN_DIMENSIONS.WIDTH / 2) * game.SCREEN_SCALE.WIDTH,
    (SCREEN_DIMENSIONS.HEIGHT / 2 - 300) * game.SCREEN_SCALE.HEIGHT,
    'table'
  );

  game.TABLE.setScale(1);
  game.TABLE.setMass(2);
  // game.TABLE.setCollideWorldBounds(true);
  game.TABLE.setBounce(0.5);
  game.TABLE.setOrigin(0.5, 0.5);
  // game.TABLE.setImmovable(true);

  // game.physics.add.collider(game.TABLE, game.PLATFORMS);

  // game.TABLE.setImmovable(true);
  // game.TABLE.body.allowGravity = false;

  game.soundPowerup = game.sound.add('powerup', { volume: 0.3, loop: true });
}

function createColliderTablePlatforms(game: SmashedGame): void {
  game.physics.add.collider(game.TABLE, game.PLATFORMS);
}

function createSplashRuleFinished(game: SmashedGame): void {
  game.splashRules.forEach((splash, splashIndex) => {
    // if (splashIndex === game.splashRules.length - 1) {
    if (splash.name === 'splash-finished') {
      splash.text = game.add
        .text(
          SCREEN_DIMENSIONS.WIDTH / 2,
          SCREEN_DIMENSIONS.HEIGHT / 2,
          splash.word,
          {
            // font: "Arial 100px",
            fontSize: splash.size,
            // fontFamily: "'Courier New'",
            fontFamily: 'Impact',
            // fontFamily: "'Press Start 2P'",
            color: splash.color,
            stroke: splash.backgroundColor,
            strokeThickness: splash.strokeThickness,
            shadow: {
              offsetX: 0,
              offsetY: 9,
              color: splash.shadowColor,
              blur: 10,
              stroke: true,
              fill: true,
            },
          }
        )
        .setOrigin(0.5, 0.5)
        .setAlpha(1);
    }
  });
}
function createSplashBlack(game: SmashedGame): void {
  const splash = game.splashRules[0];
  splash.text = game.add
    .text(
      SCREEN_DIMENSIONS.WIDTH / 2,
      SCREEN_DIMENSIONS.HEIGHT / 2,
      splash.word,
      {
        // font: "Arial 100px",
        fontSize: splash.size,
        // fontFamily: "'Courier New'",
        fontFamily: 'Impact',
        // fontFamily: "'Press Start 2P'",
        color: splash.color,
        stroke: splash.backgroundColor,
        strokeThickness: splash.strokeThickness,
        shadow: {
          offsetX: 0,
          offsetY: 9,
          color: 'black',
          blur: 10,
          stroke: true,
          fill: true,
        },
      }
    )
    .setOrigin(0.5, 0.5)
    .setAlpha(1);
}

function createSplashes(game: SmashedGame): void {
  game.splashRules.forEach((splash, splashIndex) => {
    if (splashIndex !== 0 && splashIndex !== game.splashRules.length - 1) {
      splash.text = game.add
        .text(
          SCREEN_DIMENSIONS.WIDTH / 2,
          SCREEN_DIMENSIONS.HEIGHT / 2,
          splash.word,
          {
            // font: "Arial 100px",
            fontSize: splash.size,
            // fontFamily: "'Courier New'",
            fontFamily: 'Impact',
            // fontFamily: "'Press Start 2P'",
            color: splash.color,
            stroke: splash.backgroundColor,
            strokeThickness: splash.strokeThickness,
            shadow: {
              offsetX: 0,
              offsetY: 9,
              color: 'black',
              blur: 10,
              stroke: true,
              fill: true,
            },
          }
        )
        .setOrigin(0.5, 0.5)
        .setAlpha(1);
    }
  });
}

function createScoreboardShotGlass(game: SmashedGame): void {
  game.players.forEach((player, playerIndex) => {
    game.endCups.push({
      sprite: null,
      ownerId: playerIndex,
    });
  });

  game.endCups.forEach((endCup, i) => {
    endCup.sprite = game.add
      .sprite(
        SCREEN_DIMENSIONS.WIDTH / 2 + game.playerSpawnLocationsX[i],
        SCREEN_DIMENSIONS.HEIGHT / 2 + 200,
        'cup' + (i + 1).toString()
      )
      .setOrigin(0.5, 0.5);
  });

  game.players.forEach((player, playerIndex) => {
    player.shotGlassImage = game.add
      .sprite(
        SCREEN_DIMENSIONS.WIDTH / 2 + game.playerSpawnLocationsX[playerIndex],
        SCREEN_DIMENSIONS.HEIGHT / 2 + 200,
        'glass_full'
      )
      .setScale(
        2 / game.cameras.main.zoom / 10,
        2 / game.cameras.main.zoom / 10
      )
      .setOrigin(0.5, 0.5);

    player.shotGlassImage.setTint(
      0xffffff,
      0xffffff,
      0xffffff,
      game.colorCircles[playerIndex].colorNumber
    );
  });
}

function createScoreboardShotGlassNumber(game: SmashedGame): void {
  game.players.forEach((player, playerIndex) => {
    player.shotGlassNumber = game.add
      .text(
        SCREEN_DIMENSIONS.WIDTH / 2 + game.playerSpawnLocationsX[playerIndex],
        SCREEN_DIMENSIONS.HEIGHT / 2 + 200,
        (player.shotCountCurr - player.shotCountPrev).toString(),
        {
          // font: "Arial 100px",
          fontSize: '180px',
          // fontFamily: "'Courier New'",
          fontFamily: game.FONT_DEFAULT_NICE,
          // fontFamily: game.FONT_DEFAULT_VIDEOGAME,
          // fontFamily: game.debug.ModeInfinity
          //   ? game.FONT_DEFAULT_NICE
          //   : game.FONT_DEFAULT_VIDEOGAME,
          // fontFamily: "'Press Start 2P'",
          stroke: 'black',
          strokeThickness: 10,
          shadow: {
            offsetX: 0,
            offsetY: 3,
            color: '#000',
            blur: 10,
            stroke: true,
            fill: true,
          },
        }
      )
      .setOrigin(0.5, 0.5)
      .setAlpha(1);
  });
}

function createScoreboardReady(game: SmashedGame): void {
  game.players.forEach((player, playerIndex) => {
    player.scoreBoardReady = game.add
      .text(
        SCREEN_DIMENSIONS.WIDTH / 2,
        SCREEN_DIMENSIONS.HEIGHT / 2,
        player.char.name + ' Ready', //🎮
        {
          // font: "Arial 100px",
          fontSize: '40px',
          fontFamily: 'Impact',
          // fontFamily: game.FONT_DEFAULT,
          // fontFamily: "'Courier New'",
          // fontFamily: "'Press Start 2P'",
          // color: "white",
          color: 'white',
          // color: game.colorCircles[playerIndex].colorString,
          // stroke: player.char.color.primary,
          stroke: 'black',
          strokeThickness: 10,
          shadow: {
            offsetX: 0,
            offsetY: 3,
            color: '#000',
            blur: 10,
            stroke: true,
            fill: true,
          },
        }
      )
      .setOrigin(0.5, 0.5);
  });
}

function createScoreboardController(game: SmashedGame): void {
  game.players.forEach((player, playerIndex) => {
    player.scoreBoardController = game.add
      .text(SCREEN_DIMENSIONS.WIDTH / 2, SCREEN_DIMENSIONS.HEIGHT / 2, '🎮', {
        // font: "Arial 100px",
        fontSize: '300px',
        fontFamily: 'Impact',
        // fontFamily: game.FONT_DEFAULT,
        // fontFamily: "'Courier New'",
        // fontFamily: "'Press Start 2P'",
        // color: "white",
        color: game.colorCircles[playerIndex].colorString,
        // stroke: player.char.color.primary,
        stroke: 'black',
        strokeThickness: 3,
        // fill: game.colorCircles[playerIndex].colorString,
        shadow: {
          offsetX: 0,
          offsetY: 3,
          color: '#000',
          blur: 10,
          stroke: true,
          fill: true,
        },
      })
      .setOrigin(0.5, 0.5);
  });
}

function createScoreboard(game: SmashedGame): void {
  game.scoreBoardTimeGame = game.add.text(
    SCREEN_DIMENSIONS.WIDTH / 2,
    SCREEN_DIMENSIONS.HEIGHT / 2,
    '',
    {
      // font: "Arial 100px",
      fontSize: game.debug.Mode_Infinity ? '45px' : '85px',
      // fontFamily: "'Courier New'",
      // fontFamily: game.FONT_DEFAULT_MONOSPACE,
      fontFamily: game.debug.Mode_Infinity
        ? game.FONT_DEFAULT_NICE
        : game.FONT_DEFAULT_VIDEOGAME,
      // fontFamily: "'Press Start 2P'",
      stroke: 'black',
      strokeThickness: 1,
      shadow: {
        offsetX: 0,
        offsetY: 3,
        color: '#000',
        blur: 10,
        stroke: true,
        fill: true,
      },
    }
  );
  game.scoreBoardTimeGame
    .setOrigin(0.5, 0)
    .setScale(1 / game.cameras.main.zoom, 1 / game.cameras.main.zoom);

  game.scoreBoardTimeTime = game.add.text(
    SCREEN_DIMENSIONS.WIDTH / 2,
    SCREEN_DIMENSIONS.HEIGHT / 2 + 100,
    '',
    {
      fontSize: '20px',
      fontFamily: game.FONT_DEFAULT_VIDEOGAME,
      color: 'white',
      stroke: 'black',
      strokeThickness: 1,
      shadow: {
        offsetX: 0,
        offsetY: 3,
        color: '#000',
        blur: 10,
        stroke: true,
        fill: true,
      },
    }
  );
  game.scoreBoardTimeTime
    .setOrigin(0.5, 1)
    .setScale(1 / game.cameras.main.zoom, 1 / game.cameras.main.zoom)
    .setAlpha(1);

  game.scoreBoardTimeGame.setAlpha(1);
  game.scoreBoardTimeTime.setAlpha(1);

  game.players.forEach((player, playerIndex) => {
    player.scoreBoardUpper = game.add
      .text(
        SCREEN_DIMENSIONS.WIDTH / 2 + game.playerSpawnLocationsX[playerIndex],
        SCREEN_DIMENSIONS.HEIGHT / 2,
        'XXX',
        {
          // font: "Arial 100px",
          fontSize: '45px',
          fontFamily: game.FONT_DEFAULT_NICE,
          // fontFamily: game.FONT_DEFAULT_MONOSPACE,
          // fontFamily: "'Courier New'",
          // fontFamily: "'Press Start 2P'",
          // color: "white",
          color: game.colorCircles[playerIndex].colorString,
          // stroke: player.char.color.primary,
          stroke: 'black',
          strokeThickness: 1,
          shadow: {
            offsetX: 0,
            offsetY: 3,
            color: '#000',
            blur: 10,
            stroke: true,
            fill: true,
          },
        }
      )
      .setOrigin(0.5, 0)
      .setScale(1 / game.cameras.main.zoom, 1 / game.cameras.main.zoom);
  });

  game.players.forEach((player, playerIndex) => {
    player.scoreBoardLower = game.add
      .text(
        SCREEN_DIMENSIONS.WIDTH / 2 + game.playerSpawnLocationsX[playerIndex],
        SCREEN_DIMENSIONS.HEIGHT / 2 + 100,
        'XXX',
        {
          // font: "Arial 100px",
          fontSize: '35px',
          fontFamily: game.FONT_DEFAULT_NICE,
          // fontFamily: "'Courier New'",
          // fontFamily: "'Press Start 2P'",
          // color: "white",
          color: game.colorCircles[playerIndex].colorString,
          // stroke: player.char.color.primary,
          stroke: 'black',
          strokeThickness: 1,
          shadow: {
            offsetX: 0,
            offsetY: 3,
            color: '#000',
            blur: 10,
            stroke: true,
            fill: true,
          },
        }
      )
      .setOrigin(0.5, 1)
      .setScale(1 / game.cameras.main.zoom, 1 / game.cameras.main.zoom);
  });
}

function createCameras(game: SmashedGame): void {
  let debugAlpha = 1;
  if (!game.debug.Cameras_Visible) {
    debugAlpha = 0;
  }

  game.cameraBox.char.sprite = game.physics.add
    .sprite(
      SCREEN_DIMENSIONS.WIDTH / 2,
      SCREEN_DIMENSIONS.HEIGHT / 2,
      'centerWhite'
    )
    .setTintFill(0xff0000)
    .setScale(0.05)
    .setAlpha(debugAlpha);
  game.cameraBox.char.sprite.setImmovable(true);
  game.cameraBox.char.sprite.body.allowGravity = false;

  game.cameraPlayers.char.sprite = game.physics.add
    .sprite(
      SCREEN_DIMENSIONS.WIDTH / 2,
      SCREEN_DIMENSIONS.HEIGHT / 2,
      'centerWhite'
    )
    .setTintFill(0x00ff00)
    .setScale(0.05)
    .setRotation(Math.PI / 4)
    .setAlpha(debugAlpha);
  game.cameraPlayers.char.sprite.setImmovable(true);
  game.cameraPlayers.char.sprite.body.allowGravity = false;
  game.cameraPlayersHalfway.char.sprite = game.physics.add
    .sprite(
      SCREEN_DIMENSIONS.WIDTH / 2,
      SCREEN_DIMENSIONS.HEIGHT / 2,
      'centerWhite'
    )
    .setTintFill(0x0000ff)
    .setRotation(Math.PI / 4)
    .setScale(0.05)
    .setAlpha(debugAlpha);
  game.cameraPlayersHalfway.char.sprite.setImmovable(true);
  game.cameraPlayersHalfway.char.sprite.body.allowGravity = false;

  game.cameraCenter.char.sprite = game.physics.add
    .sprite(
      SCREEN_DIMENSIONS.WIDTH / 2,
      SCREEN_DIMENSIONS.HEIGHT / 2,
      'centerWhite'
    )
    .setTintFill(0xff00ff)
    .setScale(0.05)
    .setRotation(Math.PI / 4)
    .setAlpha(debugAlpha);
  game.cameraCenter.char.sprite.setImmovable(true);
  game.cameraCenter.char.sprite.body.allowGravity = false;

  game.cameraActual.char.sprite = game.physics.add
    .sprite(
      SCREEN_DIMENSIONS.WIDTH / 2,
      SCREEN_DIMENSIONS.HEIGHT / 2,
      'centerWhite'
    )
    .setTintFill(0xffff00)
    .setScale(0.08)
    .setAlpha(debugAlpha)
    .setRotation(Math.PI / 4);
  game.cameraActual.char.sprite.setImmovable(true);
  game.cameraActual.char.sprite.body.allowGravity = false;
}

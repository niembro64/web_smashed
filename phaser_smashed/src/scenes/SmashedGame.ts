import moment, { Moment } from 'moment';
import 'phaser';
import Shake from 'phaser3-rex-plugins/plugins/shakeposition';
import { create } from './create';
import {
  BulletBillCombo,
  Camera,
  CharacterId,
  Chomp,
  Clock,
  ColorCircle,
  Debug,
  EndCup,
  FireFlower,
  Flag,
  GameBoundaryObject,
  GameStateWithTime,
  InputType,
  Lava,
  NNObject,
  Player,
  Position,
  SmashConfig,
  SplashEndData,
  SplashRules,
  emoji,
  keyboard,
  xyVector,
} from './types';
import { preload } from './preload';
import { update } from './update';
import { debugInit } from '../debugInit';

export const SCREEN_DIMENSIONS = { WIDTH: 1920, HEIGHT: 1080 };

export default class SmashedGame extends Phaser.Scene {
  ////////////////////////////////
  ////////// GAME DEBUG
  ////////////////////////////////
  debug!: Debug;

  sessionMoment: Moment = moment();

  nnObjects: NNObject[] = [];

  nnClientRatios: number[] = [];
  nnClientNets: any[] = [];

  nnExpressRatios: number[] = [];
  nnExpressNets: any[] = [];

  ////////////////////////////////
  ////////// GAME CONSTANTS
  ////////////////////////////////
  DURATION_GAME_START: number = 1200;
  DURATION_GAME_PAUSE_MUSIC_SHORT: number = 2000;
  DURATION_GAME_PAUSE_MUSIC_LONG: number = 10000;
  DURATION_GAME_SHOT: number = 4000;
  TEXT_TITLE: any;
  TEXT_SUBTITLE: any;
  TEXT_SUPERTITLE: any;
  TEXT_GAMEBAR_CHARS = {
    kills: ' ⇧💀⇩ ',
    deaths: '',
    damage: emoji.brokenHeart,
    shots: emoji.beer,
  };
  ASSET_BRICK_WIDTH: number = 33;
  ASSET_BRICK_HEIGHT: number = 34;

  SCREEN_SCALE = {
    WIDTH: SCREEN_DIMENSIONS.WIDTH / 1920,
    HEIGHT: SCREEN_DIMENSIONS.HEIGHT / 1080,
  };
  PLATFORMS: any | Phaser.GameObjects.Sprite;
  BACKGROUND: any | Phaser.GameObjects.Sprite;
  BACKGROUND_OUTLINE_FRONT: any | Phaser.GameObjects.Sprite;
  BACKGROUND_OUTLINE_CASTLE: any | Phaser.GameObjects.Sprite;
  BACKGROUND_OUTLINE_LAVA: any | Phaser.GameObjects.Sprite;
  TABLE: any | Phaser.GameObjects.Sprite;
  table_health_give: number = 1;
  powerupActive: boolean = false;
  soundPowerup: any = null;
  afterPauseResumePowerup: boolean = false;
  // spritePole: any | Phaser.GameObjects.Sprite;
  ZOOM_MULTIPLIER_X = 0.95;
  ZOOM_MULTIPLIER_Y = 0.7;
  ZOOM_RATIO_SLOW = 0.999;
  ZOOM_RATIO_FAST = 0.9;
  BORDER_PADDING_X: number = 300; // 200
  BORDER_PADDING_Y: number = 200; // 100
  CAMERA_OFFSET_Y: number = -50;

  FILE_SOUNDS: any = {
    SPIKES: 'spikes.mp3',
    INTRO: 'deep.mp3',
    GUN: 'throw.wav',
    SHOT: 'shot.wav',
    HIT: 'punch.wav',
    JUMP: 'woosh_quiet.mp3',
    JUMP_POWER: 'quick-swhooshing-noise-80898.mp3',
    FIRST_BLOOD: 'first_blood_echo-92250.mp3',
    SQUISH: 'goresplat-7088.mp3',
    DIE: 'sword-hits-the-body-48273.mp3',
    START_LIQUID: 'game-start-liquid.wav',
    START: 'start-reverb.wav',
    READY: 'ready.wav',
    READY_REPEAT: 'ready_repeat.wav',
    READY_REPEAT0: 'ready_0.wav',
    READY_REPEAT1: 'ready_1.wav',
    READY_REPEAT2: 'ready_2.wav',
    READY_REPEAT3: 'ready_3.wav',
    W0: 'w0.wav',
    W1: 'w1.wav',
    W2: 'w2.wav',
    W3: 'w3.wav',
    ENERJA_AH: '/enerja/ah.mp3',
    ENERJA_DO_AGAIN: '/enerja/do_it_again_yeah.mp3',
    ENERJA_FINISH: '/enerja/finishit.mp3',
    ENERJA_GYA: '/enerja/gya.mp3',
    ENERJA_THAT_SHIT: '/enerja/more_than_that_shit_happen.mp3',
    ENERJA_SMASHED: '/enerja/smashed_yes_you_are_ahhhhh.mp3',
    ENERJA_TURTLE: '/enerja/turtle.mp3',
    ENERJA_TWO_SHOTS: '/enerja/two_shots.mp3',
    ENERJA_UGH: '/enerja/ugh.mp3',
    BGM_MII: 'mii.ogg',
    BGM_MII_FIXED: 'mii_with_mods.ogg',
    BGM_DREAM: 'kirby_dreamland.ogg',
    BGM_MONKEY: '/na/monkeys.ogg',
    BGM_ROYKSOP: '/na/macumba_loop.ogg',
    BGM_DMT: '/smashed_dmt.ogg',
    BGM_SHORT: '/garage_short.ogg',
    BGM_GARAGE_REPEAT: '/garage-repeat.ogg',
    CHAIN_CHOMP_ATTACK: '/chain_chomp_sound.wav',
    CHAIN_CHOMP_HURT: '/ChompHurt.mp3',
    CHAIN_CHOMP_SHEEP: 'sheep_up.mp3',
    BOOM_SHORT_01: '/boom_short_01.wav',
    BOOM_SHORT_02: '/boom_short_02.wav',
    BLACK_BETTY_BAMBALAM: '/BlackBetty_Bambalam_Reverb01.mp3',
    BLACK_BETTY_WOAH: '/BlackBetty_Woah_Reverb01.mp3',
    PING: '/ping.wav',
    PING2: '/ping2.wav',
    POP: '/pop.wav',
    POP2: '/pop2.wav',
    FLAG_CAPTURE: 'trumpet-short.wav',
    FLAG_COMPLETE: 'trumpet-medium.wav',
    FLAG_MUSIC_BOX: 'music_box.mp3',
    FIRE_BALL: 'niemo_fireball.wav',
    POWERUP: 'powerup_sheep.wav',
  };

  SOUND_INTRO: any;
  SOUND_GUN: any;
  SOUND_HIT: any;
  SOUND_JUMP_PHYSICAL: any;
  SOUND_JUMP_ENERGY: any;
  SOUND_FIRST_BLOOD: any;
  SOUND_SQUISH: any;
  SOUND_DIE: any;
  SOUND_START_LIQUID: any;
  SOUND_START: any;
  SOUND_READY: any;
  SOUND_READY_REPEAT: any;
  SOUND_READY_REPEAT0: any;
  SOUND_READY_REPEAT1: any;
  SOUND_READY_REPEAT2: any;
  SOUND_READY_REPEAT3: any;
  W0: any;
  W1: any;
  W2: any;
  W3: any;
  ENERJA_AH: any;
  ENERJA_DO_AGAIN: any;
  ENERJA_FINISH: any;
  ENERJA_GYA: any;
  ENERJA_HAPPEN: any;
  ENERJA_SMASHED: any;
  ENERJA_TURTLE: any;
  ENERJA_TWO_SHOTS: any;
  ENERJA_UGH: any;
  SOUND_PAUSED: any;
  soundBGM: any;
  afterPauseResumeMusicBGM: boolean = false;
  SOUND_GARAGE_REPEAT: any;

  ////////////////////////////////
  ////////// GAME VARIABLES
  ////////////////////////////////
  smashConfig: SmashConfig | null = null;
  loaded: boolean = false;
  readyLocationLROffset: number = 0;
  glassLocationLROffset: number = 0;
  upperTextLocationLROffset: number = 0;
  lowerTextLocationLROffset: number = 0;
  textLocations: number[] = [-700, -400, 400, 700];
  numDead: number = 0;
  numDeadPrev: number = 0;
  cameraMoverZoomStatusKeeper: number = 1;
  motionSlowdown: number = 1;

  // TIME
  scoreBoardTimeGame: any;
  scoreBoardTimeTime: any;
  timeNanoseconds: number = 0;
  timeSeconds: number = 0;
  timeSecondsPrev: number = 0;
  timeSecondsClock: number = 0;
  timeClock: Clock = { minutes: 0, seconds: 0 };
  gameNanoseconds: number = 0;
  gameSeconds: number = 0;
  gameSecondsPrev: number = 0;
  gameSecondsClock: number = 10;
  gameClock: Clock = { minutes: 0, seconds: 0 };
  timer: any;

  // SHOTS
  shotsLeftCurr: number = 0;
  shotsLeftPrev: number = 0;
  ////////////////////////////////
  ////////// GAMEPAD CONSTANTS
  ////////////////////////////////

  GAMEPAD_HAT_VALUES: number[] = [];
  GAMEPAD_DEBOUNCE_NUMBER_CYCLES: number = 9;

  ////////////////////////////////
  ////////// GAMEPAD VARIABLES
  ////////////////////////////////

  ////////////////////////////////
  ////////// PLAYER CONSTANTS
  ////////////////////////////////
  DURATION_PLAYER_HURT: number = 1000;
  durationPlayerDeadInCloud: number | null = null;
  DURATION_PLAYER_FILTER_FLICKER_SLOW: number = this.DURATION_PLAYER_HURT / 10;
  DURATION_PLAYER_FILTER_FLICKER_FAST: number =
    this.DURATION_PLAYER_FILTER_FLICKER_SLOW * 0.5;

  RATIO_ACCELERATION_VELOCITY = 0.85;
  // DEFAULT_PLAYER_HITBACK: any = { x: 0.03, y: -0.03 };
  DEFAULT_ATTACK_HITBACK: any = { x: 0.1, y: -0.1 };
  DEFAULT_ATTACK_DAMAGE: number = 50;
  BASE_PLAYER_SPEED: xyVector = { x: 900, y: 30 };
  // BASE_PLAYER_SPEED: Vector = { x: 600, y: 30 };
  BASE_PLAYER_JUMP_PHYSICAL: number = -1000;
  BASE_PLAYER_JUMP_ENERGY: number = -600;
  BASE_PLAYER_JUMP_WALL: number = -1 * this.BASE_PLAYER_JUMP_PHYSICAL;
  BASE_PLAYER_INITIAL_POSITION = { POSITION: { PLAYER_Y: 250 } };
  BASE_PLAYER_GRAVITY: number = 0.1;
  BASE_PLAYER_HITBACK: xyVector = { x: 120, y: 90 };
  basePlayerHitbackGameMultiplier: number = 1;
  BASE_PLAYER_ATTACKENERGY: xyVector = { x: 600, y: 600 };

  ////////////////////////////////
  ////////// PLAYER VARIRABLES
  ////////////////////////////////
  playerChoicesCharacterType: CharacterId[] = [];
  playerChoicesInputType: InputType[] = [];
  // playerSpawnOrder: number[] = [2, 0, 1, 3];
  playerSpawnOrder: number[] = [0, 1, 2, 3];
  playerSpawnLocationsX: number[] = [-165, -100, 100, 165];
  playerSpawnLocationsY: number[] = [400, 400, 400, 400];
  allPlayersWallTouchIterator: number = 0; // need to update

  ////////////////////////////////
  ////////// OTHER
  ////////////////////////////////

  shake: Shake | undefined;
  //▲▼⬆⬇↑↓↑↿⇂⋆★✰☆⚡❤v♡♥
  // 💔👊🏼⭐💀
  // ✔️🚧❌🚫🛑🍻🔜📄📋⚙️🚪⛔⌚🕹️🎮☠️
  // 👾💣🔥💀👊🤜🎰🎱🎲🔮💡🧱✨🧙 🤜🏼👊🏼🤛🏼
  //🏴‍☠️🏳️🏁🏴
  // 🔴🔵🟡🟢🟣🟠⚫⚪🟤

  circleOffset: number = -50;
  colorCircles: ColorCircle[] = [
    {
      text: '🔴',
      graphic: null,
      colorNumber: 0xe81224,
      colorString: '#e81224',
    },
    {
      text: '🔵',
      graphic: null,
      colorNumber: 0x0078d7,
      colorString: '#0078d7',
    },
    {
      text: '🟡',
      graphic: null,
      colorNumber: 0xfff100,
      colorString: '#fff100',
    },
    {
      text: '🟢',
      graphic: null,
      colorNumber: 0x16c60c,
      colorString: '#16c60c',
    },
    {
      text: '🟣',
      graphic: null,
      colorNumber: 0x886ce4,
      colorString: '#886ce4',
    },
    {
      text: '🟠',
      graphic: null,
      colorNumber: 0xf7630c,
      colorString: '#f7630c',
    },
    {
      text: '⚫',
      graphic: null,
      colorNumber: 0x383838,
      colorString: '#383838',
    },
    {
      text: '⚪',
      graphic: null,
      colorNumber: 0xf2f2f2,
      colorString: '#f2f2f2',
    },
    {
      text: '🟤',
      graphic: null,
      colorNumber: 0x8e562e,
      colorString: '#8e562e',
    },
  ];
  FONT_DEFAULT_NICE: string = 'Impact';
  FONT_DEFAULT_VIDEOGAME: string = '"Press Start 2P"';
  FONT_DEFAULT_MONOSPACE: string = 'Consolas';
  // FONT_DEFAULT: string = 'Courier';

  splashRulesOffset: number = 50;
  splashRules: SplashRules[] = [
    {
      text: null,
      name: 'splash-black',
      word: 'BLACK',
      color: '#00000000',
      // backgroundColor: '#101018',
      // backgroundColor: '#111111ff',
      backgroundColor: '#000000ff',
      shadowColor: '#11111100',
      size: '300px',
      src: 'glass.png',
      strokeThickness: SCREEN_DIMENSIONS.WIDTH,
    },
    {
      text: null,
      name: 'splash-start',
      word: 'START',
      color: '#AAAAAA',
      backgroundColor: '#00000000',
      shadowColor: 'black',
      size: '370px',
      src: 'glass.png',
      strokeThickness: 10,
    },
    {
      text: null,
      name: 'splash-paused',
      word: 'PAUSED',
      color: '#003300',
      backgroundColor: '#00AA00',
      shadowColor: 'black',
      size: '570px',
      src: 'glass.png',
      strokeThickness: 10,
    },
    {
      text: null,
      name: 'splash-first-blood',
      word: 'FIRST BLOOD',
      color: '#330000',
      backgroundColor: '#FF0000',
      shadowColor: 'black',
      size: '370px',
      src: 'glass.png',
      strokeThickness: 10,
    },
    {
      text: null,
      name: 'splash-screen-clear',
      word: 'SCREEN CLEAR',
      color: '#330033',
      backgroundColor: '#bb44bb',
      shadowColor: 'black',
      size: '330px',
      src: 'glass.png',
      strokeThickness: 10,
    },
    {
      text: null,
      name: 'splash-captured-flag',
      word: 'FLAG SHOTS',
      color: '#003377',
      backgroundColor: '#225599',
      shadowColor: 'black',
      size: '370px',
      src: 'glass.png',
      strokeThickness: 10,
    },
    {
      text: null,
      name: 'splash-cool-down',
      word: 'COOLDOWN PERIOD',
      color: '#ffffff',
      backgroundColor: '#00000000',
      shadowColor: 'black',
      size: '200px',
      src: 'glass.png',
      strokeThickness: SCREEN_DIMENSIONS.WIDTH,
    },
    {
      text: null,
      name: 'splash-finished',
      word: 'FINISHED',
      color: '#ffffff',
      backgroundColor: '#000000ff',
      shadowColor: 'black',
      size: '500px',
      src: 'glass.png',
      strokeThickness: SCREEN_DIMENSIONS.WIDTH,
    },
  ];

  splashSizeTitleDefault = '40px';
  splashEndDataOffset: number = -1100;
  SplashEndDataInit: SplashEndData = {
    textTitle: '',
    textCircles: '',
    textData: '',
    name: '',
    emoji: '',
    words: [],
    vertical: 0,
    size: '32px',
    src: 'glass.png',
    color: '#ffffff',
    backgroundColor: '#000000',
    strokeThickness: 5,
    offsetY: 0,
    blur: 5,
  };
  splashesEndData: SplashEndData[] = [
    {
      textTitle: null,
      textCircles: null,
      textData: null,
      name: 'Hits',
      emoji: emoji.punch,
      vertical: 0,
      words: [],
      color: this.SplashEndDataInit.color,
      backgroundColor: this.SplashEndDataInit.backgroundColor,
      size: this.SplashEndDataInit.size,
      src: this.SplashEndDataInit.src,
      strokeThickness: this.SplashEndDataInit.strokeThickness,
      offsetY: this.SplashEndDataInit.offsetY,
      blur: this.SplashEndDataInit.blur,
    },
    {
      textTitle: null,
      textCircles: null,
      textData: null,
      name: 'Deaths',
      emoji: emoji.skull,
      vertical: 0,
      words: [],
      color: this.SplashEndDataInit.color,
      backgroundColor: this.SplashEndDataInit.backgroundColor,
      size: this.SplashEndDataInit.size,
      src: this.SplashEndDataInit.src,
      strokeThickness: this.SplashEndDataInit.strokeThickness,
      offsetY: this.SplashEndDataInit.offsetY,
      blur: this.SplashEndDataInit.blur,
    },
    {
      textTitle: null,
      textCircles: null,
      textData: null,
      name: 'Shots',
      emoji: emoji.beer,
      vertical: 0,
      words: [],
      color: this.SplashEndDataInit.color,
      backgroundColor: this.SplashEndDataInit.backgroundColor,
      size: this.SplashEndDataInit.size,
      src: this.SplashEndDataInit.src,
      strokeThickness: this.SplashEndDataInit.strokeThickness,
      offsetY: this.SplashEndDataInit.offsetY,
      blur: this.SplashEndDataInit.blur,
    },
    {
      textTitle: null,
      textCircles: null,
      textData: null,
      name: 'Characters',
      emoji: '',
      words: [],
      vertical: 0,
      color: this.SplashEndDataInit.color,
      backgroundColor: this.SplashEndDataInit.backgroundColor,
      size: this.SplashEndDataInit.size,
      src: this.SplashEndDataInit.src,
      strokeThickness: this.SplashEndDataInit.strokeThickness,
      offsetY: this.SplashEndDataInit.offsetY,
      blur: this.SplashEndDataInit.blur,
    },
  ];

  cameraPlayers: Camera = {
    char: {
      name: 'center_10',
      src: 'images/x.png',
      sprite: null,
      zoom: 0,
    },
  };
  cameraActual: Camera = {
    char: {
      name: 'center_10',
      src: 'images/x.png',
      sprite: null,
      zoom: 0,
    },
  };
  cameraPlayersHalfway: Camera = {
    char: {
      name: 'center_80',
      src: 'images/x.png',
      sprite: null,
      zoom: 0,
    },
  };
  cameraCenter: Camera = {
    char: {
      name: 'center_80',
      src: 'images/x.png',
      sprite: null,
      zoom: 0,
    },
  };
  cameraBox: Camera = {
    char: {
      name: 'center_80',
      src: 'images/x.png',
      sprite: null,
      zoom: 0,
    },
  };

  // i : player acted upon
  // j : attacks from other players
  overlappingPlayerIAttackPhysicalJ: boolean[][] = [];
  overlappingPlayerIAttackEnergyJ: boolean[][] = [];
  wasLastHitByMatrix: boolean[][] = [];
  numberHitByMatrix: number[][] = [];
  numberKilledByMatrix: number[][] = [];
  numberShotsTakenByMeMatrix: number[][] = [];

  colliderPvP: any[][] = [];
  colliderPvAP: any[][] = [];
  colliderPvAE: any[][] = [];
  colliderAEvAE: any[][] = [];
  colliderAEvAP: any[][] = [];

  gameState: GameStateWithTime = {
    nameCurr: 'game-state-start',
    gameStampCurr: 0,
    timeStampCurr: 0,
    namePrev: 'game-state-start',
    gameStampPrev: 0,
    timeStampPrev: 0,
  };
  keyboardHandPositions: keyboard[] = [
    {
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      A: Phaser.Input.Keyboard.KeyCodes.F,
      X: Phaser.Input.Keyboard.KeyCodes.G,
      B: Phaser.Input.Keyboard.KeyCodes.H,
      Y: Phaser.Input.Keyboard.KeyCodes.SPACE,
      L: Phaser.Input.Keyboard.KeyCodes.R,
      R: Phaser.Input.Keyboard.KeyCodes.U,
      start: Phaser.Input.Keyboard.KeyCodes.Y,
      select: Phaser.Input.Keyboard.KeyCodes.T,
    },
    {
      up: Phaser.Input.Keyboard.KeyCodes.UP,
      down: Phaser.Input.Keyboard.KeyCodes.DOWN,
      left: Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      A: Phaser.Input.Keyboard.KeyCodes.NUMPAD_FOUR,
      X: Phaser.Input.Keyboard.KeyCodes.NUMPAD_FIVE,
      B: Phaser.Input.Keyboard.KeyCodes.NUMPAD_SIX,
      Y: Phaser.Input.Keyboard.KeyCodes.NUMPAD_ZERO,
      L: Phaser.Input.Keyboard.KeyCodes.NUMPAD_SEVEN,
      R: Phaser.Input.Keyboard.KeyCodes.NUMPAD_ADD,
      start: Phaser.Input.Keyboard.KeyCodes.NUMPAD_NINE,
      select: Phaser.Input.Keyboard.KeyCodes.NUMPAD_EIGHT,
    },
  ];

  pit = {
    left: SCREEN_DIMENSIONS.WIDTH * (17 / 34),
    right: SCREEN_DIMENSIONS.WIDTH * (23 / 34),
    middle: SCREEN_DIMENSIONS.WIDTH * (19.5 / 34),
    top: SCREEN_DIMENSIONS.HEIGHT * (12 / 19),
    lower: SCREEN_DIMENSIONS.HEIGHT * (17 / 19),
  };

  lavas: Lava[] = [
    {
      sprite: null,
      sound: null,
      particles: null,
      width: 256,
      height: 39,
      rate: 5,
      numFrames: 16,
    },
    {
      sprite: null,
      sound: null,
      particles: null,
      width: 256,
      height: 39,
      rate: 5,
      numFrames: 16,
    },
    {
      sprite: null,
      sound: null,
      particles: null,
      width: 256,
      height: 39,
      rate: 5,
      numFrames: 16,
    },
    {
      sprite: null,
      sound: null,
      particles: null,
      width: 256,
      height: 39,
      rate: 5,
      numFrames: 16,
    },
    {
      sprite: null,
      sound: null,
      particles: null,
      width: 256,
      height: 39,
      rate: 5,
      numFrames: 16,
    },
    {
      sprite: null,
      sound: null,
      particles: null,
      width: 256,
      height: 39,
      rate: 5,
      numFrames: 16,
    },
    {
      sprite: null,
      sound: null,
      particles: null,
      width: 256,
      height: 39,
      rate: 5,
      numFrames: 16,
    },
    {
      sprite: null,
      sound: null,
      particles: null,
      width: 256,
      height: 39,
      rate: 5,
      numFrames: 16,
    },
    {
      sprite: null,
      sound: null,
      particles: null,
      width: 256,
      height: 39,
      rate: 5,
      numFrames: 16,
    },
    {
      sprite: null,
      sound: null,
      particles: null,
      width: 256,
      height: 39,
      rate: 5,
      numFrames: 16,
    },
    {
      sprite: null,
      sound: null,
      particles: null,
      width: 256,
      height: 39,
      rate: 5,
      numFrames: 16,
    },
    {
      sprite: null,
      sound: null,
      particles: null,
      width: 256,
      height: 39,
      rate: 5,
      numFrames: 16,
    },
    {
      sprite: null,
      sound: null,
      particles: null,
      width: 256,
      height: 39,
      rate: 5,
      numFrames: 16,
    },
  ];

  flashActiveMs: number = 50;
  flashCooldownMs: number = 1000;

  chompX: number = 635;
  chompY: number = 964;
  chomp: Chomp = {
    sprite: null,
    damage: 0,
    originX: this.chompX,
    originY: this.chompY,
    radius: 300,
    tintMuted: 0x7f7f7f,
    tintNormal: 0xffffff,
    percentFramesAttack: 0.1,
    scaleLinksNormal: 0.5,
    scaleLinksMad: 0.5 * 1.5,
    scaleChompNormal: 2,
    scaleChompMad: 3,
    percentFramesWalk: 0.01,
    NUM_LINKS: 12,
    explosionFPS: 20,
    MASS: 10,
    links: [],
    block: {
      sprite: null,
      x: this.chompX,
      y: this.chompY,
    },
    soundAttack: null,
    soundHurt: null,
    soundSheep: null,
    afterPauseResumeSoundSheep: false,
    soundBBWoah: null,
    soundBBBambalam: null,
    powerStateCurr: { name: 'none', gameStamp: 0 },
    powerStatePrev: { name: 'none', gameStamp: 0 },
    particles: null,
    musicRates: {
      chomp: 12,
      player: 18,
    },
    emitterDark: null,
    darknessMoments: {
      chomp: 0,
      passed: 0,
      percentExplosion: 0.01,
      explosionsIndex: 0,
      explosions: [
        { sprite: null, sound: null },
        { sprite: null, sound: null },
        { sprite: null, sound: null },
      ],
      explosionsFront: [
        { sprite: null, sound: null },
        { sprite: null, sound: null },
        { sprite: null, sound: null },
      ],
    },
  };

  percentOfScreen: Position = {
    x: 1 / SCREEN_DIMENSIONS.WIDTH,
    y: 1 / SCREEN_DIMENSIONS.HEIGHT,
  };

  flagPlatformTopLeft: Position = {
    x: SCREEN_DIMENSIONS.WIDTH * 0.86,
    y: SCREEN_DIMENSIONS.HEIGHT * 0.67,
  };

  flagStairsBottom: Position = {
    x: this.flagPlatformTopLeft.x - 385,
    y: this.flagPlatformTopLeft.y + 385,
  };

  gamePathPoints: Position[] = [
    {
      x: SCREEN_DIMENSIONS.WIDTH * this.percentOfScreen.x,
      y: SCREEN_DIMENSIONS.HEIGHT * this.percentOfScreen.y,
    },
    {
      x: SCREEN_DIMENSIONS.WIDTH * (1 - this.percentOfScreen.x),
      y: SCREEN_DIMENSIONS.HEIGHT * this.percentOfScreen.y,
    },
    {
      x: SCREEN_DIMENSIONS.WIDTH * (1 - this.percentOfScreen.x),
      y: this.flagPlatformTopLeft.y,
    },

    {
      x: this.flagPlatformTopLeft.x,
      y: this.flagPlatformTopLeft.y,
    },

    {
      x: this.flagStairsBottom.x,
      y: this.flagStairsBottom.y,
    },
    {
      x: SCREEN_DIMENSIONS.WIDTH * 0.49,
      y: this.flagStairsBottom.y,
    },
    {
      x: SCREEN_DIMENSIONS.WIDTH * 0.49,
      y: this.flagStairsBottom.y - 120,
    },
    {
      x: SCREEN_DIMENSIONS.WIDTH * 0.28,
      y: this.flagStairsBottom.y - 120,
    },
    {
      x: SCREEN_DIMENSIONS.WIDTH * 0.16,
      y: this.flagStairsBottom.y - 120,
    },
    // {
    //   x: SCREEN_DIMENSIONS.WIDTH * 0.16,
    //   y: this.flagStairsBottom.y,
    // },
    {
      x: SCREEN_DIMENSIONS.WIDTH * 0.16,
      y: this.flagStairsBottom.y,
    },
    {
      x: SCREEN_DIMENSIONS.WIDTH * this.percentOfScreen.x,
      y: this.flagStairsBottom.y,
    },
  ];

  gameBoundaryPath: GameBoundaryObject = {
    pathPoints: this.gamePathPoints,
    graphics: null,
  };

  bbPathPoints: Position[] = [
    {
      x: SCREEN_DIMENSIONS.WIDTH * 0.7285,
      y: SCREEN_DIMENSIONS.HEIGHT * 0.399,
    },
    { x: SCREEN_DIMENSIONS.WIDTH * 0.7285, y: SCREEN_DIMENSIONS.HEIGHT * 0.66 },
    { x: SCREEN_DIMENSIONS.WIDTH * 0.645, y: SCREEN_DIMENSIONS.HEIGHT * 0.825 },
    { x: SCREEN_DIMENSIONS.WIDTH * 0.42, y: SCREEN_DIMENSIONS.HEIGHT * 0.825 },
    { x: SCREEN_DIMENSIONS.WIDTH * 0.42, y: SCREEN_DIMENSIONS.HEIGHT * 0.95 },

    { x: SCREEN_DIMENSIONS.WIDTH * 0.15, y: SCREEN_DIMENSIONS.HEIGHT * 0.95 },

    // { x: SCREEN_DIMENSIONS.WIDTH * 0.1, y: SCREEN_DIMENSIONS.HEIGHT * 0.95 },

    { x: SCREEN_DIMENSIONS.WIDTH * 0.03, y: SCREEN_DIMENSIONS.HEIGHT * 0.95 },
    { x: SCREEN_DIMENSIONS.WIDTH * 0.03, y: SCREEN_DIMENSIONS.HEIGHT * 0.674 },
  ];

  updateIndex: number = 0;
  bbScale: number = 0.63 * 3;

  bbCannonInitX: number = -4 * this.ASSET_BRICK_WIDTH;
  bbCannonPosInitY: number =
    SCREEN_DIMENSIONS.HEIGHT * 0.367 + 6 * this.ASSET_BRICK_HEIGHT;

  bbBulletInitX: number = -10 * this.ASSET_BRICK_WIDTH;
  bbBulletInitY: number = this.bbCannonPosInitY - 166;

  bulletBillCombo: BulletBillCombo = {
    stateCurr: 'button-up',
    statePrev: 'init',
    towerCenter: {
      scale: 0.6,
      sprite: null,
      posInit: {
        x: SCREEN_DIMENSIONS.WIDTH * 0.42,
        y: SCREEN_DIMENSIONS.HEIGHT * 0.837,
      },
    },
    towerLeft: {
      scale: 0.6,
      sprite: null,
      posInit: {
        x: SCREEN_DIMENSIONS.WIDTH * 0.012,
        y: SCREEN_DIMENSIONS.HEIGHT * 0.95,
      },
    },
    button: {
      distanceTrigger: 70,
      spriteDown: null,
      spriteUp: null,
      afterPauseResumeButtonSound: false,
      sound: null,
      scale: 0.11,
      playerIndexPressing: null,
      posInit: {
        x: 1400.5,
        y: 429,
      },
    },
    sparkLine: {
      graphics: null,
      emitter: null,
      speed: 0.03,
      particles: null,
      spark: null,
      percentPathCurrCompleted: 0,
      pathPoints: this.bbPathPoints,
      pathPointsIndexCurr: 0,
    },
    bullet: {
      scale: this.bbScale,
      sprite: null,
      playerIndexOwns: null,
      sprites_colored: [],
      sound: null,
      explosionSprite: null,
      explosionPosInit: {
        x: this.bbBulletInitX + 300,
        y: this.bbBulletInitY + 200,
      },
      mass: 1000,
      damage: 100,
      hitback: { x: 17, y: 17 },
      diesOnHitbox: false,
      srcImage: 'bullet_bill_bullet',
      posInit: {
        x: this.bbBulletInitX,
        y: this.bbBulletInitY,
      },
      velInit: {
        x: 300,
        y: 0,
      },
    },
    cannon: {
      scale: this.bbScale,
      sprite: null,
      sound: null,
      srcImage: 'bullet_bill_cannon',
      posInit: {
        x: this.bbCannonInitX,
        y: this.bbCannonPosInitY,
      },
    },
    shootingDistanceThreshold: 500,
    numUpdateIndexesToWait: 6,
    numUpdateIndexesToWaitFast: 1,
  };

  fireFlower: FireFlower = {
    sprite: null,
    hitback: { x: 10, y: 10 },
    doNextHighTrajectory: false,
    srcImage: 'bulletFireBall',
    diesOnHitbox: true,
    damage: 10,
    rotation: {
      initial: 0.25,
      speed: 400,
    },
    shootingDistanceThreshold: 500,
    numUpdateIndexesToWait: 10,
    // numUpdateIndexesToWait: 6,
    numUpdateIndexesToWaitFast: 3,
    fireBallSounds: [],
    fireBallSoundsIndexCurr: 0,
    attackBullets: {
      bullets: null,
      NUMBER_BULLETS: 16,
      soundB1: null,
      soundB2: null,
      soundP1: null,
      soundP2: null,
      sB1: 'ping',
      vB1: 0.01,
      sB2: 'ping2',
      vB2: 0.01,
      sP1: 'pop',
      vP1: 0.03,
      sP2: 'pop2',
      vP2: 0.03,
    },
    posInit: {
      x: SCREEN_DIMENSIONS.WIDTH * 0.18573,
      y: SCREEN_DIMENSIONS.HEIGHT * 0.3356,
    },
  };

  flagBoxTop: number = 0.382 * SCREEN_DIMENSIONS.HEIGHT;
  flagBoxBottom: number = 0.561 * SCREEN_DIMENSIONS.HEIGHT;
  flagBoxHeight: number = this.flagBoxBottom - this.flagBoxTop;
  flag: Flag = {
    flagSpeedDark: 250,
    flagSpeed: 80,
    yPositionInit: (this.flagBoxBottom + this.flagBoxTop) / 2,
    box: {
      top: this.flagBoxTop,
      bottom: this.flagBoxBottom,
      left: SCREEN_DIMENSIONS.WIDTH * 0.8,
      right: SCREEN_DIMENSIONS.WIDTH * 0.9,
    },
    poleTouchStamps: [],
    toucherCurr: { id: null, gameStamp: Infinity },
    toucherPrev: { id: null, gameStamp: Infinity },
    ownerCurr: { id: null, gameStamp: Infinity },
    ownerPrev: { id: null, gameStamp: Infinity },
    flagStateCurr: 'flag-not-completed',
    flagStatePrev: 'flag-not-completed',
    spriteFlagMover: null,
    spriteFlagStationary: null,
    spriteFlagChar: null,
    spriteFlagPole: null,
    afterPauseResumeMusicFlagMusicBox: false,
    soundFlagCapture: null,
    soundFlagMusicBox: null,
    soundFlagComplete: null,
    firework: null,
    flagButton: {
      scale: 0.11,
      spriteDown: null,
      spriteUp: null,
      // posInit: {
      //   x: 1400.5,
      //   y: 429,
      // },
      posInit: {
        x: this.chompX,
        y: this.chompY,
      },
      playerIndexPressing: null,
    },
    flagSpikes: {
      sprite: null,
      posDown: {
        x: SCREEN_DIMENSIONS.WIDTH * 0.8935,
        y: SCREEN_DIMENSIONS.HEIGHT * 0.635 + 50,
      },
      posUp: {
        x: SCREEN_DIMENSIONS.WIDTH * 0.8935,
        y: SCREEN_DIMENSIONS.HEIGHT * 0.635,
      },
      state: 'spikes-down',
      scale: 0.5,
      sound: undefined,
    },
  };

  endCups: EndCup[] = [];

  players: Player[] = [];
  playerOptions: Player[] = [
    {
      playerId: 0,
      emitterGamestamp: null,
      emitterLight: null,
      emitterDark: null,
      emitterPlayer: null,
      emitterHurt: null,
      particles: null,
      particlesShield: null,
      shotGlassImage: null,
      shotGlassNumber: null,
      killCount: 0,
      deathCount: 0,
      shotCountCurr: 0,
      shotCountPrev: 0,
      scoreBoardUpper: '',
      scoreBoardLower: '',
      scoreBoardReady: 'READY',
      scoreBoardController: 'X',
      circleOffset: 0,
      state: { name: 'player-state-start', gameStamp: 0, timeStamp: 0 },
      char: {
        name: debugInit.Nintendo_Sprites ? 'Mario' : 'Monkee',
        initializeCharPosition: {
          x: -200,
          y: 100,
        },
        colorFilterBlink: false,
        src: 'images/character_0_cropped.png',
        scaleCharSpriteReality: 1,
        scaleCharSpriteImage: 1,
        sprite: null,
        srcSpriteSheet: debugInit.Nintendo_Sprites
          ? 'images/sprite_sheet_8.1_mario_4x.png'
          : 'images/sprite_sheet_8.1_monke_4x.png',
        runRate: 1,
        spriteSize: {
          width: 16,
          height: 16,
        },
        ssCurr: {
          name: 'idle',
          timeStamp: 0,
        },
        ssPrev: {
          name: 'idle',
          timeStamp: 0,
        },
        zoom: 1,
        vel: { x: 0, y: 0 },
        pos: { x: 0, y: 0 },
        jumps: [1, 0.8, 0],
        jumpPower: 1,
        jumpIndex: 0,
        jumpFloat: 1,
        upB: { canUse: false, x: 0.5, y: -1, speedMultiplier: 1 },
        damageCurr: 0,
        damagePrev: 0,
        speed: 0.8,
        fast: 1,
        friction_ground: 0.5,
        friction_air: 0.02, // .02
        wallTouchArray: [],
        lastDirectionTouched: null,
        attackPhysical: {
          sprite: null,
          state: {
            name: 'attackphysical-state-off',
            gameStamp: 0,
            timeStamp: 0,
          },
          durationAttack: 200,
          durationCooldown: 300,
          posFromCenter: { x: 50, y: -10 },
          damage: 50,
          hitback: { x: 0.2, y: 0 },
          srcImage: 'fist-gray',
          mass: 10,
          scale: 0.1,
          audio: null,
        },
        attackEnergy: {
          diesOnHitbox: true,
          sprite: null,
          state: 'released',
          timestampThrow: 0,
          durationCooldown: 1000,
          posFromCenter: { x: 20, y: -30 },
          friction: {
            ground: 1,
            wallInvertRotation: true,
            wallInvertSprite: true,
            air: 1,
          },
          VEL: { x: 1, y: 1 },
          velPrevX: 0,
          velPrevY: 0,
          accX: 0,
          accY: 0,
          srcImage: 'fireball',
          bounceY: 1,
          bounceX: 1,
          gravity: true,
          bouncePlatforms: true,
          damage: 10,
          hitback: { x: 0.01, y: -0.01 },
          scale: 1,
          mass: 0.5,
          allowVelocityY: true,
          rotation: {
            initial: 0.25,
            speed: 400,
          },
          followOnOffscreen: false,
          followOnOffscreenOffset: { x: 0, y: 0 },
          offscreenCurr: false,
          offscreenPrev: false,
          findAndFollowAcceleration: { x: 0, y: 0 },
          ON_SCREEN_PREVENT_ATTACK_PHYSICAL: false,
          attackBullets: null,
        },
        shield: null,
        powerStateCurr: { name: 'none', gameStamp: 0 },
        powerStatePrev: { name: 'none', gameStamp: 0 },
      },
      inputType: 0,
      keyboard: null,
      gamepad: null,
      LRGameStamp: null,
      padCurr: {
        up: false,
        down: false,
        left: false,
        right: true,
        A: false,
        B: false,
        X: false,
        Y: false,
        R: false,
        L: false,
        start: false,
        select: false,
      },
      padPrev: {
        up: false,
        down: false,
        left: false,
        right: true,
        A: false,
        B: false,
        X: false,
        Y: false,
        R: false,
        L: false,
        start: false,
        select: false,
      },
      padDebounced: {
        up: 0,
        down: 0,
        left: 0,
        right: 0,
        A: 0,
        B: 0,
        X: 0,
        Y: 0,
        L: 0,
        R: 0,
        start: 0,
        select: 0,
      },
      playerReadySound: null,
      endPlace: 0,
      controllerButtonPresses: {
        up: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        down: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        left: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        right: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        A: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        B: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        X: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        Y: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        R: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        L: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        start: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        select: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
      },
      averagePositionXY: {
        x: { positionAverage: 0, positionSum: 0, positionCount: 0 },
        y: { positionAverage: 0, positionSum: 0, positionCount: 0 },
      },
      nnRating: null,
      maxPositionsXY: {
        x: {
          start: SCREEN_DIMENSIONS.WIDTH / 2,
          end: SCREEN_DIMENSIONS.WIDTH / 2,
        },
        y: {
          start: SCREEN_DIMENSIONS.HEIGHT / 2,
          end: SCREEN_DIMENSIONS.HEIGHT / 2,
        },
      },
    },
    {
      playerId: 1,
      emitterGamestamp: null,
      emitterLight: null,
      emitterDark: null,
      emitterPlayer: null,
      emitterHurt: null,
      particles: null,
      particlesShield: null,
      shotGlassImage: null,
      shotGlassNumber: null,
      killCount: 0,
      deathCount: 0,
      shotCountCurr: 0,
      shotCountPrev: 0,
      circleOffset: 0,
      scoreBoardUpper: '',
      scoreBoardLower: '',
      scoreBoardReady: 'READY',
      scoreBoardController: 'X',
      state: { name: 'player-state-start', gameStamp: 0, timeStamp: 0 },
      char: {
        name: debugInit.Nintendo_Sprites ? 'Link' : 'Kaitlyn',
        initializeCharPosition: {
          // lookingRight: false,
          x: -110,
          y: 100,
        },
        // color: {
        //   primary: '#43a528',
        //   secondary: '#e24800',
        //   dark: '#1c0900',
        //   light: '#ffffff',
        // },
        colorFilterBlink: false,
        src: 'images/character_1_cropped.png',
        scaleCharSpriteReality: 1,
        scaleCharSpriteImage: 1,
        sprite: null,
        srcSpriteSheet: debugInit.Nintendo_Sprites
          ? 'images/sprite_sheet_8.1_link_4x.png'
          : 'images/sprite_sheet_8.1_kaitlyn_4x.png',
        runRate: 1,
        spriteSize: {
          width: 16,
          height: 16,
        },
        ssCurr: {
          name: 'idle',
          timeStamp: 0,
        },
        ssPrev: {
          name: 'idle',
          timeStamp: 0,
        },
        zoom: 1,
        vel: { x: 0, y: 0 },
        pos: { x: 0, y: 0 },
        // acc: { x: 0, y: 0 },
        jumps: [1, 0.8, 0],
        jumpPower: 0.9,
        jumpIndex: 0,
        jumpFloat: 1,
        upB: { canUse: false, x: 0.5, y: -1, speedMultiplier: 0.8 },
        damageCurr: 0,
        damagePrev: 0,
        speed: 0.7,
        fast: 1,
        friction_ground: 0.5,
        friction_air: 0.03,
        wallTouchArray: [],
        lastDirectionTouched: null,
        attackPhysical: {
          sprite: null,
          state: {
            name: 'attackphysical-state-off',
            gameStamp: 0,
            timeStamp: 0,
          },
          durationAttack: 200,
          durationCooldown: 300,
          posFromCenter: { x: 40, y: 3 },
          damage: 50,
          hitback: { x: 0.2, y: 0 },
          srcImage: 'sword',
          mass: 10,
          scale: 0.9,
          audio: null,
        },
        attackEnergy: {
          diesOnHitbox: false,
          sprite: null,
          state: 'released',
          timestampThrow: 0,
          durationCooldown: 1000,
          posFromCenter: { x: 40, y: 3 },
          friction: {
            ground: 1,
            wallInvertRotation: false,
            wallInvertSprite: false,
            air: 1,
          },
          VEL: { x: 1, y: -0.5 },
          velPrevX: 0,
          velPrevY: 0,
          accX: 0,
          accY: 0,
          srcImage: 'sword',
          bounceY: 0,
          bounceX: 0,
          gravity: false,
          bouncePlatforms: false,
          damage: 20,
          hitback: { x: 0.2, y: 0 },
          scale: 0.9,
          mass: 0.5,
          allowVelocityY: false,
          rotation: {
            initial: 0,
            speed: 0,
          },
          followOnOffscreen: false,
          followOnOffscreenOffset: { x: 0, y: 0 },
          offscreenCurr: false,
          offscreenPrev: false,
          findAndFollowAcceleration: { x: 0, y: 0 },
          ON_SCREEN_PREVENT_ATTACK_PHYSICAL: true,
          attackBullets: null,
        },
        shield: null,
        powerStateCurr: { name: 'none', gameStamp: 0 },
        powerStatePrev: { name: 'none', gameStamp: 0 },
      },
      inputType: 0,
      keyboard: null,
      gamepad: null,
      LRGameStamp: null,
      padCurr: {
        up: false,
        down: false,
        left: false,
        right: true,
        A: false,
        B: false,
        X: false,
        Y: false,
        R: false,
        L: false,
        start: false,
        select: false,
      },
      padPrev: {
        up: false,
        down: false,
        left: false,
        right: true,
        A: false,
        B: false,
        X: false,
        Y: false,
        R: false,
        L: false,
        start: false,
        select: false,
      },
      padDebounced: {
        up: 0,
        down: 0,
        left: 0,
        right: 0,
        A: 0,
        B: 0,
        X: 0,
        Y: 0,
        L: 0,
        R: 0,
        start: 0,
        select: 0,
      },
      playerReadySound: null,
      endPlace: 0,
      controllerButtonPresses: {
        up: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        down: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        left: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        right: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        A: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        B: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        X: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        Y: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        R: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        L: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        start: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        select: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
      },
      averagePositionXY: {
        x: { positionAverage: 0, positionSum: 0, positionCount: 0 },
        y: { positionAverage: 0, positionSum: 0, positionCount: 0 },
      },
      nnRating: null,
      maxPositionsXY: {
        x: {
          start: SCREEN_DIMENSIONS.WIDTH / 2,
          end: SCREEN_DIMENSIONS.WIDTH / 2,
        },
        y: {
          start: SCREEN_DIMENSIONS.HEIGHT / 2,
          end: SCREEN_DIMENSIONS.HEIGHT / 2,
        },
      },
    },
    {
      playerId: 2,
      emitterGamestamp: null,
      emitterLight: null,
      emitterDark: null,
      emitterPlayer: null,
      emitterHurt: null,
      particles: null,
      particlesShield: null,
      shotGlassImage: null,
      shotGlassNumber: null,
      killCount: 0,
      deathCount: 0,
      shotCountCurr: 0,
      shotCountPrev: 0,
      circleOffset: 0,
      scoreBoardUpper: '',
      scoreBoardLower: '',
      scoreBoardReady: 'READY',
      scoreBoardController: 'X',
      state: { name: 'player-state-start', gameStamp: 0, timeStamp: 0 },
      char: {
        name: debugInit.Nintendo_Sprites ? 'Pikachu' : 'Surprice',
        initializeCharPosition: {
          // lookingRight: true,
          x: 110,
          y: 100,
        },
        // color: {
        //   primary: '#ffc90e',
        //   secondary: '#e24800',
        //   dark: '#1c0900',
        //   light: '#ffffff',
        // },
        colorFilterBlink: false,
        src: 'images/character_2_cropped.png',
        scaleCharSpriteReality: 1,
        scaleCharSpriteImage: 1,
        sprite: null,
        srcSpriteSheet: debugInit.Nintendo_Sprites
          ? 'images/sprite_sheet_8.1_pikachu_4x.png'
          : 'images/sprite_sheet_8.1_surprice_4x.png',
        runRate: 1,
        spriteSize: {
          width: 16,
          height: 14,
        },
        ssCurr: {
          name: 'idle',
          timeStamp: 0,
        },
        ssPrev: {
          name: 'idle',
          timeStamp: 0,
        },
        zoom: 1,
        vel: { x: 0, y: 0 },
        pos: { x: 0, y: 0 },
        jumps: [1, 1, 0],
        jumpPower: 1,
        jumpIndex: 0,
        jumpFloat: 1,
        upB: { canUse: false, x: 0.5, y: -1, speedMultiplier: 2 },
        damageCurr: 0,
        damagePrev: 0,
        speed: 1,
        fast: 1,
        friction_ground: 0.5,
        friction_air: 0.04,
        wallTouchArray: [],
        lastDirectionTouched: null,
        attackPhysical: {
          sprite: null,
          state: {
            name: 'attackphysical-state-off',
            gameStamp: 0,
            timeStamp: 0,
          },
          durationAttack: 200,
          durationCooldown: 300,
          posFromCenter: { x: 50, y: -10 },
          damage: 50,
          hitback: { x: 0.2, y: 0 },
          srcImage: 'fist-gray',
          mass: 10,
          scale: 0.1,
          audio: null,
        },
        attackEnergy: {
          diesOnHitbox: false,
          sprite: null,
          state: 'released',
          timestampThrow: 0,
          durationCooldown: 1000,
          posFromCenter: { x: -20, y: -25 },
          friction: {
            ground: 0.9,
            wallInvertRotation: true,
            wallInvertSprite: false,
            air: 0.9,
          },
          VEL: { x: 1, y: -4 },
          velPrevX: 0,
          velPrevY: 0,
          accX: 0,
          accY: 0,
          srcImage: 'bottle',
          bounceY: 0.7,
          bounceX: 0.7,
          gravity: true,
          bouncePlatforms: true,
          damage: 20,
          hitback: { x: 0.1, y: -0.3 },
          scale: 1,
          mass: 2,
          allowVelocityY: true,
          rotation: {
            initial: (Math.PI * 3) / 4,
            speed: 500,
          },
          followOnOffscreen: false,
          followOnOffscreenOffset: { x: 0, y: 0 },
          offscreenCurr: false,
          offscreenPrev: false,
          findAndFollowAcceleration: { x: 0, y: 0 },
          ON_SCREEN_PREVENT_ATTACK_PHYSICAL: false,
          attackBullets: null,
        },
        shield: null,
        powerStateCurr: { name: 'none', gameStamp: 0 },
        powerStatePrev: { name: 'none', gameStamp: 0 },
      },
      inputType: 0,
      keyboard: null,
      gamepad: null,
      LRGameStamp: null,
      padCurr: {
        up: false,
        down: false,
        left: false,
        right: true,
        A: false,
        B: false,
        X: false,
        Y: false,
        R: false,
        L: false,
        start: false,
        select: false,
      },
      padPrev: {
        up: false,
        down: false,
        left: false,
        right: true,
        A: false,
        B: false,
        X: false,
        Y: false,
        R: false,
        L: false,
        start: false,
        select: false,
      },
      padDebounced: {
        up: 0,
        down: 0,
        left: 0,
        right: 0,
        A: 0,
        B: 0,
        X: 0,
        Y: 0,
        L: 0,
        R: 0,
        start: 0,
        select: 0,
      },
      playerReadySound: null,
      endPlace: 0,
      controllerButtonPresses: {
        up: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        down: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        left: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        right: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        A: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        B: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        X: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        Y: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        R: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        L: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        start: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        select: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
      },
      averagePositionXY: {
        x: { positionAverage: 0, positionSum: 0, positionCount: 0 },
        y: { positionAverage: 0, positionSum: 0, positionCount: 0 },
      },
      nnRating: null,
      maxPositionsXY: {
        x: {
          start: SCREEN_DIMENSIONS.WIDTH / 2,
          end: SCREEN_DIMENSIONS.WIDTH / 2,
        },
        y: {
          start: SCREEN_DIMENSIONS.HEIGHT / 2,
          end: SCREEN_DIMENSIONS.HEIGHT / 2,
        },
      },
    },
    {
      playerId: 3,
      emitterGamestamp: null,
      emitterLight: null,
      emitterDark: null,
      emitterPlayer: null,
      emitterHurt: null,
      particles: null,
      particlesShield: null,
      killCount: 0,
      shotGlassImage: null,
      shotGlassNumber: null,
      deathCount: 0,
      shotCountCurr: 0,
      shotCountPrev: 0,
      circleOffset: 0,
      scoreBoardUpper: '',
      scoreBoardLower: '',
      scoreBoardReady: 'READY',
      scoreBoardController: 'X',
      state: { name: 'player-state-start', gameStamp: 0, timeStamp: 0 },
      char: {
        name: debugInit.Nintendo_Sprites ? 'Kirby' : 'Seed',
        initializeCharPosition: {
          x: 200,
          y: 100,
        },
        colorFilterBlink: false,
        src: 'images/character_3_cropped.png',
        scaleCharSpriteReality: 1,
        scaleCharSpriteImage: 1,
        sprite: null,
        srcSpriteSheet: debugInit.Nintendo_Sprites
          ? 'images/sprite_sheet_8.1_kirby_4x.png'
          : 'images/sprite_sheet_8.1_seedboy_4x.png',
        runRate: 1,
        spriteSize: {
          width: 13,
          height: 13,
        },
        ssCurr: {
          name: 'idle',
          timeStamp: 0,
        },
        ssPrev: {
          name: 'idle',
          timeStamp: 0,
        },
        zoom: 1,
        vel: { x: 0, y: 0 },
        pos: { x: 0, y: 0 },
        jumps: [1, 0.9, 0.8, 0.7, 0.6, 0.5, 0],
        jumpPower: 1,
        jumpIndex: 0,
        jumpFloat: 1.2,
        upB: { canUse: false, x: 0.5, y: -1, speedMultiplier: 1 },
        damageCurr: 0,
        damagePrev: 0,
        speed: 0.9,
        fast: 1,
        friction_ground: 0.5,
        friction_air: 0.04,
        wallTouchArray: [],
        lastDirectionTouched: null,
        attackPhysical: {
          sprite: null,
          state: {
            name: 'attackphysical-state-off',
            gameStamp: 0,
            timeStamp: 0,
          },
          durationAttack: 200,
          durationCooldown: 300,
          posFromCenter: { x: 50, y: -10 },
          damage: 50,
          hitback: { x: 0.2, y: 0 },
          srcImage: 'fist-gray',
          mass: 10,
          scale: 0.1,
          audio: null,
        },
        attackEnergy: {
          diesOnHitbox: true,
          sprite: null,
          state: 'released',
          timestampThrow: 0,
          durationCooldown: 1000,
          posFromCenter: { x: 40, y: -20 },
          friction: {
            ground: 1,
            wallInvertRotation: false,
            wallInvertSprite: false,
            air: 1,
          },
          VEL: { x: 1, y: -1 },
          velPrevX: 0,
          velPrevY: 0,
          accX: 0,
          accY: 0,
          srcImage: 'mirror',
          bounceY: 1,
          bounceX: 1,
          gravity: false,
          bouncePlatforms: true,
          damage: 1,
          hitback: { x: 0.1, y: 0.2 },
          scale: 1.3,
          mass: 10,
          allowVelocityY: false,
          rotation: {
            initial: 0,
            speed: 0,
          },
          followOnOffscreen: false,
          followOnOffscreenOffset: { x: 0, y: 0 },
          offscreenCurr: false,
          offscreenPrev: false,
          findAndFollowAcceleration: { x: 0, y: 0 },
          ON_SCREEN_PREVENT_ATTACK_PHYSICAL: false,
          attackBullets: {
            bullets: null,
            NUMBER_BULLETS: 10,
            soundB1: null,
            soundB2: null,
            soundP1: null,
            soundP2: null,
            sB1: 'ping',
            vB1: 0.01,
            sB2: 'ping2',
            vB2: 0.01,
            sP1: 'pop',
            vP1: 0.03,
            sP2: 'pop2',
            vP2: 0.03,
          },
        },
        shield: null,
        powerStateCurr: { name: 'none', gameStamp: 0 },
        powerStatePrev: { name: 'none', gameStamp: 0 },
      },
      inputType: 0,
      keyboard: null,
      gamepad: null,
      LRGameStamp: null,
      padCurr: {
        up: false,
        down: false,
        left: false,
        right: true,
        A: false,
        B: false,
        X: false,
        Y: false,
        R: false,
        L: false,
        start: false,
        select: false,
      },
      padPrev: {
        up: false,
        down: false,
        left: false,
        right: true,
        A: false,
        B: false,
        X: false,
        Y: false,
        R: false,
        L: false,
        start: false,
        select: false,
      },
      padDebounced: {
        up: 0,
        down: 0,
        left: 0,
        right: 0,
        A: 0,
        B: 0,
        X: 0,
        Y: 0,
        L: 0,
        R: 0,
        start: 0,
        select: 0,
      },
      playerReadySound: null,
      endPlace: 0,
      controllerButtonPresses: {
        up: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        down: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        left: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        right: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        A: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        B: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        X: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        Y: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        R: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        L: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        start: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        select: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
      },
      averagePositionXY: {
        x: { positionAverage: 0, positionSum: 0, positionCount: 0 },
        y: { positionAverage: 0, positionSum: 0, positionCount: 0 },
      },
      nnRating: null,
      maxPositionsXY: {
        x: {
          start: SCREEN_DIMENSIONS.WIDTH / 2,
          end: SCREEN_DIMENSIONS.WIDTH / 2,
        },
        y: {
          start: SCREEN_DIMENSIONS.HEIGHT / 2,
          end: SCREEN_DIMENSIONS.HEIGHT / 2,
        },
      },
    },
    {
      playerId: 4,
      emitterGamestamp: null,
      emitterLight: null,
      emitterDark: null,
      emitterPlayer: null,
      emitterHurt: null,
      particles: null,
      particlesShield: null,
      killCount: 0,
      shotGlassImage: null,
      shotGlassNumber: null,
      deathCount: 0,
      shotCountCurr: 0,
      shotCountPrev: 0,
      circleOffset: -20,
      scoreBoardUpper: '',
      scoreBoardLower: '',
      scoreBoardReady: 'READY',
      scoreBoardController: 'X',
      state: { name: 'player-state-start', gameStamp: 0, timeStamp: 0 },
      char: {
        name: 'Chez',
        initializeCharPosition: {
          // lookingRight: false,
          x: 200,
          y: 100,
        },
        // color: {
        //   primary: '#5588ff',
        //   secondary: '#5548bb',
        //   dark: '#1c0900',
        //   light: '#ffffff',
        // },
        colorFilterBlink: false,
        src: 'images/character_4_cropped.png',
        scaleCharSpriteReality: 1.8,
        scaleCharSpriteImage: 0.7, // 0.1
        sprite: null,
        srcSpriteSheet: 'images/sprite_sheet_8.1_chez_4x.png',
        runRate: 0.8,
        spriteSize: {
          width: 24,
          height: 28,
        },
        ssCurr: {
          name: 'idle',
          timeStamp: 0,
        },
        ssPrev: {
          name: 'idle',
          timeStamp: 0,
        },
        zoom: 1,
        vel: { x: 0, y: 0 },
        pos: { x: 0, y: 0 },
        jumps: [1, 1, 0],
        jumpPower: 1,
        jumpIndex: 0,
        jumpFloat: 1,
        upB: { canUse: false, x: 0.5, y: -1, speedMultiplier: 1 },
        damageCurr: 0,
        damagePrev: 0,
        speed: 0.9,
        fast: 1,
        friction_ground: 0.5,
        friction_air: 0.04,
        wallTouchArray: [],
        lastDirectionTouched: null,
        attackPhysical: {
          sprite: null,
          state: {
            name: 'attackphysical-state-off',
            gameStamp: 0,
            timeStamp: 0,
          },
          durationAttack: 200,
          durationCooldown: 300,
          posFromCenter: { x: 60, y: -15 },
          damage: 100,
          hitback: { x: 0.2, y: 0 },
          srcImage: 'fist-gray',
          mass: 10,
          scale: 0.2,
          audio: null,
        },
        attackEnergy: {
          diesOnHitbox: false,
          sprite: null,
          state: 'released',
          timestampThrow: 0,
          durationCooldown: 1000,
          posFromCenter: { x: 23, y: -41 },
          friction: {
            ground: 0.7,
            wallInvertRotation: true,
            wallInvertSprite: false,
            air: 0.8,
          },
          VEL: { x: 1, y: -3 },
          velPrevX: 0,
          velPrevY: 0,
          accX: 0,
          accY: 0,
          srcImage: 'hammer',
          bounceY: 0.3,
          bounceX: 0.5,
          gravity: true,
          bouncePlatforms: true,
          damage: 40,
          hitback: { x: 0.1, y: -0.3 },
          scale: 1,
          mass: 2,
          allowVelocityY: true,
          rotation: {
            initial: 0,
            speed: 500,
          },
          followOnOffscreen: false,
          followOnOffscreenOffset: { x: 0, y: 0 },
          offscreenCurr: false,
          offscreenPrev: false,
          findAndFollowAcceleration: { x: 0, y: 0 },
          ON_SCREEN_PREVENT_ATTACK_PHYSICAL: false,
          attackBullets: null,
        },
        shield: null,
        powerStateCurr: { name: 'none', gameStamp: 0 },
        powerStatePrev: { name: 'none', gameStamp: 0 },
      },
      inputType: 0,
      keyboard: null,
      gamepad: null,
      LRGameStamp: null,
      padCurr: {
        up: false,
        down: false,
        left: false,
        right: true,
        A: false,
        B: false,
        X: false,
        Y: false,
        R: false,
        L: false,
        start: false,
        select: false,
      },
      padPrev: {
        up: false,
        down: false,
        left: false,
        right: true,
        A: false,
        B: false,
        X: false,
        Y: false,
        R: false,
        L: false,
        start: false,
        select: false,
      },
      padDebounced: {
        up: 0,
        down: 0,
        left: 0,
        right: 0,
        A: 0,
        B: 0,
        X: 0,
        Y: 0,
        L: 0,
        R: 0,
        start: 0,
        select: 0,
      },
      playerReadySound: null,
      endPlace: 0,
      controllerButtonPresses: {
        up: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        down: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        left: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        right: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        A: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        B: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        X: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        Y: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        R: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        L: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        start: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        select: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
      },
      averagePositionXY: {
        x: { positionAverage: 0, positionSum: 0, positionCount: 0 },
        y: { positionAverage: 0, positionSum: 0, positionCount: 0 },
      },
      nnRating: null,
      maxPositionsXY: {
        x: {
          start: SCREEN_DIMENSIONS.WIDTH / 2,
          end: SCREEN_DIMENSIONS.WIDTH / 2,
        },
        y: {
          start: SCREEN_DIMENSIONS.HEIGHT / 2,
          end: SCREEN_DIMENSIONS.HEIGHT / 2,
        },
      },
    },
    {
      playerId: 5,
      emitterGamestamp: null,
      emitterLight: null,
      emitterDark: null,
      emitterPlayer: null,
      emitterHurt: null,
      particles: null,
      particlesShield: null,
      killCount: 0,
      shotGlassImage: null,
      shotGlassNumber: null,
      deathCount: 0,
      shotCountCurr: 0,
      shotCountPrev: 0,
      circleOffset: -70,
      scoreBoardUpper: '',
      scoreBoardLower: '',
      scoreBoardReady: 'READY',
      scoreBoardController: 'X',
      state: { name: 'player-state-start', gameStamp: 0, timeStamp: 0 },
      char: {
        name: 'B-Chez',
        initializeCharPosition: {
          x: 200,
          y: 100,
        },

        colorFilterBlink: false,
        src: 'images/character_5_cropped.png',
        scaleCharSpriteReality: 3.1,
        scaleCharSpriteImage: 2,
        sprite: null,
        srcSpriteSheet: 'images/sprite_sheet_8.1_blackchez_4x.png',
        runRate: 0.4,
        spriteSize: {
          width: 24,
          height: 28,
        },
        ssCurr: {
          name: 'idle',
          timeStamp: 0,
        },
        ssPrev: {
          name: 'idle',
          timeStamp: 0,
        },
        zoom: 1,
        vel: { x: 0, y: 0 },
        pos: { x: 0, y: 0 },
        jumps: [1, 1, 0],
        jumpPower: 1,
        jumpIndex: 0,
        jumpFloat: 1,
        upB: { canUse: false, x: 0.5, y: -1, speedMultiplier: 1 },
        damageCurr: 0,
        damagePrev: 0,
        speed: 0.9,
        fast: 1,
        friction_ground: 0.5,
        friction_air: 0.04,
        wallTouchArray: [],
        lastDirectionTouched: null,
        attackPhysical: {
          sprite: null,
          state: {
            name: 'attackphysical-state-off',
            gameStamp: 0,
            timeStamp: 0,
          },
          durationAttack: 200,
          durationCooldown: 300,
          posFromCenter: { x: 100, y: -30 },
          damage: 200,
          hitback: { x: 0.2, y: 0 },
          srcImage: 'fist-black',
          mass: 10,
          scale: 0.33,
          audio: null,
        },
        attackEnergy: {
          diesOnHitbox: false,
          sprite: null,
          state: 'released',
          timestampThrow: 0,
          durationCooldown: 1000,
          posFromCenter: { x: 70, y: -70 },
          friction: {
            ground: 0.7,
            wallInvertRotation: true,
            wallInvertSprite: false,
            air: 0.8,
          },
          VEL: { x: 1, y: -3 },
          velPrevX: 0,
          velPrevY: 0,
          accX: 0,
          accY: 0,
          srcImage: 'blackHammer',
          bounceY: 0.3,
          bounceX: 0.5,
          gravity: false,
          bouncePlatforms: true,
          damage: 80,
          hitback: { x: 0.1, y: -0.5 },
          scale: 2,
          mass: 1000,
          allowVelocityY: false,
          rotation: {
            initial: 0,
            speed: 100,
          },
          followOnOffscreen: false,
          followOnOffscreenOffset: { x: 0, y: 0 },
          offscreenCurr: false,
          offscreenPrev: false,
          findAndFollowAcceleration: { x: 0, y: 0 },
          ON_SCREEN_PREVENT_ATTACK_PHYSICAL: false,
          attackBullets: null,
        },
        shield: null,
        powerStateCurr: { name: 'none', gameStamp: 0 },
        powerStatePrev: { name: 'none', gameStamp: 0 },
      },
      inputType: 0,
      keyboard: null,
      gamepad: null,
      LRGameStamp: null,
      padCurr: {
        up: false,
        down: false,
        left: false,
        right: true,
        A: false,
        B: false,
        X: false,
        Y: false,
        R: false,
        L: false,
        start: false,
        select: false,
      },
      padPrev: {
        up: false,
        down: false,
        left: false,
        right: true,
        A: false,
        B: false,
        X: false,
        Y: false,
        R: false,
        L: false,
        start: false,
        select: false,
      },
      padDebounced: {
        up: 0,
        down: 0,
        left: 0,
        right: 0,
        A: 0,
        B: 0,
        X: 0,
        Y: 0,
        L: 0,
        R: 0,
        start: 0,
        select: 0,
      },
      playerReadySound: null,
      endPlace: 0,
      controllerButtonPresses: {
        up: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        down: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        left: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        right: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        A: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        B: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        X: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        Y: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        R: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        L: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        start: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        select: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
      },
      averagePositionXY: {
        x: { positionAverage: 0, positionSum: 0, positionCount: 0 },
        y: { positionAverage: 0, positionSum: 0, positionCount: 0 },
      },
      nnRating: null,
      maxPositionsXY: {
        x: {
          start: SCREEN_DIMENSIONS.WIDTH / 2,
          end: SCREEN_DIMENSIONS.WIDTH / 2,
        },
        y: {
          start: SCREEN_DIMENSIONS.HEIGHT / 2,
          end: SCREEN_DIMENSIONS.HEIGHT / 2,
        },
      },
    },
    {
      playerId: 6,
      emitterGamestamp: null,
      emitterLight: null,
      emitterDark: null,
      emitterPlayer: null,
      emitterHurt: null,
      particles: null,
      particlesShield: null,
      killCount: 0,
      shotGlassImage: null,
      shotGlassNumber: null,
      deathCount: 0,
      shotCountCurr: 0,
      shotCountPrev: 0,
      circleOffset: 0,
      scoreBoardUpper: '',
      scoreBoardLower: '',
      scoreBoardReady: 'READY',
      scoreBoardController: 'X',
      state: { name: 'player-state-start', gameStamp: 0, timeStamp: 0 },
      char: {
        name: debugInit.Nintendo_Sprites ? 'G-Koopa' : 'M-Snail',
        initializeCharPosition: {
          // lookingRight: false,
          x: 200,
          y: 100,
        },
        // color: {
        //   primary: '#ff88ae',
        //   secondary: '#e24800',
        //   dark: '#1c0900',
        //   light: '#ffffff',
        // },
        colorFilterBlink: false,
        src: 'images/character_6_cropped.png',
        scaleCharSpriteReality: 0.7,
        scaleCharSpriteImage: 0.7,
        sprite: null,
        srcSpriteSheet: debugInit.Nintendo_Sprites
          ? 'images/sprite_sheet_8.1_greenkoopa_4x.png'
          : 'images/sprite_sheet_8.1_magentasnail_4x.png',
        runRate: 1,
        spriteSize: {
          width: 16,
          height: 16,
        },
        ssCurr: {
          name: 'idle',
          timeStamp: 0,
        },
        ssPrev: {
          name: 'idle',
          timeStamp: 0,
        },
        zoom: 0.7,
        vel: { x: 0, y: 0 },
        pos: { x: 0, y: 0 },
        jumps: [1, 0.8, 0],
        jumpPower: 1,
        jumpIndex: 0,
        jumpFloat: 1,
        upB: { canUse: false, x: 0.5, y: -1, speedMultiplier: 1 },
        damageCurr: 0,
        damagePrev: 0,
        speed: 0.9,
        fast: 1,
        friction_ground: 0.5,
        friction_air: 0.04,
        wallTouchArray: [],
        lastDirectionTouched: null,
        attackPhysical: {
          sprite: null,
          state: {
            name: 'attackphysical-state-off',
            gameStamp: 0,
            timeStamp: 0,
          },
          durationAttack: 200,
          durationCooldown: 300,
          posFromCenter: { x: 50, y: -10 },
          damage: 50,
          hitback: { x: 0.2, y: 0 },
          srcImage: 'fist-gray',
          mass: 10,
          scale: 0.1,
          audio: null,
        },
        attackEnergy: {
          diesOnHitbox: true,
          sprite: null,
          state: 'released',
          timestampThrow: 0,
          durationCooldown: 1000,
          posFromCenter: { x: 15, y: -30 },
          friction: {
            ground: 1,
            wallInvertRotation: false,
            wallInvertSprite: false,
            air: 1,
          },
          VEL: { x: 1, y: -1 },
          velPrevX: 0,
          velPrevY: 0,
          accX: 0,
          accY: 0,
          srcImage: debugInit.Nintendo_Sprites ? 'greenshell' : 'magentashell',
          bounceY: 0.1,
          bounceX: 1,
          gravity: true,
          bouncePlatforms: true,
          damage: 25,
          hitback: { x: 0.1, y: 0.2 },
          scale: 1.3,
          mass: 50,
          allowVelocityY: true,
          rotation: {
            initial: 0,
            speed: 0,
          },
          followOnOffscreen: true,
          followOnOffscreenOffset: { x: 15, y: -100 },
          offscreenCurr: false,
          offscreenPrev: false,
          findAndFollowAcceleration: { x: 0, y: 0 },
          ON_SCREEN_PREVENT_ATTACK_PHYSICAL: false,
          attackBullets: null,
        },
        shield: null,
        powerStateCurr: { name: 'none', gameStamp: 0 },
        powerStatePrev: { name: 'none', gameStamp: 0 },
      },
      inputType: 0,
      keyboard: null,
      gamepad: null,
      LRGameStamp: null,
      padCurr: {
        up: false,
        down: false,
        left: false,
        right: true,
        A: false,
        B: false,
        X: false,
        Y: false,
        R: false,
        L: false,
        start: false,
        select: false,
      },
      padPrev: {
        up: false,
        down: false,
        left: false,
        right: true,
        A: false,
        B: false,
        X: false,
        Y: false,
        R: false,
        L: false,
        start: false,
        select: false,
      },
      padDebounced: {
        up: 0,
        down: 0,
        left: 0,
        right: 0,
        A: 0,
        B: 0,
        X: 0,
        Y: 0,
        L: 0,
        R: 0,
        start: 0,
        select: 0,
      },
      playerReadySound: null,
      endPlace: 0,
      controllerButtonPresses: {
        up: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        down: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        left: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        right: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        A: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        B: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        X: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        Y: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        R: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        L: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        start: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        select: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
      },
      averagePositionXY: {
        x: { positionAverage: 0, positionSum: 0, positionCount: 0 },
        y: { positionAverage: 0, positionSum: 0, positionCount: 0 },
      },
      nnRating: null,
      maxPositionsXY: {
        x: {
          start: SCREEN_DIMENSIONS.WIDTH / 2,
          end: SCREEN_DIMENSIONS.WIDTH / 2,
        },
        y: {
          start: SCREEN_DIMENSIONS.HEIGHT / 2,
          end: SCREEN_DIMENSIONS.HEIGHT / 2,
        },
      },
    },
    {
      playerId: 8,
      emitterGamestamp: null,
      emitterLight: null,
      emitterDark: null,
      emitterPlayer: null,
      emitterHurt: null,
      particles: null,
      particlesShield: null,
      killCount: 0,
      shotGlassImage: null,
      shotGlassNumber: null,
      deathCount: 0,
      shotCountCurr: 0,
      shotCountPrev: 0,
      circleOffset: 0,
      scoreBoardUpper: '',
      scoreBoardLower: '',
      scoreBoardReady: 'READY',
      scoreBoardController: 'X',
      state: { name: 'player-state-start', gameStamp: 0, timeStamp: 0 },
      char: {
        name:
          debugInit.Nintendo_Sprites || debugInit.SNES_Sprites
            ? 'B-Koopa'
            : 'C-Snail',

        initializeCharPosition: {
          // lookingRight: false,
          x: 200,
          y: 100,
        },
        // color: {
        //   primary: '#ff88ae',
        //   secondary: '#e24800',
        //   dark: '#1c0900',
        //   light: '#ffffff',
        // },
        colorFilterBlink: false,
        src: 'images/character_7_cropped.png',
        scaleCharSpriteReality: 0.7,
        scaleCharSpriteImage: 0.7,
        sprite: null,
        srcSpriteSheet: debugInit.Nintendo_Sprites
          ? 'images/sprite_sheet_8.1_redkoopa_4x.png'
          : 'images/sprite_sheet_8.1_cyansnail_4x.png',
        runRate: 1,
        spriteSize: {
          width: 16,
          height: 16,
        },
        ssCurr: {
          name: 'idle',
          timeStamp: 0,
        },
        ssPrev: {
          name: 'idle',
          timeStamp: 0,
        },
        zoom: 0.7,
        vel: { x: 0, y: 0 },
        pos: { x: 0, y: 0 },
        jumps: [1, 0.9, 0],
        jumpPower: 1,
        jumpIndex: 0,
        jumpFloat: 1,
        upB: { canUse: false, x: 0.5, y: -1, speedMultiplier: 1 },
        damageCurr: 0,
        damagePrev: 0,
        speed: 0.9,
        fast: 1,
        friction_ground: 0.5,
        friction_air: 0.04,
        wallTouchArray: [],
        lastDirectionTouched: null,
        attackPhysical: {
          sprite: null,
          state: {
            name: 'attackphysical-state-off',
            gameStamp: 0,
            timeStamp: 0,
          },
          durationAttack: 200,
          durationCooldown: 300,
          posFromCenter: { x: 50, y: -10 },
          damage: 50,
          hitback: { x: 0.2, y: 0 },
          srcImage: 'fist-gray',
          mass: 10,
          scale: 0.1,
          audio: null,
        },
        attackEnergy: {
          diesOnHitbox: true,
          sprite: null,
          state: 'released',
          timestampThrow: 0,
          durationCooldown: 1000,
          posFromCenter: { x: 15, y: -30 },
          friction: {
            ground: 1,
            wallInvertRotation: false,
            wallInvertSprite: false,
            air: 1,
          },
          VEL: { x: 1, y: -1 },
          velPrevX: 0,
          velPrevY: 0,
          accX: 0,
          accY: 0,
          srcImage: debugInit.Nintendo_Sprites ? 'redshell' : 'cyanshell',
          bounceY: 0.1,
          bounceX: 1.3,
          gravity: true,
          bouncePlatforms: true,
          damage: 20,
          hitback: { x: 0.1, y: 0.2 },
          scale: 1.3,
          mass: 50,
          allowVelocityY: true,
          rotation: {
            initial: 0,
            speed: 0,
          },
          followOnOffscreen: true,
          followOnOffscreenOffset: { x: 15, y: -100 },
          offscreenCurr: false,
          offscreenPrev: false,
          findAndFollowAcceleration: { x: 0.12, y: 0 },
          ON_SCREEN_PREVENT_ATTACK_PHYSICAL: false,
          attackBullets: null,
        },
        shield: null,
        powerStateCurr: { name: 'none', gameStamp: 0 },
        powerStatePrev: { name: 'none', gameStamp: 0 },
      },
      inputType: 0,
      keyboard: null,
      gamepad: null,
      LRGameStamp: null,
      padCurr: {
        up: false,
        down: false,
        left: false,
        right: true,
        A: false,
        B: false,
        X: false,
        Y: false,
        R: false,
        L: false,
        start: false,
        select: false,
      },
      padPrev: {
        up: false,
        down: false,
        left: false,
        right: true,
        A: false,
        B: false,
        X: false,
        Y: false,
        R: false,
        L: false,
        start: false,
        select: false,
      },
      padDebounced: {
        up: 0,
        down: 0,
        left: 0,
        right: 0,
        A: 0,
        B: 0,
        X: 0,
        Y: 0,
        L: 0,
        R: 0,
        start: 0,
        select: 0,
      },
      playerReadySound: null,
      endPlace: 0,
      controllerButtonPresses: {
        up: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        down: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        left: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        right: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        A: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        B: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        X: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        Y: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        R: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        L: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        start: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        select: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
      },
      averagePositionXY: {
        x: { positionAverage: 0, positionSum: 0, positionCount: 0 },
        y: { positionAverage: 0, positionSum: 0, positionCount: 0 },
      },
      nnRating: null,
      maxPositionsXY: {
        x: {
          start: SCREEN_DIMENSIONS.WIDTH / 2,
          end: SCREEN_DIMENSIONS.WIDTH / 2,
        },
        y: {
          start: SCREEN_DIMENSIONS.HEIGHT / 2,
          end: SCREEN_DIMENSIONS.HEIGHT / 2,
        },
      },
    },
    {
      playerId: 8,
      emitterGamestamp: null,
      emitterLight: null,
      emitterDark: null,
      emitterPlayer: null,
      emitterHurt: null,
      particles: null,
      particlesShield: null,
      killCount: 0,
      shotGlassImage: null,
      shotGlassNumber: null,
      deathCount: 0,
      shotCountCurr: 0,
      shotCountPrev: 0,
      circleOffset: 0,
      scoreBoardUpper: '',
      scoreBoardLower: '',
      scoreBoardReady: 'READY',
      scoreBoardController: 'X',
      state: { name: 'player-state-start', gameStamp: 0, timeStamp: 0 },
      char: {
        name:
          debugInit.Nintendo_Sprites || debugInit.SNES_Sprites
            ? 'R-Koopa'
            : 'O-Snail',

        initializeCharPosition: {
          x: 200,
          y: 100,
        },
        // color: {
        //   primary: '#ff88ae',
        //   secondary: '#e24800',
        //   dark: '#1c0900',
        //   light: '#ffffff',
        // },
        colorFilterBlink: false,
        src: 'images/character_8_cropped.png',
        scaleCharSpriteReality: 0.7,
        scaleCharSpriteImage: 0.7,
        sprite: null,
        zoom: 0.7,
        srcSpriteSheet: debugInit.Nintendo_Sprites
          ? 'images/sprite_sheet_8.1_bluekoopa_4x.png'
          : 'images/sprite_sheet_8.1_orangesnail_4x.png',
        runRate: 1,
        spriteSize: {
          width: 16,
          height: 16,
        },
        ssCurr: {
          name: 'idle',
          timeStamp: 0,
        },
        ssPrev: {
          name: 'idle',
          timeStamp: 0,
        },
        vel: { x: 0, y: 0 },
        pos: { x: 0, y: 0 },
        jumps: [
          1, 1, 0.95, 0.9, 0.85, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8,
          0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8,
          0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.7, 0.6, 0.5, 0.3, 0.2, 0.1, 0,
        ],
        jumpPower: 1,
        jumpIndex: 0,
        jumpFloat: 1.5,
        upB: { canUse: false, x: 0.5, y: -1, speedMultiplier: 1 },
        damageCurr: 0,
        damagePrev: 0,
        speed: 0.9,
        fast: 1,
        friction_ground: 0.5,
        friction_air: 0.04,
        wallTouchArray: [],
        lastDirectionTouched: null,
        attackPhysical: {
          sprite: null,
          state: {
            name: 'attackphysical-state-off',
            gameStamp: 0,
            timeStamp: 0,
          },
          durationAttack: 200,
          durationCooldown: 300,
          posFromCenter: { x: 50, y: -10 },
          damage: 50,
          hitback: { x: 0.2, y: 0 },
          srcImage: 'fist-gray',
          mass: 10,
          scale: 0.1,
          audio: null,
        },
        attackEnergy: {
          diesOnHitbox: true, // TODO: TRUE
          sprite: null,
          state: 'released',
          timestampThrow: 0,
          durationCooldown: 1000,
          posFromCenter: { x: 15, y: -30 },
          friction: {
            ground: 1,
            wallInvertRotation: false,
            wallInvertSprite: false,
            air: 1,
          },
          VEL: { x: 1, y: -1 },
          velPrevX: 0,
          velPrevY: 0,
          accX: 0,
          accY: 0,
          srcImage: debugInit.Nintendo_Sprites ? 'blueshell' : 'orangeshell',
          bounceY: 2,
          bounceX: 2,
          gravity: false,
          bouncePlatforms: true,
          damage: 15,
          hitback: { x: 0.1, y: 0.2 },
          scale: 1.3,
          mass: 50,
          allowVelocityY: true,
          rotation: {
            initial: 0,
            speed: 0,
          },
          followOnOffscreen: true,
          followOnOffscreenOffset: { x: 15, y: -100 },
          offscreenCurr: false,
          offscreenPrev: false,
          findAndFollowAcceleration: { x: 0.04, y: 0.04 },
          ON_SCREEN_PREVENT_ATTACK_PHYSICAL: false,
          attackBullets: null,
        },
        shield: null,
        powerStateCurr: { name: 'none', gameStamp: 0 },
        powerStatePrev: { name: 'none', gameStamp: 0 },
      },
      inputType: 0,
      keyboard: null,
      gamepad: null,
      LRGameStamp: null,
      padCurr: {
        up: false,
        down: false,
        left: false,
        right: true,
        A: false,
        B: false,
        X: false,
        Y: false,
        R: false,
        L: false,
        start: false,
        select: false,
      },
      padPrev: {
        up: false,
        down: false,
        left: false,
        right: true,
        A: false,
        B: false,
        X: false,
        Y: false,
        R: false,
        L: false,
        start: false,
        select: false,
      },
      padDebounced: {
        up: 0,
        down: 0,
        left: 0,
        right: 0,
        A: 0,
        B: 0,
        X: 0,
        Y: 0,
        L: 0,
        R: 0,
        start: 0,
        select: 0,
      },
      playerReadySound: null,
      endPlace: 0,
      controllerButtonPresses: {
        up: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        down: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        left: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        right: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        A: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        B: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        X: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        Y: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        R: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        L: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        start: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
        select: {
          pressed: 0,
          released: 0,
          ratio: 0,
        },
      },
      averagePositionXY: {
        x: { positionAverage: 0, positionSum: 0, positionCount: 0 },
        y: { positionAverage: 0, positionSum: 0, positionCount: 0 },
      },
      nnRating: null,
      maxPositionsXY: {
        x: {
          start: SCREEN_DIMENSIONS.WIDTH / 2,
          end: SCREEN_DIMENSIONS.WIDTH / 2,
        },
        y: {
          start: SCREEN_DIMENSIONS.HEIGHT / 2,
          end: SCREEN_DIMENSIONS.HEIGHT / 2,
        },
      },
    },
  ];

  constructor() {
    super('game');
  }

  preload() {
    preload(this);
  }
  create() {
    create(this);
  }

  update(time: number, delta: number) {
    update(this, time, delta);
  }
}

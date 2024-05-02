import { Moment } from 'moment';
import { print } from '../views/client';
import { BulletsPlayer } from './helpers/bullets';

export interface Debug {
  DevMode: boolean;
  DurSeconds: boolean;
  DevZoom: number;
  Level: number;
  ModeInfinity: boolean;
  Minutes: number;
  Shots: number;
  MusicTrack: number;
  MusicActive: boolean;
  UpdateLoopsNumSkip: number;
  FrictionAirActive: boolean;
  UseCamera: boolean;
  CamerasVisible: boolean;
  CollidersPvP: boolean;
  CollidersPvAP: boolean;
  ShowHelperKeyboard: boolean;
  CollidersPvAE: boolean;
  CollidersAEvAE: boolean;
  CollidersAEvAP: boolean;
  CollidersABvAE: boolean;
  CollidersABvAP: boolean;
  AEWrapScreen: boolean;
  PlayerIdVisible: boolean;
  CharsColored: boolean;
  WallJumpsActive: boolean;
  DefaultDamage: boolean;
  DefaultHitback: boolean;
  ReadySoundActive: boolean;
  HealthInverted: boolean;
  MatricesAlways: boolean;
  AutoStart: boolean;
  ConsoleLogButtons: boolean;
  ConsoleLogConnected: boolean;
  LoadTimeExtra: boolean;
  AllowChez: boolean;
  AllowKoopas: boolean;
  ChompSlowMo: boolean;
  TypedLoadingText: boolean;
  CharOverride: boolean;
  CharOverrideId: CharacterId;
  BulletsAllowGroups: boolean;
  BulletsFullScreen: boolean;
  TrophiesOnShots: boolean;
  TrophiesAlways: boolean;
  NNP1Train: boolean;
  NNHelpScreen: boolean;
  NNHelpPit: boolean;
  NNHelpWall: boolean;
  NNHelpCenterize: boolean;
  ChompExplosions: boolean;
  ChompVelocities: boolean;
  InstReplay: number;
  ReplayFastSlow: boolean;
  GravityLight: boolean;
  FlowerRapidFire: boolean;
  FlowerOnInit: boolean;
  FlowerFullScrn: boolean;
  FlowerGravity: boolean;
  FlowerBounceWall: boolean;
  Flower1000Balls: boolean;
  BulletBillActive: boolean;
  [key: string]: any; // add index signature
}

export interface CharacterMove {
  button: string;
  move: string;
  status: string;
}

export type ButtonName =
  | 'See Other Projects'
  | 'Back'
  | 'ReStart'
  | 'Controls'
  | 'Controllers'
  | 'Rules'
  | 'Rules-N64'
  | 'About'
  | 'History'
  | 'Options';

export type GameState =
  | 'game-state-start'
  | 'game-state-play'
  | 'game-state-paused'
  | 'game-state-first-blood'
  | 'game-state-screen-clear'
  | 'game-state-captured-flag'
  | 'game-state-finished';

export type PlayerState =
  | 'player-state-start'
  | 'player-state-alive'
  | 'player-state-dead'
  | 'player-state-hurt';

export type AttackState =
  | 'attackphysical-state-on'
  | 'attackphysical-state-cooldown'
  | 'attackphysical-state-off';

export type SplashName =
  | 'splash-black'
  | 'splash-none'
  | 'splash-start'
  | 'splash-paused'
  | 'splash-first-blood'
  | 'splash-screen-clear'
  | 'splash-captured-flag'
  | 'splash-cool-down'
  | 'splash-finished';

export interface Clock {
  minutes: number;
  seconds: number;
}

export interface Loc {
  x: number;
  y: number;
  zoom: number;
}

export interface CameraHelper {
  helper: any;
  helperState: Loc | any;
}

export interface EndCup {
  sprite: any | Phaser.GameObjects.Sprite;
  ownerId: number;
}

export interface Player {
  playerId: number;
  shotGlassImage: any | Phaser.GameObjects.Sprite;
  shotGlassNumber: string | null | any;
  scoreBoardUpper: string | any;
  scoreBoardLower: string | any;
  scoreBoardReady: string | any;
  scoreBoardController: string | any;
  state: PlayerStateWithTime;
  char: Char;
  inputType: InputType;
  keyboard: keyboard | any;
  gamepad: Gamepad | any;
  padCurr: GamepadData;
  LRStamp: number | null;
  padPrev: GamepadData;
  padDebounced: PadStateDebounced;
  particles: any;
  particlesShield: any;
  emitterLight: any;
  emitterDark: any;
  emitterPlayer: any;
  emitterHurt: any;
  killCount: number;
  deathCount: number;
  shotCountCurr: number;
  shotCountPrev: number;
  playerReadySound: any;
  circleOffset: number;
  endPlace: number;
}

export interface Char {
  name: string;
  colorFilterBlink: boolean;
  src: string;
  scaleCharSpriteImage: number;
  scaleCharSpriteReality: number;
  sprite: any | Phaser.GameObjects.Sprite;
  spriteSize: SpriteSize;
  runRate: number;
  ssCurr: SpriteState;
  ssPrev: SpriteState;
  srcSpriteSheet: string;
  shield: Shield | null;
  zoom: number;
  vel: { x: number; y: number };
  pos: { x: number; y: number };
  jumps: number[];
  jumpPower: number;
  jumpIndex: number;
  jumpFloat: number;
  upB: UpB;
  damageCurr: number;
  damagePrev: number;
  speed: number;
  fast: number;
  friction_ground: number;
  friction_air: number;
  wallTouchArray: boolean[];
  lastDirectionTouched: 'up' | 'down' | 'left' | 'right' | null;
  attackPhysical: AttackPhysical;
  attackEnergy: AttackEnergy;
  initializeCharPosition: InitializeCharPosition;
  powerStateCurr: PowerStateCharacter;
  powerStatePrev: PowerStateCharacter;
}

export interface SpriteState {
  name: SpriteStateName;
  timeStamp: number;
}

export type SpriteStateName = 'idle' | 'walk' | 'jumpUp' | 'jumpDown' | 'climb';

export interface Shield {
  circle: ColorCircle;
}

export interface ColorCircle {
  text: string;
  graphic: any;
  colorNumber: number;
  colorString: string;
}

export interface AttackStateWithTime {
  name: AttackState;
  gameStamp: number;
  timeStamp: number;
}
export interface PlayerStateWithTime {
  name: PlayerState;
  gameStamp: number;
  timeStamp: number;
}
export interface GameStateWithTime {
  nameCurr: GameState;
  gameStampCurr: number;
  timeStampCurr: number;
  namePrev: GameState;
  gameStampPrev: number;
  timeStampPrev: number;
}

export interface Color {
  primary: string;
  secondary: string;
  dark: string;
  light: string;
}
export interface Camera {
  char: CameraChar;
}

export interface CameraChar {
  name: string;
  src: string;
  sprite: any | Phaser.GameObjects.Sprite;
  zoom: number;
}

export interface GamepadData {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  A: boolean;
  B: boolean;
  X: boolean;
  Y: boolean;
  R: boolean;
  L: boolean;
  start: boolean;
  select: boolean;
}

export interface PadStateDebounced {
  up: number;
  down: number;
  left: number;
  right: number;
  A: number;
  B: number;
  X: number;
  Y: number;
  L: number;
  R: number;
  start: number;
  select: number;
}

// export interface Keyboard {
//   up: Key;
//   down: Key;
//   left: Key;
//   right: Key;
//   fast: Key;
//   jump: Key;
// }

export interface InitializeCharPosition {
  // lookingRight: boolean;
  x: number;
  y: number;
}

export interface AttackEnergyRotation {
  initial: number;
  speed: number;
}

export interface UpB {
  canUse: boolean;
  speedMultiplier: number;
  y: number;
  x: number;
}

export interface SplashRules {
  text: any;
  name: SplashName;
  size: string;
  word: string;
  color: string;
  backgroundColor: string;
  shadowColor: string;
  strokeThickness: number;
  src: string;
}
export interface SplashEndData {
  textTitle: any;
  textCircles: any;
  textData: any;
  name: string;
  emoji: string;
  vertical: number;
  size: string;
  words: string[];
  color: string;
  backgroundColor: string;
  strokeThickness: number;
  blur: number;
  offsetY: number;
  src: string;
}

export interface Acceleration {
  x: number;
  y: number;
}

export interface Velocity {
  x: number;
  y: number;
}
export interface Position {
  x: number;
  y: number;
}

export interface AttackPhysical {
  sprite: any | Phaser.GameObjects.Sprite;
  state: AttackStateWithTime;
  durationAttack: number;
  durationCooldown: number;
  posFromCenter: Position;
  damage: number;
  hitback: Hitback;
  srcImage: string;
  mass: number;
  scale: number;
  audio: any;
}

export interface AttackEnergy {
  sprite: any | Phaser.GameObjects.Sprite;
  state: 'holding' | 'released';
  timestampThrow: number;
  durationCooldown: number;
  posFromCenter: Position;
  friction: AttackEnergyFriction;
  diesOnHitbox: boolean;
  VEL: Velocity;
  velPrevX: number;
  velPrevY: number;
  accX: number;
  accY: number;
  srcImage: string;
  bounceY: number;
  bounceX: number;
  gravity: boolean;
  bouncePlatforms: boolean;
  damage: number;
  hitback: Hitback;
  scale: number;
  mass: number;
  allowVelocityY: boolean;
  rotation: AttackEnergyRotation;
  followOnOffscreen: boolean;
  followOnOffscreenOffset: { x: number; y: number };
  offscreenCurr: boolean;
  offscreenPrev: boolean;
  findAndFollowAcceleration: FindAndFollowAcceleration;
  ON_SCREEN_PREVENT_ATTACK_PHYSICAL: boolean;
  attackBullets: AttackBullets | null;
}

export interface AttackBullets {
  bullets: BulletsPlayer | null;
  NUMBER_BULLETS: number;
  soundB1: any;
  soundB2: any;
  soundP1: any;
  soundP2: any;
  sB1: string;
  vB1: number;
  sB2: string;
  vB2: number;
  sP1: string;
  vP1: number;
  sP2: string;
  vP2: number;
}

export interface FindAndFollowAcceleration {
  x: number;
  y: number;
}
export interface AttackEnergyFriction {
  air: number;
  ground: number;
  wallInvertRotation: boolean;
  wallInvertSprite: boolean;
}
export interface Hitback {
  x: number;
  y: number;
}

export interface xyVector {
  x: number;
  y: number;
}

export interface keyboard {
  up: any;
  down: any;
  left: any;
  right: any;
  A: any;
  B: any;
  X: any;
  Y: any;
  L: any;
  R: any;
  start: any;
  select: any;
}

export type CharacterId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

//////////////////////////
// INPUT TYPES
// 0: none
// 1: pad
// 2: keyboard
// 3: bot | Rule-Based
// 4: bot | Neural-Network
//////////////////////////
export type InputType = 0 | 1 | 2 | 3 | 4;
export const inputTypeNum = 5;

export type CharacterName =
  | 'Mario'
  | 'Link'
  | 'Pikachu'
  | 'Kirby'
  | 'Chez'
  | 'B-Chez'
  | 'G-Koopa'
  | 'R-Koopa'
  | 'B-Koopa';

export type CharacterNameShort =
  | 'MAR'
  | 'LNK'
  | 'PKA'
  | 'KRB'
  | 'CHZ'
  | 'BCZ'
  | 'GKP'
  | 'RKP'
  | 'BKP';

export interface SmashConfig {
  players: PlayerConfigSmall[];
}

export interface PlayerConfigSmall {
  characterId: CharacterId;
  input: InputType;
}

export interface PlayerConfig {
  name: CharacterName;
  nameShort: CharacterNameShort;
  characterId: CharacterId;
  scale: number;
  input?: InputType;
}

export type WebState =
  | 'web-state-init'
  | 'web-state-setup'
  | 'web-state-load'
  | 'web-state-game';

export interface Quote {
  name: string;
  text: string;
}

export interface FireFlower {
  sprite: any | Phaser.GameObjects.Sprite;
  attackBullets: any | AttackBullets;
  damage: number;
  hitback: Hitback;
  diesOnHitbox: boolean;
  fireBallSounds: any[];
  fireBallSoundsIndexCurr: number;
  srcImage: any | Phaser.GameObjects.Sprite;
  posInit: Position;
  rotation: AttackEnergyRotation;
  shootingDistanceThreshold: number;
  numUpdateIndexesToWait: number;
  numUpdateIndexesToWaitFast: number;
}

export type BulletBillBullet = {
  scale: number;
  sprite: any;
  sound: any;
  damage: number;
  hitback: Hitback;
  diesOnHitbox: boolean;
  srcImage: any;
  posInit: Position;
};

export type BulletBillCannon = {
  scale: number;
  sprite: any;
  sound: any;
  srcImage: any;
  posInit: Position;
};

export type BulletBillCombo = {
  bullet: BulletBillBullet;
  cannon: BulletBillCannon;
  shootingDistanceThreshold: number;
  numUpdateIndexesToWait: number;
  numUpdateIndexesToWaitFast: number;
};

export interface Owner {
  id: null | number;
  gameStamp: number;
}

export interface PoleTouchStamp {
  touching: boolean;
  gameStamp: number;
}

export interface Box {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface Flag {
  flagSpeedDark: number;
  flagSpeed: number;
  movement: 'none' | 'up' | 'down';
  box: Box;
  poleTouchStamps: PoleTouchStamp[];
  completedCurr: boolean;
  completedPrev: boolean;
  toucherCurr: Owner;
  toucherPrev: Owner;
  ownerCurr: Owner;
  ownerPrev: Owner;
  spriteFlagMover: any | Phaser.GameObjects.Sprite;
  spriteFlagStationary: any | Phaser.GameObjects.Sprite;
  spriteFlagChar: any | Phaser.GameObjects.Sprite;
  spriteFlagPole: any | Phaser.GameObjects.Sprite;
  yPositionInit: number; // 0 to 1
  soundFlagCapture: any;
  soundFlagComplete: any;
  soundFlagMusicBox: any;
  afterPauseResumeMusicFlagMusicBox: boolean;
  firework: any;
}

export interface Chomp {
  sprite: any | Phaser.GameObjects.Sprite;
  filterStateCurr: ChompFilterState;
  filterStatePrev: ChompFilterState;
  damage: number;
  originX: number;
  originY: number;
  radius: number;
  percentFramesAttack: number;
  percentFramesWalk: number;
  NUM_LINKS: number;
  MASS: number;
  links: ChompLink[];
  block: ChompBlock;
  soundAttack: any;
  soundHurt: any;
  soundSheep: any;
  afterPauseResumeSoundSheep: boolean;
  soundBBWoah: any;
  soundBBBambalam: any;
  powerStateCurr: PowerStateChomp;
  powerStatePrev: PowerStateChomp;
  particles: any;
  emitterDark: any;
  musicRates: {
    chomp: number;
    player: number;
  };
  darknessMoments: DarknessMoments;
  explosionFPS: number;
}
export interface ChompBlock {
  sprite: any | Phaser.GameObjects.Sprite;
  x: number;
  y: number;
}

export interface ChompLink {
  sprite: any | Phaser.GameObjects.Sprite;
}

export type ChompFilterStateName = 'none' | 'hurt' | 'cooldown';

export interface ChompFilterState {
  name: ChompFilterStateName;
  gameStamp: number;
}

export const emoji = {
  keyboardBlack: '⌨',
  keyboardWhite: '⌨️',
  gamepad: '🎮',
  greenCheck: '✔️',
  caution: '🚧',
  redX: '❌',
  gear: '⚙️',
  cloud: '☁',
  cloudWhite: '☁️',
  beer: '🍺',
  star: '⭐',
  skullAndCrossbones: '☠️',
  skull: '💀',
  punch: '👊',
  brokenHeart: '💔',
  back: '🔙',
  forward: '🔜',
  restart: '🔄',
  waiting: '⏳',
  bot: '🤖',
  dice: '🎲',
  alien: '👽',
  fire: '🔥',
  spaceInvader: '👾',
  bomb: '💣',
  brain: '🧠',
};

//🥃⭐🔫⚪​🍺​🍻​🥂​🍾​🥃

export type Keydown = 'a' | 's' | 'd' | 'f' | 'j' | 'k' | 'l' | ';' | 'x';

export type PowerStateCharacterName = 'dark' | 'light' | 'none';

export type PowerStateChompName = 'dark' | 'none';
export type PowerStateFlagName = 'light' | 'none';
export interface PowerStateCharacter {
  name: PowerStateCharacterName;
  gameStamp: number;
}

export interface PowerStateChomp {
  name: PowerStateChompName;
  gameStamp: number;
}
export interface PowerStateFlag {
  name: PowerStateFlagName;
  gameStamp: number;
}

export interface DarknessMoments {
  chomp: number;
  passed: number;
  percentExplosion: number;
  explosionsIndex: number;
  explosions: Explosion[];
}

export interface Explosion {
  sprite: any;
  sound: any;
}

export interface SpriteSize {
  width: number;
  height: number;
}

export interface Lava {
  sprite: any;
  sound: any;
  particles: any;
  width: number;
  height: number;
  rate: number;
  numFrames: number;
}

export interface KeyboardGroup {
  left: string;
  right: string;
}

export interface WorkingController {
  name: string;
  url: string;
}

export const bar = () => {
  print('------------------');
};

export type PlayChezStateName = 'up' | 'down' | 'chez';

export interface PlayChezState {
  name: PlayChezStateName;
  moment: Moment;
}

export interface NNObject {
  input: number[];
  output: number[];
}

// TO HELP KEEP TRACK
export interface NNInput {
  controllerUp: number;
  controllerDown: number;
  controllerLeft: number;
  controllerRight: number;
  controllerA: number;
  controllerB: number;
  controllerX: number;
  controllerY: number;
  playerEnemyDPX: number;
  playerEnemyDPY: number;
  playerEnemyDVX: number;
  playerEnemyDVY: number;
  playerEnemyAttackEnergyDPX: number;
  playerEnemyAttackEnergyDPY: number;
  playerTouchingDown: number;
  playerTouchingLeft: number;
  playerTouchingRight: number;
  playerFacingEnemy: number;
  [key: string]: any;
}

// TO HELP KEEP TRACK
export interface NNOutput {
  controllerUp: number;
  controllerDown: number;
  controllerLeft: number;
  controllerRight: number;
  controllerA: number;
  controllerB: number;
  controllerX: number;
  controllerY: number;
  [key: string]: any;
}

export type NNTrainProgressObject = {
  name: string;
  value: number;
  error: number;
};

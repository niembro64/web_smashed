// reactHelpers.ts

import ShakePositionPlugin from 'phaser3-rex-plugins/plugins/shakeposition-plugin.js';
import SmashedGame from '../scenes/SmashedGame';
import {
  CharacterMove,
  Debug,
  InputType,
  KeyboardGroup,
  PlayerConfig,
  PlayerConfigAlt,
  Quote,
  SmashConfig,
  WorkingController,
  emoji,
} from '../scenes/types';
import { debugDescriptions } from '../debugDescriptions';
import { debugInit } from '../debugInit';

export const inputArrayReset: InputType[] = [0, 0, 0, 0];
export const inputArrayInit: InputType[] = [3, 3, 3, 3];
export const inputArrayInitDevMode: InputType[] = [5, 5, 5, 5];
// export const inputArrayInitDebug: InputType[] = [3, 3, 3, 3];
export const inputArrayInitMax: number = 4;

export const smashConfigInitMax: number = 8;
export const smashConfigInit: SmashConfig = {
  players: [
    {
      characterId: 0,
      input: 0, // don't set this here
    },
    {
      characterId: 1,
      input: 0, // don't set this here
    },
    {
      characterId: 2,
      input: 0, // don't set this here
    },
    {
      characterId: 3,
      input: 0, // don't set this here
    },
  ],
};
export const smashConfigInitDevMode: SmashConfig = {
  players: [
    {
      characterId: 0,
      input: 0, // don't set this here
    },
    {
      characterId: 0,
      input: 0, // don't set this here
    },
    {
      characterId: 0,
      input: 0, // don't set this here
    },
    {
      characterId: 0,
      input: 0, // don't set this here
    },
  ],
};

export const workingControllersAmazon: WorkingController[] = [
  // {
  //   name: 'Wired SNES iNNEXT',
  //   url: 'https://www.amazon.com/dp/B01MYUDDCV?ref=ppx_yo2ov_dt_b_product_details&th=1/',
  // },
  {
    name: 'Wired N64 KIWITATA',
    url: 'https://www.amazon.com/gp/product/B08X677HR4/ref=ppx_yo_dt_b_search_asin_title?ie=UTF8&psc=1',
  },
  {
    name: 'Wired GameCube Mekela NGC',
    url: 'https://www.amazon.com/Mekela-5-8-foot-classic-controller-Windows/dp/B07GSSXS84/ref=sr_1_5?crid=3N3MSRPF8INFK&keywords=Mekela+5.8+feet+Classic+USB+wired+NGC+Controller&qid=1673335159&sprefix=mekela+5.8+feet+classic+usb+wired+ngc+controller%2Caps%2C68&sr=8-5',
  },
  {
    name: 'Wired Switch PowerA Nintendo',
    url: 'https://www.amazon.com/gp/product/B07PDJ45BT/ref=ppx_yo_dt_b_search_asin_title?ie=UTF8&psc=1',
  },
  {
    name: 'Wireless Switch Pro Nintendo',
    url: 'https://www.amazon.com/gp/product/B01NAWKYZ0/ref=ppx_yo_dt_b_search_asin_title?ie=UTF8&psc=1',
  },
];

export const keyboardGroups: KeyboardGroup[][] = [
  [
    { left: 'D-Pad', right: 'W A S D' },
    { left: 'A X B Y', right: 'F G H Space' },
    { left: 'L Select Start R', right: 'R T Y U' },
  ],
  [
    { left: 'D-Pad', right: 'ArrowKeys' },
    { left: 'A X B Y', right: '4 5 6 Enter' },
    { left: 'L Select Start R', right: '7 8 9 +' },
  ],
];

export const idColors: string[] = [
  'id-red',
  'id-blue',
  'id-yellow',
  'id-green',
];

// always keep Chez and BlackChez at positions 4 and 5
export const smashConfigOptions: PlayerConfig[] = [
  { characterId: 0, scale: 0.9, name: 'Mario', nameShort: 'MAR' },
  { characterId: 1, scale: 0.9, name: 'Link', nameShort: 'LNK' },
  { characterId: 2, scale: 1, name: 'Pikachu', nameShort: 'PKA' },
  { characterId: 3, scale: 0.7, name: 'Kirby', nameShort: 'KRB' },
  { characterId: 4, scale: 1.2, name: 'Chez', nameShort: 'CHZ' },
  { characterId: 5, scale: 1.2, name: 'B-Chez', nameShort: 'BCZ' },
  { characterId: 6, scale: 0.6, name: 'G-Koopa', nameShort: 'GKP' },
  { characterId: 7, scale: 0.6, name: 'R-Koopa', nameShort: 'RKP' },
  { characterId: 8, scale: 0.6, name: 'B-Koopa', nameShort: 'BKP' },
];

export const smashConfigOptionsAlt: PlayerConfigAlt[] = [
  { characterId: 0, scale: 1, name: 'Monkee', nameShort: 'MNK' },
  { characterId: 1, scale: 0.9, name: 'Kaitlyn', nameShort: 'KTY' },
  { characterId: 2, scale: 1, name: 'Surprice', nameShort: 'SUR' },
  { characterId: 3, scale: 0.9, name: 'Seed', nameShort: 'SED' },
  { characterId: 4, scale: 1.2, name: 'Chez', nameShort: 'CHZ' },
  { characterId: 5, scale: 1.2, name: 'B-Chez', nameShort: 'BCZ' },
  { characterId: 6, scale: 0.7, name: 'M-Snail', nameShort: 'MSN' },
  { characterId: 7, scale: 0.7, name: 'C-Snail', nameShort: 'CSN' },
  { characterId: 8, scale: 0.7, name: 'O-Snail', nameShort: 'OSN' },
];

export const quotes: Quote[] = [
  { name: 'Breezy', text: 'The turtle will die.' },
  { name: 'TR3', text: 'SMASHED!!!' },
  { name: 'Chadams', text: 'Two shots... two shots.' },
  { name: 'Eddie-Z', text: "He'll do it again, yeah!" },
  {
    name: 'TR3',
    text: 'How am I supposed to make more than that... sh... happen?',
  },
  {
    name: 'DDj',
    text: "It's safe to say we're not going to the bars tonite.",
  },
  {
    name: 'DDj',
    text: '...yes you are.',
  },
  // { name: 'Chadams', text: 'AAAYYYUUUGGGGHHHH!!' },
  // { name: 'Chadams', text: 'Spike Enerjeaoah.' },
  // { name: 'Chadams', text: "Stop breakin' shit." },
  // { name: 'Chadams', text: 'Is there no one else?' },
  // { name: 'Deen Davis Jr.', text: 'VIDEOTAPE MA-SELF FUCKIN YOU UP!' },
  // { name: 'Breezy', text: 'Oh, is it? Oh cool. Ur soo cool.' },
  { name: 'Lau', text: "I'm sorry, I didn't know it was gonna happen." },
  // { name: "Gin", text: "Clean it up, and we'll do it again." },
  { name: 'Ginman', text: "Set it up... and we'll do it... again." },
  // { name: 'Gin', text: 'Shitty, shitty-fuckin-ass.' },
  {
    name: 'DDj.',
    text: 'I can fight you one-handed.',
  },
  // {
  //   name: 'DDj',
  //   text: 'I thought you put Spike in there.',
  // },
];

export const p1Keys: string[] = ['w', 'a', 's', 'd'];
export const p2Keys: string[] = [
  'ArrowUp',
  'ArrowLeft',
  'ArrowDown',
  'ArrowRight',
];

export const characterMoves: CharacterMove[] = [
  { button: 'D-Pad', move: 'Move', status: emoji.greenCheck },
  // { button: 'Ground + X', move: 'Jump', status: emoji.greenCheck },
  { button: 'X', move: 'Jump', status: emoji.greenCheck },
  // { button: 'Air + X', move: 'Double Jump', status: emoji.greenCheck },
  { button: 'B', move: 'Melee Attack', status: emoji.greenCheck },
  { button: 'Y', move: 'Projectile Attack', status: emoji.greenCheck },
  { button: 'Start', move: 'Pause', status: emoji.greenCheck },
  { button: 'Air + D-Pad + A', move: 'Aerial Evade', status: emoji.greenCheck },
  // { button: 'Forward + B', move: 'Smash Attack', status: emoji.caution },
  // {
  //   button: 'Air + Wall + Forward',
  //   move: 'Wall Slide',
  //   status: emoji.greenCheck,
  // },
  {
    button: 'L + R for 5 Seconds',
    move: 'Suicide',
    status: emoji.greenCheck,
  },
  // { button: 'Paused + Any Button', move: 'Ready', status: emoji.greenCheck },
  // { button: 'Paused + All Ready', move: 'UnPause', status: emoji.greenCheck },
];

// ✔️🚧❌🚫🛑🔜📄📋⚙️🚪⛔⌚🕹️🎮☠️👾💣🔥​➡️​⌨️​⌨🧊🌑🌒🌙⭐🌞☁☁☁
// 🏴‍☠️🏳️🏁🏴
// 🔴🟠🟡🟢🔵🟣🟤⚫⚪
// ⌨🎮
// bars horizontal all widths
// ─
// empty space characters
// ─────────────────────────────────────

export const replaceUnderscoreWithSpace = (str: string): string => {
  return str.replace(/_/g, ' ');
};

export const mobileMayNotWorkText: string[] = [
  'GAME MAY NOT LOAD',
  'ON MOBILE DEVICE',
];

export const toolTipDescriptionJoinString = ' ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀ ';
// export const toolTipDescriptionJoinString = ' ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ';
// export const toolTipDescriptionJoinString =
//   ' ───────────────────────────────────── ';

export function getDebugDescription(key: keyof Debug): string {
  const s: string[] = debugDescriptions[key];

  const sCaps: string[] = s ? s.map((str) => str.toUpperCase()) : [];

  return sCaps.join(toolTipDescriptionJoinString);
  // return sCaps.join('\n');
}

export function getTypeDescription(s: string[]): string {
  const sCaps: string[] = s ? s.map((str) => str.toUpperCase()) : [];

  return sCaps.join(toolTipDescriptionJoinString);
  // return sCaps.join('\n');
}

import SmashedGame from '../scenes/SmashedGame';
import ShakePositionPlugin from 'phaser3-rex-plugins/plugins/shakeposition-plugin.js';

const baseGravity = 3000;

export const configInit: Phaser.Types.Core.GameConfig = {
  plugins: {
    global: [
      {
        key: 'rexShakePosition',
        plugin: ShakePositionPlugin,
        start: true,
      },
    ],
  },
  transparent: true,
  title: 'Smashed',
  antialias: true,
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1920,
    height: 1080,
  },
  type: Phaser.AUTO,
  parent: 'phaser-container',
  backgroundColor: '#00000055',
  input: {
    gamepad: true,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: baseGravity },
      debug: false,
      // fps: 600, // 10 times the default 60 FPS
    },
  },
  scene: [SmashedGame],
};

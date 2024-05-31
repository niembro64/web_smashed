import { print } from '../../views/client';
import SmashedGame, { SCREEN_DIMENSIONS } from '../SmashedGame';
import { Debug, Player, Position, Velocity } from '../types';
import { getDistanceFromOrigin } from './math';

export class Bullet extends Phaser.Physics.Arcade.Sprite {
  constructor(
    game: SmashedGame,
    x: number,
    y: number,
    key: string,
    rotation: number
  ) {
    super(game, x, y, key);
    this.setRotation(rotation);
    this.screen = SCREEN_DIMENSIONS;
    this.debug = game.debug;
    this.key = key;
    this.bouncingFullScreen = game.debug?.Flower_Full_Screen || false;
    this.shootingDistanceThreshold = game.fireFlower.shootingDistanceThreshold;
  }
  shootingDistanceThreshold: number = 0;
  bouncingFullScreen: boolean = false;
  key: string = '';

  screen: any = null;
  debug: Debug | null = null;

  shootGameStamp: number = 0;

  Y_RANDOM: number = -50;
  Y_ADDER: number = -10;
  floatVelocityY: number = 0;
  timeAlive: number = 0;
  initialPosition: Position = { x: 0, y: 0 };

  fire(pos: Position, vel: Velocity, game: SmashedGame): void {
    this.initialPosition = { x: pos.x, y: pos.y };
    this.timeAlive = 0;
    this.body.reset(pos.x, pos.y);
    this.floatVelocityY = this.Y_ADDER + this.Y_RANDOM * Math.random();

    this.body.bounce.set(1);
    this.setActive(true);
    this.setVisible(true);

    this.setVelocityY(vel.y);
    this.setVelocityX(vel.x);
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);

    this.timeAlive += delta;

    const currDistance = getDistanceFromOrigin(
      { x: this.x, y: this.y },
      this.initialPosition
    );

    const maxDistance =
      this.key === 'bulletFireBall'
        ? this.bouncingFullScreen
          ? this.screen.WIDTH
          : this.shootingDistanceThreshold
        : 350;
    // const keyDuration = this.key === 'bulletFireBall' ? 1000 : 3000;

    // if (this.timeAlive > keyDuration || distance > keyDistance) {
    if (currDistance > maxDistance) {
      this.body.bounce.set(0);
      this.setActive(false);
      this.setVisible(false);
      this.x = -100;
      this.y = -100;
      this.setVelocityX(0);
      this.setVelocityY(0);
    }
  }
}

export class BulletsPlayer extends Phaser.Physics.Arcade.Group {
  constructor(game: SmashedGame, player: Player) {
    super(game.physics.world, game);

    const ae = player.char.attackEnergy;

    this.createMultiple({
      frameQuantity: ae.attackBullets?.NUMBER_BULLETS || 1,
      key: ae.srcImage,
      active: false,
      visible: false,
      classType: Bullet,
      setRotation: ae.rotation,
    });
  }

  getBulletSprites(): Phaser.Physics.Arcade.Sprite[] {
    return this.children.entries as Phaser.Physics.Arcade.Sprite[];
  }

  setFillBulletSprites(): void {
    let bulletSprites = this.getBulletSprites();
    for (let i = 0; i < bulletSprites.length; i++) {
      bulletSprites[i].setTintFill(0xff0000);
      print('setFillBulletSprites', bulletSprites[i]);
    }
  }

  numSkip = 0;

  fireBullet(
    pos: Position,
    vel: Velocity,
    player: Player,
    firstFire: boolean,
    game: SmashedGame
  ): void {
    if (firstFire) {
      this.numSkip = 0;
    }
    if (this.numSkip !== 0) {
      this.numSkip--;
      return;
    }

    let pbs = player.char.attackEnergy.attackBullets;

    this.numSkip = 3;

    let bullet = this.getFirstDead(false);
    if (bullet) {
      bullet.fire(pos, vel, game);
      if (pbs?.soundB1) {
        if (Math.random() > 0.5) {
          pbs.soundB1.rate = 1 + 0.03 * Math.random();
          pbs.soundB1.play();
        } else {
          pbs.soundB2.rate = 1 + 0.03 * Math.random();
          pbs.soundB2.play();
        }

        if (Math.random() > 0.5) {
          pbs.soundP1.rate = 1 + 0.03 * Math.random();
          pbs.soundP1.play();
        } else {
          pbs.soundP2.rate = 1 + 0.03 * Math.random();
          pbs.soundP2.play();
        }
      }
    }
  }
}

export class BulletsFireFlower extends Phaser.Physics.Arcade.Group {
  constructor(game: SmashedGame) {
    super(game.physics.world, game);

    const numBullets = game.debug.Flower_1000_Balls
      ? 1000
      : game.fireFlower.attackBullets?.NUMBER_BULLETS || 1;

    this.createMultiple({
      frameQuantity: numBullets,
      key: game.fireFlower.srcImage,
      active: false,
      visible: false,
      classType: Bullet,
      setRotation: { initial: Math.random() * 100, speed: Math.random() * 100 },
      // setRotation: game.cannon.rotation,
    });
  }

  getBulletSprites(): Phaser.Physics.Arcade.Sprite[] {
    return this.children.entries as Phaser.Physics.Arcade.Sprite[];
  }

  setFillBulletSprites(): void {
    let bulletSprites = this.getBulletSprites();
    for (let i = 0; i < bulletSprites.length; i++) {
      bulletSprites[i].setTintFill(0xff0000);
      print('setFillBulletSprites', bulletSprites[i]);
    }
  }

  numSkip = 0;

  fireBullet(
    pos: Position,
    vel: Velocity,
    firstFire: boolean,
    game: SmashedGame
  ): void {
    if (firstFire) {
      this.numSkip = 0;
    }
    if (this.numSkip !== 0) {
      this.numSkip--;
      return;
    }

    this.numSkip = 3;

    let bullet = this.getFirstDead(false);
    if (bullet) {
      bullet.fire(pos, vel, game);
    }
  }
}

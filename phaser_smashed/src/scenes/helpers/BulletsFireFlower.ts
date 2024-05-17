import { print } from '../../views/client';
import SmashedGame from '../SmashedGame';
import { Position, Velocity } from '../interfaces';
import { Bullet } from './bullets';

export class BulletsFireFlower extends Phaser.Physics.Arcade.Group {
  constructor(game: SmashedGame) {
    super(game.physics.world, game);
    this.createMultiple({
      frameQuantity: game.fireFlower.attackBullets?.NUMBER_BULLETS || 10,
      key: game.fireFlower.srcImage,
      active: false,
      visible: false,
      classType: Bullet,
      // setRotation: { initial: Math.random() * 100, speed: Math.random() * 100 },
      // setRotation: game.cannon.rotation,
    });
  }

  getBulletSprites(): Phaser.Physics.Arcade.Sprite[] {
    return this.children.entries as Phaser.Physics.Arcade.Sprite[];
  }

  setFillBulletSprites(): void {
    let bulletSprites = this.getBulletSprites();
    for (let i = 0; i < bulletSprites.length; i++) {
      bulletSprites[i].setTintFill(16711680);
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

    let bullet = this?.getFirstDead(false);
    if (bullet) {
      bullet.fire(pos, vel, game);
    }
  }
}

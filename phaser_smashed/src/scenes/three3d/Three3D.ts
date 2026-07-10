import * as THREE from 'three';
import SmashedGame, { SCREEN_DIMENSIONS } from '../SmashedGame';
import { CharacterId, Player } from '../types';
import {
  buildAttackModelForKey,
  buildBulletBill,
  buildCannon,
  buildChainLink,
  buildChomp,
  buildExplosion,
  buildFireFlower,
  buildFlag,
  buildPSwitch,
  buildPlatformBlock,
  buildPole,
  buildSpikes,
  buildTable,
} from './models';
import { CharacterRig } from './rigs';
import { disposeAllCachedTextures, getImageTexture } from './textures';

////////////////////////////////////////////////////////////
// Three3D — the pseudo-3D view of the game.
//
// Phaser stays 100% in charge of physics, input, collisions,
// timing and HUD. This class only *mirrors* the live scene into
// a Three.js render each frame:
//   - a transparent-canvas Phaser layer stays on top (HUD text,
//     particles, splashes), the WebGL canvas sits underneath;
//   - every world sprite that gets a 3D counterpart is hidden
//     from Phaser's main camera via camera.ignore() — pure
//     rendering, zero gameplay impact;
//   - the Three camera reproduces the Phaser camera exactly on
//     the z=0 plane, so everything physically meaningful lines
//     up pixel-perfect with the 2D simulation, while boxes,
//     rigs and props extend in depth for the 3D feel.
////////////////////////////////////////////////////////////

const FOV_DEGREES = 45;
const PLATFORM_DEPTH = 90;
const LAVA_NUM_FRAMES = 16;

interface SpriteMirror {
  holder: THREE.Group; // position + z-rotation
  model: THREE.Group; // y-rotation for flipX
  sprite: any;
  mirrorRotation: boolean;
  mirrorFlip: boolean;
}

interface ExplosionMirror {
  group: THREE.Group;
  material: THREE.MeshLambertMaterial;
  sprite: any;
  baseRadius: number;
}

export class Three3D {
  private game: SmashedGame;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private canvas: HTMLCanvasElement;
  private destroyed: boolean = false;
  private elapsed: number = 0;

  private mirrors: SpriteMirror[] = [];
  private rigs: { rig: CharacterRig; player: Player; playerIndex: number }[] =
    [];
  private explosionMirrors: ExplosionMirror[] = [];
  private ignoreList: any[] = [];

  // special-cased props
  // screen-composition layers (stage outlines) that must keep their
  // exact 2D size on screen despite sitting at different depths
  private screenLayers: { mesh: THREE.Mesh; z: number }[] = [];
  private chompJaw: THREE.Group | null = null;
  private chompGroup: THREE.Group | null = null;
  private chainLinks: { group: THREE.Group; sprite: any }[] = [];
  private lavaTexture: THREE.Texture | null = null;
  private buttonDomes: {
    dome: THREE.Mesh;
    upSprite: any;
    baseScaleY: number;
  }[] = [];
  private flagCloth: THREE.Group | null = null;
  private flowerTintable: THREE.MeshLambertMaterial[] = [];
  private flowerBaseColors: THREE.Color[] = [];
  private flowerGroup: THREE.Group | null = null;
  private fireballInstances: THREE.InstancedMesh | null = null;
  private fireballDummy: THREE.Object3D = new THREE.Object3D();
  private mirrorShardPools: {
    models: THREE.Group[];
    bullets: any;
  }[] = [];

  constructor(game: SmashedGame) {
    this.game = game;

    ////////////////////////////////////////
    // CANVAS + RENDERER
    ////////////////////////////////////////
    const oldCanvas = document.getElementById('three-canvas');
    if (oldCanvas) {
      oldCanvas.remove();
    }
    const phaserCanvas = game.game.canvas;
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'three-canvas';
    this.canvas.style.position = 'absolute';
    this.canvas.style.left = '0';
    this.canvas.style.top = '0';
    this.canvas.style.zIndex = '0';
    this.canvas.style.pointerEvents = 'none';
    if (phaserCanvas.parentElement) {
      phaserCanvas.parentElement.insertBefore(this.canvas, phaserCanvas);
    }
    // Phaser canvas (transparent) stays on top for HUD + particles.
    phaserCanvas.style.position = 'relative';
    phaserCanvas.style.zIndex = '1';

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
    });
    this.renderer.setSize(
      SCREEN_DIMENSIONS.WIDTH,
      SCREEN_DIMENSIONS.HEIGHT,
      false
    );
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.setClearColor(0x000000, 0);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      FOV_DEGREES,
      SCREEN_DIMENSIONS.WIDTH / SCREEN_DIMENSIONS.HEIGHT,
      10,
      8000
    );

    this.buildLights();
    this.buildBackdrop();
    this.buildPlatforms();
    this.buildTableProp();
    this.buildPlayers();
    this.buildStageExtras();

    // Hide every mirrored sprite from the 2D render. Rendering-only:
    // physics bodies, overlaps and game logic are untouched.
    game.cameras.main.ignore(this.ignoreList.filter(Boolean));

    this.syncCanvasStyle();
    this.update(0);
  }

  ////////////////////////////////////////
  // BUILDERS
  ////////////////////////////////////////

  private track(sprite: any): void {
    if (sprite) {
      this.ignoreList.push(sprite);
    }
  }

  private addMirror(
    sprite: any,
    model: THREE.Group,
    z: number,
    opts?: { mirrorRotation?: boolean; mirrorFlip?: boolean }
  ): SpriteMirror {
    const holder = new THREE.Group();
    holder.position.z = z;
    holder.add(model);
    this.scene.add(holder);
    const mirror: SpriteMirror = {
      holder,
      model,
      sprite,
      mirrorRotation: !!opts?.mirrorRotation,
      mirrorFlip: !!opts?.mirrorFlip,
    };
    this.mirrors.push(mirror);
    this.track(sprite);
    return mirror;
  }

  private buildLights(): void {
    const hemisphere = new THREE.HemisphereLight(0xbdd4ff, 0x3a2a20, 0.95);
    this.scene.add(hemisphere);

    const sun = new THREE.DirectionalLight(0xfff2dd, 1.0);
    sun.position.set(
      SCREEN_DIMENSIONS.WIDTH * 0.25,
      600,
      900
    );
    sun.target.position.set(
      SCREEN_DIMENSIONS.WIDTH / 2,
      -SCREEN_DIMENSIONS.HEIGHT / 2,
      0
    );
    this.scene.add(sun);
    this.scene.add(sun.target);

    if (!this.game.debug.Simple_Stage) {
      // warm glow rising from the lava at the bottom of the stage
      const lavaGlow = new THREE.PointLight(0xff5511, 1.1, 2200, 2);
      lavaGlow.position.set(
        SCREEN_DIMENSIONS.WIDTH / 2,
        -SCREEN_DIMENSIONS.HEIGHT - 40,
        160
      );
      this.scene.add(lavaGlow);
    }
  }

  private buildBackdrop(): void {
    const nintendo = this.game.debug.Nintendo_Sprites;
    const centerX = SCREEN_DIMENSIONS.WIDTH / 2;
    const centerY = -SCREEN_DIMENSIONS.HEIGHT / 2;

    // Windows XP "Bliss" sky, far behind the stage
    const skyTexture = getImageTexture(
      nintendo ? 'images/darkxp.jpg' : 'images/darkxp_alt.jpg',
      { smooth: true }
    );
    const sky = new THREE.Mesh(
      new THREE.PlaneGeometry(
        SCREEN_DIMENSIONS.WIDTH * 2.6,
        SCREEN_DIMENSIONS.HEIGHT * 2.6
      ),
      new THREE.MeshBasicMaterial({ map: skyTexture })
    );
    sky.position.set(centerX, centerY, -1100);
    this.scene.add(sky);
    this.track(this.game.BACKGROUND);

    // stage outline layers, kept as flat art but separated in depth;
    // sized from the live sprites (the source images are larger than
    // the 1920x1080 world) and scale-compensated every frame so their
    // on-screen composition matches the 2D game exactly
    const outlinePlane = (url: string, sprite: any, z: number): void => {
      if (!sprite) {
        return;
      }
      const material = new THREE.MeshBasicMaterial({
        map: getImageTexture(url),
        transparent: true,
        depthWrite: false,
      });
      const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(sprite.displayWidth, sprite.displayHeight),
        material
      );
      plane.position.set(sprite.x, -sprite.y, z);
      this.scene.add(plane);
      this.screenLayers.push({ mesh: plane, z });
      this.track(sprite);
    };

    outlinePlane(
      nintendo
        ? 'images/outline_blocks_11_castle.png'
        : 'images/outline_blocks_11_castle_alt.png',
      this.game.BACKGROUND_OUTLINE_CASTLE,
      -160
    );
    outlinePlane(
      'images/outline_blocks_11_front.png',
      this.game.BACKGROUND_OUTLINE_FRONT,
      70
    );
    outlinePlane(
      'images/outline_blocks_11_lava.png',
      this.game.BACKGROUND_OUTLINE_LAVA,
      95
    );

    // boundary path graphics (only visible in dev mode) — hide in 3D
    this.track(this.game.gameBoundaryPath.graphics);

    // molten lava strip along the bottom, animated with the real frames
    this.lavaTexture = getImageTexture(
      'images/lava_oddVert_noPadding_256x39.png',
      { repeat: true }
    );
    this.lavaTexture.repeat.set(1 / LAVA_NUM_FRAMES, 1);
    const lavaMaterial = new THREE.MeshBasicMaterial({
      map: this.lavaTexture,
      transparent: true,
    });
    this.game.lavas.forEach((lava) => {
      if (!lava.sprite) {
        return;
      }
      const w = lava.sprite.displayWidth;
      const h = lava.sprite.displayHeight;
      const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        lavaMaterial
      );
      // lava sprites use origin (0,0) => convert to center
      plane.position.set(
        lava.sprite.x + w / 2,
        -(lava.sprite.y + h / 2),
        24
      );
      this.scene.add(plane);
      this.track(lava.sprite);
    });
  }

  private buildPlatforms(): void {
    const nintendo = this.game.debug.Nintendo_Sprites;
    const prefix = nintendo ? 'images/' : 'images/alt_';
    const urlByKey: { [key: string]: string } = {
      platformHorizontal: prefix + 'brickhoriz.bmp',
      platformShort: prefix + 'brickhorizshorter.bmp',
      platformVertical: prefix + 'brickvert.bmp',
      brick: prefix + 'blockcracked.png',
    };

    const children: any[] = this.game.PLATFORMS?.getChildren?.() || [];
    children.forEach((platform: any) => {
      const url = urlByKey[platform.texture?.key] || urlByKey.brick;
      const block = buildPlatformBlock(
        platform.displayWidth,
        platform.displayHeight,
        PLATFORM_DEPTH,
        url
      );
      block.position.set(platform.x, -platform.y, 0);
      this.scene.add(block);
      this.track(platform);
    });
  }

  private buildTableProp(): void {
    const table = this.game.TABLE;
    if (!table) {
      return;
    }
    const model = buildTable(table.displayWidth, table.displayHeight);
    this.addMirror(table, model, 0, { mirrorRotation: true });
  }

  private buildPlayers(): void {
    const nintendo = this.game.debug.Nintendo_Sprites;

    this.game.players.forEach((player, playerIndex) => {
      const characterId: CharacterId =
        this.game.playerChoicesCharacterType[playerIndex];

      const rig = new CharacterRig(characterId, nintendo);
      this.scene.add(rig.root);
      this.rigs.push({ rig, player, playerIndex });
      this.track(player.char.sprite);

      // physical attack (fist / sword)
      const ap = player.char.attackPhysical;
      if (ap.sprite) {
        const apModel = buildAttackModelForKey(
          ap.sprite.texture?.key || 'fist-gray',
          ap.sprite.displayWidth,
          ap.sprite.displayHeight,
          nintendo
        );
        this.addMirror(ap.sprite, apModel, 12, {
          mirrorRotation: true,
          mirrorFlip: true,
        });
      }

      // energy attack (fireball / sword / bottle / mirror / hammer / shell)
      const ae = player.char.attackEnergy;
      if (ae.sprite) {
        const aeModel = buildAttackModelForKey(
          ae.sprite.texture?.key || 'fireball',
          ae.sprite.displayWidth,
          ae.sprite.displayHeight,
          nintendo
        );
        this.addMirror(ae.sprite, aeModel, 12, {
          mirrorRotation: true,
          mirrorFlip: true,
        });
      }

      // bullet pool (Kirby's mirror shards)
      const bullets = ae.attackBullets?.bullets;
      if (bullets) {
        const models: THREE.Group[] = [];
        bullets.getChildren().forEach((bullet: any) => {
          const model = buildAttackModelForKey(
            bullet.texture?.key || ae.srcImage,
            bullet.displayWidth || 30,
            bullet.displayHeight || 30,
            nintendo
          );
          model.visible = false;
          this.scene.add(model);
          models.push(model);
          this.track(bullet);
        });
        this.mirrorShardPools.push({ models, bullets });
      }
    });
  }

  private buildStageExtras(): void {
    const game = this.game;

    ////////////////////////////////////////
    // CHOMP + CHAIN
    ////////////////////////////////////////
    if (game.chomp.sprite) {
      const diameter = game.chomp.sprite.displayWidth;
      const { group, jaw } = buildChomp(diameter);
      this.scene.add(group);
      this.chompGroup = group;
      this.chompJaw = jaw;
      this.track(game.chomp.sprite);

      game.chomp.links.forEach((link) => {
        if (!link.sprite) {
          return;
        }
        const linkGroup = buildChainLink(link.sprite.displayWidth * 0.8);
        this.scene.add(linkGroup);
        this.chainLinks.push({ group: linkGroup, sprite: link.sprite });
        this.track(link.sprite);
      });
    }

    ////////////////////////////////////////
    // FLAG: POLE + CLOTH + SPIKES + BUTTONS
    ////////////////////////////////////////
    const flag = game.flag;
    if (flag.spriteFlagPole) {
      const pole = buildPole(
        flag.spriteFlagPole.displayWidth,
        flag.spriteFlagPole.displayHeight
      );
      pole.position.set(flag.spriteFlagPole.x, -flag.spriteFlagPole.y, -8);
      this.scene.add(pole);
      this.track(flag.spriteFlagPole);
    }
    if (flag.spriteFlagMover) {
      const cloth = buildFlag(
        flag.spriteFlagMover.displayWidth,
        flag.spriteFlagMover.displayHeight
      );
      const mirror = this.addMirror(flag.spriteFlagMover, cloth, -4);
      this.flagCloth = mirror.model;
    }
    this.track(flag.spriteFlagStationary);
    if (flag.flagSpikes.sprite) {
      const spikes = buildSpikes(
        flag.flagSpikes.sprite.displayWidth,
        flag.flagSpikes.sprite.displayHeight
      );
      this.addMirror(flag.flagSpikes.sprite, spikes, 0);
    }
    if (flag.flagButton.spriteUp) {
      this.buildButton(flag.flagButton.spriteUp, flag.flagButton.spriteDown);
    }

    ////////////////////////////////////////
    // BULLET BILL COMBO
    ////////////////////////////////////////
    const bb = game.bulletBillCombo;
    if (bb.cannon.sprite) {
      const cannon = buildCannon(
        bb.cannon.sprite.displayWidth,
        bb.cannon.sprite.displayHeight
      );
      this.addMirror(bb.cannon.sprite, cannon, 0);
    }
    if (bb.bullet.sprite) {
      const bullet = buildBulletBill(
        bb.bullet.sprite.displayWidth,
        bb.bullet.sprite.displayHeight,
        null
      );
      this.addMirror(bb.bullet.sprite, bullet, 6);
    }
    bb.bullet.sprites_colored.forEach((coloredSprite: any, i: number) => {
      if (!coloredSprite) {
        return;
      }
      const colored = buildBulletBill(
        coloredSprite.displayWidth,
        coloredSprite.displayHeight,
        game.colorCircles[i]?.colorNumber ?? null
      );
      this.addMirror(coloredSprite, colored, 6);
    });
    if (bb.button.spriteUp) {
      this.buildButton(bb.button.spriteUp, bb.button.spriteDown);
    }

    // towers: tall brick columns carrying the real tower art
    for (const tower of [bb.towerCenter, bb.towerLeft]) {
      if (!tower.sprite) {
        continue;
      }
      const url =
        tower === bb.towerCenter
          ? game.debug.Nintendo_Sprites
            ? 'images/bullet_bill_line_tower.png'
            : 'images/bullet_bill_line_tower_alt.png'
          : game.debug.Nintendo_Sprites
          ? 'images/bullet_bill_line_tower_left.png'
          : 'images/bullet_bill_line_tower_left_alt.png';
      const block = buildPlatformBlock(
        tower.sprite.displayWidth,
        tower.sprite.displayHeight,
        60,
        url
      );
      block.position.set(tower.sprite.x, -tower.sprite.y, -30);
      this.scene.add(block);
      this.track(tower.sprite);
    }

    // fuse wire from the button to the cannon, as a dark 3D cable
    if (bb.sparkLine.graphics) {
      const points = bb.sparkLine.pathPoints.map(
        (p) => new THREE.Vector3(p.x, -p.y, -14)
      );
      if (points.length >= 2) {
        const curve = new THREE.CatmullRomCurve3(points);
        const tube = new THREE.Mesh(
          new THREE.TubeGeometry(curve, 64, 5, 6, false),
          new THREE.MeshLambertMaterial({ color: 0x0a0a0a })
        );
        this.scene.add(tube);
      }
      this.track(bb.sparkLine.graphics);
    }

    ////////////////////////////////////////
    // FIRE FLOWER
    ////////////////////////////////////////
    const ff = game.fireFlower;
    if (ff.sprite) {
      const { group, tintable } = buildFireFlower(
        ff.sprite.displayWidth,
        ff.sprite.displayHeight,
        !game.debug.Nintendo_Sprites
      );
      this.addMirror(ff.sprite, group, 0);
      this.flowerGroup = group;
      this.flowerTintable = tintable;
      this.flowerBaseColors = tintable.map((m) => m.color.clone());
    }

    // fire flower bullets: instanced glowing orbs (up to 1000 of them)
    const ffBullets = ff.attackBullets?.bullets;
    if (ffBullets) {
      const children = ffBullets.getChildren();
      const geometry = new THREE.SphereGeometry(1, 10, 8);
      const material = new THREE.MeshLambertMaterial({
        color: game.debug.Nintendo_Sprites ? 0xff7711 : 0x66ccff,
        emissive: game.debug.Nintendo_Sprites ? 0xff5500 : 0x2288cc,
      });
      this.fireballInstances = new THREE.InstancedMesh(
        geometry,
        material,
        children.length
      );
      this.fireballInstances.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      this.scene.add(this.fireballInstances);
      children.forEach((bullet: any) => this.track(bullet));
    }

    ////////////////////////////////////////
    // EXPLOSIONS (chomp darkness + bullet bill)
    ////////////////////////////////////////
    const explosionSprites: any[] = [];
    game.chomp.darknessMoments.explosions.forEach((e) =>
      explosionSprites.push(e.sprite)
    );
    game.chomp.darknessMoments.explosionsFront.forEach((e) =>
      explosionSprites.push(e.sprite)
    );
    explosionSprites.push(game.bulletBillCombo.bullet.explosionSprite);

    explosionSprites.forEach((sprite) => {
      if (!sprite) {
        return;
      }
      const baseRadius = sprite.displayWidth / 2;
      const { group, material } = buildExplosion(baseRadius);
      group.visible = false;
      this.scene.add(group);
      this.explosionMirrors.push({ group, material, sprite, baseRadius });
      this.track(sprite);
    });
  }

  private buildButton(upSprite: any, downSprite: any): void {
    const { group, dome } = buildPSwitch(
      upSprite.displayWidth,
      upSprite.displayHeight
    );
    // button sprites use origin (0.5, 1) => model is built bottom-anchored
    const holder = new THREE.Group();
    holder.add(group);
    this.scene.add(holder);
    this.buttonDomes.push({ dome, upSprite, baseScaleY: dome.scale.y });
    this.mirrors.push({
      holder,
      model: group,
      sprite: upSprite,
      mirrorRotation: false,
      mirrorFlip: false,
    });
    this.track(upSprite);
    this.track(downSprite);
  }

  ////////////////////////////////////////
  // PER-FRAME SYNC
  ////////////////////////////////////////

  private syncCanvasStyle(): void {
    const phaserCanvas = this.game.game.canvas;
    const style = this.canvas.style;
    if (style.width !== phaserCanvas.style.width) {
      style.width = phaserCanvas.style.width;
    }
    if (style.height !== phaserCanvas.style.height) {
      style.height = phaserCanvas.style.height;
    }
    if (style.marginLeft !== phaserCanvas.style.marginLeft) {
      style.marginLeft = phaserCanvas.style.marginLeft;
    }
    if (style.marginTop !== phaserCanvas.style.marginTop) {
      style.marginTop = phaserCanvas.style.marginTop;
    }
  }

  private syncCamera(): void {
    const cam = this.game.cameras.main;
    const zoom = cam.zoom || 1;
    const halfHeight = SCREEN_DIMENSIONS.HEIGHT / zoom / 2;
    const distance =
      halfHeight / Math.tan(THREE.MathUtils.degToRad(FOV_DEGREES / 2));
    this.camera.position.set(cam.midPoint.x, -cam.midPoint.y, distance);
    this.camera.lookAt(cam.midPoint.x, -cam.midPoint.y, 0);

    // keep screen-composition layers the same apparent size as in 2D:
    // a plane at depth z projects larger/smaller by distance/(distance-z),
    // so pre-scale by the inverse
    this.screenLayers.forEach(({ mesh, z }) => {
      const factor = (distance - z) / distance;
      mesh.scale.setScalar(factor);
    });
  }

  private syncMirror(mirror: SpriteMirror): void {
    const sprite = mirror.sprite;
    if (!sprite) {
      mirror.holder.visible = false;
      return;
    }
    const active = sprite.active !== false;
    mirror.holder.visible = !!sprite.visible && sprite.alpha > 0.01 && active;
    if (!mirror.holder.visible) {
      return;
    }
    mirror.holder.position.x = sprite.x;
    mirror.holder.position.y = -sprite.y;
    if (mirror.mirrorRotation) {
      mirror.holder.rotation.z = -(sprite.rotation || 0);
    }
    if (mirror.mirrorFlip) {
      mirror.model.rotation.y = sprite.flipX ? Math.PI : 0;
    }
  }

  private syncPlayers(dt: number): void {
    const game = this.game;
    this.rigs.forEach(({ rig, player, playerIndex }) => {
      const sprite = player.char.sprite;
      if (!sprite) {
        rig.root.visible = false;
        return;
      }
      rig.root.visible = !!sprite.visible && sprite.alpha > 0.01;
      rig.update({
        x: sprite.x,
        y: sprite.y,
        displayHeight: sprite.displayHeight,
        flipX: !!sprite.flipX,
        spriteState: player.char.ssCurr.name,
        velX: sprite.body?.velocity?.x || 0,
        velY: sprite.body?.velocity?.y || 0,
        isHurt: player.state.name === 'player-state-hurt',
        isDead: player.state.name === 'player-state-dead',
        isAttacking:
          player.char.attackPhysical.state.name === 'attackphysical-state-on',
        powerState: player.char.powerStateCurr.name,
        charsColored: !!game.debug.Chars_Colored,
        playerColor: game.colorCircles[playerIndex]?.colorNumber ?? 0xffffff,
        dt,
        t: this.elapsed,
      });
    });

    // Kirby's mirror-shard bullets
    this.mirrorShardPools.forEach((pool) => {
      const children = pool.bullets.getChildren();
      children.forEach((bullet: any, i: number) => {
        const model = pool.models[i];
        if (!model) {
          return;
        }
        const show = bullet.active && bullet.visible;
        model.visible = show;
        if (show) {
          model.position.set(bullet.x, -bullet.y, 12);
          model.rotation.z = -(bullet.rotation || 0);
        }
      });
    });
  }

  private syncStageExtras(): void {
    const game = this.game;

    // chomp: position + jaw chewing driven by the real animation frame
    if (this.chompGroup && game.chomp.sprite) {
      const sprite = game.chomp.sprite;
      this.chompGroup.visible = !!sprite.visible;
      // chomp sprite origin is (0.5, 1) => y is already the bottom
      this.chompGroup.position.set(sprite.x, -sprite.y, 0);
      this.chompGroup.rotation.y = sprite.flipX ? Math.PI * 0.15 : -Math.PI * 0.15;
      const scaleRatio = sprite.scaleX / game.chomp.scaleChompNormal;
      this.chompGroup.scale.setScalar(Math.max(0.01, scaleRatio));
      if (this.chompJaw) {
        const frame = Number(sprite.frame?.name) || 0;
        const openAmount = frame / 3;
        this.chompJaw.rotation.x = openAmount * 0.55;
      }
    }
    this.chainLinks.forEach(({ group, sprite }) => {
      group.visible = !!sprite.visible;
      group.position.set(sprite.x, -sprite.y + sprite.displayHeight / 2, -26);
    });

    // lava frame scroll
    if (this.lavaTexture && game.lavas[0]?.sprite) {
      const frame = Number(game.lavas[0].sprite.frame?.name) || 0;
      this.lavaTexture.offset.x = frame / LAVA_NUM_FRAMES;
    }

    // flag cloth wave
    if (this.flagCloth) {
      this.flagCloth.rotation.y = Math.sin(this.elapsed * 2.4) * 0.22;
    }

    // buttons: dome squashes down when pressed
    this.buttonDomes.forEach(({ dome, upSprite, baseScaleY }) => {
      const isUp = upSprite.alpha > 0.5;
      const target = baseScaleY * (isUp ? 1 : 0.28);
      dome.scale.y += (target - dome.scale.y) * 0.3;
    });

    // fire flower inherits the 2D tint (grey when inactive, white when hot)
    if (this.flowerGroup && game.fireFlower.sprite) {
      const tint = new THREE.Color(game.fireFlower.sprite.tintTopLeft ?? 0xffffff);
      this.flowerTintable.forEach((material, i) => {
        material.color.copy(this.flowerBaseColors[i]).multiply(tint);
      });
    }

    // fire flower bullets (instanced)
    const ffBullets = game.fireFlower.attackBullets?.bullets;
    if (this.fireballInstances && ffBullets) {
      const children = ffBullets.getChildren();
      const dummy = this.fireballDummy;
      children.forEach((bullet: any, i: number) => {
        if (bullet.active && bullet.visible) {
          dummy.position.set(bullet.x, -bullet.y, 12);
          const r = Math.max(2, bullet.displayWidth / 2);
          dummy.scale.setScalar(r);
        } else {
          dummy.position.set(0, 10000, 0);
          dummy.scale.setScalar(0.001);
        }
        dummy.updateMatrix();
        this.fireballInstances!.setMatrixAt(i, dummy.matrix);
      });
      this.fireballInstances.instanceMatrix.needsUpdate = true;
    }

    // explosions: grow + fade with the real animation progress
    this.explosionMirrors.forEach((explosion) => {
      const sprite = explosion.sprite;
      const playing = !!sprite?.anims?.isPlaying;
      explosion.group.visible = playing && sprite.visible && sprite.alpha > 0.01;
      if (!explosion.group.visible) {
        return;
      }
      const progress = sprite.anims.getProgress
        ? sprite.anims.getProgress()
        : 0.5;
      explosion.group.position.set(sprite.x, -sprite.y, 30);
      const scale = 0.35 + progress * 1.05;
      explosion.group.scale.setScalar(scale);
      explosion.material.opacity = Math.max(0, 0.95 * (1 - progress * progress));
    });
  }

  ////////////////////////////////////////
  // PUBLIC API
  ////////////////////////////////////////

  update(deltaMs: number): void {
    if (this.destroyed) {
      return;
    }
    const dt = Math.min(deltaMs / 1000, 0.05);
    this.elapsed += dt;

    this.syncCanvasStyle();
    this.syncCamera();
    this.mirrors.forEach((mirror) => this.syncMirror(mirror));
    this.syncPlayers(dt);
    this.syncStageExtras();

    this.renderer.render(this.scene, this.camera);
  }

  destroy(): void {
    if (this.destroyed) {
      return;
    }
    this.destroyed = true;
    this.scene.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (mesh.geometry) {
        mesh.geometry.dispose();
      }
      const material = (mesh as any).material;
      if (Array.isArray(material)) {
        material.forEach((m) => m.dispose());
      } else if (material) {
        material.dispose();
      }
    });
    this.renderer.dispose();
    this.canvas.remove();
    disposeAllCachedTextures();
  }
}

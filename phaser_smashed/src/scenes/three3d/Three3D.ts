import * as THREE from 'three';
import SmashedGame, { SCREEN_DIMENSIONS } from '../SmashedGame';
import { CharacterId, Player } from '../types';
import { buildEnvironment, EnvironmentHandles } from './environment';
import {
  buildAttackModelForKey,
  buildBulletBill,
  buildCannon,
  buildChainLink,
  buildChomp,
  buildExplosion,
  buildFireFlower,
  buildFirework,
  buildFlag,
  buildLeaderMarker,
  buildPSwitch,
  buildPlatformBlock,
  buildPole,
  buildSpikes,
  buildTable,
  buildTowerColumn,
  waveFlagCloth,
  PlatformVariant,
  PSwitchHandles,
} from './models';
import { CharacterRig } from './rigs';
import { disposeAllCachedTextures } from './textures';

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
//
// The 3D world uses NO original 2D image assets: all surfaces
// are procedural canvas textures on real geometry (see
// textures.ts / environment.ts), themed around warm terracotta
// masonry, cream trim, slate steel and molten gold.
////////////////////////////////////////////////////////////

const FOV_DEGREES = 45;
const PLATFORM_DEPTH = 90;

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
  private environment: EnvironmentHandles | null = null;

  // special-cased props
  private chompJaw: THREE.Group | null = null;
  private chompGroup: THREE.Group | null = null;
  private chainLinks: { group: THREE.Group; sprite: any }[] = [];
  private buttons: { handles: PSwitchHandles; upSprite: any; baseScaleY: number }[] =
    [];
  private flagClothMesh: THREE.Mesh | null = null;
  private fireworkRig: {
    group: THREE.Group;
    rays: {
      mesh: THREE.Mesh;
      dir: THREE.Vector3;
      material: THREE.MeshLambertMaterial;
    }[];
    sprite: any;
    radius: number;
  } | null = null;
  private leaderMarker: { group: THREE.Group; sprite: any } | null = null;
  private flowerTintable: THREE.MeshLambertMaterial[] = [];
  private flowerBaseColors: THREE.Color[] = [];
  private flowerGroup: THREE.Group | null = null;
  private fireballInstances: THREE.InstancedMesh | null = null;
  private fireballDummy: THREE.Object3D = new THREE.Object3D();
  private mirrorShardPools: {
    models: THREE.Group[];
    bullets: any;
  }[] = [];

  private sunLight: THREE.DirectionalLight | null = null;
  private hemisphereLight: THREE.HemisphereLight | null = null;

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
      12000
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
    this.hemisphereLight = new THREE.HemisphereLight(0xbdd4ff, 0x3a2a20, 0.95);
    this.scene.add(this.hemisphereLight);

    this.sunLight = new THREE.DirectionalLight(0xfff2dd, 1.0);
    this.sunLight.position.set(SCREEN_DIMENSIONS.WIDTH * 0.25, 600, 900);
    this.sunLight.target.position.set(
      SCREEN_DIMENSIONS.WIDTH / 2,
      -SCREEN_DIMENSIONS.HEIGHT / 2,
      0
    );
    this.scene.add(this.sunLight);
    this.scene.add(this.sunLight.target);

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
    // hide every 2D backdrop / outline / lava sprite; the procedural
    // environment replaces all of them
    this.track(this.game.BACKGROUND);
    this.track(this.game.BACKGROUND_OUTLINE_CASTLE);
    this.track(this.game.BACKGROUND_OUTLINE_FRONT);
    this.track(this.game.BACKGROUND_OUTLINE_LAVA);
    this.track(this.game.gameBoundaryPath.graphics);
    this.game.lavas.forEach((lava) => this.track(lava.sprite));

    this.environment = buildEnvironment(this.scene, {
      centerX: SCREEN_DIMENSIONS.WIDTH / 2,
      centerY: -SCREEN_DIMENSIONS.HEIGHT / 2,
      sunLight: this.sunLight!,
      hemisphereLight: this.hemisphereLight!,
      boundaryPathPoints: this.game.gameBoundaryPath.pathPoints,
      includeLava: !this.game.debug.Simple_Stage,
    });
  }

  private buildPlatforms(): void {
    const variantByKey: { [key: string]: PlatformVariant } = {
      platformHorizontal: 'bricks',
      platformShort: 'bricks',
      platformVertical: 'bricks',
      brick: 'cracked',
    };

    const children: any[] = this.game.PLATFORMS?.getChildren?.() || [];
    children.forEach((platform: any) => {
      const variant = variantByKey[platform.texture?.key] || 'cracked';
      const block = buildPlatformBlock(
        platform.displayWidth,
        platform.displayHeight,
        PLATFORM_DEPTH,
        variant
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
    // FLAG: POLE + CLOTH + SPIKES + BUTTONS + FIREWORK + LEADER MARKER
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
      const { group, cloth } = buildFlag(
        flag.spriteFlagMover.displayWidth,
        flag.spriteFlagMover.displayHeight
      );
      this.addMirror(flag.spriteFlagMover, group, -4);
      this.flagClothMesh = cloth;
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
    if (flag.firework) {
      const radius = flag.firework.displayWidth / 2 || 300;
      const { group, rays } = buildFirework(radius);
      group.visible = false;
      this.scene.add(group);
      this.fireworkRig = { group, rays, sprite: flag.firework, radius };
      this.track(flag.firework);
    }
    if (flag.spriteFlagChar) {
      const marker = buildLeaderMarker(60);
      marker.visible = false;
      this.scene.add(marker);
      this.leaderMarker = { group: marker, sprite: flag.spriteFlagChar };
      this.track(flag.spriteFlagChar);
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

    // towers: procedural brick watchtower columns
    for (const tower of [bb.towerCenter, bb.towerLeft]) {
      if (!tower.sprite) {
        continue;
      }
      const column = buildTowerColumn(
        tower.sprite.displayWidth,
        tower.sprite.displayHeight
      );
      column.position.set(tower.sprite.x, -tower.sprite.y, -30);
      this.scene.add(column);
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
    const handles = buildPSwitch(
      upSprite.displayWidth,
      upSprite.displayHeight
    );
    // button sprites use origin (0.5, 1) => model is built bottom-anchored
    const holder = new THREE.Group();
    holder.add(handles.group);
    this.scene.add(holder);
    this.buttons.push({
      handles,
      upSprite,
      baseScaleY: handles.dome.scale.y,
    });
    this.mirrors.push({
      holder,
      model: handles.group,
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
      this.chompGroup.rotation.y = sprite.flipX
        ? Math.PI * 0.15
        : -Math.PI * 0.15;
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

    // flag cloth ripples in the wind
    if (this.flagClothMesh) {
      waveFlagCloth(this.flagClothMesh, this.elapsed);
    }

    // buttons: two clear states — armed (up, blue, cool ring) and
    // active (pressed, squashed, molten glow)
    this.buttons.forEach(({ handles, upSprite, baseScaleY }) => {
      const isUp = upSprite.alpha > 0.5;
      const targetScale = baseScaleY * (isUp ? 1 : 0.22);
      handles.dome.scale.y += (targetScale - handles.dome.scale.y) * 0.3;
      if (isUp) {
        handles.domeMaterial.color.setHex(0x4169e1);
        handles.domeMaterial.emissive.setHex(0x0a1030);
        handles.ringMaterial.color.setHex(0xf4f0e0);
        handles.ringMaterial.emissive.setHex(0x555540);
      } else {
        handles.domeMaterial.color.setHex(0x8a8a8a);
        handles.domeMaterial.emissive.setHex(0x220800);
        handles.ringMaterial.color.setHex(0xff5511);
        const pulse = 0.5 + Math.sin(this.elapsed * 10) * 0.5;
        handles.ringMaterial.emissive.setRGB(0.9 * pulse, 0.25 * pulse, 0.02);
      }
    });

    // firework burst on flag completion
    if (this.fireworkRig) {
      const sprite = this.fireworkRig.sprite;
      const playing = !!sprite?.anims?.isPlaying && sprite.alpha > 0.01;
      this.fireworkRig.group.visible = playing;
      if (playing) {
        const progress = sprite.anims.getProgress
          ? sprite.anims.getProgress()
          : 0.5;
        this.fireworkRig.group.position.set(sprite.x, -sprite.y, 40);
        this.fireworkRig.rays.forEach(({ mesh, dir, material }, i) => {
          const wave = (progress + (i % 4) * 0.04) % 1;
          const reach = this.fireworkRig!.radius * (0.15 + wave * 0.95);
          mesh.position.copy(dir).multiplyScalar(reach);
          const shrink = 1 - wave * 0.7;
          mesh.scale.setScalar(Math.max(0.05, shrink));
          material.opacity = Math.max(0, 1 - wave * wave);
        });
      }
    }

    // spinning gold beacon where the 2D flag shows the leader silhouette
    if (this.leaderMarker) {
      const sprite = this.leaderMarker.sprite;
      const show = !!sprite?.visible && sprite.alpha > 0.01;
      this.leaderMarker.group.visible = show;
      if (show) {
        this.leaderMarker.group.position.set(sprite.x, -sprite.y, 10);
        this.leaderMarker.group.rotation.y = this.elapsed * 3;
      }
    }

    // fire flower inherits the 2D tint (grey when inactive, white when hot)
    if (this.flowerGroup && game.fireFlower.sprite) {
      const tint = new THREE.Color(
        game.fireFlower.sprite.tintTopLeft ?? 0xffffff
      );
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
      explosion.group.visible =
        playing && sprite.visible && sprite.alpha > 0.01;
      if (!explosion.group.visible) {
        return;
      }
      const progress = sprite.anims.getProgress
        ? sprite.anims.getProgress()
        : 0.5;
      explosion.group.position.set(sprite.x, -sprite.y, 30);
      const scale = 0.35 + progress * 1.05;
      explosion.group.scale.setScalar(scale);
      explosion.material.opacity = Math.max(
        0,
        0.95 * (1 - progress * progress)
      );
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
    if (this.environment) {
      this.environment.update(dt, this.elapsed);
    }
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

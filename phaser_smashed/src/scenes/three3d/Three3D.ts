import * as THREE from 'three';
import SmashedGame, { SCREEN_DIMENSIONS } from '../SmashedGame';
import { CharacterId, Player } from '../types';
import { buildEnvironment, EnvironmentHandles } from './environment';
import {
  buildAttackModelForKey,
  buildBulletBill,
  buildCable,
  buildCannon,
  buildChainBeast,
  buildChainLink,
  buildExplosion,
  buildFireFlower,
  buildFirework,
  buildFlag,
  buildLeaderMarker,
  buildPSwitch,
  buildPlatformBlock,
  buildPole,
  buildSpikes,
  buildStringHolder,
  buildTable,
  buildWallSpikeRow,
  waveFlagCloth,
  PlatformVariant,
  PSwitchHandles,
} from './models';
import { getBrickPatternTexture, THEME } from './textures';
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
  private beastLegs: THREE.Group[] = [];
  private chainLinks: { group: THREE.Group; sprite: any }[] = [];
  private buttons: {
    handles: PSwitchHandles;
    baseScaleY: number;
    getIsUp: () => boolean;
  }[] = [];
  private leftWallSpikesMirror: {
    group: THREE.Group;
    sprite: any;
  } | null = null;
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
      lavaPools: this.game.debug.Simple_Stage
        ? []
        : [
            { centerX: 1165, width: 470, surfaceY: 1140 }, // the pit
            { centerX: 1785, width: 260, surfaceY: 1140 }, // under the flag
          ],
    });
  }

  private buildPlatforms(): void {
    const variantByKey: { [key: string]: PlatformVariant } = {
      platformHorizontal: 'bricks',
      platformShort: 'bricks',
      platformVertical: 'bricks',
      brick: 'cracked',
    };

    // Blocks belonging to the big staircase mass are not drawn as
    // boxes: the whole mass is rendered as one smooth masonry ramp
    // (matching the custom slope physics the characters glide on).
    const isStairMassBlock = (platform: any): boolean => {
      if (this.game.debug.Stage !== 12 || platform.texture?.key !== 'brick') {
        return false;
      }
      const x = platform.x;
      const y = platform.y;
      if (x < 975 || x > 1640) {
        return false;
      }
      const j = (1617 - x) / 33;
      return y >= 754 + 34 * j - 20;
    };

    const children: any[] = this.game.PLATFORMS?.getChildren?.() || [];
    children.forEach((platform: any) => {
      this.track(platform);
      if (isStairMassBlock(platform)) {
        return;
      }
      const variant = variantByKey[platform.texture?.key] || 'cracked';
      const block = buildPlatformBlock(
        platform.displayWidth,
        platform.displayHeight,
        PLATFORM_DEPTH,
        variant
      );
      block.position.set(platform.x, -platform.y, 0);
      this.scene.add(block);
    });

    if (this.game.debug.Stage === 12 && !this.game.debug.Simple_Stage) {
      this.buildSmoothCastleAdditions();
    }
  }

  /**
   * Stage 12 extras that can't be expressed as blocks: the smooth
   * staircase ramp (one connected masonry wedge running from the
   * rampart down into the central lava pool) and the deep castle
   * masses that extend the stage far downward around the two pools.
   */
  private buildSmoothCastleAdditions(): void {
    const masonry = getBrickPatternTexture('warm').clone();
    masonry.needsUpdate = true;
    masonry.repeat.set(1 / 66, 1 / 68); // extrude UVs are in world px
    const masonryMaterial = new THREE.MeshLambertMaterial({ map: masonry });

    // the ramp: surface line through the old step corners, filled
    // solid down to the castle depths
    const wedge = new THREE.Shape();
    wedge.moveTo(990, -1383);
    wedge.lineTo(1633, -720);
    wedge.lineTo(1655, -720);
    wedge.lineTo(1655, -2700);
    wedge.lineTo(990, -2700);
    wedge.closePath();
    const ramp = new THREE.Mesh(
      new THREE.ExtrudeGeometry(wedge, {
        depth: PLATFORM_DEPTH,
        bevelEnabled: false,
      }),
      masonryMaterial
    );
    ramp.position.z = -PLATFORM_DEPTH / 2;
    this.scene.add(ramp);

    // left castle mass under the low shelf, down to the depths
    const leftMass = buildPlatformBlock(988, 1340, PLATFORM_DEPTH, 'bricks');
    leftMass.position.set(486, -2030, 0);
    this.scene.add(leftMass);

    // right castle wall (below the rampart) running deep
    const rightWall = buildPlatformBlock(170, 1960, PLATFORM_DEPTH, 'bricks');
    rightWall.position.set(1990, -1720, 0);
    this.scene.add(rightWall);
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

      // physical attack: the character's own body IS the punch now, so
      // fist hitboxes get no model (the rig throws a real punch);
      // Link's sword still gets its blade
      const ap = player.char.attackPhysical;
      if (ap.sprite && !(ap.sprite.texture?.key || '').includes('fist')) {
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
      const { group, jaw, legs } = buildChainBeast(diameter);
      this.scene.add(group);
      this.chompGroup = group;
      this.chompJaw = jaw;
      this.beastLegs = legs;
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
      // spike-trigger button — red, like all spike buttons
      this.buildButton(
        flag.flagButton.spriteUp,
        flag.flagButton.spriteDown,
        0xd93a2b
      );
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
      // the fuse-spark button — blue, distinct from the red spike buttons
      this.buildButton(bb.button.spriteUp, bb.button.spriteDown, 0x4169e1);
    }

    // fuse wire from the button to the cannon: straight segments through
    // the EXACT gameplay path points the spark travels along
    const CABLE_Z = -12;
    const CABLE_RADIUS = 6;
    if (bb.sparkLine.graphics) {
      const points = bb.sparkLine.pathPoints.map(
        (p) => new THREE.Vector3(p.x, -p.y, CABLE_Z)
      );
      if (points.length >= 2) {
        this.scene.add(buildCable(points, CABLE_RADIUS));
      }
      this.track(bb.sparkLine.graphics);
    }

    // the two old "line tower" assets are the pylons HOLDING the fuse:
    // masonry posts with a pipe elbow right at the cable's bend
    for (const tower of [bb.towerCenter, bb.towerLeft]) {
      if (!tower.sprite) {
        continue;
      }
      const spriteX = tower.sprite.x;
      const spriteY = -tower.sprite.y;
      // find the cable bend this pylon is responsible for
      const pathPoints = bb.sparkLine.pathPoints;
      let bendIndex = 0;
      let bestDistance = Infinity;
      pathPoints.forEach((p, i) => {
        const d = Math.hypot(p.x - spriteX, -p.y - spriteY);
        if (d < bestDistance) {
          bestDistance = d;
          bendIndex = i;
        }
      });
      const bend = pathPoints[bendIndex];
      const hookOffset = new THREE.Vector3(
        bend.x - spriteX,
        -bend.y - spriteY,
        CABLE_Z
      );
      const inDir = new THREE.Vector3();
      const outDir = new THREE.Vector3();
      if (bendIndex > 0) {
        const prev = pathPoints[bendIndex - 1];
        inDir.set(prev.x - bend.x, -prev.y + bend.y, 0).normalize();
      }
      if (bendIndex < pathPoints.length - 1) {
        const next = pathPoints[bendIndex + 1];
        outDir.set(next.x - bend.x, -next.y + bend.y, 0).normalize();
      }
      const holder = buildStringHolder(
        tower.sprite.displayWidth,
        tower.sprite.displayHeight,
        hookOffset,
        inDir,
        outDir,
        CABLE_RADIUS
      );
      holder.position.set(spriteX, spriteY, 0);
      this.scene.add(holder);
      this.track(tower.sprite);
    }

    // left arena wall: same masonry as the platforms, with the cannon
    // recessed into a metal-ringed port and retractable spikes
    if (bb.cannon.sprite) {
      this.buildLeftWall(bb.cannon.sprite);
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

  private buildButton(
    upSprite: any,
    downSprite: any,
    domeColor: number
  ): void {
    const handles = buildPSwitch(
      upSprite.displayWidth,
      upSprite.displayHeight,
      domeColor
    );
    // button sprites use origin (0.5, 1) => model is built bottom-anchored
    const holder = new THREE.Group();
    holder.add(handles.group);
    this.scene.add(holder);
    this.buttons.push({
      handles,
      baseScaleY: handles.dome.scale.y,
      getIsUp: () => upSprite.alpha > 0.5,
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

  /**
   * The left arena wall: built from the same masonry as the stage
   * platforms, stretching away to the left "to infinity", with the
   * bullet-bill cannon recessed into a metal-ringed port. Its
   * retractable spikes and their trigger button are REAL gameplay
   * objects (game.leftWallCombo) mirrored here.
   */
  private buildLeftWall(cannonSprite: any): void {
    const wallRight = -8; // arena-facing face, just outside the boundary
    const wallWidth = 2600; // extends far off to the left
    const wallDepth = 150;
    const wallCenterX = wallRight - wallWidth / 2;

    const cannonY = -cannonSprite.y;
    const portHalf = cannonSprite.displayHeight * 0.42;
    const portTop = cannonY + portHalf;
    const portBottom = cannonY - portHalf;

    const wallTop = 170;
    const wallBottom = -1250;

    // masonry segments above and below the cannon port
    const upperHeight = wallTop - portTop;
    const upper = buildPlatformBlock(wallWidth, upperHeight, wallDepth, 'bricks');
    upper.position.set(wallCenterX, portTop + upperHeight / 2, 0);
    const lowerHeight = portBottom - wallBottom;
    const lower = buildPlatformBlock(wallWidth, lowerHeight, wallDepth, 'bricks');
    lower.position.set(wallCenterX, wallBottom + lowerHeight / 2, 0);
    this.scene.add(upper, lower);

    // recessed port: dark back panel + cream lintel and sill + metal ring
    const recess = new THREE.Mesh(
      new THREE.BoxGeometry(40, portTop - portBottom, wallDepth * 0.9),
      new THREE.MeshLambertMaterial({ color: 0x1a1d24 })
    );
    recess.position.set(wallRight - 320, cannonY, 0);
    const trimMaterial = new THREE.MeshLambertMaterial({ color: THEME.cream });
    const lintel = new THREE.Mesh(
      new THREE.BoxGeometry(360, 16, wallDepth * 1.06),
      trimMaterial
    );
    lintel.position.set(wallRight - 180, portTop + 8, 0);
    const sill = new THREE.Mesh(
      new THREE.BoxGeometry(360, 16, wallDepth * 1.06),
      trimMaterial
    );
    sill.position.set(wallRight - 180, portBottom - 8, 0);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(portHalf * 0.9, 12, 10, 22),
      new THREE.MeshLambertMaterial({ color: 0x30343c })
    );
    ring.rotation.y = Math.PI / 2;
    ring.position.set(wallRight - 2, cannonY, 0);
    this.scene.add(recess, lintel, sill, ring);

    // retractable spikes: mirror of the REAL lethal spikes sprite
    // (game.leftWallCombo.spikes), sliding out of the wall face
    const lw = this.game.leftWallCombo;
    if (lw.spikes.sprite) {
      const spikeLength = 90;
      const spikeYs = [-90, -45, 0, 45, 90];
      const spikes = buildWallSpikeRow(spikeYs, spikeLength, 20);
      this.scene.add(spikes);
      this.leftWallSpikesMirror = { group: spikes, sprite: lw.spikes.sprite };
      this.track(lw.spikes.sprite);
    }

    // the real trigger button at the bottom of the stairs — red like
    // every spike button
    if (lw.button.spriteUp) {
      this.buildButton(lw.button.spriteUp, lw.button.spriteDown, 0xd93a2b);
    }
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

    // buttons: two clear states — armed (up, in the button's own color:
    // red = spikes, blue = fuse spark) and active (pressed, squashed
    // gray dome, molten pulsing ring)
    this.buttons.forEach(({ handles, baseScaleY, getIsUp }) => {
      const isUp = getIsUp();
      const targetScale = baseScaleY * (isUp ? 1 : 0.22);
      handles.dome.scale.y += (targetScale - handles.dome.scale.y) * 0.3;
      if (isUp) {
        handles.domeMaterial.color.copy(handles.domeBaseColor);
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

    // left wall spikes track the real lethal spikes sprite, easing
    // between its retracted and extended positions
    if (this.leftWallSpikesMirror) {
      const sprite = this.leftWallSpikesMirror.sprite;
      const group = this.leftWallSpikesMirror.group;
      const targetX = sprite.x - 55; // cone bases inside the wall face
      group.position.x += (targetX - group.position.x) * 0.25;
      group.position.y = -sprite.y;
    }

    // the chained beast scuttles: legs paddle while it moves
    if (this.beastLegs.length > 0 && game.chomp.sprite) {
      const speed = Math.abs(game.chomp.sprite.body?.velocity?.x || 0);
      const rate = 6 + Math.min(14, speed * 0.2);
      this.beastLegs.forEach((leg, i) => {
        leg.rotation.z = Math.sin(this.elapsed * rate + i * 1.7) * 0.16;
        leg.rotation.x = Math.cos(this.elapsed * rate + i * 1.7) * 0.08;
      });
    }

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

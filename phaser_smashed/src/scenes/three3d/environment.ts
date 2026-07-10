import * as THREE from 'three';
import { Position } from '../types';
import {
  getBrickPatternTexture,
  getGrassTexture,
  getLavaTexture,
  getStuddedMetalTexture,
  makeCanvasTextureWH,
  THEME,
} from './textures';

////////////////////////////////////////////////////////////
// Environment for the pseudo-3D world — 100% procedural, no
// original 2D game art. A day/night cycle drives the sky tint,
// a sun and moon ride a slow wheel, puffy clouds drift and wrap,
// grassy hills roll in parallax layers, a stone castle tower
// stands behind the stage, the kill-boundary is a studded steel
// cage with inward spikes extruded from the REAL gameplay
// boundary polygon, and the pit is a churning lava pool.
////////////////////////////////////////////////////////////

const DAY_CYCLE_SECONDS = 150;

interface SkyKeyframe {
  phase: number;
  color: number;
}

// phase 0 = noon; 0.5 = midnight
const SKY_KEYFRAMES: SkyKeyframe[] = [
  { phase: 0, color: 0xffffff },
  { phase: 0.22, color: 0xffb27a },
  { phase: 0.32, color: 0x6a6f9e },
  { phase: 0.5, color: 0x39406b },
  { phase: 0.68, color: 0x6a6f9e },
  { phase: 0.78, color: 0xffb27a },
  { phase: 1, color: 0xffffff },
];

function skyColorAt(phase: number, out: THREE.Color): THREE.Color {
  const a = new THREE.Color();
  const b = new THREE.Color();
  for (let i = 0; i < SKY_KEYFRAMES.length - 1; i++) {
    const k0 = SKY_KEYFRAMES[i];
    const k1 = SKY_KEYFRAMES[i + 1];
    if (phase >= k0.phase && phase <= k1.phase) {
      const t = (phase - k0.phase) / (k1.phase - k0.phase);
      a.setHex(k0.color);
      b.setHex(k1.color);
      out.copy(a).lerp(b, t);
      return out;
    }
  }
  out.setHex(0xffffff);
  return out;
}

export interface EnvironmentHandles {
  update: (dt: number, t: number) => void;
}

export function buildEnvironment(
  scene: THREE.Scene,
  opts: {
    centerX: number;
    centerY: number; // three-space (negative world y)
    sunLight: THREE.DirectionalLight;
    hemisphereLight: THREE.HemisphereLight;
    boundaryPathPoints: Position[];
    includeLava: boolean;
  }
): EnvironmentHandles {
  const updaters: Array<(dt: number, t: number) => void> = [];
  const { centerX, centerY } = opts;

  ////////////////////////////////////////
  // SKY DOME (gradient plane, tint cycles day -> night)
  ////////////////////////////////////////
  const skyTexture = makeCanvasTextureWH('sky_gradient', 8, 256, (ctx, w, h) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, THEME.skyTop);
    gradient.addColorStop(0.72, THEME.skyHorizon);
    gradient.addColorStop(1, '#d8ecf4');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
  });
  const skyMaterial = new THREE.MeshBasicMaterial({ map: skyTexture });
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(9000, 5200), skyMaterial);
  sky.position.set(centerX, centerY + 400, -1500);
  scene.add(sky);

  ////////////////////////////////////////
  // SUN + MOON on a slow wheel
  ////////////////////////////////////////
  const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffe9a8 });
  const sun = new THREE.Mesh(new THREE.SphereGeometry(95, 20, 14), sunMaterial);
  const sunHalo = new THREE.Mesh(
    new THREE.SphereGeometry(150, 20, 14),
    new THREE.MeshBasicMaterial({
      color: 0xffdd88,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  sun.add(sunHalo);
  scene.add(sun);

  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(70, 18, 12),
    new THREE.MeshBasicMaterial({ color: 0xe8ecf4 })
  );
  const moonShadow = new THREE.Mesh(
    new THREE.SphereGeometry(62, 18, 12),
    new THREE.MeshBasicMaterial({ color: 0x39406b })
  );
  moonShadow.position.set(24, 12, 30);
  moon.add(moonShadow); // crescent bite
  scene.add(moon);

  const skyTint = new THREE.Color();
  const sunColorDay = new THREE.Color(0xfff2dd);
  const sunColorDusk = new THREE.Color(0xff9a60);
  updaters.push((dt, t) => {
    const phase = (t / DAY_CYCLE_SECONDS) % 1;
    const angle = Math.PI / 2 + phase * Math.PI * 2; // noon at phase 0
    const elevation = Math.sin(angle);

    skyColorAt(phase, skyTint);
    skyMaterial.color.copy(skyTint);

    const wheelR = 1300;
    const horizonY = centerY - 350;
    sun.position.set(
      centerX - Math.cos(angle) * wheelR,
      horizonY + Math.max(-0.25, elevation) * 900,
      -1350
    );
    moon.position.set(
      centerX + Math.cos(angle) * wheelR,
      horizonY + Math.max(-0.25, -elevation) * 900,
      -1350
    );
    // keep whichever body is below the horizon hidden
    sun.visible = elevation > -0.08;
    moon.visible = -elevation > 0.08;

    // lighting follows the sun but never goes gameplay-dark
    const daylight = Math.max(0, elevation);
    opts.sunLight.intensity = 0.35 + 0.75 * daylight;
    opts.sunLight.color
      .copy(sunColorDusk)
      .lerp(sunColorDay, Math.min(1, daylight * 1.6));
    opts.sunLight.position.set(sun.position.x, sun.position.y + 500, 900);
    opts.hemisphereLight.intensity = 0.6 + 0.4 * daylight;
  });

  ////////////////////////////////////////
  // DRIFTING CLOUDS (puffball clusters, wrap around)
  ////////////////////////////////////////
  const cloudMaterial = new THREE.MeshLambertMaterial({
    color: THEME.cloud,
    transparent: true,
    opacity: 0.92,
  });
  const cloudRangeMinX = centerX - 2400;
  const cloudRangeMaxX = centerX + 2400;
  const clouds: { group: THREE.Group; speed: number }[] = [];
  for (let i = 0; i < 10; i++) {
    const cloud = new THREE.Group();
    const puffCount = 4 + (i % 3);
    for (let p = 0; p < puffCount; p++) {
      const r = 42 + ((i * 13 + p * 29) % 40);
      const puff = new THREE.Mesh(
        new THREE.SphereGeometry(r, 12, 9),
        cloudMaterial
      );
      puff.position.set(p * r * 1.15 - puffCount * r * 0.5, (p % 2) * r * 0.4, 0);
      puff.scale.y = 0.62;
      cloud.add(puff);
    }
    const depth = -420 - ((i * 97) % 500);
    cloud.position.set(
      cloudRangeMinX + ((i * 953) % (cloudRangeMaxX - cloudRangeMinX)),
      centerY + 420 + ((i * 211) % 480),
      depth
    );
    const s = 0.8 + ((i * 31) % 10) / 10;
    cloud.scale.setScalar(s);
    scene.add(cloud);
    clouds.push({ group: cloud, speed: 14 + ((i * 7) % 22) });
  }
  updaters.push((dt) => {
    clouds.forEach(({ group, speed }) => {
      group.position.x += speed * dt;
      if (group.position.x > cloudRangeMaxX) {
        group.position.x = cloudRangeMinX;
      }
    });
  });

  ////////////////////////////////////////
  // ROLLING HILLS (parallax layers)
  ////////////////////////////////////////
  const hillSpecs = [
    { x: centerX - 900, y: centerY - 1750, r: 2300, z: -1150, dark: false },
    { x: centerX + 1200, y: centerY - 1900, r: 2500, z: -1000, dark: true },
    { x: centerX - 100, y: centerY - 2050, r: 2800, z: -850, dark: false },
  ];
  hillSpecs.forEach((spec, i) => {
    const grass = getGrassTexture(spec.dark).clone();
    grass.needsUpdate = true;
    grass.repeat.set(10, 5);
    const hill = new THREE.Mesh(
      new THREE.SphereGeometry(spec.r, 28, 18),
      new THREE.MeshLambertMaterial({
        color: spec.dark ? THEME.grassDark : THEME.grass,
        map: grass,
      })
    );
    hill.scale.y = 0.5;
    hill.position.set(spec.x, spec.y, spec.z);
    scene.add(hill);
  });

  ////////////////////////////////////////
  // CASTLE TOWER (stone keep behind the stage)
  ////////////////////////////////////////
  const castle = new THREE.Group();
  const stoneTexture = getBrickPatternTexture('stone').clone();
  stoneTexture.needsUpdate = true;
  stoneTexture.repeat.set(130 / 66, 620 / 68);
  const stoneMaterial = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    map: stoneTexture,
  });
  const keep = new THREE.Mesh(new THREE.BoxGeometry(130, 620, 120), stoneMaterial);
  castle.add(keep);
  // crenellations
  const creNTexture = getBrickPatternTexture('stone').clone();
  creNTexture.needsUpdate = true;
  creNTexture.repeat.set(0.5, 0.6);
  const creMaterial = new THREE.MeshLambertMaterial({ map: creNTexture });
  for (let i = 0; i < 4; i++) {
    const merlon = new THREE.Mesh(new THREE.BoxGeometry(26, 34, 124), creMaterial);
    merlon.position.set(-52 + i * 34.5, 327, 0);
    castle.add(merlon);
  }
  // cap ledge
  const ledge = new THREE.Mesh(
    new THREE.BoxGeometry(150, 16, 136),
    new THREE.MeshLambertMaterial({ color: THEME.cream })
  );
  ledge.position.y = 310 - 8;
  castle.add(ledge);
  // arched doorway + window slits
  const dark = new THREE.MeshLambertMaterial({ color: 0x1e1812 });
  const door = new THREE.Mesh(new THREE.BoxGeometry(52, 90, 8), dark);
  door.position.set(0, -265, 58);
  const doorArch = new THREE.Mesh(
    new THREE.CylinderGeometry(26, 26, 8, 14, 1, false, 0, Math.PI),
    dark
  );
  doorArch.rotation.x = Math.PI / 2;
  doorArch.rotation.z = Math.PI / 2;
  doorArch.position.set(0, -220, 58);
  castle.add(door, doorArch);
  for (const wy of [-60, 120]) {
    const slit = new THREE.Mesh(new THREE.BoxGeometry(14, 46, 8), dark);
    slit.position.set(0, wy, 58);
    castle.add(slit);
  }
  castle.position.set(672, -770, -190);
  scene.add(castle);

  ////////////////////////////////////////
  // ARENA CAGE (extruded from the real kill boundary)
  ////////////////////////////////////////
  const points = opts.boundaryPathPoints;
  if (points && points.length >= 3) {
    const outer = new THREE.Shape();
    const OUT = 2400; // how far the wall extends past the stage
    outer.moveTo(centerX - OUT, centerY + OUT);
    outer.lineTo(centerX + OUT, centerY + OUT);
    outer.lineTo(centerX + OUT, centerY - OUT);
    outer.lineTo(centerX - OUT, centerY - OUT);
    outer.closePath();

    const hole = new THREE.Path();
    hole.moveTo(points[0].x, -points[0].y);
    for (let i = 1; i < points.length; i++) {
      hole.lineTo(points[i].x, -points[i].y);
    }
    hole.closePath();
    outer.holes.push(hole);

    const studTexture = getStuddedMetalTexture().clone();
    studTexture.needsUpdate = true;
    studTexture.repeat.set(1 / 64, 1 / 64); // extrude UVs are in world px
    const cageMaterial = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      map: studTexture,
    });
    const cage = new THREE.Mesh(
      new THREE.ExtrudeGeometry(outer, {
        depth: 150,
        bevelEnabled: false,
      }),
      cageMaterial
    );
    cage.position.z = -45;
    scene.add(cage);

    // inward spikes along the boundary — danger has teeth
    const spikeGeometry = new THREE.ConeGeometry(11, 30, 8);
    const spikeMaterial = new THREE.MeshLambertMaterial({
      color: THEME.metalLight,
    });
    const transforms: THREE.Matrix4[] = [];
    const dummy = new THREE.Object3D();
    for (let i = 0; i < points.length; i++) {
      const a = points[i];
      const b = points[(i + 1) % points.length];
      const ax = a.x;
      const ay = -a.y;
      const bx = b.x;
      const by = -b.y;
      const len = Math.hypot(bx - ax, by - ay);
      const count = Math.floor(len / 110);
      const dx = (bx - ax) / len;
      const dy = (by - ay) / len;
      // interior side of the (screen-clockwise) boundary polygon
      const nx = dy;
      const ny = -dx;
      for (let s = 1; s <= count; s++) {
        const px = ax + dx * (len * s) / (count + 1);
        const py = ay + dy * (len * s) / (count + 1);
        dummy.position.set(px + nx * 10, py + ny * 10, 20);
        dummy.rotation.set(0, 0, Math.atan2(ny, nx) - Math.PI / 2);
        dummy.updateMatrix();
        transforms.push(dummy.matrix.clone());
      }
    }
    const spikes = new THREE.InstancedMesh(
      spikeGeometry,
      spikeMaterial,
      transforms.length
    );
    transforms.forEach((m, i) => spikes.setMatrixAt(i, m));
    spikes.instanceMatrix.needsUpdate = true;
    scene.add(spikes);
  }

  ////////////////////////////////////////
  // LAVA POOL (churning volume across the pit)
  ////////////////////////////////////////
  if (opts.includeLava) {
    const lavaTexture = getLavaTexture();
    lavaTexture.repeat.set(6, 1);
    const lavaSurfaceMaterial = new THREE.MeshBasicMaterial({
      map: lavaTexture,
    });
    const crustMaterial = new THREE.MeshLambertMaterial({
      color: THEME.lavaDeep,
    });
    const lava = new THREE.Mesh(new THREE.BoxGeometry(4200, 220, 300), [
      crustMaterial,
      crustMaterial,
      lavaSurfaceMaterial, // top
      crustMaterial,
      lavaSurfaceMaterial, // front
      crustMaterial,
    ]);
    lava.position.set(centerX, -1195, 40);
    scene.add(lava);

    updaters.push((dt, t) => {
      lavaTexture.offset.x += dt * 0.015;
      lavaTexture.offset.y = Math.sin(t * 0.8) * 0.03;
      const pulse = 0.9 + Math.sin(t * 2.1) * 0.1;
      lavaSurfaceMaterial.color.setScalar(pulse);
    });
  }

  return {
    update: (dt: number, t: number) => {
      updaters.forEach((fn) => fn(dt, t));
    },
  };
}

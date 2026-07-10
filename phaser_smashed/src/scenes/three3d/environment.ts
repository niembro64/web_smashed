import * as THREE from 'three';
import {
  getGrassTexture,
  getLavaTexture,
  makeCanvasTextureWH,
  THEME,
} from './textures';

////////////////////////////////////////////////////////////
// Environment for the pseudo-3D world — 100% procedural, no
// original 2D game art, and deliberately calm: the sky, hills
// and clouds are soft and low-contrast so the stage stays the
// star. A slow day/night cycle drives the sky tint, a sun and
// moon ride a slow wheel, puffy clouds drift and wrap, grassy
// hills roll in parallax layers, and the pit is a churning
// lava pool.
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
    // molten pools inside the castle (world coords)
    lavaPools: { centerX: number; width: number; surfaceY: number }[];
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
      opacity: 0.14,
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
  // soft, slow, translucent — present but never distracting
  const cloudMaterial = new THREE.MeshLambertMaterial({
    color: 0xe8ecf0,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
  });
  const cloudRangeMinX = centerX - 2400;
  const cloudRangeMaxX = centerX + 2400;
  const clouds: { group: THREE.Group; speed: number }[] = [];
  for (let i = 0; i < 7; i++) {
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
    clouds.push({ group: cloud, speed: 6 + ((i * 7) % 10) });
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
  // LAVA POOLS (churning volumes inside the castle shafts)
  ////////////////////////////////////////
  if (opts.lavaPools.length > 0) {
    const lavaTexture = getLavaTexture();
    lavaTexture.repeat.set(3, 1);
    const lavaSurfaceMaterial = new THREE.MeshBasicMaterial({
      map: lavaTexture,
    });
    const crustMaterial = new THREE.MeshLambertMaterial({
      color: THEME.lavaDeep,
    });

    opts.lavaPools.forEach((pool) => {
      const depthDown = 1500; // molten column reaching far below
      const lava = new THREE.Mesh(
        new THREE.BoxGeometry(pool.width, depthDown, 220),
        [
          crustMaterial,
          crustMaterial,
          lavaSurfaceMaterial, // top
          crustMaterial,
          lavaSurfaceMaterial, // front
          crustMaterial,
        ]
      );
      lava.position.set(pool.centerX, -pool.surfaceY - depthDown / 2, 20);
      scene.add(lava);

      const glow = new THREE.PointLight(0xff5511, 1.0, 900, 2);
      glow.position.set(pool.centerX, -pool.surfaceY + 80, 120);
      scene.add(glow);
    });

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

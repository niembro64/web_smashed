import * as THREE from 'three';
import {
  getImageTexture,
  getMetalTexture,
  getShellTexture,
  getWoodTexture,
} from './textures';

////////////////////////////////////////////////////////////
// Prop and attack models for the pseudo-3D renderer.
//
// Every builder returns a THREE.Group whose local origin is
// the center of the matching 2D sprite, sized in world pixels
// (w/h = sprite.displayWidth/Height), so a plain position sync
// against the physics sprite lines the model up exactly.
// Shapes are derived from the source art:
//   bottle.png  -> glass bottle w/ yellow label
//   mirror.png  -> icy blue crystal shard
//   ham.png     -> hammer-bros hammer
//   sword_right -> long flat blade w/ green hilt
//   *shell.png  -> turtle shell dome, white rim (blue has wings)
//   bullet_bill -> black bullet w/ white eye + fist
//   fire_flower -> white petal ring, orange core, green stem
//   chompsheet5 -> black ball, huge white teeth
////////////////////////////////////////////////////////////

export function lambert(
  color: number,
  opts?: {
    map?: THREE.Texture;
    emissive?: number;
    transparent?: boolean;
    opacity?: number;
  }
): THREE.MeshLambertMaterial {
  const material = new THREE.MeshLambertMaterial({
    color,
    map: opts?.map || null,
    emissive: opts?.emissive !== undefined ? opts.emissive : 0x000000,
  });
  if (opts?.transparent) {
    material.transparent = true;
    material.opacity = opts.opacity !== undefined ? opts.opacity : 1;
  }
  return material;
}

export function box(
  w: number,
  h: number,
  d: number,
  material: THREE.Material | THREE.Material[]
): THREE.Mesh {
  return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
}

export function sphere(
  r: number,
  material: THREE.Material,
  widthSegments: number = 16,
  heightSegments: number = 12
): THREE.Mesh {
  return new THREE.Mesh(
    new THREE.SphereGeometry(r, widthSegments, heightSegments),
    material
  );
}

export function cylinder(
  radiusTop: number,
  radiusBottom: number,
  height: number,
  material: THREE.Material,
  radialSegments: number = 14
): THREE.Mesh {
  return new THREE.Mesh(
    new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments),
    material
  );
}

export function cone(
  radius: number,
  height: number,
  material: THREE.Material,
  radialSegments: number = 12
): THREE.Mesh {
  return new THREE.Mesh(
    new THREE.ConeGeometry(radius, height, radialSegments),
    material
  );
}

////////////////////////////////////////////////////////////
// PLATFORM BLOCKS
////////////////////////////////////////////////////////////

/**
 * A stage block: the real 2D brick art on the front face and a
 * darker mortar color on the extruded sides, so the stage reads
 * as solid brickwork instead of paper cutouts.
 */
export function buildPlatformBlock(
  w: number,
  h: number,
  depth: number,
  textureUrl: string
): THREE.Mesh {
  const face = getImageTexture(textureUrl);
  const sideMaterial = new THREE.MeshLambertMaterial({ color: 0x6e5140 });
  const faceMaterial = new THREE.MeshLambertMaterial({ map: face });
  const backMaterial = new THREE.MeshLambertMaterial({ color: 0x4d382c });
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, depth), [
    sideMaterial, // +x
    sideMaterial, // -x
    sideMaterial, // +y
    sideMaterial, // -y
    faceMaterial, // +z (front, faces camera)
    backMaterial, // -z
  ]);
  return mesh;
}

////////////////////////////////////////////////////////////
// ATTACKS
////////////////////////////////////////////////////////////

/** Glowing fireball (or iceball in alt mode). */
export function buildFireball(w: number, ice: boolean): THREE.Group {
  const group = new THREE.Group();
  const r = w / 2;
  const outerColor = ice ? 0x66ccff : 0xff7711;
  const coreColor = ice ? 0xddffff : 0xffdd55;
  const outer = sphere(
    r,
    lambert(outerColor, {
      emissive: outerColor,
      transparent: true,
      opacity: 0.85,
    })
  );
  const core = sphere(r * 0.55, lambert(coreColor, { emissive: coreColor }));
  group.add(outer);
  group.add(core);
  return group;
}

/** Link's wooden sword: long flat blade, bright edge, green hilt. */
export function buildSword(w: number, h: number): THREE.Group {
  const group = new THREE.Group();
  const bladeLength = w * 0.78;
  const bladeMaterial = lambert(0x8a5a33, { map: getWoodTexture('#8a5a33') });
  const edgeMaterial = lambert(0xc9955f);

  const blade = box(bladeLength, h * 0.42, h * 0.16, bladeMaterial);
  blade.position.x = w * 0.11;
  const edge = box(bladeLength * 0.94, h * 0.1, h * 0.18, edgeMaterial);
  edge.position.set(w * 0.11, h * 0.12, 0);
  const tip = cone(h * 0.21, h * 0.34, bladeMaterial);
  tip.rotation.z = -Math.PI / 2;
  tip.position.x = w * 0.11 + bladeLength / 2 + h * 0.15;

  const guard = box(w * 0.05, h * 0.75, h * 0.3, lambert(0x2e8b2e));
  guard.position.x = -w * 0.29;
  const grip = cylinder(h * 0.11, h * 0.11, w * 0.18, lambert(0xd8b344));
  grip.rotation.z = Math.PI / 2;
  grip.position.x = -w * 0.4;

  group.add(blade, edge, tip, guard, grip);
  return group;
}

/** Pikachu's thrown glass bottle with a yellow label. */
export function buildBottle(w: number, h: number): THREE.Group {
  const group = new THREE.Group();
  const glassMaterial = lambert(0xb8c4c8, { transparent: true, opacity: 0.85 });
  const body = cylinder(w * 0.38, w * 0.38, h * 0.62, glassMaterial);
  body.position.y = -h * 0.12;
  const shoulder = sphere(w * 0.38, glassMaterial);
  shoulder.scale.y = 0.5;
  shoulder.position.y = h * 0.19;
  const neck = cylinder(w * 0.16, w * 0.22, h * 0.3, glassMaterial);
  neck.position.y = h * 0.33;
  const cap = cylinder(w * 0.17, w * 0.17, h * 0.07, lambert(0x999999));
  cap.position.y = h * 0.49;
  const label = cylinder(w * 0.4, w * 0.4, h * 0.24, lambert(0xf2c218));
  label.position.y = -h * 0.12;
  group.add(body, shoulder, neck, cap, label);
  return group;
}

/** Kirby's mirror shard: icy translucent crystal. */
export function buildMirror(w: number, h: number): THREE.Group {
  const group = new THREE.Group();
  const crystalMaterial = new THREE.MeshPhongMaterial({
    color: 0x9fdcff,
    emissive: 0x224a66,
    specular: 0xffffff,
    shininess: 90,
    transparent: true,
    opacity: 0.85,
  });
  const shard = new THREE.Mesh(
    new THREE.OctahedronGeometry(h * 0.5),
    crystalMaterial
  );
  shard.scale.set(0.6, 1, 0.35); // elongated diamond shard
  const glint = sphere(h * 0.09, lambert(0xffffff, { emissive: 0xffffff }));
  glint.position.set(w * 0.12, h * 0.16, w * 0.18);
  group.add(shard, glint);
  return group;
}

/** Chez's hammer: dark metal head on a wooden handle. */
export function buildHammer(
  w: number,
  h: number,
  blackVariant: boolean
): THREE.Group {
  const group = new THREE.Group();
  const headColor = blackVariant ? 0x111111 : 0x3c3c46;
  const headMaterial = lambert(headColor, {
    map: getMetalTexture(blackVariant ? '#111111' : '#3c3c46'),
  });
  const head = box(w * 0.62, h * 0.42, h * 0.42, headMaterial);
  head.position.y = h * 0.25;
  const glint = box(w * 0.14, h * 0.1, h * 0.44, lambert(0xdddddd));
  glint.position.set(w * 0.14, h * 0.38, 0);
  const handle = cylinder(
    w * 0.09,
    w * 0.09,
    h * 0.72,
    lambert(0xb98a4b, { map: getWoodTexture('#b98a4b') })
  );
  handle.position.y = -h * 0.2;
  group.add(head, glint, handle);
  return group;
}

/** Koopa shell: plated dome, white rim, optional wings (blue shell). */
export function buildShell(
  w: number,
  h: number,
  color: number,
  hexColor: string,
  wings: boolean
): THREE.Group {
  const group = new THREE.Group();
  const domeMaterial = lambert(color, { map: getShellTexture(hexColor) });
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(w * 0.48, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    domeMaterial
  );
  dome.scale.y = h / w;
  dome.position.y = -h * 0.14;
  const rim = cylinder(w * 0.5, w * 0.52, h * 0.26, lambert(0xf4f0e0));
  rim.position.y = -h * 0.24;

  group.add(dome, rim);

  if (wings) {
    const wingMaterial = lambert(0xffffff, { transparent: true, opacity: 0.95 });
    for (const side of [-1, 1]) {
      const wing = new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.34, h * 0.5, w * 0.06),
        wingMaterial
      );
      wing.position.set(side * w * 0.45, h * 0.24, -w * 0.1);
      wing.rotation.z = side * -0.5;
      group.add(wing);
    }
  }
  return group;
}

/** Punch fist (fist-gray.png / fist-black.png): chunky knuckled fist. */
export function buildFist(w: number, h: number, color: number): THREE.Group {
  const group = new THREE.Group();
  const material = lambert(color);
  const palm = sphere(w * 0.4, material);
  palm.scale.set(1, h / w, 0.8);
  const knuckles = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const knuckle = sphere(w * 0.14, material);
    knuckle.position.set(w * 0.3, h * (0.22 - i * 0.22), w * 0.12);
    knuckles.add(knuckle);
  }
  const thumb = sphere(w * 0.16, material);
  thumb.position.set(-w * 0.05, -h * 0.3, w * 0.18);
  group.add(palm, knuckles, thumb);
  return group;
}

/** Builds the correct attack model for a given Phaser texture key. */
export function buildAttackModelForKey(
  key: string,
  w: number,
  h: number,
  nintendo: boolean
): THREE.Group {
  switch (key) {
    case 'fireball':
    case 'bulletFireBall':
      return buildFireball(Math.max(w, h), !nintendo);
    case 'sword':
      return buildSword(w, h);
    case 'bottle':
      return buildBottle(w, h);
    case 'mirror':
      return buildMirror(w, h);
    case 'hammer':
      return buildHammer(w, h, false);
    case 'blackHammer':
      return buildHammer(w, h, true);
    case 'greenshell':
      return buildShell(w, h, 0x2fa53c, '#2fa53c', false);
    case 'redshell':
      return buildShell(w, h, 0xd93a2b, '#d93a2b', false);
    case 'blueshell':
      return buildShell(w, h, 0x2f6fd9, '#2f6fd9', true);
    case 'magentashell':
      return buildShell(w, h, 0xd12fb0, '#d12fb0', false);
    case 'cyanshell':
      return buildShell(w, h, 0x2fc4d1, '#2fc4d1', false);
    case 'orangeshell':
      return buildShell(w, h, 0xe8842a, '#e8842a', true);
    case 'fist-black':
      return buildFist(w, h, 0x222222);
    case 'fist-white':
      return buildFist(w, h, 0xeeeeee);
    case 'fist-gray':
    default:
      return buildFist(w, h, 0x9a9a9a);
  }
}

////////////////////////////////////////////////////////////
// STAGE PROPS
////////////////////////////////////////////////////////////

/** Bullet Bill: black bullet, white eye, white fist, side fins. */
export function buildBulletBill(
  w: number,
  h: number,
  accentColor: number | null
): THREE.Group {
  const group = new THREE.Group();
  const bodyMaterial = lambert(0x1c1c1c, {
    map: getMetalTexture('#1c1c1c'),
  });
  const r = h * 0.5;

  const barrel = cylinder(r, r, w * 0.55, bodyMaterial, 20);
  barrel.rotation.z = Math.PI / 2;
  barrel.position.x = -w * 0.1;

  const nose = sphere(r, bodyMaterial, 20, 14);
  nose.scale.x = 0.9;
  nose.position.x = w * 0.175;

  const tail = cylinder(r * 1.06, r * 1.06, w * 0.14, bodyMaterial, 20);
  tail.rotation.z = Math.PI / 2;
  tail.position.x = -w * 0.41;

  // white eye with black pupil (art has one big angry eye)
  const eyeWhite = sphere(r * 0.28, lambert(0xffffff));
  eyeWhite.position.set(w * 0.18, h * 0.18, r * 0.62);
  const pupil = sphere(r * 0.12, lambert(0x000000));
  pupil.position.set(w * 0.24, h * 0.18, r * 0.78);

  // white clenched "arm" fist under the eye, like the sprite
  const fist = sphere(r * 0.3, lambert(0xf5f5f5));
  fist.scale.set(1.2, 0.8, 0.8);
  fist.position.set(-w * 0.02, -h * 0.16, r * 0.66);

  group.add(barrel, nose, tail, eyeWhite, pupil, fist);

  if (accentColor !== null) {
    const ring = cylinder(r * 1.09, r * 1.09, w * 0.07, lambert(accentColor), 20);
    ring.rotation.z = Math.PI / 2;
    ring.position.x = -w * 0.28;
    group.add(ring);
  }
  return group;
}

/** Bullet Bill cannon: heavy black barrel with rims and a skull badge. */
export function buildCannon(w: number, h: number): THREE.Group {
  const group = new THREE.Group();
  const metal = lambert(0x232323, { map: getMetalTexture('#232323') });
  const r = h * 0.34;

  const barrel = cylinder(r, r, w * 0.9, metal, 20);
  barrel.rotation.z = Math.PI / 2;
  barrel.position.y = h * 0.14;

  const rimL = cylinder(r * 1.18, r * 1.18, w * 0.12, metal, 20);
  rimL.rotation.z = Math.PI / 2;
  rimL.position.set(-w * 0.38, h * 0.14, 0);
  const rimR = rimL.clone();
  rimR.position.x = w * 0.38;

  const mount = box(w * 0.34, h * 0.5, h * 0.4, lambert(0x161616));
  mount.position.y = -h * 0.22;

  const skull = sphere(h * 0.09, lambert(0xffffff, { emissive: 0x333333 }));
  skull.position.set(0, -h * 0.2, h * 0.21);

  group.add(barrel, rimL, rimR, mount, skull);
  return group;
}

/** Flag pole: bright green pole with a ball on top (pole.png). */
export function buildPole(w: number, h: number): THREE.Group {
  const group = new THREE.Group();
  const poleMaterial = lambert(0x7ed321);
  const pole = cylinder(w * 0.18, w * 0.18, h * 0.96, poleMaterial, 10);
  const ball = sphere(w * 0.42, lambert(0x2e8b2e));
  ball.position.y = h * 0.48;
  group.add(pole, ball);
  return group;
}

/** The capture flag: the real "?" flag art on a double-sided cloth plane. */
export function buildFlag(w: number, h: number): THREE.Group {
  const group = new THREE.Group();
  const texture = getImageTexture('images/qflag3.png');
  const material = new THREE.MeshLambertMaterial({
    map: texture,
    side: THREE.DoubleSide,
    transparent: true,
  });
  const flag = new THREE.Mesh(new THREE.PlaneGeometry(w, h, 8, 1), material);
  group.add(flag);
  return group;
}

/** Flag spikes: a row of metal spikes on a base (flag_spikes.png). */
export function buildSpikes(w: number, h: number): THREE.Group {
  const group = new THREE.Group();
  const metal = lambert(0xa8a8b0, { map: getMetalTexture('#a8a8b0') });
  const numSpikes = 6;
  for (let i = 0; i < numSpikes; i++) {
    const spike = cone(w / numSpikes / 2.3, h * 0.9, metal, 8);
    spike.position.set(
      -w / 2 + (w / numSpikes) * (i + 0.5),
      -h * 0.05,
      0
    );
    group.add(spike);
  }
  const base = box(w, h * 0.16, w / numSpikes, lambert(0x707078));
  base.position.y = -h * 0.45;
  group.add(base);
  return group;
}

/** P-switch: big blue dome button on an orange base (pswitch_up.png). */
export function buildPSwitch(w: number, h: number): {
  group: THREE.Group;
  dome: THREE.Mesh;
} {
  // origin matches the sprite's origin (0.5, 1) => bottom center
  const group = new THREE.Group();
  const base = box(w, h * 0.18, w * 0.6, lambert(0xe8842a));
  base.position.y = h * 0.09;
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(w * 0.42, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    lambert(0x4169e1)
  );
  dome.scale.y = (h * 0.8) / (w * 0.42);
  dome.position.y = h * 0.18;
  const badge = box(w * 0.2, h * 0.3, w * 0.05, lambert(0xffffff));
  badge.position.set(0, h * 0.5, w * 0.33);
  group.add(base, dome, badge);
  return { group, dome };
}

/** Fire flower: white petal ring, warm core, leafy green stem. */
export function buildFireFlower(
  w: number,
  h: number,
  ice: boolean
): { group: THREE.Group; tintable: THREE.MeshLambertMaterial[] } {
  const group = new THREE.Group();
  const tintable: THREE.MeshLambertMaterial[] = [];

  const stemMaterial = lambert(0x2e8b2e);
  tintable.push(stemMaterial);
  const stem = cylinder(w * 0.06, w * 0.08, h * 0.5, stemMaterial, 8);
  stem.position.y = -h * 0.22;

  const leafMaterial = lambert(0x37a837);
  tintable.push(leafMaterial);
  for (const side of [-1, 1]) {
    const leaf = sphere(w * 0.16, leafMaterial);
    leaf.scale.set(1.6, 0.45, 0.7);
    leaf.position.set(side * w * 0.18, -h * 0.32, 0);
    leaf.rotation.z = side * 0.5;
    group.add(leaf);
  }

  const petalMaterial = lambert(0xf5f5f5);
  tintable.push(petalMaterial);
  const petals = new THREE.Mesh(
    new THREE.TorusGeometry(w * 0.24, w * 0.13, 10, 18),
    petalMaterial
  );
  petals.position.y = h * 0.18;

  const coreColor = ice ? 0x55ccee : 0xe84c1e;
  const coreMaterial = lambert(coreColor, { emissive: ice ? 0x113344 : 0x441100 });
  tintable.push(coreMaterial);
  const core = sphere(w * 0.17, coreMaterial);
  core.scale.z = 0.6;
  core.position.y = h * 0.18;

  group.add(stem, petals, core);
  return { group, tintable };
}

/** Chain chomp: black ball, hinged jaw full of white teeth, angry eyes. */
export function buildChomp(diameter: number): {
  group: THREE.Group;
  jaw: THREE.Group;
} {
  // origin matches sprite origin (0.5, 1) => bottom center
  const group = new THREE.Group();
  const r = diameter / 2;
  const bodyMaterial = lambert(0x151520, {
    map: getMetalTexture('#151520'),
  });
  const mouthMaterial = lambert(0x550f0f);
  const toothMaterial = lambert(0xffffff);

  // upper skull (slightly more than half a sphere)
  const skull = new THREE.Mesh(
    new THREE.SphereGeometry(r, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.62),
    bodyMaterial
  );
  skull.position.y = r;

  // upper teeth ring
  const upperTeeth = new THREE.Group();
  for (let i = 0; i < 7; i++) {
    const angle = -Math.PI * 0.4 + (Math.PI * 0.8 * i) / 6;
    const tooth = cone(r * 0.09, r * 0.24, toothMaterial, 6);
    tooth.rotation.x = Math.PI; // point down
    tooth.position.set(
      Math.sin(angle) * r * 0.8,
      r * 0.82 - r * 0.72,
      Math.cos(angle) * r * 0.8
    );
    tooth.position.y = r * 0.16;
    upperTeeth.add(tooth);
  }
  // eyes
  for (const side of [-1, 1]) {
    const eyeWhite = sphere(r * 0.2, lambert(0xffffff));
    eyeWhite.position.set(side * r * 0.42, r * 1.5 - r, r * 0.62);
    const pupil = sphere(r * 0.09, lambert(0x000000));
    pupil.position.set(side * r * 0.46, r * 1.52 - r, r * 0.78);
    skull.add(eyeWhite, pupil);
  }

  // lower jaw (pivots open/closed at the back of the mouth)
  const jaw = new THREE.Group();
  jaw.position.set(0, r * 0.7, -r * 0.15);
  const jawBowl = new THREE.Mesh(
    new THREE.SphereGeometry(
      r * 0.92,
      20,
      10,
      0,
      Math.PI * 2,
      Math.PI * 0.62,
      Math.PI * 0.38
    ),
    bodyMaterial
  );
  jawBowl.position.set(0, r * 0.3, r * 0.15);
  const mouthFloor = new THREE.Mesh(
    new THREE.CircleGeometry(r * 0.78, 18),
    mouthMaterial
  );
  mouthFloor.rotation.x = -Math.PI / 2;
  mouthFloor.position.set(0, r * 0.06, r * 0.15);
  jaw.add(jawBowl, mouthFloor);
  for (let i = 0; i < 6; i++) {
    const angle = -Math.PI * 0.35 + (Math.PI * 0.7 * i) / 5;
    const tooth = cone(r * 0.09, r * 0.24, toothMaterial, 6);
    tooth.position.set(
      Math.sin(angle) * r * 0.68,
      r * 0.18,
      Math.cos(angle) * r * 0.68 + r * 0.15
    );
    jaw.add(tooth);
  }

  group.add(skull, upperTeeth, jaw);
  return { group, jaw };
}

/** One chain link behind the chomp. */
export function buildChainLink(diameter: number): THREE.Group {
  const group = new THREE.Group();
  const link = sphere(
    diameter / 2,
    lambert(0x3a3a44, { map: getMetalTexture('#3a3a44') }),
    12,
    9
  );
  group.add(link);
  return group;
}

/** The shot table: wooden table with bottles on top (table.png). */
export function buildTable(w: number, h: number): THREE.Group {
  const group = new THREE.Group();
  const woodMaterial = lambert(0xc46a1b, { map: getWoodTexture('#c46a1b') });

  const top = box(w, h * 0.14, h * 0.9, woodMaterial);
  top.position.y = h * 0.18;

  for (const side of [-1, 1]) {
    const leg = box(w * 0.06, h * 0.62, h * 0.5, woodMaterial);
    leg.position.set(side * w * 0.42, -h * 0.19, 0);
    group.add(leg);
  }

  // bottles / shaker silhouettes like the art
  const glassMaterial = lambert(0xbfd0d4, { transparent: true, opacity: 0.9 });
  const bottleA = cylinder(w * 0.03, w * 0.03, h * 0.34, glassMaterial, 8);
  bottleA.position.set(-w * 0.3, h * 0.42, 0);
  const bottleB = cylinder(w * 0.025, w * 0.025, h * 0.42, glassMaterial, 8);
  bottleB.position.set(-w * 0.22, h * 0.46, h * 0.1);
  const shaker = box(w * 0.14, h * 0.22, h * 0.2, lambert(0x8f979b));
  shaker.position.set(w * 0.1, h * 0.36, 0);
  const cup = cylinder(w * 0.03, w * 0.02, h * 0.16, lambert(0xd8d8d8), 8);
  cup.position.set(w * 0.34, h * 0.33, 0);

  group.add(top, bottleA, bottleB, shaker, cup);
  return group;
}

/** Explosion puff: emissive sphere animated by the caller. */
export function buildExplosion(radius: number): {
  group: THREE.Group;
  material: THREE.MeshLambertMaterial;
} {
  const group = new THREE.Group();
  const material = lambert(0xff8822, {
    emissive: 0xff6600,
    transparent: true,
    opacity: 0.9,
  });
  const ball = sphere(radius, material, 16, 12);
  group.add(ball);
  return { group, material };
}

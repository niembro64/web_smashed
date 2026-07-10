import * as THREE from 'three';
import { CharacterId, SpriteStateName } from '../types';
import {
  getClothTexture,
  getDenimTexture,
  getFurTexture,
  getShellTexture,
} from './textures';

////////////////////////////////////////////////////////////
// Articulated character rigs for the pseudo-3D renderer.
//
// Every rig is a normalized skeleton (total height = 1, feet at
// y=-0.5, facing +z toward the camera) built from primitives and
// procedural textures, shaped after the original sprite art:
//   0 Mario   / Monkee   - stocky plumber / brown monkey
//   1 Link    / Kaitlyn  - green tunic hero / blond swordfighter
//   2 Pikachu / Surprice - chubby rodent, ears + zigzag tail
//   3 Kirby   / Seed     - round puffball with stub arms
//   4 Chez    / 5 B-Chez - t-shirt-and-jeans humans
//   6/7/8 Koopas/Snails  - shelled critters (blue/orange can fly)
//
// The skeleton is a plain THREE.Group hierarchy (hips, torso,
// head, 2 arms, 2 legs) posed procedurally from the live 2D
// physics state, so movement always "makes sense": legs swing
// with ground speed, jumps tuck, falls spread, hurt flails.
////////////////////////////////////////////////////////////

const FACING_ANGLE = 1.05; // radians toward profile, keeps a 3/4 view

interface TrackedMaterial {
  material: THREE.MeshLambertMaterial;
  baseColor: THREE.Color;
  baseEmissive: THREE.Color;
}

class MaterialBag {
  tracked: TrackedMaterial[] = [];

  make(
    color: number,
    opts?: { map?: THREE.Texture; emissive?: number }
  ): THREE.MeshLambertMaterial {
    const material = new THREE.MeshLambertMaterial({
      color,
      map: opts?.map || null,
      emissive: opts?.emissive !== undefined ? opts.emissive : 0x000000,
      transparent: true,
      opacity: 1,
    });
    this.tracked.push({
      material,
      baseColor: new THREE.Color(color),
      baseEmissive: new THREE.Color(
        opts?.emissive !== undefined ? opts.emissive : 0x000000
      ),
    });
    return material;
  }
}

function bagBox(
  w: number,
  h: number,
  d: number,
  material: THREE.Material
): THREE.Mesh {
  return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
}

function bagSphere(
  r: number,
  material: THREE.Material,
  ws: number = 14,
  hs: number = 10
): THREE.Mesh {
  return new THREE.Mesh(new THREE.SphereGeometry(r, ws, hs), material);
}

function bagCylinder(
  rt: number,
  rb: number,
  h: number,
  material: THREE.Material,
  seg: number = 10
): THREE.Mesh {
  return new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), material);
}

function bagCone(
  r: number,
  h: number,
  material: THREE.Material,
  seg: number = 10
): THREE.Mesh {
  return new THREE.Mesh(new THREE.ConeGeometry(r, h, seg), material);
}

/** Simple cartoon eyes attached to a head group. */
function addEyes(
  head: THREE.Group,
  bag: MaterialBag,
  opts: {
    y: number;
    z: number;
    spacing: number;
    radius: number;
    tall?: boolean;
  }
): void {
  const whiteMaterial = bag.make(0xffffff);
  const blackMaterial = bag.make(0x111111);
  for (const side of [-1, 1]) {
    const eye = bagSphere(opts.radius, whiteMaterial);
    if (opts.tall) {
      eye.scale.y = 1.8;
    }
    eye.position.set(side * opts.spacing, opts.y, opts.z);
    const pupil = bagSphere(opts.radius * 0.45, blackMaterial);
    pupil.position.set(
      side * opts.spacing,
      opts.y,
      opts.z + opts.radius * 0.75
    );
    head.add(eye, pupil);
  }
}

interface BipedOptions {
  hipY: number;
  hipSpread: number;
  legLength: number;
  legRadius: number;
  shoulderY: number;
  shoulderSpread: number;
  armLength: number;
  armRadius: number;
  torsoWidth: number;
  torsoHeight: number;
  torsoDepth: number;
  headY: number;
  headRadius: number;
  legMaterial: THREE.Material;
  shoeMaterial: THREE.Material;
  armMaterial: THREE.Material;
  handMaterial: THREE.Material;
  torsoMaterial: THREE.Material;
  headMaterial: THREE.Material;
}

interface BuiltBiped {
  model: THREE.Group;
  torso: THREE.Group;
  head: THREE.Group;
  armL: THREE.Group;
  armR: THREE.Group;
  legL: THREE.Group;
  legR: THREE.Group;
}

/**
 * Generic biped skeleton. Limb groups are pivoted at their joints
 * (hips / shoulders / neck) so rotating a group swings the limb
 * naturally like a bone.
 */
function buildBiped(o: BipedOptions): BuiltBiped {
  const model = new THREE.Group();

  // legs
  const makeLeg = (side: number): THREE.Group => {
    const leg = new THREE.Group();
    leg.position.set(side * o.hipSpread, o.hipY, 0);
    const thigh = bagCylinder(
      o.legRadius,
      o.legRadius * 0.85,
      o.legLength,
      o.legMaterial
    );
    thigh.position.y = -o.legLength / 2;
    const shoe = bagSphere(o.legRadius * 1.5, o.shoeMaterial);
    shoe.scale.set(1, 0.7, 1.7);
    shoe.position.set(0, -o.legLength, o.legRadius * 0.5);
    leg.add(thigh, shoe);
    return leg;
  };
  const legL = makeLeg(-1);
  const legR = makeLeg(1);

  // torso
  const torso = new THREE.Group();
  torso.position.y = o.hipY;
  const belly = bagBox(
    o.torsoWidth,
    o.torsoHeight,
    o.torsoDepth,
    o.torsoMaterial
  );
  belly.position.y = o.torsoHeight / 2;
  torso.add(belly);

  // arms
  const makeArm = (side: number): THREE.Group => {
    const arm = new THREE.Group();
    arm.position.set(side * o.shoulderSpread, o.shoulderY - o.hipY, 0);
    const limb = bagCylinder(
      o.armRadius,
      o.armRadius * 0.8,
      o.armLength,
      o.armMaterial
    );
    limb.position.y = -o.armLength / 2;
    const hand = bagSphere(o.armRadius * 1.35, o.handMaterial);
    hand.position.y = -o.armLength;
    arm.add(limb, hand);
    return arm;
  };
  const armL = makeArm(-1);
  const armR = makeArm(1);
  torso.add(armL, armR);

  // head
  const head = new THREE.Group();
  head.position.y = o.headY - o.hipY;
  const skull = bagSphere(o.headRadius, o.headMaterial, 18, 14);
  head.add(skull);
  torso.add(head);

  model.add(legL, legR, torso);
  return { model, torso, head, armL, armR, legL, legR };
}

export interface RigBuildResult {
  model: THREE.Group;
  head: THREE.Group | null;
  armL: THREE.Group | null;
  armR: THREE.Group | null;
  legL: THREE.Group | null;
  legR: THREE.Group | null;
  /** optional per-frame character flourish (tail wag, wing flap...) */
  flourish: ((t: number) => void) | null;
}

////////////////////////////////////////////////////////////
// CHARACTER BUILDERS
////////////////////////////////////////////////////////////

function buildMario(bag: MaterialBag, nintendo: boolean): RigBuildResult {
  const skin = 0xf0b088;
  if (!nintendo) {
    // Monkee: brown monkey with tan face and a tail
    const fur = bag.make(0x6b4423, { map: getFurTexture('#6b4423') });
    const face = bag.make(0xd8a87c);
    const biped = buildBiped({
      hipY: -0.08,
      hipSpread: 0.09,
      legLength: 0.34,
      legRadius: 0.06,
      shoulderY: 0.16,
      shoulderSpread: 0.17,
      armLength: 0.34,
      armRadius: 0.055,
      torsoWidth: 0.3,
      torsoHeight: 0.32,
      torsoDepth: 0.22,
      headY: 0.32,
      headRadius: 0.17,
      legMaterial: fur,
      shoeMaterial: fur,
      armMaterial: fur,
      handMaterial: face,
      torsoMaterial: fur,
      headMaterial: fur,
    });
    // muzzle + ears
    const muzzle = bagSphere(0.09, face);
    muzzle.scale.set(1.2, 0.9, 0.9);
    muzzle.position.set(0, -0.03, 0.13);
    biped.head.add(muzzle);
    addEyes(biped.head, bag, { y: 0.05, z: 0.13, spacing: 0.07, radius: 0.035 });
    for (const side of [-1, 1]) {
      const ear = bagSphere(0.06, fur);
      ear.position.set(side * 0.17, 0.05, 0);
      biped.head.add(ear);
    }
    // tail: curved chain of segments
    const tail = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const seg = bagSphere(0.035, fur);
      seg.position.set(0, i * 0.06, -0.05 - i * 0.045);
      tail.add(seg);
    }
    tail.position.set(0, 0.05, -0.12);
    biped.torso.add(tail);
    return { ...biped, flourish: (t) => (tail.rotation.x = Math.sin(t * 3) * 0.25) };
  }

  // Mario: red cap + shirt, blue overalls, white gloves, brown shoes
  const shirt = bag.make(0xd22a1a, { map: getClothTexture('#d22a1a') });
  const overalls = bag.make(0x2a4bd2, { map: getDenimTexture('#2a4bd2') });
  const glove = bag.make(0xffffff);
  const shoe = bag.make(0x6b3a1a);
  const face = bag.make(skin);

  const biped = buildBiped({
    hipY: -0.06,
    hipSpread: 0.09,
    legLength: 0.32,
    legRadius: 0.075,
    shoulderY: 0.16,
    shoulderSpread: 0.19,
    armLength: 0.3,
    armRadius: 0.06,
    torsoWidth: 0.34,
    torsoHeight: 0.3,
    torsoDepth: 0.26,
    headY: 0.32,
    headRadius: 0.18,
    legMaterial: overalls,
    shoeMaterial: shoe,
    armMaterial: shirt,
    handMaterial: glove,
    torsoMaterial: overalls,
    headMaterial: face,
  });

  // overall straps + buttons over a red chest
  const chest = bagBox(0.35, 0.12, 0.27, shirt);
  chest.position.y = 0.26;
  biped.torso.add(chest);
  for (const side of [-1, 1]) {
    const button = bagSphere(0.025, bag.make(0xf2c218));
    button.position.set(side * 0.09, 0.24, 0.14);
    biped.torso.add(button);
  }

  // cap: dome + brim
  const capMaterial = bag.make(0xd22a1a, { map: getClothTexture('#d22a1a') });
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(0.185, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    capMaterial
  );
  dome.position.y = 0.06;
  const brim = bagBox(0.22, 0.03, 0.14, capMaterial);
  brim.position.set(0, 0.05, 0.17);
  biped.head.add(dome, brim);

  // face: nose + mustache + eyes
  const nose = bagSphere(0.05, face);
  nose.position.set(0, -0.02, 0.17);
  const mustache = bagBox(0.14, 0.035, 0.04, bag.make(0x3a2a1a));
  mustache.position.set(0, -0.06, 0.16);
  biped.head.add(nose, mustache);
  addEyes(biped.head, bag, { y: 0.03, z: 0.15, spacing: 0.06, radius: 0.032 });

  return { ...biped, flourish: null };
}

function buildLink(bag: MaterialBag, nintendo: boolean): RigBuildResult {
  const tunic = bag.make(0x3d9e2f, { map: getClothTexture('#3d9e2f') });
  const skin = bag.make(0xf0b088);
  const boots = bag.make(0x7a4a22);
  const hair = bag.make(nintendo ? 0x8a5a2a : 0xe8c258);

  const biped = buildBiped({
    hipY: -0.08,
    hipSpread: 0.08,
    legLength: 0.34,
    legRadius: 0.06,
    shoulderY: 0.18,
    shoulderSpread: 0.17,
    armLength: 0.32,
    armRadius: 0.05,
    torsoWidth: 0.3,
    torsoHeight: 0.34,
    torsoDepth: 0.2,
    headY: 0.34,
    headRadius: 0.16,
    legMaterial: skin,
    shoeMaterial: boots,
    armMaterial: tunic,
    handMaterial: skin,
    torsoMaterial: tunic,
    headMaterial: skin,
  });

  // tunic skirt flare
  const skirt = bagCylinder(0.17, 0.21, 0.12, tunic, 12);
  skirt.position.y = 0.02;
  biped.torso.add(skirt);

  if (nintendo) {
    // pointed cap, swept back
    const cap = bagCone(0.16, 0.3, tunic, 12);
    cap.rotation.x = -Math.PI / 2.6;
    cap.position.set(0, 0.13, -0.09);
    biped.head.add(cap);
    // hair fringe
    const fringe = bagBox(0.24, 0.05, 0.06, hair);
    fringe.position.set(0, 0.09, 0.13);
    biped.head.add(fringe);
  } else {
    // Kaitlyn: long hair instead of the cap
    const top = new THREE.Mesh(
      new THREE.SphereGeometry(0.165, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2),
      hair
    );
    top.position.y = 0.03;
    const back = bagBox(0.26, 0.3, 0.08, hair);
    back.position.set(0, -0.08, -0.13);
    biped.head.add(top, back);
  }
  addEyes(biped.head, bag, { y: 0.03, z: 0.13, spacing: 0.06, radius: 0.03 });

  // small shield strapped to the left arm
  const shield = bagBox(0.04, 0.18, 0.14, bag.make(0x8a5a2a));
  shield.position.set(-0.05, -0.2, 0);
  if (biped.armL) {
    biped.armL.add(shield);
  }

  return { ...biped, flourish: null };
}

function buildPikachu(bag: MaterialBag, nintendo: boolean): RigBuildResult {
  const bodyColor = nintendo ? '#f2d21e' : '#f2a81e';
  const fur = bag.make(nintendo ? 0xf2d21e : 0xf2a81e, {
    map: getFurTexture(bodyColor),
  });
  const model = new THREE.Group();

  // chubby body
  const body = bagSphere(0.26, fur, 18, 14);
  body.scale.set(1, 1.15, 0.95);
  body.position.y = -0.2;
  model.add(body);

  // head is most of the character
  const head = new THREE.Group();
  head.position.y = 0.14;
  const skull = bagSphere(0.24, fur, 18, 14);
  skull.scale.set(1.15, 1, 1);
  head.add(skull);
  addEyes(head, bag, { y: 0.04, z: 0.19, spacing: 0.1, radius: 0.04 });
  // red cheeks
  const cheekMaterial = bag.make(0xe03c28);
  for (const side of [-1, 1]) {
    const cheek = bagSphere(0.045, cheekMaterial);
    cheek.scale.z = 0.4;
    cheek.position.set(side * 0.18, -0.05, 0.18);
    head.add(cheek);
  }
  // tall ears with black tips
  const tipMaterial = bag.make(0x22201c);
  const ears: THREE.Group[] = [];
  for (const side of [-1, 1]) {
    const ear = new THREE.Group();
    ear.position.set(side * 0.13, 0.17, 0);
    const lower = bagCone(0.055, 0.24, fur, 8);
    lower.position.y = 0.1;
    const tip = bagCone(0.04, 0.1, tipMaterial, 8);
    tip.position.y = 0.24;
    ear.add(lower, tip);
    ear.rotation.z = side * -0.28;
    ears.push(ear);
    head.add(ear);
  }
  model.add(head);

  // stubby arms + feet
  const armL = new THREE.Group();
  armL.position.set(-0.2, -0.1, 0.05);
  armL.add(bagSphere(0.07, fur));
  const armR = new THREE.Group();
  armR.position.set(0.2, -0.1, 0.05);
  armR.add(bagSphere(0.07, fur));
  const makeFoot = (side: number): THREE.Group => {
    const foot = new THREE.Group();
    foot.position.set(side * 0.12, -0.42, 0.02);
    const paw = bagSphere(0.08, fur);
    paw.scale.set(1, 0.7, 1.5);
    foot.add(paw);
    return foot;
  };
  const legL = makeFoot(-1);
  const legR = makeFoot(1);
  model.add(armL, armR, legL, legR);

  // zigzag lightning-bolt tail
  const tailMaterial = bag.make(nintendo ? 0xf2d21e : 0xf2a81e);
  const tail = new THREE.Group();
  const segmentSizes: [number, number][] = [
    [0.09, 0.05],
    [0.11, 0.05],
    [0.14, 0.06],
  ];
  let tx = 0;
  let ty = 0;
  segmentSizes.forEach(([len, thick], i) => {
    const seg = bagBox(len, thick, 0.03, tailMaterial);
    const angle = i % 2 === 0 ? 0.9 : -0.4;
    seg.position.set(tx, ty, 0);
    seg.rotation.z = angle;
    tx -= Math.cos(angle) * len * 0.5;
    ty += Math.abs(Math.sin(angle)) * len * 0.9;
    tail.add(seg);
  });
  tail.position.set(0, -0.22, -0.24);
  tail.rotation.y = Math.PI / 2;
  model.add(tail);

  return {
    model,
    head,
    armL,
    armR,
    legL,
    legR,
    flourish: (t) => {
      tail.rotation.y = Math.PI / 2 + Math.sin(t * 2.4) * 0.25;
      ears.forEach((ear, i) => {
        ear.rotation.z = (i === 0 ? -1 : 1) * -0.28 + Math.sin(t * 3 + i) * 0.06;
      });
    },
  };
}

function buildKirby(bag: MaterialBag, nintendo: boolean): RigBuildResult {
  const bodyHex = nintendo ? '#f5a3b8' : '#7ec850';
  const bodyMaterial = bag.make(nintendo ? 0xf5a3b8 : 0x7ec850, {
    map: getFurTexture(bodyHex),
  });
  const feetMaterial = bag.make(nintendo ? 0xd12f4e : 0x3d7a1e);

  const model = new THREE.Group();
  const head = new THREE.Group(); // body IS the head
  head.position.y = 0.02;
  const puff = bagSphere(0.36, bodyMaterial, 20, 16);
  head.add(puff);
  addEyes(head, bag, {
    y: 0.1,
    z: 0.3,
    spacing: 0.09,
    radius: 0.035,
    tall: true,
  });
  // blush + mouth
  const blushMaterial = bag.make(nintendo ? 0xe06080 : 0x4a9430);
  for (const side of [-1, 1]) {
    const blush = bagSphere(0.04, blushMaterial);
    blush.scale.z = 0.3;
    blush.position.set(side * 0.17, 0.0, 0.31);
    head.add(blush);
  }
  const mouth = bagSphere(0.035, bag.make(0x992222));
  mouth.scale.set(1.4, 1, 0.4);
  mouth.position.set(0, -0.06, 0.34);
  head.add(mouth);
  model.add(head);

  if (!nintendo) {
    // Seed: little sprout on top
    const stem = bagCylinder(0.015, 0.02, 0.09, bag.make(0x2e6b1e), 6);
    stem.position.y = 0.4;
    const leaf = bagSphere(0.05, bag.make(0x3d9e2f));
    leaf.scale.set(1.6, 0.4, 0.7);
    leaf.position.set(0.05, 0.45, 0);
    model.add(stem, leaf);
  }

  // stub arms
  const makeStub = (side: number): THREE.Group => {
    const stub = new THREE.Group();
    stub.position.set(side * 0.3, 0.1, 0.02);
    const ball = bagSphere(0.11, bodyMaterial);
    ball.scale.set(0.8, 1.1, 0.8);
    ball.position.y = -0.04;
    stub.add(ball);
    return stub;
  };
  const armL = makeStub(-1);
  const armR = makeStub(1);

  // red feet
  const makeFoot = (side: number): THREE.Group => {
    const foot = new THREE.Group();
    foot.position.set(side * 0.15, -0.36, 0);
    const shoe = bagSphere(0.12, feetMaterial);
    shoe.scale.set(1, 0.75, 1.5);
    shoe.position.y = -0.05;
    foot.add(shoe);
    return foot;
  };
  const legL = makeFoot(-1);
  const legR = makeFoot(1);
  model.add(armL, armR, legL, legR);

  return { model, head, armL, armR, legL, legR, flourish: null };
}

function buildChez(bag: MaterialBag, black: boolean): RigBuildResult {
  const shirtHex = black ? '#1c1c1c' : '#e8e8e8';
  const shirt = bag.make(black ? 0x1c1c1c : 0xe8e8e8, {
    map: getClothTexture(shirtHex),
  });
  const jeans = bag.make(black ? 0x14141c : 0x35507a, {
    map: getDenimTexture(black ? '#14141c' : '#35507a'),
  });
  const skin = bag.make(0xe0a878);
  const hair = bag.make(0x2a1c10);
  const shoes = bag.make(black ? 0x0a0a0a : 0x444444);

  const biped = buildBiped({
    hipY: -0.04,
    hipSpread: 0.07,
    legLength: 0.4,
    legRadius: 0.055,
    shoulderY: 0.22,
    shoulderSpread: 0.15,
    armLength: 0.36,
    armRadius: 0.045,
    torsoWidth: 0.26,
    torsoHeight: 0.36,
    torsoDepth: 0.16,
    headY: 0.36,
    headRadius: 0.13,
    legMaterial: jeans,
    shoeMaterial: shoes,
    armMaterial: skin,
    handMaterial: skin,
    torsoMaterial: shirt,
    headMaterial: skin,
  });

  // short sleeves
  for (const arm of [biped.armL, biped.armR]) {
    const sleeve = bagCylinder(0.055, 0.05, 0.1, shirt, 8);
    sleeve.position.y = -0.05;
    arm.add(sleeve);
  }

  // hair cap + a hint of beard
  const hairCap = new THREE.Mesh(
    new THREE.SphereGeometry(0.135, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2.2),
    hair
  );
  hairCap.position.y = 0.025;
  const beard = bagBox(0.12, 0.04, 0.03, hair);
  beard.position.set(0, -0.09, 0.1);
  biped.head.add(hairCap, beard);
  addEyes(biped.head, bag, { y: 0.02, z: 0.11, spacing: 0.05, radius: 0.026 });

  return { ...biped, flourish: null };
}

function buildKoopa(
  bag: MaterialBag,
  shellColorNum: number,
  shellHex: string,
  wings: boolean
): RigBuildResult {
  const skinMaterial = bag.make(0xf2dc9e, { map: getFurTexture('#f2dc9e') });
  const shellMaterial = bag.make(shellColorNum, {
    map: getShellTexture(shellHex),
  });
  const rimMaterial = bag.make(0xf4f0e0);

  const biped = buildBiped({
    hipY: -0.16,
    hipSpread: 0.1,
    legLength: 0.22,
    legRadius: 0.06,
    shoulderY: 0.05,
    shoulderSpread: 0.2,
    armLength: 0.22,
    armRadius: 0.05,
    torsoWidth: 0.34,
    torsoHeight: 0.3,
    torsoDepth: 0.24,
    headY: 0.26,
    headRadius: 0.14,
    legMaterial: skinMaterial,
    shoeMaterial: skinMaterial,
    armMaterial: skinMaterial,
    handMaterial: skinMaterial,
    torsoMaterial: rimMaterial, // pale belly plate
    headMaterial: skinMaterial,
  });

  // shell dome on the back
  const shell = new THREE.Mesh(
    new THREE.SphereGeometry(0.24, 18, 12),
    shellMaterial
  );
  shell.scale.set(1.05, 0.95, 0.75);
  shell.position.set(0, 0.16, -0.12);
  const rim = bagCylinder(0.235, 0.245, 0.07, rimMaterial, 16);
  rim.rotation.x = Math.PI / 2.4;
  rim.position.set(0, 0.05, -0.1);
  biped.torso.add(shell, rim);

  // beaky snout
  const snout = bagSphere(0.07, skinMaterial);
  snout.scale.set(1.1, 0.8, 1.2);
  snout.position.set(0, -0.02, 0.11);
  biped.head.add(snout);
  addEyes(biped.head, bag, { y: 0.05, z: 0.1, spacing: 0.055, radius: 0.028 });

  let flourish: ((t: number) => void) | null = null;
  if (wings) {
    const wingMaterial = bag.make(0xffffff);
    const wingL = new THREE.Group();
    const wingR = new THREE.Group();
    for (const [wing, side] of [
      [wingL, -1],
      [wingR, 1],
    ] as [THREE.Group, number][]) {
      const feather = bagBox(0.22, 0.12, 0.02, wingMaterial);
      feather.position.x = side * 0.12;
      wing.add(feather);
      wing.position.set(side * 0.12, 0.3, -0.16);
      biped.torso.add(wing);
    }
    flourish = (t) => {
      wingL.rotation.z = 0.4 + Math.sin(t * 10) * 0.5;
      wingR.rotation.z = -0.4 - Math.sin(t * 10) * 0.5;
    };
  }

  return { ...biped, flourish };
}

function buildRigParts(
  characterId: CharacterId,
  nintendo: boolean,
  bag: MaterialBag
): RigBuildResult {
  switch (characterId) {
    case 0:
      return buildMario(bag, nintendo);
    case 1:
      return buildLink(bag, nintendo);
    case 2:
      return buildPikachu(bag, nintendo);
    case 3:
      return buildKirby(bag, nintendo);
    case 4:
      return buildChez(bag, false);
    case 5:
      return buildChez(bag, true);
    case 6:
      return nintendo
        ? buildKoopa(bag, 0x2fa53c, '#2fa53c', false)
        : buildKoopa(bag, 0xd12fb0, '#d12fb0', false);
    case 7:
      return nintendo
        ? buildKoopa(bag, 0xd93a2b, '#d93a2b', false)
        : buildKoopa(bag, 0x2fc4d1, '#2fc4d1', false);
    case 8:
      return nintendo
        ? buildKoopa(bag, 0x2f6fd9, '#2f6fd9', true)
        : buildKoopa(bag, 0xe8842a, '#e8842a', true);
    default:
      return buildMario(bag, nintendo);
  }
}

////////////////////////////////////////////////////////////
// RUNTIME RIG
////////////////////////////////////////////////////////////

export interface RigFrameState {
  x: number;
  y: number;
  displayHeight: number;
  flipX: boolean;
  spriteState: SpriteStateName;
  velX: number;
  velY: number;
  isHurt: boolean;
  isDead: boolean;
  isAttacking: boolean;
  powerState: 'dark' | 'light' | 'none';
  charsColored: boolean;
  playerColor: number;
  dt: number;
  t: number;
}

export class CharacterRig {
  root: THREE.Group = new THREE.Group();
  private parts: RigBuildResult;
  private bag: MaterialBag = new MaterialBag();
  private walkPhase: number = 0;
  private facing: number = FACING_ANGLE;
  private deadSpin: number = 0;
  private colorScratch: THREE.Color = new THREE.Color();

  constructor(characterId: CharacterId, nintendo: boolean) {
    this.parts = buildRigParts(characterId, nintendo, this.bag);
    this.root.add(this.parts.model);
  }

  update(s: RigFrameState): void {
    const p = this.parts;
    this.root.position.set(s.x, -s.y, 0);
    this.root.scale.setScalar(s.displayHeight);

    // turn smoothly toward the direction of travel
    const targetFacing = s.flipX ? -FACING_ANGLE : FACING_ANGLE;
    this.facing += (targetFacing - this.facing) * Math.min(1, s.dt * 14);
    this.root.rotation.y = this.facing;

    // reset per-frame pose channels
    const limbs = [p.armL, p.armR, p.legL, p.legR];
    limbs.forEach((limb) => {
      if (limb) {
        limb.rotation.set(0, 0, 0);
      }
    });
    p.model.rotation.set(0, 0, 0);
    p.model.position.set(0, 0, 0);
    if (p.head) {
      p.head.rotation.set(0, 0, 0);
    }

    this.walkPhase += Math.abs(s.velX) * s.dt * 0.035;

    switch (s.spriteState) {
      case 'walk': {
        const swing = Math.sin(this.walkPhase) * 0.85;
        if (p.legL) p.legL.rotation.x = swing;
        if (p.legR) p.legR.rotation.x = -swing;
        if (p.armL) p.armL.rotation.x = -swing * 0.7;
        if (p.armR) p.armR.rotation.x = swing * 0.7;
        p.model.position.y = Math.abs(Math.sin(this.walkPhase)) * 0.03;
        break;
      }
      case 'jumpUp': {
        // arms thrown up, legs tucked
        if (p.armL) p.armL.rotation.x = -2.4;
        if (p.armR) p.armR.rotation.x = -2.4;
        if (p.legL) p.legL.rotation.x = 0.9;
        if (p.legR) p.legR.rotation.x = 0.35;
        if (p.head) p.head.rotation.x = -0.15;
        break;
      }
      case 'jumpDown': {
        // arms out to the side, legs trailing
        if (p.armL) p.armL.rotation.z = 2.1;
        if (p.armR) p.armR.rotation.z = -2.1;
        if (p.legL) p.legL.rotation.x = -0.35;
        if (p.legR) p.legR.rotation.x = 0.2;
        if (p.head) p.head.rotation.x = 0.15;
        break;
      }
      case 'climb': {
        // wall scramble: limbs alternate quickly
        const scramble = Math.sin(s.t * 12);
        if (p.armL) p.armL.rotation.x = -1.6 + scramble * 0.5;
        if (p.armR) p.armR.rotation.x = -1.6 - scramble * 0.5;
        if (p.legL) p.legL.rotation.x = 0.5 + scramble * 0.4;
        if (p.legR) p.legR.rotation.x = 0.5 - scramble * 0.4;
        break;
      }
      case 'idle':
      default: {
        // gentle breathing sway
        const breathe = Math.sin(s.t * 2.2);
        p.model.position.y = breathe * 0.012;
        if (p.armL) p.armL.rotation.z = 0.12 + breathe * 0.04;
        if (p.armR) p.armR.rotation.z = -0.12 - breathe * 0.04;
        break;
      }
    }

    if (s.isAttacking && p.armR) {
      // punch / swing with the leading arm
      p.armR.rotation.set(-1.7, 0, 0);
      if (p.armL) {
        p.armL.rotation.set(0.6, 0, 0);
      }
    }

    if (s.isHurt) {
      // flail wildly
      const flail = Math.sin(s.t * 34);
      limbs.forEach((limb, i) => {
        if (limb) {
          limb.rotation.x = flail * (i % 2 === 0 ? 1 : -1) * 1.2;
          limb.rotation.z = Math.cos(s.t * 27 + i) * 0.6;
        }
      });
      p.model.rotation.z = flail * 0.12;
    }

    if (s.isDead) {
      // tumble like a knocked-out cartoon character
      this.deadSpin += s.dt * 9;
      p.model.rotation.z = this.deadSpin;
    } else {
      this.deadSpin = 0;
    }

    if (p.flourish) {
      p.flourish(s.t);
    }

    this.applyMaterialFx(s);
  }

  private applyMaterialFx(s: RigFrameState): void {
    const hurtFlash = s.isHurt && Math.sin(s.t * 30) > 0;
    this.bag.tracked.forEach((entry) => {
      const m = entry.material;
      m.color.copy(entry.baseColor);
      m.emissive.copy(entry.baseEmissive);
      m.opacity = 1;

      if (s.charsColored) {
        this.colorScratch.setHex(s.playerColor);
        m.color.lerp(this.colorScratch, 0.6);
      }
      if (s.powerState === 'dark') {
        m.color.multiplyScalar(0.12);
      } else if (s.powerState === 'light') {
        m.emissive.setHex(0x777755);
      }
      if (hurtFlash) {
        this.colorScratch.setHex(0xff2222);
        m.color.lerp(this.colorScratch, 0.75);
      }
      if (s.isDead) {
        m.opacity = 0.5;
      }
    });
  }
}

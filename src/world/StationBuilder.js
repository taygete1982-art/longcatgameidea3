/**
 * src/world/StationBuilder.js
 * 
 * Билдер станции под тему. Принимает тему и строит соответствующие материалы.
 * 
 * API:
 *   const builder = new StationBuilder(scene, themeName);
 *   const station = builder.build();
 *   builder.dispose();
 */

import * as THREE from 'three';
import { THEMES } from '../config/theme.js';

const CONTAINER_LAYOUT = [
  [-12, -10, 0, 0.3], [-6, -12, 1, 0.0], [0, -11, 2, 0.1],
  [7, -12, 3, 0.5], [13, -9, 0, 0.0], [-14, -3, 1, 0.2],
  [-8, -4, 2, 0.0], [9, -3, 0, 0.4], [14, -1, 3, 0.0],
  [-11, 4, 3, 0.1], [-4, 6, 0, 0.0], [3, 5, 1, 0.6],
  [11, 6, 2, 0.0], [-7, 12, 1, 0.3], [1, 12, 3, 0.0], [9, 11, 0, 0.2],
];

const CONTAINER_SIZES = [
  [2, 2, 1.5], [1.5, 1.5, 1.5], [3, 2, 2], [1, 1, 1],
];

const BASE_COLORS = {
  GLAC:   { floor: 0xd4b483, wall: 0xb5a642, ceiling: 0x1e6091 },
  OBS:    { floor: 0x1a1a2e, wall: 0x2d2d44, ceiling: 0x1a1a2e },
  CRYSTAL: { floor: 0x0a0a1a, wall: 0x1a1a2e, ceiling: 0x0a1a3a },
};

const NEON_COLORS = {
  GLAC:   { cyan: 0x00aaff, red: 0xff3344 },
  OBS:    { cyan: 0x0077aa, red: 0xff5566 },
  CRYSTAL: { cyan: 0x0055aa, red: 0xff3366 },
};

// Базовые материалы (по одному на тему)
const BASE_MATERIALS = {
  GLAC: {
    floor: new THREE.MeshStandardMaterial({ color: 0xd4b483, roughness: 0.95, metalness: 0.0 }),
    wall: new THREE.MeshStandardMaterial({ color: 0xb5a642, roughness: 0.8, metalness: 0.0 }),
    ceiling: new THREE.MeshStandardMaterial({ color: 0x1e6091, roughness: 0.7, metalness: 0.1 }),
    container: new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.6, metalness: 0.0 }),
    pillar: new THREE.MeshStandardMaterial({ color: 0x5a6070, roughness: 0.5, metalness: 0.3 }),
    hazard: new THREE.MeshStandardMaterial({ color: 0xffcc00, roughness: 0.7, metalness: 0.0 }),
  },
  OBS: {
    floor: new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.9, metalness: 0.0 }),
    wall: new THREE.MeshStandardMaterial({ color: 0x2d2d44, roughness: 0.7, metalness: 0.3 }),
    ceiling: new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.6, metalness: 0.2 }),
    container: new THREE.MeshStandardMaterial({ color: 0x3a3a5a, roughness: 0.5, metalness: 0.3 }),
    pillar: new THREE.MeshStandardMaterial({ color: 0x4a4a6a, roughness: 0.5, metalness: 0.4 }),
    hazard: new THREE.MeshStandardMaterial({ color: 0x8b3a1a, roughness: 0.7, metalness: 0.0 }),
  },
  CRYSTAL: {
    floor: new THREE.MeshStandardMaterial({ color: 0x0a0a1a, roughness: 0.9, metalness: 0.0 }),
    wall: new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.6, metalness: 0.3 }),
    ceiling: new THREE.MeshStandardMaterial({ color: 0x0a1a3a, roughness: 0.5, metalness: 0.4 }),
    container: new THREE.MeshStandardMaterial({ color: 0x3a4a6a, roughness: 0.4, metalness: 0.4 }),
    pillar: new THREE.MeshStandardMaterial({ color: 0x2a2a4a, roughness: 0.4, metalness: 0.5 }),
    hazard: new THREE.MeshStandardMaterial({ color: 0xff3366, roughness: 0.5, metalness: 0.2 }),
  },
};

// Материалы для неона и hazard-эффектов (по темам)
const NEON_MATERIALS = {
  GLAC: {
    cyan: new THREE.MeshBasicMaterial({ color: 0x00aaff }),
    red: new THREE.MeshBasicMaterial({ color: 0xff3344 }),
  },
  OBS: {
    cyan: new THREE.MeshBasicMaterial({ color: 0x0077aa }),
    red: new THREE.MeshBasicMaterial({ color: 0xff5566 }),
  },
  CRYSTAL: {
    cyan: new THREE.MeshBasicMaterial({ color: 0x0055aa }),
    red: new THREE.MeshBasicMaterial({ color: 0xff3366 }),
  },
};

// Материалы для глаз врагов
const EYE_MATERIALS = {
  GLAC: {
    stone: new THREE.MeshStandardMaterial({ color: 0x2a2a3a, roughness: 0.7, metalness: 0.0 }),
    gold: new THREE.MeshStandardMaterial({ color: 0xb8860b, roughness: 0.3, metalness: 0.4 }),
    red: new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 0.8, roughness: 0.2 }),
  },
  OBS: {
    stone: new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.6, metalness: 0.4 }),
    gold: new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.2, metalness: 0.7 }),
    red: new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 0.9, roughness: 0.2 }),
  },
  CRYSTAL: {
    stone: new THREE.MeshStandardMaterial({ color: 0x0a1a3a, roughness: 0.5, metalness: 0.3 }),
    gold: new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.2, metalness: 0.8 }),
    red: new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 0.9, roughness: 0.2 }),
  },
};

// Материалы для стрел
const ARROW_MATERIALS = {
  GLAC: {
    wood: new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.8, metalness: 0.0 }),
    feather: new THREE.MeshStandardMaterial({ color: 0x7a8a3a, roughness: 0.7, metalness: 0.0 }),
    fletch: new THREE.MeshStandardMaterial({ color: 0x0077aa, roughness: 0.6, metalness: 0.1 }),
    head: new THREE.MeshStandardMaterial({ color: 0x4a3a2a, roughness: 0.5, metalness: 0.1 }),
    trail: new THREE.MeshBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0.5 }),
  },
  OBS: {
    wood: new THREE.MeshStandardMaterial({ color: 0x4a3a2a, roughness: 0.8, metalness: 0.0 }),
    feather: new THREE.MeshStandardMaterial({ color: 0x0077aa, roughness: 0.6, metalness: 0.1 }),
    fletch: new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.7, metalness: 0.0 }),
    head: new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.3, metalness: 0.6 }),
    trail: new THREE.MeshBasicMaterial({ color: 0x8b3a1a, transparent: true, opacity: 0.5 }),
  },
  CRYSTAL: {
    wood: new THREE.MeshStandardMaterial({ color: 0x3a2a2a, roughness: 0.8, metalness: 0.0 }),
    feather: new THREE.MeshStandardMaterial({ color: 0x0055aa, roughness: 0.6, metalness: 0.1 }),
    fletch: new THREE.MeshStandardMaterial({ color: 0xff3366, roughness: 0.5, metalness: 0.2 }),
    head: new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.2, metalness: 0.8 }),
    trail: new THREE.MeshBasicMaterial({ color: 0xaa3366, transparent: true, opacity: 0.5 }),
  },
};

export class StationBuilder {
  constructor(scene, themeName) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = 'station';
    this.scene.add(this.group);

    this.theme = THEMES[themeName];
    if (!this.theme) {
      throw new Error(`Unknown theme: ${themeName}`);
    }

    this.materials = { ...BASE_MATERIALS[this.theme.name] };
    this.materials.neonCyan = NEON_MATERIALS[this.theme.name].cyan;
    this.materials.neonRed = NEON_MATERIALS[this.theme.name].red;
    this.materials.hazard = this.materials.hazard ||
      new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.7, metalness: 0.0 });
    this.materials.pillar = this.materials.pillar ||
      new THREE.MeshStandardMaterial({ color: 0x5a6070, roughness: 0.5, metalness: 0.3 });
    this.materials.container = this.materials.container ||
      new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.6, metalness: 0.0 });

    this.build();
  }

  build() {
    this.buildFloor();
    this.buildWalls();
    this.buildCeiling();
    this.buildContainers();
    this.buildPillars();
    this.buildNeon();
    this.buildFloorGrid();
    this.buildBases();
    this.buildPipes();
    this.buildCorners();
    this.buildBarriers();
    return this.group;
  }

  getBounds() {
    const h = CONFIG.arena.width / 2;
    return { minX: -h, maxX: h, minZ: -h, maxZ: h };
  }

  buildFloor() {
    const geo = new THREE.PlaneGeometry(CONFIG.arena.width, CONFIG.arena.depth);
    const mat = this.materials.floor;
    const floor = new THREE.Mesh(geo, mat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.group.add(floor);
  }

  buildWalls() {
    const w = CONFIG.arena.width;
    const h = CONFIG.arena.wallHeight;
    const t = 0.5;

    const walls = [
      { pos: [0, h / 2, -w / 2], size: [w, h, t] },
      { pos: [0, h / 2, w / 2], size: [w, h, t] },
      { pos: [w / 2, h / 2, 0], size: [t, h, w] },
      { pos: [-w / 2, h / 2, 0], size: [t, h, w] },
    ];

    const wallMat = new THREE.MeshStandardMaterial({
      color: this.theme.palette.wall,
      roughness: 0.8,
      metalness: 0.0,
    });

    walls.forEach(({ pos, size }) => {
      const geo = new THREE.BoxGeometry(...size);
      const wall = new THREE.Mesh(geo, wallMat);
      wall.position.set(...pos);
      wall.castShadow = true;
      wall.receiveShadow = true;
      this.group.add(wall);
    });
  }

  buildCeiling() {
    const geo = new THREE.PlaneGeometry(CONFIG.arena.width, CONFIG.arena.width);
    const mat = this.materials.ceiling;
    const ceiling = new THREE.Mesh(geo, mat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = CONFIG.arena.wallHeight;
    this.group.add(ceiling);
  }

  buildContainers() {
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const mesh = new THREE.InstancedMesh(geo, this.materials.container, CONTAINER_LAYOUT.length);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    const dummy = new THREE.Object3D();
    CONTAINER_LAYOUT.forEach(([x, z, sizeIdx, rotY], i) => {
      const [w, h, d] = CONTAINER_SIZES[sizeIdx];
      dummy.position.set(x, h / 2, z);
      dummy.rotation.set(0, rotY, 0);
      dummy.scale.set(w, h, d);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    this.group.add(mesh);
  }

  buildPillars() {
    const h = CONFIG.arena.wallHeight;
    const geo = new THREE.CylinderGeometry(0.3, 0.3, h, 8);
    const mesh = new THREE.InstancedMesh(geo, this.materials.pillar, 6);
    mesh.castShadow = true;

    const dummy = new THREE.Object3D();
    const positions = [
      [-CONFIG.arena.width / 2 + 1, h / 2, -CONFIG.arena.width / 2 + 1],
      [-CONFIG.arena.width / 2 + 1, h / 2, CONFIG.arena.width / 2 - 1],
      [CONFIG.arena.width / 2 - 1, h / 2, -CONFIG.arena.width / 2 + 1],
      [CONFIG.arena.width / 2 - 1, h / 2, CONFIG.arena.width / 2 - 1],
      [0, h / 2, -CONFIG.arena.width / 2 + 1],
      [0, h / 2, CONFIG.arena.width / 2 - 1],
    ];
    positions.forEach((pos, i) => {
      dummy.position.set(...pos);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    this.group.add(mesh);
  }

  buildNeon() {
    const w = CONFIG.arena.width;
    const unit = new THREE.BoxGeometry(1, 1, 1);
    const cyan = this.materials.neonCyan;
    const red = this.materials.neonRed;

    const fill = (mesh, items) => {
      items.forEach(([px, py, pz, sx, sy, sz], i) => {
        dummy.position.set(px, py, pz);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(sx, sy, sz);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
      this.group.add(mesh);
    };

    const dummy = new THREE.Object3D();
    fill(new THREE.InstancedMesh(unit, cyan, 4), [
      [0, 2.8, -w / 2 + 0.35, w, 0.4, 0.4],
      [0, 2.8, w / 2 - 0.35, w, 0.4, 0.4],
      [0, 0.12, -w / 2 + 0.6, w, 0.12, 0.12],
      [0, 0.12, w / 2 - 0.6, w, 0.12, 0.12],
    ]);
    fill(new THREE.InstancedMesh(unit, red, 4), [
      [-w / 2 + 0.35, 2.8, 0, 0.4, 0.4, w],
      [w / 2 - 0.35, 2.8, 0, 0.4, 0.4, w],
      [-w / 2 + 0.6, 0.12, 0, 0.12, 0.12, w],
      [w / 2 - 0.6, 0.12, 0, 0.12, 0.12, w],
    ]);
  }

  buildFloorGrid() {
    const grid = new THREE.GridHelper(CONFIG.arena.width, 20, 0x00aaff, 0x1a2a3a);
    grid.position.y = 0.02;
    grid.material.transparent = true;
    grid.material.opacity = 0.35;
    this.group.add(grid);
  }

  buildBases() {
    // Зиккурат (Glac), алтарь (Obs), кристалл (Crystal)
    if (this.theme.name === 'Glac') {
      this.buildZigguratBase();
    } else if (this.theme.name === 'Obs') {
      this.buildAltarBase();
    } else {
      this.buildCrystalBase();
    }
  }

  buildZigguratBase() {
    const geo = new THREE.CylinderGeometry(0.8, 2.0, 4.0, 8);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xb5a642,
      roughness: 0.8,
      metalness: 0.0,
    });
    const base = new THREE.Mesh(geo, mat);
    base.position.y = 2.0;
    base.castShadow = true;
    this.group.add(base);

    // Сердце
    const heart = new THREE.Mesh(
      new THREE.SphereGeometry(0.6, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({
        color: 0xff0000,
        emissive: 0xff0000,
        emissiveIntensity: 0.5,
        roughness: 0.4,
      })
    );
    heart.position.y = 3.0;
    base.add(heart);
  }

  buildAltarBase() {
    const geo = new THREE.CylinderGeometry(1.0, 1.5, 3.0, 8);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x2d2d44,
      roughness: 0.6,
      metalness: 0.2,
    });
    const base = new THREE.Mesh(geo, mat);
    base.position.y = 1.5;
    base.castShadow = true;
    this.group.add(base);

    // Алтарный стол
    const table = new THREE.Mesh(
      new THREE.BoxGeometry(2.5, 0.3, 2.0),
      new THREE.MeshStandardMaterial({
        color: 0x8b7355,
        roughness: 0.6,
        metalness: 0.0,
      })
    );
    table.position.y = 1.65;
    base.add(table);
  }

  buildCrystalBase() {
    const geo = new THREE.CylinderGeometry(0.5, 1.0, 6.0, 8);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x0055aa,
      roughness: 0.1,
      metalness: 0.6,
    });
    const base = new THREE.Mesh(geo, mat);
    base.position.y = 3.0;
    base.castShadow = true;
    this.group.add(base);

    // Кристалл внутри
    const crystal = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.8, 1),
      new THREE.MeshStandardMaterial({
        color: 0x88ccff,
        roughness: 0.0,
        metalness: 0.9,
        emissive: 0x00aaff,
        emissiveIntensity: 0.4,
      })
    );
    crystal.position.y = 4.5;
    base.add(crystal);
  }

  buildPipes() {
    const geo = new THREE.CylinderGeometry(0.15, 0.15, CONFIG.arena.width, 8);
    geo.rotateZ(Math.PI / 2);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x3a3a5a,
      roughness: 0.6,
      metalness: 0.3,
    });
    const mesh = new THREE.InstancedMesh(geo, mat, 4);
    const dummy = new THREE.Object3D();
    [-15, -5, 5, 15].forEach((z, i) => {
      dummy.position.set(0, 5.4, z);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    this.group.add(mesh);
  }

  buildCorners() {
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x8b5a2b,
      roughness: 0.7,
      metalness: 0.1,
    });
    const mesh = new THREE.InstancedMesh(geo, mat, 4);
    mesh.castShadow = true;
    const dummy = new THREE.Object3D();
    const h = CONFIG.arena.width / 2 - 0.6;
    [[-h, -h], [h, -h], [-h, h], [h, h]].forEach(([x, z], i) => {
      dummy.position.set(x, 3, z);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(0.6, 6, 0.6);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    this.group.add(mesh);
  }

  buildBarriers() {
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x8b5a2b,
      roughness: 0.7,
      metalness: 0.1,
    });
    const mesh = new THREE.InstancedMesh(geo, mat, 4);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    const dummy = new THREE.Object3D();
    [[-6, -6, 0.5], [6, -6, -0.5], [-6, 6, -0.5], [6, 6, 0.5]].forEach(([x, z, rot], i) => {
      dummy.position.set(x, 0.4, z);
      dummy.rotation.set(0, rot, 0);
      dummy.scale.set(2, 0.8, 0.4);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    this.group.add(mesh);
  }

  dispose() {
    this.group.traverse(child => {
      if (child.geometry) child.geometry.dispose();
      if (child.material && !this.mats.has(child.material)) child.material.dispose();
    });
    this.scene.remove(this.group);
  }
}

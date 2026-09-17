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
import { CONFIG } from '../config.js';
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

// Конвертер palette {r,g,b,a} → THREE.Color
function toColor(paletteEntry) {
  return new THREE.Color(paletteEntry.r / 255, paletteEntry.g / 255, paletteEntry.b / 255);
}

export class StationBuilder {
  constructor(scene, themeName) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = 'station';
    this.scene.add(this.group);

    this.themeName = (themeName || 'Glac').toUpperCase();
    this.theme = THEMES[this.themeName];
    if (!this.theme) {
      throw new Error(`Unknown theme: ${themeName}`);
    }

    this.matSet = new Set();
    this.neonMats = [];
    this.neonBase = 1.0;

    this.build();
  }

  build() {
    this.buildFloor();
    this.buildWalls();
    this.buildCeiling();
    this.buildContainers();
    this.buildPillars();
    this.buildLights();
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
    const mat = this.theme.floorMat;
    this.matSet.add(mat);
    const floor = new THREE.Mesh(geo, mat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.group.add(floor);
  }

  buildWalls() {
    const w = CONFIG.arena.width;
    const h = CONFIG.arena.wallHeight;
    const t = 0.5;

    // Конвертируем палитру в THREE.Color
    const wallPalette = this.theme.palette.wall || this.theme.palette.sand || this.theme.palette.obsidian;
    const wallColor = toColor(wallPalette);

    const wallMat = new THREE.MeshStandardMaterial({
      color: wallColor,
      roughness: 0.8,
      metalness: 0.0,
    });
    this.matSet.add(wallMat);

    const walls = [
      { pos: [0, h / 2, -w / 2], size: [w, h, t] },
      { pos: [0, h / 2, w / 2], size: [w, h, t] },
      { pos: [w / 2, h / 2, 0], size: [t, h, w] },
      { pos: [-w / 2, h / 2, 0], size: [t, h, w] },
    ];

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
    const mat = this.theme.ceilingMat;
    this.matSet.add(mat);
    const ceiling = new THREE.Mesh(geo, mat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = CONFIG.arena.wallHeight;
    this.group.add(ceiling);
  }

  buildContainers() {
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const mat = this.theme.containerMat;
    this.matSet.add(mat);
    const mesh = new THREE.InstancedMesh(geo, mat, CONTAINER_LAYOUT.length);
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
    const mat = this.theme.pillarMat;
    this.matSet.add(mat);
    const mesh = new THREE.InstancedMesh(geo, mat, 6);
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

  buildLights() {
    // Для Glac — факелы вместо неона. Для OBS/CRYSTAL — неон.
    if (this.themeName === 'GLAC') {
      this.buildTorches();
    } else {
      this.buildNeon();
    }
  }

  buildTorches() {
    // Факелы/жаровни: emissive-конус + PointLight тёплого цвета
    const w = CONFIG.arena.width;
    const torchPositions = [
      [-w / 2 + 1, 2.5, -w / 2 + 1],
      [w / 2 - 1, 2.5, -w / 2 + 1],
      [-w / 2 + 1, 2.5, w / 2 - 1],
      [w / 2 - 1, 2.5, w / 2 - 1],
    ];

    torchPositions.forEach(([x, y, z]) => {
      // Жаровня — цилиндр
      const baseGeo = new THREE.CylinderGeometry(0.2, 0.3, 0.5, 8);
      const baseMat = new THREE.MeshStandardMaterial({ color: 0x4a3a2a, roughness: 0.7 });
      this.matSet.add(baseMat);
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.position.set(x, y - 0.25, z);
      base.castShadow = true;
      this.group.add(base);

      // Пламя — emissive-конус
      const flameGeo = new THREE.ConeGeometry(0.15, 0.6, 6);
      const flameMat = new THREE.MeshStandardMaterial({
        color: 0xff6600,
        emissive: 0xff4400,
        emissiveIntensity: 1.5,
        roughness: 0.3,
        transparent: true,
        opacity: 0.9,
      });
      this.matSet.add(flameMat);
      const flame = new THREE.Mesh(flameGeo, flameMat);
      flame.position.set(x, y + 0.3, z);
      this.group.add(flame);

      // Тёплый PointLight
      const light = new THREE.PointLight(0xff6600, 2.0, 12);
      light.position.set(x, y + 0.5, z);
      this.group.add(light);
    });
  }

  buildNeon() {
    const w = CONFIG.arena.width;
    const unit = new THREE.BoxGeometry(1, 1, 1);
    const cyan = this.theme.neonCyan;
    const red = this.theme.neonRed;
    this.matSet.add(cyan);
    this.matSet.add(red);

    const dummy = new THREE.Object3D();

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

    const cyanMesh = new THREE.InstancedMesh(unit, cyan, 4);
    this.neonMats.push(cyan);
    fill(cyanMesh, [
      [0, 2.8, -w / 2 + 0.35, w, 0.4, 0.4],
      [0, 2.8, w / 2 - 0.35, w, 0.4, 0.4],
      [0, 0.12, -w / 2 + 0.6, w, 0.12, 0.12],
      [0, 0.12, w / 2 - 0.6, w, 0.12, 0.12],
    ]);

    const redMesh = new THREE.InstancedMesh(unit, red, 4);
    this.neonMats.push(red);
    fill(redMesh, [
      [-w / 2 + 0.35, 2.8, 0, 0.4, 0.4, w],
      [w / 2 - 0.35, 2.8, 0, 0.4, 0.4, w],
      [-w / 2 + 0.6, 0.12, 0, 0.12, 0.12, w],
      [w / 2 - 0.6, 0.12, 0, 0.12, 0.12, w],
    ]);

    // Пол без GridHelper для Glac, с ним для остальных
    if (this.themeName !== 'GLAC') {
      const grid = new THREE.GridHelper(CONFIG.arena.width, 20, 0x00aaff, 0x1a2a3a);
      grid.position.y = 0.02;
      grid.material.transparent = true;
      grid.material.opacity = 0.35;
      this.group.add(grid);
    }
  }

  buildBases() {
    // Зиккурат (Glac), алтарь (Obs), кристалл (Crystal)
    if (this.themeName === 'GLAC') {
      this.buildZigguratBase();
    } else if (this.themeName === 'OBS') {
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
    this.matSet.add(mat);
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
    this.matSet.add(heart.material);
    base.add(heart);
  }

  buildAltarBase() {
    const geo = new THREE.CylinderGeometry(1.0, 1.5, 3.0, 8);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x2d2d44,
      roughness: 0.6,
      metalness: 0.2,
    });
    this.matSet.add(mat);
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
    this.matSet.add(table.material);
    base.add(table);
  }

  buildCrystalBase() {
    const geo = new THREE.CylinderGeometry(0.5, 1.0, 6.0, 8);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x0055aa,
      roughness: 0.1,
      metalness: 0.6,
    });
    this.matSet.add(mat);
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
    this.matSet.add(crystal.material);
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
    this.matSet.add(mat);
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
    this.matSet.add(mat);
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
    this.matSet.add(mat);
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
    });
    this.matSet.forEach(mat => mat.dispose());
    this.scene.remove(this.group);
  }
}

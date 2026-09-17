/**
 * Gates — ворота в стенах. Единственная точка входа врагов.
 * Визуал: тёмный проём + рамка + красный свет; вспышка при спавне.
 * Конфигурируется массивом индексов из level.gates (0=верх, 1=низ, 2=лево, 3=право).
 */
import * as THREE from 'three';
import { CONFIG } from '../config.js';

export class Gates {
  constructor(scene, gateConfig) {
    const G = CONFIG.gates;
    this.group = new THREE.Group();
    this.group.name = 'gates';
    
    // gateConfig — массив индексов из level.gates (0=сверху, 1=ниже, 2=слева, 3=справа)
    this.gateIndices = gateConfig && gateConfig.length ? gateConfig : [0, 3];
    
    // Маппинг индексов → позиции
    const gatePositions = {
      0: { xs: G.xs, z: G.z, rot: 0 },           // верхняя стена (север)
      1: { xs: G.xs, z: -G.z, rot: 0 },          // нижняя стена (юг)
      2: { xs: [G.z], z: 0, rot: Math.PI / 2 },  // левая стена (запад)
      3: { xs: [-G.z], z: 0, rot: Math.PI / 2 }, // правая стена (восток)
    };
    
    this.flash = [];
    this.mats = [];
    this.glowMats = [];
    this.gates = [];
    
    this.gateIndices.forEach((idx, i) => {
      const pos = gatePositions[idx] || gatePositions[0];
      this.flash.push(0);
      this.buildGate(pos.xs, pos.z, pos.rot, i);
    });
    
    scene.add(this.group);
  }
  
  buildGate(xs, z, rot, gateIdx) {
    const isSideWall = rot !== 0;
    
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x2a2f3a, metalness: 0.4, roughness: 0.5, envMapIntensity: 0.7 });
    const holeMat = new THREE.MeshStandardMaterial({ color: 0x050508, metalness: 0, roughness: 1 });
    this.mats.push(frameMat, holeMat);

    const glowMat = new THREE.MeshStandardMaterial({ color: 0x101010, emissive: 0xff2233, emissiveIntensity: 1.5, metalness: 0, roughness: 0.4 });
    this.mats.push(glowMat);
    this.glowMats.push(glowMat);

    const gate = new THREE.Group();
    gate.name = `gate_${gateIdx}`;
    
    // Проём
    const holeW = 3, holeH = 4.5;
    const holeGeo = isSideWall
      ? new THREE.BoxGeometry(0.3, holeH, holeW)
      : new THREE.BoxGeometry(holeW, holeH, 0.3);
    const hole = new THREE.Mesh(holeGeo, holeMat);
    hole.position.set(0, holeH / 2, 0);
    gate.add(hole);
    
    // Рамка + glow (только для основных ворот)
    if (!isSideWall) {
      for (const px of [xs[0] - 1.7, xs[0] + 1.7]) {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.4, 5, 0.6), frameMat);
        post.position.set(px, 2.5, 0);
        post.castShadow = true;
        gate.add(post);
      }
      const lintel = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.5, 0.6), frameMat);
      lintel.position.set(0, 4.9, 0);
      gate.add(lintel);
      // Красная полоса над проёмом
      const glow = new THREE.Mesh(new THREE.BoxGeometry(3, 0.25, 0.15), glowMat);
      glow.position.set(0, 4.4, 0.2);
      gate.add(glow);
    }
    
    // Позиционирование ворот на стене
    gate.position.set(0, 0, z);
    gate.rotation.y = rot;
    
    this.group.add(gate);
    this.gates.push(gate);
  }

  /** Точка спавна у случайных ворот + джиттер. Возвращает индекс ворот. */
  pickSpawn() {
    const G = CONFIG.gates;
    const i = (Math.random() * this.gates.length) | 0;
    this.flash[i] = 1;
    return {
      x: (G.xs[i % G.xs.length] || 0) + (Math.random() - 0.5) * 2,
      z: G.z + 1.5,
      gate: i,
    };
  }

  update(dt) {
    for (let i = 0; i < this.flash.length; i++) {
      if (this.flash[i] > 0) {
        this.flash[i] = Math.max(0, this.flash[i] - dt * 2);
        this.glowMats[i].emissiveIntensity = 1.5 + this.flash[i] * 4;
      }
    }
  }

  dispose(scene) {
    this.group.traverse(o => { if (o.geometry) o.geometry.dispose(); });
    this.mats.forEach(m => m.dispose());
    scene.remove(this.group);
  }
}

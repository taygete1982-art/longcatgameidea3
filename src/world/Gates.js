/**
 * Gates — трое ворот в северной стене. Единственная точка входа врагов.
 * Визуал: тёмный проём + рамка + красный свет; вспышка при спавне.
 */
import * as THREE from 'three';
import { CONFIG } from '../config.js';

export class Gates {
  constructor(scene) {
    const G = CONFIG.gates;
    this.group = new THREE.Group();
    this.group.name = 'gates';
    this.flash = new Array(G.xs.length).fill(0);
    this.mats = [];

    const frameMat = new THREE.MeshStandardMaterial({ color: 0x2a2f3a, metalness: 0.4, roughness: 0.5, envMapIntensity: 0.7 });
    const holeMat = new THREE.MeshStandardMaterial({ color: 0x050508, metalness: 0, roughness: 1 });
    this.mats.push(frameMat, holeMat);

    this.glowMats = G.xs.map(() => {
      const m = new THREE.MeshStandardMaterial({ color: 0x101010, emissive: 0xff2233, emissiveIntensity: 1.5, metalness: 0, roughness: 0.4 });
      this.mats.push(m);
      return m;
    });

    const z = G.z;
    G.xs.forEach((x, i) => {
      const gate = new THREE.Group();
      gate.name = `gate_${i}`;
      // Проём.
      const hole = new THREE.Mesh(new THREE.BoxGeometry(3, 4.5, 0.3), holeMat);
      hole.position.set(x, 2.25, z);
      gate.add(hole);
      // Рамка: две стойки + перекладина.
      const post = new THREE.BoxGeometry(0.4, 5, 0.6);
      for (const px of [x - 1.7, x + 1.7]) {
        const p = new THREE.Mesh(post, frameMat);
        p.position.set(px, 2.5, z);
        p.castShadow = true;
        gate.add(p);
      }
      const lintel = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.5, 0.6), frameMat);
      lintel.position.set(x, 4.9, z);
      gate.add(lintel);
      // Красная полоса над проёмом.
      const glow = new THREE.Mesh(new THREE.BoxGeometry(3, 0.25, 0.15), this.glowMats[i]);
      glow.position.set(x, 4.4, z + 0.2);
      gate.add(glow);
      this.group.add(gate);
    });

    scene.add(this.group);
  }

  /** Точка спавна у случайных ворот + джиттер. Возвращает индекс ворот. */
  pickSpawn() {
    const G = CONFIG.gates;
    const i = (Math.random() * G.xs.length) | 0;
    this.flash[i] = 1;
    return {
      x: G.xs[i] + (Math.random() - 0.5) * 2,
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

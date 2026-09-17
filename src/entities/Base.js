/**
 * Base — ядро базы на юге арены. Цель обороны.
 * Визуал: платформа + столб + пульсирующее циан-сердце + кольца.
 */
import * as THREE from 'three';
import { CONFIG } from '../config.js';

export class Base {
  constructor(scene) {
    const B = CONFIG.base;
    this.maxHp = B.hp;
    this.hp = this.maxHp;
    this.destroyed = false;
    this.pulse = 0;
    this.group = new THREE.Group();
    this.group.name = 'base';
    this.group.position.set(B.pos.x, 0, B.pos.z);

    const hull = new THREE.MeshStandardMaterial({ color: 0x3a4356, metalness: 0.3, roughness: 0.5, envMapIntensity: 0.8 });
    this.coreMat = new THREE.MeshStandardMaterial({ color: 0x101010, emissive: 0x00aaff, emissiveIntensity: 2.5, metalness: 0, roughness: 0.4 });
    this.mats = [hull, this.coreMat];

    // Платформа.
    const plat = new THREE.Mesh(new THREE.CylinderGeometry(B.radius, B.radius + 0.4, 0.3, 12), hull);
    plat.position.y = 0.15;
    plat.receiveShadow = true;
    this.group.add(plat);

    // Столб-ядро.
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.7, 2.6, 10), hull);
    pillar.position.y = 1.6;
    pillar.castShadow = true;
    this.group.add(pillar);

    // Сердце.
    const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.45), this.coreMat);
    core.position.y = 2.2;
    this.group.add(core);
    this.core = core;

    // Кольца.
    this.rings = [];
    for (let i = 0; i < 2; i++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(1.1 + i * 0.35, 0.05, 8, 32), this.coreMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.35 + i * 0.5;
      this.group.add(ring);
      this.rings.push(ring);
    }

    scene.add(this.group);
    this.pos = this.group.position;
  }

  damage(n) {
    if (this.destroyed) return;
    this.hp = Math.max(0, this.hp - n);
    this.pulse = 1;
    if (this.hp <= 0) this.destroyed = true;
  }

  restore() {
    this.hp = this.maxHp;
    this.destroyed = false;
    this.coreMat.emissive.set(0x00aaff);
  }

  update(dt, time) {
    // Дыхание сердца + вращение колец; при уроне — красная вспышка.
    const beat = 1 + 0.15 * Math.sin(time * 2.2);
    this.core.scale.setScalar(beat);
    this.core.rotation.y += dt * 0.8;
    this.rings[0].rotation.z += dt * 0.4;
    this.rings[1].rotation.z -= dt * 0.3;
    if (this.pulse > 0) {
      this.pulse = Math.max(0, this.pulse - dt * 2.5);
      this.coreMat.emissive.setHex(0x00aaff).lerp(new THREE.Color(0xff2222), this.pulse);
    }
    this.coreMat.emissiveIntensity = this.destroyed ? 0.3 : 2.5;
  }

  dispose(scene) {
    this.group.traverse(o => { if (o.geometry) o.geometry.dispose(); });
    this.mats.forEach(m => m.dispose());
    scene.remove(this.group);
  }
}

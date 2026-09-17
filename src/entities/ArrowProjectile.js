/**
 * src/entities/ArrowProjectile.js
 * 
 * Ancient arrow projectile — single mesh with conical head,
 * conical fletching, and cylindrical shaft. No gunpowder, no recoil.
 */
import * as THREE from 'three';

/** Material definitions for arrows */
const ARROW_MATERIALS = {
  GLAC: {
    shaft:  new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.8, metalness: 0.0 }),
    fletch: new THREE.MeshStandardMaterial({ color: 0x7a8a3a, roughness: 0.7, metalness: 0.0 }),
    head:   new THREE.MeshStandardMaterial({ color: 0x4a3a2a, roughness: 0.5, metalness: 0.1 }),
    trail:  new THREE.MeshBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0.6, side: THREE.DoubleSide }),
  },
  OBS: {
    shaft:  new THREE.MeshStandardMaterial({ color: 0x4a3a2a, roughness: 0.8, metalness: 0.0 }),
    fletch: new THREE.MeshStandardMaterial({ color: 0x0077aa, roughness: 0.6, metalness: 0.1 }),
    head:   new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.3, metalness: 0.6 }),
    trail:  new THREE.MeshBasicMaterial({ color: 0x8b3a1a, transparent: true, opacity: 0.6, side: THREE.DoubleSide }),
  },
  CRYSTAL: {
    shaft:  new THREE.MeshStandardMaterial({ color: 0x3a2a2a, roughness: 0.8, metalness: 0.0 }),
    fletch: new THREE.MeshStandardMaterial({ color: 0x0055aa, roughness: 0.6, metalness: 0.1 }),
    head:   new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.2, metalness: 0.8 }),
    trail:  new THREE.MeshBasicMaterial({ color: 0xaa3366, transparent: true, opacity: 0.6, side: THREE.DoubleSide }),
  },
};

/**
 * ArrowProjectile — one mesh per arrow + one LineTrail per arrow
 * 
 * @param {THREE.Scene} scene
 * @param {string} theme — 'GLAC' | 'OBS' | 'CRYSTAL'
 * @param {number} speed — projectile speed (pixels per frame)
 */
export class ArrowProjectile {
  constructor(scene, theme, speed) {
    this.scene = scene;
    this.theme = theme;
    this.speed = speed;
    this.life = 1.8;
    this.active = false;

    // Arrow shape: long thin cylinder with conical head
    const shaftGeo = new THREE.CylinderGeometry(0.025, 0.015, 0.6, 8);
    shaftGeo.rotateX(-Math.PI / 2);
    shaftGeo.rotateY(Math.PI / 4);
    const shaft = new THREE.Mesh(shaftGeo, ARROW_MATERIALS[theme].shaft);

    const fletchGeo = new THREE.ConeGeometry(0.03, 0.06, 8);
    fletchGeo.rotateX(-Math.PI / 2);
    fletchGeo.rotateY(Math.PI / 2);
    const fletch = new THREE.Mesh(fletchGeo, ARROW_MATERIALS[theme].fletch);
    fletch.position.y = 0.2;

    const headGeo = new THREE.ConeGeometry(0.018, 0.04, 8);
    headGeo.rotateX(Math.PI / 2);
    headGeo.translateZ(0.25);
    const head = new THREE.Mesh(headGeo, ARROW_MATERIALS[theme].head);

    const group = new THREE.Group();
    group.add(shaft);
    group.add(fletch);
    group.add(head);

    this.mesh = group;
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.scene.add(this.mesh);

    // Trail: Line with 12 segments following parabolic arc
    const trailPoints = [];
    for (let i = 0; i < 13; i++) {
      trailPoints.push(new THREE.Vector3(0, 0, 0));
    }
    this.trailGeo = new THREE.BufferGeometry();
    this.trailGeo.setAttribute('position', new THREE.Float32BufferAttribute(trailPoints, 3));
    this.trailMat = ARROW_MATERIALS[theme].trail;
    this.trail = new THREE.Line(this.trailGeo, this.trailMat);
    this.trail.frustumCulled = false;
    this.scene.add(this.trail);
  }

  dispose() {
    if (this.trail) {
      this.scene.remove(this.trail);
      this.trail.geometry.dispose();
      this.trailMat.dispose();
      this.trail = null;
    }
    if (this.mesh) {
      this.scene.remove(this.mesh);
      this.mesh.geometry.dispose();
      this.mesh.material.dispose();
      this.mesh = null;
    }
  }

  update(dt) {
    // Parabolic arc: y = sin(t * π) * verticalSpeed
    const t = dt / this.life;
    const parabolicY = Math.sin(t * Math.PI) * this.speed * 0.3;

    // Current position (start at origin, moving along X+Z)
    this.mesh.position.x = this.mesh.position.x + this.speed * dt * 0.8;
    this.mesh.position.z = this.mesh.position.z + this.speed * dt * 0.6;
    this.mesh.position.y = parabolicY;

    this.mesh.rotation.z = Math.atan2(-this.speed * dt * 0.8, -this.speed * dt * 0.6);
    this.mesh.rotation.x = 0.2;

    // Update trail
    const points = this.trail.geometry.attributes.position.array;
    const trailSpeed = this.speed * 0.5;

    for (let i = 0; i < 12; i++) {
      const t = (i + 1) / 13;
      const y = Math.sin(t * Math.PI) * this.speed * 0.3;
      const x = -this.speed * t * dt * 0.8;
      const z = -this.speed * t * dt * 0.6;
      points[i * 3] = x;
      points[i * 3 + 1] = y;
      points[i * 3 + 2] = z;
    }
    this.trail.geometry.attributes.position.needsUpdate = true;
    this.trail.material.opacity = Math.max(0, 1 - t);
  }

  isHit() {
    return this.life <= 0 ||
      this.mesh.position.x < -100 || this.mesh.position.x > 100 ||
      this.mesh.position.z < -100 || this.mesh.position.z > 100;
  }
}

// Do NOT re-export Projectiles here — it causes circular import
// Projectiles is defined in src/systems/Projectiles.js

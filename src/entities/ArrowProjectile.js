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
 */
export class ArrowProjectile {
  constructor(scene, theme, speed) {
    this.scene = scene;
    this.theme = (theme || 'GLAC').toUpperCase();
    this.speed = speed;
    this.life = 1.8;
    this.maxLife = 1.8;
    this.active = false;
    this.dir = new THREE.Vector3(1, 0, 0);

    const mats = ARROW_MATERIALS[this.theme] || ARROW_MATERIALS.GLAC;

    // Arrow shape: long thin cylinder with conical head
    const shaftGeo = new THREE.CylinderGeometry(0.025, 0.015, 0.6, 8);
    shaftGeo.rotateX(-Math.PI / 2);
    shaftGeo.rotateY(Math.PI / 4);
    const shaft = new THREE.Mesh(shaftGeo, mats.shaft);

    const fletchGeo = new THREE.ConeGeometry(0.03, 0.06, 8);
    fletchGeo.rotateX(-Math.PI / 2);
    fletchGeo.rotateY(Math.PI / 2);
    const fletch = new THREE.Mesh(fletchGeo, mats.fletch);
    fletch.position.y = 0.2;

    const headGeo = new THREE.ConeGeometry(0.018, 0.04, 8);
    headGeo.rotateX(Math.PI / 2);
    headGeo.translate(0, 0, 0.25);
    const head = new THREE.Mesh(headGeo, mats.head);

    const group = new THREE.Group();
    group.add(shaft);
    group.add(fletch);
    group.add(head);

    this.mesh = group;
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.mesh.visible = false;
    this.scene.add(this.mesh);

    // Trail: Line with 12 segments
    const trailPoints = [];
    for (let i = 0; i < 13; i++) {
      trailPoints.push(new THREE.Vector3(0, 0, 0));
    }
    this.trailGeo = new THREE.BufferGeometry();
    this.trailGeo.setAttribute('position', new THREE.Float32BufferAttribute(trailPoints, 3));
    this.trailMat = mats.trail;
    this.trail = new THREE.Line(this.trailGeo, this.trailMat);
    this.trail.frustumCulled = false;
    this.trail.visible = false;
    this.scene.add(this.trail);
    
    // Store trail history for visual effect
    this.trailHistory = [];
  }

  fire(origin, dir) {
    this.active = true;
    this.life = this.maxLife;
    this.mesh.position.copy(origin);
    this.dir.copy(dir).normalize();
    this.mesh.visible = true;
    this.trail.visible = true;
    this.trailHistory = [];
    
    // Orient arrow to face direction
    this.mesh.rotation.y = Math.atan2(this.dir.x, this.dir.z);
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
      this.mesh.children.forEach(c => c.geometry.dispose());
      this.mesh = null;
    }
  }

  update(dt) {
    if (!this.active) return;
    
    this.life -= dt;
    if (this.life <= 0) {
      this.active = false;
      this.mesh.visible = false;
      this.trail.visible = false;
      return;
    }

    // Move along direction
    const moveStep = this.speed * dt;
    this.mesh.position.x += this.dir.x * moveStep;
    this.mesh.position.z += this.dir.z * moveStep;
    
    // Parabolic arc
    const progress = 1 - (this.life / this.maxLife);
    this.mesh.position.y = Math.sin(progress * Math.PI) * 1.5;
    
    // Update trail history
    this.trailHistory.push(this.mesh.position.clone());
    if (this.trailHistory.length > 12) {
      this.trailHistory.shift();
    }
    
    const points = this.trail.geometry.attributes.position.array;
    for (let i = 0; i < 12; i++) {
      if (i < this.trailHistory.length) {
        points[i * 3] = this.trailHistory[i].x - this.mesh.position.x;
        points[i * 3 + 1] = this.trailHistory[i].y - this.mesh.position.y;
        points[i * 3 + 2] = this.trailHistory[i].z - this.mesh.position.z;
      }
    }
    this.trail.geometry.attributes.position.needsUpdate = true;
    this.trail.material.opacity = Math.max(0, this.life / this.maxLife);
  }

  isHit() {
    return this.life <= 0 ||
      this.mesh.position.x < -50 || this.mesh.position.x > 50 ||
      this.mesh.position.z < -50 || this.mesh.position.z > 50;
  }
}

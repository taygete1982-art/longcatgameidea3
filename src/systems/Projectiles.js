/**
 * src/systems/Projectiles.js
 * 
 * Arrow Projectile System (ancient bow & arrow, no firearms)
 * 
 * Structure:
 *   - ArrowProjectile: one mesh per arrow + one LineTrail mesh per arrow
 *     - mesh: BoxGeometry(0.06, 0.06, 0.6) + ArrowShape silhouette
 *     - trail: Line (10 segments) following parabolic arc
 *   - Projectiles: pool of ArrowProjectiles
 * 
 * Physics: parabolic arc via Math.sin(t * π) * verticalSpeed
 */
import * as THREE from 'three';
import { CONFIG } from '../config.js';
import { THEMES } from '../config/theme.js';
import { ArrowProjectile } from '../entities/ArrowProjectile.js';

// ============================================================
// PROJECTILE POOL
// ============================================================

export class Projectiles {
  constructor(scene, opts = {}) {
    const count = opts.pool ?? CONFIG.combat.pool;
    const speed = opts.speed ?? CONFIG.combat.projectileSpeed;
    const theme = opts.theme ?? CONFIG.theme;

    this.count = count;
    this.speed = speed;
    this.theme = theme;
    this.projectiles = [];

    for (let i = 0; i < count; i++) {
      this.projectiles.push(new ArrowProjectile(scene, theme, speed));
    }
  }

  fire(origin, dir) {
    const slot = this.projectiles.find(p => !p.active);
    if (!slot) return;
    slot.active = true;
    slot.mesh.position.copy(origin);
    slot.life = this.speed;
  }

  update(dt, dummies, bounds, onHit) {
    let hit = false;
    for (const p of this.projectiles) {
      if (!p.active) continue;

      p.update(dt);
      if (p.isHit()) {
        p.active = false;
        continue;
      }

      // Check collision with enemies
      for (const d of dummies) {
        if (!d.alive) continue;
        const dx = p.mesh.position.x - d.pos.x;
        const dz = p.mesh.position.z - d.pos.z;
        const distSq = dx * dx + dz * dz;
        if (distSq < (d.radius + 0.2) * (d.radius + 0.2)) {
          hit = true;
          d.hp -= 10; // Arrow damage
          onHit(d);
          break;
        }
      }
      if (hit) break;
    }
    return hit;
  }

  clear() {
    for (const p of this.projectiles) {
      p.active = false;
      p.mesh.position.set(0, 0, 0);
    }
  }

  dispose(scene) {
    for (const p of this.projectiles) {
      p.dispose();
    }
  }
}

// ============================================================
// ARTIFACT COLLISION
// ============================================================

/**
 * Check if a position hits an artifact.
 * @param {THREE.Vector3} pos
 * @param {THREE.Group} artifactGroup
 * @returns {{hit: boolean, artifact: string|undefined}}
 */
export function checkArtifactHit(pos, artifactGroup) {
  if (!artifactGroup) return { hit: false };

  const children = artifactGroup.children;
  for (const child of children) {
    if (child.visible === false) continue;
    const dist = pos.distanceTo(child.position);
    if (dist < 0.45) {
      return { hit: true, artifact: child.material.name || 'unknown' };
    }
  }
  return { hit: false };
}

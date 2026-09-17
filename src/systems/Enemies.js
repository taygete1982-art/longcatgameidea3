/**
 * Enemies — фиксированный пул врагов (optimize: ноль аллокаций в волне).
 * Группы переиспользуются, геометрии/материалы shared внутри Enemy.
 */
import { Enemy } from '../entities/Enemy.js';
import * as THREE from 'three';

export class Enemies {
  constructor(scene, size = 24) {
    this.pool = [];
    for (let i = 0; i < size; i++) this.pool.push(new Enemy(scene));
    this._targets = [];
  }

  spawn(type, pos) {
    const e = this.pool.find(e => !e.active);
    if (!e) return null;
    // Маппинг старых ключей Waves → id из EnemyTypes
    const typeMap = {
      runner: 'parchment',
      shooter: 'scribes',
      tank: 'golem',
      miniboss: 'mini_golem',
    };
    const mappedType = typeMap[type] || type;
    e.spawn(mappedType, pos);
    return e;
  }

  alive() {
    return this.pool.filter(e => e.active);
  }

  aliveCount() {
    let n = 0;
    for (const e of this.pool) if (e.active) n++;
    return n;
  }

  /** Кешированные мишени для Projectiles.update — без аллокаций в кадре. */
  syncTargets() {
    if (this._targets.length === 0) {
      for (const e of this.pool) this._targets.push({ pos: new THREE.Vector3(), radius: 0.8, alive: false, ref: e });
    }
    for (let i = 0; i < this.pool.length; i++) {
      const e = this.pool[i];
      const t = this._targets[i];
      t.pos.copy(e.group.position);
      t.alive = e.active && e.state !== 'die';
      if (e.cfg) t.radius = e.type === 'tank' ? 1.1 : e.type === 'miniboss' ? 1.4 : 0.8;
    }
    return this._targets;
  }

  update(dt, playerPos, basePos, api) {
    for (const e of this.pool) e.update(dt, playerPos, basePos, api);
  }

  clear() {
    for (const e of this.pool) e.deactivate();
  }

  dispose() {
    for (const e of this.pool) e.dispose();
    this.pool = [];
  }
}

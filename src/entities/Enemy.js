/**
 * src/entities/Enemy.js
 * 
 * Enemy — враг с FSM (game-ai: spawn→chase→attack→die;
 * tune-enemy-ai: восприятие отдельно от движения, телеграфы, spacing).
 * Типы: parchment (скрипач), golem (каменный гном), shed (олень-поселенец),
 * archer (архер), scribes (скрипачи), miniboss, boss.
 */
import * as THREE from 'three';
import { CONFIG } from '../config.js';

// Shared геометрии/материалы на всех врагах (optimize: reuse).
let shared = null;
function getShared() {
  if (shared) return shared;
  shared = {
    runnerGeo: new THREE.ConeGeometry(0.45, 1.4, 6),
    shooterGeo: new THREE.OctahedronGeometry(0.6),
    tankGeo: new THREE.BoxGeometry(1.2, 1.0, 1.2),
    eyeGeo: new THREE.BoxGeometry(0.34, 0.14, 0.1),
    runnerMat: new THREE.MeshStandardMaterial({ color: 0x8a2a3a, metalness: 0.2, roughness: 0.6 }),
    shooterMat: new THREE.MeshStandardMaterial({ color: 0x3a3a8a, metalness: 0.2, roughness: 0.6 }),
    tankMat: new THREE.MeshStandardMaterial({ color: 0x5a5a3a, metalness: 0.3, roughness: 0.55 }),
    bossMat: new THREE.MeshStandardMaterial({ color: 0x8a1a5a, metalness: 0.3, roughness: 0.5, emissive: 0x330000, emissiveIntensity: 0.8 }),
    flashMat: new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 1.5 }),
  };
  return shared;
}

const EYE_COLORS = {
  parchment: 0xffcc33,
  golem: 0xaaaaaa,
  shed: 0xffdd77,
  archer: 0xff44ff,
  scribes: 0xffddaa,
  miniBoss: 0xff00aa,
  boss: 0xff0000,
};

// Maps enemy type IDs to their visual properties
const TYPE_MAP = {
  parchment: { type: 'runner', speed: 1.5, radius: 0.35 },
  golem: { type: 'tank', speed: 1.0, radius: 0.5 },
  shed: { type: 'runner', speed: 2.8, radius: 0.32 },
  archer: { type: 'shooter', speed: 2.2, radius: 0.3 },
  scribes: { type: 'runner', speed: 2.0, radius: 0.32 },
  mini_golem: { type: 'tank', speed: 0.9, radius: 0.45 },
  mini_shed: { type: 'runner', speed: 2.5, radius: 0.35 },
  boss_golem: { type: 'tank', speed: 0.7, radius: 0.8 },
  boss_shed: { type: 'runner', speed: 3.2, radius: 0.4 },
};

export class Enemy {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.visible = false;
    this.scene.add(this.group);
    this.active = false;
    this.bodyMesh = null;
    this.eyeMat = null;
  }

  /**
   * @param {string} type — enemy type id ('parchment', 'golem', 'shed', 'archer', etc.)
   * @param {Object} spawn — {x, z} position
   */
  spawn(type, spawn) {
    const S = getShared();
    const cfg = TYPE_MAP[type];
    if (!cfg) {
      console.warn(`Unknown enemy type: ${type}`);
      return;
    }

    this.type = cfg.type;
    this.speed = cfg.speed;
    this.radius = cfg.radius;
    this.hp = 1; // HP managed externally by EnemyTypes
    this.state = 'spawn';
    this.stateTime = 0;
    this.fireTimer = 1 + Math.random();
    this.victim = 'player';
    this.flash = 0;
    this.active = true;

    // Пересобрать тело под тип (меши shared, глаз свой для flash).
    this.group.clear();
    const geo = this.type === 'runner' ? S.runnerGeo
      : this.type === 'shooter' ? S.shooterGeo : S.tankGeo;
    const mat = this.type === 'runner' ? S.runnerMat
      : this.type === 'shooter' ? S.shooterMat : this.type === 'tank' ? S.tankMat : S.bossMat;
    const scale = this.type === 'miniboss' || this.type === 'tank' ? 1.5 : 1;
    this.bodyMesh = new THREE.Mesh(geo, mat);
    this.bodyMesh.scale.setScalar(scale);
    this.bodyMesh.position.y = this.type === 'tank' ? 0.5 : 0.8;
    this.bodyMesh.castShadow = true;
    this.bodyMesh.userData.baseMat = mat;
    this.group.add(this.bodyMesh);

    this.eyeMat = new THREE.MeshStandardMaterial({
      color: 0x101010,
      emissive: EYE_COLORS[type],
      emissiveIntensity: 2.5,
    });
    const eye = new THREE.Mesh(S.eyeGeo, this.eyeMat);
    eye.position.set(0, this.bodyMesh.position.y + 0.25, 0.45 * scale);
    this.group.add(eye);

    this.group.position.set(spawn.x, 0, spawn.z);
    this.group.visible = true;
    this.group.scale.setScalar(0.01); // spawn-pop
  }

  /**
   * dt, playerPos/basePos: Vector3, api: {onMelee(enemy, victim), onShoot(enemy), onEnemyHit(enemy, dmg, isBoss)}
   */
  update(dt, playerPos, basePos, api) {
    if (!this.active) return;
    this.stateTime += dt;
    const p = this.group.position;
    const dx = playerPos.x - p.x;
    const dz = playerPos.z - p.z;
    const dist = Math.hypot(dx, dz) || 0.001;
    const nx = dx / dist;
    const nz = dz / dist;

    // Лицом к игроку (без мгновенного разворота в атаке — телеграф читается).
    const targetYaw = Math.atan2(nx, nz);
    let d = targetYaw - this.group.rotation.y;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    this.group.rotation.y += d * Math.min(1, dt * 6);

    if (this.flash > 0) {
      this.flash -= dt;
      if (this.flash <= 0) this.bodyMesh.material = this.bodyMesh.userData.baseMat;
    }

    switch (this.state) {
      case 'spawn': {
        // Появление 0.5с: масштаб растёт, неуязвим для контакта.
        const s = Math.min(1, this.stateTime / 0.5);
        this.group.scale.setScalar(Math.max(0.01, s));
        if (this.stateTime >= 0.5) this.setState('chase');
        break;
      }
      case 'chase': {
        // Цель — база или игрок, если рядом.
        const bx = basePos.x - p.x;
        const bz = basePos.z - p.z;
        const bdist = Math.hypot(bx, bz) || 0.001;
        if (dist < this.radius + 0.1) {
          this.victim = 'player';
          this.setState('windup');
        } else if (bdist < 1.5) {
          this.victim = 'base';
          this.setState('windup');
        } else {
          this.seek(bx / bdist, bz / bdist, this.speed, dt);
        }
        break;
      }
      case 'windup': {
        // Телеграф 0.4с: глаз ярче, потом удар.
        this.eyeMat.emissiveIntensity = 5;
        if (this.stateTime >= 0.4) {
          this.eyeMat.emissiveIntensity = 2.5;
          if (this.victim === 'player') api.onMelee(this, 'player');
          else api.onMelee(this, 'base');
          this.setState('recover');
        }
        break;
      }
      case 'recover': {
        if (this.stateTime >= 0.5) this.setState('chase');
        break;
      }
      case 'die': {
        // Схлопывание 0.3с, потом в пул.
        const s = Math.max(0.01, 1 - this.stateTime / 0.3);
        this.group.scale.setScalar(s);
        if (this.stateTime >= 0.3) this.deactivate();
        break;
      }
    }
  }

  seek(nx, nz, speed, dt) {
    this.group.position.x += nx * speed * dt;
    this.group.position.z += nz * speed * dt;
  }

  strafe(dt, nx, nz) {
    const s = Math.sin(this.stateTime * 1.7) > 0 ? 1 : -1;
    this.group.position.x += -nz * s * this.speed * 0.5 * dt;
    this.group.position.z += nx * s * this.speed * 0.5 * dt;
  }

  setState(s) {
    this.state = s;
    this.stateTime = 0;
  }

  /** Возвращает true если убит. */
  damage(amount) {
    if (!this.active || this.state === 'die') return false;
    this.hp -= amount;
    const S = getShared();
    this.bodyMesh.material = S.flashMat;
    this.flash = 0.08;
    if (this.hp <= 0) {
      this.setState('die');
      return true;
    }
    return false;
  }

  deactivate() {
    this.active = false;
    this.group.visible = false;
  }

  dispose() {
    this.scene.remove(this.group);
    if (this.eyeMat) this.eyeMat.dispose();
  }
}

export default Enemy;

/**
 * Player — модель героя (hero-character, упрощённо под вид сверху).
 * Силуэт: капсула + визор + рюкзак + кольцо базы. Коллизия — отдельный прокси.
 */
import * as THREE from 'three';
import { CONFIG } from '../config.js';

export class Player {
  constructor(scene) {
    this.radius = CONFIG.player.radius;
    this.maxHp = CONFIG.player.hp;
    this.hp = this.maxHp;
    this.invuln = 0;
    this.yaw = 0;
    this.bobTime = 0;
    this.group = new THREE.Group();
    this.group.name = 'player';

    const armor = new THREE.MeshStandardMaterial({ color: 0x2a3550, metalness: 0.3, roughness: 0.5, envMapIntensity: 0.8 });
    const trim = new THREE.MeshStandardMaterial({ color: 0x101010, emissive: 0x00aaff, emissiveIntensity: 2.5, metalness: 0, roughness: 0.4 });
    const pack = new THREE.MeshStandardMaterial({ color: 0x6a5a35, metalness: 0.1, roughness: 0.6, envMapIntensity: 0.6 });
    this.mats = [armor, trim, pack];

    // Тело-капсула.
    this.body = new THREE.Mesh(new THREE.CapsuleGeometry(0.35, 0.8, 6, 12), armor);
    this.body.position.y = 0.95;
    this.body.castShadow = true;
    this.group.add(this.body);

    // Визор (спереди, +Z).
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.15, 0.12), trim);
    visor.position.set(0, 1.35, 0.28);
    this.group.add(visor);

    // Рюкзак.
    const packMesh = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.5, 0.25), pack);
    packMesh.position.set(0, 1.0, -0.33);
    packMesh.castShadow = true;
    this.group.add(packMesh);

    // Кольцо базы — читается сверху.
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.06, 8, 24), trim);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.06;
    this.group.add(ring);

    // Прокси коллизии (невидимый, отдельно от визуала).
    this.proxy = new THREE.Mesh(new THREE.CylinderGeometry(this.radius, this.radius, 1.6, 8));
    this.proxy.position.y = 0.8;
    this.proxy.visible = false;
    this.proxy.name = 'player_proxy';
    this.group.add(this.proxy);

    this.group.position.set(0, 0, 10);
    scene.add(this.group);
  }

  /** move: {x, z} нормализованный вектор. bounds: {minX,maxX,minZ,maxZ}. */
  update(dt, move, bounds) {
    if (this.invuln > 0) this.invuln -= dt;
    const speed = CONFIG.player.speed;
    const moving = (move.x !== 0 || move.z !== 0);
    if (moving) {
      this.group.position.x += move.x * speed * dt;
      this.group.position.z += move.z * speed * dt;
      const targetYaw = Math.atan2(move.x, move.z);
      let d = targetYaw - this.yaw;
      while (d > Math.PI) d -= Math.PI * 2;
      while (d < -Math.PI) d += Math.PI * 2;
      this.yaw += d * Math.min(1, dt * 12);
      this.group.rotation.y = this.yaw;
      this.bobTime += dt * 10;
    }
    this.body.position.y = 0.95 + (moving ? Math.abs(Math.sin(this.bobTime)) * 0.07 : 0);
    const b = bounds;
    const r = this.radius;
    this.group.position.x = Math.max(b.minX + r, Math.min(b.maxX - r, this.group.position.x));
    this.group.position.z = Math.max(b.minZ + r, Math.min(b.maxZ - r, this.group.position.z));
  }

  getPosition() { return this.group.position; }
  getForward() { return new THREE.Vector3(Math.sin(this.yaw), 0, Math.cos(this.yaw)); }

  /** Урон по игроку. Возвращает 'hit' | 'died' | 'ignored' (неуязвимость). */
  hit() {
    if (this.invuln > 0) return 'ignored';
    this.hp -= 1;
    this.invuln = CONFIG.player.invuln;
    if (this.hp <= 0) return 'died';
    return 'hit';
  }

  revive() {
    this.hp = this.maxHp;
    this.invuln = 2;
    this.group.position.set(0, 0, 12);
    this.yaw = 0;
    this.group.rotation.y = 0;
  }

  dispose(scene) {
    this.group.traverse(o => { if (o.geometry) o.geometry.dispose(); });
    this.mats.forEach(m => m.dispose());
    scene.remove(this.group);
  }
}

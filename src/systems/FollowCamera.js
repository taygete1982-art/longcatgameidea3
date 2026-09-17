/**
 * FollowCamera — держит игрока в нижней трети портретного кадра.
 * Смещение фиксировано (top-down с наклоном), взгляд — в точку впереди игрока.
 */
import * as THREE from 'three';
import { CONFIG } from '../config.js';

export class FollowCamera {
  constructor(camera) {
    this.camera = camera;
    this.current = camera.position.clone();
    this.lookCurrent = new THREE.Vector3(0, 0, 0);
  }

  update(dt, playerPos, forward) {
    const C = CONFIG.camera;
    const desired = new THREE.Vector3(
      playerPos.x,
      playerPos.y + C.height,
      playerPos.z + C.back
    );
    const lookTarget = new THREE.Vector3(
      playerPos.x + forward.x * C.lookAhead,
      playerPos.y,
      playerPos.z + forward.z * C.lookAhead
    );
    const k = 1 - Math.exp(-C.smooth * dt);
    this.current.lerp(desired, k);
    this.lookCurrent.lerp(lookTarget, k);
    this.camera.position.copy(this.current);
    this.camera.lookAt(this.lookCurrent);
  }
}

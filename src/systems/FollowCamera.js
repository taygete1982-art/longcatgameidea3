/**
 * FollowCamera — top-down: камера закреплена над центром арены,
 * вся арена 40×40 всегда в кадре. Игрок перемещается внутри видимой зоны.
 */
import * as THREE from 'three';
import { CONFIG } from '../config.js';

export class FollowCamera {
  constructor(camera) {
    this.camera = camera;
    this.current = camera.position.clone();
    this.lookCurrent = new THREE.Vector3(0, 0, 0);
    this.initialized = false;
  }

  update(dt, playerPos, forward) {
    const C = CONFIG.camera;

    if (C.topDown) {
      // Фиксированная камера сверху — центр арены, видна вся 40×40
      const desired = new THREE.Vector3(0, 65, 0);
      const lookTarget = new THREE.Vector3(0, 0, 0);
      
      if (!this.initialized) {
        this.current.copy(desired);
        this.lookCurrent.copy(lookTarget);
        this.initialized = true;
      } else {
        const k = 1 - Math.exp(-C.smooth * dt);
        this.current.lerp(desired, k);
        this.lookCurrent.lerp(lookTarget, k);
      }
      
      this.camera.position.copy(this.current);
      this.camera.lookAt(this.lookCurrent);
      this.camera.rotation.z = 0;
    } else {
      // Следующая камера за игроком (старое поведение)
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
}

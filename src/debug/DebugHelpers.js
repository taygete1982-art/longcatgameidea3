/**
 * DebugHelpers — визуальная отладка сцены.
 * Паттерн из threejs-best-practices: visual debugging (AxesHelper, GridHelper, CameraHelper).
 */
import * as THREE from 'three';
import { CONFIG } from '../config.js';

export class DebugHelpers {
  static addGrid(scene) {
    const grid = new THREE.GridHelper(CONFIG.debug.gridSize, CONFIG.debug.gridDivisions, 0x444444, 0x222222);
    grid.name = 'debug-grid';
    scene.add(grid);
  }

  static addAxes(scene) {
    const axes = new THREE.AxesHelper(CONFIG.debug.axesSize);
    axes.name = 'debug-axes';
    scene.add(axes);
  }

  static addShadowCameraHelper(scene, light) {
    if (light.shadow) {
      const helper = new THREE.CameraHelper(light.shadow.camera);
      helper.name = 'debug-shadow-camera';
      scene.add(helper);
    }
  }
}

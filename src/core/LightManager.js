import * as THREE from 'three';
import { CONFIG } from '../config.js';

export class LightManager {
  constructor(scene) {
    this.scene = scene;
    this.lights = new Map();
    this.dynamicLights = [];
    this.pulseTime = 0;
  }

  addAmbient(id = 'ambient', color = 0xffffff, intensity = 0.5) {
    const light = new THREE.AmbientLight(color, intensity);
    this.lights.set(id, light);
    this.scene.add(light);
    return light;
  }

  addDirectional(id = 'directional', color = 0xffffff, intensity = 1, position = new THREE.Vector3(5, 10, 5), castShadow = true) {
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.copy(position);
    if (castShadow) {
      light.castShadow = true;
      const size = CONFIG.quality.medium.shadowMapSize;
      light.shadow.mapSize.width = size;
      light.shadow.mapSize.height = size;
      light.shadow.camera.near = CONFIG.shadows.cameraNear;
      light.shadow.camera.far = CONFIG.shadows.cameraFar;
      light.shadow.camera.left = -CONFIG.shadows.cameraSize;
      light.shadow.camera.right = CONFIG.shadows.cameraSize;
      light.shadow.camera.top = CONFIG.shadows.cameraSize;
      light.shadow.camera.bottom = -CONFIG.shadows.cameraSize;
      light.shadow.bias = CONFIG.shadows.bias;
      light.shadow.normalBias = CONFIG.shadows.normalBias;
    }
    this.lights.set(id, light);
    this.scene.add(light);
    return light;
  }

  addPoint(id, color = 0xffffff, intensity = 1, distance = 0, decay = 2, position = new THREE.Vector3()) {
    const light = new THREE.PointLight(color, intensity, distance, decay);
    light.position.copy(position);
    this.lights.set(id, light);
    this.scene.add(light);
    return light;
  }

  addPulsing(id, color, intensity, distance, phaseOffset = 0) {
    const light = this.addPoint(id, color, intensity, distance, 2, new THREE.Vector3());
    this.dynamicLights.push({ id, light, baseIntensity: intensity, phaseOffset });
    return light;
  }

  addSpot(id, color, intensity, position, target, angle = Math.PI / 4) {
    const light = new THREE.SpotLight(color, intensity, 0, angle, 0.5, 2);
    light.position.copy(position);
    light.target.position.copy(target);
    light.castShadow = true;
    this.lights.set(id, light);
    this.scene.add(light);
    this.scene.add(light.target);
    return light;
  }

  addHemisphere(id, skyColor = 0x87ceeb, groundColor = 0x1a1a2e, intensity = 0.5) {
    const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    this.lights.set(id, light);
    this.scene.add(light);
    return light;
  }

  getLight(id) { return this.lights.get(id); }

  removeLight(id) {
    const light = this.lights.get(id);
    if (light) { this.scene.remove(light); light.dispose(); this.lights.delete(id); }
  }

  update() {
    const pulseSpeed = 0.8;
    for (const entry of this.dynamicLights) {
      const pulse = Math.sin(this.pulseTime * pulseSpeed + entry.phaseOffset);
      entry.light.intensity = entry.baseIntensity * (1 + pulse * 0.4);
    }
    const ambient = this.lights.get('ambient');
    if (ambient) ambient.intensity = 0.4 + Math.sin(this.pulseTime * 0.3) * 0.05;
  }

  dispose() {
    for (const [id, light] of this.lights) { this.scene.remove(light); light.dispose(); }
    this.lights.clear();
  }
}

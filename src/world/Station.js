/**
 * src/world/Station.js
 * 
 * Station that generates a level using StationBuilder and manages its lifecycle.
 * 
 * API:
 *   const station = new Station(scene, levelId, theme);
 *   station.build();
 *   station.update(dt);
 *   station.dispose();
 */
import * as THREE from 'three';
import { StationBuilder } from './StationBuilder.js';
import { THEMES } from '../config/theme.js';
import { LEVELS, getLevel, getLevelIndex } from '../config/levels.js';
import { StationManager } from './StationManager.js';

/**
 * @param {THREE.Scene} scene
 * @param {string} levelId
 * @param {string} theme
 */
export class Station {
  constructor(scene, levelId, theme) {
    this.scene = scene;
    this.levelId = levelId;
    this.theme = theme;
    this.builder = null;
    this.stationGroup = null;
    this.gate = null;
    this.width = 0;
    this.depth = 0;
    this.isBuilt = false;
    this.isDisposed = false;
  }

  build() {
    if (this.isBuilt || this.isDisposed) return;

    const level = getLevel(this.levelId);
    if (!level) {
      console.warn(`Level "${this.levelId}" not found`);
      return;
    }

    // Create builder
    this.builder = new StationBuilder(this.scene, this.theme);

    // Build the level
    const group = this.builder.build(level);
    this.stationGroup = group;
    this.width = level.width;
    this.depth = level.depth;
    this.isBuilt = true;

    // Build the gate at the end of the level
    this.gate = this.builder.buildGate(this.theme);

    this.scene.add(group);
    this.scene.add(this.gate);

    console.log(`[Station] Built level ${this.levelId} (${this.theme})`);
  }

  getBuilder() {
    return this.builder;
  }

  getGate() {
    return this.gate;
  }

  getLevel() {
    return getLevel(this.levelId);
  }

  update(dt) {
    if (!this.isBuilt) return;
    this.builder?.update(dt);
  }

  dispose() {
    if (this.isDisposed) return;
    this.isDisposed = true;

    if (this.builder) {
      this.builder.dispose(this.scene);
      this.builder = null;
    }

    if (this.stationGroup) {
      this.stationGroup.traverse((child) => {
        if (child.isMesh) child.geometry.dispose();
        if (child.isMaterial) child.material.dispose();
      });
      this.scene.remove(this.stationGroup);
      this.stationGroup = null;
    }

    if (this.gate) {
      this.gate.traverse((child) => {
        if (child.isMesh) child.geometry.dispose();
        if (child.isMaterial) child.material.dispose();
      });
      this.scene.remove(this.gate);
      this.gate = null;
    }

    console.log(`[Station] Disposed level ${this.levelId}`);
  }
}

export default Station;

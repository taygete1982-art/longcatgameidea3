/**
 * src/world/StationManager.js
 * 
 * Manager of stations across levels. Each level has a station that
 * spawns at the start and gates at the end. The player must pass
 * through the gate to advance to the next level.
 * 
 * API:
 *   const manager = new StationManager(scene, levelCount);
 *   manager.spawnStation(levelId, theme);
 *   manager.update(dt);
 */
import * as THREE from 'three';
import { Station } from './Station.js';
import { THEMES } from '../config/theme.js';
import { LEVELS } from '../config/levels.js';

export class StationManager {
  constructor(scene, levelCount) {
    this.scene = scene;
    this.levelCount = levelCount;
    this.stations = new Map(); // levelId -> Station
    this.currentStation = null;
    this.isFinished = false;
  }

  spawnStation(levelId, theme) {
    if (this.stations.has(levelId)) {
      this.stations.get(levelId).dispose();
    }
    this.stations.set(levelId, new Station(this.scene, levelId, theme));
    this.stations.get(levelId).build();
  }

  getCurrentStation() {
    if (!this.currentStation) {
      this.currentStation = this.stations.get(this.levelCount);
    }
    return this.currentStation;
  }

  getStation(levelId) {
    return this.stations.get(levelId);
  }

  getNextStationIndex() {
    const idx = this.stations.size - 1;
    return idx >= 0 ? idx : -1;
  }

  update(dt) {
    if (this.currentStation) {
      this.currentStation.update(dt);
    }
  }

  finish() {
    this.isFinished = true;
    console.log('[Game] Level complete!');
  }

  dispose() {
    for (const station of this.stations.values()) {
      station.dispose();
    }
    this.stations.clear();
    this.currentStation = null;
  }
}

export default StationManager;

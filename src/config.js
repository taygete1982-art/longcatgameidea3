/**
 * CONFIG.js — единый источник данных для игры «Харис».
 * Правило: каждая секция читается кодом. Мёртвых секций нет.
 */
import * as THREE from 'three';

export const CONFIG = {
  // Читает: LightManager.addDirectional (shadowMapSize).
  quality: {
    low: { pixelRatio: 1, shadowMapSize: 512, shadowType: THREE.BasicShadowMap },
    medium: { pixelRatio: 1.5, shadowMapSize: 1024, shadowType: THREE.PCFShadowMap },
    high: { pixelRatio: 2, shadowMapSize: 2048, shadowType: THREE.PCFSoftShadowMap },
  },

  // Читает: SceneManager.createRenderer.
  render: {
    clearColor: 0x0a0a1a,
  },

  // Читает: LightManager.addDirectional.
  shadows: {
    bias: -0.0001,
    normalBias: 0.02,
    radius: 1,
    cameraNear: 0.5,
    cameraFar: 100,
    cameraSize: 30,
  },

  // Читает: Game (scene.fog).
  fog: {
    type: 'exponential2',
    color: 0x0a0a1a,
    density: 0.008,
  },

  // Читает: Game (UnrealBloomPass — светится только яркий неон).
  post: {
    bloomStrength: 0.55,
    bloomRadius: 0.4,
    bloomThreshold: 0.85,
  },

  // Читает: StationBuilder.
  arena: { width: 40, depth: 40, wallHeight: 6 },

  // Читает: Player (скорость, радиус прокси, HP, неуязвимость).
  player: { speed: 8, radius: 0.5, hp: 3, invuln: 1 },

  // Читает: Projectiles + Game (темп, скорость, дальность, пул).
  combat: { fireRate: 3, projectileSpeed: 22, range: 30, pool: 32, enemyBoltSpeed: 14, enemyBoltPool: 48 },

  // Читает: FollowCamera (высота, отступ, упреждение, сглаживание).
  camera: { height: 18, back: 11, lookAhead: 4, smooth: 5 },

  // Читает: Enemy (HP, скорость, урон, дистанция). Урон: melee/bolt в единицах HP.
  enemies: {
    runner: { hp: 1, speed: 6, damage: 1, meleeRange: 1.2 },
    shooter: { hp: 2, speed: 2.5, damage: 1, fireInterval: 2.2 },
    tank: { hp: 6, speed: 1.5, damage: 2, meleeRange: 1.6, explodeRadius: 3 },
    miniboss: { hp: 12, speed: 4, damage: 2, meleeRange: 1.8 },
  },

  // Читает: Waves (передышка, интервал спавна).
  waves: { breakTime: 8, spawnInterval: 1.2, waveCount: 6 },

  // Читает: Base (HP, радиус, позиция на юге).
  base: { hp: 10, radius: 2, pos: { x: 0, z: 17 } },

  // Читает: Gates (трое ворот в северной стене).
  gates: { xs: [-12, 0, 12], z: -19 },

  // Читает: Game.wireLights.
  lights: {
    ambient: { color: 0x334466, intensity: 0.7 },
    hemisphere: { skyColor: 0x446688, groundColor: 0x222244, intensity: 0.6 },
    directional: {
      color: 0xffffff,
      intensity: 0.8,
      position: { x: 10, y: 20, z: 10 },
    },
    pointLights: [
      { id: 'pulse_blue_1', color: 0x00aaff, intensity: 1.5, position: { x: -15, y: 4, z: -15 }, pulse: true },
      { id: 'pulse_blue_2', color: 0x00aaff, intensity: 1.5, position: { x: 15, y: 4, z: 15 }, pulse: true },
      { id: 'pulse_red_1', color: 0xff3344, intensity: 1.2, position: { x: -15, y: 4, z: 15 }, pulse: true },
      { id: 'pulse_red_2', color: 0xff3344, intensity: 1.2, position: { x: 15, y: 4, z: -15 }, pulse: true },
    ],
  },

  // Читает: Game (debug-хелперы).
  debug: {
    showFPS: true,
    showFrameTimeGraph: false,
    showGrid: false,
    gridSize: 40,
    gridDivisions: 40,
    showAxes: false,
    axesSize: 5,
    showShadowCamera: false,
    showDrawCallReport: false,
    showMemoryReport: false,
  },

  // Читает: Game (state).
  GameState: Object.freeze({
    BOOT: 'boot',
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'game_over',
    VICTORY: 'victory',
  }),
};

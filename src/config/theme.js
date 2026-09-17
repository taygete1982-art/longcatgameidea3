/**
 * src/config/theme.js
 * 
 * Палитры и материалы для шумерской темы.
 * 3 темы: GLAC (глина), OBS (обсидиан), CRYSTAL (кристалл)
 * 
 * Каждая тема включает:
 *  - палитру цветов (пол, стена, потолок, контейнер, колонна, опасность)
 *  - материалы для стен, пола, потолка
 *  - материалы для неоновых подсветок
 *  - материалы для глаз врагов
 *  - материалы для стрел (дерево, перо, флетч, наконечник, след)
 */
import * as THREE from 'three';

// Палитра Glin (глина)
const PALETTE_GLAC = {
  sand:    { r: 210, g: 168, b: 120, a: 1 },  // песочный
  straw:   { r: 122, g: 138, b: 58, a: 1 },   // соломенный
  clay:    { r: 160, g: 82,  b: 141, a: 1 },  // глиняный
  lapis:   { r: 30,  g: 96,  b: 145, a: 1 },  // лазуритовый
  brick:   { r: 160, g: 82,  b: 141, a: 1 },  // кирпичный
  sandDark:{ r: 139, g: 112, b: 90,  a: 1 },  // тёмный песок
  strawLight:{ r: 198, g: 198, b: 152, a: 1 }, // светлый соломенный
  highlight:{ r: 255, g: 218, b: 185, a: 1 }, // выделение
  shadow:  { r: 99,  g: 71,  b: 53,   a: 1 },  // тень
};

// Палитра Obs (обсидиан)
const PALETTE_OBS = {
  obsidian:    { r: 26,  g: 26,  b: 46,  a: 1 },  // обсидиан
  obsidianLight: { r: 45, g: 45, b: 70, a: 1 },  // светлый обсидиан
  obsidianDark: { r: 15,  g: 15,  b: 28,  a: 1 },  // тёмный обсидиан
  obsidianDeep: { r: 8,   g: 8,   b: 15,   a: 1 },  // глубокий обсидиан
  gold:        { r: 212, g: 168, b: 67,  a: 1 },  // золото
  goldLight:   { r: 255, g: 217, b: 149, a: 1 },  // светлое золото
  goldDark:    { r: 139, g: 90,  b: 43,   a: 1 },  // тёмное золото
  lapis:       { r: 30,  g: 96,  b: 145, a: 1 },  // лазурит
  lapisDark:   { r: 15,  g: 50,  b: 90,   a: 1 },  // тёмный лазурит
  stone:       { r: 100, g: 100, b: 120, a: 1 },  // камень
  stoneLight:  { r: 160, g: 160, b: 192, a: 1 },  // светлый камень
  stoneDark:   { r: 60,  g: 60,  b: 80,   a: 1 },  // тёмный камень
  highlight:   { r: 255, g: 217, b: 149, a: 1 },  // выделение
  shadow:      { r: 5,   g: 5,   b: 10,   a: 1 },  // тень
};

// Палитра Crystal (кристалл)
const PALETTE_CRYSTAL = {
  obsidian:    { r: 26,  g: 26,  b: 46,  a: 1 },  // обсидиан
  obsidianLight: { r: 45, g: 45, b: 70, a: 1 },  // светлый обсидиан
  obsidianDark: { r: 15,  g: 15,  b: 28,  a: 1 },  // тёмный обсидиан
  obsidianDeep: { r: 8,   g: 8,   b: 15,   a: 1 },  // глубокий обсидиан
  blue:        { r: 10,  g: 30,  b: 80,   a: 1 },  // синий
  blueLight:   { r: 30,  g: 70,  b: 150, a: 1 },  // светлый синий
  blueDark:    { r: 5,   g: 15,  b: 40,   a: 1 },  // тёмный синий
  orange:      { r: 255, g: 106, b: 42,   a: 1 },  // оранжевый
  orangeLight: { r: 255, g: 165, b: 26,  a: 1 },  // светлый оранжевый
  orangeDark:  { r: 160, g: 82,  b: 45,   a: 1 },  // тёмный оранжевый
  stone:       { r: 100, g: 100, b: 120, a: 1 },  // камень
  stoneLight:  { r: 160, g: 160, b: 192, a: 1 },  // светлый камень
  stoneDark:   { r: 60,  g: 60,  b: 80,   a: 1 },  // тёмный камень
  highlight:   { r: 255, g: 217, b: 149, a: 1 },  // выделение
  shadow:      { r: 0,   g: 0,   b: 5,    a: 1 },  // тень
};

// Базовые цвета стен/пола/потолка
const BASE_COLORS = {
  GLAC:   { floor: 0xd4b483, wall: 0xb5a642, ceiling: 0x1e6091 },
  OBS:    { floor: 0x1a1a2e, wall: 0x2d2d44, ceiling: 0x1a1a2e },
  CRYSTAL: { floor: 0x0a0a1a, wall: 0x1a1a2e, ceiling: 0x0a1a3a },
};

// Цвета неоновых подсветок
const NEON_COLORS = {
  GLAC:   { cyan: 0x00aaff, red: 0xff3344 },
  OBS:    { cyan: 0x0077aa, red: 0xff5566 },
  CRYSTAL: { cyan: 0x0055aa, red: 0xff3366 },
};

// Материалы для стен
const WALL_MATERIALS = {
  GLAC: new THREE.MeshStandardMaterial({ color: 0xb5a642, roughness: 0.8, metalness: 0.0 }),
  OBS:  new THREE.MeshStandardMaterial({ color: 0x2d2d44, roughness: 0.7, metalness: 0.3 }),
  CRYSTAL: new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.6, metalness: 0.3 }),
};

// Материалы для пола
const FLOOR_MATERIALS = {
  GLAC: new THREE.MeshStandardMaterial({ color: 0xd4b483, roughness: 0.95, metalness: 0.0 }),
  OBS:  new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.9, metalness: 0.0 }),
  CRYSTAL: new THREE.MeshStandardMaterial({ color: 0x0a0a1a, roughness: 0.9, metalness: 0.0 }),
};

// Материалы для потолка
const CEILING_MATERIALS = {
  GLAC: new THREE.MeshStandardMaterial({ color: 0x1e6091, roughness: 0.7, metalness: 0.1 }),
  OBS:  new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.6, metalness: 0.2 }),
  CRYSTAL: new THREE.MeshStandardMaterial({ color: 0x0a1a3a, roughness: 0.5, metalness: 0.4 }),
};

// Материалы для контейнеров
const CONTAINER_MATERIALS = {
  GLAC: new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.6, metalness: 0.0 }),
  OBS:  new THREE.MeshStandardMaterial({ color: 0x3a3a5a, roughness: 0.5, metalness: 0.3 }),
  CRYSTAL: new THREE.MeshStandardMaterial({ color: 0x3a4a6a, roughness: 0.4, metalness: 0.4 }),
};

// Материалы для колонн
const PILLAR_MATERIALS = {
  GLAC: new THREE.MeshStandardMaterial({ color: 0x5a6070, roughness: 0.5, metalness: 0.3 }),
  OBS:  new THREE.MeshStandardMaterial({ color: 0x4a4a6a, roughness: 0.5, metalness: 0.4 }),
  CRYSTAL: new THREE.MeshStandardMaterial({ color: 0x2a2a4a, roughness: 0.4, metalness: 0.5 }),
};

// Материалы для опасности (hazard)
const HAZARD_MATERIALS = {
  GLAC: new THREE.MeshStandardMaterial({ color: 0xffcc00, roughness: 0.7, metalness: 0.0 }),
  OBS:  new THREE.MeshStandardMaterial({ color: 0x8b3a1a, roughness: 0.7, metalness: 0.0 }),
  CRYSTAL: new THREE.MeshStandardMaterial({ color: 0xff3366, roughness: 0.5, metalness: 0.2 }),
};

// Материалы для неоновых свечений
const NEON_MATERIALS = {
  GLAC: {
    cyan: new THREE.MeshBasicMaterial({ color: 0x00aaff }),
    red: new THREE.MeshBasicMaterial({ color: 0xff3344 }),
  },
  OBS: {
    cyan: new THREE.MeshBasicMaterial({ color: 0x0077aa }),
    red: new THREE.MeshBasicMaterial({ color: 0xff5566 }),
  },
  CRYSTAL: {
    cyan: new THREE.MeshBasicMaterial({ color: 0x0055aa }),
    red: new THREE.MeshBasicMaterial({ color: 0xff3366 }),
  },
};

// Материалы для глаз врагов
const EYE_MATERIALS = {
  GLAC: {
    stone: new THREE.MeshStandardMaterial({ color: 0x2a2a3a, roughness: 0.7, metalness: 0.0 }),
    gold: new THREE.MeshStandardMaterial({ color: 0xb8860b, roughness: 0.3, metalness: 0.4 }),
    red: new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 0.8, roughness: 0.2 }),
  },
  OBS: {
    stone: new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.6, metalness: 0.4 }),
    gold: new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.2, metalness: 0.7 }),
    red: new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 0.9, roughness: 0.2 }),
  },
  CRYSTAL: {
    stone: new THREE.MeshStandardMaterial({ color: 0x0a1a3a, roughness: 0.5, metalness: 0.3 }),
    gold: new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.2, metalness: 0.8 }),
    red: new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 0.9, roughness: 0.2 }),
  },
};

// Материалы для стрел (схемы)
const ARROW_MATERIALS = {
  GLAC: {
    wood: new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.8, metalness: 0.0 }),
    feather: new THREE.MeshStandardMaterial({ color: 0x7a8a3a, roughness: 0.7, metalness: 0.0 }),
    fletch: new THREE.MeshStandardMaterial({ color: 0x0077aa, roughness: 0.6, metalness: 0.1 }),
    head: new THREE.MeshStandardMaterial({ color: 0x4a3a2a, roughness: 0.5, metalness: 0.1 }),
    trail: new THREE.MeshBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0.5 }),
  },
  OBS: {
    wood: new THREE.MeshStandardMaterial({ color: 0x4a3a2a, roughness: 0.8, metalness: 0.0 }),
    feather: new THREE.MeshStandardMaterial({ color: 0x0077aa, roughness: 0.6, metalness: 0.1 }),
    fletch: new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.7, metalness: 0.0 }),
    head: new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.3, metalness: 0.6 }),
    trail: new THREE.MeshBasicMaterial({ color: 0x8b3a1a, transparent: true, opacity: 0.5 }),
  },
  CRYSTAL: {
    wood: new THREE.MeshStandardMaterial({ color: 0x3a2a2a, roughness: 0.8, metalness: 0.0 }),
    feather: new THREE.MeshStandardMaterial({ color: 0x0055aa, roughness: 0.6, metalness: 0.1 }),
    fletch: new THREE.MeshStandardMaterial({ color: 0xff3366, roughness: 0.5, metalness: 0.2 }),
    head: new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.2, metalness: 0.8 }),
    trail: new THREE.MeshBasicMaterial({ color: 0xaa3366, transparent: true, opacity: 0.5 }),
  },
};

// Объект THEMES — ключевой для StationBuilder
export const THEMES = {
  GLAC: {
    name: 'Glac',
    palette: PALETTE_GLAC,
    wallMat: WALL_MATERIALS.GLAC,
    floorMat: FLOOR_MATERIALS.GLAC,
    ceilingMat: CEILING_MATERIALS.GLAC,
    containerMat: CONTAINER_MATERIALS.GLAC,
    pillarMat: PILLAR_MATERIALS.GLAC,
    hazardMat: HAZARD_MATERIALS.GLAC,
    neonCyan: NEON_MATERIALS.GLAC.cyan,
    neonRed: NEON_MATERIALS.GLAC.red,
    eyeStone: EYE_MATERIALS.GLAC.stone,
    eyeGold: EYE_MATERIALS.GLAC.gold,
    eyeRed: EYE_MATERIALS.GLAC.red,
    arrowWood: ARROW_MATERIALS.GLAC.wood,
    arrowFeather: ARROW_MATERIALS.GLAC.feather,
    arrowFletch: ARROW_MATERIALS.GLAC.fletch,
    arrowHead: ARROW_MATERIALS.GLAC.head,
    arrowTrail: ARROW_MATERIALS.GLAC.trail,
  },
  OBS: {
    name: 'Obs',
    palette: PALETTE_OBS,
    wallMat: WALL_MATERIALS.OBS,
    floorMat: FLOOR_MATERIALS.OBS,
    ceilingMat: CEILING_MATERIALS.OBS,
    containerMat: CONTAINER_MATERIALS.OBS,
    pillarMat: PILLAR_MATERIALS.OBS,
    hazardMat: HAZARD_MATERIALS.OBS,
    neonCyan: NEON_MATERIALS.OBS.cyan,
    neonRed: NEON_MATERIALS.OBS.red,
    eyeStone: EYE_MATERIALS.OBS.stone,
    eyeGold: EYE_MATERIALS.OBS.gold,
    eyeRed: EYE_MATERIALS.OBS.red,
    arrowWood: ARROW_MATERIALS.OBS.wood,
    arrowFeather: ARROW_MATERIALS.OBS.feather,
    arrowFletch: ARROW_MATERIALS.OBS.fletch,
    arrowHead: ARROW_MATERIALS.OBS.head,
    arrowTrail: ARROW_MATERIALS.OBS.trail,
  },
  CRYSTAL: {
    name: 'Crystal',
    palette: PALETTE_CRYSTAL,
    wallMat: WALL_MATERIALS.CRYSTAL,
    floorMat: FLOOR_MATERIALS.CRYSTAL,
    ceilingMat: CEILING_MATERIALS.CRYSTAL,
    containerMat: CONTAINER_MATERIALS.CRYSTAL,
    pillarMat: PILLAR_MATERIALS.CRYSTAL,
    hazardMat: HAZARD_MATERIALS.CRYSTAL,
    neonCyan: NEON_MATERIALS.CRYSTAL.cyan,
    neonRed: NEON_MATERIALS.CRYSTAL.red,
    eyeStone: EYE_MATERIALS.CRYSTAL.stone,
    eyeGold: EYE_MATERIALS.CRYSTAL.gold,
    eyeRed: EYE_MATERIALS.CRYSTAL.red,
    arrowWood: ARROW_MATERIALS.CRYSTAL.wood,
    arrowFeather: ARROW_MATERIALS.CRYSTAL.feather,
    arrowFletch: ARROW_MATERIALS.CRYSTAL.fletch,
    arrowHead: ARROW_MATERIALS.CRYSTAL.head,
    arrowTrail: ARROW_MATERIALS.CRYSTAL.trail,
  },
};

// Хелпер: получить палитру по имени темы
export function getPalette(themeName) {
  const t = THEMES[themeName];
  if (!t) throw new Error(`Unknown theme: ${themeName}`);
  return t.palette;
}

// Хелпер: получить материал стены по теме
export function getWallMaterial(themeName) {
  const t = THEMES[themeName];
  if (!t) throw new Error(`Unknown theme: ${themeName}`);
  return t.wallMat;
}

// Хелпер: получить материал пола по теме
export function getFloorMaterial(themeName) {
  const t = THEMES[themeName];
  if (!t) throw new Error(`Unknown theme: ${themeName}`);
  return t.floorMat;
}

// Хелпер: получить материал глаза по типу врага и теме
export function getEyeMaterial(themeName, eyeType) {
  const t = THEMES[themeName];
  if (!t) throw new Error(`Unknown theme: ${themeName}`);
  switch (eyeType) {
    case 'gold': return t.eyeGold;
    case 'red': return t.eyeRed;
    default: return t.eyeStone;
  }
}

// Хелпер: получить материал стрелы по типу и теме
export function getArrowMaterial(themeName, type) {
  const t = THEMES[themeName];
  if (!t) throw new Error(`Unknown theme: ${themeName}`);
  switch (type) {
    case 'feather': return t.arrowFeather;
    case 'fletch': return t.arrowFletch;
    case 'head': return t.arrowHead;
    case 'trail': return t.arrowTrail;
    default: return t.arrowWood;
  }
}

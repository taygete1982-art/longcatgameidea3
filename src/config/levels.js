/**
 * src/config/levels.js
 * 
 * 20 уровней: 3 акта по 7, 7, 6 уровней.
 * Каждый уровень: сид + массив модификаторов.
 * 
 * Модификаторы:
 *  - 'speed': +20% скорости врага
 *  - 'health': +50% HP врагов и базы
 *  - 'dmg': +25% урона врагов
 *  - 'fog': туман (reducePlayerHpPerSec, reduceEnemyHpPerSec)
 *  - 'darkness': темнота (reduceEnemyVision, reducePlayerVision)
 *  - 'extraGates': +1 ворота
 *  - 'doubleSpawn': спавн врагов на 2 уровнях подряд
 *
 * Враги (index): 0=беженец, 1=бандит, 2=пехота, 3=штурмовик, 4=танк, 5=гусеница
 * Босс: index -1
 */

const mulberry32 = (seed) => {
  return function () {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const TYPES = [0, 0, 1, 2, 3, 4, 5]; // беженец, бандит, пехота, штурмовик, танк, гусеница
const BOSS_TYPES = [0, 1, 2, 3, 4, 5]; // босс — один из 6 типов

const LEVELS = [
  {
    id: 1,
    theme: "Glac",
    seed: 0x1A2B3C4D,
    gates: [0, 3], // ворота: 0=сверху, 1=ниже, 2=слева, 3=справа
    waves: [
      { enemies: [0, 0, 0, 0, 0], wave: 1 },
      { enemies: [0, 0, 0, 1, 0], wave: 2 },
      { enemies: [0, 0, 0, 1, 1], wave: 3 },
      { enemies: [0, 0, 0, 1, 1, 1], wave: 4 },
      { enemies: [0, 0, 0, 1, 1, 2], wave: 5 },
      { enemies: [0, 0, 0, 1, 1, 2, 2], wave: 6 },
    ],
    modifiers: [],
  },
  {
    id: 2,
    theme: "Glac",
    seed: 0x2B3C4D5E,
    gates: [0, 3],
    waves: [
      { enemies: [0, 0, 0, 0, 0, 0], wave: 1 },
      { enemies: [0, 0, 0, 0, 0, 1], wave: 2 },
      { enemies: [0, 0, 0, 0, 0, 1, 1], wave: 3 },
      { enemies: [0, 0, 0, 0, 0, 1, 1, 1], wave: 4 },
      { enemies: [0, 0, 0, 0, 0, 1, 1, 1, 1], wave: 5 },
      { enemies: [0, 0, 0, 0, 1, 1, 1, 1, 1], wave: 6 },
    ],
    modifiers: [],
  },
  {
    id: 3,
    theme: "Glac",
    seed: 0x3C4D5E6F,
    gates: [0, 1, 2],
    waves: [
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0], wave: 1 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 1], wave: 2 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 1, 1], wave: 3 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 1, 1, 1], wave: 4 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1], wave: 5 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1], wave: 6 },
    ],
    modifiers: [],
  },
  {
    id: 4,
    theme: "Obs",
    seed: 0x4D5E6F7A,
    gates: [0, 3],
    waves: [
      { enemies: [0, 0, 0, 0, 0, 0], wave: 1 },
      { enemies: [0, 0, 0, 0, 0, 1], wave: 2 },
      { enemies: [0, 0, 0, 0, 0, 1, 1], wave: 3 },
      { enemies: [0, 0, 0, 0, 0, 1, 1, 1], wave: 4 },
      { enemies: [0, 0, 0, 0, 0, 1, 1, 1, 1], wave: 5 },
      { enemies: [0, 0, 0, 0, 0, 1, 1, 1, 1, 1], wave: 6 },
    ],
    modifiers: [],
  },
  {
    id: 5,
    theme: "Obs",
    seed: 0x5E6F7A8B,
    gates: [0, 1],
    waves: [
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0], wave: 1 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 1], wave: 2 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 1, 1], wave: 3 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 1, 1, 1], wave: 4 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1], wave: 5 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1], wave: 6 },
    ],
    modifiers: [],
  },
  {
    id: 6,
    theme: "Obs",
    seed: 0x6F7A8B9C,
    gates: [0, 2, 3],
    waves: [
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 0], wave: 1 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 1], wave: 2 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 1, 1], wave: 3 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1], wave: 4 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1], wave: 5 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1], wave: 6 },
    ],
    modifiers: [],
  },
  {
    id: 7,
    theme: "Obs",
    seed: 0x7A8B9CAD,
    gates: [0, 1, 2],
    waves: [
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], wave: 1 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1], wave: 2 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1], wave: 3 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1], wave: 4 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1], wave: 5 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1], wave: 6 },
    ],
    modifiers: [],
  },
  {
    id: 8,
    theme: "CRYSTAL",
    seed: 0x8B9CADBE,
    gates: [0, 3],
    waves: [
      { enemies: [0, 0, 0, 0, 0, 0], wave: 1 },
      { enemies: [0, 0, 0, 0, 0, 1], wave: 2 },
      { enemies: [0, 0, 0, 0, 0, 1, 1], wave: 3 },
      { enemies: [0, 0, 0, 0, 0, 1, 1, 1], wave: 4 },
      { enemies: [0, 0, 0, 0, 0, 1, 1, 1, 1], wave: 5 },
      { enemies: [0, 0, 0, 0, 0, 1, 1, 1, 1, 1], wave: 6 },
    ],
    modifiers: [],
  },
  {
    id: 9,
    theme: "CRYSTAL",
    seed: 0x9CADBEDF,
    gates: [0, 1],
    waves: [
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0], wave: 1 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 1], wave: 2 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 1, 1], wave: 3 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 1, 1, 1], wave: 4 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1], wave: 5 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1], wave: 6 },
    ],
    modifiers: [],
  },
  {
    id: 10,
    theme: "CRYSTAL",
    seed: 0xACBDEDEF,
    gates: [0, 2, 3],
    waves: [
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], wave: 1 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1], wave: 2 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1], wave: 3 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1], wave: 4 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1], wave: 5 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1], wave: 6 },
    ],
    modifiers: [],
  },
  {
    id: 11,
    theme: "Glac",
    seed: 0xBDECDFE0,
    gates: [0, 1, 2],
    waves: [
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], wave: 1 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], wave: 2 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1], wave: 3 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1], wave: 4 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1], wave: 5 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1], wave: 6 },
    ],
    modifiers: [],
  },
  {
    id: 12,
    theme: "Obs",
    seed: 0xCDFE0101,
    gates: [0, 2, 3],
    waves: [
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], wave: 1 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], wave: 2 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1], wave: 3 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1], wave: 4 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1], wave: 5 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1], wave: 6 },
    ],
    modifiers: [],
  },
  {
    id: 13,
    theme: "CRYSTAL",
    seed: 0xDF010203,
    gates: [0, 1, 2, 3],
    waves: [
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], wave: 1 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], wave: 2 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1], wave: 3 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1], wave: 4 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1], wave: 5 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1], wave: 6 },
    ],
    modifiers: [],
  },
  {
    id: 14,
    theme: "Obs",
    seed: 0x01020304,
    gates: [0, 1],
    waves: [
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], wave: 1 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], wave: 2 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1], wave: 3 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1], wave: 4 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1], wave: 5 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1], wave: 6 },
    ],
    modifiers: [],
  },
  {
    id: 15,
    theme: "Glac",
    seed: 0x01020305,
    gates: [0, 2, 3],
    waves: [
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], wave: 1 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], wave: 2 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1], wave: 3 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1], wave: 4 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1], wave: 5 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1], wave: 6 },
    ],
    modifiers: [],
  },
  {
    id: 16,
    theme: "CRYSTAL",
    seed: 0x01020306,
    gates: [0, 1, 2],
    waves: [
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], wave: 1 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], wave: 2 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1], wave: 3 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1], wave: 4 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1], wave: 5 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1], wave: 6 },
    ],
    modifiers: [],
  },
  {
    id: 17,
    theme: "Glac",
    seed: 0x01020307,
    gates: [0, 3],
    waves: [
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], wave: 1 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], wave: 2 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1], wave: 3 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1], wave: 4 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1], wave: 5 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1], wave: 6 },
    ],
    modifiers: [],
  },
  {
    id: 18,
    theme: "Obs",
    seed: 0x01020308,
    gates: [0, 1, 2, 3],
    waves: [
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], wave: 1 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], wave: 2 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1], wave: 3 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1], wave: 4 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1], wave: 5 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1], wave: 6 },
    ],
    modifiers: [],
  },
  {
    id: 19,
    theme: "CRYSTAL",
    seed: 0x01020309,
    gates: [0, 1, 2, 3],
    waves: [
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], wave: 1 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], wave: 2 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1], wave: 3 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1], wave: 4 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1], wave: 5 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1], wave: 6 },
    ],
    modifiers: [],
  },
  {
    id: 20,
    theme: "Glac",
    seed: 0x0102030A,
    gates: [0, 1, 2, 3],
    waves: [
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], wave: 1 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], wave: 2 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1], wave: 3 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1], wave: 4 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1], wave: 5 },
      { enemies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1], wave: 6 },
    ],
    modifiers: [],
  },
];

export default LEVELS;

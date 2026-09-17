/**
 * src/systems/EnemyTypes.js
 * 
 * Enemy type definitions for the ancient battlefield.
 * No firearms, no explosives — pure ancient warfare.
 * 
 * Types:
 *  - Parchment: paper scribe, slow but persistent
 *  - Golem: stone mason, tanky
 *  - Shed: beast of burden, fast but weak
 *  - Archer: ranged attacker (bow & arrow)
 *  - Scribes: fast paper warriors
 *  - MiniBoss: mini-boss variants (golem, shed)
 *  - Boss: major arena bosses (golem, shed)
 */
import { THEMES } from '../config/theme.js';

/**
 * @typedef {Object} EnemyDef
 * @property {string} id
 * @property {string} name
 * @property {string} theme
 * @property {number} hp
 * @property {number} damage
 * @property {number} speed
 * @property {number} radius
 * @property {string[]} tags
 * @property {boolean} isMiniBoss
 * @property {boolean} isBoss
 */

/**
 * @param {string} theme
 * @returns {Array<{id: string, name: string, theme: string, hp: number, damage: number, speed: number, radius: number, tags: string[], isMiniBoss: boolean, isBoss: boolean, color: number, hpColor: number, texture: any}>}
 */
export function createEnemyTypes(theme) {
  const materials = THEMES[theme];

  // PARCHMENT — slow, persistent, paper warrior
  const parchmentDef = {
    id: 'parchment',
    name: 'Скрипач',
    theme,
    hp: 40,
    damage: 3,
    speed: 1.5,
    radius: 0.35,
    tags: ['melee'],
    isMiniBoss: false,
    isBoss: false,
    color: 0x8B4513,
    hpColor: 0x8B4513,
    texture: materials.parchment,
  };

  // GOLEM — slow, tanky, stone
  const golemDef = {
    id: 'golem',
    name: 'Каменный гном',
    theme,
    hp: 150,
    damage: 8,
    speed: 1.0,
    radius: 0.5,
    tags: ['tank'],
    isMiniBoss: false,
    isBoss: false,
    color: 0x808080,
    hpColor: 0x808080,
    texture: materials.golem,
  };

  // SHED — fast, agile, beast of burden
  const shedDef = {
    id: 'shed',
    name: 'Олень-поселенец',
    theme,
    hp: 35,
    damage: 4,
    speed: 2.8,
    radius: 0.32,
    tags: ['fast'],
    isMiniBoss: false,
    isBoss: false,
    color: 0x2F4F4F,
    hpColor: 0x2F4F4F,
    texture: materials.shed,
  };

  // ARCHER — ranged attacker, uses bow & arrow
  const archerDef = {
    id: 'archer',
    name: 'Архер',
    theme,
    hp: 45,
    damage: 6,
    speed: 2.2,
    radius: 0.3,
    tags: ['ranged'],
    isMiniBoss: false,
    isBoss: false,
    color: 0x228B22,
    hpColor: 0x228B22,
    texture: materials.archer,
  };

  // SCRIBES — fast paper warriors, multiple of parchment
  const scribesDef = {
    id: 'scribes',
    name: 'Скрипачи',
    theme,
    hp: 25,
    damage: 2,
    speed: 2.0,
    radius: 0.32,
    tags: ['fast', 'group'],
    isMiniBoss: false,
    isBoss: false,
    color: 0xD2B48C,
    hpColor: 0xD2B48C,
    texture: materials.scribes,
  };

  // MINI-BOSS GOLEM
  const miniGolemDef = {
    id: 'mini_golem',
    name: 'Гном-хранитель',
    theme,
    hp: 120,
    damage: 7,
    speed: 0.9,
    radius: 0.45,
    tags: ['tank', 'miniBoss'],
    isMiniBoss: true,
    isBoss: false,
    color: 0x5A5A5A,
    hpColor: 0x5A5A5A,
    texture: materials.golem,
  };

  // MINI-BOSS SHED
  const miniShedDef = {
    id: 'mini_shed',
    name: 'Лесной страж',
    theme,
    hp: 70,
    damage: 5,
    speed: 2.5,
    radius: 0.35,
    tags: ['fast', 'miniBoss'],
    isMiniBoss: true,
    isBoss: false,
    color: 0x1A331A,
    hpColor: 0x1A331A,
    texture: materials.shed,
  };

  // BOSS GOLEM
  const bossGolemDef = {
    id: 'boss_golem',
    name: 'Голова-гигант',
    theme,
    hp: 400,
    damage: 12,
    speed: 0.7,
    radius: 0.8,
    tags: ['tank', 'boss'],
    isMiniBoss: false,
    isBoss: true,
    color: 0x2F4F4F,
    hpColor: 0x2F4F4F,
    texture: materials.bossGolem,
  };

  // BOSS SHED
  const bossShedDef = {
    id: 'boss_shed',
    name: 'Король зверей',
    theme,
    hp: 300,
    damage: 10,
    speed: 3.2,
    radius: 0.4,
    tags: ['fast', 'boss'],
    isMiniBoss: false,
    isBoss: true,
    color: 0x1A1A2E,
    hpColor: 0x1A1A2E,
    texture: materials.bossShed,
  };

  return [
    parchmentDef,
    golemDef,
    shedDef,
    archerDef,
    scribesDef,
    miniGolemDef,
    miniShedDef,
    bossGolemDef,
    bossShedDef,
  ];
}

export default {
  parchmentDef,
  golemDef,
  shedDef,
  archerDef,
  scribesDef,
  miniGolemDef,
  miniShedDef,
  bossGolemDef,
  bossShedDef,
};

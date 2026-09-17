/**
 * Waves — 5 волн по docs/idea.md, дальше endless со скейлом.
 * Состояния: break (передышка + баннер) → spawning → fighting.
 * Спавн по краям арены. Детерминированный состав, случайные точки.
 */
import { CONFIG } from '../config.js';

// Базовые определения волн (fallback, если levelWaves не передан)
const WAVE_DEFS = [
  { runner: 4, shooter: 0, tank: 0, miniboss: 0 },
  { runner: 6, shooter: 2, tank: 0, miniboss: 0 },
  { runner: 6, shooter: 3, tank: 1, miniboss: 1 },
  { runner: 8, shooter: 4, tank: 2, miniboss: 0 },
  { runner: 10, shooter: 5, tank: 3, miniboss: 1 },
  { runner: 12, shooter: 6, tank: 3, miniboss: 1 },
];

const DEFAULT_WAVE_COUNT = 6;

export class Waves {
  constructor(container, spawner, waveCount = DEFAULT_WAVE_COUNT) {
    this.spawner = spawner;
    this.wave = 0;
    this.state = 'break';
    this.timer = 3; // первая передышка короче
    this.waveCount = waveCount;
    this.queue = [];
    this.spawnTimer = 0;
    this.bannerEl = document.createElement('div');
    this.bannerEl.style.cssText = 'position:absolute;top:18%;left:0;right:0;text-align:center;font:bold 42px system-ui;color:#fff;text-shadow:0 0 18px #00aaff;display:none;pointer-events:none;z-index:6;';
    container.appendChild(this.bannerEl);
    this.bannerTimer = 0;
  }

  defFor(n) {
    if (n <= WAVE_DEFS.length) return WAVE_DEFS[n - 1];
    // Endless: масштаб от 5-й.
    const base = WAVE_DEFS[WAVE_DEFS.length - 1];
    const k = n - WAVE_DEFS.length + 1;
    return {
      runner: base.runner + k * 2,
      shooter: base.shooter + k,
      tank: base.tank + k,
      miniboss: 1 + (k % 2),
    };
  }

  startWave(n) {
    this.wave = n;
    const def = this.defFor(n);
    this.queue = [];
    for (const [type, count] of Object.entries(def)) {
      for (let i = 0; i < count; i++) this.queue.push(type);
    }
    // Перемешать очередь (Fisher-Yates).
    for (let i = this.queue.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [this.queue[i], this.queue[j]] = [this.queue[j], this.queue[i]];
    }
    this.state = 'spawning';
    this.spawnTimer = 0;
    this.showBanner(n <= DEFAULT_WAVE_COUNT ? `ВОЛНА ${n}` : `ВОЛНА ${n} — ENDLESS`);
  }

  showBanner(text) {
    this.bannerEl.textContent = text;
    this.bannerEl.style.display = 'block';
    this.bannerTimer = 2.5;
  }

  /** enemies: Enemies. Возвращает 'fighting' | 'break' | 'spawning'. */
  update(dt, enemies) {
    if (this.bannerTimer > 0) {
      this.bannerTimer -= dt;
      if (this.bannerTimer <= 0) this.bannerEl.style.display = 'none';
    }
    if (this.state === 'break') {
      this.timer -= dt;
      if (this.timer <= 0) this.startWave(this.wave + 1);
    } else if (this.state === 'spawning') {
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0 && this.queue.length > 0) {
        this.spawnTimer = CONFIG.waves.spawnInterval;
        const type = this.queue.shift();
        if (!enemies.spawn(type, this.spawner())) {
          // Пул полон — вернуть в очередь, попробовать позже.
          this.queue.unshift(type);
          this.spawnTimer = 0.5;
        }
      }
      if (this.queue.length === 0) this.state = 'fighting';
    } else if (this.state === 'fighting') {
      if (enemies.aliveCount() === 0) {
        this.state = 'break';
        this.timer = CONFIG.waves.breakTime;
        this.showBanner('ВОЛНА ЗАЧИЩЕНА');
      }
    }
    return this.state;
  }

  /** Рестарт текущей волны (после смерти): убрать всех, начать заново с передышки. */
  resetWave(enemies) {
    enemies.clear();
    this.queue = [];
    this.state = 'break';
    this.timer = 3;
    this.showBanner('ЕЩЁ РАЗ');
  }

  dispose() {
    this.bannerEl.remove();
  }
}

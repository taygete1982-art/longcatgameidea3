import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { CONFIG } from './config.js';
import LEVELS from './config/levels.js';
import { SceneManager } from './core/SceneManager.js';
import { LightManager } from './core/LightManager.js';
import { StationBuilder } from './world/StationBuilder.js';
import { Player } from './entities/Player.js';
import { Base } from './entities/Base.js';
import { Enemies } from './systems/Enemies.js';
import { Waves } from './systems/Waves.js';
import { Gates } from './world/Gates.js';
import { Input } from './systems/Input.js';
import { FollowCamera } from './systems/FollowCamera.js';
import { Projectiles } from './systems/Projectiles.js';
import { DebugHelpers } from './debug/DebugHelpers.js';

class Game {
  constructor(container) {
    this.container = container;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.state = CONFIG.GameState.BOOT;
    this.animationFrameId = null;
    this.pulseTime = 0;
    this.clock = new THREE.Clock();

    this.init();
  }

  init() {
    // Уровень и тема
    const level = LEVELS[0];
    this.level = level;
    this.themeName = level.theme; // 'Glac' | 'Obs' | 'Crystal'

    this.sceneManager = new SceneManager(this.container);
    this.scene = this.sceneManager.scene;
    this.camera = this.sceneManager.camera;
    this.renderer = this.sceneManager.renderer;

    // Env-карта: нейтральный студийный IBL, без HDR-файлов (shader-cookbook).
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    // StationBuilder с темой из уровня
    this.stationBuilder = new StationBuilder(this.scene, this.themeName);
    this.bounds = this.stationBuilder.getBounds();

    // Оборона базы: ворота сверху, база снизу.
    this.input = new Input(this.container);
    this.player = new Player(this.scene);
    this.player.group.position.set(0, 0, 12);
    this.followCam = new FollowCamera(this.camera);
    this.enemies = new Enemies(this.scene, 24);
    this.gates = new Gates(this.scene, level.gates);
    this.base = new Base(this.scene);
    this.waves = new Waves(this.container, () => this.gates.pickSpawn(), level.waves.length);
    this.bolts = new Projectiles(this.scene);
    this.enemyBolts = new Projectiles(this.scene, { color: 0xff4444, speed: CONFIG.combat.enemyBoltSpeed, pool: CONFIG.combat.enemyBoltPool, life: 2.2 });
    this.fireTimer = 0;
    this.flash = 0;
    this.flashEl = document.createElement('div');
    this.flashEl.style.cssText = 'position:absolute;inset:0;background:rgba(255,30,40,0);pointer-events:none;z-index:5;';
    this.container.appendChild(this.flashEl);
    this.heartsEl = document.createElement('div');
    this.heartsEl.style.cssText = 'position:absolute;top:12px;left:14px;font-size:28px;color:#ff4455;text-shadow:0 0 8px #ff0000;pointer-events:none;z-index:6;';
    this.container.appendChild(this.heartsEl);
    this.updateHearts();
    // Полоса HP базы сверху по центру.
    this.baseBarOuter = document.createElement('div');
    this.baseBarOuter.style.cssText = 'position:absolute;top:12px;left:50%;transform:translateX(-50%);width:40%;height:14px;background:rgba(0,0,0,0.55);border:1px solid rgba(0,170,255,0.6);border-radius:7px;pointer-events:none;z-index:6;';
    this.baseBarEl = document.createElement('div');
    this.baseBarEl.style.cssText = 'height:100%;width:100%;background:linear-gradient(90deg,#00aaff,#44ff88);border-radius:6px;';
    this.baseBarOuter.appendChild(this.baseBarEl);
    this.container.appendChild(this.baseBarOuter);

    this.lightManager = new LightManager(this.scene);
    this.wireLights();
    this.scene.fog = new THREE.FogExp2(CONFIG.fog.color, CONFIG.fog.density);

    // Post: RenderPass → Bloom (только яркий неон) → OutputPass (тонемаппинг).
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(this.container.clientWidth, this.container.clientHeight),
      CONFIG.post.bloomStrength,
      CONFIG.post.bloomRadius,
      CONFIG.post.bloomThreshold
    );
    this.composer.addPass(this.bloomPass);
    this.composer.addPass(new OutputPass());
    this.onResizeComposer = () => {
      this.composer.setSize(this.container.clientWidth, this.container.clientHeight);
    };
    window.addEventListener('resize', this.onResizeComposer);

    if (CONFIG.debug.showGrid) DebugHelpers.addGrid(this.scene);
    if (CONFIG.debug.showAxes) DebugHelpers.addAxes(this.scene);
  }

  wireLights() {
    const L = CONFIG.lights;
    this.lightManager.addAmbient('ambient', L.ambient.color, L.ambient.intensity);
    this.lightManager.addHemisphere('hemi', L.hemisphere.skyColor, L.hemisphere.groundColor, L.hemisphere.intensity);
    this.lightManager.addDirectional(
      'sun',
      L.directional.color,
      L.directional.intensity,
      new THREE.Vector3(L.directional.position.x, L.directional.position.y, L.directional.position.z),
      true
    );
    L.pointLights.forEach((p, i) => {
      const light = this.lightManager.addPulsing(p.id, p.color, p.intensity, 20, i * 1.5);
      light.position.set(p.position.x, p.position.y, p.position.z);
    });
  }

  start() {
    if (this.animationFrameId) return;
    this.lockOrientation();
    this.clock.start();
    this.animate();
  }

  async lockOrientation() {
    // Работает в fullscreen на мобильных; на десктопе молча игнорируем.
    try {
      if (screen.orientation && screen.orientation.lock) await screen.orientation.lock('portrait');
    } catch (e) { /* noop */ }
  }

  animate() {
    this.animationFrameId = requestAnimationFrame(() => this.animate());

    const delta = Math.min(this.clock.getDelta(), 0.1);
    this.pulseTime += delta;

    // Игрок + камера.
    const move = this.input.getMove();
    this.player.update(delta, move, this.bounds);
    // Волны.
    this.waves.update(delta, this.enemies);
    // Враг: ближний бой и выстрелы.
    const ppos = this.player.getPosition();
    const api = {
      onMelee: (e, victim) => victim === 'base' ? this.hitBase(e.cfg.damage) : this.hurtPlayer(e.cfg.damage),
      onShoot: (e) => {
        const o = e.group.position.clone();
        o.y = 1.0;
        const dir = new THREE.Vector3(ppos.x - o.x, 0, ppos.z - o.z).normalize();
        this.enemyBolts.fire(o, dir);
      },
    };
    this.enemies.update(delta, ppos, this.base.pos, api);
    // Автоагонь по ближайшему живому врагу; без движения — разворот к цели.
    const target = this.nearestEnemy(ppos, CONFIG.combat.range);
    if (target && move.x === 0 && move.z === 0) {
      const tp = target.group.position;
      this.player.yaw = Math.atan2(tp.x - ppos.x, tp.z - ppos.z);
      this.player.group.rotation.y = this.player.yaw;
    }
    this.followCam.update(delta, ppos, this.player.getForward());
    // Очередь.
    this.fireTimer += delta;
    if (target && this.fireTimer >= 1 / CONFIG.combat.fireRate) {
      this.fireTimer = 0;
      const origin = ppos.clone();
      origin.y = 1.0;
      origin.addScaledVector(this.player.getForward(), 0.7);
      const tp = target.group.position;
      const dir = new THREE.Vector3(tp.x - origin.x, 0, tp.z - origin.z).normalize();
      this.bolts.fire(origin, dir);
    }
    this.bolts.update(delta, this.enemies.syncTargets(), this.bounds, (t) => {
      if (t.ref.damage(1) && t.ref.type === 'tank') this.tankExplode(t.ref);
    });
    // Болты врага летят в игрока.
    this.enemyBolts.update(delta, [{ pos: ppos, radius: this.player.radius, alive: this.player.hp > 0 }], this.bounds, () => this.hurtPlayer(1));
    // База дышит, ворота мигают при спавне.
    this.base.update(delta, this.pulseTime);
    this.gates.update(delta);
    // Вспышка урона затухает.
    if (this.flash > 0) {
      this.flash = Math.max(0, this.flash - delta * 2);
      this.flashEl.style.background = `rgba(255,30,40,${(this.flash * 0.55).toFixed(2)})`;
    }

    this.lightManager.pulseTime = this.pulseTime;
    this.lightManager.update();
    // Пульс неона в такт лампам (та же частота 0.8, та же глубина 0.4).
    for (const m of this.stationBuilder.neonMats) {
      m.emissiveIntensity = this.stationBuilder.neonBase * (1 + 0.4 * Math.sin(this.pulseTime * 0.8));
    }
    this.sceneManager.update(delta);

    this.render();
  }

  nearestEnemy(pos, range) {
    let best = null;
    let bestD = range * range;
    for (const e of this.enemies.pool) {
      if (!e.active || e.state === 'die') continue;
      const dx = e.group.position.x - pos.x;
      const dz = e.group.position.z - pos.z;
      const d = dx * dx + dz * dz;
      if (d < bestD) { bestD = d; best = e; }
    }
    return best;
  }

  hurtPlayer(n) {
    const r = this.player.hit();
    if (r === 'ignored') return;
    if (r === 'hit' && n > 1) this.player.hp = Math.max(0, this.player.hp - (n - 1));
    this.flash = 1;
    this.updateHearts();
    if (this.player.hp <= 0) {
      // Смерть: зачистка болтов, рестарт волны, игрок в центр.
      this.bolts.clear();
      this.enemyBolts.clear();
      this.waves.resetWave(this.enemies);
      this.player.revive();
      this.updateHearts();
    }
  }

  updateHearts() {
    this.heartsEl.textContent = '♥'.repeat(Math.max(0, this.player.hp)) + '♡'.repeat(Math.max(0, this.player.maxHp - this.player.hp));
  }

  updateBaseBar() {
    const pct = Math.max(0, (this.base.hp / this.base.maxHp) * 100);
    this.baseBarEl.style.width = pct.toFixed(0) + '%';
  }

  hitBase(n) {
    this.base.damage(n);
    this.updateBaseBar();
    if (this.base.destroyed) {
      // База пала: зачистка, рестарт волны, всё восстановить.
      this.bolts.clear();
      this.enemyBolts.clear();
      this.waves.resetWave(this.enemies);
      this.base.restore();
      this.updateBaseBar();
      this.player.revive();
      this.updateHearts();
      this.waves.showBanner('БАЗА УНИЧТОЖЕНА');
    }
  }

  tankExplode(tank) {
    // Взрыв танка: урон игроку в радиусе.
    const ppos = this.player.getPosition();
    const tp = tank.group.position;
    const dx = ppos.x - tp.x;
    const dz = ppos.z - tp.z;
    const r = tank.cfg.explodeRadius;
    if (dx * dx + dz * dz < r * r) this.hurtPlayer(tank.cfg.damage);
  }

  render() {
    this.composer.render();
  }

  dispose() {
    cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = null;
    window.removeEventListener('resize', this.onResizeComposer);
    this.composer?.dispose?.();
    this.input.dispose();
    this.player.dispose(this.scene);
    this.enemies.dispose();
    this.waves.dispose();
    this.gates.dispose(this.scene);
    this.base.dispose(this.scene);
    this.bolts.dispose(this.scene);
    this.enemyBolts.dispose(this.scene);
    this.flashEl.remove();
    this.heartsEl.remove();
    this.baseBarOuter.remove();
    this.stationBuilder.dispose();
    this.lightManager.dispose();
    this.sceneManager.dispose();
  }
}

const container = document.getElementById('game');
const game = new Game(container);
game.start();

// Debug-хук: доступ к сцене из консоли браузера.
window.__game = game;

// HMR: снести старую сцену и канвас, иначе stale-кадр остаётся поверх нового.
if (import.meta.hot) {
  import.meta.hot.dispose(() => game.dispose());
}

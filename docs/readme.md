# 🚀 Харис (LongcatGameIdea3)

> Мини-шутер от 3-го лица для Yandex Games. Защитите орбитальную станцию от 5 волн дроидов.

## Название

**Харис** (حارس) — арабское слово из двух слогов, означает «страж», «охранник». Отражает сюжетную роль игрока — последний защитник станции.

## Документация

| Файл | Назначение |
|------|-----------|
| [idea.md](docs/idea.md) | Идея игры — концепт, механики, сеттинг |
| [spec.md](docs/spec.md) | Техническая спецификация — архитектура, стек, конфиг |
| [readme.md](docs/readme.md) | Этот файл — проектная документация |
| [bible.md](docs/bible.md) | Библия проекта — правила разработки |
| [passport.md](docs/passport.md) | Паспорт проекта — статус и вехи |
| [canon.md](docs/canon.md) | Канон — архитектурные решения |

## Быстрый старт

```bash
npm install
npm run dev      # Dev-сервер на http://localhost:5173
npm run build    # Прод-сборка в dist/
```

## Структура проекта

```
LongcatGameIdea3/
├── docs/                 # Документация
│   ├── idea.md           # Идея игры
│   ├── spec.md           # Техническая спецификация
│   ├── bible.md          # Библия проекта (правила разработки)
│   ├── passport.md       # Паспорт проекта (статус и вехи)
│   └── canon.md          # Канон (архитектурные решения)
├── src/                  # Исходный код
│   ├── main.js           # Точка входа
│   ├── config.js         # Конфиг баланса и настроек
│   ├── core/             # Базовые системы (рендер, камера, ввод)
│   ├── systems/          # Игровые системы (бой, волны, улучшения)
│   ├── effects/          # Визуальные эффекты (частицы, лазеры, взрывы)
│   ├── ui/               # Интерфейс (HUD, меню)
│   ├── world/            # Мир (станция, освещение)
│   └── utils/            # Утилиты
├── index.html            # Точка входа для браузера
├── vite.config.js        # Конфигурация Vite
└── package.json          # Зависимости и скрипты
```

## Технологии

- **Three.js** (r158+) — рендеринг, сцены, освещение
- **Vite 5.x** — сборка и dev-сервер
- **JavaScript ES2020+** — без фреймворков
- **WebGL 2.0** — аппаратное ускорение
- **GLSL** — кастомные шейдеры
- **Yandex Games SDK** — платформенная интеграция
- **localStorage** — сохранение рекордов

## Разработка

### Скрипты

```bash
npm run dev        # Dev-сервер с HMR
npm run build      # Прод-сборка
npm run preview    # Предпросмотр сборки
npm run lint       # Проверка ESLint
```

### Правила кода

1. **Чистый ES6+** — без TS, без фреймворков
2. **Модули ESM** — `import/export` везде
3. **Нейминг:** camelCase для переменных/функций, PascalCase для классов
4. **Файл = класс** — один основной класс на файл
5. **JSDoc** — все публичные методы документированы
6. **Без утечек памяти** — `dispose()` для всех Three.js ресурсов

### Производительность

- **Object Pooling** для снарядов, частиц, врагов
- **Pixel Ratio** capped at 2
- **draw calls** < 150
- **FPS цель:** 60 на десктопе, 30 на мобильных

---

## ЭТАП 1: КОСМИЧЕСКАЯ АРЕНА — ПЛАН

### ФАЗА 1: ФУНДАМЕНТ

**Пункт 1. SceneManager + GameLoop** (threejs-scene-setup, threejs-best-practices)
- WebGLRenderer: antialias, alpha, powerPreference: 'high-performance'
- Scene + PerspectiveCamera (fov: 75, near: 0.1, far: 1000)
- Clock для delta time
- requestAnimationFrame loop с FPS счётчиком
- Resize handler → updateCameraAspect + renderer.setSize
- Stats.js или собственный FPS counter для дебага

**Пункт 2. QualityManager** (threejs-best-practices, mobile-performance)
- Определение устройства: `navigator.userAgent` + `navigator.hardwareConcurrency`
- Определение GPU через `WEBGL_debug_renderer_info`
- 3 пресета: low / medium / high
- Пресет влияет на: pixelRatio, shadowMapSize, particleCount, postProcessing

### ФАЗА 2: АРЕНА И ГЕОМЕТРИЯ

**Пункт 3. StationBuilder** (threejs-geometry-management, threejs-instancing-advanced)
- Класс `StationBuilder` — строит арену процедурно
- `arenaSize = 40` (квадрат 40×40)
- Пол: PlaneGeometry → rotateX(-Math.PI/2)
- Стены: 4 стороны, каждая — группа панелей
- `InstancedMesh` для панелей стен: 1 draw call вместо 60
- `InstancedMesh` для контейнеров: 1 draw call для 20 штук
- Геометрия кешируется в `Map<string, BufferGeometry>`

**Пункт 4. Детали арены**
- Угловые стойки: BoxGeometry (0.5 × 6 × 0.5)
- Неоновые полосы: PlaneGeometry → MeshBasicMaterial (эмиссив)
- Трубы по потолку: CylinderGeometry
- Контейнеры: BoxGeometry × 6 размеров
- Все через InstancedMesh где возможно

**Пункт 5. Procedural Textures** (через Canvas 2D)
- `MetalPlateTexture` — серая основа + заклёпки по углам + царапины
- `HazardTexture` — жёлто-чёрные диагональные полосы
- `CarbonTexture` — текстура карбона
- Все генерируются через OffscreenCanvas / Canvas → CanvasTexture

### ФАЗА 3: ОСВЕЩЕНИЕ И ТЕНИ

**Пункт 6. LightManager** (threejs-lighting, threejs-shadows)
- AmbientLight(0x334466, 0.4) — базовый холодный
- HemisphereLight(0x446688, 0x222244, 0.3) — сверху/снизу
- DirectionalLight(0xffffff, 0.8) — главный источник, тени
- PointLight × 4 (синие, красные) — пульсирующие лампы

**Пункт 7. Тени по threejs-shadows**
- `ShadowManager` — обёртка для управления тенями
- `renderer.shadowMap.type = THREE.PCFSoftShadowMap`
- Для DirectionalLight:
  - `shadow.mapSize = 2048 × 2048`
  - `shadow.camera.left/right/top/bottom = ±30`
  - `shadow.bias = -0.0001`
  - `shadow.normalBias = 0.02`
- На mobile: `BasicShadowMap`, `mapSize = 512`
- `enableCastShadow(obj)` / `enableReceiveShadow(obj)` — рекурсивный traverse
- Визуализация shadow camera через `CameraHelper` (для дебага)

### ФАЗА 4: МАТЕРИАЛЫ

**Пункт 8. MaterialPresets** (threejs-pbr-materials)
- `metal_panel`: { color: 0x888899, metalness: 0.6, roughness: 0.5 }
- `floor_metal`: { color: 0x555566, metalness: 0.7, roughness: 0.4 }
- `neon_blue`: { color: 0x00aaff, emissive: 0x00aaff, emissiveIntensity: 2 }
- `neon_red`: { color: 0xff3344, emissive: 0xff3344, emissiveIntensity: 2 }
- `neon_green`: { color: 0x44ff88, emissive: 0x44ff88, emissiveIntensity: 2 }
- `container`: { color: 0x887744, metalness: 0.8, roughness: 0.3 }

**Пункт 9. MaterialManager** (threejs-material-systems)
- `Map<string, MeshStandardMaterial>` для кеширования
- `getOrCreate(key, config)` — если есть → вернуть, нет → создать + кешировать
- `disposeAll()` — очистка при выходе

**Пункт 10. MeshPhysicalMaterial для особых объектов**
- Контейнеры с `clearcoat: 1, clearcoatRoughness: 0.1`
- Стеклянные панели с `transmission: 0.9` (если понадобятся)

### ФАЗА 5: ПРОЦЕДУРНЫЕ ШЕЙДЕРЫ

**Пункт 11. ShaderFloor** (threejs-shaders + threejs-fog)
- `ShaderMaterial` с uniforms: `time`, `gridScale`, `colorA`, `colorB`
- Fragment shader:
  - Двухуровневая сетка (крупная 1m + мелкая 0.1m)
  - `fwidth()` для anti-aliasing линий
  - Пульсация яркости через `sin(time)`
  - Затухание к краям через fog factor

**Пункт 12. ShaderMonitor** (threejs-shaders)
- Fragment shader:
  - Scanline: `sin(vUv.y * 800.0) * 0.1`
  - Glitch: `step(fract(sin(dot(vUv, vec2(12.9898, 78.233)) + time), 0.99)`
  - Flicker: `sin(time * 30.0) * 0.05`
  - Vignette: `smoothstep(1.0, 0.5, length(vUv - 0.5))`
- Emissive материал для Bloom

### ФАЗА 6: ЧАСТИЦЫ

**Пункт 13. ParticleSystem** (threejs-particles)
- `ObjectPool` для частиц (ноль аллокаций)
- `ParticleEmitter` с параметрами: emitRate, maxParticles, lifetime, startColor, endColor, startSize, endSize, velocity, gravity
- 3 системы:
  - `SteamSystem`: rate: 2/s, lifetime: 3s, velocity: (0, 1, 0)
  - `SparkSystem`: burst на событие
  - `DustSystem`: 100 частиц, медленное движение
- Мобильный лимит: `particleCount = QualityManager.getPreset().maxParticles`

### ФАЗА 7: ПОСТОБРАБОТКА

**Пункт 14. PostProcessing** (threejs-postprocessing)
- `EffectComposer`
- Passes:
  1. `RenderPass(scene, camera)`
  2. `UnrealBloomPass(new Vector2(w, h), strength: 0.6, radius: 0.4, threshold: 0.85)`
  3. `ShaderPass(VignetteShader)` — виньетка
  4. `ShaderPass(GammaCorrectionShader)` — гамма
  5. `FXAAShader` — для мобильных
- `composer.setSize(w, h)` при ресайзе

**Пункт 15. Selective Bloom** (threejs-best-practices)
- Использовать `layers`
- `BLOOM_LAYER = 1`
- `bloomLayer.set(BLOOM_LAYER)` для неона и мониторов
- Композитинг: render без bloom → bloom → overlay

### ФАЗА 8: КАМЕРА

**Пункт 16. ThirdPersonCamera** (camera-system)
- Параметры: `distance = 12`, `height = 8`, `damping = 5`
- `camera.position.lerp(targetPos, 1 - Math.exp(-damping * delta))`
- `camera.lookAt(target + lookAtOffset)`
- `Camera shake`: `camera.position += random(-intensity, intensity)` → затухание

### ФАЗА 9: ВВОД

**Пункт 17. InputManager** (input-system)
- `Map<string, boolean>` для состояний клавиш
- Action mapping:
  - `moveForward`: ['KeyW', 'ArrowUp']
  - `moveBackward`: ['KeyS', 'ArrowDown']
  - `moveLeft`: ['KeyA', 'ArrowLeft']
  - `moveRight`: ['KeyD', 'ArrowRight']
  - `dash`: ['ShiftLeft', 'ShiftRight']
- `isActionPressed(action)` → boolean
- Touch: `touchstart/touchend` → виртуальный джойстик (базовый)

### ФАЗА 10: КОЛЛИЗИИ И МАТЕМАТИКА

**Пункт 18. CollisionUtils** (threejs-math-utilities)
- `CollisionUtils.sphereIntersectsSphere(c1, r1, c2, r2)`
- `CollisionUtils.pointInAABB(point, min, max)`
- `CollisionUtils.aabbIntersectsAABB(min1, max1, min2, max2)`
- `CollisionUtils.sphereIntersectsAABB(center, radius, min, max)`
- `CollisionUtils.rayIntersectsSphere(origin, dir, center, radius)`
- `CollisionUtils.rayIntersectsPlane(origin, dir, point, normal)`

**Пункт 19. VectorUtils** (threejs-math-utilities)
- `VectorUtils.distance2D(a, b)` — без Y
- `VectorUtils.distanceSquared2D(a, b)` — для сравнений
- `VectorUtils.direction(from, to)` — normalize(to - from)
- `VectorUtils.angle2D(from, to)` — atan2
- `VectorUtils.randomInCircle(radius)` — равномерно в круге
- `VectorUtils.clampLength(v, min, max)`
- `VectorUtils.reflect(v, normal)`

**Пункт 20. InterpolationUtils** (threejs-math-utilities)
- `InterpolationUtils.smoothStep(min, max, value)`
- `InterpolationUtils.smootherStep(min, max, value)`
- `InterpolationUtils.lerpVectors(a, b, t, easing?)`
- `InterpolationUtils.spring(current, target, velocity, dt, stiffness, damping)`
- `InterpolationUtils.springVector(current, target, velocity, dt, stiffness, damping)`

### ФАЗА 11: UI

**Пункт 21. HUD** (ui-system, game-ui-ux)
- HTML overlay поверх canvas
- Health bar: div с width в %, цвет меняется з→ж→к
- Score: span с цифрой
- Crosshair: центр экрана, крестик из 4 div
- Wave counter: текст "WAVE 1"

**Пункт 22. MenuSystem** (game-ui-ux)
- Стек экранов: `MenuStack`
- `push(screen)` / `pop()` / `replace(screen)`
- Экраны: MainMenu, PauseMenu, GameOver
- Навигация: Esc → push(pause), кнопка "продолжить" → pop()

### ФАЗА 12: ПРОИЗВОДИТЕЛЬНОСТЬ

**Пункт 23. MemoryManager** (memory-management)
- `ObjectPool<T>` — универсальный пул
- `acquire()` / `release(obj)`
- Пул для: частиц, пуль, искр, временных Vector3
- `disposeAll()` — очистка geometry + material

**Пункт 24. AdaptiveQuality** (mobile-performance, threejs-performance-profiling)
- Каждые 60 кадров проверяем FPS
- FPS < 25 → снижаем качество на уровень
- FPS > 55 → повышаем качество на уровень
- Влияние: pixelRatio, shadowMapSize, particleCount, bloomResolution

### ФАЗА 13: ПРОЦЕДУРНАЯ АНИМАЦИЯ

**Пункт 25. ProceduralAnimations** (threejs-animation, threejs-animation-systems)
- `ProceduralAnimation.animateAlongPath(obj, path, duration, onUpdate?)`
- `ProceduralAnimation.bounce(obj, height, duration)`
- `ProceduralAnimation.rotate(obj, axis, speed)` → returns stop function

**Пункт 26. Spring-based анимации** (threejs-animation-systems)
- `Spring(stiffness = 100, damping = 10)`
- `spring.target = 1; spring.update(dt)` → возвращает позицию
- Применять для: камеры, UI элементов, отдачи оружия

### ФАЗА 14: ОКРУЖЕНИЕ

**Пункт 27. StarField** (threejs-environment-maps)
- `SkyboxBuilder.createGradientSky(topColor, bottomColor)` — градиентный скайбокс
- SphereGeometry(500, 32, 15) с BackSide
- ShaderMaterial с градиентом
- 300 звёзд через Points + PointMaterial с flicker

**Пункт 28. Fog** (threejs-fog)
- `THREE.FogExp2(0x0a0a15, 0.015)`
- Плотность зависит от пресета качества
- Плавный переход при смене плотности

### ФАЗА 15: СБОРКА

**Пункт 29. Vite Config + Build**
- `vite.config.js`: outDir: 'dist', target: 'es2020'
- Tree-shaking для Three.js
- Code splitting: основной чанк + vendor чанк
- Bundle size: цель < 500KB gzip

**Пункт 30. Финальное тестирование**
- Проверка FPS на разных устройствах
- Проверка утечек памяти (Chrome DevTools → Memory)
- Проверка ресайза
- Проверка Yandex Games SDK интеграции (заглушка)

---

## ПРОМТ ДЛЯ НОВОЙ СЕССИИ

```
Ты — senior game developer с доступом к 400+ скиллам для геймдева, Three.js и кодинга.

ЗАДАЧА: Переписать Этап 1 игры "Харис" (Харис / حارس — "Страж") — третий-персонажный мини-шутер на космической станции.

ПРОЕКТ: C:/TestProjects/LongcatGameIdea3
ПЛАТФОРМА: Yandex Games
ДВИОК: Three.js r158 + Vite 5
РАЗМЕР: < 500KB gzip
БЕЗ ТЕКСТУР — только процедурные материалы и шейдеры

ПОРЯДОК РАБОТЫ:

1. Проанализируй ВСЕ доступные скиллы (~400 штук) — найди те, которые применимы к:
   - Three.js и 3D рендерингу
   - Геймдеву и игровым системам
   - Кодингу и архитектуре
   - Постобработке и визуальным эффектам
   - Производительности и оптимизации
   - UI/UX
   - Загрузке ассетов
   - Анимации
   - Материалам и шейдерам
   - Тестированию и верификации
   
   Не ограничивайся 28 — используй максимум подходящих. Каждый скилл может дать паттерн, пример или лучшую практику.

2. Прочитай КАЖДЫЙ скилл целиком, извлеки паттерны и примеры.

3. СОЗДАЙ ПЛАН из 30 пунктов строго по содержимому скиллов.
   - Каждый пункт = конкретный файл + конкретные классы из скиллов
   - Отмечай пункты в todo_list по мере выполнения

4. ПОЛУЧИ МОЁ ОДОБРЕНИЕ плана

5. Выполняй пункты ПО ПОРЯДКУ, загружая скиллы заново если прунятся.

СОСТОЯНИЕ ПРОЕКТА:
- docs/ — готовы (idea.md, spec.md, readme.md, bible.md, passport.md, canon.md)
- package.json — Three.js 0.158.0, Vite 5.0.0
- src/ — пустая структура core/, systems/, effects/, world/, ui/, utils/
- index.html — готов

ДЕЛАЙ АККУРАТНО И КРАСИВО. Не торопись.
```

## ПЛАН ЭТАПОВ 2–7

### ЭТАП 2: ИГРОК И УПРАВЛЕНИЕ
**Цель:** Игрок двигается, стреляет с автоаимом, делает рывок, имеет щит

| # | Файл | Что делаем | Применимые скиллы |
|---|------|-----------|-------------------|
| 2.1 | `src/entities/Player.js` | Класс Player: состояние (HP, щит, статы), конфиг из `config.js` | health-combat-system, spawn-system |
| 2.2 | `src/systems/MovementSystem.js` | Движение WASD, границы арены, скорость из конфига | threejs-math-utilities (clamp, distance2D) |
| 2.3 | `src/systems/DashSystem.js` | Рывок: направление × скорость, кулдаун, инвульность | game-feel (easing, hit-stop) |
| 2.4 | `src/systems/AutoAim.js` | Поиск ближайшего врага, поворот игрока к нему | threejs-raycasting, threejs-math-utilities (angle2D) |
| 2.5 | `src/systems/WeaponSystem.js` | Стрельба: частота, скорость снаряда, урон, Object Pool | input-system, spawn-system |
| 2.6 | `src/entities/Projectile.js` | Снаряд: полёт, коллизия, возврат в пул | collision-system, memory-management |
| 2.7 | `src/systems/ShieldSystem.js` | Пассивный щит: поглощает урон, регенерация через 5с | health-combat-system |

### ЭТАП 3: ВРАГИ И ВОЛНЫ
**Цель:** 4 типа врага + мини-босс, система 5 волн

| # | Файл | Что делаем | Применимые скиллы |
|---|------|-----------|-------------------|
| 3.1 | `src/entities/enemies/BaseEnemy.js` | Базовый класс: HP, скорость, урон, состояния (idle/attack/dead) | health-combat-system, spawn-system |
| 3.2 | `src/entities/enemies/Runner.js` | Бегун: быстрый, ближний бой, 1 HP | ai-system (behavior trees) |
| 3.3 | `src/entities/enemies/Shooter.js` | Стрелок: стреляет с дистанции, 2 HP, fireRate 1 | input-system (для паттернов стрельбы) |
| 3.4 | `src/entities/enemies/Tank.js` | Танк: медленный, 5 HP, взрывается при смерти | collision-system, spawn-system |
| 3.5 | `src/entities/enemies/MiniBoss.js` | Мини-босс: 20 HP, усиленный бегун, появляется в волне 3 | health-combat-system |
| 3.6 | `src/systems/WaveSystem.js` | Конфигурация 5 волн: количество, типы, таймер 10с | spawn-system |
| 3.7 | `src/systems/SpawnSystem.js` | Спавн врагов в точках арены, Object Pool | spawn-system, collision-system |
| 3.8 | `src/utils/ObjectPool.js` | Универсальный пул для снарядов, врагов, частиц | memory-management |

### ЭТАП 4: БОЙ И ЭФФЕКТЫ
**Цель:** Попадания, урон, лазеры, взрывы, частицы

| # | Файл | Что делаем | Применимые скиллы |
|---|------|-----------|-------------------|
| 4.1 | `src/systems/CombatSystem.js` | Обработка попаданий: снижение HP, события смерти | health-combat-system |
| 4.2 | `src/effects/LaserBeam.js` | Лазерный луч: Line geometry, fade out, пулинг | threejs-geometry-management |
| 4.3 | `src/effects/Explosion.js` | Взрыв: вспышка + частицы + тряска камеры | threejs-particles, game-feel (camera shake) |
| 4.4 | `src/effects/HitFlash.js` | Вспышка попадания: короткий эмиссив на враге | game-feel (hit-stop) |
| 4.5 | `src/effects/SmokeParticles.js` | Фоновый дым на арене: 20-30 частиц, медленно движутся | threejs-particles |
| 4.6 | `src/systems/DamageNumbers.js` | Всплывающие цифры урона (опционально) | ui-system, game-ui-ux |

### ЭТАП 5: УЛУЧШЕНИЯ И UI
**Цель:** Меню между волнами, HUD, главное меню

| # | Файл | Что делаем | Применимые скиллы |
|---|------|-----------|-------------------|
| 5.1 | `src/ui/HUD.js` | Health bar, wave counter, score, shield indicator | ui-system, game-ui-ux |
| 5.2 | `src/ui/Crosshair.js` | Прицел в центре экрана, автоаим индикатор | ui-system |
| 5.3 | `src/ui/MenuSystem.js` | Стек экранов: main, pause, game over, victory | game-ui-ux |
| 5.4 | `src/ui/UpgradeCards.js` | 3 рандомные карточки улучшений, клик → применение | ui-system, game-ui-ux |
| 5.5 | `src/systems/Upgrades.js` | Применение улучшений: множители урона, скорости и т.д. | inventory-system |
| 5.6 | `src/ui/LoadingScreen.js` | Экран загрузки с прогресс-баром | ui-system |

### ЭТАП 6: БОСС И ФИНАЛ
**Цель:** Босс «Омега» с 3 фазами, экраны победы/поражения

| # | Файл | Что делаем | Применимые скиллы |
|---|------|-----------|-------------------|
| 6.1 | `src/entities/Boss.js` | Босс: 150 HP, 3 фазы, машина состояний | ai-system, health-combat-system |
| 6.2 | `src/systems/BossPhase1.js` | Фаза 1: очереди, призыв бегунов | spawn-system |
| 6.3 | `src/systems/BossPhase2.js` | Фаза 2: рывки, лазерные лучи | threejs-raycasting (лазеры) |
| 6.4 | `src/systems/BossPhase3.js` | Фаза 3: непрерывная стрельба, вращающиеся снаряды | spawn-system |
| 6.5 | `src/effects/BossDeath.js` | Смерть босса: долгий взрыв, замедление времени | game-feel (hit-stop, slow-mo) |
| 6.6 | `src/ui/VictoryScreen.js` | Экран победы: счёт, время, рекорд | ui-system, game-ui-ux |
| 6.7 | `src/ui/GameOverScreen.js` | Экран поражения: кнопка рестарта | ui-system, game-ui-ux |

### ЭТАП 7: ИНТЕГРАЦИЯ И ПОЛИРОВКА
**Цель:** Yandex Games SDK, оптимизация, тестирование

| # | Файл | Что делаем | Применимые скиллы |
|---|------|-----------|-------------------|
| 7.1 | `src/core/YandexSDK.js` | Инициализация SDK, реклама, лидерборды | web-game-foundations |
| 7.2 | `src/core/SaveSystem.js` | localStorage: рекорды, лучшее время | memory-management |
| 7.3 | `src/core/PerformanceMonitor.js` | FPS, draw calls, память — адаптивное качество | threejs-performance-profiling, mobile-performance |
| 7.4 | `src/utils/QualityPresets.js` | Пресеты low/medium/high: тени, частицы, постобработка | mobile-performance |
| 7.5 | `src/main.js` | Финальная оркестрация всех систем | threejs-best-practices |
| 7.6 | `npm run build` | Сборка, проверка размера < 500KB gzip | — |
| 7.7 | Chrome DevTools | Проверка утечек памяти, FPS, профиль производительности | threejs-performance-profiling |
| 7.8 | Yandex Games | Загрузка на платформу, тестирование SDK | — |

### СВОДНАЯ ТАБЛИЦА

| Этап | Название | Файлы (новые) | Статус |
|------|----------|---------------|--------|
| 1 | Космическая арена | 18 | ✅ План готов |
| 2 | Игрок и управление | 7 | ⬜ |
| 3 | Враги и волны | 8 | ⬜ |
| 4 | Бой и эффекты | 6 | ⬜ |
| 5 | Улучшения и UI | 6 | ⬜ |
| 6 | Босс и финал | 7 | ⬜ |
| 7 | Интеграция и полировка | 6 | ⬜ |
| **Итого** | | **58** | |

## Yandex Games SDK

```javascript
// Инициализация
const ysdk = await YaGames.init();

// Реклама между сессиями
ysdk.adv.showFullscreenAdv({
  callbacks: { onClose: () => game.resume() }
});

// Лидерборд
const lb = await ysdk.getLeaderboards();
await lb.setLeaderboardScore('main', score);
```

## Лицензия

Проект создан для публикации на Yandex Games. Все ассеты процедурные (без текстур).
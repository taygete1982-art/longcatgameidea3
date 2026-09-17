# SPEC: Харис

Мини-шутер от 3-го лица для Yandex Games. Игрок защищает орбитальную станцию от 5 волн дроидов.

## Название

**Харис** (حارس) — арабское слово из двух слогов, означает «страж», «охранник». Отражает сюжетную роль игрока — последний защитник станции.

## Технический стек

| Компонент | Технология |
|-----------|-----------|
| Движок | Three.js (vanilla, r158+) |
| Язык | JavaScript (ES2020) |
| Сборка | Vite 5.x |
| Рендеринг | WebGL 2.0 |
| Шейдеры | GLSL |
| Физика | Собственная (простая) |
| Ввод | Keyboard, Gamepad API |
| Хранение | localStorage |
| SDK | Yandex Games SDK |

## Архитектура проекта

```
LongcatGameIdea3/
├── index.html              # Точка входа
├── package.json            # Зависимости и скрипты
├── vite.config.js          # Конфигурация Vite
├── src/
│   ├── main.js             # Бутстрап приложения
│   ├── game.js             # Главный игровой цикл, сцены
│   ├── config.js           # Константы баланса, настройки
│   ├── core/
│   │   ├── scene.js        # Менеджер сцены Three.js
│   │   ├── renderer.js     # WebGLRenderer настройка
│   │   ├── camera.js       # Камера от 3-го лица
│   │   ├── input.js        # Управление (клавиатура/геймпад)
│   │   └── audio.js        # Web Audio API (заглушка)
│   ├── entities/
│   │   ├── player.js       # Игрок (модель, состояние, логика)
│   │   ├── enemy.js        # Базовый класс врага
│   │   ├── enemies/        # Конкретные типы врагов
│   │   │   ├── runner.js
│   │   │   ├── shooter.js
│   │   │   ├── tank.js
│   │   │   └── miniboss.js
│   │   ├── boss.js         # Босс
│   │   ├── projectile.js   # Снаряды (лазеры)
│   │   └── pickup.js       # Подбираемые предметы (хилки)
│   ├── systems/
│   │   ├── combat.js       # Обработка попаданий, урон
│   │   ├── spawning.js     # Спавн врагов по волнам
│   │   ├── wave.js         # Управление волнами
│   │   ├── collision.js    # AABB/OBB коллизии
│   │   ├── upgrades.js     # Меню улучшений
│   │   └── score.js        # Система очков
│   ├── effects/
│   │   ├── particles.js    # Система частиц (пули, взрывы)
│   │   ├── explosions.js   # Взрывы
│   │   └── lasers.js       # Лазерные лучи
│   ├── ui/
│   │   ├── hud.js          # HUD (здоровье, волна, очки)
│   │   ├── menu.js         # Главное меню
│   │   ├── upgrade-cards.js # Карточки улучшений
│   │   ├── game-over.js    # Экран поражения
│   │   └── victory.js      # Экран победы
│   ├── world/
│   │   ├── station.js      # Геометрия станции (пол, стены)
│   │   ├── lighting.js     # Освещение (ambient + point lights)
│   │   └── props.js        # Объекты окружения
│   └── utils/
│       ├── math.js         # Векторная математика, clamp, lerp
│       ├── pool.js         # Object pool для снарядов/врагов
│       └── storage.js      # localStorage wrapper
└── assets/                  # Пусто (без текстур, всё через шейдеры)
```

## Игровой конфиг (config.js)

```javascript
export const CONFIG = {
  // Игрок
  player: {
    maxHealth: 3,
    maxShield: 2,
    shieldRegenDelay: 5,
    moveSpeed: 8,
    dashDistance: 6,
    dashCooldown: 2.5,
    fireRate: 4, // выстрелов в секунду
    projectileSpeed: 25,
    projectileDamage: 1,
  },

  // Враги
  enemies: {
    runner: { health: 1, speed: 6, damage: 1, score: 10 },
    shooter: { health: 2, speed: 2, damage: 1, score: 20, fireRate: 1 },
    tank: { health: 5, speed: 1.5, damage: 2, score: 50, explosionRadius: 3 },
    miniboss: { health: 20, speed: 3, damage: 2, score: 100 },
    boss: { health: 150, phases: 3, score: 1000 },
  },

  // Волны
  waves: {
    total: 5,
    warmupTime: 10, // секунд между волнами
    baseEnemies: 5,
    enemiesPerWave: 4,
  },

  // Арена
  arena: {
    width: 30,
    depth: 30,
    wallHeight: 2,
  },

  // Улучшения (стакаются до 5 раз)
  upgrades: [
    { id: 'damage', name: 'Урон +10%', maxStacks: 5 },
    { id: 'fireRate', name: 'Скорость +10%', maxStacks: 5 },
    { id: 'shield', name: 'Щит +1', maxStacks: 3 },
    { id: 'speed', name: 'Скорость +15%', maxStacks: 3 },
    { id: 'dash', name: 'Рывок -30% кулдаун', maxStacks: 2 },
    { id: 'health', name: 'Жизнь +1', maxStacks: 2 },
  ],

  // Рендеринг
  render: {
    pixelRatio: Math.min(window.devicePixelRatio, 2),
    shadowMapSize: 1024,
    fogDensity: 0.02,
  },

  // Оптимизация
  pool: {
    projectiles: 100,
    particles: 500,
    enemies: 30,
  },
};
```

## Жизненный цикл сцены

1. **Boot** → загрузка ресурсов, инициализация SDK
2. **Menu** → главное меню (Start, Leaderboard)
3. **Wave Start** → отображение номера волны, таймер
4. **Combat** → активный бой
5. **Wave Complete** → меню улучшений
6. **Game Over** → экран поражения
7. **Victory** → экран победы

## Оптимизации

- **Object Pooling** для снарядов, частиц, врагов
- **Frustum Culling** (встроенный в Three.js)
- **InstancedMesh** для однотипных объектов (враги одного типа)
- **Pixel Ratio Cap** = 2
- **Fog** для скрытия дальних объектов
- **Симуляция** только видимых врагов

## Yandex Games интеграция

```javascript
// Инициализация SDK
YaGames.init().then(ysdk => {
  console.log('Yandex SDK initialized');
  // Лидерборды
  ysdk.getLeaderboards().then(lb => {});
  // Рклама
  ysdk.adv.showFullscreenAdv({ callbacks: {} });
});

// Лидерборды
function submitScore(score) {
  ysdk.getLeaderboards().then(lb => {
    lb.setLeaderboardScore('main', score);
  });
}
```

## Производительные цели

| Метрика | Цель |
|---------|------|
| FPS | 60 (desktop), 30 (mobile) |
| Загрузка | < 5 секунд |
| Размер бандла | < 5MB gzip |
| Пик врагов на экране | 20 |
| draw calls | < 150 |
| Память | < 200MB |

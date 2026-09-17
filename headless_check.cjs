const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 400, height: 800 } });

  const logs = [];
  page.on('pageerror', msg => logs.push('PAGE_ERROR: ' + msg));
  page.on('console', msg => {
    const type = msg.type();
    if (type === 'error' || type === 'warning') logs.push(`CONSOLE_${type.toUpperCase()}: ${msg.text()}`);
  });
  page.on('requestfailed', req => logs.push('REQ_FAILED: ' + req.url()));

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 30000 });

  // Wait for game handle
  try {
    await page.waitForFunction(() => window.__game && window.__game.scene, { timeout: 15000 });
    console.log('✓ window.__game ready');
  } catch (e) {
    console.log('✗ window.__game NOT ready after 15s');
  }

  // Let it run a few seconds to catch runtime errors
  await page.waitForTimeout(5000);

  // Capture state
  const state = await page.evaluate(() => {
    const g = window.__game;
    if (!g) return null;
    return {
      hasScene: !!g.scene,
      hasCamera: !!g.camera,
      hasRenderer: !!g.renderer,
      playerPos: g.player ? g.player.group.position : null,
      playerHP: g.player ? g.player.hp : null,
      enemyCount: g.enemies ? g.enemies.aliveCount() : 0,
      waveState: g.waves ? g.waves.state : null,
      waveNum: g.waves ? g.waves.wave : null,
      baseHP: g.base ? g.base.hp : null,
      neonMats: g.stationBuilder ? g.stationBuilder.neonMats.length : 0,
    };
  });

  // Screenshot
  await page.screenshot({ path: 'C:/TestProjects/LongcatGameIdea3/debug_screenshot.png' });

  // Output
  console.log('\n=== STATE ===');
  console.log(JSON.stringify(state, null, 2));
  console.log('\n=== LOGS ===');
  console.log(logs.length ? logs.join('\n') : '(no errors/warnings)');

  await browser.close();
})();

const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const [,, mode, outDir] = process.argv;
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('console', m => console.log('page:', m.text()));
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('http://127.0.0.1:8765/scene.html');
  await p.evaluate(() => window.ready);
  fs.mkdirSync(outDir, { recursive: true });
  const times = mode === 'stills' ? [0.8, 2.2, 3.6, 5.2, 7.0, 11.5, 15.8, 19.0, 22.5, 26.5, 30.0]
    : Array.from({ length: 33 * 30 }, (_, i) => i / 30);
  let i = 0;
  for (const t of times) {
    await p.evaluate(t => window.render(t), t);
    const name = mode === 'stills' ? `s_${t.toFixed(1)}.jpg` : `f_${String(i).padStart(5, '0')}.jpg`;
    await p.screenshot({ path: `${outDir}/${name}`, type: 'jpeg', quality: 93 });
    i++; if (i % 150 === 0) console.log(i);
  }
  await b.close();
})();

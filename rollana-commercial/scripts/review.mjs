// Render review frames (and a contact sheet) without re-bundling per frame.
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import path from 'node:path';
import { execSync } from 'node:child_process';

const frames = process.argv.slice(2).map(Number);
const out = 'output/review';
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts'), publicDir: path.resolve('assets') });
const composition = await selectComposition({ serveUrl, id: 'RollanaCommercial', browserExecutable });
for (const f of frames) {
  await renderStill({ serveUrl, composition, frame: f, output: `${out}/f${String(f).padStart(3, '0')}.jpg`, imageFormat: 'jpeg', jpegQuality: 88, scale: 0.5, browserExecutable });
  process.stdout.write(`${f} `);
}
const list = frames.map((f) => `${out}/f${String(f).padStart(3, '0')}.jpg`).join(' ');
execSync(`ffmpeg -y -v error -i ${list.split(' ').join(' -i ')} -filter_complex "${frames.map((_, i) => `[${i}:v]scale=270:480,drawtext=text='${frames[i]}':x=8:y=8:fontsize=22:fontcolor=white:box=1:boxcolor=black@0.5[v${i}]`).join(';')};${frames.map((_, i) => `[v${i}]`).join('')}xstack=inputs=${frames.length}:layout=${frames.map((_, i) => `${(i % 6) * 270}_${Math.floor(i / 6) * 480}`).join('|')}" ${out}/sheet.jpg`);
console.log('\nsheet done');

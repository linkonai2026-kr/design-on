#!/usr/bin/env node
// 생성된 HTML을 Impeccable 안티패턴 디텍터로 검사하는 래퍼. designon STEP 4에서 호출한다.

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DETECTOR = path.join(ROOT, 'vendor', 'impeccable', 'scripts', 'detect.mjs');
const DEPS = path.join(ROOT, 'vendor', 'impeccable', 'node_modules', 'htmlparser2');

const target = process.argv[2] || 'site/';

if (!fs.existsSync(DETECTOR)) {
  console.error('디텍터를 찾을 수 없습니다: ' + DETECTOR);
  console.error('저장소가 온전한지 확인하거나 scripts/setup.sh를 다시 실행하세요.');
  process.exit(2);
}

const full = fs.existsSync(DEPS);
if (!full) {
  console.error('[designon] 축소 모드로 검사합니다 — HTML/CSS 캐스케이드 엔진이 꺼져 있습니다.');
  console.error('[designon] 전체 검사를 켜려면: npm install --prefix vendor/impeccable');
  console.error('');
}

const child = spawn(process.execPath, [DETECTOR, target, ...process.argv.slice(3)], {
  stdio: 'inherit',
});

child.on('exit', (code) => {
  if (!full) {
    console.error('');
    console.error('[designon] 축소 모드 결과입니다. 대비·중첩카드·크림배경·헤딩건너뜀 등은 검사되지 않았습니다.');
  }
  process.exit(code ?? 0);
});

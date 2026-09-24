// @ts-check
// STEP 1 질문용 팔레트 미리보기 HTML. --preview로 만든다.

import fs from 'node:fs';
import path from 'node:path';
import { CliError } from './cli.mjs';

/** @param {unknown} s */
function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// hex는 이미 정규식으로 검증된 색상값만 style에 넣는다. 검증 실패 시 무해한 기본값으로 대체한다.
/** @param {unknown} hex */
function safeHex(hex) {
  return /^#[0-9a-f]{6}$/i.test(String(hex ?? '')) ? hex : '#808080';
}

/**
 * --preview 인자를 파일 경로로 바꾼다. 프로세스 cwd 밖으로 쓰지 못하게 막는다.
 * @param {string} file
 */
export function resolvePreviewPath(file) {
  const target = path.resolve(process.cwd(), file);
  const base = process.cwd() + path.sep;
  if (target !== process.cwd() && !target.startsWith(base)) {
    throw new CliError(`--preview 경로는 현재 폴더(${process.cwd()}) 밖을 가리킬 수 없다: ${file}`);
  }
  return target;
}

// 질문용 미리보기 HTML 파일. 사용자가 브라우저에서 색을 직접 본다.
/**
 * @param {any[]} items
 * @param {string} file
 */
export function writePalettePreview(items, file = 'design-on-palette-preview.html') {
  const rows = items.map((it, i) => {
    const swatches = (it.hex ?? []).map(
      (h) => `<span class="sw" style="background:${safeHex(h)}"><i>${escapeHtml(h)}</i></span>`).join('');
    return `<section class="row">
      <div class="idx">${String.fromCharCode(65 + i)}</div>
      <div class="meta">
        <h2>${escapeHtml(it.name)}</h2>
        <p>${escapeHtml(it.tone ?? '')}</p>
        <p class="ind">${escapeHtml(it.industry ?? '')}</p>
      </div>
      <div class="swatches">${swatches}</div>
    </section>`;
  }).join('\n');
  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>design-on 팔레트 후보</title>
<style>
  body{font-family:'Pretendard',system-ui,sans-serif;background:#141414;color:#f2f2f2;margin:0;padding:32px}
  h1{font-size:20px;margin:0 0 8px}
  .sub{color:#999;font-size:13px;margin:0 0 28px}
  .row{display:flex;gap:24px;align-items:stretch;padding:18px;border:1px solid #2c2c2c;border-radius:14px;margin-bottom:16px;background:#1c1c1c}
  .idx{font-size:22px;font-weight:800;width:40px;flex-shrink:0;color:#ff8a3d}
  .meta{flex:1}
  .meta h2{margin:0 0 6px;font-size:16px}
  .meta p{margin:2px 0;font-size:13px;color:#bbb}
  .meta .ind{color:#7fd0a8}
  .swatches{display:flex;flex-direction:column;gap:4px;min-width:120px}
  .sw{height:34px;border-radius:8px;border:1px solid rgba(255,255,255,.18);position:relative}
  .sw i{position:absolute;right:8px;bottom:4px;font-size:10px;font-style:normal;color:#fff;text-shadow:0 1px 2px rgba(0,0,0,.8)}
  @media(prefers-color-scheme:light){body{background:#f7f7f7;color:#111}.row{background:#fff;border-color:#e3e3e3}.meta p{color:#555}.sub{color:#777}}
</style>
</head>
<body>
  <h1>어울리는 배색 후보 ${items.length}개</h1>
  <p class="sub">STEP 1 질문에서 "A·B·C…" 글자로 답하면 됩니다. 색은 이 미리보기에서 직접 확인하세요.</p>
  ${rows}
</body>
</html>`;
  const target = resolvePreviewPath(file);
  fs.writeFileSync(target, html, 'utf8');
  return target;
}

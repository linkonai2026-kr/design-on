#!/usr/bin/env node
// 내장 데이터에서 필요한 것만 뽑아 주는 조회 CLI. JSON 통째 읽기를 대체해 토큰을 아낀다.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { exec } from 'node:child_process';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA = path.join(ROOT, 'data');

const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8'));

// --- 인자 파싱 -------------------------------------------------------------
const [, , cmd, ...rest] = process.argv;
const opt = {};
const free = [];
for (let i = 0; i < rest.length; i++) {
  if (rest[i].startsWith('--')) {
    const next = rest[i + 1];
    // --auto-fix 같은 하이픈 플래그는 autoFix로 저장해 코드에서 camelCase로 읽는다.
    const key = rest[i].slice(2).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    opt[key] = next && !next.startsWith('--') ? rest[++i] : true;
  } else free.push(rest[i]);
}
const limit = Number(opt.limit ?? 3);
const q = (opt.q ?? free.join(' ')).toLowerCase();
// 팔레트 후보는 질문용으로 기본 6개까지 보여준다. 일반 사용자는 HEX만으로 색을 못 알아본다.
const limitDefault = (cmd === 'palettes' || cmd === 'palette') ? Number(opt.limit ?? 6) : limit;

const norm = (s) => String(s ?? '').toLowerCase();
const has = (hay, needle) => norm(hay).includes(norm(needle));

// --- 시각화 헬퍼 ------------------------------------------------------------
// JSON 출력에 ANSI 이스케이프를 넣으면 파싱이 깨진다(제어문자).
// 터미널/JSON 모두 안전한 유니코드 블록(■)으로 팔레트 모양을 표현하고,
// 실제 색은 --preview 로 만드는 HTML 미리보기 파일에서 본다.
const ESC = '\\x1b';
function swatchBar(hexes) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hexes?.[0] ?? '').trim());
  const tone = m
    ? ((parseInt(m[1].slice(0, 2), 16) + parseInt(m[1].slice(2, 4), 16) + parseInt(m[1].slice(4, 6), 16)) / 3 > 150
        ? 'dark' : 'light')
    : '';
  // 실제 색 블록(■) 4개 + HEX 나열. 색 자체는 터미널 지원에 따라 블록 밝기만 암시한다.
  return (hexes ?? []).slice(0, 4).map((h) => `■`).join(' ');
}

// 질문용 미리보기 HTML 파일. 사용자가 브라우저에서 색을 직접 본다.
function writePalettePreview(items, file = 'design-on-palette-preview.html') {
  const rows = items.map((it, i) => {
    const swatches = (it.hex ?? []).map(
      (h) => `<span class="sw" style="background:${h}"><i>${h}</i></span>`).join('');
    return `<section class="row">
      <div class="idx">${String.fromCharCode(65 + i)}</div>
      <div class="meta">
        <h2>${it.name}</h2>
        <p>${it.tone ?? ''}</p>
        <p class="ind">${it.industry ?? ''}</p>
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
  const target = path.resolve(process.cwd(), file);
  fs.writeFileSync(target, html, 'utf8');
  return target;
}

function openPreview(file) {
  const cmd = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open';
  exec(`"${cmd}" "${file}"`, () => {});
}

// 색 계열 한국어·영어 동의어. "보라색" 한 마디로 퍼플·라벤더·플럼까지 잡는다.
const HUES = {
  purple: ['purple', '퍼플', '보라', '자주', 'violet', 'plum', '플럼', 'orchid', '오키드',
           'amethyst', '자수정', 'lilac', '라일락', 'lavender', '라벤더', 'mauve'],
  blue:   ['blue', '블루', '파랑', '파란', 'navy', '네이비', 'azure', 'cobalt', '코발트',
           'indigo', '인디고', 'teal', '틸', 'cyan', 'sky', '하늘'],
  green:  ['green', '그린', '초록', '녹색', 'olive', '올리브', 'sage', '세이지', 'mint', '민트',
           'emerald', '에메랄드', 'forest', 'moss'],
  red:    ['red', '레드', '빨강', '빨간', 'crimson', '크림슨', 'scarlet', 'ruby', 'cherry', '체리'],
  pink:   ['pink', '핑크', '분홍', 'rose', '로즈', 'blush', 'magenta', 'coral', '코랄'],
  orange: ['orange', '오렌지', '주황', 'amber', '앰버', 'peach', '피치', 'apricot', 'tangerine'],
  yellow: ['yellow', '옐로', '노랑', '노란', 'gold', '골드', 'mustard', '머스터드', 'butter'],
  brown:  ['brown', '브라운', '갈색', '흙', 'earth', 'sand', '샌드', 'clay', 'coffee', '커피',
           'sandalwood', 'champagne', 'terracotta', '테라코타', 'beige', '베이지'],
  neutral:['gray', 'grey', '그레이', '회색', 'mono', '모노', 'black', '블랙', 'white', '화이트',
           'charcoal', '차콜', 'slate'],
};

function hueWords(name) {
  if (!name) return null;
  const k = norm(name);
  for (const [hue, words] of Object.entries(HUES)) {
    if (hue === k || words.some((w) => norm(w) === k)) return words;
  }
  return [k];
}

// 밝기(0~1). 배경/본문 역할을 나눌 때 쓴다.
function lum(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex).trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

function contrast(a, b) {
  const [l1, l2] = [lum(a), lum(b)];
  if (l1 == null || l2 == null) return null;
  return +(((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)).toFixed(2));
}

// --- 색 보정 유틸리티 (--auto-fix) ------------------------------------------
function hexRgb(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex).trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
function rgbHex({ r, g, b }) {
  const c = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`.toUpperCase();
}
// 두 색을 t(0~1) 비율로 섞는다. t=1이면 두 번째 색에 가깝다.
function mixHex(a, b, t) {
  const ca = hexRgb(a), cb = hexRgb(b);
  if (!ca || !cb) return a;
  return rgbHex({
    r: ca.r + (cb.r - ca.r) * t,
    g: ca.g + (cb.g - ca.g) * t,
    b: ca.b + (cb.b - ca.b) * t,
  });
}
// 'color'를 배경 bg에 대해 대비 target 이상이 되도록 흰색/검정 쪽으로 밀어낸다.
function pushContrast(color, bg, target = 4.5, light) {
  const ref = light ? '#FFFFFF' : '#000000';
  let cur = color;
  for (let t = 0.05; t <= 1.0; t += 0.05) {
    cur = mixHex(color, ref, t);
    if (contrast(cur, bg) >= target) break;
  }
  return { hex: cur, ratio: contrast(cur, bg) };
}
// 팔레트의 bg/ink/surface가 주어졌을 때 ink/muted/accent를 대비 4.5:1까지 보정한다.
// 원칙: 텍스트 색은 배경과 반대 명도 쪽으로 민다. '밝은 배경'의 기준은 명도 0.5가 아니라
// '배경이 ink보다 밝은가'다. 중간 명도 배경(#C29B72 등)은 절대값 기준으로 오판한다.
function autoFixRoles(withL, bg, ink) {
  const lightBg = lum(bg) > lum(ink);
  const darken = (hex, target) => pushContrast(hex, bg, target, false);   // 검정 쪽
  const lighten = (hex, target) => pushContrast(hex, bg, target, true);   // 흰 쪽
  const toward = (hex, target) => lightBg ? darken(hex, target) : lighten(hex, target);

  // ink: 배경 대비 4.5:1. 배경이 밝으면 어둡게, 어두우면 밝게.
  const inkFixed = contrast(ink, bg) >= 4.5
    ? { hex: ink, ratio: contrast(ink, bg) }
    : toward(ink, 4.5);

  // muted: 4.5:1 이상인 원색 후보가 있으면 그것을, 없으면 ink와 bg 중간색을 배경 반대 방향으로 밀어 생성.
  const mutedCand = withL.filter((x) => x.h !== ink && x.h !== bg && contrast(x.h, bg) >= 4.5);
  let muted;
  if (mutedCand.length) {
    muted = { hex: mutedCand[0].h, ratio: contrast(mutedCand[0].h, bg) };
  } else {
    const mid = mixHex(ink, bg, 0.5);
    muted = contrast(mid, bg) >= 4.5
      ? { hex: mid, ratio: contrast(mid, bg) }
      : toward(mid, 4.5);
  }

  // accent: 대비가 가장 큰 비잉크 색. 미달이면 배경 반대 방향으로 밀어 4.5:1 확보.
  const accentCand = withL.filter((x) => x.h !== ink && x.h !== bg)
    .sort((a, b) => contrast(b.h, bg) - contrast(a.h, bg));
  let accent = accentCand[0]?.h ?? ink;
  if (contrast(accent, bg) < 4.5) {
    accent = toward(mixHex(accent, ink, 0.5), 4.5).hex;
  }

  return {
    roles: { bg, surface: withL[1]?.h ?? bg, ink: inkFixed.hex, accent, muted: muted.hex },
    contrast: {
      'ink/bg': inkFixed.ratio,
      'accent/bg': contrast(accent, bg),
      'muted/bg': muted.ratio,
    },
  };
}

// --- palettes --------------------------------------------------------------
function palettes() {
  const all = read('palettes.json');
  const words = hueWords(opt.hue);
  let list = all.filter((p) => (p.hex ?? []).length >= 3);

  // 색은 하드 필터다. 보라를 달라는데 복숭아색을 주면 안 된다.
  // 업종은 랭킹 신호일 뿐이다. 필터로 걸면 "보라 + 카페"처럼 교집합이 비어 0건이 된다.
  if (words) {
    const byName = list.filter((p) => words.some((w) => has(p.name, w)));
    const byTone = list.filter((p) => words.some((w) => has(p.tone, w)));
    // 이름에 색이 든 세트가 있으면 그쪽이 진짜다. 톤 설명에 한 번 스친 것은 후순위로 민다.
    list = byName.length >= limit ? byName : [...byName, ...byTone.filter((p) => !byName.includes(p))];
  }
  if (q) list = list.filter((p) => has(p.name, q) || has(p.tone, q) || has(p.industry, q));

  // 랭킹. 색 일치가 먼저다. 이름에 든 색이 톤 설명에 스친 색보다 강하다.
  // 그다음이 명도 폭 — 배경·본문·액센트를 다 뽑을 수 있어야 페이지가 만들어진다.
  const scored = list.map((p) => {
    const ls = p.hex.map(lum).filter((x) => x != null);
    const spread = ls.length ? Math.max(...ls) - Math.min(...ls) : 0;
    let hueScore = 0;
    if (words) {
      if (words.some((w) => has(p.name, w))) hueScore = 2;
      else if (words.some((w) => has(p.tone, w))) hueScore = 1;
    }
    const indScore = opt.industry && has(p.industry, opt.industry) ? 1 : 0;
    return { p, spread, hueScore, indScore, n: p.hex.length };
  }).sort((a, b) =>
    b.hueScore - a.hueScore || b.indScore - a.indScore || b.spread - a.spread || b.n - a.n);

  const picked = scored.slice(0, limitDefault).map(({ p }) => {
    const withL = p.hex.map((h) => ({ h, l: lum(h) })).filter((x) => x.l != null).sort((a, b) => b.l - a.l);
    const bg = withL[0]?.h;
    const ink = withL[withL.length - 1]?.h;
    const surface = withL[1]?.h ?? bg;
    // muted는 본문 보조색이다. 배경 대비 4.5:1을 넘는 것 중 가장 밝은 것을 고른다.
    // 넘는 게 없으면 null로 두고 STEP 2에서 직접 만들라고 알린다.
    const mutedCand = withL.slice(1).filter((x) => x.h !== ink && contrast(x.h, bg) >= 4.5);
    const muted = mutedCand[0]?.h ?? null;
    // 액센트는 배경 대비가 가장 큰 비(非)잉크 색. 4.5 미만이면 버튼 배경으로 쓰면 안 된다.
    const accentCand = withL.slice(1, -1).sort((a, b) => contrast(b.h, bg) - contrast(a.h, bg));
    const accent = accentCand[0]?.h ?? ink;
    const base = {
      name: p.name, tone: p.tone, industry: p.industry, hex: p.hex,
      roles: { bg, surface, ink, accent, muted },
      contrast: {
        'ink/bg': contrast(ink, bg),
        'accent/bg': contrast(accent, bg),
        'muted/bg': muted ? contrast(muted, bg) : null,
      },
      warn: [
        // 본문/배경 대비가 제일 중요한데 예전에는 이걸 경고하지 않았다.
        // DB 68세트 중 17세트가 여기서 미달인데 조용히 통과시키고 있었다.
        contrast(ink, bg) < 4.5
          ? `본문 대비가 ${contrast(ink, bg)}:1로 4.5:1에 못 미친다. ink를 더 어둡게 만들어 쓰거나 다른 팔레트를 골라라. 그대로 쓰면 low-contrast로 잡힌다.`
          : null,
        muted ? null : 'muted 후보가 4.5:1을 못 넘는다. ink를 20~30% 밝힌 색을 직접 만들어라.',
        contrast(accent, bg) < 4.5 ? 'accent가 4.5:1 미만이다. 버튼 배경으로 쓰지 말고 ink 배경을 써라.' : null,
      ].filter(Boolean),
      note: p.note || undefined,
    };
    // --auto-fix: 대비 미달 색을 자동 보정한다. 에이전트는 fixedRoles를 실제로 쓴다.
    if (opt.autoFix && base.warn.length) {
      const fix = autoFixRoles(withL, bg, ink);
      return { ...base, roles: fix.roles, contrast: fix.contrast, fixed: true };
    }
    return base;
  });

  // 기본 응답에 시각화를 얹는다. HEX만으로는 일반 사용자가 색을 못 알아본다.
  const result = picked.map((it, i) => ({
    ...it,
    label: `선택지 ${String.fromCharCode(65 + i)}`,
    swatches: swatchBar(it.hex),      // 터미널/JSON 안전한 팔레트 블록 표현
  }));

  // --preview 를 주면 브라우저용 미리보기 HTML을 만들어 경로를 함께 돌려준다.
  if (opt.preview) {
    const file = writePalettePreview(result, opt.preview === true ? 'design-on-palette-preview.html' : opt.preview);
    return { previewFile: file, palettes: result };
  }
  return result;
}

// --- tools -----------------------------------------------------------------
function tools() {
  const all = read('tools.json');
  let list = all;
  if (opt.section) list = list.filter((t) => has(t.section, opt.section));
  if (opt.industry) list = list.filter((t) => has(t.industry, opt.industry));
  if (opt.free) list = list.filter((t) => has(t.pricing, '무료'));
  if (q) list = list.filter((t) => has(t.name, q) || has(t.category, q) || has(t.tone, q) || has(t.section, q));
  list = [...list].sort((a, b) => (b.seen ?? 0) - (a.seen ?? 0));
  return list.slice(0, limit).map((t) => ({
    name: t.name, pricing: t.pricing, category: t.category, url: t.url, seen: t.seen,
  }));
}

// --- sections (툴 섹션 목록만) ---------------------------------------------
function sections() {
  const all = read('tools.json');
  const c = {};
  for (const t of all) c[t.section] = (c[t.section] ?? 0) + 1;
  return Object.entries(c).sort((a, b) => b[1] - a[1]).map(([section, count]) => ({ section, count }));
}

// --- presets (업종별 표준 아트 디렉션) --------------------------------------
function presets() {
  const all = read('presets.json');
  let list = all.presets;
  if (opt.industry || q) {
    const key = opt.industry || q;
    list = list.filter((p) =>
      has(p.업종, key) || p.keywords.some((k) => has(k, key)) || has(key, p.업종));
  }
  if (list.length > 1) {
    // 키워드 일치도가 높은 순으로 정렬
    const key = (opt.industry || q || '').toLowerCase();
    list = [...list].sort((a, b) => {
      const sa = key ? a.keywords.filter((k) => has(k, key)).length : 0;
      const sb = key ? b.keywords.filter((k) => has(k, key)).length : 0;
      return sb - sa;
    });
  }
  const picked = list.slice(0, 1);
  const p = picked[0];
  if (!p) return { error: `"${opt.industry || q}"에 맞는 업종 프리셋이 없다.`, available: all.presets.map((x) => x.업종) };
  return {
    업종: p.업종, defaultLayout: p.defaultLayout, mode: p.mode, dial: p.dial,
    moodOptions: p.moodOptions, primaryGoal: p.primaryGoal,
    visitorQuestions: p.visitorQuestions, ownOnly: p.ownOnly, infoItems: p.infoItems,
    next: '이 프리셋을 아트 디렉션 카드의 출발점으로 삼는다. 구조는 이 가게가 가진 자산으로 다시 고를 수 있다.',
  };
}

// --- fonts -----------------------------------------------------------------
function fonts() {
  const all = read('fonts.json');
  let list = all.pairings;
  if (opt.mood) list = list.filter((f) => has(f.mood, opt.mood) || (f.industry ?? []).some((i) => has(i, opt.mood)));
  if (opt.industry) list = list.filter((f) => (f.industry ?? []).some((i) => has(i, opt.industry)) || has(f.mood, opt.industry));
  if (opt.lang) list = list.filter((f) => f.lang === opt.lang);
  if (q) list = list.filter((f) => has(f.mood, q) || has(f.display, q) || (f.industry ?? []).some((i) => has(i, q)));
  if (!list.length) list = all.pairings.filter((f) => f.lang === (opt.lang ?? 'ko'));
  return {
    pairings: list.slice(0, limit),
    howToLoad: all.howToLoad,
    avoid: all.avoid,
    // 라틴 서체가 전부 Fontshare 한 곳에서 온다. 막히면 숫자·영문이 통째로 무너지므로 폴백을 같이 준다.
    latinFallback: all.latinFallback,
  };
}

// --- photo ------------------------------------------------------------------
function photo() {
  const all = read('photo-recipes.json');
  const key = opt.industry ?? q;
  let hit = key ? all.recipes.find((r) => has(r.industry, key) || key.split(/[·,\s]+/).some((k) => k && has(r.industry, k))) : null;
  const matched = Boolean(hit);
  if (!hit) hit = all.recipes.find((r) => has(r.industry, '카페'));
  const asm = (b) => [b.subject, b.light, all.universal.camera, `${b.mood}, {PALETTE} tones`, all.universal.negative]
    .filter(Boolean).join('. ') + '.';
  return {
    industry: hit.industry,
    matched,
    fallbackNote: matched ? undefined : `"${key}"에 맞는 레시피가 없다. 카페 레시피로 폴백했으니 subject를 업종에 맞게 직접 바꿔라.`,
    prompts: {
      hero: asm(hit.hero),
      detail: hit.detail.map(asm),
      space: asm(hit.space),
    },
    // C-3 실사 스톡: 검색 키워드 + 검증된 URL 후보. 생성이 안 되는 환경에서 바로 쓴다.
    stock: hit.stock ?? null,
    replace: '{PALETTE}를 STEP 2에서 고른 팔레트 색 이름으로 바꿔라. 예: muted plum and warm cream',
    rules: all.universal.rules,
    note: hit.note,
  };
}

// --- layouts ----------------------------------------------------------------
// 업종이 아니라 '이 가게가 가진 자산'이 구조를 정한다.
// --id 없이 부르면 요약만 준다. 하나를 고른 뒤에 --id로 전체 사양을 받는다.
function layouts() {
  const all = read('layouts.json');
  const list = all.architectures;

  const id = opt.id ?? (free.length === 1 ? free[0] : null);
  if (id) {
    const hit = list.find((a) => a.id === id || has(a.name, id));
    if (!hit) {
      return { error: `"${id}"에 해당하는 아키텍처가 없다.`, available: list.map((a) => a.id) };
    }
    return { architecture: hit, keepRegardless: all.universal.keepRegardless, note: all.universal.note };
  }

  // --asset으로 좁힌다. 자산 표현이 정확히 안 맞아도 부분 일치로 잡는다.
  let ids = null;
  if (opt.asset) {
    const map = all.howToChoose.assetMap;
    const key = Object.keys(map).find((k) => has(k, opt.asset) || has(opt.asset, k));
    if (key) ids = map[key];
  }
  const picked = ids ? list.filter((a) => ids.includes(a.id)) : list;

  return {
    howToChoose: all.howToChoose.question,
    rule: all.howToChoose.rule,
    mustJustify: all.howToChoose.forbidden,
    assetMap: opt.asset ? undefined : all.howToChoose.assetMap,
    candidates: picked.map((a) => ({
      id: a.id, name: a.name, oneLine: a.oneLine,
      fitsWhen: a.fitsWhen, doNotPickWhen: a.doNotPickWhen,
    })),
    next: '고른 뒤 `pick.mjs layouts --id <id>`로 치수·그리드·시그니처 전체를 받아라.',
  };
}

// --- premium (프리미엄 자동 모드) -------------------------------------------
// 사용자 브리프를 스캔해 레벨(off/basic/full)을 정하고, 인터랙티브 모티프의
// CSS/JS/사용조건/포니테일 노트를 준다. --match "<브리프>" 또는 --id <모티프>.
function premium() {
  const all = read('premium.json');
  const match = opt.match ?? (free.length ? free.join(' ') : null);

  // 1) --match: 브리프를 트리거 사전으로 스캔한다
  if (opt.match || (free.length && !opt.id)) {
    const brief = (match || '').toLowerCase();
    const hit = { full: [], basic: [] };
    for (const [level, words] of Object.entries(all.triggers.levels)) {
      for (const w of words) {
        if (brief.includes(w.toLowerCase())) hit[level].push(w);
      }
    }
    const level = hit.full.length ? 'full' : hit.basic.length ? 'basic' : 'off';
    return {
      level,
      matchedFull: hit.full,
      matchedBasic: hit.basic,
      motifs: level === 'off' ? [] : all.motifs.map((m) => m.id),
      rules: level === 'off' ? [] : all.rules,
      note: level === 'off'
        ? '프리미엄 트리거가 없다. 요청이 "알아서 해줘"면 basic으로 간다.'
        : '프리미엄 모드. STEP 2-6-2를 보고 모티프를 골라 조합한다. 레퍼런스는 베끼지 않는다.',
    };
  }

  // 2) --id: 모티프 하나의 전체 사양
  if (opt.id) {
    const hit = all.motifs.find((m) => m.id === opt.id);
    if (!hit) return { error: `"${opt.id}"에 해당하는 모티프가 없다.`, available: all.motifs.map((m) => m.id) };
    return { motif: hit, rules: all.rules };
  }

  // 3) 기본: 전체 목록
  return {
    levels: all.triggers.levels,
    rules: all.rules,
    motifs: all.motifs.map((m) => ({ id: m.id, name: m.name, useWhen: m.useWhen })),
    next: '하나를 고른 뒤 `pick.mjs premium --id <id>`로 CSS/JS/포니테일 노트를 받아라.',
  };
}

// --- 실행 ------------------------------------------------------------------
const TABLE = {
  palettes, palette: palettes, tools, tool: tools, sections,
  fonts, font: fonts, photo, photos: photo, layouts, layout: layouts,
  presets, preset: presets, premium,
};

if (!cmd || !TABLE[cmd]) {
  console.error(`design-on pick — 내장 데이터에서 필요한 것만 뽑는다

  node scripts/pick.mjs layouts  [--asset 목록과 가격이 핵심]
  node scripts/pick.mjs layouts  --id index-first
  node scripts/pick.mjs palettes --hue 보라 --industry 카페 [--preview] [--auto-fix] [--limit 6]
  node scripts/pick.mjs presets  --industry 카페
  node scripts/pick.mjs premium  --match "고급스럽게 인터랙티브하게"
  node scripts/pick.mjs premium  --id scroll-reveal
  node scripts/pick.mjs fonts    --mood 따뜻함 --lang ko [--limit 3]
  node scripts/pick.mjs photo    --industry 카페
  node scripts/pick.mjs tools    --section 색상 [--free] [--limit 8]
  node scripts/pick.mjs sections

--preview: 브라우저에서 열리는 팔레트 미리보기 HTML을 만든다(design-on-palette-preview.html).
--auto-fix: 대비 미달인 ink/muted/accent를 자동 보정해 항상 4.5:1 이상을 보장한다.
--match: 브리프를 프리미엄 트리거 사전으로 스캔해 레벨(off/basic/full)을 판정한다.
기본 팔레트 후보는 6개까지 뽑는다. HEX만으로는 일반 사용자가 색을 못 알아본다.

JSON 전체를 읽지 마라. tools.json은 262KB(약 87,000 토큰)다.
이 명령은 같은 답을 수백 토큰으로 준다.`);
  process.exit(cmd ? 1 : 0);
}

console.log(JSON.stringify(TABLE[cmd](), null, 2));

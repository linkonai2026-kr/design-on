#!/usr/bin/env node
// 내장 데이터에서 필요한 것만 뽑아 주는 조회 CLI. JSON 통째 읽기를 대체해 토큰을 아낀다.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA = path.join(ROOT, 'data');

const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8'));

// --- 인자 파싱 -------------------------------------------------------------
const [, , cmd, ...rest] = process.argv;
const opt = {};
const free = [];
for (let i = 0; i < rest.length; i++) {
  if (rest[i].startsWith('--')) opt[rest[i].slice(2)] = rest[i + 1]?.startsWith('--') ? true : rest[++i];
  else free.push(rest[i]);
}
const limit = Number(opt.limit ?? 3);
const q = (opt.q ?? free.join(' ')).toLowerCase();

const norm = (s) => String(s ?? '').toLowerCase();
const has = (hay, needle) => norm(hay).includes(norm(needle));

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

  return scored.slice(0, limit).map(({ p }) => {
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
    return {
      name: p.name, tone: p.tone, industry: p.industry, hex: p.hex,
      roles: { bg, surface, ink, accent, muted },
      contrast: {
        'ink/bg': contrast(ink, bg),
        'accent/bg': contrast(accent, bg),
        'muted/bg': muted ? contrast(muted, bg) : null,
      },
      warn: [
        muted ? null : 'muted 후보가 4.5:1을 못 넘는다. ink를 20~30% 밝힌 색을 직접 만들어라.',
        contrast(accent, bg) < 4.5 ? 'accent가 4.5:1 미만이다. 버튼 배경으로 쓰지 말고 ink 배경을 써라.' : null,
      ].filter(Boolean),
      note: p.note || undefined,
    };
  });
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

// --- fonts -----------------------------------------------------------------
function fonts() {
  const all = read('fonts.json');
  let list = all.pairings;
  if (opt.mood) list = list.filter((f) => has(f.mood, opt.mood) || (f.industry ?? []).some((i) => has(i, opt.mood)));
  if (opt.industry) list = list.filter((f) => (f.industry ?? []).some((i) => has(i, opt.industry)) || has(f.mood, opt.industry));
  if (opt.lang) list = list.filter((f) => f.lang === opt.lang);
  if (q) list = list.filter((f) => has(f.mood, q) || has(f.display, q) || (f.industry ?? []).some((i) => has(i, q)));
  if (!list.length) list = all.pairings.filter((f) => f.lang === (opt.lang ?? 'ko'));
  return { pairings: list.slice(0, limit), howToLoad: all.howToLoad, avoid: all.avoid };
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

// --- 실행 ------------------------------------------------------------------
const TABLE = {
  palettes, palette: palettes, tools, tool: tools, sections,
  fonts, font: fonts, photo, photos: photo, layouts, layout: layouts,
};

if (!cmd || !TABLE[cmd]) {
  console.error(`design-on pick — 내장 데이터에서 필요한 것만 뽑는다

  node scripts/pick.mjs layouts  [--asset 목록과 가격이 핵심]
  node scripts/pick.mjs layouts  --id index-first
  node scripts/pick.mjs palettes --hue 보라 --industry 카페 [--limit 3]
  node scripts/pick.mjs fonts    --mood 따뜻함 --lang ko [--limit 3]
  node scripts/pick.mjs photo    --industry 카페
  node scripts/pick.mjs tools    --section 색상 [--free] [--limit 8]
  node scripts/pick.mjs sections

JSON 전체를 읽지 마라. tools.json은 262KB(약 87,000 토큰)다.
이 명령은 같은 답을 수백 토큰으로 준다.`);
  process.exit(cmd ? 1 : 0);
}

console.log(JSON.stringify(TABLE[cmd](), null, 2));

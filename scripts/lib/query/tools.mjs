// @ts-check
// pick.mjs tools/sections — 디자인 툴 디렉터리 조회.

import { readData } from '../data.mjs';
import { has } from '../text.mjs';

/**
 * @param {{section?:string, industry?:string, free?:boolean}} opt
 * @param {{q:string, limit:number}} ctx
 */
export function tools(opt, { q, limit }) {
  const all = readData('tools.json');
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

// 조회 실패 시 힌트로 보여줄 섹션 이름 목록. tools()가 0건일 때 CLI가 이걸 참조한다.
export function toolSections() {
  const all = readData('tools.json');
  const c = {};
  for (const t of all) c[t.section] = (c[t.section] ?? 0) + 1;
  return Object.entries(c).sort((a, b) => b[1] - a[1]).map(([section, count]) => ({ section, count }));
}

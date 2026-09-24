// @ts-check
// pick.mjs fonts — 서체 페어링 조회. 라틴 폴백을 항상 함께 준다.

import { readData } from '../data.mjs';
import { has } from '../text.mjs';

/**
 * @param {{mood?:string, industry?:string, lang?:string}} opt
 * @param {{q:string, limit:number}} ctx
 */
export function fonts(opt, { q, limit }) {
  const all = readData('fonts.json');
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

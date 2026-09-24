// @ts-check
// pick.mjs presets — 업종별 표준 아트 디렉션 카드.

import { readData } from '../data.mjs';
import { has } from '../text.mjs';

/**
 * @param {{industry?:string}} opt
 * @param {{q:string}} ctx
 */
export function presets(opt, { q }) {
  const all = readData('presets.json');
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

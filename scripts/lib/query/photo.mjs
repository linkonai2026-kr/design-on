// @ts-check
// pick.mjs photo — 업종별 사진 프롬프트 + 실사 스톡 검색 URL.

import { readData } from '../data.mjs';
import { has } from '../text.mjs';

/**
 * @param {{industry?:string}} opt
 * @param {{q:string}} ctx
 */
export function photo(opt, { q }) {
  const all = readData('photo-recipes.json');
  const key = opt.industry ?? q;
  let hit = key ? all.recipes.find((r) => has(r.industry, key) || key.split(/[·,\s]+/).some((k) => k && has(r.industry, k))) : null;
  const matched = Boolean(hit);
  if (!hit) hit = all.recipes.find((r) => has(r.industry, '카페'));
  const asm = (b) => [b.subject, b.light, all.universal.camera, `${b.mood}, {PALETTE} tones`, all.universal.negative]
    .filter(Boolean).join('. ') + '.';

  // 실사 스톡 검색 URL을 사진 사이트별로 만든다. 검색 키워드를 그대로 쿼리로 쓴다.
  const stock = hit.stock ?? { search: [], fallbacks: [] };
  const searchQueries = stock.search.length ? stock.search : stock.fallbacks.slice(0, 2);
  const photoSites = (all.universal.photoSites ?? []).map((s) => ({
    name: s.name,
    imageHost: s.imageHost,
    note: s.note,
    queries: searchQueries.map((query) => s.url.replace('{QUERY}', encodeURIComponent(query))),
  }));

  return {
    industry: hit.industry,
    matched,
    fallbackNote: matched ? undefined : `"${key}"에 맞는 레시피가 없다. 카페 레시피로 폴백했으니 subject를 업종에 맞게 직접 바꿔라.`,
    prompts: {
      hero: asm(hit.hero),
      detail: hit.detail.map(asm),
      space: asm(hit.space),
    },
    // C-3 실사 스톡: 검색 키워드 + 검증된 URL 후보 + 사진 사이트별 검색 URL.
    stock,
    photoSites,
    replace: '{PALETTE}를 STEP 2에서 고른 팔레트 색 이름으로 바꿔라. 예: muted plum and warm cream',
    rules: all.universal.rules,
    note: hit.note,
  };
}

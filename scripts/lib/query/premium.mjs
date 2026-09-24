// @ts-check
// pick.mjs premium — 프리미엄 자동 모드. 브리프를 스캔해 레벨을 정하고, 인터랙티브
// 모티프의 CSS/JS/사용조건/포니테일 노트를 준다. --match "<브리프>" / --id <모티프> / --archetype <이름>.

import { readData } from '../data.mjs';
import { has } from '../text.mjs';

/**
 * @param {{match?:string, id?:string, archetype?:string}} opt
 * @param {{free:string[]}} ctx
 */
export function premium(opt, { free }) {
  const all = readData('premium.json');
  // --match 다음 값은 첫 단어만 opt.match가 되고 나머지는 free로 온다. 둘을 이어 붙인다.
  const match = [opt.match, ...free].filter(Boolean).join(' ') || null;
  // _comment 같은 메타 키를 제외한 아키타입만 대상으로 삼는다
  const archIds = Object.keys(all.archetypes ?? {}).filter((k) => !k.startsWith('_'));
  const archetypes = Object.fromEntries(archIds.map((k) => [k, all.archetypes[k]]));

  // 0) --archetype: 비주얼 아키타입 하나의 전체 사양
  if (opt.archetype) {
    const key = Object.keys(archetypes).find(
      (k) => k === opt.archetype || has(archetypes[k].name, opt.archetype));
    if (!key) {
      return { error: `"${opt.archetype}"에 해당하는 아키타입이 없다.`, available: Object.keys(archetypes) };
    }
    return { archetype: { id: key, ...archetypes[key] }, rules: all.rules };
  }

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
    // 업종 단어로 어울리는 아키타입을 추천한다 (코퍼레이트→corporate-trust, 테크→neon-modern 등)
    const archKey = Object.keys(archetypes).find((k) =>
      [...(archetypes[k].industry || '').split('·'), archetypes[k].name]
        .some((w) => has(w, brief) || has(brief, w)));
    return {
      level,
      matchedFull: hit.full,
      matchedBasic: hit.basic,
      archetype: archKey ? { id: archKey, name: archetypes[archKey].name, motifs: archetypes[archKey].motifs } : null,
      motifs: level === 'off' ? [] : all.motifs.map((m) => m.id),
      rules: level === 'off' ? [] : all.rules,
      note: level === 'off'
        ? '프리미엄 트리거가 없다. 요청이 "알아서 해줘"면 basic으로 간다.'
        : '프리미엄 모드. STEP 2-6-2를 보고 아키타입 하나를 고른 뒤 모티프를 조합한다. 레퍼런스는 베끼지 않는다.',
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
    archetypes: Object.entries(archetypes).map(([id, a]) => ({ id, name: a.name, vibe: a.vibe, motifs: a.motifs })),
    motifs: all.motifs.map((m) => ({ id: m.id, name: m.name, useWhen: m.useWhen })),
    next: '아키타입을 고른 뒤 `pick.mjs premium --archetype <id>`로 전체 사양을 받고, 모티프는 `--id <모티프>`로 받아라.',
  };
}

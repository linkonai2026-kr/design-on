// @ts-check
// pick.mjs templates — 템플릿·테마 참고 사이트. imweb·Framer·Webflow·Wix 등을 레퍼런스로
// 안내한다. 복제 대상이 아니라 구도·분위기·섹션 흐름을 보는 참고다.

import { readData } from '../data.mjs';

/**
 * @param {{archetype?:string}} opt
 * @param {{free:string[]}} ctx
 */
export function templates(opt, { free }) {
  const all = readData('templates.json');
  const arch = opt.archetype ?? (free.length ? free[0] : null);
  // 데이터 키 이름은 archtypeRefs(오타)다. Phase 2에서 데이터와 함께 archetypeRefs로 고친다.
  if (arch) {
    const refs = all.archtypeRefs?.[arch];
    return {
      archetype: arch,
      references: refs ?? [],
      sites: all.sites.filter((s) => s.level !== 'off'),
      note: '레퍼런스는 구도·분위기만 본다. HTML을 베끼지 않는다. 브리프가 이긴다.',
    };
  }
  return {
    sites: all.sites,
    archtypeRefs: all.archtypeRefs,
    next: '`pick.mjs templates --archetype editorial-warm`으로 아키타입별 참고 테마를 받아라.',
  };
}

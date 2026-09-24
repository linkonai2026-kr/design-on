// @ts-check
// pick.mjs layouts — 페이지 구조 아키텍처. 업종이 아니라 '이 가게가 가진 자산'이 구조를 정한다.
// --id 없이 부르면 요약만 준다. 하나를 고른 뒤에 --id로 전체 사양을 받는다.

import { readData } from '../data.mjs';
import { has } from '../text.mjs';

/**
 * @param {{id?:string, asset?:string}} opt
 * @param {{free:string[]}} ctx
 */
export function layouts(opt, { free }) {
  const all = readData('layouts.json');
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

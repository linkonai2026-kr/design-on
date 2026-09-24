// @ts-check
// pick.mjs palettes — 색·업종으로 팔레트 후보를 찾고 bg/ink/accent/muted 역할과 대비를 계산한다.

import { readData } from '../data.mjs';
import { has } from '../text.mjs';
import { lum, contrast, hueWords, autoFixRoles } from '../color.mjs';
import { writePalettePreview } from '../preview.mjs';

/**
 * @param {{hue?:string, industry?:string, autoFix?:boolean, preview?:string|true}} opt
 * @param {{q:string, limit:number}} ctx
 */
export function palettes(opt, { q, limit }) {
  const all = readData('palettes.json');
  const words = hueWords(opt.hue ?? '');
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

  const picked = scored.slice(0, limit).map(({ p }) => {
    const withL = p.hex.map((h) => ({ h, l: lum(h) })).filter((x) => x.l != null).sort((a, b) => b.l - a.l);
    const bg = withL[0]?.h;
    const ink = withL[withL.length - 1]?.h;
    const surface = withL[1]?.h ?? bg;
    // muted는 본문 보조색이다. 배경 대비 4.5:1을 넘는 것 중 가장 밝은 것을 고른다.
    // 넘는 게 없으면 null로 두고 STEP 2에서 직접 만들라고 알린다.
    const mutedCand = withL.slice(1).filter((x) => x.h !== ink && (contrast(x.h, bg) ?? 0) >= 4.5);
    const muted = mutedCand[0]?.h ?? null;
    // 액센트는 배경 대비가 가장 큰 비(非)잉크 색. 4.5 미만이면 버튼 배경으로 쓰면 안 된다.
    const accentCand = withL.slice(1, -1).sort((a, b) => (contrast(b.h, bg) ?? 0) - (contrast(a.h, bg) ?? 0));
    const accent = accentCand[0]?.h ?? ink;
    const warnOf = (ink, bg, accent, muted) => [
      // 본문/배경 대비가 제일 중요한데 예전에는 이걸 경고하지 않았다.
      // 쓸 수 있는 83세트 중 18세트가 여기서 미달인데 조용히 통과시키고 있었다.
      (contrast(ink, bg) ?? 0) < 4.5
        ? `본문 대비가 ${contrast(ink, bg)}:1로 4.5:1에 못 미친다. ink를 더 어둡게 만들어 쓰거나 다른 팔레트를 골라라. 그대로 쓰면 low-contrast로 잡힌다.`
        : null,
      muted ? null : 'muted 후보가 4.5:1을 못 넘는다. ink를 20~30% 밝힌 색을 직접 만들어라.',
      (contrast(accent, bg) ?? 0) < 4.5 ? 'accent가 4.5:1 미만이다. 버튼 배경으로 쓰지 말고 ink 배경을 써라.' : null,
    ].filter(Boolean);

    const base = {
      name: p.name, tone: p.tone, industry: p.industry, hex: p.hex,
      roles: { bg, surface, ink, accent, muted },
      contrast: {
        'ink/bg': contrast(ink, bg),
        'accent/bg': contrast(accent, bg),
        'muted/bg': muted ? contrast(muted, bg) : null,
      },
      warn: warnOf(ink, bg, accent, muted),
      note: p.note || undefined,
    };
    // --auto-fix: 대비 미달 색을 자동 보정한다. 에이전트는 fixedRoles를 실제로 쓴다.
    // 보정 후에는 새 역할값 기준으로 warn을 다시 계산한다 — 고쳤는데 옛 경고가 남으면 안 된다.
    if (opt.autoFix && base.warn.length) {
      const fix = autoFixRoles(withL, bg, ink);
      const fixedWarn = warnOf(fix.roles.ink, fix.roles.bg, fix.roles.accent, fix.roles.muted);
      return { ...base, roles: fix.roles, contrast: fix.contrast, warn: fixedWarn, fixed: true };
    }
    return base;
  });

  // 기본 응답에 시각화를 얹는다. HEX만으로는 일반 사용자가 색을 못 알아본다.
  const result = picked.map((it, i) => ({
    ...it,
    label: `선택지 ${String.fromCharCode(65 + i)}`,
    swatches: (it.hex ?? []).slice(0, 4).map(() => '■').join(' '),
  }));

  // --preview 를 주면 브라우저용 미리보기 HTML을 만들어 경로를 함께 돌려준다.
  if (opt.preview) {
    const file = writePalettePreview(result, opt.preview === true ? 'design-on-palette-preview.html' : opt.preview);
    return { previewFile: file, palettes: result };
  }
  return result;
}

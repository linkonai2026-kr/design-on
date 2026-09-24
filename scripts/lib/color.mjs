// @ts-check
// 색 계열 매칭 + WCAG 대비 계산 + --auto-fix 보정. pick.mjs의 palettes 조회가 쓴다.

import { norm } from './text.mjs';

export const HEX_RE = /^#?([0-9a-f]{6})$/i;

// 색 계열 한국어·영어 동의어. "보라색" 한 마디로 퍼플·라벤더·플럼까지 잡는다.
export const HUES = {
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

/** @param {string} name */
export function hueWords(name) {
  if (!name) return null;
  // "보라색"·"블루 계열"·"어두운 톤" 처럼 붙는 접미사를 떼고 나서 매칭한다.
  const k = norm(name).replace(/\s*(색|계열|톤)$/, '').trim() || norm(name);
  for (const [hue, words] of Object.entries(HUES)) {
    if (hue === k || words.some((w) => norm(w) === k)) return words;
  }
  return [k];
}

// 밝기(0~1). 배경/본문 역할을 나눌 때 쓴다.
/** @param {string} hex */
export function lum(hex) {
  const m = HEX_RE.exec(String(hex).trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

// 반올림하지 않은 원값. 4.5 경계 판정(--auto-fix 루프)은 반올림값이 아니라 이걸로 한다.
/**
 * @param {string} a
 * @param {string} b
 */
function rawContrast(a, b) {
  const [l1, l2] = [lum(a), lum(b)];
  if (l1 == null || l2 == null) return null;
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

// 표시용 대비값. 소수점 둘째 자리로 반올림한다(`ink/bg: 13.68` 같은 표기).
/**
 * @param {string} a
 * @param {string} b
 */
export function contrast(a, b) {
  const raw = rawContrast(a, b);
  return raw == null ? null : +raw.toFixed(2);
}

// --- 색 보정 유틸리티 (--auto-fix) ------------------------------------------
/** @param {string} hex */
export function hexRgb(hex) {
  const m = HEX_RE.exec(String(hex).trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

/** @param {{r:number,g:number,b:number}} rgb */
export function rgbHex({ r, g, b }) {
  const c = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`.toUpperCase();
}

// 두 색을 t(0~1) 비율로 섞는다. t=1이면 두 번째 색에 가깝다.
/**
 * @param {string} a
 * @param {string} b
 * @param {number} t
 */
export function mixHex(a, b, t) {
  const ca = hexRgb(a), cb = hexRgb(b);
  if (!ca || !cb) return a;
  return rgbHex({
    r: ca.r + (cb.r - ca.r) * t,
    g: ca.g + (cb.g - ca.g) * t,
    b: ca.b + (cb.b - ca.b) * t,
  });
}

// 'color'를 배경 bg에 대해 대비 target 이상이 되도록 흰색/검정 쪽으로 밀어낸다.
// 정수 스텝(1~20)으로 돌고, 반올림 전 대비값으로 목표 도달을 판정한다.
/**
 * @param {string} color
 * @param {string} bg
 * @param {number} target
 * @param {boolean} light
 */
export function pushContrast(color, bg, target = 4.5, light) {
  const ref = light ? '#FFFFFF' : '#000000';
  let cur = color;
  for (let step = 1; step <= 20; step++) {
    cur = mixHex(color, ref, step / 20);
    if ((rawContrast(cur, bg) ?? 0) >= target) break;
  }
  return { hex: cur, ratio: contrast(cur, bg) };
}

// 팔레트의 bg/ink/surface가 주어졌을 때 ink/muted/accent를 대비 4.5:1까지 보정한다.
// 원칙: 텍스트 색은 배경과 반대 명도 쪽으로 민다. '밝은 배경'의 기준은 명도 0.5가 아니라
// '배경이 ink보다 밝은가'다. 중간 명도 배경(#C29B72 등)은 절대값 기준으로 오판한다.
/**
 * @param {{h:string,l:number}[]} withL
 * @param {string} bg
 * @param {string} ink
 */
export function autoFixRoles(withL, bg, ink) {
  const lightBg = (lum(bg) ?? 0) > (lum(ink) ?? 0);
  const darken = (hex, target) => pushContrast(hex, bg, target, false);   // 검정 쪽
  const lighten = (hex, target) => pushContrast(hex, bg, target, true);   // 흰 쪽
  // 의도한 방향으로 밀어도 목표에 못 미치면 반대 방향도 시도해 더 나은 쪽을 쓴다.
  const toward = (hex, target) => {
    const primary = lightBg ? darken(hex, target) : lighten(hex, target);
    if ((primary.ratio ?? 0) >= target) return primary;
    const fallback = lightBg ? lighten(hex, target) : darken(hex, target);
    return (fallback.ratio ?? 0) > (primary.ratio ?? 0) ? fallback : primary;
  };

  // ink: 배경 대비 4.5:1. 배경이 밝으면 어둡게, 어두우면 밝게.
  const inkFixed = (rawContrast(ink, bg) ?? 0) >= 4.5
    ? { hex: ink, ratio: contrast(ink, bg) }
    : toward(ink, 4.5);

  // muted: 4.5:1 이상인 원색 후보가 있으면 그것을, 없으면 ink와 bg 중간색을 배경 반대 방향으로 밀어 생성.
  const mutedCand = withL.filter((x) => x.h !== ink && x.h !== bg && (rawContrast(x.h, bg) ?? 0) >= 4.5);
  let muted;
  if (mutedCand.length) {
    muted = { hex: mutedCand[0].h, ratio: contrast(mutedCand[0].h, bg) };
  } else {
    const mid = mixHex(ink, bg, 0.5);
    muted = (rawContrast(mid, bg) ?? 0) >= 4.5
      ? { hex: mid, ratio: contrast(mid, bg) }
      : toward(mid, 4.5);
  }

  // accent: 대비가 가장 큰 비잉크 색. 미달이면 배경 반대 방향으로 밀어 4.5:1 확보.
  const accentCand = withL.filter((x) => x.h !== ink && x.h !== bg)
    .sort((a, b) => (contrast(b.h, bg) ?? 0) - (contrast(a.h, bg) ?? 0));
  let accent = accentCand[0]?.h ?? ink;
  if ((rawContrast(accent, bg) ?? 0) < 4.5) {
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

// @ts-check
// 대소문자 없이 부분 일치를 보는 기본 문자열 유틸. 색·업종·카테고리 매칭에서 공통으로 쓴다.

/** @param {unknown} s */
export const norm = (s) => String(s ?? '').toLowerCase();

/**
 * @param {unknown} hay
 * @param {unknown} needle
 */
export const has = (hay, needle) => norm(hay).includes(norm(needle));

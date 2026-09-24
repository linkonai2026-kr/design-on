#!/usr/bin/env node
// 내장 데이터에서 필요한 것만 뽑아 주는 조회 CLI. JSON 통째 읽기를 대체해 토큰을 아낀다.
// 실제 조회 로직은 scripts/lib/query/*.mjs에 있다. 이 파일은 인자 파싱과 종료 코드만 다룬다.

import { CliError, parseArgs } from './lib/cli.mjs';
import { HUES } from './lib/color.mjs';
import { palettes } from './lib/query/palettes.mjs';
import { tools, toolSections } from './lib/query/tools.mjs';
import { presets } from './lib/query/presets.mjs';
import { fonts } from './lib/query/fonts.mjs';
import { photo } from './lib/query/photo.mjs';
import { layouts } from './lib/query/layouts.mjs';
import { premium } from './lib/query/premium.mjs';
import { templates } from './lib/query/templates.mjs';

// 팔레트 후보는 질문용으로 기본 6개까지 보여준다. 일반 사용자는 HEX만으로 색을 못 알아본다.
const DEFAULT_LIMITS = { palettes: 6 };

const RUNNERS = {
  palettes: (opt, ctx) => palettes(opt, ctx),
  tools: (opt, ctx) => tools(opt, ctx),
  sections: () => toolSections(),
  fonts: (opt, ctx) => fonts(opt, ctx),
  photo: (opt, ctx) => photo(opt, ctx),
  layouts: (opt, ctx) => layouts(opt, ctx),
  presets: (opt, ctx) => presets(opt, ctx),
  premium: (opt, ctx) => premium(opt, ctx),
  templates: (opt, ctx) => templates(opt, ctx),
};

const USAGE = `design-on pick — 내장 데이터에서 필요한 것만 뽑는다

  node scripts/pick.mjs layouts  [--asset 목록과 가격이 핵심]
  node scripts/pick.mjs layouts  --id index-first
  node scripts/pick.mjs palettes --hue 보라 --industry 카페 [--preview] [--auto-fix] [--limit 6]
  node scripts/pick.mjs presets  --industry 카페
  node scripts/pick.mjs premium  --match "고급스럽게 인터랙티브하게"
  node scripts/pick.mjs premium  --archetype editorial-warm
  node scripts/pick.mjs premium  --id scroll-reveal
  node scripts/pick.mjs templates --archetype editorial-warm
  node scripts/pick.mjs fonts    --mood 따뜻함 --lang ko [--limit 3]
  node scripts/pick.mjs photo    --industry 카페
  node scripts/pick.mjs tools    --section 색상 [--free] [--limit 8]
  node scripts/pick.mjs sections

--preview: 브라우저에서 열리는 팔레트 미리보기 HTML을 만든다(design-on-palette-preview.html).
--auto-fix: 대비 미달인 ink/muted/accent를 자동 보정해 항상 4.5:1 이상을 보장한다.
--match: 브리프를 프리미엄 트리거 사전으로 스캔해 레벨(off/basic/full)을 판정한다.
--archetype: 비주얼 아키타입(editorial-warm·dark-gallery·neon-modern 등 7종) 전체 사양.
기본 팔레트 후보는 6개까지 뽑는다. HEX만으로는 일반 사용자가 색을 못 알아본다.

종료 코드: 0=정상, 1=결과 0건(입력을 확인해라), 2=인자 오류.

JSON 전체를 읽지 마라. tools.json은 268KB(약 87,000 토큰)다.
이 명령은 같은 답을 수백 토큰으로 준다.`;

/**
 * 결과가 "찾는 게 없다"는 뜻인지 판정한다. 있으면 exit 1과 힌트를 낸다.
 * @param {string} command
 * @param {unknown} result
 */
function emptyHint(command, result) {
  if (result && typeof result === 'object' && !Array.isArray(result) && 'error' in result) {
    const available = /** @type {any} */ (result).available;
    return `${/** @type {any} */ (result).error}` +
      (available ? `\n사용 가능: ${JSON.stringify(available)}` : '');
  }
  if (command === 'palettes') {
    const list = Array.isArray(result) ? result : /** @type {any} */ (result)?.palettes;
    if (Array.isArray(list) && list.length === 0) {
      return `일치하는 팔레트가 없다. --hue 철자를 확인하거나 빼고 다시 시도해라.\n사용 가능한 색 계열: ${Object.keys(HUES).join(', ')}`;
    }
  }
  if (command === 'tools' && Array.isArray(result) && result.length === 0) {
    return '일치하는 도구가 없다. `node scripts/pick.mjs sections`로 유효한 섹션 이름을 확인해라.';
  }
  return null;
}

function main() {
  const [, , rawCmd, ...rest] = process.argv;

  if (!rawCmd || rawCmd === 'help' || rawCmd === '--help') {
    console.log(USAGE);
    process.exit(0);
  }

  let parsed;
  try {
    parsed = parseArgs(rawCmd, rest, DEFAULT_LIMITS);
  } catch (err) {
    if (err instanceof CliError) {
      console.error(err.message);
      process.exit(2);
    }
    throw err;
  }

  const { command, opt, free, q, limit } = parsed;
  let result;
  try {
    result = RUNNERS[command](opt, { free, q, limit });
  } catch (err) {
    if (err instanceof CliError) {
      console.error(err.message);
      process.exit(2);
    }
    throw err;
  }

  console.log(JSON.stringify(result, null, 2));

  const hint = emptyHint(command, result);
  if (hint) {
    console.error(hint);
    process.exit(1);
  }
}

main();

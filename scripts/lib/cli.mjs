// @ts-check
// pick.mjs의 인자 파싱과 서브커맨드 계약. 잘못된 인자를 조용히 삼키지 않는다 —
// 모르는 옵션·값이 빠진 옵션·잘못된 --limit은 전부 명시적 오류로 끝낸다.

export class CliError extends Error {}

// 서브커맨드별 허용 옵션. 'string'은 값이 필수, 'boolean'은 값을 받지 않는다,
// 'optionalString'은 --preview처럼 값이 있어도 없어도 되는 플래그다.
const SCHEMAS = {
  palettes: { hue: 'string', industry: 'string', preview: 'optionalString', autoFix: 'boolean' },
  tools: { section: 'string', industry: 'string', free: 'boolean' },
  sections: {},
  fonts: { mood: 'string', industry: 'string', lang: 'string' },
  photo: { industry: 'string' },
  layouts: { id: 'string', asset: 'string' },
  presets: { industry: 'string' },
  premium: { match: 'string', archetype: 'string', id: 'string' },
  templates: { archetype: 'string' },
};

// 별칭 → 정식 서브커맨드 이름.
const ALIASES = {
  palette: 'palettes', tool: 'tools', font: 'fonts', photos: 'photo',
  layout: 'layouts', preset: 'presets', template: 'templates',
};

// 모든 서브커맨드가 공통으로 받는 옵션. q는 자유 텍스트, limit은 결과 개수 상한이다.
const UNIVERSAL = { q: 'string', limit: 'string' };

export const COMMAND_NAMES = Object.keys(SCHEMAS);

/** @param {string} cmd */
export function canonicalCommand(cmd) {
  return ALIASES[cmd] ?? cmd;
}

/** @param {string} key camelCase 옵션 키 (예: autoFix) */
function toFlag(key) {
  return '--' + key.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());
}

/**
 * @param {string} cmd 원래 입력한 서브커맨드(별칭 포함)
 * @param {string[]} rest --옵션과 위치 인자
 * @param {{ [command: string]: number }} defaultLimits 서브커맨드별 --limit 기본값
 */
export function parseArgs(cmd, rest, defaultLimits = {}) {
  const canon = canonicalCommand(cmd);
  const schema = SCHEMAS[canon];
  if (!schema) {
    throw new CliError(`알 수 없는 명령이다: "${cmd}"\n사용 가능한 명령: ${COMMAND_NAMES.join(', ')}`);
  }

  const opt = {};
  const free = [];
  for (let i = 0; i < rest.length; i++) {
    const tok = rest[i];
    if (!tok.startsWith('--')) {
      free.push(tok);
      continue;
    }
    const rawName = tok.slice(2);
    const key = rawName.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    const type = schema[key] ?? UNIVERSAL[key];
    if (!type) {
      const known = [...Object.keys(schema), ...Object.keys(UNIVERSAL)].map(toFlag).join(', ');
      throw new CliError(`"${canon}"에는 ${toFlag(key)} 옵션이 없다.\n지원하는 옵션: ${known}`);
    }
    if (type === 'boolean') {
      opt[key] = true;
      continue;
    }
    const next = rest[i + 1];
    const hasValue = next !== undefined && !next.startsWith('--');
    if (type === 'optionalString') {
      opt[key] = hasValue ? rest[++i] : true;
      continue;
    }
    if (!hasValue) throw new CliError(`${toFlag(key)}에 값이 필요하다.`);
    opt[key] = rest[++i];
  }

  let limit = defaultLimits[canon] ?? 3;
  if (opt.limit !== undefined) {
    const n = Number(opt.limit);
    if (!Number.isInteger(n) || n <= 0) {
      throw new CliError(`--limit은 양의 정수여야 한다: "${opt.limit}"`);
    }
    limit = n;
  }
  delete opt.limit;

  const q = String(opt.q ?? free.join(' ')).toLowerCase();
  delete opt.q;

  return { command: canon, opt, free, q, limit };
}

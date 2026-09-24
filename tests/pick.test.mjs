// pick.mjs 리팩터링(Phase 1)이 지키는 계약을 검증한다.
// - scripts/lib/color.mjs의 순수 함수 단위 테스트
// - scripts/lib/cli.mjs의 인자 파싱 계약(모르는 옵션·빠진 값·잘못된 --limit)
// - CLI 프로세스 수준의 종료 코드(0=정상, 1=결과 0건, 2=인자 오류)

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { contrast, hexRgb, rgbHex, mixHex, hueWords, autoFixRoles, lum } from '../scripts/lib/color.mjs';
import { CliError, parseArgs } from '../scripts/lib/cli.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PICK = path.join(root, 'scripts', 'pick.mjs');

function run(args) {
  return spawnSync(process.execPath, [PICK, ...args], { cwd: root, encoding: 'utf8' });
}

// --- color.mjs ---------------------------------------------------------

test('contrast: 검정/흰색은 21:1, 같은 색은 1:1', () => {
  assert.equal(contrast('#000000', '#FFFFFF'), 21);
  assert.equal(contrast('#808080', '#808080'), 1);
});

test('contrast: #(6자리 hex) 형식이 아니면 null', () => {
  assert.equal(contrast('not-a-color', '#FFFFFF'), null);
  assert.equal(contrast('#fff', '#000000'), null); // 3자리 축약형은 지원하지 않는다
});

test('hexRgb/rgbHex/mixHex는 서로 되돌아온다', () => {
  assert.deepEqual(hexRgb('#FF8800'), { r: 255, g: 136, b: 0 });
  assert.equal(rgbHex({ r: 255, g: 136, b: 0 }), '#FF8800');
  assert.equal(mixHex('#000000', '#FFFFFF', 0), '#000000');
  assert.equal(mixHex('#000000', '#FFFFFF', 1), '#FFFFFF');
});

test('hueWords: 색·계열·톤 접미사를 떼고 매칭한다', () => {
  assert.deepEqual(hueWords('보라'), hueWords('보라색'));
  assert.deepEqual(hueWords('블루'), hueWords('블루 계열'));
  assert.deepEqual(hueWords('민트'), hueWords('민트톤'));
});

test('hueWords: 매칭되는 계열이 없으면 그 단어 자체를 후보로 준다', () => {
  assert.deepEqual(hueWords('제주감귤'), ['제주감귤']);
});

test('autoFixRoles: 대비 미달 조합을 4.5:1 이상으로 보정한다', () => {
  // 중간 명도 배경 + 명도가 가까운 ink. 원래는 대비가 낮다.
  const bg = '#C29B72';
  const ink = '#A97A4E';
  assert.ok((contrast(ink, bg) ?? 99) < 4.5, '이 조합은 원래 대비가 낮아야 검증 의미가 있다');

  const withL = [bg, ink, '#8B5E34'].map((h) => ({ h, l: lum(h) })).sort((a, b) => b.l - a.l);
  const fixed = autoFixRoles(withL, bg, ink);

  assert.ok(fixed.contrast['ink/bg'] >= 4.5, `ink/bg가 ${fixed.contrast['ink/bg']}:1로 미달이다`);
  assert.ok(fixed.contrast['accent/bg'] >= 4.5, `accent/bg가 ${fixed.contrast['accent/bg']}:1로 미달이다`);
  assert.ok(fixed.contrast['muted/bg'] >= 4.5, `muted/bg가 ${fixed.contrast['muted/bg']}:1로 미달이다`);
});

test('autoFixRoles: 이미 통과하는 ink는 그대로 둔다', () => {
  const bg = '#FFFFFF';
  const ink = '#111111';
  const withL = [bg, ink, '#888888'].map((h) => ({ h, l: lum(h) })).sort((a, b) => b.l - a.l);
  const fixed = autoFixRoles(withL, bg, ink);
  assert.equal(fixed.roles.ink, ink);
});

// --- lib/cli.mjs: 인자 파싱 계약 ----------------------------------------

test('parseArgs: 모르는 서브커맨드는 CliError', () => {
  assert.throws(() => parseArgs('foobar', []), CliError);
});

test('parseArgs: 서브커맨드에 없는 옵션은 CliError', () => {
  assert.throws(() => parseArgs('tools', ['--sectoin', '색상']), CliError);
});

test('parseArgs: 값이 필요한 옵션에 값이 없으면 CliError', () => {
  assert.throws(() => parseArgs('tools', ['--section']), CliError);
  assert.throws(() => parseArgs('tools', ['--section', '--free']), CliError);
});

test('parseArgs: --limit은 양의 정수만 허용한다', () => {
  assert.throws(() => parseArgs('tools', ['--limit', 'abc']), CliError);
  assert.throws(() => parseArgs('tools', ['--limit', '-1']), CliError);
  assert.throws(() => parseArgs('tools', ['--limit', '0']), CliError);
  assert.equal(parseArgs('tools', ['--limit', '5']).limit, 5);
});

test('parseArgs: 별칭 서브커맨드가 정식 이름으로 정규화된다', () => {
  assert.equal(parseArgs('palette', []).command, 'palettes');
  assert.equal(parseArgs('tool', []).command, 'tools');
});

test('parseArgs: boolean 옵션은 다음 토큰을 값으로 삼키지 않는다', () => {
  const { opt, free } = parseArgs('tools', ['--free', '카페']);
  assert.equal(opt.free, true);
  assert.deepEqual(free, ['카페']);
});

test('parseArgs: --preview는 값이 있어도 없어도 된다', () => {
  assert.equal(parseArgs('palettes', ['--preview']).opt.preview, true);
  assert.equal(parseArgs('palettes', ['--preview', 'out.html']).opt.preview, 'out.html');
});

test('parseArgs: 팔레트 기본 --limit은 6, 나머지는 3', () => {
  assert.equal(parseArgs('palettes', [], { palettes: 6 }).limit, 6);
  assert.equal(parseArgs('tools', [], { palettes: 6 }).limit, 3);
});

// --- CLI 프로세스: 종료 코드 계약 ----------------------------------------

test('CLI: --help/help/무인자는 exit 0, 사용법을 stdout에 낸다', () => {
  for (const args of [[], ['help'], ['--help']]) {
    const r = run(args);
    assert.equal(r.status, 0, JSON.stringify(args));
    assert.match(r.stdout, /design-on pick/);
  }
});

test('CLI: 모르는 서브커맨드는 exit 2', () => {
  const r = run(['foobar']);
  assert.equal(r.status, 2);
  assert.match(r.stderr, /알 수 없는 명령/);
  assert.equal(r.stdout, '');
});

test('CLI: 모르는 옵션·빠진 값·잘못된 --limit은 exit 2', () => {
  for (const args of [
    ['tools', '--sectoin', '색상'],
    ['tools', '--section'],
    ['tools', '--limit', 'abc'],
    ['tools', '--limit', '-1'],
  ]) {
    const r = run(args);
    assert.equal(r.status, 2, JSON.stringify(args));
    assert.equal(r.stdout, '', JSON.stringify(args));
  }
});

test('CLI: 결과 0건은 exit 1이지만 JSON은 stdout에 낸다', () => {
  const r = run(['tools', '--section', '이런섹션은없다']);
  assert.equal(r.status, 1);
  assert.deepEqual(JSON.parse(r.stdout), []);
  assert.match(r.stderr, /sections/);
});

test('CLI: layouts --id 없는 값은 exit 1, error/available을 준다', () => {
  const r = run(['layouts', '--id', '없는구조']);
  assert.equal(r.status, 1);
  const parsed = JSON.parse(r.stdout);
  assert.ok(parsed.error);
  assert.ok(Array.isArray(parsed.available) && parsed.available.length > 0);
});

test('CLI: 정상 조회는 exit 0', () => {
  const r = run(['palettes', '--hue', '보라', '--limit', '1']);
  assert.equal(r.status, 0);
  assert.equal(JSON.parse(r.stdout).length, 1);
});

test('CLI: --preview는 cwd 밖 경로를 거부하고 exit 2를 낸다', () => {
  for (const p of ['../outside.html', '/tmp/design-on-outside-test.html']) {
    const r = run(['palettes', '--hue', '보라', '--limit', '1', '--preview', p]);
    assert.equal(r.status, 2, p);
    assert.match(r.stderr, /현재 폴더/);
  }
});

test('CLI: --auto-fix는 보정 후 warn을 다시 계산해 비운다', () => {
  const r = run(['palettes', '--q', 'Crimson/Ocean', '--limit', '1', '--auto-fix']);
  assert.equal(r.status, 0);
  const [p] = JSON.parse(r.stdout);
  assert.equal(p.fixed, true);
  assert.deepEqual(p.warn, []);
  assert.ok(p.contrast['ink/bg'] >= 4.5);
});

test('CLI: --auto-fix를 걸면 팔레트 전부가 4.5:1을 넘는다', () => {
  const r = run(['palettes', '--limit', '200', '--auto-fix']);
  assert.equal(r.status, 0);
  const list = JSON.parse(r.stdout);
  assert.ok(list.length >= 80, `팔레트가 ${list.length}개뿐이다`);
  for (const p of list) {
    assert.equal(p.warn.length, 0, `${p.name}에 auto-fix 후에도 warn이 남았다: ${JSON.stringify(p.warn)}`);
  }
});

test('CLI: presets/premium/templates 기본 목록이 정상 동작한다', () => {
  for (const args of [['presets'], ['premium'], ['templates']]) {
    const r = run(args);
    assert.equal(r.status, 0, JSON.stringify(args));
    assert.ok(Object.keys(JSON.parse(r.stdout)).length > 0);
  }
});

test('CLI: presets --industry 없는 값은 exit 1', () => {
  const r = run(['presets', '--industry', '이런업종없다']);
  assert.equal(r.status, 1);
  assert.ok(JSON.parse(r.stdout).error);
});

test('CLI: fonts --lang en은 영문 페어링만 준다', () => {
  const r = run(['fonts', '--lang', 'en', '--limit', '10']);
  assert.equal(r.status, 0);
  const { pairings } = JSON.parse(r.stdout);
  assert.ok(pairings.length > 0);
  assert.ok(pairings.every((p) => p.lang === 'en'));
});

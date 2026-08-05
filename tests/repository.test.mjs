import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const examples = ['cafe', 'studio', 'shop', 'tax'];

function walk(directory, extension) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(target, extension);
    return target.endsWith(extension) ? [target] : [];
  });
}

function isLocal(reference) {
  return !/^(?:[a-z]+:|\/\/|#)/i.test(reference);
}

function resolveReference(source, reference) {
  const clean = decodeURIComponent(reference.split(/[?#]/, 1)[0]);
  return path.resolve(path.dirname(source), clean);
}

test('모든 예제의 로컬 CSS와 이미지 링크가 존재한다', () => {
  const missing = [];

  for (const html of walk(path.join(root, 'examples'), '.html')) {
    const source = readFileSync(html, 'utf8');
    const references = [
      ...source.matchAll(/<link\b(?=[^>]*\brel=["']stylesheet["'])[^>]*\bhref=["']([^"']+)["']/gi),
      ...source.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["']/gi)
    ].map((match) => match[1]).filter(isLocal);

    for (const reference of references) {
      const target = resolveReference(html, reference);
      if (!existsSync(target)) {
        missing.push(`${path.relative(root, html)} -> ${reference}`);
        continue;
      }

      if (target.endsWith('.css')) {
        const css = readFileSync(target, 'utf8');
        for (const match of css.matchAll(/url\(\s*(['"]?)([^'")]+)\1\s*\)/gi)) {
          if (isLocal(match[2]) && !existsSync(resolveReference(target, match[2]))) {
            missing.push(`${path.relative(root, target)} -> ${match[2]}`);
          }
        }
      }
    }
  }

  assert.deepEqual(missing, []);
});

test('Claude 플러그인 스킬의 PLAYBOOK 상대경로가 유효하다', () => {
  const skill = path.join(root, 'skills', 'design-on', 'SKILL.md');
  const source = readFileSync(skill, 'utf8');
  assert.match(source, /\.\.\/\.\.\/PLAYBOOK\.md/);
  assert.ok(existsSync(path.resolve(path.dirname(skill), '../../PLAYBOOK.md')));
});

test('pick.mjs의 공개 명령을 스모크 테스트한다', () => {
  const commands = [
    ['layouts'],
    ['layouts', '--asset', '목록과 가격이 핵심'],
    ['layouts', '--id', 'index-first'],
    ['palettes', '--hue', '보라', '--industry', '카페', '--limit', '1'],
    ['fonts', '--industry', '카페'],
    ['photo', '--industry', '카페'],
    ['tools', '--section', '색상', '--limit', '1'],
    ['sections']
  ];

  for (const args of commands) {
    const output = execFileSync(process.execPath, ['scripts/pick.mjs', ...args], {
      cwd: root,
      encoding: 'utf8'
    });
    const parsed = JSON.parse(output);
    assert.ok(Array.isArray(parsed) ? parsed.length > 0 : Object.keys(parsed).length > 0);
  }
});

test('예제 전체가 전체 모드 slopcheck를 통과한다', () => {
  assert.ok(
    existsSync(path.join(root, 'vendor', 'impeccable', 'node_modules', 'htmlparser2')),
    '먼저 npm ci --prefix vendor/impeccable를 실행해야 합니다.'
  );

  for (const example of examples) {
    const result = spawnSync(
      process.execPath,
      ['scripts/slopcheck.mjs', `examples/${example}`],
      { cwd: root, encoding: 'utf8' }
    );
    assert.equal(
      result.status,
      0,
      `${example} slopcheck 실패.\n${result.stdout}\n${result.stderr}`
    );
    assert.doesNotMatch(result.stderr, /축소 모드/);
  }
});

test('레이아웃 아키텍처가 서로 실제로 다른 치수를 갖는다', () => {
  const layouts = JSON.parse(readFileSync(path.join(root, 'data', 'layouts.json'), 'utf8'));
  const list = layouts.architectures;

  assert.ok(list.length >= 8, '아키텍처가 8종 미만이면 선택지 역할을 못 한다.');

  const required = ['id', 'name', 'oneLine', 'fitsWhen', 'doNotPickWhen', 'hero', 'grid', 'metrics', 'avoid', 'css'];
  for (const architecture of list) {
    for (const field of required) {
      assert.ok(architecture[field], `${architecture.id}에 ${field}가 없다.`);
    }
  }

  // id는 유일해야 --id 조회가 성립한다.
  const ids = list.map((a) => a.id);
  assert.equal(new Set(ids).size, ids.length, `id가 중복됐다: ${ids}`);

  // 치수가 전부 같으면 아키텍처를 나눈 의미가 없다. 이 테스트가 동일화 회귀를 막는다.
  const widths = new Set(list.map((a) => String(a.metrics.maxWidth)));
  const gaps = new Set(list.map((a) => String(a.metrics.sectionGap)));
  assert.ok(widths.size >= 5, `maxWidth가 ${widths.size}종뿐이다. 구조가 서로 안 다르다.`);
  assert.ok(gaps.size >= 4, `sectionGap이 ${gaps.size}종뿐이다. 리듬이 서로 안 다르다.`);

  // assetMap이 가리키는 id가 실재해야 --asset 조회가 빈 배열을 내지 않는다.
  for (const [asset, targets] of Object.entries(layouts.howToChoose.assetMap)) {
    for (const id of targets) {
      assert.ok(ids.includes(id), `assetMap "${asset}"이 없는 id "${id}"를 가리킨다.`);
    }
  }
});

test('라틴 서체 폴백이 데이터와 조회 결과에 함께 있다', () => {
  const fonts = JSON.parse(readFileSync(path.join(root, 'data', 'fonts.json'), 'utf8'));
  const fallback = fonts.latinFallback;

  // 페어링의 라틴 서체가 전부 Fontshare 한 곳에서 온다. 폴백이 없으면 단일 장애점이다.
  assert.ok(fallback, 'latinFallback이 없다.');
  assert.equal(fallback.source, 'google');
  assert.ok(fallback.fonts.length >= 3, '폴백이 3종 미만이면 대체 경로 구실을 못 한다.');

  // 폴백이 금지 서체를 담고 있으면 detector가 overused-font로 잡는다.
  const banned = new Set(fonts.avoid.fonts.map((f) => f.toLowerCase()));
  for (const font of fallback.fonts) {
    assert.ok(font.family && font.weights, `${font.family}에 weights가 없다.`);
    assert.ok(!banned.has(font.family.toLowerCase()), `폴백 ${font.family}가 avoid 목록에 있다.`);
  }

  // pick.mjs fonts가 폴백을 같이 줘야 STEP 2-5에서 쓸 수 있다.
  const output = JSON.parse(execFileSync(
    process.execPath,
    ['scripts/pick.mjs', 'fonts', '--industry', '카페', '--limit', '1'],
    { cwd: root, encoding: 'utf8' }
  ));
  assert.ok(output.latinFallback?.fonts?.length, 'pick.mjs fonts가 latinFallback을 안 준다.');
});

test('구조 선택과 교체 테스트가 지침·검수에 함께 있다', () => {
  const playbook = readFileSync(path.join(root, 'PLAYBOOK.md'), 'utf8');
  const critic = readFileSync(path.join(root, 'agents', 'design-on-critic.md'), 'utf8');
  const researcher = readFileSync(path.join(root, 'agents', 'design-on-researcher.md'), 'utf8');

  // 구조를 고르는 단계가 살아 있는가.
  assert.match(playbook, /### 2-0\. 구조를 먼저 고른다/);
  assert.match(playbook, /pick\.mjs layouts/);
  assert.match(playbook, /구조:\s+index-first/);

  // 동일화의 진원지였던 고정 치수가 되살아나지 않았는가.
  assert.doesNotMatch(playbook, /최대 폭 `1180px`/);
  assert.doesNotMatch(playbook, /min-height:78vh/);

  // 업종별 고정 섹션 순서표가 되살아나지 않았는가.
  assert.doesNotMatch(playbook, /히어로 → 소개\(짧게\)/);
  assert.doesNotMatch(researcher, /히어로 → 소개\(짧게\)/);

  // 디텍터가 못 잡는 '껍데기'를 사람이 판정하는 장치가 있는가.
  assert.match(playbook, /교체 테스트/);
  assert.match(critic, /교체 테스트/);
  assert.match(playbook, /이 페이지에만 있는 것을 하나 만든다/);
  assert.match(researcher, /1순위 질문/);
});

test('제목 줄바꿈과 UI 문장부호 규칙이 제작·검수 지침에 함께 있다', () => {
  const playbook = readFileSync(path.join(root, 'PLAYBOOK.md'), 'utf8');
  const copywriter = readFileSync(
    path.join(root, 'agents', 'design-on-copywriter.md'),
    'utf8'
  );
  const koreanReviewer = readFileSync(
    path.join(root, 'agents', 'design-on-korean.md'),
    'utf8'
  );
  const critic = readFileSync(
    path.join(root, 'agents', 'design-on-critic.md'),
    'utf8'
  );

  assert.match(playbook, /overflow-wrap:normal/);
  assert.match(playbook, /제목의 마지막 줄에 한 글자만 남기지 마라/);
  assert.match(playbook, /짧은 라벨에 불필요한 마침표/);
  assert.match(copywriter, /짧은 UI 문구에 완결감을 주려고 `\.`을 붙이지 않는다/);
  assert.match(koreanReviewer, /불필요한 마침표가 붙었는가/);
  assert.match(critic, /영문 한 글자·문장부호 하나만 남지 않았는가/);
});

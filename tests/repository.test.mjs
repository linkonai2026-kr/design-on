import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const examples = ['cafe', 'studio', 'shop'];

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

test('세 예제가 전체 모드 slopcheck를 통과한다', () => {
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

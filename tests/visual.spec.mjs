import { expect, test } from '@playwright/test';

const pages = [
  ['cafe', '/examples/cafe/index.html'],
  ['studio', '/examples/studio/index.html'],
  ['shop', '/examples/shop/index.html'],
  ['tax', '/examples/tax/index.html']
];

const viewports = [
  ['mobile', { width: 375, height: 812 }],
  ['desktop', { width: 1280, height: 900 }]
];

const placeholder = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900">
  <rect width="1200" height="900" fill="#8b776d"/>
  <path d="M0 700L400 390l250 180 180-150 370 280v200H0z" fill="#54443e"/>
</svg>`;

function localURL(pathname) {
  return `${process.env.DESIGN_ON_TEST_URL}${pathname}`;
}

async function stabilize(page) {
  await page.route(/^https?:\/\//, async (route) => {
    if (route.request().url().startsWith(process.env.DESIGN_ON_TEST_URL)) {
      await route.continue();
      return;
    }

    const type = route.request().resourceType();
    if (type === 'image') {
      await route.fulfill({ status: 200, contentType: 'image/svg+xml', body: placeholder });
    } else if (type === 'stylesheet') {
      await route.fulfill({ status: 200, contentType: 'text/css', body: '' });
    } else if (type === 'script') {
      await route.fulfill({ status: 200, contentType: 'text/javascript', body: '' });
    } else {
      await route.abort();
    }
  });
}

async function applyStableFont(page) {
  await page.addStyleTag({
    url: localURL('/node_modules/@fontsource/noto-sans-kr/korean-400.css')
  });
  await page.addStyleTag({
    content: `
      html, body, body * {
        font-family: "Noto Sans KR", sans-serif !important;
        font-weight: 400 !important;
      }
    `
  });
  await page.evaluate(() => document.fonts.load('16px "Noto Sans KR"', '한글'));
  await page.evaluate(() => document.fonts.ready);
  const fontState = await page.evaluate(() => ({
    family: getComputedStyle(document.querySelector('h1') || document.body).fontFamily,
    loaded: document.fonts.check('16px "Noto Sans KR"', '한글')
  }));
  if (!fontState.family.includes('Noto Sans KR') || !fontState.loaded) {
    throw new Error(`시각 회귀용 서체를 불러오지 못했습니다: ${JSON.stringify(fontState)}`);
  }
}

async function findHeadingWrapIssues(page) {
  return page.evaluate(() => {
    const issues = [];
    const headings = document.querySelectorAll(
      'h1, h2, h3, [role="heading"], .display-title, .hero-title, [data-heading-check]'
    );

    for (const heading of headings) {
      const style = getComputedStyle(heading);
      if (
        style.display === 'none'
        || style.visibility === 'hidden'
        || Number(style.opacity) === 0
        || heading.getBoundingClientRect().width === 0
      ) {
        continue;
      }

      const glyphs = [];
      let text = '';
      const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);

      while (walker.nextNode()) {
        const node = walker.currentNode;
        for (let offset = 0; offset < node.data.length;) {
          const codePoint = node.data.codePointAt(offset);
          const character = String.fromCodePoint(codePoint);
          const range = document.createRange();
          range.setStart(node, offset);
          range.setEnd(node, offset + character.length);
          const rect = range.getClientRects()[0];
          const index = text.length;
          text += character;

          if (rect) {
            glyphs.push({ character, index, top: rect.top });
          }
          offset += character.length;
        }
      }

      const visibleGlyphs = glyphs.filter(({ character }) => !/\s/u.test(character));
      const lineTops = [];
      for (const glyph of visibleGlyphs) {
        let line = lineTops.findIndex((top) => Math.abs(top - glyph.top) <= 2);
        if (line === -1) {
          lineTops.push(glyph.top);
          line = lineTops.length - 1;
        }
        glyph.line = line;
      }

      if (lineTops.length < 2) continue;

      const lastLine = visibleGlyphs.filter(({ line }) => line === lineTops.length - 1);
      if (Array.from(lastLine.map(({ character }) => character).join('')).length === 1) {
        issues.push({
          type: 'single-glyph-last-line',
          heading: heading.textContent.trim(),
          detail: lastLine[0].character
        });
      }

      for (const match of text.matchAll(/[\p{L}\p{N}]+/gu)) {
        const end = match.index + match[0].length;
        const tokenLines = new Set(
          visibleGlyphs
            .filter(({ index }) => index >= match.index && index < end)
            .map(({ line }) => line)
        );
        if (tokenLines.size > 1) {
          issues.push({
            type: 'split-word',
            heading: heading.textContent.trim(),
            detail: match[0]
          });
        }
      }
    }

    return issues;
  });
}

for (const [name, url] of pages) {
  for (const [viewportName, viewport] of viewports) {
    test(`${name} ${viewportName}에서 가로 스크롤과 제목 고아 글자가 없다`, async ({ page }) => {
      await stabilize(page);
      await page.setViewportSize(viewport);
      await page.goto(localURL(url), { waitUntil: 'domcontentloaded' });
      await applyStableFont(page);

      const overflow = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth
      }));
      expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);
      expect(await findHeadingWrapIssues(page)).toEqual([]);
    });
  }
}

for (const [name, url] of pages) {
  test(`${name} 대표 화면 스크린샷`, async ({ page }) => {
    await stabilize(page);
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(localURL(url), { waitUntil: 'domcontentloaded' });
    await applyStableFont(page);
    await expect(page).toHaveScreenshot(`${name}-desktop.png`, { fullPage: false });
  });
}

test('cafe 히어로 높이가 뷰포트를 과도하게 넘지 않는다', async ({ page }) => {
  await stabilize(page);

  for (const viewport of [{ width: 375, height: 812 }, { width: 1280, height: 900 }]) {
    await page.setViewportSize(viewport);
    await page.goto(localURL('/examples/cafe/index.html'), { waitUntil: 'domcontentloaded' });
    await applyStableFont(page);
    const height = await page.locator('.hero').evaluate((element) => element.getBoundingClientRect().height);
    expect(height).toBeLessThanOrEqual(viewport.height * 1.25);
  }
});

test('제목 검사기가 마지막 한 글자와 영문 단어 분리를 감지한다', async ({ page }) => {
  await page.setContent(`
    <style>
      h1 {
        display: block;
        margin: 0;
        font: 700 64px/1 Arial, sans-serif;
        width: max-content;
        word-break: break-all;
      }
    </style>
    <h1 data-heading-check>BALANCE</h1>
  `);

  await page.locator('h1').evaluate((heading) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = getComputedStyle(heading).font;
    heading.style.width = `${context.measureText('BALANC').width + 0.5}px`;
  });

  const issues = await findHeadingWrapIssues(page);
  expect(issues).toEqual(expect.arrayContaining([
    expect.objectContaining({ type: 'single-glyph-last-line', detail: 'E' }),
    expect.objectContaining({ type: 'split-word', detail: 'BALANCE' })
  ]));
});

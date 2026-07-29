import { expect, test } from '@playwright/test';

const pages = [
  ['cafe', '/examples/cafe/index.html'],
  ['studio', '/examples/studio/index.html'],
  ['shop', '/examples/shop/index.html']
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

for (const [name, url] of pages) {
  for (const [viewportName, viewport] of viewports) {
    test(`${name} ${viewportName}에서 가로 스크롤이 없다`, async ({ page }) => {
      await stabilize(page);
      await page.setViewportSize(viewport);
      await page.goto(localURL(url), { waitUntil: 'domcontentloaded' });
      await applyStableFont(page);

      const overflow = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth
      }));
      expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);
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

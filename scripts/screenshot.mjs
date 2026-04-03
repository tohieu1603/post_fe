/**
 * Take full-page screenshots of all pages for design comparison
 * Usage: npx playwright test --config=... OR node scripts/screenshot.mjs
 */
import { chromium } from 'playwright';

const BASE = 'http://localhost:3000';
const OUT = './screenshots';

const pages = [
  { name: 'homepage',         path: '/' },
  { name: 'category-listing', path: '/chuyen-muc/thoi-su' },
  { name: 'article-detail',   path: '/bai-viet/toan-canh-thi-truong-ai-viet-nam-2026' },
  { name: 'search-results',   path: '/tim-kiem?q=AI' },
  { name: 'login',            path: '/dang-nhap' },
  { name: 'register',         path: '/dang-ky' },
  { name: 'forgot-password',  path: '/quen-mat-khau' },
  { name: 'profile',          path: '/tai-khoan' },
  { name: 'bookmarks',        path: '/tai-khoan/da-luu' },
  { name: 'buy-tokens',       path: '/tai-khoan/nap-token' },
  { name: 'ai-chat',          path: '/ai-chat' },
  { name: 'admin-dashboard',  path: '/admin' },
  { name: 'admin-posts',      path: '/admin/bai-viet' },
  { name: 'gioi-thieu',       path: '/gioi-thieu' },
  { name: 'lien-he',          path: '/lien-he' },
  { name: 'chinh-sach',       path: '/chinh-sach-bien-tap' },
  { name: 'dinh-chinh',       path: '/dinh-chinh' },
  { name: 'bao-mat',          path: '/chinh-sach-bao-mat' },
];

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });

  for (const { name, path } of pages) {
    const page = await context.newPage();
    try {
      console.log(`📸 ${name}: ${BASE}${path}`);
      await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(1000); // let images/fonts settle
      await page.screenshot({ path: `${OUT}/${name}.jpg`, fullPage: true, type: 'jpeg', quality: 90 });
      console.log(`   ✅ saved ${OUT}/${name}.jpg`);
    } catch (err) {
      console.log(`   ❌ ${name} failed: ${err.message}`);
      // Take whatever is there
      await page.screenshot({ path: `${OUT}/${name}-error.jpg`, fullPage: true, type: 'jpeg', quality: 90 }).catch(() => {});
    }
    await page.close();
  }

  await browser.close();
  console.log('\nDone! Compare screenshots/ with design-to-code/screenshots/stitch/');
})();

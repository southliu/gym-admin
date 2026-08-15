import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { join } from 'path';

const SCREENSHOT_DIR = 'C:\\Users\\South\\Desktop\\论文\\graduation-paper\\temp_images';
mkdirSync(SCREENSHOT_DIR, { recursive: true });

const BASE_URL = 'http://localhost:7000';
const VIEWPORT = { width: 1440, height: 900 };
const CHROMIUM_PATH = 'C:\\Users\\South\\AppData\\Local\\ms-playwright\\chromium_headless_shell-1208\\chrome-headless-shell-win64\\chrome-headless-shell.exe';

async function login(page, username, password) {
  await page.goto(`${BASE_URL}/#/login`);
  await page.waitForTimeout(2000);

  // Fill login form
  const userInput = page.locator('input[placeholder*="用户名"], input[id*="username"], input[id*="userName"]');
  await userInput.waitFor({ state: 'visible', timeout: 5000 });
  await userInput.fill(username);

  const passInput = page.locator('input[placeholder*="密码"], input[type="password"]');
  await passInput.fill(password);

  // Click login button
  await page.locator('button:has-text("登 录"), button:has-text("登录")').click();
  await page.waitForTimeout(3000);

  // Verify login success
  const currentUrl = page.url();
  if (currentUrl.includes('login')) {
    // Maybe still on login, wait more
    await page.waitForTimeout(3000);
  }
  console.log(`  Logged in as ${username}, current URL: ${page.url()}`);
}

async function capturePage(page, urlPath, filename) {
  const hashUrl = `${BASE_URL}/#${urlPath}`;
  await page.goto(hashUrl);
  // Wait for page content to load
  await page.waitForTimeout(2500);
  // Wait for table or content area
  try {
    await page.waitForSelector('.ant-table, .ant-card, .ant-empty, .ant-list, .ant-form, .ant-descriptions, .ant-statistic', { timeout: 8000 });
  } catch (e) {
    // Some pages might not have these selectors, just wait a bit more
    await page.waitForTimeout(2000);
  }
  const filePath = join(SCREENSHOT_DIR, filename);
  await page.screenshot({ path: filePath, fullPage: false });
  console.log(`  ✅ ${filename}`);
}

async function runScreenshots(username, password, prefix, pages) {
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROMIUM_PATH,
  });
  const context = await browser.newContext({ viewport: VIEWPORT });
  const page = await context.newPage();

  try {
    console.log(`\n=== ${prefix} (${username}) ===`);
    await login(page, username, password);

    let idx = 1;
    for (const { path: urlPath, name } of pages) {
      try {
        const paddedIdx = String(idx).padStart(2, '0');
        await capturePage(page, urlPath, `${paddedIdx}_${prefix}_${name}.png`);
        idx++;
      } catch (e) {
        console.log(`  ⚠️ Failed: ${name} - ${e.message}`);
      }
    }
    console.log(`  Total: ${idx - 1} screenshots`);
  } finally {
    await context.close();
    await browser.close();
  }
}

// Coach accessible pages
const coachPages = [
  { path: '/dashboard', name: '首页仪表盘' },
  // 健身房管理
  { path: '/gym/course', name: '课程管理' },
  { path: '/gym/booking', name: '预约管理' },
  { path: '/gym/coach', name: '教练管理' },
  { path: '/gym/coach-schedule-template', name: '排班模板' },
  { path: '/gym/coach-schedule-override', name: '排班调班' },
  { path: '/gym/coach-course', name: '教练课程' },
  // 教练中心
  { path: '/coach/courses', name: '我的课程' },
  { path: '/coach/schedule', name: '我的排班' },
  { path: '/coach/sessions', name: '我的课次' },
];

// Admin accessible pages (includes everything)
const adminPages = [
  { path: '/dashboard', name: '首页仪表盘' },
  // 健身房管理
  { path: '/gym/course-type', name: '课程类型' },
  { path: '/gym/course', name: '课程管理' },
  { path: '/gym/location', name: '场地管理' },
  { path: '/gym/booking', name: '预约管理' },
  { path: '/gym/coach', name: '教练管理' },
  { path: '/gym/coach-schedule-template', name: '排班模板' },
  { path: '/gym/coach-schedule-override', name: '排班调班' },
  { path: '/gym/coach-course', name: '教练课程' },
  // 会员中心
  { path: '/member/courses', name: '会员课程' },
  { path: '/member/bookings', name: '会员预约' },
  // 教练中心
  { path: '/coach/courses', name: '我的课程' },
  { path: '/coach/schedule', name: '我的排班' },
  { path: '/coach/sessions', name: '我的课次' },
  // 系统管理
  { path: '/system/user', name: '用户管理' },
  { path: '/system/role', name: '角色管理' },
  { path: '/system/menu', name: '菜单管理' },
  { path: '/system/log', name: '系统日志' },
  // 内容管理
  { path: '/content/article', name: '文章管理' },
];

async function main() {
  console.log('📸 Starting screenshot automation...');

  await runScreenshots('coach', 'admin123456', 'coach', coachPages);
  await runScreenshots('admin', 'admin123456', 'admin', adminPages);

  console.log('\n🎉 All screenshots complete!');
}

main().catch(e => {
  console.error('Fatal:', e);
  process.exit(1);
});

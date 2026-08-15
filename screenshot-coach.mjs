import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { join } from 'path';

const BASE_DIR = 'C:\\Users\\South\\Desktop\\论文\\graduation-paper\\temp_images';
const COACH_DIR = join(BASE_DIR, 'coach');
const ADMIN_DIR = join(BASE_DIR, 'admin');
mkdirSync(COACH_DIR, { recursive: true });
mkdirSync(ADMIN_DIR, { recursive: true });

const BASE_URL = 'http://localhost:7000';
const VIEWPORT = { width: 1440, height: 900 };
const CHROMIUM_PATH = 'C:\\Users\\South\\AppData\\Local\\ms-playwright\\chromium_headless_shell-1208\\chrome-headless-shell-win64\\chrome-headless-shell.exe';

async function login(page, username, password) {
  await page.goto(`${BASE_URL}/#/login`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  const userInput = page.locator('input[placeholder*="用户名"], input[id*="username"], input[id*="userName"]');
  await userInput.waitFor({ state: 'visible', timeout: 10000 });
  await userInput.fill(username);

  const passInput = page.locator('input[placeholder*="密码"], input[type="password"]');
  await passInput.fill(password);

  await page.locator('button:has-text("登 录"), button:has-text("登录")').click();
  // Wait for navigation away from login
  await page.waitForURL(/#\/(?!login)/, { timeout: 15000 });
  await page.waitForLoadState('networkidle');
  console.log(`  Logged in as ${username}, URL: ${page.url()}`);
}

async function capturePage(page, urlPath, outputDir, filename) {
  const hashUrl = `${BASE_URL}/#${urlPath}`;
  await page.goto(hashUrl);
  // 等待网络空闲，确保 API 请求完成
  await page.waitForLoadState('networkidle');
  // 等待 loading 遮罩消失
  try {
    await page.waitForSelector('.ant-spin-blur', { state: 'hidden', timeout: 5000 });
  } catch (_) {}
  // 等待 loading spinner 消失
  try {
    await page.waitForSelector('.ant-spin-spinning', { state: 'hidden', timeout: 5000 });
  } catch (_) {}
  // 等待表格或内容出现
  try {
    await page.waitForSelector('.ant-table, .ant-card, .ant-empty, .ant-list, .ant-form, .ant-descriptions, .ant-statistic', { timeout: 10000 });
  } catch (_) {
    await page.waitForTimeout(2000);
  }
  // 额外等待内容渲染
  await page.waitForTimeout(2000);

  const filePath = join(outputDir, filename);
  await page.screenshot({ path: filePath, fullPage: false });
  console.log(`  ✅ ${filename}`);
}

async function runScreenshots(username, password, prefix, pages, outputDir) {
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
    for (const { path: p, name } of pages) {
      try {
        const paddedIdx = String(idx).padStart(2, '0');
        await capturePage(page, p, outputDir, `${paddedIdx}_${prefix}_${name}.png`);
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

const coachPages = [
  { path: '/dashboard', name: '首页仪表盘' },
  { path: '/gym/course', name: '课程管理' },
  { path: '/gym/booking', name: '预约管理' },
  { path: '/gym/coach', name: '教练管理' },
  { path: '/gym/coach-schedule-template', name: '排班模板' },
  { path: '/gym/coach-schedule-override', name: '排班调班' },
  { path: '/gym/coach-course', name: '教练课程' },
  { path: '/coach/courses', name: '我的课程' },
  { path: '/coach/schedule', name: '我的排班' },
  { path: '/coach/sessions', name: '我的课次' },
];

const adminPages = [
  { path: '/dashboard', name: '首页仪表盘' },
  { path: '/gym/course-type', name: '课程类型' },
  { path: '/gym/course', name: '课程管理' },
  { path: '/gym/location', name: '场地管理' },
  { path: '/gym/booking', name: '预约管理' },
  { path: '/gym/coach', name: '教练管理' },
  { path: '/gym/coach-schedule-template', name: '排班模板' },
  { path: '/gym/coach-schedule-override', name: '排班调班' },
  { path: '/gym/coach-course', name: '教练课程' },
  { path: '/member/courses', name: '会员课程' },
  { path: '/member/bookings', name: '会员预约' },
  { path: '/coach/courses', name: '我的课程' },
  { path: '/coach/schedule', name: '我的排班' },
  { path: '/coach/sessions', name: '我的课次' },
  { path: '/system/user', name: '用户管理' },
  { path: '/system/role', name: '角色管理' },
  { path: '/system/menu', name: '菜单管理' },
  { path: '/system/log', name: '系统日志' },
  { path: '/content/article', name: '文章管理' },
];

async function main() {
  console.log('📸 Starting screenshot automation...');
  await runScreenshots('coach', 'admin123456', 'coach', coachPages, COACH_DIR);
  await runScreenshots('admin', 'admin123456', 'admin', adminPages, ADMIN_DIR);
  console.log('\n🎉 All screenshots complete!');
}

main().catch(e => {
  console.error('Fatal:', e);
  process.exit(1);
});

import { browser } from 'k6/browser';
import { sleep, check } from 'k6';
import { Counter, Trend } from 'k6/metrics';

// Custom metrics for user interactions
const pageLoadTime = new Trend('page_load_time');
const buttonClickTime = new Trend('button_click_time');
const actionCounter = new Counter('user_action');

export const options = {
  scenarios: {
    ui: {
      executor: 'shared-iterations',
      vus: 1,
      iterations: 1,
      options: {
        browser: {
          type: 'chromium',
          headless: true,
        },
      },
    },
  },
  thresholds: {
    checks: ['rate==1.0'],
    'page_load_time': ['p(95)<40000'],
    'button_click_time': ['p(95)<10000'],
  },
};

export default async function () {
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    const authUrl = 'https://account.lindstromgroup.com';
    page.setDefaultNavigationTimeout(60000);
    page.setDefaultTimeout(30000);
    
    // Navigation to login page - mark with tags
    const startNavigation = new Date();
    await page.goto(authUrl, { waitUntil: 'networkidle' });
    const loadTime = new Date() - startNavigation;
    pageLoadTime.add(loadTime, { action: 'load_login_page', step: '01_navigation' });
    actionCounter.add(1, { action: 'page_navigation', step: '01_navigation' });
    
    await page.screenshot({ path: 'screenshots/1_page_loaded.png' });
    
    // Accept cookies - mark with tags
    const startCookieAction = new Date();
    await page.waitForSelector('button[id="CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll"]', { state: 'visible' });
    await page.locator('button[id="CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll"]').click();
    const cookieClickTime = new Date() - startCookieAction;
    buttonClickTime.add(cookieClickTime, { action: 'accept_cookies', step: '02_cookies' });
    actionCounter.add(1, { action: 'button_click', button: 'accept_cookies', step: '02_cookies' });
    
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshots/2_cookie_accepted.png' });
    
    // Login form submission - mark with tags
    await page.waitForSelector('input[name="username"]', { state: 'visible' });
    await page.locator('input[name="username"]').fill('china.prod@testdummy.com');
    await page.locator('input[name="password"]').fill('test');
    await page.screenshot({ path: 'screenshots/3_credentials_filled.png' });
    
    // Login button click
    const startLoginSubmit = new Date();
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle' }),
      page.locator('input[type="submit"]').click()
    ]);
    const loginSubmitTime = new Date() - startLoginSubmit;
    buttonClickTime.add(loginSubmitTime, { action: 'login_submit', step: '03_login' });
    actionCounter.add(1, { action: 'button_click', button: 'login_submit', step: '03_login' });
    
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/4_after_login.png' });
  } finally {
    await page.close();
  }
}
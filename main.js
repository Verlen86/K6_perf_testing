import { browser } from 'k6/browser';
import { sleep } from 'k6';

export const options = {
  scenarios: {
    ui: {
      executor: 'shared-iterations',
      vus: 10,
      iterations: 10,
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
  },
};

export default async function () {
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    const authUrl = 'https://account.lindstromgroup.com';

    // Add a tag to categorize this request
    page.setDefaultNavigationTimeout(60000);
    page.setDefaultTimeout(30000);
    
/*     page.addTag('request_type', 'page_load');  // Assign a tag to classify the request
    page.addTag('endpoint', authUrl);  // Store endpoint without using it in metric name */

    // Go to the page and wait until the network is idle
    await page.goto(authUrl, { waitUntil: 'networkidle' });

    await page.screenshot({ path: 'screenshots/1_page_loaded.png' });
 
    // Accept cookies
    await page.waitForSelector('button[id="CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll"]', { state: 'visible' });
    await page.locator('button[id="CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll"]').click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshots/2_cookie_accepted.png' });

    // Fill in login form
    await page.waitForSelector('input[name="username"]', { state: 'visible' });
    await page.locator('input[name="username"]').fill('china.prod@testdummy.com');
    await page.locator('input[name="password"]').fill('test');
    await page.screenshot({ path: 'screenshots/3_credentials_filled.png' });

    // Click submit and wait for navigation
    //page.addTag('request_type', 'login_attempt');  // Add a new tag for login request
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle' }),
      page.locator('input[type="submit"]').click()
    ]);

    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/4_after_login.png' });

  } finally {
    await page.close();
  }
}

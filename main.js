import { browser } from 'k6/browser';
import { sleep } from 'k6';

// Read environment variables
const ENDPOINT = 'https://account.lindstromgroup.com';
const USERNAME = 'china.prod@testdummy.com';
const PASSWORD = 'test';

export const options = {
  scenarios: {
    ui: {
      executor: 'shared-iterations',
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
    const authUrl = `${ENDPOINT}`;
    
    // Go to the page and wait until network is idle (no ongoing requests for at least 500ms)
    await page.goto(authUrl, { waitUntil: 'networkidle' });
    
    // Take screenshot after complete page load
    await page.screenshot({ path: 'screenshots/1_page_loaded.png' });

    // Wait for the cookie dialog to be visible and interactable
    await page.waitForSelector('button[id=CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll]', { state: 'visible' });
    
    // Click the cookie button and wait for the action to complete
    await page.locator('button[id="CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll"]').click();
    
    // Wait briefly to ensure the cookie banner is dismissed
    await page.waitForTimeout(1000);
    
    await page.screenshot({ path: 'screenshots/2_cookie_accepted.png' });
    
    // Wait for the login form to be fully loaded and visible
    await page.waitForSelector('input[name="username"]', { state: 'visible' });
    await page.screenshot({ path: 'screenshots/2_username_field.png' });

    // Fill in login credentials
    await page.locator('input[name="username"]').fill(USERNAME);
    await page.locator('input[name="password"]').fill(PASSWORD);
    await page.screenshot({ path: 'screenshots/3_credentials_filled.png' });

    // Click the submit button and wait for navigation to complete
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle' }),
      page.locator('input[type="submit"]').click()
    ]);
    
    // Wait additional time for any post-login processing
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ path: 'screenshots/4_after_login.png' });

  } finally {
    await page.close();
  }
}
import { browser } from 'k6/browser';
import { check } from 'k6';

// Read environment variables
const ENDPOINT = __ENV.ENDPOINT || 'http://localhost:8086';
const REDIRECT_URI = __ENV.REDIRECT_URI || 'http://localhost:3000/api/auth/keycloak-callback';
const CLIENT_ID = __ENV.CLIENT_ID || 'price-manager-client-confidential';
const USERNAME = __ENV.USERNAME || 'customer'; //insert username here
const PASSWORD = __ENV.PASSWORD || '12345'; // insert password here
const LOW_MARGIN_URL = __ENV.LOW_MARGIN_URL || 'http://localhost:3000/en/analytics/pricing-health/low-margin-analysis';

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
    const authUrl = `${ENDPOINT}/realms/dev/protocol/openid-connect/auth?client_id=${CLIENT_ID}&response_type=code&scope=openid&redirect_uri=${REDIRECT_URI}`;
    await page.goto(authUrl);

    // Take screenshot after page load
    await page.screenshot({ path: 'screenshots/1_page_loaded.png' });

    await page.waitForSelector('input[name="username"]');

    // Take screenshot after finding username field
    await page.screenshot({ path: 'screenshots/2_username_field.png' });

    await page.locator('input[name="username"]').type(USERNAME);
    await page.locator('input[name="password"]').type(PASSWORD);

    // Take screenshot after filling in credentials
    await page.screenshot({ path: 'screenshots/3_credentials_filled.png' });

    await Promise.all([page.waitForNavigation(), page.locator('input[type="submit"]').click()]);

    // Take screenshot after login attempt
    await page.screenshot({ path: 'screenshots/4_after_login.png' });

    await page.goto(LOW_MARGIN_URL);

    // Take screenshot after page load
    await page.screenshot({ path: 'screenshots/5_page_low_margin.png' });

  } finally {
    await page.close();
  }
}

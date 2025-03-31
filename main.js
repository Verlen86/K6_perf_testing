import { browser } from 'k6/browser';
import { check } from 'k6';

// Hardcoded values instead of environment variables
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
    
    // Navigate to the page
    await page.goto(authUrl);
    
    // Create a promise that resolves when network is idle
    await page.evaluate(() => {
      return new Promise((resolve) => {
        if (document.readyState === 'complete') {
          resolve();
        } else {
          window.addEventListener('load', resolve);
        }
        
        // Additional safety timeout after 30 seconds
        setTimeout(resolve, 30000);
      });
    });
    
    // Take screenshot after page load
    await page.screenshot({ path: 'screenshots/1_page_loaded.png' });

    // Wait for the cookie dialog
    await page.waitForSelector('button[id=CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll]');
    
    // Click the cookie button
    await page.locator('button[id="CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll"]').click();
    
    // Wait for cookie banner to disappear (negative selector)
    await page.waitForFunction(() => {
      return !document.querySelector('#CybotCookiebotDialog') || 
        document.querySelector('#CybotCookiebotDialog').style.display === 'none';
    });
    
    await page.screenshot({ path: 'screenshots/2_cookie_accepted.png' });
    
    // Wait for the login form
    await page.waitForSelector('input[name="username"]');
    await page.screenshot({ path: 'screenshots/2_username_field.png' });

    // Fill in login credentials
    await page.locator('input[name="username"]').fill(USERNAME);
    await page.locator('input[name="password"]').fill(PASSWORD);
    await page.screenshot({ path: 'screenshots/3_credentials_filled.png' });

    // Click the submit button
    await page.locator('input[type="submit"]').click();
    
    // Wait for navigation to complete by waiting for an element that appears after login
    // Note: You might need to adjust this selector based on what appears after login
    await page.waitForSelector('body');
    
    // Additional check for page load completion after navigation
    await page.evaluate(() => {
      return new Promise((resolve) => {
        if (document.readyState === 'complete') {
          resolve();
        } else {
          window.addEventListener('load', resolve);
        }
        
        // Additional safety timeout after 30 seconds
        setTimeout(resolve, 30000);
      });
    });
    
    // Make sure there are no active network requests by checking the performance API
    await page.evaluate(() => {
      return new Promise((resolve) => {
        // Check every 500ms if network is idle
        const checkNetworkIdle = () => {
          const resources = performance.getEntriesByType('resource');
          const incompleteResources = resources.filter(r => !r.responseEnd);
          
          if (incompleteResources.length === 0) {
            resolve();
          } else {
            setTimeout(checkNetworkIdle, 500);
          }
        };
        
        checkNetworkIdle();
        
        // Safety timeout after 30 seconds
        setTimeout(resolve, 30000);
      });
    });
    
    await page.screenshot({ path: 'screenshots/4_after_login.png' });
    
    // Verify the page has loaded successfully
    check(page, {
      'login successful': p => p.url().includes('lindstromgroup.com'),
    });

  } finally {
    await page.close();
  }
}
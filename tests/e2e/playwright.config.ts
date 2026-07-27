// Legis Connect — Playwright Configuration
// Standards: WCAG 2.1 AA | Core Web Vitals | Critical Journey Coverage
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './',
  timeout: 30_000,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['github'],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'https://staging.legis-connect.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});

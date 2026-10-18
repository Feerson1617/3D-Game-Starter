import { defineConfig, devices } from '@playwright/test';
const remote = process.env.E2E_BASE_URL;
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  retries: 0,
  workers: 1,
  use: { baseURL: remote || 'http://127.0.0.1:4173/', trace: 'retain-on-failure', launchOptions: { args: ['--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] } },
  projects: [
    { name: 'chromium-desktop', testIgnore: /touch.spec.js/, use: { ...devices['Desktop Chrome'] } },
    { name: 'chromium-touch', testMatch: /touch.spec.js/, use: { ...devices['Desktop Chrome'], viewport:{width:820,height:1180}, hasTouch:true, isMobile:true } },
    { name: 'webkit-ipad', testIgnore: /touch.spec.js/, use: { ...devices['iPad (gen 7)'], launchOptions: {} } }
  ],
  webServer: remote ? undefined : { command: 'npm run dev -- --host 127.0.0.1 --port 4173 --strictPort', url: 'http://127.0.0.1:4173', timeout: 60000, reuseExistingServer: !process.env.CI }
});

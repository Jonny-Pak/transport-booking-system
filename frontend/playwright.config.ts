import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: 'npm run dev -- --host localhost',
    url: 'http://localhost:5173',
    reuseExistingServer: false,
    env: {
      VITE_API_BASE_URL:
        process.env.E2E_API_BASE_URL ?? 'http://localhost:8080/api/v1',
    },
  },
})

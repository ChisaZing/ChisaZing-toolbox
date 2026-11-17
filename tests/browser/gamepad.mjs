import { chromium, expect } from '@playwright/test'
const browser = await chromium.launch({ channel: 'msedge', headless: true })
try {
  const page = await browser.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.addInitScript(() => {
    window.mockPad = {
      index: 0,
      id: 'Mock controller',
      mapping: 'standard',
      connected: true,
      timestamp: 123,
      axes: [0.5, -0.25, 0, 0],
      buttons: Array.from({ length: 17 }, (_, i) => ({
        pressed: i === 0,
        touched: i === 0,
        value: i === 0 ? 1 : 0,
      })),
    }
    Object.defineProperty(navigator, 'getGamepads', {
      value: () => (window.mockPad ? [window.mockPad] : []),
    })
  })
  await page.goto('http://localhost:3000/zh/tools/gamepad-test/')
  await page.getByRole('heading', { name: 'Mock controller', exact: true }).waitFor()
  await expect(page.getByRole('img', { name: '标准手柄实时示意图' })).toBeVisible()
  await page.setViewportSize({ width: 320, height: 800 })
  await page.waitForTimeout(500)
  if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth))
    throw Error('Overflow')
  await page.evaluate(() => (window.mockPad = null))
  await expect(page.getByText('连接手柄，并按下任意按键开始', { exact: true })).toBeVisible()
  if (errors.length) throw Error(errors.join('\n'))
  console.log('Mock standard gamepad, disconnect and 320px layout passed')
} finally {
  await browser.close()
}

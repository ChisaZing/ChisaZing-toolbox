import { chromium, expect } from '@playwright/test'
const browser = await chromium.launch({ channel: 'msedge', headless: true })
try {
  const page = await browser.newPage()
  await page.goto('http://localhost:3000/zh/tools/base-converter/')
  await page.waitForTimeout(1000)
  await page.locator('#base-16').fill('FF')
  await expect(page.locator('#base-10')).toHaveValue('255')
  await expect(page.locator('#base-2')).toHaveValue('11111111')
  await page.locator('#base-2').fill('2')
  await expect(page.locator('#base-10')).toHaveValue('')
  await page.locator('#base-10').fill('9007199254740993')
  await expect(page.locator('#base-16')).toHaveValue('20000000000001')
  console.log('Live base synchronization, invalid input and BigInt precision passed')
} finally {
  await browser.close()
}

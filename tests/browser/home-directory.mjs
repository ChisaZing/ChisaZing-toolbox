import { chromium, expect } from '@playwright/test'
const b = await chromium.launch({ channel: 'msedge', headless: true })
try {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
  await p.goto('http://localhost:3000/zh/')
  await p.waitForTimeout(700)
  const first = await p.locator('.directory-card').first().boundingBox()
  if (first.y < 900) throw Error('Tools visible above fold')
  await p.getByRole('button', { name: /探索全部工具/ }).click()
  await p.getByRole('textbox', { name: '搜索工具', exact: true }).fill('二维码')
  await expect(p.locator('.directory-card')).toHaveCount(1)
  await p.goto('http://localhost:3000/zh/tools/')
  await p.waitForTimeout(500)
  await expect(p.locator('.home-hero')).toHaveCount(0)
  await expect(p.locator('.directory-card')).toHaveCount(12)
  await p.setViewportSize({ width: 320, height: 800 })
  if (await p.evaluate(() => document.documentElement.scrollWidth > innerWidth))
    throw Error('Overflow')
  console.log(
    'Landing below-fold cards, search, 12 tools in grouped directory and mobile layout passed',
  )
} finally {
  await b.close()
}

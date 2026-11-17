import { chromium } from '@playwright/test'
const browser = await chromium.launch({ channel: 'msedge', headless: true })
try {
  const page = await browser.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  for (const slug of ['web-serial']) {
    await page.goto(`http://localhost:3000/zh/tools/${slug}/`)
    await page.getByRole('button', { name: '选择串口并连接', exact: true }).waitFor()
    await page.waitForTimeout(500)
  }
  if (errors.length) throw Error(errors.join('\n'))
  console.log('Serial terminal and assistant loaded without browser errors')
} finally {
  await browser.close()
}

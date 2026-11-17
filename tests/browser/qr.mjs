import { chromium, expect } from '@playwright/test'
const b = await chromium.launch({ channel: 'msedge', headless: true })
try {
  const p = await b.newPage()
  const errors = []
  p.on('pageerror', (e) => errors.push(e.message))
  await p.goto('http://localhost:3000/zh/tools/qr-code/')
  await p.waitForTimeout(900)
  await p.locator('#qr-input').fill('Hello 世界')
  await p.getByRole('button', { name: '生成二维码', exact: true }).click()
  await p.getByRole('link', { name: '下载 PNG' }).waitFor()
  if (errors.length) throw Error(errors.join('\n'))
  console.log('QR download passed')
} finally {
  await b.close()
}

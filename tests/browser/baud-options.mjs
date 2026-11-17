import { chromium } from '@playwright/test'
const browser = await chromium.launch({ channel: 'msedge', headless: true })
try {
  const page = await browser.newPage()
  await page.goto('http://localhost:3000/zh/tools/web-serial/')
  await page.waitForTimeout(1000)
  await page.getByRole('button', { name: '展开全部波特率' }).click()
  await page.getByRole('button', { name: '9600', exact: true }).click()
  if ((await page.getByRole('spinbutton', { name: '波特率', exact: true }).inputValue()) !== '9600')
    throw Error('Selection failed')
  await page.waitForTimeout(1000)
  await page.getByRole('button', { name: '展开全部波特率' }).click()
  await page.getByRole('button', { name: '115200', exact: true }).waitFor()
  await page.getByRole('button', { name: '2000000', exact: true }).waitFor()
  console.log('All baud options remain available after selecting 9600')
} finally {
  await browser.close()
}

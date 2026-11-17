import { chromium } from '@playwright/test'
import { GifReader } from 'omggif'
const browser = await chromium.launch({ channel: 'msedge', headless: true })
const page = await browser.newPage()
page.on('pageerror', (e) => console.log('PAGE ERROR', e.message))
try {
  await page.goto('http://localhost:3000/zh/tools/gif-maker/')
  await page.waitForTimeout(1500)
  const png = await page.evaluate(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 16
    const x = c.getContext('2d')
    x.fillStyle = 'red'
    x.fillRect(0, 0, 16, 16)
    return c.toDataURL().split(',')[1]
  })
  const file = { name: 'red.png', mimeType: 'image/png', buffer: Buffer.from(png, 'base64') }
  await page.locator('input[type=file]').setInputFiles([file])
  await page.locator('input[type=file]').setInputFiles([{ ...file, name: 'red2.png' }])
  await page.getByText('已选择 2 个文件', { exact: true }).waitFor()
  await page.getByRole('button', { name: '生成 GIF', exact: true }).click()
  await page.getByRole('link', { name: '下载 GIF' }).waitFor({ timeout: 30000 })
  const data = await page.evaluate(async () =>
    Array.from(
      new Uint8Array(
        await (
          await fetch(document.querySelector('a[download="animation.gif"]').href)
        ).arrayBuffer(),
      ),
    ),
  )
  const reader = new GifReader(Uint8Array.from(data))
  console.log(
    JSON.stringify({
      frames: reader.numFrames(),
      width: reader.width,
      height: reader.height,
      delay: reader.frameInfo(0).delay,
    }),
  )
  if (reader.numFrames() !== 2) throw Error('Expected 2 frames')
} catch (e) {
  console.log(await page.locator('body').innerText())
  throw e
} finally {
  await browser.close()
}

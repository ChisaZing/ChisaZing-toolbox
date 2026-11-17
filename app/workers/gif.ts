import { GIFEncoder, quantize, applyPalette } from 'gifenc/dist/gifenc.esm.js'
import { inspectImage } from '../../core/image'
import { validateGif } from '../../core/gif'

self.onmessage = async (e: MessageEvent) => {
  try {
    const { files, edge, delay, loop } = e.data
    validateGif(files, edge, delay)
    const gif = GIFEncoder()
    let width = 0,
      height = 0
    for (let i = 0; i < files.length; i++) {
      try {
        const bitmap = await createImageBitmap(await inspectImage(files[i]))
        try {
          if (bitmap.width * bitmap.height > 20000000)
            throw Error('Image exceeds 20 million pixels')
          if (!i) {
            const scale = Math.min(edge / bitmap.width, edge / bitmap.height)
            width = Math.max(1, Math.round(bitmap.width * scale))
            height = Math.max(1, Math.round(bitmap.height * scale))
          }
          const canvas = new OffscreenCanvas(width, height)
          const ctx = canvas.getContext('2d')
          if (!ctx) throw Error('OffscreenCanvas unavailable')
          ctx.fillStyle = '#fff'
          ctx.fillRect(0, 0, width, height)
          const scale = Math.min(width / bitmap.width, height / bitmap.height)
          const w = bitmap.width * scale,
            h = bitmap.height * scale
          ctx.drawImage(bitmap, (width - w) / 2, (height - h) / 2, w, h)
          const rgba = ctx.getImageData(0, 0, width, height).data
          const palette = quantize(rgba, 256)
          gif.writeFrame(applyPalette(rgba, palette), width, height, {
            palette,
            delay,
            repeat: loop ? 0 : -1,
          })
          canvas.width = canvas.height = 0
          postMessage({ done: i + 1, total: files.length })
        } finally {
          bitmap.close()
        }
      } catch (error) {
        throw Error(`Frame ${i + 1}: ${(error as Error).message}`)
      }
    }
    gif.finish()
    postMessage({ blob: new Blob([gif.bytes()], { type: 'image/gif' }) })
  } catch (error) {
    postMessage({ error: (error as Error).message })
  }
}

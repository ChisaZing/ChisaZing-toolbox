import { it, expect } from 'vitest'
import QR from 'qrcode'
import jsQR from 'jsqr'
it('independently decodes a generated unicode QR matrix', () => {
  const text = 'Hello, 世界!'
  const q = QR.create(text, { errorCorrectionLevel: 'M' })
  const scale = 5,
    size = (q.modules.size + 8) * scale
  const rgba = new Uint8ClampedArray(size * size * 4).fill(255)
  for (let y = 0; y < q.modules.size; y++)
    for (let x = 0; x < q.modules.size; x++)
      if (q.modules.get(y, x))
        for (let yy = 0; yy < scale; yy++)
          for (let xx = 0; xx < scale; xx++) {
            const p = (((y + 4) * scale + yy) * size + (x + 4) * scale + xx) * 4
            rgba[p] = rgba[p + 1] = rgba[p + 2] = 0
          }
  expect(jsQR(rgba, size, size)?.data).toBe(text)
})

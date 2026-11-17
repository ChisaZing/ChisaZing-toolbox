import { it, expect } from 'vitest'
import { outputSize, validateBatch, inspectImage } from '../core/image'
it('scales without enlarging or losing extreme dimensions', () => {
  expect(outputSize(4000, 2000, 1000)).toEqual({ width: 1000, height: 500 })
  expect(outputSize(20, 10, 1000)).toEqual({ width: 20, height: 10 })
  expect(outputSize(20000, 1, 100)).toEqual({ width: 100, height: 1 })
  expect(() => outputSize(1, 1, NaN)).toThrow()
})
it('rejects count and total size before decoding', () => {
  expect(() => validateBatch(Array(11).fill({ size: 1 }))).toThrow()
  expect(() => validateBatch([{ size: 51 * 1024 * 1024 }])).toThrow()
})
it('rejects disguised files and animation headers', async () => {
  await expect(inspectImage(new File(['<svg/>'], 'fake.png'))).rejects.toThrow()
  const b = new Uint8Array(28)
  b.set([137, 80, 78, 71, 13, 10, 26, 10])
  b.set([97, 99, 84, 76], 12)
  await expect(inspectImage(new File([b], 'animation.png'))).rejects.toThrow('Animated')
})

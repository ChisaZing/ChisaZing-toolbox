import { it, expect } from 'vitest'
import { validateGif } from '../core/gif'
it('enforces frame, memory and timing bounds', () => {
  expect(() => validateGif([], 480, 100)).toThrow()
  expect(() => validateGif(Array(60).fill({ size: 1 }), 800, 100)).toThrow()
  expect(() => validateGif([{ size: 1 }], 480, 25)).toThrow()
  expect(() => validateGif([{ size: 11 * 1024 * 1024 }], 480, 100)).toThrow()
  expect(() => validateGif(Array(3).fill({ size: 1 }), 480, 100)).not.toThrow()
})

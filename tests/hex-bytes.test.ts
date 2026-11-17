import { it, expect } from 'vitest'
import { formatHexBytes, parseHexBytes } from '../core/base/hex'
import { convertBase } from '../core'
it('formats bytes and round trips signed integers', () => {
  for (const n of [0n, 1n, 255n, 256n, -511n, 9007199254740993n])
    expect(convertBase(parseHexBytes(formatHexBytes(n)), 16)).toBe(n)
  expect(formatHexBytes(511n)).toBe('0x01 0xFF')
  expect(formatHexBytes(0n)).toBe('0x00')
})
it('rejects malformed bytes', () => {
  for (const s of ['0x1', '0xGG', '01 FF']) expect(() => parseHexBytes(s)).toThrow()
})

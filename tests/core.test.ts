import { describe, it, expect } from 'vitest'
import { crc, presets, convertBase, ascii } from '../core'
describe('independent published check values', () => {
  it('CRC catalogue check 123456789', () => {
    expect(
      presets.map((p) => crc(new TextEncoder().encode('123456789'), p).toString(16).toUpperCase()),
    ).toEqual(['F4', 'BC', 'BB3D', '4B37', '29B1', 'CBF43926'])
  })
  it('keeps integers exact', () => {
    expect(convertBase('9007199254740993', 10)).toBe(9007199254740993n)
    expect(convertBase('FF', 16)).toBe(255n)
    expect(() => convertBase('2', 2)).toThrow()
    expect(() => convertBase('', 10)).toThrow()
  })
  it('ASCII and UTF8 boundaries', () => {
    expect(ascii('A', false, 16, false)).toBe('41')
    expect(() => ascii('中', false, 16, false)).toThrow()
    expect(ascii(ascii('中文', false, 16, true), true, 16, true)).toBe('中文')
  })
})

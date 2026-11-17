import { it, expect } from 'vitest'
import { signedConvert } from '../core/signed'
it('packs and decodes BCD HEX without converting decimal magnitude to binary hex', () => {
  expect(signedConvert('42', 'decimal', 8, true).bcd).toBe('0x42')
  expect(signedConvert('123', 'decimal', 16, true).bcd).toBe('0x01 0x23')
  expect(signedConvert('-0x01 0x23', 'bcd', 16, true).decimal).toBe('-123')
  expect(signedConvert('0x00', 'bcd', 8, true).decimal).toBe('0')
  expect(() => signedConvert('0xFA', 'bcd', 16, true)).toThrow()
})

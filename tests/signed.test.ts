import { it, expect } from 'vitest'
import { signedConvert } from '../core/signed'
it('converts known signed and BCD representations', () => {
  expect(signedConvert('-42', 'decimal', 8)).toEqual({
    decimal: '-42',
    sign: '10101010',
    twos: '11010110',
    bcd: '-0100 0010',
  })
  expect(signedConvert('11010110', 'twos', 8).decimal).toBe('-42')
  expect(signedConvert('-0100 0010', 'bcd', 8).decimal).toBe('-42')
})
it('handles minimum signed values, negative zero and bounds', () => {
  expect(signedConvert('-128', 'decimal', 8).sign).toBe('')
  expect(signedConvert('10000000', 'sign', 8).decimal).toBe('0')
  expect(() => signedConvert('128', 'decimal', 8)).toThrow()
  expect(() => signedConvert('1010', 'bcd', 8)).toThrow()
  expect(signedConvert('-9223372036854775808', 'decimal', 64).twos).toBe('1' + '0'.repeat(63))
})

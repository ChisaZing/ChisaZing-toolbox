import { it, expect } from 'vitest'
import { serialPayload, validateSerial } from '../core/serial'
it('encodes text and exact HEX, appends endings only to text', () => {
  expect([...serialPayload('Hi', false, '\r\n')]).toEqual([72, 105, 13, 10])
  expect([...serialPayload('48 69', true, '\n')]).toEqual([72, 105])
  expect(() => serialPayload('A', true, '')).toThrow()
  expect(() => serialPayload('GG', true, '')).toThrow()
})
it('enforces send and baud limits', () => {
  expect(() => serialPayload('a'.repeat(65537), false, '')).toThrow()
  expect(() => validateSerial(0)).toThrow()
  expect(() => validateSerial(115200)).not.toThrow()
})

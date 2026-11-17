import { it, expect } from 'vitest'
import { asciiExample } from '../core/ascii/example'
import { ascii } from '../core'
it('byte examples decode in every supported base and encoding', () => {
  for (const radix of [2, 8, 10, 16])
    for (const utf8 of [false, true]) {
      const example = asciiExample(true, radix, utf8)
      expect(ascii(example.input, true, radix, utf8)).toBe(example.expected)
    }
})
it('text examples match their selected encoding', () => {
  expect(asciiExample(false, 16, false).input).toBe('Hello')
  expect(asciiExample(false, 16, true).input).toBe('Hello 中文')
})

import { it, expect } from 'vitest'
import { CrsfStream } from '../core/crsf/stream'
import { bytes } from '../core'
it('buffers every split point without premature truncation', () => {
  const frame = bytes('C8 07 32 EE 13 13 01 66 06')
  for (let i = 1; i < frame.length; i++) {
    const s = new CrsfStream()
    expect(s.push(frame.slice(0, i))).toEqual([])
    const result = s.push(frame.slice(i))
    expect(result).toHaveLength(1)
    expect(result[0]!.trusted).toBe(true)
    expect(s.finish()).toBe(null)
  }
})
it('keeps absolute offsets and flushes incomplete tails', () => {
  const s = new CrsfStream()
  s.push(bytes('C8 07 32 EE 13 13 01 66 06'))
  s.push(bytes('C8 07'))
  expect(s.finish()).toMatchObject({ offset: 9, error: 'TRUNCATED' })
  expect(s.finish()).toBe(null)
})

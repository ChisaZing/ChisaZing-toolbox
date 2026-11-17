import { it, expect } from 'vitest'
import { parseCrsf } from '../core/crsf'
import { bytes } from '../core'
it('checks independent TBS command examples', () => {
  for (const hex of ['C8 07 32 EE 13 13 01 66 06', 'C8 07 32 EE 13 13 02 12 8E']) {
    const r = parseCrsf(bytes(hex))
    expect(r.frames).toHaveLength(1)
    expect(r.frames[0]!.trusted).toBe(true)
  }
})
it('preserves noise and finds concatenated frames', () => {
  const r = parseCrsf(bytes('00 C8 07 32 EE 13 13 01 66 06 C8 07 32 EE 13 13 02 12 8E'))
  expect(r.frames.filter((f) => f.trusted)).toHaveLength(2)
  expect(r.frames[0]!.error).toBeTruthy()
})
it('retains truncation and CRC errors', () => {
  expect(parseCrsf(bytes('C8 07 32')).frames[0]!.error).toBe('TRUNCATED')
  expect(parseCrsf(bytes('C8 07 32 EE 13 13 01 66 00')).frames[0]!.error).toBe('CRC_MISMATCH')
})

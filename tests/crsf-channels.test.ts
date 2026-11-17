import { it, expect } from 'vitest'
import { latestChannels } from '../core/crsf/channels'
it('keeps the latest valid channel frame and rejects untrusted or malformed frames', () => {
  const values = Array.from({ length: 16 }, (_, i) => i * 100)
  const good = { type: 22, trusted: true, fields: { channels_raw: values } }
  expect(latestChannels([good, { ...good, trusted: false }])).toEqual(values)
  expect(latestChannels([{ ...good, error: 'BAD' }])).toBe(null)
  expect(latestChannels([{ ...good, fields: { channels_raw: [2048] } }])).toBe(null)
  expect(latestChannels([{ ...good, type: 8 }])).toBe(null)
})

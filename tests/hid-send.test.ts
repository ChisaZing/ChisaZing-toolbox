import { it, expect } from 'vitest'
import { prepareReport } from '../core/hid'
const c = [
  {
    children: [
      {
        outputReports: [{ reportId: 1, items: [{ reportSize: 8, reportCount: 3 }] }],
        featureReports: [{ reportId: 0, items: [{ reportSize: 1, reportCount: 9 }] }],
      },
    ],
  },
]
it('validates descriptors recursively and excludes report ID from payload', () => {
  expect([...prepareReport(c, 'output', 1, '0x01 02 FF')]).toEqual([1, 2, 255])
  expect(prepareReport(c, 'feature', 0, '00 FF').length).toBe(2)
  expect(() => prepareReport(c, 'output', 1, '01')).toThrow()
  expect(() => prepareReport(c, 'output', 0, '01 02 FF')).toThrow()
  expect(() => prepareReport(c, 'output', 256, '01')).toThrow()
  expect(() => prepareReport(c, 'output', 1, '0x1 GG')).toThrow()
})

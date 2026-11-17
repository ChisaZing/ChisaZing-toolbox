import { it, expect } from 'vitest'
import { radialSample, radialSummary, stickPoint } from '../core/gamepad'
it('measures coverage independently from sampled radius deviation', () => {
  let bins = Array(36).fill(0)
  bins = radialSample(bins, 1, 0)
  bins = radialSample(bins, 0.5, 0)
  expect(radialSummary(bins)).toMatchObject({ coverage: 1, error: 0 })
  expect(radialSummary(Array(36).fill(0)).error).toBe(null)
  expect(radialSummary(radialSample(Array(36).fill(0), 0.8, 0)).error).toBeCloseTo(20)
  expect(stickPoint([], 0)).toEqual({ x: 0, y: 0 })
})

import { it, expect } from 'vitest'
import { keyboard104 } from '../core/input/keyboard'
it('has exactly 104 unique physical codes without overlapping keys', () => {
  const keys = keyboard104()
  expect(keys).toHaveLength(104)
  expect(new Set(keys.map((k) => k.code)).size).toBe(104)
  for (let i = 0; i < keys.length; i++)
    for (let j = i + 1; j < keys.length; j++) {
      const a = keys[i]!,
        b = keys[j]!
      expect(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y).toBe(
        true,
      )
    }
})

export function stickPoint(axes: readonly number[], index: number) {
  return { x: axes[index] ?? 0, y: axes[index + 1] ?? 0 }
}
export function radialSample(bins: number[], x: number, y: number) {
  const radius = Math.hypot(x, y)
  if (radius < 0.2) return bins
  const i = Math.floor(((Math.atan2(y, x) + Math.PI) / (Math.PI * 2)) * 36) % 36
  const next = [...bins]
  next[i] = Math.max(next[i] ?? 0, radius)
  return next
}
export function radialSummary(bins: number[]) {
  const populated = bins.filter((n) => n > 0)
  return {
    coverage: populated.length,
    total: 36,
    error: populated.length
      ? (populated.reduce((sum, n) => sum + Math.abs(n - 1), 0) / populated.length) * 100
      : null,
  }
}

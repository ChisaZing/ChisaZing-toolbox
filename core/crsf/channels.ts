export function latestChannels(rows: Record<string, unknown>[]) {
  for (let i = rows.length - 1; i >= 0; i--) {
    const row = rows[i]!
    if (row.type !== 0x16 || row.trusted !== true || row.error) continue
    const values = (row.fields as { channels_raw?: unknown } | undefined)?.channels_raw
    if (
      Array.isArray(values) &&
      values.length === 16 &&
      values.every((n) => Number.isInteger(n) && n >= 0 && n <= 2047)
    )
      return values as number[]
  }
  return null
}

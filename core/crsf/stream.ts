import { parseCrsf, checksum, toHex } from './index'
export class CrsfStream {
  pending = new Uint8Array(0)
  offset = 0
  push(chunk: Uint8Array) {
    const joined = new Uint8Array(this.pending.length + chunk.length)
    joined.set(this.pending)
    joined.set(chunk, this.pending.length)
    const records: Record<string, unknown>[] = []
    let i = 0
    while (i + 1 < joined.length) {
      const length = joined[i + 1]!
      if (length < 2 || length > 62) {
        records.push({
          offset: this.offset + i,
          error: 'INVALID_LENGTH',
          rawHex: toHex(joined.subarray(i, i + 1)),
        })
        i++
        continue
      }
      const end = i + length + 2
      if (end > joined.length) break
      const frame = parseCrsf(joined.subarray(i, end)).frames[0]!
      records.push({ ...frame, offset: this.offset + i })
      i = checksum(joined.subarray(i + 2, end - 1)) === joined[end - 1] ? end : i + 1
    }
    this.pending = joined.slice(i)
    this.offset += i
    return records
  }
  finish() {
    const result = this.pending.length
      ? { offset: this.offset, error: 'TRUNCATED', rawHex: toHex(this.pending) }
      : null
    this.offset += this.pending.length
    this.pending = new Uint8Array(0)
    return result
  }
}

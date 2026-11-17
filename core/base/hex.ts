export function formatHexBytes(n: bigint) {
  const neg = n < 0n
  let s = (neg ? -n : n).toString(16).toUpperCase()
  if (s.length % 2) s = '0' + s
  return (neg ? '-' : '') + (s.match(/../g) || []).map((b) => '0x' + b).join(' ')
}
export function parseHexBytes(input: string) {
  let s = input.trim(),
    sign = ''
  if (/^[+-]/.test(s)) {
    sign = s[0]!
    s = s.slice(1)
  }
  if (s.length > 11000) throw Error('Byte input too long')
  const tokens = s.trim().split(/\s+/)
  if (!tokens.every((t) => /^0x[0-9a-f]{2}$/i.test(t)))
    throw Error('Expected bytes: 0x01 0xFF / 字节格式应为 0x01 0xFF')
  return sign + tokens.map((t) => t.slice(2)).join('')
}

export function bytes(input: string) {
  const clean = input.replace(/0x/gi, '').replace(/\s/g, '')
  if (!/^[\da-f]*$/i.test(clean) || clean.length % 2)
    throw Error('Invalid hexadecimal byte input / 十六进制字节格式错误')
  return Uint8Array.from(clean.match(/../g) || [], (x) => parseInt(x, 16))
}
export function convertBase(input: string, base: number) {
  if (base < 2 || base > 36 || !Number.isInteger(base)) throw Error('Base must be 2–36')
  let s = input.trim(),
    sign = 1n
  if (s[0] === '-' || s[0] === '+') {
    if (s[0] === '-') sign = -1n
    s = s.slice(1)
  }
  if (!s || s.length > 4096) throw Error('Enter 1–4096 digits / 请输入 1–4096 位整数')
  const prefix = s.slice(0, 2).toLowerCase()
  if (['0x', '0b', '0o'].includes(prefix)) {
    if (({ '0x': 16, '0b': 2, '0o': 8 } as Record<string, number>)[prefix] !== base)
      throw Error('Prefix conflicts with base')
    s = s.slice(2)
  }
  if (!s) throw Error('Missing digits')
  let n = 0n
  for (const [i, c] of [...s].entries()) {
    const d = parseInt(c, 36)
    if (!/[0-9a-z]/i.test(c) || d >= base) throw Error(`Invalid digit at ${i + 1}`)
    n = n * BigInt(base) + BigInt(d)
  }
  return n * sign
}
export const presets = [
  { name: 'CRC-8/SMBUS', width: 8, poly: 7, init: 0, ref: false, xor: 0 },
  { name: 'CRC-8/DVB-S2', width: 8, poly: 213, init: 0, ref: false, xor: 0 },
  { name: 'CRC-16/ARC', width: 16, poly: 32773, init: 0, ref: true, xor: 0 },
  { name: 'CRC-16/MODBUS', width: 16, poly: 32773, init: 65535, ref: true, xor: 0 },
  { name: 'CRC-16/CCITT-FALSE', width: 16, poly: 4129, init: 65535, ref: false, xor: 0 },
  {
    name: 'CRC-32/ISO-HDLC',
    width: 32,
    poly: 79764919,
    init: 4294967295,
    ref: true,
    xor: 4294967295,
  },
]
export function crc(data: Uint8Array, p: (typeof presets)[number]) {
  const w = BigInt(p.width),
    mask = (1n << w) - 1n
  let c = BigInt(p.init)
  const reflect = (v: bigint, bits: number) => {
    let r = 0n
    for (let i = 0; i < bits; i++) {
      r = (r << 1n) | (v & 1n)
      v >>= 1n
    }
    return r
  }
  for (const b of data) {
    c ^= (p.ref ? reflect(BigInt(b), 8) : BigInt(b)) << (w - 8n)
    for (let i = 0; i < 8; i++)
      c = (c & (1n << (w - 1n)) ? (c << 1n) ^ BigInt(p.poly) : c << 1n) & mask
  }
  if (p.ref) c = reflect(c, p.width)
  return (c ^ BigInt(p.xor)) & mask
}
export function ascii(input: string, decode: boolean, radix: number, utf8: boolean) {
  if (new TextEncoder().encode(input).length > 1048576) throw Error('Input exceeds 1 MiB')
  if (!decode) {
    if (!utf8) {
      for (const [i, c] of [...input].entries())
        if (c.codePointAt(0)! > 127) throw Error(`Non ASCII at ${i + 1}`)
    }
    return [...new TextEncoder().encode(input)]
      .map((b) =>
        b
          .toString(radix)
          .toUpperCase()
          .padStart(radix === 16 ? 2 : radix === 2 ? 8 : 1, '0'),
      )
      .join(' ')
  }
  const data = Uint8Array.from(
    input.trim()
      ? input
          .trim()
          .split(/[\s,]+/)
          .map((s, i) => {
            if (![...s].every((c) => /[0-9a-f]/i.test(c) && parseInt(c, 16) < radix))
              throw Error(`Invalid byte ${i + 1}`)
            const n = parseInt(s, radix)
            if (n > (utf8 ? 255 : 127)) throw Error(`Byte out of range ${i + 1}`)
            return n
          })
      : [],
  )
  return new TextDecoder('utf-8', { fatal: true }).decode(data)
}

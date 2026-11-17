export type SignedField = 'decimal' | 'sign' | 'twos' | 'bcd'
export function signedConvert(input: string, field: SignedField, width: number, bcdHex = false) {
  if (![8, 16, 32, 64].includes(width)) throw Error('Invalid width')
  let raw = input.trim()
  if (field === 'bcd' && bcdHex) {
    const neg = raw.startsWith('-')
    const hex = (neg ? raw.slice(1) : raw).trim().replace(/0x/gi, '').replace(/\s/g, '')
    if (!/^[0-9]+$/.test(hex) || hex.length > 100)
      throw Error('BCD HEX digits must be 0–9 / BCD 十六进制每位只能为 0–9')
    raw = (neg ? '-' : '') + [...hex].map((d) => Number(d).toString(2).padStart(4, '0')).join(' ')
  }
  let n: bigint
  if (field === 'decimal') {
    if (!/^[+-]?\d{1,100}$/.test(raw)) throw Error('Enter an integer / 请输入整数')
    n = BigInt(raw)
  } else if (field === 'bcd') {
    const neg = raw.startsWith('-')
    const s = (neg ? raw.slice(1) : raw).replace(/\s/g, '')
    if (!s || s.length > 400 || s.length % 4 || !/^[01]+$/.test(s))
      throw Error('BCD requires 4-bit groups / BCD 必须为 4 位分组')
    let digits = ''
    for (let i = 0; i < s.length; i += 4) {
      const d = parseInt(s.slice(i, i + 4), 2)
      if (d > 9) throw Error('BCD digit must be 0000–1001 / BCD 每组只能为 0000–1001')
      digits += d
    }
    n = BigInt(digits) * (neg ? -1n : 1n)
  } else {
    const s = raw.replace(/\s/g, '')
    if (!new RegExp(`^[01]{${width}}$`).test(s))
      throw Error(`Expected ${width} bits / 请输入 ${width} 位二进制`)
    const unsigned = BigInt('0b' + s)
    n =
      field === 'twos'
        ? s[0] === '1'
          ? unsigned - (1n << BigInt(width))
          : unsigned
        : BigInt('0b' + s.slice(1)) * (s[0] === '1' ? -1n : 1n)
  }
  const half = 1n << BigInt(width - 1),
    magnitude = n < 0n ? -n : n
  if (n < -half || n >= half) throw Error('Value exceeds selected width / 数值超出所选位宽')
  return {
    decimal: n.toString(),
    sign:
      magnitude >= half
        ? ''
        : (n < 0n ? '1' : '0') + magnitude.toString(2).padStart(width - 1, '0'),
    twos: (n < 0n ? (1n << BigInt(width)) + n : n).toString(2).padStart(width, '0'),
    bcd: bcdHex
      ? formatBcdHex(n)
      : (n < 0n ? '-' : '') +
        magnitude
          .toString()
          .split('')
          .map((d) => Number(d).toString(2).padStart(4, '0'))
          .join(' '),
  }
}

export function formatBcdHex(n: bigint) {
  let digits = (n < 0n ? -n : n).toString()
  if (digits.length % 2) digits = '0' + digits
  return (n < 0n ? '-' : '') + (digits.match(/../g) || []).map((b) => '0x' + b).join(' ')
}

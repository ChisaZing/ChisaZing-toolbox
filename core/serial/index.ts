export function serialPayload(input: string, hex: boolean, ending: string) {
  if (!['', '\n', '\r', '\r\n'].includes(ending)) throw Error('Invalid line ending')
  if (new TextEncoder().encode(input).length > 65536)
    throw Error('Send limit: 64 KiB / 单次发送最大 64 KiB')
  if (!hex) {
    const data = new TextEncoder().encode(input + ending)
    if (data.length > 65536) throw Error('Send limit: 64 KiB / 单次发送最大 64 KiB')
    return data
  }
  const s = input.replace(/\s/g, '')
  if (!/^(?:[0-9a-f]{2})*$/i.test(s))
    throw Error('HEX requires complete bytes / HEX 必须为完整字节')
  return Uint8Array.from(s.match(/../g) || [], (s) => parseInt(s, 16))
}
export function validateSerial(baud: number) {
  if (!Number.isInteger(baud) || baud < 1 || baud > 4000000)
    throw Error('Baud rate: 1–4000000 / 波特率范围 1–4000000')
}

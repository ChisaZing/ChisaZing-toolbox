export const specVersion = 'TBS crsf.md reviewed 2026-11-06 (commit pin pending)'
export const toHex = (b: Uint8Array) =>
  Array.from(b, (n) => n.toString(16).padStart(2, '0').toUpperCase()).join(' ')
export function checksum(b: Uint8Array) {
  let c = 0
  for (const n of b) {
    c ^= n
    for (let i = 0; i < 8; i++) c = ((c << 1) ^ (c & 128 ? 213 : 0)) & 255
  }
  return c
}
function decode(type: number, b: Uint8Array): Record<string, unknown> {
  const v = new DataView(b.buffer, b.byteOffset, b.byteLength)
  const need = (n: number) => {
    if (b.length < n) throw Error('PAYLOAD_TOO_SHORT')
  }
  switch (type) {
    case 2:
      need(15)
      return {
        latitude_deg: v.getInt32(0) / 1e7,
        longitude_deg: v.getInt32(4) / 1e7,
        speed_kmh: v.getUint16(8) / 10,
        heading_deg: v.getUint16(10) / 100,
        altitude_m: v.getUint16(12) - 1000,
        satellites: b[14],
      }
    case 8:
      need(8)
      return {
        voltage_V: v.getUint16(0) / 10,
        current_A: v.getUint16(2) / 10,
        capacity_mAh: (b[4]! << 16) | (b[5]! << 8) | b[6]!,
        remaining_percent: b[7],
      }
    case 20:
      need(10)
      return {
        up_rssi_ant1_dBm: -b[0]!,
        up_rssi_ant2_dBm: -b[1]!,
        up_link_quality_percent: b[2],
        up_snr_dB: v.getInt8(3),
        active_antenna: b[4],
        rf_profile: b[5],
        rf_power_enum: b[6],
        down_rssi_dBm: -b[7]!,
        down_link_quality_percent: b[8],
        down_snr_dB: v.getInt8(9),
      }
    case 22: {
      need(22)
      const channels = []
      for (let i = 0; i < 16; i++) {
        let value = 0
        for (let bit = 0; bit < 11; bit++) {
          const p = i * 11 + bit
          value |= ((b[p >> 3]! >> (p % 8)) & 1) << bit
        }
        channels.push(value)
      }
      return { channels_raw: channels }
    }
    case 30:
      need(6)
      return {
        pitch_rad: v.getInt16(0) / 10000,
        roll_rad: v.getInt16(2) / 10000,
        yaw_rad: v.getInt16(4) / 10000,
      }
    case 33:
      return {
        flight_mode: new TextDecoder().decode(
          b.subarray(0, b.indexOf(0) < 0 ? b.length : b.indexOf(0)),
        ),
      }
    default:
      return { semantic: 'NOT_DECODED' }
  }
}
export function parseCrsf(data: Uint8Array) {
  if (data.length > 10 * 1024 * 1024) throw Error('LIMIT_10_MIB')
  const frames: Record<string, unknown>[] = []
  let offset = 0,
    trailingBytes = ''
  while (offset < data.length) {
    if (frames.length >= 20000) throw Error('TOO_MANY_RECORDS')
    const length = data[offset + 1]
    if (length === undefined) {
      trailingBytes = toHex(data.subarray(offset))
      frames.push({ offset, error: 'TRUNCATED', rawHex: trailingBytes })
      break
    }
    if (length < 2 || length > 62) {
      frames.push({
        offset,
        error: 'INVALID_LENGTH',
        rawHex: toHex(data.subarray(offset, offset + 1)),
      })
      offset++
      continue
    }
    const end = offset + length + 2
    if (end > data.length) {
      frames.push({ offset, error: 'TRUNCATED', rawHex: toHex(data.subarray(offset)) })
      offset++
      continue
    }
    const type = data[offset + 2]!,
      payload = data.subarray(offset + 3, end - 1),
      actual = data[end - 1],
      expected = checksum(data.subarray(offset + 2, end - 1))
    const frame: Record<string, unknown> = {
      offset,
      address: data[offset],
      length,
      type,
      payload: toHex(payload),
      crc: actual,
      expectedCRC: expected,
      trusted: actual === expected,
      rawHex: toHex(data.subarray(offset, end)),
    }
    if (actual !== expected) frame.error = 'CRC_MISMATCH'
    try {
      frame.fields = decode(type, payload)
      if (type >= 40) {
        frame.destination = payload[0]
        frame.origin = payload[1]
        frame.additionalCRC = type === 50 ? 'NOT_VERIFIED' : 'NOT_APPLICABLE'
      }
    } catch (e) {
      frame.error = (e as Error).message
    }
    frames.push(frame)
    offset = actual === expected ? end : offset + 1
  }
  return { specVersion, frames, trailingBytes }
}

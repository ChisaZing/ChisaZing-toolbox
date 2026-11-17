export const imageLimits = {
  count: 10,
  file: 20 * 1024 * 1024,
  total: 50 * 1024 * 1024,
  pixels: 20_000_000,
}
export async function inspectImage(file: File) {
  if (file.size > imageLimits.file) throw Error('File exceeds 20 MiB / 文件超过 20 MiB')
  const bytes = new Uint8Array(await file.arrayBuffer())
  const text = (a: number, b: number) => String.fromCharCode(...bytes.slice(a, b))
  let mime = ''
  if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) mime = 'image/jpeg'
  else if (
    bytes[0] === 137 &&
    text(1, 4) === 'PNG' &&
    bytes[4] === 13 &&
    bytes[5] === 10 &&
    bytes[6] === 26 &&
    bytes[7] === 10
  ) {
    mime = 'image/png'
    let offset = 8
    const view = new DataView(bytes.buffer)
    while (offset + 12 <= bytes.length) {
      const length = view.getUint32(offset)
      if (text(offset + 4, offset + 8) === 'acTL')
        throw Error('Animated PNG is unsupported / 不支持动态 PNG')
      offset += 12 + length
    }
  } else if (text(0, 4) === 'RIFF' && text(8, 12) === 'WEBP') {
    mime = 'image/webp'
    let offset = 12
    const view = new DataView(bytes.buffer)
    while (offset + 8 <= bytes.length) {
      const kind = text(offset, offset + 4)
      if (kind === 'ANIM' || kind === 'ANMF' || (kind === 'VP8X' && (bytes[offset + 8] || 0) & 2))
        throw Error('Animated WebP is unsupported / 不支持动态 WebP')
      const size = view.getUint32(offset + 4, true)
      offset += 8 + size + (size % 2)
    }
  }
  if (mime === 'image/png' && bytes.length >= 24) {
    const v = new DataView(bytes.buffer)
    if (v.getUint32(16) * v.getUint32(20) > imageLimits.pixels)
      throw Error('Image exceeds 20 million pixels / 图片超过 2000 万像素')
  }
  if (!mime)
    throw Error('Only static JPEG, PNG and WebP are supported / 仅支持静态 JPEG、PNG、WebP')
  return new Blob([bytes], { type: mime })
}
export function outputSize(width: number, height: number, maxWidth: number) {
  if (!Number.isFinite(maxWidth) || maxWidth < 1 || maxWidth > 10000)
    throw Error('Width must be 1–10000 px / 宽度范围 1–10000 px')
  const scale = Math.min(1, maxWidth / width)
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  }
}
export function validateBatch(files: { size: number }[]) {
  if (files.length > imageLimits.count) throw Error('Maximum 10 images / 最多 10 张图片')
  if (files.reduce((n, f) => n + f.size, 0) > imageLimits.total)
    throw Error('Total exceeds 50 MiB / 总大小超过 50 MiB')
}

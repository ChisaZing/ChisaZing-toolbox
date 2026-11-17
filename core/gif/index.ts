export function validateGif(files: { size: number }[], edge: number, delay: number) {
  if (!files.length || files.length > 60) throw Error('Choose 1–60 frames / 请选择 1–60 帧')
  if (
    files.some((f) => f.size > 10 * 1024 * 1024) ||
    files.reduce((a, f) => a + f.size, 0) > 50 * 1024 * 1024
  )
    throw Error('10 MiB per frame, 50 MiB total / 单帧 10 MiB，总计 50 MiB')
  if (!Number.isInteger(edge) || edge < 1 || edge > 800)
    throw Error('Longest edge: 1–800 px / 最长边范围 1–800 px')
  if (!Number.isInteger(delay) || delay < 20 || delay > 2000 || delay % 10)
    throw Error('Delay: 20–2000 ms, step 10 / 时长 20–2000 ms，步进 10')
  if (files.length * edge * edge * 4 > 128 * 1024 * 1024)
    throw Error(
      'Frame budget exceeds 128 MiB: reduce size or frame count / 帧缓冲超限，请缩小尺寸或减少帧数',
    )
}

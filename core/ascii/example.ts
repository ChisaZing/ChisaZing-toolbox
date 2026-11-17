export function asciiExample(decode: boolean, radix: number, utf8: boolean) {
  const text = utf8 ? 'Hello 中文' : 'Hello'
  if (!decode) return { input: text, expected: '' }
  const values = utf8
    ? [72, 101, 108, 108, 111, 32, 228, 184, 173, 230, 150, 135]
    : [72, 101, 108, 108, 111]
  return {
    input: values
      .map((n) =>
        n
          .toString(radix)
          .toUpperCase()
          .padStart(radix === 2 ? 8 : radix === 16 ? 2 : 1, '0'),
      )
      .join(' '),
    expected: text,
  }
}

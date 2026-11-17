export interface KeyboardKey {
  code: string
  label: string
  x: number
  y: number
  w: number
  h: number
}
export function keyboard104(): KeyboardKey[] {
  const keys: KeyboardKey[] = []
  const add = (code: string, label: string, x: number, y: number, w = 1, h = 1) =>
    keys.push({ code, label, x, y, w, h })
  add('Escape', 'Esc', 0, 0)
  for (let i = 1; i <= 12; i++)
    add(`F${i}`, `F${i}`, 1.5 + i + (i > 4 ? 0.5 : 0) + (i > 8 ? 0.5 : 0), 0)
  const row = (codes: string[], labels: string[], widths: number[], y: number) => {
    let x = 0
    codes.forEach((code, i) => {
      const w = widths[i] || 1
      add(code, labels[i]!, x, y, w)
      x += w
    })
  }
  row(
    [
      'Backquote',
      ...Array.from({ length: 9 }, (_, i) => `Digit${i + 1}`),
      'Digit0',
      'Minus',
      'Equal',
      'Backspace',
    ],
    [
      '~ `',
      '! 1',
      '@ 2',
      '# 3',
      '$ 4',
      '% 5',
      '^ 6',
      '& 7',
      '* 8',
      '( 9',
      ') 0',
      '_ -',
      '+ =',
      'Backspace',
    ],
    [...Array(13).fill(1), 2],
    1.5,
  )
  row(
    [
      'Tab',
      ...'QWERTYUIOP'.split('').map((c) => `Key${c}`),
      'BracketLeft',
      'BracketRight',
      'Backslash',
    ],
    ['Tab', ...'QWERTYUIOP', '{ [', '} ]', '| \\'],
    [1.5, ...Array(12).fill(1), 1.5],
    2.5,
  )
  row(
    ['CapsLock', ...'ASDFGHJKL'.split('').map((c) => `Key${c}`), 'Semicolon', 'Quote', 'Enter'],
    ['Caps Lock', ...'ASDFGHJKL', ': ;', '" \u0027', 'Enter'],
    [1.75, ...Array(11).fill(1), 2.25],
    3.5,
  )
  row(
    [
      'ShiftLeft',
      ...'ZXCVBNM'.split('').map((c) => `Key${c}`),
      'Comma',
      'Period',
      'Slash',
      'ShiftRight',
    ],
    ['Shift', ...'ZXCVBNM', '< ,', '> .', '? /', 'Shift'],
    [2.25, ...Array(10).fill(1), 2.75],
    4.5,
  )
  row(
    [
      'ControlLeft',
      'MetaLeft',
      'AltLeft',
      'Space',
      'AltRight',
      'MetaRight',
      'ContextMenu',
      'ControlRight',
    ],
    ['Ctrl', 'Win', 'Alt', 'Space', 'Alt', 'Win', 'Menu', 'Ctrl'],
    [1.25, 1.25, 1.25, 6.25, 1.25, 1.25, 1.25, 1.25],
    5.5,
  )
  ;[
    ['PrintScreen', 'PrtSc'],
    ['ScrollLock', 'Scroll'],
    ['Pause', 'Pause'],
  ].forEach(([c, l], i) => add(c!, l!, 15.5 + i, 0))
  ;[
    ['Insert', 'Home', 'PageUp'],
    ['Delete', 'End', 'PageDown'],
  ].forEach((r, j) =>
    r.forEach((c, i) =>
      add(
        c,
        ({ PageUp: 'PgUp', PageDown: 'PgDn' } as Record<string, string>)[c] || c,
        15.5 + i,
        1.5 + j,
      ),
    ),
  )
  add('ArrowUp', '↑', 16.5, 4.5)
  add('ArrowLeft', '←', 15.5, 5.5)
  add('ArrowDown', '↓', 16.5, 5.5)
  add('ArrowRight', '→', 17.5, 5.5)
  ;['NumLock', 'NumpadDivide', 'NumpadMultiply', 'NumpadSubtract'].forEach((c, i) =>
    add(c, ['Num', '/', '*', '−'][i]!, 19 + i, 1.5),
  )
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 3; c++) {
      const n = 7 - r * 3 + c
      add(`Numpad${n}`, String(n), 19 + c, 2.5 + r)
    }
  add('NumpadAdd', '+', 22, 2.5, 1, 2)
  add('NumpadEnter', 'Enter', 22, 4.5, 1, 2)
  add('Numpad0', '0', 19, 5.5, 2)
  add('NumpadDecimal', '.', 21, 5.5)
  return keys
}

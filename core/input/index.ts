export function keyboardRows() {
  return [
    ['Escape', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'],
    [
      'Backquote',
      ...Array.from({ length: 9 }, (_, i) => `Digit${i + 1}`),
      'Digit0',
      'Minus',
      'Equal',
      'Backspace',
    ],
    [
      'Tab',
      ...'QWERTYUIOP'.split('').map((c) => `Key${c}`),
      'BracketLeft',
      'BracketRight',
      'Backslash',
    ],
    ['CapsLock', ...'ASDFGHJKL'.split('').map((c) => `Key${c}`), 'Semicolon', 'Quote', 'Enter'],
    [
      'ShiftLeft',
      ...'ZXCVBNM'.split('').map((c) => `Key${c}`),
      'Comma',
      'Period',
      'Slash',
      'ShiftRight',
    ],
    [
      'ControlLeft',
      'MetaLeft',
      'AltLeft',
      'Space',
      'AltRight',
      'MetaRight',
      'ContextMenu',
      'ControlRight',
      'ArrowLeft',
      'ArrowUp',
      'ArrowDown',
      'ArrowRight',
    ],
  ]
}
export class ClickSession {
  private pressed = new Set<number>()
  count = 0
  downs = 0
  ups = 0
  started: number | null = null
  interrupted = false
  constructor(public duration: number) {}
  down(button: number) {
    if (!this.pressed.has(button)) {
      this.pressed.add(button)
      this.downs++
    }
  }
  up(button: number, now: number) {
    if (!this.pressed.delete(button)) return false
    this.ups++
    if (button !== 0 || this.finished(now) || this.interrupted) return false
    if (this.started === null) this.started = now
    this.count++
    return true
  }
  finished(now: number) {
    return this.started !== null && now - this.started >= this.duration * 1000
  }
  remaining(now: number) {
    return this.started === null
      ? this.duration
      : Math.max(0, this.duration - (now - this.started) / 1000)
  }
  interrupt() {
    this.pressed.clear()
    this.interrupted = true
  }
  get cps() {
    return this.count / this.duration
  }
}

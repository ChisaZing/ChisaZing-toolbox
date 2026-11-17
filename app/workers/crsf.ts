import { parseCrsf } from '../../core/crsf'
import { bytes } from '../../core'

self.onmessage = (e: MessageEvent) => {
  try {
    const input = e.data.input
    postMessage({
      result: parseCrsf(typeof input === 'string' ? bytes(input) : new Uint8Array(input)),
    })
  } catch (error) {
    postMessage({ error: (error as Error).message })
  }
}

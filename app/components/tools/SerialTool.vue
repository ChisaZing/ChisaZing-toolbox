<script setup lang="ts">
import { serialPayload, validateSerial } from '../../../core/serial'
import { toHex } from '../../../core/crsf'

defineProps<{ en: boolean }>()

interface Port {
  readable: ReadableStream<Uint8Array> | null
  writable: WritableStream<Uint8Array> | null

  open(options: Record<string, unknown>): Promise<void>

  close(): Promise<void>
}

const supported = ref(false),
  state = ref('idle'),
  baud = ref(115200),
  bits = ref(8),
  stopBits = ref(1),
  parity = ref('none'),
  flow = ref('none'),
  txHex = ref(false),
  rxHex = ref(false),
  ending = ref(''),
  input = ref(''),
  error = ref(''),
  sending = ref(false),
  rx = ref(0),
  tx = ref(0),
  dropped = ref(0)
const baudRates = [
  1200, 2400, 4800, 9600, 19200, 38400, 57600, 115200, 230400, 400000, 420000, 460800, 921600,
  1000000, 1500000, 2000000,
]

type Row = {
  id: number
  time: string
  direction: string
  hex: string
  text: string
  length: number
}
const logs = ref<Row[]>([])
let sequence = 0,
  bufferBytes = 0,
  disposed = false,
  stopped = false,
  port: Port | undefined,
  reader: ReadableStreamDefaultReader<Uint8Array> | undefined,
  readTask: Promise<void> | undefined,
  writeTask: Promise<void> | undefined
let decoder = new TextDecoder()
onMounted(() => (supported.value = isSecureContext && 'serial' in navigator))

function log(direction: string, data: Uint8Array, text: string) {
  logs.value.push({
    id: ++sequence,
    time: new Date().toISOString(),
    direction,
    hex: toHex(data),
    text,
    length: data.length,
  })
  bufferBytes += data.length
  while (logs.value.length > 1000 || bufferBytes > 1024 * 1024) {
    bufferBytes -= logs.value.shift()!.length
    dropped.value++
  }
}

function clear() {
  logs.value = []
  bufferBytes = 0
  dropped.value = 0
  rx.value = tx.value = 0
}

async function connect() {
  if (state.value === 'connecting' || state.value === 'connected' || state.value === 'closing')
    return
  error.value = ''
  try {
    validateSerial(baud.value)
    state.value = 'connecting'
    const chosen = await (
      navigator as Navigator & { serial: { requestPort(): Promise<Port> } }
    ).serial.requestPort()
    if (disposed) return
    port = chosen
    await chosen.open({
      baudRate: baud.value,
      dataBits: bits.value,
      stopBits: stopBits.value,
      parity: parity.value,
      flowControl: flow.value,
    })
    if (disposed) {
      await chosen.close()
      port = undefined
      return
    }
    decoder = new TextDecoder()
    stopped = false
    state.value = 'connected'
    readTask = read()
  } catch (e) {
    state.value = 'idle'
    if ((e as Error).name !== 'NotFoundError') error.value = (e as Error).message
  }
}

async function read() {
  const current = port
  try {
    if (!current?.readable) throw Error('Readable stream unavailable')
    reader = current.readable.getReader()
    while (!stopped) {
      const { value, done } = await reader.read()
      if (done) break
      if (value) {
        rx.value += value.length
        log('RX', value, decoder.decode(value, { stream: true }))
      }
    }
  } catch (e) {
    if (!stopped && !disposed) error.value = (e as Error).message
  } finally {
    reader?.releaseLock()
    reader = undefined
    const tail = decoder.decode()
    if (tail) log('RX', new Uint8Array(0), tail)
    try {
      await writeTask
    } catch {}
    try {
      await current?.close()
    } catch (e) {
      if (!disposed) error.value = (e as Error).message
    }
    if (port === current) port = undefined
    state.value = 'idle'
  }
}

async function disconnect() {
  if (state.value !== 'connected') return
  state.value = 'closing'
  stopped = true
  try {
    await reader?.cancel()
    await readTask
  } catch (e) {
    error.value = (e as Error).message
  }
}

async function send() {
  if (state.value !== 'connected' || sending.value) return
  error.value = ''
  try {
    const command = input.value
    const data = serialPayload(command, txHex.value, ending.value)
    if (!data.length) throw Error('No data to send / 发送数据为空')
    const writer = port?.writable?.getWriter()
    if (!writer) throw Error('Writable stream unavailable')
    sending.value = true
    writeTask = (async () => {
      try {
        await writer.write(data)
        tx.value += data.length
        log('TX', data, new TextDecoder().decode(data))
      } finally {
        writer.releaseLock()
      }
    })()
    await writeTask
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    writeTask = undefined
    sending.value = false
  }
}

function download() {
  const u = URL.createObjectURL(
    new Blob(
      [
        JSON.stringify(
          {
            rxBytes: rx.value,
            txBytes: tx.value,
            dropped: dropped.value,
            records: logs.value,
          },
          null,
          2,
        ),
      ],
      { type: 'application/json' },
    ),
  )
  const a = document.createElement('a')
  a.href = u
  a.download = 'serial-log.json'
  a.click()
  setTimeout(() => URL.revokeObjectURL(u), 1000)
}

onBeforeUnmount(() => {
  disposed = true
  void disconnect()
})
</script>
<template>
  <section class="panel">
    <h2>{{ en ? 'Serial connection' : '串口连接' }}</h2>
    <p v-if="!supported" class="my-3 muted">
      {{
        en
          ? 'Use Web Serial in a supported desktop browser over HTTPS or localhost.'
          : '请在支持 Web Serial 的桌面浏览器中使用，需 HTTPS 或 localhost。'
      }}
    </p>
    <fieldset :disabled="state !== 'idle'" class="flex flex-wrap gap-4 my-5">
      <div>
        <span>{{ en ? 'Baud rate' : '波特率' }}</span>
        <ToolsBaudRateInput v-model="baud" :en="en" :disabled="state !== 'idle'" />
      </div>
      <label
        >{{ en ? 'Data bits' : '数据位'
        }}<select v-model="bits" class="block">
          <option :value="7">7</option>
          <option :value="8">8</option>
        </select></label
      ><label
        >{{ en ? 'Stop bits' : '停止位'
        }}<select v-model="stopBits" class="block">
          <option :value="1">1</option>
          <option :value="2">2</option>
        </select></label
      ><label
        >{{ en ? 'Parity' : '校验位'
        }}<select v-model="parity" class="block">
          <option value="none">None</option>
          <option value="even">Even</option>
          <option value="odd">Odd</option>
        </select></label
      ><label
        >{{ en ? 'Flow control' : '流控'
        }}<select v-model="flow" class="block">
          <option value="none">None</option>
          <option value="hardware">RTS/CTS</option>
        </select></label
      >
    </fieldset>
    <div class="flex gap-3 flex-wrap">
      <UiButton :disabled="!supported || state !== 'idle'" @click="connect">
        {{ en ? 'Select port & connect' : '选择串口并连接' }}
      </UiButton>
      <UiButton variant="outline" :disabled="state !== 'connected'" @click="disconnect">
        {{ en ? 'Disconnect' : '断开连接' }}
      </UiButton>
    </div>
    <p role="status" class="my-3">
      {{
        en
          ? state
          : {
              idle: '未连接',
              connecting: '连接中',
              connected: '已连接',
              closing: '断开中',
            }[state]
      }}
      · RX {{ rx }} bytes · TX {{ tx }} bytes
    </p>
    <p v-if="error" role="alert" class="text-destructive my-3">{{ error }}</p>
    <div class="border-t pt-5 mt-5">
      <div class="flex gap-4 items-center flex-wrap mb-3">
        <h2>{{ en ? 'Receive log' : '接收与发送日志' }}</h2>
        <label class="check-option"
          ><input v-model="rxHex" type="checkbox" />{{ en ? 'HEX display' : 'HEX 显示' }}</label
        >
        <UiButton variant="ghost" @click="clear">{{ en ? 'Clear' : '清空' }}</UiButton>
        <UiButton variant="outline" :disabled="!logs.length" @click="download"
          >{{ en ? 'Export JSON' : '导出 JSON' }}
        </UiButton>
      </div>
      <div class="bg-muted rounded-lg p-3 max-h-96 overflow-auto min-h-40">
        <p v-if="!logs.length" class="muted">
          {{ en ? 'Waiting for data' : '等待数据' }}
        </p>
        <div v-for="row in logs" :key="row.id" class="mb-3 text-sm">
          <span class="text-xs muted"
            >{{ row.time }} · {{ row.direction }} · {{ row.length }} bytes</span
          >
          <pre>{{ rxHex ? row.hex : row.text }}</pre>
        </div>
      </div>
      <p class="muted text-xs mt-2">
        {{
          en
            ? 'Latest 1000 records / 1 MiB retained. Discarded'
            : '保留最近 1000 条 / 1 MiB，淘汰记录'
        }}: {{ dropped }}
      </p>
    </div>
    <div class="border-t pt-5 mt-5">
      <h2>{{ en ? 'Send data' : '发送数据' }}</h2>
      <div class="flex flex-wrap items-center gap-4 my-3">
        <label class="check-option"
          ><input v-model="txHex" type="checkbox" />{{
            en ? 'Send HEX bytes' : 'HEX 字节发送'
          }}</label
        ><label v-if="!txHex"
          >{{ en ? 'Append line ending' : '附加换行' }}
          <select v-model="ending">
            <option value="">None</option>
            <option :value="'\n'">LF</option>
            <option :value="'\r'">CR</option>
            <option :value="'\r\n'">CRLF</option>
          </select></label
        >
      </div>
      <label for="serial-send" class="sr-only">{{ en ? 'Data to send' : '待发送内容' }}</label>
      <UiTextarea
        id="serial-send"
        v-model="input"
        class="h-28 mb-3"
        :placeholder="txHex ? '48 65 6C 6C 6F' : en ? 'UTF-8 text' : 'UTF-8 文本'"
      />
      <UiButton :disabled="state !== 'connected' || sending || !input.length" @click="send">
        {{ en ? 'Send once' : '发送一次' }}
      </UiButton>
      <p class="muted text-xs mt-3">
        {{
          en
            ? 'Up to 64 KiB per send. HEX requires complete byte pairs; line endings apply only to text. No automatic sending.'
            : '单次最多 64 KiB。HEX 必须为完整字节对；换行仅作用于文本。不自动发送。'
        }}
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { CrsfStream } from '../../../core/crsf/stream'
import { latestChannels } from '../../../core/crsf/channels'

defineProps<{ en: boolean }>()

interface Port {
  readable: ReadableStream<Uint8Array> | null

  open(options: {
    baudRate: number
    dataBits: 8
    stopBits: 1
    parity: 'none'
    flowControl: 'none'
  }): Promise<void>

  close(): Promise<void>
}

interface Serial {
  requestPort(): Promise<Port>
}

const supported = ref(false),
  state = ref('idle'),
  baud = ref(420000),
  error = ref(''),
  records = ref<Record<string, unknown>[]>([]),
  received = ref(0),
  dropped = ref(0)
let port: Port | undefined,
  reader: ReadableStreamDefaultReader<Uint8Array> | undefined,
  reading: Promise<void> | undefined
let stopped = false,
  disposed = false
let parser = new CrsfStream()
let closing = false
onMounted(() => {
  supported.value = isSecureContext && 'serial' in navigator
})
const channels = ref<number[] | null>(null),
  channelTime = ref(0),
  clock = ref(0)
let clockTimer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  clockTimer = setInterval(() => (clock.value = Date.now()), 250)
})
const channelsStale = computed(
  () => state.value !== 'connected' || clock.value - channelTime.value > 1000,
)

function clearRecords() {
  records.value = []
  dropped.value = 0
  channels.value = null
  channelTime.value = 0
}

function append(rows: Record<string, unknown>[]) {
  const latest = latestChannels(rows)
  if (latest) {
    channels.value = latest
    channelTime.value = Date.now()
    clock.value = channelTime.value
  }
  records.value.push(...rows)
  if (records.value.length > 1000) {
    dropped.value += records.value.length - 1000
    records.value = records.value.slice(-1000)
  }
}

async function connect() {
  if (state.value === 'connecting' || state.value === 'connected' || closing) return
  if (!Number.isInteger(baud.value) || baud.value < 1 || baud.value > 4000000) {
    error.value = 'Baud rate: 1–4000000 / 波特率范围 1–4000000'
    return
  }
  state.value = 'connecting'
  error.value = ''
  try {
    const serial = (navigator as Navigator & { serial: Serial }).serial
    port = await serial.requestPort()
    if (disposed) {
      state.value = 'idle'
      return
    }
    await port.open({
      baudRate: baud.value,
      dataBits: 8,
      stopBits: 1,
      parity: 'none',
      flowControl: 'none',
    })
    if (disposed) {
      await port.close()
      return
    }
    parser = new CrsfStream()
    clearRecords()
    received.value = 0
    stopped = false
    state.value = 'connected'
    reading = read()
  } catch (e) {
    state.value = (e as Error).name === 'NotFoundError' ? 'cancelled' : 'failed'
    if (state.value === 'failed') error.value = (e as Error).message
  }
}

async function read() {
  try {
    if (!port?.readable) throw Error('Serial stream unavailable')
    reader = port.readable.getReader()
    while (!stopped) {
      const { value, done } = await reader.read()
      if (done) break
      if (value) {
        received.value += value.length
        append(parser.push(value))
      }
    }
  } catch (e) {
    if (!stopped && !disposed) {
      error.value = (e as Error).message
      state.value = 'failed'
    }
  } finally {
    reader?.releaseLock()
    reader = undefined
    const tail = parser.finish()
    if (tail) append([tail])
    try {
      await port?.close()
    } catch (e) {
      if (!disposed) error.value = (e as Error).message
    }
    port = undefined
    if (state.value === 'connected') state.value = 'disconnected'
  }
}

async function disconnect() {
  if (closing) return
  closing = true
  stopped = true
  try {
    await reader?.cancel()
    await reading
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    closing = false
    if (state.value === 'connected') state.value = 'disconnected'
  }
}

function download() {
  const u = URL.createObjectURL(
    new Blob(
      [
        JSON.stringify(
          {
            receivedBytes: received.value,
            droppedRecords: dropped.value,
            frames: records.value,
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
  a.download = 'crsf-live.json'
  a.click()
  setTimeout(() => URL.revokeObjectURL(u), 1000)
}

onBeforeUnmount(() => {
  disposed = true
  if (clockTimer) clearInterval(clockTimer)
  void disconnect()
})
</script>
<template>
  <section class="panel mb-6">
    <h2>{{ en ? 'Live serial parsing' : '串口实时解析' }}</h2>
    <p v-if="!supported" class="muted mt-3">
      {{
        en
          ? 'Web Serial requires a supported desktop browser (Chrome / Edge) and HTTPS or localhost.'
          : 'Web Serial 需要支持的桌面浏览器（Chrome / Edge）及 HTTPS 或 localhost。'
      }}
    </p>
    <p class="muted my-3">
      {{
        en
          ? 'Receive only · 8 data bits, no parity, 1 stop bit · no flow control'
          : '仅接收数据 · 8 数据位、无校验、1 停止位 · 无流控'
      }}
    </p>
    <div class="flex gap-3 flex-wrap items-end">
      <label
        >{{ en ? 'Baud rate' : '波特率' }}
        <UiInput
          v-model.number="baud"
          type="number"
          min="1"
          max="4000000"
          list="crsf-baud"
          class="w-44 mt-2"
          :disabled="state === 'connected' || state === 'connecting'"
        />
        <datalist id="crsf-baud">
          <option
            v-for="n in [9600, 57600, 115200, 400000, 420000, 921600, 1000000, 1870000]"
            :value="n"
          />
        </datalist>
      </label>
      <UiButton
        :disabled="!supported || state === 'connecting' || state === 'connected'"
        @click="connect"
      >
        {{ en ? 'Select serial port & connect' : '选择串口并连接' }}
      </UiButton>
      <UiButton variant="outline" :disabled="state !== 'connected'" @click="disconnect">
        {{ en ? 'Disconnect' : '断开连接' }}
      </UiButton>
      <UiButton variant="outline" @click="clearRecords">{{
        en ? 'Clear records' : '清空记录'
      }}</UiButton>
      <UiButton variant="outline" :disabled="!records.length" @click="download"
        >{{ en ? 'Export JSON' : '导出 JSON' }}
      </UiButton>
    </div>
    <p class="my-3" role="status">
      {{
        en
          ? state
          : {
              idle: '未连接',
              connecting: '选择 / 连接中',
              connected: '接收中',
              cancelled: '已取消',
              failed: '连接失败',
              disconnected: '已断开',
            }[state]
      }}
      · {{ received }} bytes · {{ en ? 'Discarded records' : '淘汰记录' }} {{ dropped }}
    </p>
    <p v-if="error" role="alert" class="text-destructive mb-3">{{ error }}</p>
    <p class="muted text-xs mb-3">
      {{
        en
          ? 'Latest 1000 records retained. Partial frames are buffered across reads and marked truncated on disconnect.'
          : '保留最近 1000 条记录；分包帧跨读取缓存，断开时残余字节标记截断。'
      }}
    </p>
    <div class="rounded-lg border p-4 my-5">
      <div class="flex justify-between items-center gap-3 mb-3">
        <h3 class="font-semibold">
          {{ en ? 'Live RC channels' : '实时 RC 通道' }}
        </h3>
        <span class="text-xs muted">{{
          !channels
            ? en
              ? 'Waiting for channel frame'
              : '等待通道帧'
            : channelsStale
              ? en
                ? 'Stale / disconnected'
                : '数据已过期 / 已断开'
              : en
                ? 'Live'
                : '实时'
        }}</span>
      </div>
      <p class="muted text-xs mb-4">
        {{
          en
            ? 'Raw 11-bit values (0–2047), not percentages or microseconds. Only CRC-valid 0x16 frames update these bars.'
            : '显示 11 位原始值（0–2047），不换算百分比或微秒；仅 CRC 正确的 0x16 帧更新数值。'
        }}
      </p>
      <div
        class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4"
        :class="channelsStale && channels ? 'opacity-50' : ''"
      >
        <div v-for="i in 16" :key="i">
          <div class="flex justify-between text-sm mb-1">
            <label :for="`rc-channel-${i}`" class="font-medium">CH {{ i }}</label
            ><span class="font-mono tabular-nums">{{ channels?.[i - 1] ?? '—' }}</span>
          </div>
          <progress
            :id="`rc-channel-${i}`"
            class="channel-progress"
            :value="channels?.[i - 1] ?? 0"
            max="2047"
            :aria-label="`CH ${i}`"
            :aria-valuetext="channels ? String(channels[i - 1]) : en ? 'No data' : '暂无数据'"
          />
        </div>
      </div>
    </div>
    <pre class="max-h-96 overflow-auto bg-muted rounded-lg p-4">{{
      records.length
        ? JSON.stringify(records, null, 2)
        : en
          ? 'Waiting for serial data'
          : '等待串口数据'
    }}</pre>
  </section>
</template>

<style scoped>
.channel-progress {
  display: block;
  width: 100%;
  height: 12px;
  appearance: none;
  border: 0;
  border-radius: 999px;
  overflow: hidden;
  background: var(--muted);
  color: var(--primary);
}

.channel-progress::-webkit-progress-bar {
  background: var(--muted);
  border-radius: 999px;
}

.channel-progress::-webkit-progress-value {
  background: var(--primary);
  border-radius: 999px;
}

.channel-progress::-moz-progress-bar {
  background: var(--primary);
  border-radius: 999px;
}
</style>

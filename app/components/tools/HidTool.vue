<script setup lang="ts">
import { prepareReport, type Collection } from '../../../core/hid'
import { toHex } from '../../../core/crsf'

const props = defineProps<{ en: boolean }>()

interface Device extends EventTarget {
  productName: string
  vendorId: number
  productId: number
  opened: boolean
  collections: Collection[]
  sendReport(id: number, data: Uint8Array): Promise<void>
  sendFeatureReport(id: number, data: Uint8Array): Promise<void>

  open(): Promise<void>

  close(): Promise<void>

  forget?: () => Promise<void>
}

interface Hid extends EventTarget {
  requestDevice(options: { filters: unknown[] }): Promise<Device[]>
}

const supported = ref(false),
  device = shallowRef<Device>(),
  opened = ref(false),
  busy = ref(false),
  paused = ref(false),
  error = ref(''),
  status = ref(''),
  logs = ref<{ time: string; reportId: number; hex: string; length: number }[]>([])
let hid: Hid | undefined
let disposed = false

const sendKind = ref<'output' | 'feature'>('output'),
  reportId = ref(0),
  payload = ref(''),
  sending = ref(false),
  sendStatus = ref('')
async function send() {
  if (sending.value) return
  error.value = ''
  sendStatus.value = ''
  try {
    const d = device.value
    if (!d?.opened || !opened.value)
      throw Error(props.en ? 'Connect a device first.' : '请先连接设备。')
    const kind = sendKind.value,
      id = reportId.value,
      data = prepareReport(d.collections, kind, id, payload.value)
    if (
      !window.confirm(
        (props.en ? 'Send to device?' : '确认发送到设备？') +
          '\n' +
          d.productName +
          '\nVID: ' +
          d.vendorId +
          ' PID: ' +
          d.productId +
          '\n' +
          kind +
          ' · Report ID ' +
          id +
          ' · ' +
          data.length +
          ' bytes\n' +
          toHex(data),
      )
    )
      return
    if (device.value !== d || !opened.value || !d.opened)
      throw Error('Device disconnected / 设备已断开')
    sending.value = true
    if (kind === 'output') await d.sendReport(id, data)
    else await d.sendFeatureReport(id, data)
    if (disposed || device.value !== d) return
    sendStatus.value = props.en ? 'Report sent successfully.' : '报文发送成功。'
  } catch (e) {
    if (!disposed) error.value = (e as Error).message
  } finally {
    sending.value = false
  }
}
function report(e: Event) {
  if (paused.value) return
  const event = e as Event & { data: DataView; reportId: number }
  const data = new Uint8Array(event.data.buffer, event.data.byteOffset, event.data.byteLength)
  if (data.length > 1024 * 1024) return
  logs.value.push({
    time: new Date().toISOString(),
    reportId: event.reportId,
    hex: toHex(data),
    length: data.length,
  })
  let size = logs.value.reduce((n, l) => n + l.length, 0)
  while (logs.value.length > 1000 || size > 5 * 1024 * 1024) {
    size -= logs.value.shift()!.length
  }
}

function unplug(e: Event) {
  if ((e as Event & { device: Device }).device === device.value) {
    opened.value = false
    status.value = 'disconnected'
    device.value?.removeEventListener('inputreport', report)
  }
}

onMounted(() => {
  supported.value = isSecureContext && 'hid' in navigator
  if (supported.value) {
    hid = (navigator as Navigator & { hid: Hid }).hid
    hid.addEventListener('disconnect', unplug)
  }
})

async function close() {
  const d = device.value
  d?.removeEventListener('inputreport', report)
  try {
    if (d?.opened) await d.close()
  } catch (e) {
    error.value = (e as Error).message
  }
  opened.value = false
}

async function connect() {
  busy.value = true
  error.value = ''
  try {
    await close()
    const devices = await hid!.requestDevice({ filters: [] })
    if (!devices.length) {
      status.value = 'cancelled'
      return
    }
    device.value = devices[0]
    if (disposed) return
    await device.value!.open()
    if (disposed) {
      await close()
      return
    }
    opened.value = true
    device.value!.addEventListener('inputreport', report)
    status.value = 'connected'
  } catch (e) {
    error.value = (e as Error).message
    status.value = 'failed'
  } finally {
    busy.value = false
  }
}

async function forget() {
  await close()
  try {
    await device.value?.forget?.()
    device.value = undefined
    status.value = 'disconnected'
  } catch (e) {
    error.value = (e as Error).message
  }
}

function download() {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(logs.value, null, 2)], { type: 'application/json' }),
  )
  const a = document.createElement('a')
  a.href = url
  a.download = 'hid-reports.json'
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

onBeforeUnmount(() => {
  disposed = true
  hid?.removeEventListener('disconnect', unplug)
  void close()
})
</script>
<template>
  <section class="panel">
    <h2>{{ en ? 'HID connection and input reports' : 'HID 连接与输入报告' }}</h2>
    <p class="muted my-3">
      {{
        en
          ? 'Preview: real-device validation is pending. Protected keyboard and mouse reports may be unavailable.'
          : '预览功能：真实设备验收仍待完成。普通键盘鼠标的受保护报告可能无法访问。'
      }}
    </p>
    <p v-if="!supported" class="my-3">
      {{
        en
          ? 'WebHID requires a supported desktop browser and a secure context.'
          : 'WebHID 需要支持的桌面浏览器及安全上下文。'
      }}
    </p>
    <div class="flex gap-3 flex-wrap">
      <UiButton :disabled="!supported || busy || opened" @click="connect">
        {{ en ? 'Select device & open' : '选择设备并打开' }}
      </UiButton>
      <UiButton variant="outline" :disabled="!opened || sending" @click="close">{{
        en ? 'Close' : '关闭连接'
      }}</UiButton>
      <UiButton variant="outline" :disabled="!device?.forget || sending" @click="forget">
        {{ en ? 'Revoke permission' : '撤销权限' }}
      </UiButton>
      <UiButton variant="outline" @click="paused = !paused">
        {{ paused ? (en ? 'Resume display' : '恢复显示') : en ? 'Pause display' : '暂停显示' }}
      </UiButton>
      <UiButton variant="ghost" @click="logs = []">{{ en ? 'Clear' : '清空' }}</UiButton>
      <UiButton variant="outline" :disabled="!logs.length" @click="download"
        >{{ en ? 'Download JSON' : '下载 JSON' }}
      </UiButton>
    </div>
    <p role="status" class="my-3">
      {{ status }} · {{ opened ? (en ? 'Open' : '已打开') : en ? 'Closed' : '已关闭' }}
    </p>
    <p v-if="error" role="alert" class="text-destructive">{{ error }}</p>
    <div v-if="device" class="my-4">
      <p>{{ device.productName }}</p>
      <p>vendorId: {{ device.vendorId }} · productId: {{ device.productId }}</p>
      <details class="mt-3">
        <summary>Collections</summary>
        <pre>{{ JSON.stringify(device.collections, null, 2) }}</pre>
      </details>
    </div>
    <section class="border rounded-lg p-4 my-5">
      <h2 class="text-base mb-4">{{ en ? 'Send HID report' : '发送 HID 报文' }}</h2>
      <fieldset :disabled="sending">
        <div class="flex gap-4 flex-wrap mb-4">
          <label
            >{{ en ? 'Report type' : '报告类型'
            }}<select v-model="sendKind" class="block">
              <option value="output">Output Report</option>
              <option value="feature">Feature Report</option>
            </select></label
          ><label
            >Report ID <span class="text-xs muted">(0–255)</span
            ><UiInput v-model.number="reportId" class="w-32" type="number" min="0" max="255"
          /></label>
        </div>
        <label for="hid-payload">{{
          en ? 'HEX payload (exclude Report ID)' : 'HEX 数据（不包含 Report ID）'
        }}</label><UiTextarea
          id="hid-payload"
          v-model="payload"
          class="mt-2 mb-3 h-28"
          placeholder="01 02 FF"
          spellcheck="false"
        />
        <p class="text-xs muted mb-3">
          {{
            en
              ? 'Use the report ID and exact byte length described by your device. For unnumbered reports use ID 0. Each send requires confirmation; no automatic sending.'
              : '使用设备定义的报告 ID 和准确字节长度；无报告 ID 的设备填写 0。每次发送需确认，不自动发送。'
          }}
        </p>
        <UiButton :disabled="!opened || sending" @click="send">{{
          sending ? (en ? 'Sending…' : '发送中…') : en ? 'Review and send' : '确认并发送'
        }}</UiButton>
      </fieldset>
      <p v-if="sendStatus" role="status" class="text-sm mt-3">{{ sendStatus }}</p>
    </section>
    <p class="muted text-xs my-3">
      {{
        en
          ? 'Pausing skips log display, not device transmission. Buffer: 1000 reports or 5 MiB.'
          : '暂停显示不停止设备发送；日志最多 1000 条或 5 MiB。'
      }}
    </p>
    <ToolsHidReportList :logs="logs" :en="en" />
  </section>
</template>

<script setup lang="ts">
import { radialSample, radialSummary } from '../../../core/gamepad'

defineProps<{ en: boolean }>()
type Snapshot = {
  index: number
  id: string
  mapping: string
  timestamp: number
  axes: number[]
  buttons: { value: number; pressed: boolean; touched: boolean }[]
}
type Actuator = {
  playEffect(type: string, params: Record<string, number>): Promise<string>
  reset(): Promise<void>
}
const supported = ref(false),
  running = ref(true),
  pads = ref<Snapshot[]>([]),
  selected = ref(0),
  error = ref(''),
  vibrating = ref(false),
  testing = ref(false),
  bins = ref([Array(36).fill(0), Array(36).fill(0)]),
  trails = ref<{ x: number; y: number }[][]>([[], []])
let frame = 0,
  last = 0,
  actuator: Actuator | undefined,
  disposed = false
const current = computed(() => pads.value.find((p) => p.index === selected.value))
const slots = computed(() =>
  Array.from({ length: Math.max(8, ...pads.value.map((p) => p.index + 1)) }, (_, i) =>
    pads.value.find((p) => p.index === i),
  ),
)
const vibrationAvailable = ref(false)
const names = [
  'A / Cross',
  'B / Circle',
  'X / Square',
  'Y / Triangle',
  'LB / L1',
  'RB / R1',
  'LT / L2',
  'RT / R2',
  'View / Select',
  'Menu / Start',
  'L stick',
  'R stick',
  'D-pad ↑',
  'D-pad ↓',
  'D-pad ←',
  'D-pad →',
  'Home',
]
const controls = [
  { i: 0, x: 314, y: 148, label: 'A' },
  { i: 1, x: 343, y: 118, label: 'B' },
  {
    i: 2,
    x: 285,
    y: 118,
    label: 'X',
  },
  { i: 3, x: 314, y: 88, label: 'Y' },
  { i: 8, x: 185, y: 120, label: '◀' },
  { i: 9, x: 225, y: 120, label: '▶' },
  {
    i: 16,
    x: 205,
    y: 87,
    label: '⌂',
  },
  { i: 12, x: 155, y: 167, label: '↑' },
  { i: 13, x: 155, y: 209, label: '↓' },
  {
    i: 14,
    x: 134,
    y: 188,
    label: '←',
  },
  { i: 15, x: 176, y: 188, label: '→' },
]
const down = (i: number) => !!current.value?.buttons[i]?.pressed

function reset() {
  bins.value = [Array(36).fill(0), Array(36).fill(0)]
  trails.value = [[], []]
}

async function stopVibration() {
  try {
    await actuator?.reset()
  } catch {}
  actuator = undefined
  vibrating.value = false
}

watch(selected, () => {
  void stopVibration()
  reset()
  testing.value = false
})

function poll(time: number) {
  if (disposed || document.hidden || !running.value) return
  if (time - last >= 30) {
    last = time
    try {
      const devices = Array.from(navigator.getGamepads()).filter(
        (p): p is Gamepad => !!p && p.connected,
      )
      pads.value = devices.map((p) => ({
        index: p.index,
        id: p.id,
        mapping: p.mapping,
        timestamp: p.timestamp,
        axes: Array.from(p.axes),
        buttons: p.buttons.map((b) => ({ value: b.value, pressed: b.pressed, touched: b.touched })),
      }))
      if (!pads.value.some((p) => p.index === selected.value) && pads.value.length)
        selected.value = pads.value[0]!.index
      const p = devices.find((p) => p.index === selected.value)
      vibrationAvailable.value = !!(p as unknown as { vibrationActuator?: Actuator })
        ?.vibrationActuator?.playEffect
      if (!p) {
        void stopVibration()
        reset()
        testing.value = false
      }
      if (current.value && testing.value) {
        for (let i = 0; i < 2; i++) {
          const x = current.value.axes[i * 2],
            y = current.value.axes[i * 2 + 1]
          if (x === undefined || y === undefined) continue
          bins.value[i] = radialSample(bins.value[i]!, x, y)
          trails.value[i] = [...trails.value[i]!.slice(-359), { x, y }]
        }
      }
    } catch (e) {
      error.value = (e as Error).message
      running.value = false
    }
  }
  frame = requestAnimationFrame(poll)
}

function visibility() {
  cancelAnimationFrame(frame)
  void stopVibration()
  pads.value = []
  if (!document.hidden && running.value && supported.value) frame = requestAnimationFrame(poll)
}

function toggle() {
  running.value = !running.value
  visibility()
}

async function vibrate() {
  error.value = ''
  try {
    const p = navigator.getGamepads()[selected.value] as unknown as { vibrationActuator?: Actuator }
    if (!p?.vibrationActuator) throw Error('Vibration unavailable / 不支持震动')
    actuator = p.vibrationActuator
    vibrating.value = true
    const result = await actuator.playEffect('dual-rumble', {
      startDelay: 0,
      duration: 1000,
      strongMagnitude: 0.5,
      weakMagnitude: 0.5,
    })
    if (result === 'preempted' && !disposed) error.value = 'Vibration interrupted / 震动已中断'
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    vibrating.value = false
  }
}

onMounted(() => {
  supported.value = isSecureContext && typeof navigator.getGamepads === 'function'
  document.addEventListener('visibilitychange', visibility)
  if (supported.value) frame = requestAnimationFrame(poll)
})
onBeforeUnmount(() => {
  disposed = true
  cancelAnimationFrame(frame)
  document.removeEventListener('visibilitychange', visibility)
  void stopVibration()
})
</script>
<template>
  <section class="panel">
    <div class="flex justify-between gap-3 items-center mb-5">
      <h2>{{ en ? 'Connected controllers' : '手柄连接' }}</h2>
      <UiButton variant="outline" :disabled="!supported" @click="toggle">
        {{ running ? (en ? 'Pause' : '暂停检测') : en ? 'Resume' : '恢复检测' }}
      </UiButton>
    </div>
    <p v-if="!supported" role="status" class="muted mb-4">
      {{
        en
          ? 'Gamepad API is unavailable. Try a supported browser over HTTPS or localhost.'
          : '当前无法使用 Gamepad API，请使用支持的浏览器及 HTTPS 或 localhost。'
      }}
    </p>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
      <button
        v-for="(pad, i) in slots"
        :key="i"
        class="border rounded-lg p-3 text-left min-w-0"
        :class="selected === i && pad ? 'border-primary bg-muted' : ''"
        :disabled="!pad"
        :aria-pressed="selected === i"
        @click="selected = i"
      >
        <span class="text-xs muted">{{ en ? 'Slot' : '插槽' }} {{ i + 1 }}</span>
        <p class="truncate text-sm font-medium mt-1" :title="pad?.id">
          {{ pad?.id || (en ? 'Not detected' : '未检测到') }}
        </p>
        <div v-if="pad" class="flex flex-wrap gap-1 mt-2">
          <span
            v-for="(b, j) in pad.buttons"
            :key="j"
            class="size-1.5 rounded-full"
            :class="b.pressed ? 'bg-primary' : 'bg-border'"
          />
        </div>
      </button>
    </div>
    <div v-if="!current" class="rounded-xl border border-dashed p-10 text-center">
      <p class="text-xl font-semibold">
        {{ en ? 'Connect a gamepad and press a button' : '连接手柄，并按下任意按键开始' }}
      </p>
      <p class="muted mt-3 text-sm">
        {{
          en
            ? 'USB or Bluetooth controllers may require interaction before the browser exposes them.'
            : '支持浏览器可识别的 USB 或蓝牙手柄；部分浏览器需先操作手柄才会显示。'
        }}
      </p>
    </div>
    <template v-else
      ><h3 class="text-xl font-semibold break-all">{{ current.id }}</h3>
      <div class="flex flex-wrap gap-5 text-sm my-4">
        <span>INDEX {{ current.index }}</span
        ><span>MAPPING {{ current.mapping || 'non-standard' }}</span
        ><span>TIMESTAMP {{ current.timestamp.toFixed(2) }}</span
        ><span>{{ current.buttons.length }} buttons / {{ current.axes.length }} axes</span>
      </div>
      <div class="grid lg:grid-cols-2 gap-6">
        <div>
          <div class="grid grid-cols-3 sm:grid-cols-4 gap-2">
            <div
              v-for="(b, i) in current.buttons"
              :key="i"
              class="border rounded-lg p-2"
              :class="b.pressed ? 'border-primary bg-muted' : ''"
            >
              <div class="text-xs muted">
                B{{ i }} <span v-if="current.mapping === 'standard'">{{ names[i] }}</span>
              </div>
              <div class="font-mono tabular-nums mt-1">
                {{ b.value.toFixed(3) }} {{ b.pressed ? '●' : '' }}
              </div>
              <progress class="w-full h-1.5" :value="b.value" max="1" :aria-label="`B${i}`" />
              <p class="text-xs muted">{{ b.touched ? 'touched' : '—' }}</p>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4 mt-5">
            <div v-for="stick in Math.floor(current.axes.length / 2)" :key="stick" class="min-w-0">
              <h4 class="text-sm font-medium">{{ en ? 'Stick' : '摇杆' }} {{ stick }}</h4>
              <svg
                viewBox="0 0 120 120"
                class="w-full max-w-48 border rounded-full bg-muted/30 my-3"
                :aria-label="`Axes ${(stick - 1) * 2}, ${(stick - 1) * 2 + 1}`"
              >
                <circle cx="60" cy="60" r="53" fill="none" stroke="var(--border)" />
                <path d="M60 0V120M0 60H120" stroke="var(--border)" />
                <polyline
                  v-if="stick <= 2"
                  :points="
                    trails[stick - 1]!.map((p) => `${60 + p.x * 53},${60 + p.y * 53}`).join(' ')
                  "
                  fill="none"
                  stroke="var(--primary)"
                  stroke-width=".7"
                  opacity=".4"
                />
                <circle
                  :cx="60 + (current.axes[(stick - 1) * 2] ?? 0) * 53"
                  :cy="60 + (current.axes[(stick - 1) * 2 + 1] ?? 0) * 53"
                  r="4"
                  fill="var(--primary)"
                />
              </svg>
              <p class="font-mono text-xs">
                X {{ current.axes[(stick - 1) * 2]?.toFixed(5) }}<br />Y
                {{ current.axes[(stick - 1) * 2 + 1]?.toFixed(5) }}
              </p>
              <p v-if="stick <= 2 && testing" class="text-xs mt-2">
                {{ en ? 'Coverage' : '覆盖' }} {{ radialSummary(bins[stick - 1]!).coverage }}/36 ·
                {{ en ? 'Radial deviation' : '径向偏差' }}
                {{ radialSummary(bins[stick - 1]!).error?.toFixed(2) ?? '—' }}%
              </p>
            </div>
          </div>
          <div class="flex flex-wrap gap-2 my-4">
            <UiButton
              variant="outline"
              @click="
                () => {
                  reset()
                  testing = !testing
                }
              "
            >
              {{
                testing
                  ? en
                    ? 'Stop trace'
                    : '停止轨迹'
                  : en
                    ? 'Record stick trace'
                    : '记录摇杆轨迹'
              }}
            </UiButton>
            <UiButton
              variant="outline"
              :disabled="!vibrationAvailable || vibrating"
              @click="vibrate"
            >
              {{ en ? 'Vibrate · 1 sec' : '震动 · 1 秒' }}
            </UiButton>
            <UiButton variant="ghost" :disabled="!vibrating" @click="stopVibration">
              {{ en ? 'Stop vibration' : '停止震动' }}
            </UiButton>
          </div>
        </div>
        <div class="flex flex-col justify-center">
          <ToolsGamepadDiagram
            v-if="current.mapping === 'standard'"
            :axes="current.axes"
            :pressed="current.buttons.map((b) => b.pressed)"
            :values="current.buttons.map((b) => b.value)"
            :en="en"
          />
          <p v-else class="muted p-6">
            {{
              en
                ? 'Non-standard mapping: use raw button and axis indices. Standard diagram is hidden to avoid incorrect labels.'
                : '非标准映射：请查看原始按键和轴索引，隐藏标准示意图以免错误对应。'
            }}
          </p>
          <p class="text-xs muted mt-4">
            {{
              en
                ? 'Stick values are unfiltered. Trace deviation compares sampled radial maxima with a unit circle; it is not a hardware certification or polling-rate measurement.'
                : '摇杆值不做死区过滤；轨迹偏差按已采样方向的最大半径与单位圆比较，不代表硬件认证或真实回报率。'
            }}
          </p>
        </div>
      </div>
      <div class="flex flex-wrap gap-3 border-t pt-4 mt-4">
        <span v-for="(axis, i) in current.axes" :key="i" class="text-xs font-mono"
          >AXIS {{ i }}: {{ axis.toFixed(5) }}</span
        >
      </div>
    </template>
    <p v-if="error" role="alert" class="text-destructive mt-4">{{ error }}</p>
  </section>
</template>

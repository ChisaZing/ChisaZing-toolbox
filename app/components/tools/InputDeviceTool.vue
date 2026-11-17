<script setup lang="ts">
import { keyboardRows, ClickSession } from '../../../core/input'

const props = defineProps<{ en: boolean; slug: string }>()
const keyboard = computed(() => props.slug === 'keyboard-test')
const active = ref(false)
const area = ref<HTMLElement>()
const pressed = ref<string[]>([])
const last = ref<Record<string, unknown>>({})
const count = ref(0)
const duration = ref(5)
const session = ref(new ClickSession(5))
const now = ref(0)
const doubles = ref(0)
const interrupted = ref(false)
const trail = ref<{ x: number; y: number }[]>([])
let timer: ReturnType<typeof setInterval> | undefined
const history = ref<
  { id: number; time: string; code: string; key: string; state: string; repeat: boolean }[]
>([])
let historyId = 0
const rows = keyboardRows()
const remaining = computed(() => session.value.remaining(now.value))
const finished = computed(() => session.value.finished(now.value))

function clearPressed() {
  pressed.value = []
  session.value.interrupt()
}

function stop(lost = false) {
  if (!active.value) return
  active.value = false
  interrupted.value = lost
  clearPressed()
  if (timer) clearInterval(timer)
  timer = undefined
}

async function start() {
  stop()
  pressed.value = []
  last.value = {}
  count.value = 0
  history.value = []
  doubles.value = 0
  trail.value = []
  interrupted.value = false
  session.value = new ClickSession(duration.value)
  now.value = performance.now()
  active.value = true
  await nextTick()
  area.value?.focus()
  timer = setInterval(() => {
    now.value = performance.now()
    if (!keyboard.value && session.value.finished(now.value)) stop()
  }, 25)
}

function key(e: KeyboardEvent, down: boolean) {
  if (!active.value || !keyboard.value) return
  e.preventDefault()
  history.value.unshift({
    id: ++historyId,
    time:
      new Date().toLocaleTimeString(props.en ? 'en-GB' : 'zh-CN', { hour12: false }) +
      '.' +
      String(new Date().getMilliseconds()).padStart(3, '0'),
    code: e.code,
    key: e.key,
    state: down ? 'down' : 'up',
    repeat: e.repeat,
  })
  if (history.value.length > 500) history.value.length = 500
  if (down) {
    if (!pressed.value.includes(e.code)) {
      pressed.value.push(e.code)
      count.value++
    }
  } else pressed.value = pressed.value.filter((c) => c !== e.code)
  last.value = {
    code: e.code,
    key: e.key,
    location: e.location,
    repeat: e.repeat,
    isComposing: e.isComposing,
    ctrl: e.ctrlKey,
    shift: e.shiftKey,
    alt: e.altKey,
    meta: e.metaKey,
    state: down ? 'down' : 'up',
  }
}

function mouse(e: MouseEvent, kind: string) {
  if (!active.value || keyboard.value) return
  now.value = performance.now()
  if (kind === 'down') {
    e.preventDefault()
    session.value.down(e.button)
  }
  if (kind === 'up') session.value.up(e.button, now.value)
  if (kind === 'double') doubles.value++
  if (kind === 'move') {
    const r = area.value!.getBoundingClientRect()
    trail.value = [
      ...trail.value.slice(-149),
      {
        x: ((e.clientX - r.left) / r.width) * 100,
        y: ((e.clientY - r.top) / r.height) * 100,
      },
    ]
  }
  last.value = { event: kind, button: e.button, buttons: e.buttons, x: e.offsetX, y: e.offsetY }
}

function wheel(e: WheelEvent) {
  if (!active.value || keyboard.value) return
  e.preventDefault()
  last.value = { event: 'wheel', deltaX: e.deltaX, deltaY: e.deltaY, deltaMode: e.deltaMode }
}

function visibility() {
  if (document.hidden) lostFocus()
}

onMounted(() => {
  document.addEventListener('visibilitychange', visibility)
  window.addEventListener('blur', lostFocus)
})

function lostFocus() {
  if (keyboard.value) {
    pressed.value = []
  } else stop(true)
}

onBeforeUnmount(() => {
  stop()
  document.removeEventListener('visibilitychange', visibility)
  window.removeEventListener('blur', lostFocus)
})
</script>
<template>
  <div class="panel">
    <div class="flex gap-3 flex-wrap items-center mb-5">
      <UiButton variant="default" :disabled="active" @click="start">{{
        en ? 'Start test' : '开始测试'
      }}</UiButton>
      <UiButton variant="outline" :disabled="!active" @click="stop()">{{
        en ? 'Cancel test' : '取消测试'
      }}</UiButton>
      <label v-if="!keyboard"
        >{{ en ? 'Duration' : '测试时长' }}
        <select v-model="duration" :disabled="active" class="w-24">
          <option v-for="n in [1, 5, 10]" :value="n">{{ n }} s</option>
        </select></label
      ><span role="status">{{
        interrupted
          ? en
            ? 'Interrupted by focus loss'
            : '失去焦点，测试已中断'
          : active
            ? en
              ? 'Testing'
              : '测试中'
            : finished
              ? en
                ? 'Finished'
                : '已完成'
              : en
                ? 'Ready'
                : '待开始'
      }}</span>
    </div>
    <p class="muted mb-4">
      {{
        keyboard
          ? en
            ? 'Click Cancel test to end. Fn and system shortcuts may not be observable.'
            : '点击“取消测试”结束。Fn 和系统快捷键可能无法观测。'
          : en
            ? 'Use a physical mouse. First completed left click starts the timer. Observed browser events do not measure DPI, latency or hardware polling rate.'
            : '请使用实体鼠标，首次有效左键点击开始计时。浏览器事件不能测量 DPI、延迟或真实回报率。'
      }}
    </p>
    <div
      ref="area"
      tabindex="0"
      class="border-2 rounded-xl p-3 outline-primary relative overflow-hidden min-h-64"
      :class="active ? 'border-primary' : 'border-border'"
      :aria-label="en ? 'Input test area' : '输入测试区域'"
      @keydown="key($event, true)"
      @keyup="key($event, false)"
      @blur="lostFocus"
      @mousedown="mouse($event, 'down')"
      @mouseup="mouse($event, 'up')"
      @mousemove="mouse($event, 'move')"
      @dblclick="mouse($event, 'double')"
      @wheel="wheel"
      @contextmenu="active && !keyboard && $event.preventDefault()"
    >
      <ToolsKeyboardLayout v-if="keyboard" :pressed="pressed" :en="en" />
      <template v-else>
        <svg
          class="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <polyline
            :points="trail.map((p) => `${p.x},${p.y}`).join(' ')"
            fill="none"
            stroke="currentColor"
            stroke-width=".3"
          />
        </svg>
        <p class="relative text-center pt-20 pointer-events-none">
          {{ en ? 'Move, click and scroll here' : '在此移动、点击和滚动鼠标' }}
        </p></template
      >
    </div>
    <div class="grid-tools mt-5" aria-live="polite">
      <div class="bg-muted rounded-xl p-4">
        <template v-if="keyboard"
          >{{ en ? 'Independent presses' : '独立按下次数' }}: {{ count }}
          <p>{{ en ? 'Held' : '当前按下' }}: {{ pressed.join(', ') || '—' }}</p></template
        >
        <template v-else
          ><p>
            {{ en ? 'Clicks / down / up' : '点击 / 按下 / 释放' }}: {{ session.count }} /
            {{ session.downs }} / {{ session.ups }}
          </p>
          <p>{{ en ? 'Double clicks' : '双击' }}: {{ doubles }}</p>
          <p>{{ en ? 'Remaining' : '剩余' }}: {{ remaining.toFixed(2) }} s</p>
          <p v-if="finished && !interrupted">CPS: {{ session.cps.toFixed(2) }}</p></template
        >
      </div>
      <pre class="bg-muted rounded-xl p-4">{{ JSON.stringify(last, null, 2) }}</pre>
    </div>
    <section v-if="keyboard" class="mt-6">
      <div class="flex items-center justify-between gap-3 mb-3">
        <h2>{{ en ? 'Key history' : '历史按键记录' }}</h2>
        <UiButton variant="outline" :disabled="!history.length" @click="history = []">
          {{ en ? 'Clear history' : '清空记录' }}
        </UiButton>
      </div>
      <p class="muted text-xs mb-3">
        {{
          en
            ? 'Newest first · Up to 500 events · Stored only for this session'
            : '最新记录在前 · 最多保留 500 条事件 · 仅保存在本次页面会话中'
        }}
      </p>
      <div class="max-h-80 overflow-auto rounded-lg border">
        <table class="w-full text-sm text-left">
          <thead class="sticky top-0 bg-muted">
            <tr>
              <th class="p-3">{{ en ? 'Time' : '时间' }}</th>
              <th class="p-3">{{ en ? 'Event' : '事件' }}</th>
              <th class="p-3">code</th>
              <th class="p-3">key</th>
              <th class="p-3">repeat</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="entry in history" :key="entry.id" class="border-t">
              <td class="p-3 whitespace-nowrap font-mono">{{ entry.time }}</td>
              <td class="p-3 whitespace-nowrap">
                {{ en ? entry.state : entry.state === 'down' ? '按下' : '释放' }}
              </td>
              <td class="p-3 font-mono">{{ entry.code }}</td>
              <td class="p-3 font-mono whitespace-pre-wrap break-all">
                {{ entry.key === ' ' ? (en ? 'Space' : '空格') : entry.key }}
              </td>
              <td class="p-3">{{ entry.repeat }}</td>
            </tr>
            <tr v-if="!history.length">
              <td colspan="5" class="p-6 text-center muted">
                {{ en ? 'No key events yet' : '暂无按键记录' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
    <p class="muted text-xs mt-4">
      {{
        keyboard
          ? en
            ? 'Only the focused test area observes keys. Focus loss clears held keys; click the area to continue.'
            : '仅在测试区获得焦点时监听按键；失焦清空按下状态，点击测试区可继续。'
          : en
            ? 'Focus loss interrupts the mouse test.'
            : '失焦时中断鼠标测试。'
      }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { validateGif } from '../../../core/gif'

defineProps<{ en: boolean }>()
const frames = ref<File[]>([]),
  edge = ref(480),
  delay = ref(100),
  loop = ref(true),
  busy = ref(false),
  done = ref(0),
  error = ref(''),
  url = ref(''),
  status = ref('')
let worker: Worker | undefined
let dragging = -1

function cancel() {
  worker?.terminate()
  worker = undefined
  if (busy.value) status.value = 'cancelled'
  busy.value = false
}

function invalidate() {
  cancel()
  if (url.value) URL.revokeObjectURL(url.value)
  url.value = ''
  done.value = 0
}

watch([edge, delay, loop], invalidate)

function choose(e: Event) {
  const added = Array.from((e.target as HTMLInputElement).files || [])
  if (!added.length) return
  error.value = ''
  try {
    const next = [...frames.value, ...added]
    validateGif(next, edge.value, delay.value)
    invalidate()
    frames.value = next
  } catch (e) {
    error.value = (e as Error).message
  }
}

function move(i: number, to: number) {
  if (to < 0 || to >= frames.value.length) return
  invalidate()
  const f = frames.value.splice(i, 1)[0]!
  frames.value.splice(to, 0, f)
}

function remove(i: number) {
  invalidate()
  frames.value.splice(i, 1)
}

function run() {
  invalidate()
  error.value = ''
  try {
    validateGif(frames.value, edge.value, delay.value)
    busy.value = true
    status.value = 'encoding'
    const current = new Worker(new URL('../../workers/gif.ts', import.meta.url), { type: 'module' })
    worker = current
    current.onmessage = (e) => {
      if (worker !== current) return
      if (e.data.error) {
        error.value = e.data.error
        cancel()
        status.value = 'failed'
      } else if (e.data.blob) {
        url.value = URL.createObjectURL(e.data.blob)
        busy.value = false
        status.value = 'success'
        current.terminate()
        worker = undefined
      } else done.value = e.data.done
    }
    current.onerror = (event) => {
      error.value = event.message || 'Worker unavailable / 编码线程不可用'
      cancel()
      status.value = 'failed'
    }
    current.postMessage({
      files: frames.value.map((f) => f),
      edge: edge.value,
      delay: delay.value,
      loop: loop.value,
    })
  } catch (e) {
    error.value = (e as Error).message
    cancel()
  }
}

onBeforeUnmount(invalidate)
</script>
<template>
  <section class="panel">
    <h2>{{ en ? 'Image sequence to GIF' : '图片序列生成 GIF' }}</h2>
    <p class="muted my-3">
      {{
        en
          ? '1–60 static JPEG / PNG / WebP frames. 10 MiB each, 50 MiB total. GIF uses up to 256 colors; quantization loses color detail. White background, contain fit.'
          : '支持 1–60 张静态 JPEG / PNG / WebP，单张 10 MiB，总计 50 MiB。GIF 最多 256 色，量化会损失颜色细节；使用白色背景，等比居中填充。'
      }}
    </p>
    <ToolsFilePicker :en="en" :files="frames" :append="true" :disabled="busy" @change="choose" />
    <div class="flex flex-wrap gap-5 items-center my-4">
      <label
        >{{ en ? 'Longest edge (px)' : '最长边（px）' }}
        <UiInput v-model.number="edge" class="w-36" type="number" min="1" max="800" /> </label
      ><label
        >{{ en ? 'Frame duration (ms)' : '每帧时长（ms）' }}
        <UiInput
          v-model.number="delay"
          class="w-36"
          type="number"
          min="20"
          max="2000"
          step="10"
        /> </label
      ><label class="check-option"
        ><input v-model="loop" type="checkbox" />{{ en ? 'Loop forever' : '无限循环' }}</label
      >
    </div>
    <ol class="max-h-72 overflow-auto border rounded-lg mb-4">
      <li
        v-for="(f, i) in frames"
        :key="i"
        draggable="true"
        class="flex items-center flex-wrap gap-2 p-2 border-b"
        @dragstart="dragging = i"
        @dragover.prevent
        @drop.prevent="move(dragging, i)"
      >
        <span class="flex-1 min-w-0 break-all">{{ i + 1 }}. {{ f.name }}</span>
        <UiButton
          variant="ghost"
          :disabled="busy || i === 0"
          :aria-label="en ? 'Move up' : '上移'"
          @click="move(i, i - 1)"
          >↑
        </UiButton>
        <UiButton
          variant="ghost"
          :disabled="busy || i === frames.length - 1"
          :aria-label="en ? 'Move down' : '下移'"
          @click="move(i, i + 1)"
          >↓
        </UiButton>
        <UiButton variant="ghost" :disabled="busy" @click="remove(i)">{{
          en ? 'Remove' : '删除'
        }}</UiButton>
      </li>
    </ol>
    <div class="flex gap-3">
      <UiButton :disabled="busy || !frames.length" @click="run">{{
        en ? 'Generate GIF' : '生成 GIF'
      }}</UiButton>
      <UiButton variant="outline" :disabled="!busy" @click="cancel">{{
        en ? 'Cancel' : '取消'
      }}</UiButton>
    </div>
    <p v-if="busy" role="status" class="mt-3">
      {{ en ? 'Encoding frames' : '正在编码帧' }} {{ done }} / {{ frames.length }}
    </p>
    <progress
      v-if="busy"
      :value="done"
      :max="frames.length"
      class="w-full mt-2"
      :aria-label="en ? 'Completed frames' : '已完成帧数'"
    />
    <p v-if="status === 'cancelled'" role="status">{{ en ? 'Cancelled' : '已取消' }}</p>
    <p v-if="error" role="alert" class="text-destructive mt-3">{{ error }}</p>
    <div v-if="url" class="mt-5">
      <img
        :src="url"
        :alt="en ? 'Generated GIF' : '生成的 GIF'"
        class="max-h-96 max-w-full mb-3"
      /><a :href="url" download="animation.gif" class="underline">{{
        en ? 'Download GIF' : '下载 GIF'
      }}</a>
    </div>
    <p class="muted text-xs mt-4">
      {{
        en
          ? 'Inputs are not saved. Cancel stops the encoding worker.'
          : '输入不会保存；取消会终止编码 Worker。'
      }}
    </p>
  </section>
</template>

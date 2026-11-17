<script setup lang="ts">
defineProps<{ en: boolean }>()
const input = ref(''),
  result = ref(''),
  error = ref(''),
  busy = ref(false),
  stale = ref(false)
let worker: Worker | undefined
let file: File | undefined
const filename = ref('')
const selectedFiles = ref<File[]>([])

function cancel() {
  worker?.terminate()
  worker = undefined
  busy.value = false
}

function changed() {
  cancel()
  stale.value = !!result.value
}

watch(input, () => {
  file = undefined
  selectedFiles.value = []
  filename.value = ''
  changed()
})

function choose(e: Event) {
  changed()
  file = (e.target as HTMLInputElement).files?.[0]
  filename.value = file?.name || ''
  selectedFiles.value = file ? [file] : []
}

async function run() {
  cancel()
  error.value = ''
  busy.value = true
  const current = new Worker(new URL('../../workers/crsf.ts', import.meta.url), { type: 'module' })
  worker = current
  current.onmessage = (e) => {
    if (worker !== current) return
    if (e.data.error) error.value = e.data.error
    else {
      result.value = JSON.stringify(e.data.result, null, 2)
      stale.value = false
    }
    cancel()
  }
  current.onerror = () => {
    error.value = 'Worker failed / 工作线程失败'
    cancel()
  }
  try {
    if (file && file.size > 10 * 1024 * 1024) throw Error('Maximum 10 MiB / 最大 10 MiB')
    if (input.value.length > 32 * 1024 * 1024) throw Error('Input too large / 输入过大')
    const data = file
      ? file.name.toLowerCase().endsWith('.txt')
        ? await file.text()
        : await file.arrayBuffer()
      : input.value
    if (worker === current) current.postMessage({ input: data })
  } catch (e) {
    error.value = (e as Error).message
    cancel()
  }
}

function download() {
  const url = URL.createObjectURL(new Blob([result.value], { type: 'application/json' }))
  const a = document.createElement('a')
  a.href = url
  a.download = 'crsf.json'
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

onBeforeUnmount(cancel)
</script>
<template>
  <div>
    <ToolsCrsfSerial :en="en" />
    <div class="panel">
      <h2>{{ en ? 'Offline CRSF stream parser' : '离线 CRSF 字节流解析' }}</h2>
      <p class="muted my-3">
        {{
          en
            ? 'Paste HEX or select a .bin / .txt file, up to 10 MiB. CRC failures are untrusted; recovery scans byte by byte.'
            : '粘贴 HEX 或选择 .bin / .txt 文件，最大 10 MiB。坏 CRC 标记不可信并逐字节尝试恢复。'
        }}
      </p>
      <label for="crsf-source">HEX</label>
      <UiTextarea id="crsf-source" v-model="input" class="h-40 my-3" />
      <ToolsFilePicker
        :en="en"
        :files="selectedFiles"
        :images="false"
        :multiple="false"
        accept=".bin,.txt"
        :disabled="busy"
        @change="choose"
      />
      <div class="flex gap-3 flex-wrap my-4">
        <UiButton :disabled="busy" @click="run">{{ en ? 'Parse frames' : '解析报文' }}</UiButton>
        <UiButton variant="outline" :disabled="!busy" @click="cancel">{{
          en ? 'Cancel' : '取消'
        }}</UiButton>
        <UiButton variant="outline" @click="input = 'C8 07 32 EE 13 13 01 66 06'">
          {{ en ? 'Specification example' : '加载规范示例' }}
        </UiButton>
        <UiButton variant="outline" :disabled="!result || stale || busy" @click="download">
          {{ en ? 'Download JSON' : '下载 JSON' }}
        </UiButton>
      </div>
      <p v-if="error" role="alert" class="text-destructive">{{ error }}</p>
      <p v-if="stale" role="status">
        {{ en ? 'Input changed; parse again.' : '输入已改变，请重新解析。' }}
      </p>
      <pre class="bg-muted rounded-lg p-4 max-h-[600px] overflow-auto" aria-live="polite">{{
        result || (en ? 'Results appear here' : '解析结果显示在这里')
      }}</pre>
      <p class="muted mt-4 text-sm">
        {{
          en
            ? 'Command-specific secondary CRC is not verified. Protocol commit and independent semantic fixtures are pending validation. Input is not saved.'
            : '特殊命令额外 CRC 尚未校验。协议 commit 锁定及独立语义金样本仍待验收。输入不保存。'
        }}
      </p>
    </div>
  </div>
</template>

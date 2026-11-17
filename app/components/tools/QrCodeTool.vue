<script setup lang="ts">
const props = defineProps<{ en: boolean }>()
const input = ref(''),
  level = ref('M'),
  size = ref(512),
  error = ref(''),
  busy = ref(false),
  png = ref(''),
  svg = ref(''),
  stale = ref(false)
let job = 0
watch([input, level, size], () => {
  job++
  busy.value = false
  stale.value = !!png.value
})

async function generate() {
  const id = ++job
  error.value = ''
  busy.value = true
  try {
    if (!input.value.length) throw Error(props.en ? 'Enter text or a URL.' : '请输入文本或网址。')
    if (new TextEncoder().encode(input.value).length > 2953)
      throw Error(props.en ? 'Content exceeds QR capacity.' : '内容超过二维码容量。')
    if (!Number.isInteger(size.value) || size.value < 128 || size.value > 2048)
      throw Error('Size: 128–2048 px / 尺寸范围 128–2048 px')
    const QR = await import('qrcode')
    const options = {
      width: size.value,
      margin: 4,
      errorCorrectionLevel: level.value as 'L' | 'M' | 'Q' | 'H',
    }
    const p = await QR.toDataURL(input.value, options)
    const s = await QR.toString(input.value, { ...options, type: 'svg' })
    if (id !== job) return
    png.value = p
    svg.value = s
    stale.value = false
  } catch (e) {
    if (id === job) error.value = (e as Error).message
  } finally {
    if (id === job) busy.value = false
  }
}

function downloadSvg() {
  const url = URL.createObjectURL(new Blob([svg.value], { type: 'image/svg+xml' }))
  const a = document.createElement('a')
  a.href = url
  a.download = 'qrcode.svg'
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

onBeforeUnmount(() => job++)
</script>
<template>
  <div class="workspace">
    <section class="panel">
      <h2>{{ en ? 'QR content' : '二维码内容' }}</h2>
      <label for="qr-input" class="block text-sm mt-4 mb-2">{{
        en ? 'Text or URL (encoded exactly as entered)' : '文本或网址（按原样编码）'
      }}</label>
      <UiTextarea
        id="qr-input"
        v-model="input"
        class="h-44"
        :placeholder="en ? 'Enter text or https://…' : '输入文本或 https://…'"
      />
      <div class="flex flex-wrap gap-4 my-4">
        <label
          >{{ en ? 'Size (px)' : '尺寸（px）' }}
          <UiInput v-model.number="size" type="number" min="128" max="2048" class="w-32" /> </label
        ><label
          >{{ en ? 'Error correction' : '纠错等级'
          }}<select v-model="level" class="block">
            <option v-for="l in ['L', 'M', 'Q', 'H']" :value="l">{{ l }}</option>
          </select></label
        >
      </div>
      <div class="flex gap-2 flex-wrap">
        <UiButton :disabled="busy" @click="generate">{{
          en ? 'Generate QR code' : '生成二维码'
        }}</UiButton>
        <UiButton variant="outline" @click="input = 'Hello, 世界!'">{{
          en ? 'Example' : '加载示例'
        }}</UiButton>
        <UiButton
          variant="ghost"
          @click="
            () => {
              input = ''
              png = ''
              svg = ''
            }
          "
          >{{ en ? 'Clear' : '清空' }}</UiButton
        >
      </div>
      <p v-if="error" role="alert" class="text-destructive mt-3">{{ error }}</p>
      <p class="text-xs muted mt-4">
        {{
          en
            ? 'Generated locally. Content is not saved or uploaded. Higher correction levels reduce capacity.'
            : '本地生成，内容不保存、不上传；更高纠错等级会降低容量。'
        }}
      </p>
    </section>
    <section class="panel">
      <h2>{{ en ? 'Preview and download' : '预览与下载' }}</h2>
      <p v-if="stale" role="status" class="mt-3 text-amber-600">
        {{ en ? 'Content changed. Generate again.' : '内容已改变，请重新生成。' }}
      </p>
      <div class="flex items-center justify-center min-h-64 my-4 rounded-lg bg-muted">
        <img
          v-if="png"
          :src="png"
          :alt="en ? 'Generated QR code' : '生成的二维码'"
          class="max-w-full max-h-80 object-contain"
        />
        <p v-else class="muted text-sm">
          {{ en ? 'Your QR code appears here' : '生成后在此预览二维码' }}
        </p>
      </div>
      <div v-if="png && !stale" class="flex gap-3">
        <a
          :href="png"
          download="qrcode.png"
          class="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-4 min-h-11"
          >{{ en ? 'Download PNG' : '下载 PNG' }}</a
        >
        <UiButton variant="outline" @click="downloadSvg">{{
          en ? 'Download SVG' : '下载 SVG'
        }}</UiButton>
      </div>
      <p class="text-xs muted mt-4">
        {{
          en
            ? 'Test scanning before printing or sharing. The quiet zone is fixed at four modules.'
            : '打印或分享前请实测扫码。四周保留 4 模块留白。'
        }}
      </p>
    </section>
  </div>
</template>

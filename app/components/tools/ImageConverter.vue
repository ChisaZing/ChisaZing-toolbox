<script setup lang="ts">
import { inspectImage, imageLimits, outputSize, validateBatch } from '../../../core/image'

const props = defineProps<{ en: boolean }>()
type Item = {
  file: File
  status: string
  error?: string
  url?: string
  blob?: Blob
  width?: number
  height?: number
  original?: string
}
const items = ref<Item[]>([]),
  format = ref('image/webp'),
  quality = ref(0.85),
  width = ref(1920),
  background = ref('#ffffff'),
  busy = ref(false),
  error = ref(''),
  stale = ref(false),
  supported = ref<string[]>([])
let job = 0
onMounted(() => {
  const c = document.createElement('canvas')
  c.width = c.height = 1
  supported.value = ['image/png', 'image/jpeg', 'image/webp'].filter((m) =>
    c.toDataURL(m).startsWith(`data:${m}`),
  )
  if (!supported.value.includes(format.value)) format.value = 'image/png'
})

function release() {
  for (const i of items.value) if (i.url) URL.revokeObjectURL(i.url)
}

function cancel() {
  job++
  busy.value = false
  for (const i of items.value) if (i.status === 'processing') i.status = 'cancelled'
}

function clear() {
  cancel()
  release()
  items.value = []
  error.value = ''
  stale.value = false
}

function choose(e: Event) {
  clear()
  const files = Array.from((e.target as HTMLInputElement).files || [])
  try {
    validateBatch(files)
    items.value = files.map((file) => ({ file, status: 'ready' }))
  } catch (e) {
    error.value = (e as Error).message
  }
}

watch([format, quality, width, background], () => {
  cancel()
  stale.value = items.value.some((i) => !!i.blob)
})

async function run() {
  if (busy.value) return
  const current = ++job
  busy.value = true
  error.value = ''
  stale.value = false
  for (const item of items.value) {
    if (current !== job) break
    item.status = 'processing'
    item.error = ''
    if (item.url) {
      URL.revokeObjectURL(item.url)
      item.url = undefined
    }
    item.blob = undefined
    let bitmap: ImageBitmap | undefined
    try {
      const source = await inspectImage(item.file)
      if (current !== job) break
      bitmap = await createImageBitmap(source, { imageOrientation: 'from-image' })
      if (bitmap.width * bitmap.height > imageLimits.pixels)
        throw Error('Image exceeds 20 million pixels / 图片超过 2000 万像素')
      const size = outputSize(bitmap.width, bitmap.height, width.value)
      item.original = `${bitmap.width} × ${bitmap.height}`
      const canvas = document.createElement('canvas')
      canvas.width = size.width
      canvas.height = size.height
      const context = canvas.getContext('2d')
      if (!context) throw Error('Canvas unavailable / Canvas 不可用')
      if (format.value === 'image/jpeg') {
        context.fillStyle = background.value
        context.fillRect(0, 0, size.width, size.height)
      }
      context.drawImage(bitmap, 0, 0, size.width, size.height)
      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(Error('Encoding failed / 编码失败'))),
          format.value,
          quality.value,
        ),
      )
      canvas.width = canvas.height = 0
      if (current !== job) break
      if (blob.type !== format.value)
        throw Error('Requested output format unsupported / 不支持该输出格式')
      item.blob = blob
      item.url = URL.createObjectURL(blob)
      item.width = size.width
      item.height = size.height
      item.status = 'success'
    } catch (e) {
      if (current === job) {
        item.error = (e as Error).message
        item.status = 'failed'
      }
    } finally {
      bitmap?.close()
    }
  }
  if (current === job) busy.value = false
}

function download(item: Item) {
  if (!item.url || !item.blob || stale.value) return
  const a = document.createElement('a')
  a.href = item.url
  a.download =
    item.file.name.replace(/\.[^.]*$/, '') +
    '.' +
    ({
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
    }[item.blob.type] || 'bin')
  a.click()
}

onBeforeUnmount(clear)
</script>
<template>
  <section class="panel">
    <h2>{{ en ? 'Images and settings' : '图片与设置' }}</h2>
    <p class="muted my-3">
      {{
        en
          ? 'Up to 10 static JPEG / PNG / WebP images. 20 MiB each, 50 MiB total, 20 million pixels per image.'
          : '支持最多 10 张静态 JPEG / PNG / WebP；单张 20 MiB、总计 50 MiB，每张最多 2000 万像素。'
      }}
    </p>
    <ToolsFilePicker :en="en" :files="items.map((i) => i.file)" :disabled="busy" @change="choose" />
    <div class="flex flex-wrap gap-5 items-end">
      <label
        >{{ en ? 'Output format' : '输出格式'
        }}<select v-model="format" class="block mt-2">
          <option
            v-for="m in ['image/jpeg', 'image/png', 'image/webp']"
            :key="m"
            :value="m"
            :disabled="!supported.includes(m)"
          >
            {{ m.replace('image/', '').toUpperCase() }}
          </option>
        </select></label
      ><label
        >{{ en ? 'Maximum width (px)' : '最大宽度（px）' }}
        <UiInput
          v-model.number="width"
          type="number"
          min="1"
          max="10000"
          class="mt-2 w-40"
        /> </label
      ><label v-if="format !== 'image/png'"
        >{{ en ? 'Quality' : '质量' }} {{ quality
        }}<input
          v-model.number="quality"
          class="block"
          type="range"
          min="0.1"
          max="1"
          step="0.05" /></label
      ><label v-if="format === 'image/jpeg'"
        >{{ en ? 'Transparency fill' : '透明背景填色'
        }}<input v-model="background" class="block" type="color"
      /></label>
    </div>
    <p class="muted text-sm mt-4">
      {{
        en
          ? 'Aspect ratio is preserved; images are never enlarged. Metadata is removed by redrawing. Color profiles may change. Input is not saved.'
          : '等比缩放，不放大小图；重绘移除元数据，不保证 ICC 色彩完全一致。输入不保存，刷新将清空。'
      }}
    </p>
    <div class="flex flex-wrap gap-3 mt-5">
      <UiButton :disabled="busy || !items.length" @click="run">{{
        en ? 'Convert images' : '转换图片'
      }}</UiButton>
      <UiButton variant="outline" :disabled="!busy" @click="cancel">{{
        en ? 'Cancel' : '取消'
      }}</UiButton>
      <UiButton variant="ghost" @click="clear">{{ en ? 'Clear' : '清空' }}</UiButton>
    </div>
    <p v-if="error" role="alert" class="text-destructive mt-3">{{ error }}</p>
    <p v-if="stale" role="status" class="mt-3">
      {{
        en
          ? 'Settings changed. Convert again before downloading.'
          : '设置已改变，请重新转换后下载。'
      }}
    </p>
    <div class="grid-tools mt-6" aria-live="polite">
      <article v-for="(item, i) in items" :key="i" class="rounded-lg border p-4 min-w-0">
        <p class="font-medium break-all">{{ item.file.name }}</p>
        <p class="muted text-sm">
          {{ (item.file.size / 1024).toFixed(1) }} KiB · {{ item.original }}
        </p>
        <p class="my-2">
          {{
            en
              ? item.status
              : {
                  ready: '待处理',
                  processing: '处理中',
                  success: '成功',
                  failed: '失败',
                  cancelled: '已取消',
                }[item.status]
          }}
        </p>
        <p v-if="item.error" class="text-destructive" role="alert">{{ item.error }}</p>
        <template v-if="item.url"
          ><img
            :src="item.url"
            :alt="en ? 'Converted image preview' : '转换结果预览'"
            class="max-h-48 w-full object-contain bg-muted rounded"
          />
          <p class="my-3 text-sm">
            {{ item.width }} × {{ item.height }} · {{ (item.blob!.size / 1024).toFixed(1) }} KiB
          </p>
          <UiButton variant="outline" :disabled="stale || busy" @click="download(item)"
            >{{ en ? 'Download' : '下载' }}
          </UiButton>
        </template>
      </article>
    </div>
  </section>
</template>

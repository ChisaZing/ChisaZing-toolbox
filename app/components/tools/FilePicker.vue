<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    en: boolean
    files?: File[]
    disabled?: boolean
    multiple?: boolean
    accept?: string
    images?: boolean
    append?: boolean
  }>(),
  { files: () => [], multiple: true, accept: 'image/jpeg,image/png,image/webp', images: true },
)
const emit = defineEmits<{ change: [event: Event] }>()
const picker = ref<HTMLInputElement>()
const previews = ref<{ file: File; url: string; failed: boolean }[]>([])

function release() {
  for (const p of previews.value) if (p.url) URL.revokeObjectURL(p.url)
  previews.value = []
}

watch(
  () => props.files.slice(),
  (files) => {
    release()
    previews.value = files.map((file) => ({
      file,
      url:
        props.images &&
        ['image/jpeg', 'image/png', 'image/webp'].includes(file.type) &&
        file.size <= 20 * 1024 * 1024
          ? URL.createObjectURL(file)
          : '',
      failed: false,
    }))
  },
  { deep: false },
)

function choose(e: Event) {
  emit('change', e)
  ;(e.target as HTMLInputElement).value = ''
}

onBeforeUnmount(release)
</script>
<template>
  <div class="my-4">
    <div class="rounded-xl border border-dashed bg-muted/40 px-5 py-7 text-center">
      <div
        class="mx-auto mb-3 flex size-11 items-center justify-center rounded-xl border bg-background text-muted-foreground"
        aria-hidden="true"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
        >
          <path d="M12 16V4m-4 4 4-4 4 4M4 15v5h16v-5" />
        </svg>
      </div>
      <p class="font-medium">
        {{
          images
            ? en
              ? 'Choose images to get started'
              : '选择图片，开始处理'
            : en
              ? 'Choose a local file'
              : '选择本地文件'
        }}
      </p>
      <p class="text-xs text-muted-foreground mt-2 mb-4">
        {{ images ? 'JPEG · PNG · WebP' : '.bin · .txt' }} ·
        {{ en ? 'Processed locally' : '仅在本地处理' }}
      </p>
      <input
        ref="picker"
        class="hidden"
        type="file"
        :multiple="multiple"
        :accept="accept"
        :disabled="disabled"
        :aria-label="en ? 'Choose files' : '选择文件'"
        @change="choose"
      />
      <UiButton variant="outline" :disabled="disabled" @click="picker?.click()"
        ><span aria-hidden="true">＋</span
        >{{
          files.length
            ? append
              ? en
                ? 'Add images'
                : '继续添加图片'
              : en
                ? 'Replace selection'
                : '重新选择'
            : images
              ? en
                ? 'Choose images'
                : '选择图片'
              : en
                ? 'Choose file'
                : '选择文件'
        }}
      </UiButton>
      <p v-if="files.length" class="text-xs text-muted-foreground mt-3">
        {{ en ? `${files.length} selected` : `已选择 ${files.length} 个文件` }}
      </p>
    </div>
    <div v-if="previews.length" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-4">
      <div
        v-for="(p, i) in previews"
        :key="i"
        class="min-w-0 rounded-lg border bg-card overflow-hidden"
      >
        <div v-if="images" class="aspect-[4/3] bg-muted flex items-center justify-center">
          <img
            v-if="p.url && !p.failed"
            :src="p.url"
            :alt="p.file.name"
            class="w-full h-full object-contain"
            loading="lazy"
            @error="p.failed = true"
          /><span v-else class="text-xs text-muted-foreground">{{
            en ? 'No preview' : '无法预览'
          }}</span>
        </div>
        <div class="p-3">
          <p class="text-xs font-medium truncate" :title="p.file.name">
            {{ i + 1 }}. {{ p.file.name }}
          </p>
          <p class="text-xs text-muted-foreground mt-1">
            {{ (p.file.size / 1024).toFixed(1) }} KiB
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

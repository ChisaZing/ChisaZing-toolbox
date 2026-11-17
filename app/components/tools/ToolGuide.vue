<script setup lang="ts">
import { guides } from '~/content/guides'

const props = defineProps<{ slug: string; en: boolean }>()
const guide = computed(() => guides[props.slug]?.[props.en ? 'en' : 'zh'])
</script>
<template>
  <section v-if="guide" class="panel mt-8">
    <h2>{{ en ? 'How to use' : '使用说明' }}</h2>
    <p class="mt-3 text-muted-foreground">{{ guide.purpose }}</p>
    <ol class="list-decimal pl-5 mt-4 space-y-2">
      <li v-for="step in guide.steps" :key="step">{{ step }}</li>
    </ol>
    <h3 class="font-semibold mt-6">{{ en ? 'Limits and support' : '限制与支持范围' }}</h3>
    <p class="mt-2 text-sm text-muted-foreground">{{ guide.limits }}</p>
    <h3 class="font-semibold mt-6">{{ en ? 'Example' : '操作示例' }}</h3>
    <p class="mt-2 rounded-lg bg-muted p-4 text-sm">{{ guide.example }}</p>
    <h3 class="font-semibold mt-6">{{ en ? 'Common questions' : '常见问题' }}</h3>
    <details v-for="[question, answer] in guide.faq" :key="question" class="border-b py-3">
      <summary class="cursor-pointer text-sm font-medium min-h-11 flex items-center">
        {{ question }}
      </summary>
      <p class="text-sm text-muted-foreground pb-2">{{ answer }}</p>
    </details>
    <p class="mt-5 text-xs text-muted-foreground">
      {{
        en
          ? 'Input, files and device reports are processed locally and are not uploaded by these tools. Refreshing or leaving clears session data. Language and theme preferences may be saved locally; hosting may record page visits.'
          : '工具输入、文件和设备报告在本地处理，不由工具上传；刷新或离开会清除本次数据。语言、主题偏好可能在本地保存，托管服务可能记录页面访问。'
      }}
    </p>
  </section>
</template>

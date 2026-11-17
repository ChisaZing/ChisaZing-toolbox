<script setup lang="ts">
import { tools } from '../../../tools'

const route = useRoute()
const en = computed(() => route.params.lang === 'en')
const tool = computed(() => tools.find((t) => t.slug === route.params.slug))
if (!tool.value || !['en', 'zh'].includes(String(route.params.lang)))
  throw createError({
    statusCode: 404,
    statusMessage: 'Page not found',
  })
useHead(() => ({
  title: en.value ? tool.value!.en : tool.value!.zh,
  htmlAttrs: { lang: en.value ? 'en' : 'zh-CN' },
}))
</script>
<template>
  <main v-if="tool">
    <NuxtLink :to="`/${route.params.lang}/`" class="text-sm muted"
      >← {{ en ? 'All tools' : '全部工具' }}</NuxtLink
    >
    <h1 class="mt-6">{{ en ? tool.en : tool.zh }}</h1>
    <p class="muted mt-3 mb-8">
      {{ en ? 'Local processing · No account needed' : '浏览器本地处理 · 无需注册' }}
    </p>
    <ToolsBaseConverter v-if="tool.slug === 'base-converter'" :en="en" />
    <ToolsAlgorithmTool
      v-else-if="['crc', 'ascii'].includes(tool.slug)"
      :slug="tool.slug"
      :en="en"
    />
    <ToolsInputDeviceTool v-else-if="tool.slug === 'keyboard-test'" :slug="tool.slug" :en="en" />
    <ToolsImageConverter v-else-if="tool.slug === 'image-converter'" :en="en" />
    <ToolsCrsfTool v-else-if="tool.slug === 'crsf'" :en="en" />
    <ToolsGifMaker v-else-if="tool.slug === 'gif-maker'" :en="en" />
    <ToolsHidTool v-else-if="tool.slug === 'webhid'" :en="en" />
    <ToolsSerialTool v-else-if="tool.slug === 'web-serial'" :en="en" />
    <ToolsSignedConverter v-else-if="tool.slug === 'signed-converter'" :en="en" />
    <ToolsGamepadTool v-else-if="tool.slug === 'gamepad-test'" :en="en" />
    <ToolsQrCodeTool v-else-if="tool.slug === 'qr-code'" :en="en" />
    <div v-else class="panel">
      <h2>{{ en ? 'Implementation pending' : '正在实施，暂未开放' }}</h2>
      <p class="mt-3">
        {{
          en
            ? 'This preview does not yet include this tool.'
            : '本预览版尚未包含此工具，不作为已完成功能交付。'
        }}
      </p>
    </div>
    <ToolsToolGuide :slug="tool.slug" :en="en" />
  </main>
</template>

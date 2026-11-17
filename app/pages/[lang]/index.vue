<script setup lang="ts">
const route = useRoute()
if (!['zh', 'en'].includes(String(route.params.lang))) throw createError({ statusCode: 404 })
const en = computed(() => route.params.lang === 'en')
useHead(() => ({
  htmlAttrs: { lang: en.value ? 'en' : 'zh-CN' },
  title: en.value
    ? 'ChisaZing’s Toolbox — useful tools, ready to use'
    : 'ChisaZing 的工具箱 — 实用工具，打开即用',
}))
</script>
<template>
  <main>
    <ToolDirectory :en="en" :lang="String(route.params.lang)" landing />
  </main>
</template>

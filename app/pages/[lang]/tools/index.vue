<script setup lang="ts">
const route = useRoute()
if (!['zh', 'en'].includes(String(route.params.lang))) throw createError({ statusCode: 404 })
const en = computed(() => route.params.lang === 'en')
useHead(() => ({
  title: en.value ? 'All tools — ChisaZing’s Toolbox' : '全部工具 — ChisaZing 的工具箱',
  htmlAttrs: { lang: en.value ? 'en' : 'zh-CN' },
}))
</script>
<template>
  <main>
    <ToolDirectory :en="en" :lang="String(route.params.lang)" />
  </main>
</template>

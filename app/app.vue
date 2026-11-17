<script setup lang="ts">
const route = useRoute()
const en = computed(() => route.path.startsWith('/en'))
const theme = ref('system')
let media: MediaQueryList | undefined

function syncSystemTheme() {
  if (theme.value === 'system') document.documentElement.classList.toggle('dark', !!media?.matches)
}

onBeforeUnmount(() => media?.removeEventListener('change', syncSystemTheme))
onMounted(() => {
  media = matchMedia('(prefers-color-scheme: dark)')
  media.addEventListener('change', syncSystemTheme)
  theme.value = localStorage.getItem('theme') || 'system'
  syncSystemTheme()
})
watch(
  theme,
  (v) => {
    if (import.meta.client) {
      localStorage.setItem('theme', v)
      document.documentElement.classList.toggle(
        'dark',
        v === 'dark' || (v === 'system' && matchMedia('(prefers-color-scheme: dark)').matches),
      )
    }
  },
  { immediate: true },
)
</script>
<template>
  <NuxtRouteAnnouncer />
  <header>
    <nav class="flex items-center px-6 py-3 max-w-[1200px] mx-auto gap-4 flex-wrap">
      <NuxtLink :to="en ? '/en/' : '/zh/'" class="font-bold text-xl mr-auto"
        >◈ {{ en ? 'ChisaZing’s Toolbox' : 'ChisaZing 的工具箱' }}
      </NuxtLink>
      <NuxtLink :to="en ? '/en/tools/' : '/zh/tools/'">{{
        en ? 'All tools' : '全部工具'
      }}</NuxtLink>
      <NuxtLink :to="route.path.replace(en ? '/en' : '/zh', en ? '/zh' : '/en')">{{
        en ? '中文' : 'English'
      }}</NuxtLink>
      <select v-model="theme" class="w-auto" aria-label="Theme">
        <option value="system">{{ en ? 'System' : '跟随系统' }}</option>
        <option value="light">{{ en ? 'Light' : '浅色' }}</option>
        <option value="dark">{{ en ? 'Dark' : '深色' }}</option>
      </select>
    </nav>
  </header>
  <NuxtPage />
  <footer class="max-w-[1200px] mx-auto p-6 muted text-sm">
    {{
      en ? 'Preview · Files and input stay in your browser.' : '预览版 · 文件与输入仅在浏览器处理。'
    }}
  </footer>
</template>

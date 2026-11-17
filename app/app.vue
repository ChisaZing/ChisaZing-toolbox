<script setup lang="ts">
import { Monitor, Sun, Moon, LayoutGrid } from 'lucide-vue-next'
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
    <nav class="site-nav">
      <NuxtLink :to="en ? '/en/' : '/zh/'" class="site-brand"
        >◈ {{ en ? 'ChisaZing’s Toolbox' : 'ChisaZing 的工具箱' }}
      </NuxtLink>
      <NuxtLink
        :to="en ? '/en/tools/' : '/zh/tools/'"
        class="directory-link"
        :aria-label="en ? 'All tools' : '全部工具'"
        ><LayoutGrid :size="18" :stroke-width="1.75" class="directory-icon" /><span>{{
          en ? 'All tools' : '全部工具'
        }}</span></NuxtLink
      >
      <NuxtLink :to="route.path.replace(en ? '/en' : '/zh', en ? '/zh' : '/en')">{{
        en ? '中文' : 'English'
      }}</NuxtLink>
      <div class="theme-picker">
        <component
          :is="theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor"
          :size="18"
          :stroke-width="1.75"
          aria-hidden="true"
          class="theme-icon"
        /><select
          v-model="theme"
          :aria-label="en ? 'Theme' : '主题'"
          :title="en ? 'Theme' : '主题'"
        >
          <option value="system">{{ en ? 'System' : '跟随系统' }}</option>
          <option value="light">{{ en ? 'Light' : '浅色' }}</option>
          <option value="dark">{{ en ? 'Dark' : '深色' }}</option>
        </select>
      </div>
    </nav>
  </header>
  <NuxtPage />
  <footer class="max-w-[1200px] mx-auto p-6 muted text-sm">
    {{
      en ? 'Preview · Files and input stay in your browser.' : '预览版 · 文件与输入仅在浏览器处理。'
    }}
  </footer>
</template>

<style scoped>
.site-nav {
  display: flex;
  align-items: center;
  max-width: 1200px;
  margin: auto;
  padding: 12px 24px;
  gap: 16px;
}
.site-brand {
  font-size: 20px;
  font-weight: 700;
  margin-right: auto;
  min-width: 0;
}
.directory-link {
  display: flex;
  align-items: center;
  gap: 6px;
}
.directory-icon {
  display: none;
}
.theme-picker {
  position: relative;
  flex-shrink: 0;
}
.theme-icon {
  display: none;
}
.theme-picker select {
  width: auto;
}
@media (max-width: 600px) {
  .site-nav {
    padding: 10px 12px;
    gap: 10px;
    font-size: 12px;
    flex-wrap: nowrap;
  }
  .site-brand {
    font-size: 15px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
  }
  .site-nav > a:not(.site-brand) {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 44px;
  }
  .directory-icon {
    display: block;
  }
  .directory-link span {
    display: none;
  }
  .directory-link {
    min-width: 32px;
  }
  .theme-picker {
    width: 44px;
    height: 44px;
    border: 1px solid var(--input);
    border-radius: 8px;
    display: grid;
    place-items: center;
  }
  .theme-icon {
    display: block;
    pointer-events: none;
  }
  .theme-picker select {
    position: absolute;
    inset: 0;
    opacity: 0;
    width: 44px;
    height: 44px;
    cursor: pointer;
  }
  .theme-picker:focus-within {
    outline: 2px solid var(--ring);
    outline-offset: 2px;
  }
}
</style>

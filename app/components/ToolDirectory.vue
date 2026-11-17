<script setup lang="ts">
import { tools } from '~/tools'
import { toolGroups, descriptionsZh } from '~/toolGroups'

const props = withDefaults(defineProps<{ en: boolean; lang: string; landing?: boolean }>(), {
  landing: false,
})
const search = ref(''),
  category = ref('all')
const groups = computed(() =>
  toolGroups
    .map((g) => ({
      ...g,
      items: g.slugs
        .map((slug) => tools.find((t) => t.slug === slug)!)
        .filter((t) =>
          `${t.en} ${t.zh} ${t.description} ${descriptionsZh[t.slug!]}`
            .toLowerCase()
            .includes(search.value.trim().toLowerCase()),
        ),
    }))
    .filter((g) => (category.value === 'all' || g.id === category.value) && g.items.length),
)

function browse(id = 'all') {
  category.value = id
  document.getElementById('tool-directory')?.scrollIntoView({
    behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
  })
}
</script>
<template>
  <div>
    <section v-if="landing" class="home-hero">
      <div class="hero-copy">
        <span class="hero-eyebrow"
          ><i /> {{ en ? 'YOUR EVERYDAY BROWSER TOOLKIT' : '日常所需，打开即用' }}</span
        >
        <h1>
          {{ en ? 'A little less effort.' : '让琐事简单一点，' }}<br /><span>{{
            en ? 'A little more done.' : '让想法快一点。'
          }}</span>
        </h1>
        <p>
          {{
            en
              ? 'From a quick conversion to a device debugging session, find a useful tool and get straight to work.'
              : '从一次简单的数据转换，到一场专注的设备调试。找到顺手的工具，在浏览器里直接开始。'
          }}
        </p>
        <div class="hero-actions">
          <UiButton @click="browse()"
            >{{ en ? 'Explore tools' : '探索全部工具' }} <span aria-hidden="true">↓</span>
          </UiButton>
          <span>{{ en ? 'No account · Local processing' : '无需注册 · 本地处理' }}</span>
        </div>
        <div class="hero-facts">
          <span
            ><strong>{{ tools.length }}</strong> {{ en ? 'useful tools' : '实用工具' }}</span
          ><span
            ><strong>{{ toolGroups.length }}</strong> {{ en ? 'workspaces' : '用途分区' }}</span
          ><span><strong>0</strong> {{ en ? 'installs needed' : '安装步骤' }}</span>
        </div>
      </div>
      <div class="hero-map">
        <div class="map-heading">
          <span>◈ {{ en ? 'CHISAZING’S TOOLBOX' : 'ChisaZing 的工具箱' }}</span
          ><span class="text-muted-foreground">↗</span>
        </div>
        <button v-for="g in toolGroups" :key="g.id" @click="browse(g.id)">
          <span class="group-icon"
            ><component :is="g.icon" :size="20" :stroke-width="1.75" aria-hidden="true" /></span
          ><span
            ><strong>{{ en ? g.en : g.zh }}</strong
            ><small>{{ g.slugs.length }} {{ en ? 'tools' : '个工具' }}</small></span
          ><span class="map-arrow">↗</span>
        </button>
        <div class="map-note">
          {{ en ? 'Pick a workspace. Make something happen.' : '选一个方向，开始解决问题。' }}
        </div>
      </div>
      <button class="scroll-cue" @click="browse()">
        {{ en ? 'SCROLL TO DISCOVER' : '向下滚动，发现工具' }} <span>↓</span>
      </button>
    </section>
    <section id="tool-directory" class="directory-section">
      <div class="flex flex-wrap gap-4 justify-between items-end mb-8">
        <div>
          <span class="text-xs tracking-widest text-muted-foreground">{{
            en ? 'THE COLLECTION' : '工具目录'
          }}</span>
          <h2 class="text-3xl mt-2">
            {{ en ? 'Find your next useful tool.' : '按用途，找到你的工具。' }}
          </h2>
        </div>
        <p class="text-sm text-muted-foreground">
          {{ en ? 'Simple utilities. Ready when you are.' : '小工具，随时派上用场。' }}
        </p>
      </div>
      <div class="directory-controls">
        <UiInput
          v-model="search"
          :placeholder="en ? 'Search tools or tasks…' : '搜索工具名称或用途…'"
          :aria-label="en ? 'Search tools' : '搜索工具'"
          class="max-w-sm"
        />
        <div class="flex flex-wrap gap-2">
          <UiButton :variant="category === 'all' ? 'default' : 'ghost'" @click="category = 'all'"
            >{{ en ? 'All' : '全部' }}
          </UiButton>
          <UiButton
            v-for="g in toolGroups"
            :key="g.id"
            :variant="category === g.id ? 'default' : 'ghost'"
            @click="category = g.id"
            >{{ en ? g.en : g.zh }}
          </UiButton>
        </div>
      </div>
      <section v-for="g in groups" :key="g.id" class="tool-group">
        <div class="group-heading">
          <span class="group-icon"
            ><component :is="g.icon" :size="20" :stroke-width="1.75" aria-hidden="true"
          /></span>
          <div>
            <h3>
              {{ en ? g.en : g.zh }} <small>{{ g.items.length }}</small>
            </h3>
            <p>{{ en ? g.introEn : g.introZh }}</p>
          </div>
        </div>
        <div class="grid-tools">
          <NuxtLink
            v-for="t in g.items"
            :key="t.slug"
            :to="`/${lang}/tools/${t.slug}/`"
            class="directory-card"
          >
            <div class="flex justify-between items-start">
              <span class="card-symbol"
                ><component :is="t.icon" :size="24" :stroke-width="1.75" aria-hidden="true" /></span
              ><span class="card-arrow">↗</span>
            </div>
            <h4>{{ en ? t.en : t.zh }}</h4>
            <p>{{ en ? t.description : descriptionsZh[t.slug!] }}</p>
            <span class="card-open">{{ en ? 'Open tool' : '打开工具' }} →</span></NuxtLink
          >
        </div>
      </section>
      <p v-if="!groups.length" role="status" class="text-muted-foreground text-center py-16">
        {{ en ? 'No tools match your search.' : '未找到匹配的工具，试试其他关键词。' }}
      </p>
    </section>
  </div>
</template>
<style scoped>
.home-hero {
  min-height: calc(100svh - 145px);
  display: grid;
  grid-template-columns: 1.35fr 1fr;
  align-items: center;
  gap: 72px;
  position: relative;
  padding: 40px 0 100px;
}

.hero-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 11px;
  letter-spacing: 2px;
  color: var(--muted-foreground);
}

.hero-eyebrow i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #339b77;
}

.hero-copy h1 {
  font-size: clamp(36px, 4.4vw, 60px);
  line-height: 1.3;
  letter-spacing: -2px;
  margin: 25px 0;
}

.hero-copy h1 span {
  color: var(--muted-foreground);
}

.hero-copy > p {
  max-width: 470px;
  font-size: 15px;
  line-height: 1.9;
  color: var(--muted-foreground);
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  margin-top: 32px;
}

.hero-actions > span {
  font-size: 12px;
  color: var(--muted-foreground);
}

.hero-facts {
  display: flex;
  gap: 30px;
  border-top: 1px solid var(--border);
  margin-top: 45px;
  padding-top: 24px;
  font-size: 11px;
  color: var(--muted-foreground);
}

.hero-facts strong {
  font-size: 20px;
  color: var(--foreground);
  margin-right: 5px;
}

.hero-map {
  border: 1px solid var(--border);
  border-radius: 18px;
  background: var(--card);
  padding: 8px 22px;
  box-shadow: 0 16px 50px #00000005;
  transform: rotate(-2deg);
}

.map-heading {
  display: flex;
  justify-content: space-between;
  padding: 20px 0;
  font-size: 11px;
  letter-spacing: 1px;
}

.hero-map > button {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 16px;
  text-align: left;
  padding: 20px 0;
  border-top: 1px solid var(--border);
}

.hero-map > button:hover .map-arrow {
  transform: translate(2px, -2px);
}

.group-icon {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border: 1px solid var(--border);
  border-radius: 12px;
  font-size: 24px;
  color: var(--muted-foreground);
  background: var(--background);
}

.hero-map strong {
  font-size: 14px;
  display: block;
}

.hero-map small {
  display: block;
  font-size: 11px;
  color: var(--muted-foreground);
  margin-top: 4px;
}

.map-arrow {
  margin-left: auto;
  color: var(--muted-foreground);
  transition: transform 0.2s;
}

.map-note {
  border-top: 1px solid var(--border);
  font-size: 10px;
  color: var(--muted-foreground);
  padding: 18px 0;
}

.scroll-cue {
  position: absolute;
  bottom: 24px;
  left: 0;
  right: 0;
  margin: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 9px;
  color: var(--muted-foreground);
  font-size: 10px;
  letter-spacing: 2px;
}

.directory-section {
  scroll-margin-top: 25px;
  padding: 48px 0 20px;
}

.directory-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  border-bottom: 1px solid var(--border);
  padding-bottom: 24px;
}

.tool-group {
  margin-top: 42px;
}

.group-heading {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
}

.group-heading h3 {
  font-size: 19px;
  font-weight: 600;
}

.group-heading h3 small {
  font-size: 11px;
  font-weight: 400;
  color: var(--muted-foreground);
  margin-left: 8px;
}

.group-heading p {
  font-size: 12px;
  color: var(--muted-foreground);
  margin-top: 5px;
}

.directory-card {
  display: flex;
  flex-direction: column;
  min-width: 0;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--card);
  padding: 22px;
  transition:
    border-color 0.2s,
    transform 0.2s;
}

.directory-card:hover {
  border-color: var(--ring);
  transform: translateY(-3px);
}

.card-symbol {
  display: inline-flex;
  align-items: center;
  min-height: 29px;
  font-size: 24px;
  color: var(--muted-foreground);
}

.card-arrow {
  color: var(--muted-foreground);
  opacity: 0.5;
}

.directory-card h4 {
  font-size: 16px;
  font-weight: 600;
  margin: 18px 0 8px;
}

.directory-card p {
  font-size: 12px;
  line-height: 1.8;
  color: var(--muted-foreground);
  flex: 1;
}

.card-open {
  font-size: 11px;
  margin-top: 22px;
  color: var(--muted-foreground);
}

@media (max-width: 767px) {
  .home-hero {
    grid-template-columns: 1fr;
    gap: 30px;
    padding: 45px 0 90px;
    min-height: calc(100svh - 120px);
  }

  .hero-map {
    display: none;
  }

  .hero-copy h1 {
    font-size: 38px;
  }

  .hero-facts {
    gap: 22px;
  }

  .directory-section {
    padding-top: 30px;
  }

  .directory-controls {
    align-items: stretch;
  }

  .group-heading p {
    line-height: 1.7;
  }

  .hero-actions {
    gap: 12px;
  }

  .hero-copy > p {
    font-size: 14px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .directory-card,
  .map-arrow {
    transition: none;
  }

  .directory-card:hover {
    transform: none;
  }
}
</style>

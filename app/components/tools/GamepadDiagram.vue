<script setup lang="ts">
defineProps<{ axes: number[]; pressed: boolean[]; values: number[]; en: boolean }>()
const petals = [
  'M-3-8C-9-13-15-17-13-22C-11-28 11-28 13-22C15-17 9-13 3-8Q0-5-3-8Z',
  'M8-3C13-9 17-15 22-13C28-11 28 11 22 13C17 15 13 9 8 3Q5 0 8-3Z',
  'M3 8C9 13 15 17 13 22C11 28-11 28-13 22C-15 17-9 13-3 8Q0 5 3 8Z',
  'M-8 3C-13 9-17 15-22 13C-28 11-28-11-22-13C-17-15-13-9-8-3Q-5 0-8 3Z',
]
const clusters = [
  { x: 318, y: 145, buttons: [3, 1, 0, 2] },
  { x: 152, y: 214, buttons: [12, 15, 13, 14] },
]
</script>
<template>
  <svg
    viewBox="0 -24 440 394"
    class="w-full"
    role="img"
    :aria-label="en ? 'Live controller diagram' : '手柄实时示意图'"
  >
    <defs>
      <linearGradient
        v-for="i in [0, 1]"
        :id="`trigger-fill-${i}`"
        :key="i"
        x1="0"
        y1="1"
        x2="0"
        y2="0"
      >
        <stop offset="0%" stop-color="#329BEA" />
        <stop
          :offset="`${Math.max(0, Math.min(1, values[i + 6] ?? 0)) * 100}%`"
          stop-color="#B5E0FF"
        />
        <stop
          :offset="`${Math.max(0, Math.min(1, values[i + 6] ?? 0)) * 100}%`"
          stop-color="#FFFFFF"
        />
        <stop offset="100%" stop-color="#FFFFFF" />
      </linearGradient>
    </defs>
    <path
      d="M119 91C89 91 70 109 58 140C44 179 18 242 18 296C18 333 29 350 48 350C68 350 82 327 106 300C120 284 131 274 153 274H287C309 274 320 284 334 300C358 327 372 350 392 350C411 350 422 333 422 296C422 242 396 179 382 140C370 109 351 91 321 91Z"
      fill="#EDF4FB"
    />
    <path
      d="M119 77C89 77 70 95 58 126C44 165 18 228 18 282C18 319 29 336 48 336C68 336 82 313 106 286C120 270 131 260 153 260H287C309 260 320 270 334 286C358 313 372 336 392 336C411 336 422 319 422 282C422 228 396 165 382 126C370 95 351 77 321 77Z"
      fill="#FFFFFF"
      stroke="#C7DBF0"
      stroke-width="2.5"
    />
    <path d="M40 186L129 269M400 186L311 269" fill="none" stroke="#EDF3FA" stroke-width="3" />
    <g v-for="(x, i) in [117.5, 284.5]" :key="i" stroke="#111111" stroke-width="2.5">
      <path
        :d="`M${x + 12} 33V11C${x + 12} -7 ${x + 38} -7 ${x + 38} 11V33Q${x + 38} 38 ${x + 32} 38H${x + 18}Q${x + 12} 38 ${x + 12} 33Z`"
        :fill="`url(#trigger-fill-${i})`"
      />
      <text
        :x="x + 25"
        y="-12"
        text-anchor="middle"
        fill="currentColor"
        stroke="none"
        font-size="10"
        font-family="ui-monospace,monospace"
      >
        {{ Math.round((values[i + 6] ?? 0) * 100) }}%
      </text>
      <rect
        :x="x + 6"
        y="54"
        width="38"
        height="12"
        rx="6"
        :fill="pressed[i + 4] ? '#8AC5F5' : '#FFFFFF'"
      />
    </g>
    <g
      v-for="cluster in clusters"
      :key="cluster.x"
      :transform="`translate(${cluster.x} ${cluster.y})`"
    >
      <circle r="35" fill="#FFFFFF" stroke="#C7DBF0" stroke-width="2.5" />
      <path
        v-for="(path, i) in petals"
        :key="i"
        :d="path"
        :fill="pressed[cluster.buttons[i]!] ? '#8AC5F5' : '#FFFFFF'"
        stroke="#111111"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </g>
    <g
      v-for="(s, i) in [
        { x: 103, y: 141 },
        { x: 270, y: 214 },
      ]"
      :key="i"
    >
      <circle :cx="s.x" :cy="s.y" r="35" fill="#FFFFFF" stroke="#C7DBF0" stroke-width="2.5" />
      <circle
        :cx="s.x + (axes[i * 2] ?? 0) * 8"
        :cy="s.y + (axes[i * 2 + 1] ?? 0) * 8"
        r="26"
        :fill="pressed[i + 10] ? '#8AC5F5' : '#FFFFFF'"
        stroke="#111111"
        stroke-width="2.7"
      />
    </g>
    <circle
      v-for="(x, i) in [171, 240]"
      :key="i"
      :cx="x"
      cy="143"
      r="9"
      :fill="pressed[i + 8] ? '#8AC5F5' : '#FFFFFF'"
      stroke="#111111"
      stroke-width="2.7"
    />
    <circle v-if="pressed[16]" cx="205" cy="114" r="6" fill="#8AC5F5" />
  </svg>
</template>

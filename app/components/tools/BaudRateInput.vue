<script setup lang="ts">
defineProps<{ en: boolean; disabled?: boolean }>()
const model = defineModel<number>({ required: true })
const rates = [
  1200, 2400, 4800, 9600, 19200, 38400, 57600, 115200, 230400, 400000, 420000, 460800, 921600,
  1000000, 1500000, 2000000,
]
const open = ref(false),
  root = ref<HTMLElement>()

function outside(e: PointerEvent) {
  if (!root.value?.contains(e.target as Node)) open.value = false
}

onMounted(() => document.addEventListener('pointerdown', outside))
onBeforeUnmount(() => document.removeEventListener('pointerdown', outside))

function choose(rate: number) {
  model.value = rate
  open.value = false
}
</script>
<template>
  <div
    ref="root"
    class="relative w-44"
    @keydown.esc.stop="open = false"
    @focusout="!root?.contains($event.relatedTarget as Node) && (open = false)"
  >
    <div
      class="flex items-center rounded-lg border border-input bg-background shadow-sm transition-shadow focus-within:ring-2 focus-within:ring-ring/40 focus-within:border-ring"
    >
      <input
        v-model.number="model"
        type="number"
        min="1"
        max="4000000"
        :disabled="disabled"
        :aria-label="en ? 'Baud rate' : '波特率'"
        class="baud-value min-w-0 w-full bg-transparent px-3 rounded-l-lg outline-none text-sm tabular-nums disabled:opacity-50"
        @keydown.alt.down.prevent="open = true"
      />
      <button
        type="button"
        class="group flex size-11 shrink-0 items-center justify-center rounded-r-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="disabled"
        :aria-label="en ? 'Show all baud rates' : '展开全部波特率'"
        :aria-expanded="open"
        @click="open = !open"
      >
        <span class="flex h-5 w-full items-center justify-center border-l border-border"
          ><svg
            class="size-4 transition-transform duration-150"
            :class="open ? 'rotate-180' : ' '"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" /></svg
        ></span>
      </button>
    </div>
    <ul
      v-if="open && !disabled"
      class="absolute top-full left-0 z-50 mt-2 max-h-64 overflow-auto w-full rounded-lg border bg-popover text-popover-foreground p-1.5 shadow-lg"
      :aria-label="en ? 'Common baud rates' : '常用波特率'"
    >
      <li v-for="rate in rates" :key="rate">
        <button
          type="button"
          class="w-full text-left px-3 py-2 rounded-sm hover:bg-accent focus:bg-accent outline-none text-sm"
          :class="model === rate ? 'bg-accent font-semibold' : ''"
          @click="choose(rate)"
        >
          {{ rate }}
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.baud-value {
  appearance: textfield;
  -moz-appearance: textfield;
}

.baud-value::-webkit-inner-spin-button,
.baud-value::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>

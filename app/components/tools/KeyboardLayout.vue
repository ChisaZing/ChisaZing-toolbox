<script setup lang="ts">
import { keyboard104 } from '../../../core/input/keyboard'

defineProps<{ pressed: string[]; en: boolean }>()
const keys = keyboard104()
</script>
<template>
  <div class="overflow-x-auto pb-2" :aria-label="en ? 'ANSI 104-key keyboard' : 'ANSI 104 键键盘'">
    <div class="keyboard-104">
      <span
        v-for="key in keys"
        :key="key.code"
        :title="key.code"
        :aria-label="`${key.label}: ${key.code}`"
        class="keyboard-key"
        :class="
          pressed.includes(key.code)
            ? 'bg-primary text-primary-foreground border-primary'
            : 'bg-muted border-border'
        "
        :style="{
          left: `${key.x * 44}px`,
          top: `${key.y * 48}px`,
          width: `${key.w * 44 - 4}px`,
          height: `${key.h * 48 - 4}px`,
        }"
        >{{ key.label }}</span
      >
    </div>
  </div>
</template>
<style scoped>
.keyboard-104 {
  position: relative;
  width: 1012px;
  height: 312px;
}

.keyboard-key {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  border-width: 1px;
  border-radius: 6px;
  font-size: 10px;
  line-height: 1.2;
  white-space: nowrap;
  user-select: none;
}
</style>

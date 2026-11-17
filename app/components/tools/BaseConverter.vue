<script setup lang="ts">
import { convertBase } from '../../../core'
import { formatHexBytes, parseHexBytes } from '../../../core/base/hex'

const byteMode = ref(false)
let lastValue: bigint | null = null
watch(byteMode, (enabled) => {
  if (lastValue !== null && !error.value)
    values.value[16] = enabled ? formatHexBytes(lastValue) : lastValue.toString(16).toUpperCase()
})
const props = defineProps<{ en: boolean }>()
const bases = [2, 8, 10, 16, 36]
const values = ref<Record<number, string>>(Object.fromEntries(bases.map((b) => [b, ''])))
const source = ref<number | null>(null),
  error = ref(''),
  copyError = ref('')
const names: Record<number, [string, string]> = {
  2: ['二进制', 'Binary'],
  8: ['八进制', 'Octal'],
  10: ['十进制', 'Decimal'],
  16: ['十六进制', 'Hexadecimal'],
  36: ['三十六进制', 'Base 36'],
}

function update(base: number, value: string) {
  source.value = base
  lastValue = null
  error.value = ''
  copyError.value = ''
  for (const b of bases) values.value[b] = b === base ? value : ''
  if (!value.trim()) return
  try {
    const n = convertBase(base === 16 && byteMode.value ? parseHexBytes(value) : value, base)
    lastValue = n
    const output = Object.fromEntries(
      bases.map((b) => [
        b,
        b === 16 && byteMode.value ? formatHexBytes(n) : n.toString(b).toUpperCase(),
      ]),
    )
    if (Object.values(output).some((v) => v.length > 20000))
      throw Error(props.en ? 'Output exceeds 20000 digits' : '输出超过 20000 位')
    for (const b of bases) if (b !== base) values.value[b] = output[b]!
  } catch (e) {
    error.value = (e as Error).message
  }
}

function clear() {
  lastValue = null
  values.value = Object.fromEntries(bases.map((b) => [b, '']))
  source.value = null
  error.value = ''
  copyError.value = ''
}

async function copy(base: number) {
  try {
    await navigator.clipboard.writeText(values.value[base]!)
  } catch {
    copyError.value = props.en
      ? 'Copy failed. Select the value manually.'
      : '复制失败，请手动选择数值。'
  }
}
</script>
<template>
  <section class="panel">
    <div class="flex flex-wrap justify-between gap-3 items-center mb-3">
      <h2>
        {{ en ? 'Linked base inputs' : '多进制实时转换' }}
      </h2>
      <div class="flex gap-2">
        <UiButton variant="outline" @click="update(10, '255')">{{
          en ? 'Example' : '加载示例'
        }}</UiButton>
        <UiButton variant="ghost" @click="clear">{{ en ? 'Clear' : '清空' }}</UiButton>
      </div>
    </div>
    <p class="muted text-sm mb-6">
      {{
        en
          ? 'Edit any field to update the others automatically. Signed integers only; large values remain exact.'
          : '在任意输入框中输入整数，其他进制会自动同步。支持负数和任意精度大整数。'
      }}
    </p>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div
        v-for="base in bases"
        :key="base"
        class="rounded-lg border p-4 min-w-0"
        :class="source === base ? 'border-primary bg-muted/30' : ''"
      >
        <div class="flex justify-between gap-3 items-center mb-3">
          <label :for="`base-${base}`" class="font-medium"
            >{{ names[base]![en ? 1 : 0] }}
            <span class="text-xs muted ml-2">{{ base }}</span></label
          >
          <UiButton
            variant="ghost"
            size="sm"
            :disabled="!values[base] || !!error"
            @click="copy(base)"
          >
            {{ en ? 'Copy' : '复制' }}
          </UiButton>
        </div>
        <label v-if="base === 16" class="check-option text-sm mb-2"
          ><input v-model="byteMode" type="checkbox" />{{
            en ? 'Byte mode (0x01 0xFF)' : '字节模式（0x01 0xFF）'
          }}</label
        >
        <UiTextarea
          :id="`base-${base}`"
          :model-value="values[base]"
          @update:model-value="update(base, String($event ?? ''))"
          class="h-28 font-mono break-all"
          spellcheck="false"
          :aria-invalid="source === base && !!error"
          :aria-describedby="source === base && error ? 'base-error' : undefined"
          :placeholder="en ? 'Enter an integer…' : '输入整数…'"
        />
        <p v-if="source === base" class="text-xs muted mt-2">
          {{ en ? 'Current input' : '当前输入源' }}
        </p>
      </div>
    </div>
    <p v-if="error" id="base-error" role="alert" class="text-destructive mt-4">{{ error }}</p>
    <p v-if="copyError" role="alert" class="text-destructive mt-4">{{ copyError }}</p>
    <p class="muted text-xs mt-5">
      {{
        en
          ? 'Input is not saved. Refresh clears all fields.'
          : '输入不会保存，刷新页面将清空所有数值。'
      }}
    </p>
  </section>
</template>

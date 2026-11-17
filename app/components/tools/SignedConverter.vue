<script setup lang="ts">
import { signedConvert, type SignedField } from '../../../core/signed'

const props = defineProps<{ en: boolean }>()
const width = ref(8),
  values = ref({ decimal: '', sign: '', twos: '', bcd: '' }),
  source = ref<SignedField>('decimal'),
  error = ref('')
let value: string | null = null
const bcdHex = ref(false)
watch(bcdHex, () => {
  if (value !== null) {
    const result = signedConvert(value, 'decimal', width.value, bcdHex.value)
    values.value.bcd = result.bcd
  } else if (source.value === 'bcd' && values.value.bcd) {
    values.value.bcd = ''
    error.value = ''
  }
})
const fields: SignedField[] = ['decimal', 'sign', 'twos', 'bcd']
const labels = {
  decimal: ['十进制', 'Decimal'],
  sign: ['二进制原码', 'Sign-magnitude'],
  twos: ['二进制补码', 'Two’s complement'],
  bcd: ['BCD 码（8421）', 'BCD (8421)'],
}

function update(field: SignedField, input: string) {
  source.value = field
  error.value = ''
  value = null
  values.value = { decimal: '', sign: '', twos: '', bcd: '' }
  values.value[field] = input
  if (!input.trim()) return
  try {
    const result = signedConvert(input, field, width.value, bcdHex.value)
    value = result.decimal
    for (const key of fields) if (key !== field) values.value[key] = result[key]
  } catch (e) {
    error.value = (e as Error).message
  }
}

watch(width, () => {
  if (value !== null) update('decimal', value)
  else if (values.value[source.value]) update(source.value, values.value[source.value])
})

function clear() {
  values.value = { decimal: '', sign: '', twos: '', bcd: '' }
  error.value = ''
  value = null
}

async function copy(field: SignedField) {
  try {
    await navigator.clipboard.writeText(values.value[field])
  } catch {
    error.value = props.en ? 'Copy failed; select text manually.' : '复制失败，请手动选中复制。'
  }
}
</script>
<template>
  <section class="panel">
    <div class="flex flex-wrap gap-3 items-center mb-4">
      <label
        >{{ en ? 'Bit width' : '位宽' }}
        <select v-model="width">
          <option v-for="n in [8, 16, 32, 64]" :value="n">{{ n }} bit</option>
        </select></label
      >
      <UiButton variant="outline" @click="update('decimal', '-42')">{{
        en ? 'Example' : '加载示例'
      }}</UiButton>
      <UiButton variant="ghost" @click="clear">{{ en ? 'Clear' : '清空' }}</UiButton>
    </div>
    <p class="muted text-sm mb-5">
      {{
        en
          ? 'Edit any field to synchronize. BCD uses four bits per decimal digit; negative values carry a leading minus sign.'
          : '编辑任意输入框自动同步。BCD 每个十进制数字用 4 位表示，负数保留前导负号。'
      }}
    </p>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div
        v-for="field in fields"
        :key="field"
        class="rounded-lg border p-4"
        :class="source === field ? 'border-primary' : ''"
      >
        <div class="flex flex-wrap justify-between items-center gap-3 mb-3">
          <label :for="`signed-${field}`">{{ labels[field][en ? 1 : 0] }}</label>
          <div class="flex flex-wrap items-center gap-2">
            <label v-if="field === 'bcd'" class="flex items-center gap-2 text-sm"
              ><span class="text-muted-foreground">{{ en ? 'Format' : '显示格式' }}</span
              ><select v-model="bcdHex">
                <option :value="false">{{ en ? 'Binary' : '二进制' }}</option>
                <option :value="true">{{ en ? 'Hexadecimal' : '十六进制' }}</option>
              </select></label
            >
            <UiButton variant="ghost" :disabled="!values[field] || !!error" @click="copy(field)">
              {{ en ? 'Copy' : '复制' }}
            </UiButton>
          </div>
        </div>
        <UiTextarea
          :id="`signed-${field}`"
          :model-value="values[field]"
          @update:model-value="update(field, String($event ?? ''))"
          class="font-mono h-28"
          spellcheck="false"
          :aria-invalid="field === source && !!error"
          :aria-describedby="error && field === source ? 'signed-error' : undefined"
        />
        <p
          v-if="field === 'sign' && !values.sign && values.twos && !error"
          class="text-xs muted mt-2"
        >
          {{
            en
              ? 'The minimum negative two’s-complement value has no sign-magnitude representation at this width.'
              : '补码最小负数在当前位宽没有对应原码表示。'
          }}
        </p>
      </div>
    </div>
    <p v-if="error" id="signed-error" role="alert" class="text-destructive mt-4">{{ error }}</p>
    <p class="text-xs muted mt-4">
      {{
        en
          ? 'Binary inputs require exactly the selected bit width; spaces are allowed. Negative zero normalizes to zero. Input is not saved.'
          : '二进制输入须满足所选位宽，可用空格分组；负零统一为零。输入不保存。'
      }}
    </p>
  </section>
</template>

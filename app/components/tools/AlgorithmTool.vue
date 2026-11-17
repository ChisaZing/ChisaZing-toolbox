<script setup lang="ts">
import { asciiExample } from '../../../core/ascii/example'
import { convertBase, crc, presets, bytes, ascii } from '../../../core'

const props = defineProps<{ slug: string; en: boolean }>()
const input = ref('')
const output = ref('')
const error = ref('')
const base = ref(10)
const preset = ref(0)
const hex = ref(false)
const decode = ref(false)
const utf8 = ref(false)
const radix = ref(16)
const stale = ref(false)
watch([input, base, preset, hex, decode, utf8, radix], () => {
  stale.value = !!output.value
  error.value = ''
})

function run() {
  error.value = ''
  try {
    if (props.slug === 'base-converter') {
      const n = convertBase(input.value, base.value)
      output.value = [2, 8, 10, 16, 36]
        .map((b) => `${b}: ${n.toString(b).toUpperCase()}`)
        .join('\n')
    } else if (props.slug === 'crc') {
      const p = presets[preset.value]!
      const n = crc(hex.value ? bytes(input.value) : new TextEncoder().encode(input.value), p)
      output.value = `HEX: ${n
        .toString(16)
        .toUpperCase()
        .padStart(p.width / 4, '0')}\nDEC: ${n}\nBIN: ${n.toString(2).padStart(p.width, '0')}`
    } else output.value = ascii(input.value, decode.value, radix.value, utf8.value)
    stale.value = false
  } catch (e) {
    error.value = (e as Error).message
  }
}

const example = computed(() => asciiExample(decode.value, radix.value, utf8.value))

function loadExample() {
  input.value =
    props.slug === 'base-converter'
      ? '255'
      : props.slug === 'crc'
        ? hex.value
          ? '31 32 33 34 35 36 37 38 39'
          : '123456789'
        : example.value.input
}

async function copy() {
  try {
    await navigator.clipboard.writeText(output.value)
  } catch {
    error.value = props.en ? 'Copy failed. Select result manually.' : '复制失败，请手动选择结果。'
  }
}
</script>
<template>
  <div class="workspace">
    <section class="panel">
      <h2 class="mb-5">{{ en ? 'Input' : '输入与配置' }}</h2>
      <div class="flex items-center gap-3 flex-wrap mb-4">
        <label v-if="slug === 'base-converter'"
          >{{ en ? 'Input base' : '输入进制' }}
          <UiInput v-model.number="base" type="number" min="2" max="36" class="w-24 ml-3" />
        </label>
        <template v-if="slug === 'crc'"
          ><select v-model="preset" class="max-w-full" aria-label="CRC preset">
            <option v-for="(p, i) in presets" :value="i">{{ p.name }}</option></select
          ><label class="check-option"><input v-model="hex" type="checkbox" /> HEX</label>
          <dl
            class="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full rounded-lg border bg-muted p-4 text-sm"
          >
            <div
              v-for="(value, key) in {
                width: presets[preset]!.width,
                poly: '0x' + presets[preset]!.poly.toString(16).toUpperCase(),
                init: '0x' + presets[preset]!.init.toString(16).toUpperCase(),
                refin: presets[preset]!.ref,
                refout: presets[preset]!.ref,
                xorout: '0x' + presets[preset]!.xor.toString(16).toUpperCase(),
              }"
              :key="key"
            >
              <dt class="text-muted-foreground text-xs">{{ key }}</dt>
              <dd class="font-mono mt-1">{{ value }}</dd>
            </div>
          </dl>
        </template>
        <template v-if="slug === 'ascii'"
          ><label class="check-option"
            ><input v-model="decode" type="checkbox" />
            {{ en ? 'Decode bytes' : '字节转文本' }}</label
          ><label class="check-option"><input v-model="utf8" type="checkbox" /> UTF-8</label
          ><label class="flex items-center gap-2" for="ascii-radix"
            ><span>{{ en ? 'Byte base' : '字节进制' }}</span
            ><select id="ascii-radix" v-model="radix" aria-describedby="ascii-radix-help">
              <option v-for="b in [2, 8, 10, 16]" :value="b">{{ b }}</option>
            </select></label
          >
          <p id="ascii-radix-help" class="w-full text-xs text-muted-foreground">
            {{
              en
                ? 'Choose how byte values are read or displayed: 2 = binary, 8 = octal, 10 = decimal, 16 = hexadecimal.'
                : '选择字节数值的输入或输出格式：2 为二进制，8 为八进制，10 为十进制，16 为十六进制。'
            }}
          </p>
        </template>
      </div>
      <p v-if="slug === 'ascii' && decode" class="text-xs text-muted-foreground mb-3">
        {{ en ? 'Example bytes' : '示例字节' }}：<code class="break-all">{{ example.input }}</code>
        → {{ example.expected }}
      </p>
      <label for="source" class="block mb-2">{{ en ? 'Source' : '原始输入' }}</label>
      <UiTextarea id="source" v-model="input" class="w-full h-56" spellcheck="false" />
      <p v-if="error" role="alert" class="text-destructive my-3">{{ error }}</p>
      <div class="flex gap-3 mt-4">
        <UiButton variant="default" @click="run">{{
          en ? 'Convert / Calculate' : '转换 / 计算'
        }}</UiButton>
        <UiButton variant="outline" @click="loadExample">{{
          en ? 'Example' : '加载示例'
        }}</UiButton>
        <UiButton
          variant="ghost"
          @click="
            () => {
              input = ''
              output = ''
            }
          "
          >{{ en ? 'Clear' : '清空' }}</UiButton
        >
      </div>
      <p class="text-xs muted mt-4">
        {{
          en
            ? 'Input is not saved. Refresh clears your work.'
            : '输入不会保存，刷新页面将清空数据。'
        }}
      </p>
    </section>
    <section class="panel" aria-live="polite">
      <div class="flex justify-between">
        <h2>{{ en ? 'Result' : '结果' }}</h2>
        <UiButton variant="outline" size="sm" :disabled="!output || stale" @click="copy"
          >{{ en ? 'Copy' : '复制' }}
        </UiButton>
      </div>
      <p v-if="stale" class="text-amber-700 dark:text-amber-400 mt-4">
        {{ en ? 'Input changed. Calculate again.' : '输入已修改，请重新计算。' }}
      </p>
      <pre class="mt-6 p-4 bg-muted rounded-xl min-h-48">{{
        output || (en ? 'Your result appears here.' : '计算结果将显示在这里。')
      }}</pre>
    </section>
  </div>
</template>

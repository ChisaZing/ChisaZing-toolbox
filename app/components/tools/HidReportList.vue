<script setup lang="ts">
interface ReportLog {
  time: string
  reportId: number
  hex: string
  length: number
}
const props = defineProps<{ logs: ReportLog[]; en: boolean }>()
const ids = new WeakMap<ReportLog, number>()
let nextId = 0
function key(entry: ReportLog) {
  if (!ids.has(entry)) ids.set(entry, ++nextId)
  return ids.get(entry)!
}
const newest = computed(() => [...props.logs].reverse())
function rows(hex: string) {
  const bytes = hex.trim() ? hex.trim().split(/\s+/) : []
  const result = []
  for (let i = 0; i < bytes.length; i += 16)
    result.push({
      offset: i.toString(16).toUpperCase().padStart(4, '0'),
      hex: bytes.slice(i, i + 16).join(' '),
    })
  return result
}
function time(iso: string) {
  return iso.replace('T', ' ').replace('Z', ' UTC')
}
</script>
<template>
  <section class="rounded-xl border overflow-hidden">
    <div class="flex items-center justify-between gap-3 px-4 py-3 bg-muted/50 border-b">
      <h2 class="text-sm font-semibold">{{ en ? 'Received reports' : '接收报告' }}</h2>
      <span class="text-xs text-muted-foreground"
        >{{ logs.length }} {{ en ? 'records · newest first' : '条 · 最新在前' }}</span
      >
    </div>
    <div v-if="!logs.length" class="p-10 text-center text-sm text-muted-foreground">
      {{ en ? 'Waiting for input reports…' : '等待设备输入报告…' }}
    </div>
    <div v-else class="max-h-[520px] overflow-auto">
      <details
        v-for="(entry, i) in newest"
        :key="key(entry)"
        class="report-entry border-b last:border-b-0"
      >
        <summary
          class="cursor-pointer px-4 py-3 hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-ring"
        >
          <div
            class="inline-flex flex-wrap items-center gap-x-4 gap-y-1 align-middle w-[calc(100%-24px)]"
          >
            <span class="text-xs text-muted-foreground font-mono">{{ time(entry.time) }}</span><span
              class="rounded-md bg-muted px-2 py-1 text-xs font-medium"
              >ID {{ entry.reportId }}
              <span class="text-muted-foreground"
                >/ 0x{{ entry.reportId.toString(16).toUpperCase().padStart(2, '0') }}</span
              ></span
            ><span class="text-xs text-muted-foreground">{{ entry.length }} bytes</span
            ><span class="ml-auto text-xs text-muted-foreground">#{{ logs.length - i }}</span
            ><code class="w-full block truncate text-xs text-muted-foreground mt-1"
              >{{ entry.hex.slice(0, 71) }}{{ entry.hex.length > 71 ? ' …' : '' }}</code
            >
          </div>
        </summary>
        <div class="border-t bg-muted/25 px-4 py-4">
          <p class="text-xs text-muted-foreground mb-3">
            {{
              en
                ? 'HEX bytes · 16 bytes per row · hexadecimal offset'
                : 'HEX 字节 · 每行 16 字节 · 偏移为十六进制'
            }}
          </p>
          <div class="overflow-x-auto rounded-lg border bg-background p-3">
            <table class="font-mono text-xs whitespace-nowrap">
              <tbody>
                <tr v-for="row in rows(entry.hex)" :key="row.offset">
                  <th class="text-muted-foreground font-normal pr-5 py-1 text-left select-none">
                    {{ row.offset }}
                  </th>
                  <td class="py-1 tracking-wide">{{ row.hex }}</td>
                </tr>
                <tr v-if="!entry.length">
                  <td class="text-muted-foreground">{{ en ? 'Empty report' : '空报告' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </details>
    </div>
  </section>
</template>
<style scoped>
.report-entry summary::marker {
  color: var(--muted-foreground);
  font-size: 10px;
}
.report-entry[open] > summary {
  background: var(--muted);
}
.report-entry summary {
  min-height: 64px;
}
</style>

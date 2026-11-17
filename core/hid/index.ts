export interface Collection {
  children?: Collection[]
  outputReports?: Report[]
  featureReports?: Report[]
}
interface Report {
  reportId: number
  items: { reportSize: number; reportCount: number }[]
}
export function prepareReport(
  collections: Collection[],
  kind: 'output' | 'feature',
  id: number,
  input: string,
) {
  if (!Number.isInteger(id) || id < 0 || id > 255) throw Error('Report ID: 0–255')
  if (input.length > 200000) throw Error('Report too large')
  if (!/^(?:\s*(?:0x)?[\da-f]{2}\s*)*$/i.test(input))
    throw Error('Invalid HEX bytes / HEX 必须为完整字节')
  const tokens = input.match(/(?:0x)?[\da-f]{2}/gi) || []
  const data = Uint8Array.from(tokens, (t) => parseInt(t.replace(/^0x/i, ''), 16))
  const reports: Report[] = []
  function visit(cs: Collection[]) {
    for (const c of cs) {
      reports.push(...(kind === 'output' ? c.outputReports || [] : c.featureReports || []))
      visit(c.children || [])
    }
  }
  visit(collections)
  const sizes = reports
    .filter((r) => r.reportId === id)
    .map((r) => Math.ceil(r.items.reduce((n, i) => n + i.reportSize * i.reportCount, 0) / 8))
  if (!sizes.length) throw Error('Report ID not supported by device / 设备不支持此报告 ID')
  if (!sizes.includes(data.length))
    throw Error(`Expected ${sizes.join('/')} bytes, got ${data.length} / 字节长度不匹配`)
  return data
}

import { Braces, Image, Radio, Gamepad2 } from 'lucide-vue-next'

export const toolGroups = [
  {
    id: 'data',
    zh: '数据与编码',
    en: 'Data & encoding',
    introZh: '处理文本、数字和校验值，把数据转换成需要的形式。',
    introEn: 'Convert text and numbers, generate codes and verify checksums.',
    icon: Braces,
    slugs: ['ascii', 'base-converter', 'signed-converter', 'crc', 'qr-code'],
  },
  {
    id: 'images',
    zh: '图片与动画',
    en: 'Images & animation',
    introZh: '转换图片格式、调整照片色彩，或把图片变成动画。',
    introEn: 'Convert images, adjust photo colors and build animations.',
    icon: Image,
    slugs: ['image-converter', 'gif-maker'],
  },
  {
    id: 'devices',
    zh: '硬件通信',
    en: 'Hardware communication',
    introZh: '连接串口与 HID 设备，调试报文和通信数据。',
    introEn: 'Connect serial and HID devices to inspect reports and communication data.',
    icon: Radio,
    slugs: ['web-serial', 'webhid', 'crsf'],
  },
  {
    id: 'input',
    zh: '输入设备测试',
    en: 'Input device tests',
    introZh: '检查键盘按键和手柄输入，直观查看设备状态。',
    introEn: 'Inspect keyboard keys and gamepad controls with live visual feedback.',
    icon: Gamepad2,
    slugs: ['gamepad-test', 'keyboard-test'],
  },
]
export const descriptionsZh: Record<string, string> = {
  ascii: '在 ASCII、UTF-8 文本与字节之间双向转换。',
  'base-converter': '多个进制输入框实时同步，精确处理大整数。',
  'signed-converter': '十进制、原码、补码和 BCD 实时互转。',
  crc: '使用常见 CRC 预置计算并核对校验值。',
  'qr-code': '将文本和网址生成二维码，导出 PNG 或 SVG。',
  'image-converter': '批量转换 JPEG、PNG、WebP，调整尺寸与质量。',
  'gif-maker': '图片多次追加、排序，生成 GIF 动画。',
  'web-serial': '配置串口参数，收发文本或 HEX 数据。',
  webhid: '连接 HID 设备，查看输入报告与字节日志。',
  crsf: '实时解析 CRSF 串口数据，查看 RC 通道数值。',
  'gamepad-test': '查看按键、扳机和摇杆状态，测试震动。',
  'keyboard-test': '104 键实时高亮，查看物理按键和历史记录。',
}


import { toolIcons } from './toolIcons'

export const tools = [
  [
    'signed-converter',
    'Signed & BCD converter',
    '原码 / 补码 / BCD 转换器',
    'Development',
    'Convert decimal, sign-magnitude, two’s complement and BCD',
  ],
  [
    'qr-code',
    'QR code generator',
    '二维码生成器',
    'Development',
    'Generate local QR codes and download PNG or SVG',
  ],
  ['crc', 'CRC calculator', 'CRC 计算器', 'Development', 'Checksums for text and bytes'],
  ['crsf', 'CRSF parser', 'CRSF 解析器', 'Development', 'Inspect offline telemetry frames'],
  ['ascii', 'ASCII converter', 'ASCII 转换器', 'Development', 'Text and byte representations'],
  ['base-converter', 'Base converter', '进制转换器', 'Development', 'Exact integers in bases 2–36'],
  [
    'image-converter',
    'Image converter',
    '图片格式转换',
    'Images',
    'Convert JPEG, PNG and WebP locally',
  ],
  ['gif-maker', 'GIF maker', 'GIF 生成器', 'Images', 'Build animations from image sequences'],
  [
    'web-serial',
    'Serial assistant',
    'Web Serial 串口助手',
    'Devices',
    'Send and receive serial data locally',
  ],
  [
    'gamepad-test',
    'Gamepad tester',
    '手柄测试',
    'Input',
    'Inspect controller buttons, sticks and vibration',
  ],
  ['webhid', 'WebHID debugger', 'WebHID 调试工具', 'Devices', 'Connect and inspect HID reports'],
  ['keyboard-test', 'Keyboard test', '键盘测试', 'Input', 'Inspect physical key events'],
].map(([slug, en, zh, category, description]) => ({
  slug,
  en,
  zh,
  category,
  description,
  icon: toolIcons[slug as keyof typeof toolIcons],
}))

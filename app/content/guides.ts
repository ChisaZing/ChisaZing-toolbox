type Guide = {
  purpose: string
  steps: string[]
  limits: string
  example: string
  faq: [string, string][]
}
type Pair = { zh: Guide; en: Guide }
export const guides: Record<string, Pair> = {
  crc: {
    zh: {
      purpose: '计算文本或 HEX 字节的 CRC 校验值，用于核对数据完整性。',
      steps: [
        '选择 CRC 预置，核对 width、poly、init、refin、refout 与 xorout。',
        '输入文本；若输入字节，勾选 HEX。文本使用 UTF-8，空格与换行参与计算。',
        '点击“转换 / 计算”，查看 HEX、无符号十进制与二进制结果。修改输入后重新计算。',
      ],
      limits:
        '当前支持六个预置；尚不支持文件、自定义参数或期望值匹配。HEX 必须由完整字节组成，可含空白及 0x 前缀。',
      example: '选择 CRC-8/SMBUS，输入 123456789（不勾选 HEX），结果 HEX 为 F4。',
      faq: [
        ['大小写会影响结果吗？', '文本大小写会改变输入字节；HEX 字母大小写不影响字节值。'],
        ['复制失败怎么办？', '手动选中结果文本后复制。'],
      ],
    },
    en: {
      purpose: 'Calculate CRC checksums for text or hexadecimal bytes.',
      steps: [
        'Select a CRC preset and review its parameters.',
        'Enter UTF-8 text, or enable HEX for byte input. Text whitespace and line breaks are preserved.',
        'Select Convert / Calculate. Review HEX, decimal and binary results; recalculate after editing.',
      ],
      limits:
        'Six presets are available. File input, custom parameters and expected-value matching are not implemented. HEX requires complete bytes; whitespace and 0x prefixes are accepted.',
      example: 'CRC-8/SMBUS with text 123456789 produces HEX F4.',
      faq: [
        [
          'Does letter case matter?',
          'Text case changes bytes; case in hexadecimal digits does not.',
        ],
        ['What if copying fails?', 'Select and copy the result manually.'],
      ],
    },
  },
  crsf: {
    zh: {
      purpose: '通过串口实时查看 CRSF 报文与通道值，或离线解析报文文件。',
      steps: [
        '实时模式：设置与设备一致的波特率，点击“选择串口并连接”，在浏览器选择串口。默认配置为 420000、8N1、无流控。',
        '接收 0x16 通道帧后，查看 CH1–CH16 原始值；断开或超过 1 秒未更新时显示过期。',
        '离线模式：粘贴 HEX 或选择 .bin / .txt 文件，点击“解析报文”。可导出 JSON，完成后断开串口。',
      ],
      limits:
        '串口需支持 Web Serial 的安全上下文。实时保留最近 1000 条；离线输入最大 10 MiB、最多 20000 条记录。只接收，不发送；命令额外 CRC 未校验。',
      example:
        '离线加载规范示例 C8 07 32 EE 13 13 01 66 06，主 CRC 校验通过；该命令不是通道帧，不会更新通道条。',
      faq: [
        ['为什么通道条没有数值？', '需收到 CRC 正确的 0x16 帧；其他报文只显示解析记录。'],
        [
          '为什么无法连接？',
          '检查浏览器支持、HTTPS 或 localhost、串口权限，以及串口是否被其他程序占用。',
        ],
      ],
    },
    en: {
      purpose: 'Inspect live CRSF serial data and channel values, or parse offline captures.',
      steps: [
        'Set the device baud rate, then select and connect to a serial port. Defaults: 420000, 8N1, no flow control.',
        'Valid 0x16 frames update CH1–CH16 raw values. Values are marked stale after one second without updates or on disconnect.',
        'For offline input, paste HEX or choose a .bin / .txt file and select Parse frames. Export JSON as needed; disconnect when finished.',
      ],
      limits:
        'Live mode requires Web Serial in a secure context and retains 1000 records. Offline limits: 10 MiB and 20000 records. Receive only; secondary command CRC is not verified.',
      example:
        'Load C8 07 32 EE 13 13 01 66 06 offline. Its main CRC passes; it is not a channel frame and does not update channel bars.',
      faq: [
        [
          'Why are channel bars empty?',
          'They require a CRC-valid 0x16 frame. Other types appear in the parsed log.',
        ],
        [
          'Why does connection fail?',
          'Check browser support, HTTPS or localhost, permissions and whether another program holds the port.',
        ],
      ],
    },
  },
  ascii: {
    zh: {
      purpose: '在文本与不同进制的字节列表之间转换，明确区分 ASCII 与 UTF-8。',
      steps: [
        '选择字节进制：2、8、10 或 16。默认将文本转换为字节。',
        '反向转换时勾选“字节转文本”，用空格、逗号或换行分隔字节。',
        '处理中文等非 ASCII 文本时勾选 UTF-8，然后点击转换。',
      ],
      limits:
        '输入最大 1 MiB。标准 ASCII 仅接受 0–127；UTF-8 字节范围为 0–255，非法 UTF-8 报错。控制字符目前作为文本输出，不提供完整参考表。',
      example: '选择 16 进制，输入 A 得到 41；勾选“字节转文本”输入 41 得到 A。',
      faq: [['中文为什么报错？', '标准 ASCII 不包含中文，请使用 UTF-8 模式。']],
    },
    en: {
      purpose: 'Convert text and byte lists with separate ASCII and UTF-8 modes.',
      steps: [
        'Choose base 2, 8, 10 or 16 for byte values. Text-to-bytes is the default.',
        'Enable Decode bytes to convert back. Separate values with spaces, commas or line breaks.',
        'Enable UTF-8 for non-ASCII text, then calculate.',
      ],
      limits:
        'Input limit: 1 MiB. ASCII accepts 0–127; UTF-8 accepts bytes 0–255 and rejects invalid sequences. Control characters are currently returned as text; a reference table is not available.',
      example: 'In base 16, A becomes 41. Enable Decode bytes and enter 41 to get A.',
      faq: [
        ['Why is non-English text rejected?', 'ASCII has a limited character range. Enable UTF-8.'],
      ],
    },
  },
  'base-converter': {
    zh: {
      purpose: '使用精确整数算法在 2–36 进制之间转换。',
      steps: [
        '在任意进制输入框中输入有符号整数。',
        '二、八、十、十六及三十六进制输入框会实时同步，无需点击转换。',
        '可直接编辑另一输入框来切换输入源；输入错误时其他框清空，修正后自动恢复。',
      ],
      limits:
        '最多 4096 位输入；不支持小数、内部空白或下划线。0x、0b、0o 前缀须与所选进制一致。负数按数学负号表示。',
      example: '在十六进制框输入 FF，十进制框同步为 255，二进制框为 11111111。',
      faq: [['大整数会丢精度吗？', '使用 BigInt 运算，不经浮点数中转。']],
    },
    en: {
      purpose: 'Convert exact signed integers between bases 2–36.',
      steps: [
        'Enter an integer in any base field.',
        'Base 2, 8, 10, 16 and 36 fields synchronize automatically.',
        'Edit another field to change the source. Invalid input clears other values until corrected.',
      ],
      limits:
        'Maximum 4096 input digits. No fractions, internal whitespace or underscores. Prefixes 0x, 0b and 0o must match the selected base. Negative values use a mathematical minus sign.',
      example: 'Enter FF in the hexadecimal field: decimal updates to 255 and binary to 11111111.',
      faq: [
        [
          'Are large integers exact?',
          'Yes. Calculations use BigInt without a floating-point intermediate.',
        ],
      ],
    },
  },
  'image-converter': {
    zh: {
      purpose: '在本地转换静态 JPEG、PNG、WebP，并调整尺寸和质量。',
      steps: [
        '选择图片并核对缩略图；重新选择会替换当前批次。',
        '选择输出格式、最大宽度；JPEG 可设置透明区域填色，JPEG/WebP 可设置质量。',
        '点击“转换图片”，逐张查看结果并下载。设置改变后需重新转换。',
      ],
      limits:
        '最多 10 张，单张 20 MiB，总计 50 MiB，单张最多 2000 万像素。不放大小图；拒绝动态 PNG/WebP、GIF 和 SVG。取消阻止后续处理，但不能立即终止正在执行的原生编码。',
      example: '选择透明 PNG，输出 JPEG，背景选白色，最大宽度设为 800；结果透明区域变为白色。',
      faq: [['会保留 EXIF 和色彩配置吗？', '重绘会移除原始元数据，不保证 ICC 或色彩完全一致。']],
    },
    en: {
      purpose: 'Convert static JPEG, PNG and WebP locally, with size and quality controls.',
      steps: [
        'Choose images and review thumbnails. Choosing again replaces the batch.',
        'Select output format and maximum width. Set quality for JPEG/WebP and transparency fill for JPEG.',
        'Convert, review and download each result. Reconvert after changing settings.',
      ],
      limits:
        'Up to 10 images, 20 MiB each, 50 MiB total and 20 million pixels each. Images are not enlarged. Animated PNG/WebP, GIF and SVG are rejected. Cancel stops later work but cannot immediately interrupt native encoding.',
      example:
        'Convert a transparent PNG to JPEG with a white fill and maximum width 800. Transparent areas become white.',
      faq: [
        [
          'Are metadata and color profiles preserved?',
          'Redrawing removes original metadata. Exact ICC/color preservation is not guaranteed.',
        ],
      ],
    },
  },
  'gif-maker': {
    zh: {
      purpose: '把多张静态图片按顺序合成为 GIF 动画。',
      steps: [
        '选择图片，可多次点击“继续添加图片”追加帧。拖拽或用上下箭头排序，也可删除单帧。',
        '设置最长边、每帧时长和循环方式。所有帧等比居中放入首帧比例的白色画布。',
        '点击“生成 GIF”，等待实际完成帧数增加，预览后下载。可取消后重新生成。',
      ],
      limits:
        '1–60 帧，单帧 10 MiB，总计 50 MiB；最长边 1–800 px；时长 20–2000 ms，步进 10 ms。按方形上限保守估算缓冲不超过 128 MiB。GIF 最多 256 色，会损失颜色细节。',
      example: '依次加入三张图片，设最长边 480、时长 100 ms、无限循环，生成三帧动画。',
      faq: [
        [
          '为什么添加图片失败？',
          '累计帧数、总大小或缓冲预算可能超限；减少帧数或缩小最长边后重试。原有帧会保留。',
        ],
        ['支持视频或透明背景吗？', '当前仅支持静态 JPEG/PNG/WebP 图片序列，输出使用白色背景。'],
      ],
    },
    en: {
      purpose: 'Combine an ordered sequence of static images into an animated GIF.',
      steps: [
        'Choose images; use Add images to append more batches. Drag or use arrows to reorder; remove frames as needed.',
        'Set longest edge, frame duration and looping. Frames use contain fitting on a white canvas with the first frame’s aspect ratio.',
        'Generate, watch completed-frame progress, preview and download. Cancel and retry if needed.',
      ],
      limits:
        '1–60 frames, 10 MiB each, 50 MiB total. Longest edge: 1–800 px. Duration: 20–2000 ms in 10 ms steps. A conservative square-frame budget is limited to 128 MiB. GIF supports up to 256 colors and loses color detail.',
      example:
        'Add three images, set edge 480, duration 100 ms and infinite looping to make a three-frame animation.',
      faq: [
        [
          'Why was an additional batch rejected?',
          'The combined frame, size or buffer limit may be exceeded. Reduce frames or size and retry; existing frames are retained.',
        ],
        [
          'Can I use video or transparency?',
          'Only static JPEG/PNG/WebP sequences are supported. Output uses a white background.',
        ],
      ],
    },
  },
  webhid: {
    zh: {
      purpose: '连接浏览器允许访问的 HID 设备，查看输入报告。',
      steps: [
        '使用支持 WebHID 的安全上下文，点击“选择设备并打开”。',
        '选择设备后查看名称、vendorId、productId 和 Collections；操作设备观察输入报告。',
        '可暂停显示、清空或下载 JSON；完成后关闭连接，必要时撤销权限。',
      ],
      limits:
        '支持接收 inputreport，以及手动发送 Output / Feature Report；发送前校验设备描述符和长度并确认。Feature Report 读取尚未实现。最多保留 1000 条或 5 MiB；单条超过 1 MiB 不记录。实机验收尚未完成。',
      example:
        '连接一个允许访问的非受保护 HID 设备，触发设备输入，日志显示时间、reportId、HEX 和字节长度。实际内容由设备决定。',
      faq: [
        ['为什么找不到普通键盘或鼠标？', '浏览器可能保护或屏蔽这些报告，并非所有 HID 都可访问。'],
        ['暂停会停止设备发送吗？', '不会。暂停期间跳过日志显示，恢复后只显示后续报告。'],
      ],
    },
    en: {
      purpose: 'Connect an accessible HID device and inspect its input reports.',
      steps: [
        'In a secure context with WebHID support, select a device and open it.',
        'Review its name, vendorId, productId and collections. Operate the device to observe reports.',
        'Pause display, clear or download JSON. Close the connection or revoke permission when finished.',
      ],
      limits:
        'Input reports and manual Output/Feature Report sending are supported. Descriptor and byte length are checked before confirmation. Feature reads are not implemented. Buffer: 1000 reports or 5 MiB; individual reports over 1 MiB are skipped. Real-device validation is pending.',
      example:
        'Connect an accessible, non-protected HID device and trigger input. The log shows time, reportId, HEX and byte length; contents depend on the device.',
      faq: [
        [
          'Why are normal keyboards or mice unavailable?',
          'Browsers may protect or block their reports. Not every HID is accessible.',
        ],
        [
          'Does pause stop device transmission?',
          'No. Reports are skipped while display is paused; resume shows subsequent reports.',
        ],
      ],
    },
  },
  'keyboard-test': {
    zh: {
      purpose: '查看物理按键状态、事件字段和本次测试的按键历史。',
      steps: [
        '点击“开始测试”，让测试区获得焦点。',
        '按下或释放按键，观察高亮、code、key、location、repeat 和组合态信息；历史记录最新在前。',
        '点击“取消测试”结束。失焦只清空当前按下状态，点击测试区可继续。历史可单独清空。',
      ],
      limits:
        'Esc 与 Tab 均参与测试；长按不重复累计独立按下次数。历史最多 500 条。Fn、系统快捷键和部分组合键可能被系统拦截；无法据此保证硬件无故障。',
      example: '按住左 Shift，观察 ShiftLeft 高亮；释放后高亮消失，历史出现按下和释放事件。',
      faq: [
        ['切换窗口后为什么高亮消失？', '失焦会清空按下状态以避免卡键，测试不会因此结束。'],
        ['刷新后能找回历史吗？', '不能，记录仅保存在当前页面会话中。'],
      ],
    },
    en: {
      purpose: 'Inspect physical key states, event fields and session key history.',
      steps: [
        'Start the test and focus the test area.',
        'Press and release keys to inspect highlights, code, key, location, repeat and composition state. History lists newest events first.',
        'Click Cancel test to finish. Focus loss clears held keys; click the area to continue. History can be cleared separately.',
      ],
      limits:
        'Escape and Tab participate in testing. Auto-repeat does not increment independent presses. History retains 500 events. Fn, system shortcuts and some combinations may be intercepted; this does not certify hardware health.',
      example:
        'Hold left Shift to highlight ShiftLeft, then release it. History shows down and up events.',
      faq: [
        [
          'Why do highlights clear when switching windows?',
          'Focus loss clears held states to prevent stuck keys; the test remains active.',
        ],
        [
          'Can history be restored after refresh?',
          'No. It exists only in the current page session.',
        ],
      ],
    },
  },
}

guides['web-serial'] = {
  zh: {
    purpose: '通过浏览器连接本地串口，手动发送文本或 HEX 字节并查看接收数据。',
    steps: [
      '设置波特率、数据位、停止位、校验位和流控，点击“选择串口并连接”。',
      '选择接收区的文本或 HEX 显示。文本采用 UTF-8，跨数据块保留解码状态。',
      '输入待发送内容，选择文本换行或 HEX 模式，点击“发送一次”。完成后断开连接，可清空或导出日志。',
    ],
    limits:
      '需支持 Web Serial 的桌面浏览器及 HTTPS 或 localhost。默认 115200、8N1、无流控。单次发送最多 64 KiB；日志最多 1000 条或 1 MiB。无自动重连或周期发送，真实设备验收待完成。',
    example:
      '连接与串口参数匹配的回环测试设备，文本发送 Hello；或勾选 HEX 发送 48 65 6C 6C 6F。回环设备应返回相同字节。',
    faq: [
      ['为什么接收文本乱码？', '检查波特率及通信参数；非 UTF-8 二进制数据请切换 HEX 显示。'],
      ['为什么串口无法打开？', '确认浏览器权限、串口未被其他程序占用，以及设备连接正常。'],
    ],
  },
  en: {
    purpose:
      'Connect a local serial port, manually send text or HEX bytes and inspect received data.',
    steps: [
      'Set baud rate, data bits, stop bits, parity and flow control, then select a port and connect.',
      'Choose text or HEX log display. Text uses streaming UTF-8 decoding across reads.',
      'Enter data, choose a text line ending or HEX mode, then Send once. Disconnect when done; clear or export logs as needed.',
    ],
    limits:
      'Requires Web Serial in a supported desktop browser over HTTPS or localhost. Defaults: 115200, 8N1, no flow control. Send limit: 64 KiB. Log limit: 1000 records or 1 MiB. No automatic reconnect or periodic sending. Real-device validation is pending.',
    example:
      'With a loopback device using matching serial parameters, send Hello as text or 48 65 6C 6C 6F as HEX. A loopback device should return the same bytes.',
    faq: [
      [
        'Why is text garbled?',
        'Check serial parameters; use HEX display for non-UTF-8 binary data.',
      ],
      [
        'Why does opening fail?',
        'Check permissions, device connection and whether another application holds the port.',
      ],
    ],
  },
}

guides['signed-converter'] = {
  zh: {
    purpose: '在十进制、二进制原码、二进制补码和 8421 BCD 之间实时转换。',
    steps: [
      '选择 8、16、32 或 64 位。',
      '编辑任意输入框，其他表示自动同步；二进制输入需要完整位宽。',
      '复制对应结果，或加载 -42 示例。修改位宽时优先保留当前整数值。',
    ],
    limits:
      '整数范围由所选补码位宽决定。最小负数无法用同位宽原码表示，对应框留空并提示。BCD 为无符号数字分组，负数额外使用前导负号，不使用带符号 packed BCD。',
    example: '8 位的 -42：原码 10101010，补码 11010110，BCD 为 -0100 0010。',
    faq: [
      ['原码负零如何处理？', '统一按数学整数零转换。'],
      ['BCD 的 1010 合法吗？', '不合法，每组必须代表 0–9，即 0000–1001。'],
    ],
  },
  en: {
    purpose: 'Synchronize decimal, binary sign-magnitude, binary two’s complement and 8421 BCD.',
    steps: [
      'Select 8, 16, 32 or 64 bits.',
      'Edit any field to synchronize. Binary input requires the full width.',
      'Copy a result or load the -42 example. Width changes preserve the integer when possible.',
    ],
    limits:
      'The selected signed two’s-complement range applies. Its minimum negative value has no same-width sign-magnitude representation. BCD groups encode decimal digits with a separate leading minus, not a packed sign nibble.',
    example:
      'At 8 bits, -42 is sign-magnitude 10101010, two’s complement 11010110, BCD -0100 0010.',
    faq: [
      ['How is negative zero handled?', 'It is normalized to mathematical zero.'],
      ['Is BCD 1010 valid?', 'No. Each group must encode 0–9 (0000–1001).'],
    ],
  },
}

guides['gamepad-test'] = {
  zh: {
    purpose: '查看浏览器识别的手柄按键、扳机、摇杆和震动能力。',
    steps: [
      '通过 USB 或蓝牙连接手柄，在页面获得焦点后按下手柄按键。',
      '点击插槽切换手柄，查看按键 0–1 数值和摇杆 -1–1 原始轴值。标准映射显示手柄高亮图。',
      '可记录摇杆轨迹并绕圈移动，或点击一次震动测试；暂停检测和离页会停止震动。',
    ],
    limits:
      '通过 Gamepad API 读取，部分设备需先操作才可被发现。非标准映射仅按原始索引展示。轨迹按 36 个方向采样；覆盖不足时偏差仅代表已采样方向。不测量真实回报率、输入延迟或硬件寿命。震动能力取决于浏览器与设备。',
    example:
      '按 A / Cross 时标准映射 B0 数值为 1，示意图对应按钮高亮；松开恢复。模拟浏览器测试不代替真实设备验收。',
    faq: [
      ['为什么没有检测到？', '确认系统识别设备，点击页面后按手柄按键，必要时换用支持的浏览器。'],
      ['摇杆中心不为零就是故障吗？', '原始值可能有偏移；本工具不自动校准或据此判定硬件故障。'],
    ],
  },
  en: {
    purpose: 'Inspect browser-visible controller buttons, triggers, sticks and vibration support.',
    steps: [
      'Connect a controller through USB or Bluetooth, focus the page and press a gamepad button.',
      'Select a slot to inspect 0–1 button values and raw -1–1 axes. Standard mappings show a live controller diagram.',
      'Record a stick trace and rotate the stick, or trigger a one-second vibration test. Pausing or leaving stops vibration.',
    ],
    limits:
      'Uses the Gamepad API; some devices appear only after interaction. Non-standard devices use raw indices. Trace coverage uses 36 angular bins; incomplete coverage represents sampled directions only. This does not measure hardware polling rate, latency or lifespan. Vibration support varies.',
    example:
      'For a standard mapping, pressing A / Cross makes B0 equal 1 and highlights the diagram. Releasing clears it. Mock browser tests do not replace real-device validation.',
    faq: [
      [
        'Why is no controller detected?',
        'Confirm OS detection, focus the page and press a gamepad button; try a supported browser.',
      ],
      [
        'Does center offset mean the stick is broken?',
        'Raw readings may drift. This tool does not calibrate or certify hardware health.',
      ],
    ],
  },
}

guides['qr-code'] = {
  zh: {
    purpose: '本地生成文本或网址二维码，下载 PNG 或 SVG。',
    steps: [
      '输入内容，选择尺寸和纠错等级。',
      '点击生成，核对预览。修改内容后需重新生成。',
      '下载图片，正式使用前扫码验证。',
    ],
    limits: '尺寸 128–2048 px；最大容量由内容和纠错等级共同决定。固定 4 模块留白，不加入 logo。',
    example: '输入 Hello, 世界!，生成后扫码得到相同文本。',
    faq: [['会打开输入的网址吗？', '不会，只编码文本，不访问网址。']],
  },
  en: {
    purpose: 'Generate text or URL QR codes locally and download PNG or SVG.',
    steps: [
      'Enter content, size and correction level.',
      'Generate and review; regenerate after changes.',
      'Download and test scanning before use.',
    ],
    limits:
      '128–2048 px. Capacity depends on content and correction level. Four-module quiet zone, no logo.',
    example: 'Encode Hello, 世界! and scan to retrieve the same text.',
    faq: [['Are entered URLs opened?', 'No. URLs are encoded as text, without visiting them.']],
  },
}

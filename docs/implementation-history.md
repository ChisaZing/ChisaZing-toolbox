# 在线工具站（实施中）

Nuxt 4 / Vue 3 / TypeScript，Tailwind CSS 与 shadcn-vue 源码组件（Reka UI）。

## 运行

```sh
npm ci
npm run dev
npm run generate
npx vitest run
```

Cloudflare Pages 输出目录 `.output/public`。当前强制 noindex，为预览版。

## 当前范围

已实现双语目录、搜索、主题设置，以及独立 core 算法与 CRC、ASCII、进制转换初版界面。其余六项工具页面明确显示未开放。不得将当前版本作为 V1.0 正式版本发布。

输入与结果不持久化，不上传；仅主题设置保存在 localStorage。算法位于 core，界面位于 app/components/tools，工具注册表位于 app/tools.ts。

## 待验收

六项工具、CRC 自定义参数与文件 Worker、统一错误偏移及限额、完整双语、政策页与 SEO、无障碍与 E2E、独立 CRSF 金样本、GIF 解码校验、真实 HID 设备及跨浏览器验证仍需完成。广告默认不集成，品牌、域名与邮箱未配置。

CRC 测试使用 PRD 提供的标准 check 值（ASCII 123456789）；不代表已完成全部算法验收。

## 本轮输入设备工具

新增键盘测试（ANSI 物理 code、左右修饰键、独立按下计数、repeat 与组合态信息、焦点范围监听、Tab/Esc 退出）和鼠标测试（完成点击计数、按下释放、双击、滚轮原始单位、轨迹、1/5/10 秒 CPS、失焦中断）。核心计时与计数在 core/input，UI 在 InputDeviceTool.vue。

验证：Vitest 2 个文件共 6 项测试通过；Nuxt 静态生成 47 路由成功。尚未执行真实键盘鼠标、跨浏览器或浏览器自动化验收，侧键取决于浏览器事件支持。其余四项 CRSF、图片、GIF、WebHID 仍未开放。

## UI 迁移

移除 daisyUI，使用 shadcn-vue 的源码组件模式，组件在 app/components/ui，工具函数在 app/lib/utils.ts，配置在 components.json。按钮使用 Reka UI Primitive，变体通过 class-variance-authority 管理。浅色、深色和实时跟随系统主题由 CSS 变量驱动。原生 select 与 checkbox 保留原生键盘行为。验证：6 项测试通过，静态生成成功；尚未完成浏览器视觉回归。

## 图片转换初版

已开放 JPEG/PNG/WebP 静态图片本地转换，提供批量限制、串行处理、动态 PNG/WebP 检测、实际 MIME 验证、质量、等比缩小、JPEG 背景填色、预览及逐项下载。取消后忽略迟到结果，离页释放对象 URL。浏览器正在执行的单张原生解码/编码不能立即终止；取消会阻止后续图片处理。

验证：4 个测试文件共 10 项测试通过，静态生成成功。尚需独立解码输出检查、旋转 JPEG 金样本、损坏图片与跨浏览器手工验证。CRSF、GIF、WebHID 仍未开放。

## CRSF 初版

新增 Worker 离线解析、HEX/bin/txt 输入、普通帧 CRC、错误记录与逐字节恢复、JSON 导出、取消及输入过期标记。语义映射覆盖 GPS、电池、链路、16 通道、姿态和飞行模式；仍需每类型独立金样本验证。扩展帧显示来源和目标，命令额外 CRC 明确未校验。

测试来源：https://github.com/tbs-fpv/tbs-crsf-spec/blob/main/crsf.md 中 RC Over WiFi 的两个独立报文示例。规范于 2026-11-06 查阅，commit 固定尚未完成，不满足正式发布门槛。13 项单元测试通过，包含两个规范报文、噪声恢复、拼接、CRC 错误和截断；静态构建成功。GIF、WebHID 尚未开放。

## CRSF 串口范围变更

按用户新要求增加 Web Serial 实时接收，不再限于离线解析。用户选择串口并设置波特率（默认 420000，可自定义），8N1、无流控，仅接收不发送。读取器断开前取消并释放锁，离页关闭串口，不自动重连。浏览器能力与安全上下文检测，不支持时保留离线模式。增量解析缓存半帧，记录绝对字节偏移，保留最近 1000 条；断开时标记剩余截断。

15 项单元测试通过，新增所有帧分割位置与断开尾部测试；静态生成成功。尚未完成真实串口设备、拔插、浏览器权限及持续高吞吐压力验证。Web Serial 生命周期参考 https://developer.chrome.com/docs/capabilities/serial 。

## GIF 与 WebHID 初版

GIF 使用 MIT 许可证 gifenc（精确版本见 package-lock.json），Worker 内串行解码、量化和编码，最长边 800 px，默认 480 px；提供排序、删除、时长、循环、取消、预览与下载。预算按方形上限保守估算 128 MiB。gifenc 仓库支持浏览器及 Worker，但本项目尚未进行独立 GIF 解码验收或跨浏览器验证。

WebHID 提供能力检测、用户选择打开设备、关闭、权限撤销检测、拔出处理、inputreport 有界日志、暂停显示、清空及 JSON 下载。专家报告发送/读取与报告描述符校验尚未实现，真实设备及模拟 API 生命周期验收未完成。

验证：8 个测试文件共 17 项通过；静态生成成功，GIF Worker 独立打包。当前九项工具均有初版界面，但仍不是 PRD V1.0 完整交付；政策、SEO、完整边界检查、E2E、实机与独立媒体解码验收仍待完成。

## GIF 追加上传与生成修复（2026-11-07）

选择图片改为追加帧，累计限制校验失败时保留既有列表。Worker 显式引入 gifenc ESM 入口，避免开发模式 CommonJS 入口加载差异。新增 tests/browser/gif.mjs（需先启动本地 3000 开发服务与安装 Edge），实际选择两批图片、生成 GIF 并用 omggif 独立解码。修复后连续两次验证得到 2 帧、480×480、每帧 100 ms。17 项单元测试通过，静态生成成功。

## 使用说明核对（2026-11-07）

九项工具的通用占位说明替换为独立中英文用途、步骤、实际限制、可复现示例、FAQ 与数据处理提示。内容位于 app/content/guides.ts，由 ToolGuide.vue 渲染。核对了实时 CRSF 原始通道值、键盘手动取消与会话历史、图片替换批次、GIF 追加帧、WebHID 当前只接收等行为，并明确尚未实现的功能。静态生成成功；验证 18 个语言工具页面包含各自用途及示例，英文说明无中文混排。

## 新增 Web Serial 串口助手

用户授权新增第十项工具 /zh/tools/web-serial/ 与 /en/tools/web-serial/，包含串口选择、波特率、7/8 数据位、1/2 停止位、奇偶校验与硬件流控；手动 UTF-8/HEX 发送、文本换行、增量 UTF-8 解码、收发统计、限额日志与 JSON 导出。离页关闭连接，不自动重连。单次发送限额 64 KiB；日志最多 1000 条或 1 MiB。新增双语说明。21 项单元测试通过；真实设备收发、拔插及跨浏览器验证仍待完成。

## 串口终端

新增 /zh/tools/serial-terminal/ 与 /en/tools/serial-terminal/，复用 SerialTool 的连接生命周期与有界日志，增加连续 UTF-8 文本视图、按行发送、默认 CRLF、本地回显、自动滚动、清屏和最近 100 条成功发送命令历史。上下方向键调取历史，Enter 发送；不解释 VT100/ANSI 控制指令，不提供 SSH。真实串口设备交互尚未验证。

## 手柄测试（2026-11-07）

新增 gamepad-test 双语路由与目录入口，使用 Gamepad API 逐帧读取，约 30Hz 更新 UI。提供至少八个插槽、多手柄切换、标准映射原创 SVG 示意图、按键/扳机/touched 数值、所有原始轴、双轴轨迹、36 方向径向偏差及覆盖、能力检测的一秒双马达震动。非标准映射不显示标准手柄图，离页/隐藏/暂停/切换时停止震动和检测；不做无限震动。

27 项单元测试通过；静态生成成功。真实手柄、蓝牙拔插、跨浏览器及震动实机验证待完成。参考 https://hardwaretester.com/gamepad 的功能布局和官方 Gamepad API 文档；未复制第三方代码或素材。

## 图片调色器预览版（2026-11-07）

新增 image-color-editor 双语工具，沿用现有上传、静态部署与 UI。纯算法与参数位于 core/image-color-editor，公式先记录于 algorithms.md；七种预设在 presets.ts。固定顺序：线性曝光、白平衡、明暗与对比度、色相、自然饱和度、饱和度，最终量化，alpha 不变。预览与原尺寸导出共用 Worker 算法，不使用 CSS filter 冒充导出。

支持单图点击/拖放、格式与动画检查、20 MiB/1600 万像素/8192 边长限制、11 项滑块与数值调节、单项重置、预设、30 步参数历史、分隔对比、缩放平移、PNG/JPEG/WebP 编码能力检测、等比缩小、JPEG 填色、取消与资源释放。

验证：30 项测试通过；Edge 实际上传 16×16 灰阶 PNG，曝光 +1 EV 后下载重新解码确认像素 64→90、尺寸 16×16、alpha 255。已有静态构建成功。

尚不符合完整 V1.0：预览最大 1600px，100% 仍是放大预览并明确提示；无 Worker 环境尚未分片降级；取消处理期间原生解码不可立即中断；未完成预解码 JPEG/WebP 尺寸读取、长图低内存与 EXIF 方向金样本、全部格式独立解码、移动端视觉 QA、lint/typecheck、SEO canonical/hreflang/sitemap。数值输入失焦/Enter 可能产生重复历史项，键盘滑块历史及换图确认需进一步 E2E。不标记正式 V1.0。

## 标签编辑器（2026-11-07）

新增 label-editor 双语路由、首页分区及 Tags 图标。默认 40×30 mm、203 DPI；尺寸与 DPI 可自定义，最多 50 元素。支持多行文字、字号/粗体、二维码（qrcode）与 CODE128（JsBarcode），拖动和精确毫米定位、复制删除、图层顺序、SVG 导出与黑白 PNG。SVG 文字未转轮廓；PNG 根据 DPI 计算像素，不声明包含打印机可自动识别的 DPI 元数据，应在打印软件指定相同毫米纸张、100% 比例。

37 项测试通过；Edge 实际添加文字/二维码/条形码并导出 PNG，确认 40×30 mm、203 DPI 得到 320×240 px，320px 页面无水平溢出。静态生成成功。真实打印机、字体跨设备与打印后扫码验收仍待完成，不直接控制打印机。

## WebHID 报文发送（2026-11-16）

新增 Output Report 与 Feature Report 单次发送，Report ID 0–255，严格 HEX 字节解析，递归 collection 描述符报告长度检查（不含 ID 字节）；每次发送展示设备 VID/PID、报告类型/ID 和全部字节确认，成功/失败可见，不自动发送。41 项单元测试通过，真实 HID 设备发送仍待实机验证。

## 工具下架（2026-11-17）

按用户要求删除 SVG 绘图、标签编辑器、图片调色器、时钟与计时器。删除组件、专用 core/Worker/测试及 jsbarcode 依赖，移除注册、图标、说明及预渲染路由；时间分类随之移除，现有 14 个工具归入三个分区。本文前面的相关实施记录仅为历史，不代表当前可用功能。

## GitHub Pages 部署

1. 将项目提交到 GitHub 仓库的默认分支（main 或 master）。
2. 在仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。
3. 推送后运行 Deploy GitHub Pages 工作流，也可在 Actions 中手动运行。

工作流使用 Node 24、npm ci、单元测试和 nuxt generate，发布 `.output/public`，无需 gh-pages 分支。通过 configure-pages 获取 base_path 并传入 NUXT_APP_BASE_URL，自动支持 `/仓库名/`、用户站点根路径及 Pages 自定义域名。包含 `.nojekyll`，保留 `_nuxt` 资源。所有已注册页面预渲染，未知地址使用 404.html。

本地模拟项目子路径（PowerShell）：

```powershell
$env:NUXT_APP_BASE_URL = '/web-utils/'
npm run generate
Remove-Item Env:NUXT_APP_BASE_URL
```

当前仍保留预览版 noindex，避免把未完全验收的工具标记为正式上线。GitHub Pages 提供 HTTPS；WebHID/Web Serial 的浏览器支持与权限要求不变。不需要配置任何上传 API、数据库或密钥。部署流程配置参考 https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages 。

## 问题定位
- 不按路由分段时 `chains.length === 1`，`viewBox` 高度为 `height = rowH + 8 ≈ 36`。
- 组 `transform` 为 `translate(0, 12)`，而标签与指示线使用负值 `y=-20/-18`，导致在单链路时标签整体位于 SVG 顶部之外（坐标 < 0），被裁剪。
- 当前标签文本只显示时分秒毫秒（`timeShort`），未包含日期字符串，视觉上也“看不到日期”。

## 修复方案
1. 标签与指示线垂直位置
- 将标签 `y` 从 `-20` 改为位于行内的非负坐标（建议 `y=-2`），指示线从色块上边连接到标签（`y1=-8 → y2=-4`）。
- 或者增加全局顶部缓冲：`height = props.chains.length * rowH + 24`，确保负值坐标仍在视窗内。推荐同时进行：改标签坐标以保证任何行数下都可见。

2. 标签内容显示日期
- 将 `frameLabel` 改为包含 `toLocaleDateString()` 与时间，例如：`YYYY/MM/DD HH:mm:ss.SSS`，并保留 `category + severity` 信息。
- 示例：`api ERROR 2025/12/06 12:31:05.240`。

3. 刻度与缩放适配
- 刻度计算已基于 `viewStart/viewEnd`，无需更改；仅确保标签位置与行内显示在缩放时不被顶部裁剪。

## 具体改动点
- 文件：`packages/vue-pc/src/components/LoggerMiniMap.vue`
- 修改：
  - 将标签 `y` 调整为 `-2`，指示线 `y2` 调整为 `-4`，使其在单行时不越界。
  - 在 `frameLabel` 改为拼接 `dateStr = new Date(ms).toLocaleDateString()` 与 `timeStr`。
  - 可选：`height = props.chains.length * rowH + 24` 以提供顶部缓冲。

## 验证
- 切换“按路由分段”开关为关闭，`chains` 仅一行时，缩略图应显示每个色块的指示线与包含日期的标签。
- 在不同缩放与拖拽情况下，标签始终可见且不被裁剪。
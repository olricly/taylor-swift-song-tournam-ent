# Taylor Swift 歌曲对战锦标赛网站 Spec

## Why
Taylor Swift 拥有庞大且多元的歌曲作品库，粉丝间"哪首最好听"的争论从未停歇。本项目通过一个移动端友好的"二选一"对战式网站，让用户从 128 首最具代表性的歌曲中层层筛选，最终选出个人最爱，并以可视化表格完整记录整个评选过程，兼具趣味性、互动性与社交分享价值。

## What Changes
- 新增：单页移动端 Web 应用（手机竖屏优先，自适应平板/桌面）
- 新增：128 首 Taylor Swift 代表歌曲数据集（综合 Spotify、Apple Music、QQ音乐、网易云音乐等平台的播放量/收藏量/评论数筛选）
- 新增：歌曲库覆盖 Taylor Swift **全部 12 张录音室专辑** 与 **全部 4 张已发行重录专辑（Taylor's Version）**，具体如下：
  - 录音室专辑（按发行时间）：
    1. *Taylor Swift* (2006)
    2. *Fearless* (2008)
    3. *Speak Now* (2010)
    4. *Red* (2012)
    5. *1989* (2014)
    6. *reputation* (2017)
    7. *Lover* (2019)
    8. *folklore* (2020)
    9. *evermore* (2020)
    10. *Midnights* (2022)
    11. *THE TORTURED POETS DEPARTMENT* (2024)
    12. *The Life of a Showgirl* (2025-10-03，第 12 张录音室专辑，12 首曲目，含 Sabrina Carpenter 合作 title track)
  - 已发行重录专辑（Taylor's Version，含 From the Vault 曲目）：
    - *Fearless (Taylor's Version)* (2021-04-09)
    - *Red (Taylor's Version)* (2021-11-12)
    - *Speak Now (Taylor's Version)* (2023-07-07)
    - *1989 (Taylor's Version)* (2023-10-27)
  - 说明：根据 Taylor Swift 2025-05-31 公开声明，她已买回前六张专辑母带，且 *reputation (Taylor's Version)* 与 *Taylor Swift (Taylor's Version)* 不会正式发行，故不纳入重录专辑范围；*reputation* 原版曲目已计入上方录音室专辑
- 新增：单淘汰制对战核心交互（128 → 64 → 32 → 16 → 8 → 4 → 2 → 1，共 7 轮 127 场对局）
- 新增：歌曲卡片组件（封面、歌名、所属专辑、发行年份、时长、综合热度等信息）
- 新增：进度追踪与轮次过渡提示
- 新增：最终冠军揭晓页（含动画庆祝效果）
- 新增：完整对战过程表格视图（HTML table，支持轮次分组折叠、冠军高亮）
- 新增：本地持久化（localStorage 保存进度与结果，支持断点续选）
- 新增：装饰性视觉资源（通过 byted-seedream-image-generate / algorithmic-art 生成）
- 新增：代码审查与设计合规校验（coderabbit + web-design-guidelines）

## Impact
- Affected specs: 无（全新项目）
- Affected code:
  - `/workspace/index.html` - 主入口 HTML
  - `/workspace/styles/main.css` - 视觉系统与样式
  - `/workspace/scripts/app.js` - 对战逻辑与状态管理
  - `/workspace/scripts/songs-data.js` - 128 首歌曲数据集
  - `/workspace/scripts/bracket.js` - 对战表渲染逻辑
  - `/workspace/assets/` - 装饰图片、图标等资源

## ADDED Requirements

### Requirement: 歌曲数据集
系统 SHALL 提供 128 首 Taylor Swift 代表歌曲的完整数据集，每首歌曲包含：`id`、`title`、`album`、`year`、`duration`（秒）、`trackNumber`、`popularityScore`（综合各平台数据 0-100）、`era`（专辑时期分类）、`coverColor`（主色，用于卡片视觉）、`isVault`（布尔，是否为 From the Vault 曲目）、`isTV`（布尔，是否为 Taylor's Version 版本）。

#### Scenario: 数据完整性
- **WHEN** 应用加载 songs 数据
- **THEN** 必须包含恰好 128 首歌曲
- **AND** 每首歌曲字段完整无空值
- **AND** 数据集内 id 唯一
- **AND** 同一歌曲不重复收录（同一首歌的原版与 Taylor's Version 不重复出现；优先收录原版，Taylor's Version 仅在视觉标识上以 `isTV` 标记）

#### Scenario: 专辑覆盖范围
- **WHEN** 制定 128 首歌曲名单
- **THEN** 必须覆盖全部 12 张录音室专辑（含 *The Life of a Showgirl* 全部 12 首曲目）
- **AND** 必须覆盖全部 4 张已发行重录专辑（Fearless TV、Red TV、Speak Now TV、1989 TV）的 From the Vault 曲目
- **AND** 每张专辑至少收录 1 首（保证多样性）
- **AND** *The Life of a Showgirl* 全部 12 首曲目均纳入候选

#### Scenario: The Life of a Showgirl 曲目
- **WHEN** 整理 *The Life of a Showgirl* 专辑数据
- **THEN** 必须包含以下 12 首曲目：
  1. The Fate of Ophelia
  2. Elizabeth Taylor
  3. Opalite
  4. Father Figure
  5. Eldest Daughter
  6. Ruin the Friendship
  7. Actually Romantic
  8. Wish List（原版名 Wi$h Li$t）
  9. Wood
  10. Cancelled!
  11. Honey
  12. The Life of a Showgirl (feat. Sabrina Carpenter)

#### Scenario: 歌曲选取依据
- **WHEN** 制定 128 首歌曲名单
- **THEN** 综合参考 Spotify 播放量、Apple Music 热度、QQ音乐收藏/播放、网易云音乐评论/收藏数据
- **AND** 包含所有正式单曲与重要宣传曲
- **AND** 适度纳入粉丝向 Vault 曲目与隐藏佳作以保证多样性

### Requirement: 对战核心交互
系统 SHALL 实现 128 进 1 的单淘汰制对战流程，共 7 轮 127 场对局。

#### Scenario: 单场对战
- **GIVEN** 当前轮次尚未结束
- **WHEN** 用户进入对战页
- **THEN** 同时展示两首歌曲卡片（移动端上下排列，桌面端左右排列）
- **AND** 用户点击其中一首后，该首晋级、对手淘汰
- **AND** 自动进入下一场配对
- **AND** 顶部进度条更新（已完成场次 / 当前轮总场次）

#### Scenario: 完成一轮
- **WHEN** 当前轮次所有配对完成
- **THEN** 显示轮次过渡提示（如 "Round 1 Complete — Sweet 16 Ahead"）
- **AND** 晋级歌曲按 seed 重新配对进入下一轮
- **AND** 用户可手动点击"继续"按钮推进

#### Scenario: 选出冠军
- **WHEN** 第 7 轮（决赛）完成
- **THEN** 展示冠军歌曲庆祝页（含 confetti / 光效动画）
- **AND** 提供"查看完整对战表"与"重新开始"按钮

### Requirement: 移动端优先设计
系统 SHALL 在手机竖屏（375px 宽度基准）下完整可用，并自适应平板（768px）与桌面（≥1024px）。

#### Scenario: 手机竖屏
- **WHEN** 在 375px 宽度设备上访问
- **THEN** 所有元素可见且可点击
- **AND** 触控目标尺寸 ≥ 44×44px
- **AND** 无横向滚动
- **AND** 字号不小于 14px

#### Scenario: 桌面端
- **WHEN** 在 ≥1024px 宽度设备上访问
- **THEN** 两张歌曲卡片左右并排展示
- **AND** 整体内容居中且不超过 1200px

### Requirement: 对战过程表格
系统 SHALL 提供完整记录所有对战选择的表格视图。

#### Scenario: 表格展示
- **WHEN** 用户进入"对战表"页面
- **THEN** 以表格形式列出全部 127 场对战
- **AND** 每行包含：轮次、场次编号、歌曲A、歌曲B、用户选择、结果状态（晋级/淘汰）
- **AND** 支持按轮次分组折叠展开
- **AND** 冠军行高亮显示且固定置顶
- **AND** 未进行场次显示"待定"

#### Scenario: 表格可读性
- **WHEN** 在手机端查看表格
- **THEN** 表格支持横向滚动或卡片式布局
- **AND** 关键信息（歌名、选择）始终可见

### Requirement: 本地持久化
系统 SHALL 使用 localStorage 保存对战进度。

#### Scenario: 断点续选
- **GIVEN** 用户已完成若干场对战
- **WHEN** 用户刷新页面或关闭后重开
- **THEN** 自动恢复至上次进度
- **AND** 已淘汰歌曲不重复出现

#### Scenario: 重新开始
- **WHEN** 用户点击"重新开始"
- **THEN** 清除 localStorage 中的进度数据
- **AND** 重新随机/按 seed 生成首轮 128 进 64 配对

### Requirement: 美学风格
系统 SHALL 采用独特、有记忆点的设计美学，避免通用 AI 模板风格（避免 Inter/Roboto 字体、避免紫色渐变白底等俗套配色）。

#### Scenario: 视觉一致性
- **WHEN** 用户访问任意页面
- **THEN** 使用统一的设计语言（字体、配色、间距、动效）
- **AND** 体现 Taylor Swift 多变音乐美学，可在不同轮次切换 album era 主题色
- **AND** 使用特色字体（display + body 配对，避免通用字体）
- **AND** 背景含层次质感（噪点、渐变 mesh、几何装饰），非纯色

#### Scenario: 动效
- **WHEN** 用户进行选择或切换页面
- **THEN** 卡片有 hover / press 反馈
- **AND** 轮次切换有过渡动画
- **AND** 冠军揭晓有庆祝动画

### Requirement: 装饰资源生成
系统 SHALL 通过指定 skill 生成装饰性视觉资源。

#### Scenario: 背景与装饰图
- **WHEN** 需要背景纹理或装饰元素
- **THEN** 使用 byted-seedream-image-generate 生成符合美学方向的图片资源
- **AND** 使用 algorithmic-art 生成程序化装饰图案（如粒子、流场）
- **AND** 资源体积合理，不影响首屏加载性能

### Requirement: 代码与设计审查
系统 SHALL 通过指定的代码审查与设计审查 skill。

#### Scenario: 代码审查
- **WHEN** 主要功能实现完成
- **THEN** 调用 trae-remote-official:coderabbit:code-review 进行代码审查
- **AND** 修复 review 中提出的 critical / major 问题

#### Scenario: 设计审查
- **WHEN** UI 实现完成
- **THEN** 调用 web-design-guidelines skill 进行合规性审查
- **AND** 修复可访问性、响应式、对比度等问题

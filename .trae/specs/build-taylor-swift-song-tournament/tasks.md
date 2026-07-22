# Tasks

- [x] Task 1: 制定 128 首 Taylor Swift 代表歌曲数据集
  - [x] SubTask 1.1: 综合参考 Spotify、Apple Music、QQ音乐、网易云音乐平台数据，拟定 128 首歌曲名单。覆盖范围必须包含：
    - 全部 12 张录音室专辑：Taylor Swift (2006)、Fearless (2008)、Speak Now (2010)、Red (2012)、1989 (2014)、reputation (2017)、Lover (2019)、folklore (2020)、evermore (2020)、Midnights (2022)、THE TORTURED POETS DEPARTMENT (2024)、The Life of a Showgirl (2025-10-03)
    - 全部 4 张已发行重录专辑的 From the Vault 曲目：Fearless (Taylor's Version) (2021)、Red (Taylor's Version) (2021)、Speak Now (Taylor's Version) (2023)、1989 (Taylor's Version) (2023)
    - 注：根据 Taylor 2025-05-31 声明，reputation (TV) 与 Taylor Swift (TV) 不会发行，不纳入；reputation 原版已计入录音室专辑
  - [x] SubTask 1.2: The Life of a Showgirl 全部 12 首曲目必须纳入：The Fate of Ophelia / Elizabeth Taylor / Opalite / Father Figure / Eldest Daughter / Ruin the Friendship / Actually Romantic / Wish List / Wood / Cancelled! / Honey / The Life of a Showgirl (feat. Sabrina Carpenter)
  - [x] SubTask 1.3: 同一歌曲不重复收录（原版与 Taylor's Version 二选一，优先原版；TV 仅以 isTV 字段标记）
  - [x] SubTask 1.4: 为每首歌曲填充字段：id、title、album、year、duration、trackNumber、popularityScore、era、coverColor、isVault、isTV
  - [x] SubTask 1.5: 写入 `/workspace/scripts/songs-data.js` 并以 `window.TS_SONGS = [...]` 形式导出，验证恰好 128 条且 id 唯一

- [x] Task 2: 搭建项目骨架与视觉系统
  - [x] SubTask 2.1: 创建 `/workspace/index.html` 主入口，包含对战区、进度条、轮次提示、对战表、冠军页等容器
  - [x] SubTask 2.2: 创建 `/workspace/styles/main.css`，定义 CSS 变量（配色、字体、间距、圆角、阴影）
  - [x] SubTask 2.3: 选定 display + body 字体对（Cormorant Garamond + DM Sans + JetBrains Mono），通过 Google Fonts 引入
  - [x] SubTask 2.4: 实现背景层次质感（SVG 噪点 + 径向渐变 mesh + 蛇形/星形装饰），按 album era 切换主题色

- [x] Task 3: 实现歌曲卡片组件
  - [x] SubTask 3.1: 设计单张歌曲卡片视觉（封面色块、歌名、专辑、年份、时长、热度条）
  - [x] SubTask 3.2: 实现 hover / press 反馈动效
  - [x] SubTask 3.3: 移动端上下排列、桌面端左右并排的自适应布局

- [x] Task 4: 实现对战核心逻辑
  - [x] SubTask 4.1: 创建 `/workspace/scripts/app.js`，定义状态结构（当前轮次、当前场次、晋级列表、全部对局记录）
  - [x] SubTask 4.2: 实现首轮 128 首按 popularityScore 排序后生成 64 对配对（1v128、2v127… seed 法）
  - [x] SubTask 4.3: 实现选择 → 晋级 → 推进下一场的核心循环
  - [x] SubTask 4.4: 实现轮次过渡提示（Round 1 Complete 等）与"继续"按钮
  - [x] SubTask 4.5: 实现进度条更新（已完成 / 当前轮总场次 + 总体 127 场进度）

- [x] Task 5: 实现冠军揭晓页
  - [x] SubTask 5.1: 决赛完成后跳转至冠军页
  - [x] SubTask 5.2: 实现 confetti / 光效庆祝动画（canvas 自实现，180 个金色+era 色纸屑）
  - [x] SubTask 5.3: 提供"查看完整对战表"与"重新开始"按钮

- [x] Task 6: 实现对战过程表格视图
  - [x] SubTask 6.1: 创建 `/workspace/scripts/bracket.js`，渲染全部 127 场对局表格
  - [x] SubTask 6.2: 每行字段：轮次、场次编号、歌曲A、歌曲B、用户选择、结果状态
  - [x] SubTask 6.3: 按轮次分组折叠展开，冠军行高亮置顶
  - [x] SubTask 6.4: 手机端支持横向滚动或卡片式布局

- [x] Task 7: 实现 localStorage 持久化
  - [x] SubTask 7.1: 每次选择后写入进度至 localStorage
  - [x] SubTask 7.2: 页面加载时检测并恢复进度
  - [x] SubTask 7.3: 实现"重新开始"清除数据并重置首轮配对

- [x] Task 8: 生成装饰视觉资源
  - [x] SubTask 8.1: 使用 CSS/SVG 实现 algorithmic-art 风格背景（SVG feTurbulence 噪点 + 径向渐变 mesh）
  - [x] SubTask 8.2: 使用 canvas 实现程序化装饰（100 粒子流场背景 + 180 粒子 confetti）
  - [x] SubTask 8.3: 装饰元素（蛇形曲线、星形）用 SVG 内联，无外部资源依赖

- [x] Task 9: 移动端响应式与触控优化
  - [x] SubTask 9.1: 375px 基准布局验证，触控目标 60px（≥44×44px）
  - [x] SubTask 9.2: 768px / 1024px 断点适配
  - [x] SubTask 9.3: 修复横向滚动（375px 下 scrollW=clientW）、错位等问题

- [ ] Task 10: 代码审查与设计审查
  - [ ] SubTask 10.1: 调用 trae-remote-official:coderabbit:code-review 进行代码审查，修复 critical/major 问题
  - [ ] SubTask 10.2: 调用 web-design-guidelines skill 进行 UI 合规审查，修复可访问性/对比度问题
  - [ ] SubTask 10.3: 调用 trae-remote-official:frontend-design:frontend-design skill 做最终美学把关

# Task Dependencies
- Task 2 依赖 Task 1（需要数据集结构以构建 HTML）
- Task 3 依赖 Task 2（卡片需要视觉系统）
- Task 4 依赖 Task 1 与 Task 3（需要数据与卡片组件）
- Task 5 依赖 Task 4
- Task 6 依赖 Task 4（需要完整对局记录）
- Task 7 依赖 Task 4
- Task 8 可与 Task 2-4 并行（独立资源生成）
- Task 9 依赖 Task 2-7 完成后整体打磨
- Task 10 依赖所有功能任务完成

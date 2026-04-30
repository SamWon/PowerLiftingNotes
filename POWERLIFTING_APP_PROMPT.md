# 力量举训练计划规划与记录小程序需求 Prompt

你是一名专业的微信小程序开发工程师。请在当前微信小程序项目中持续开发一款用于力量举训练计划规划与训练记录的小程序，遵循现有原生小程序 TS/LESS 结构，优先保持实现简洁、可靠、可扩展。

> **维护约定（重要）**：本文件是产品的"权威需求文档"。每当用户提出新功能、调整或废弃旧行为时，AI 在改动代码的同一轮中**必须**同步更新本文件——
> - 在"已实现功能"中追加 / 修改 / 删除条目；
> - 必要时更新"数据模型与本地存储"、"数据导入导出"、"开发要求"等小节；
> 不要把改动只写在 commit 信息或聊天里，必须落到本文件。

## 产品定位

这是一款面向力量举训练者的本地训练日志与计划工具。核心目标是让用户快速记录卧推、深蹲、硬拉等训练内容，并能够长期保存、查看、导入和导出自己的训练数据。

## 设计风格

- 整体 UI 走优雅、简洁、克制的风格。
- 信息层级清晰，适合高频记录和回看。
- 避免营销式落地页，打开后直接进入可用的训练记录体验。
- 交互控件需要稳定、易点按，适配手机屏幕。
- 颜色 / 表面 / 间距统一通过 `miniprogram/styles/theme.less` 的 CSS 变量与 `miniprogram/utils/theme.ts` 的 `themeColors` 维护，禁止裸色值。

## 已实现功能

### 1. 训练记录列表（首页）

- 展示所有训练记录，默认按训练日期由近到远排序。
- 支持切换"列表 / 日历"两种视图。
- 日历模式中有训练的日期需要有明确视觉标记（高亮 + 组数小徽标）。
- 每条训练记录卡片显示：日期、动作数量、各动作的组数 chips。
- 每条记录提供「编辑」「删除」按钮。删除前需 `wx.showModal` 二次确认。
- 同一天**不会**出现多条记录，详见「3. 同日合并」。

### 2. 创建 / 编辑训练记录

- 用户可以选择训练日期（不能晚于今天）。
- 用户从动作选择弹窗中选择训练动作。动作列表由 `miniprogram/config/exercises.ts` 的 `EXERCISE_CATALOG` 提供。
  - 动作选择**不提供"添加自定义动作"功能**。所有动作来自内置目录。
  - 动作按肌群分组（胸 / 腿 / 背 / 肩 / 手臂 / 核心），弹窗顶部提供横向 tab 切换分组，下方网格仅展示当前分组的动作。
  - 打开弹窗时自动定位到当前选中动作所属的分组 tab。
  - 动作卡片需展示配图；当 `imageUrl` 缺失时使用兜底样式（动作名首字 + 渐变背景），不要使用"图"占位文字。
- 每个动作可以添加多组训练数据。每组训练数据包含：
  - 重量（kg，允许 0，表示自重 / 空杆）。
  - 次数（>0）。
  - RPE（1-10）。
- 一次保存只包含当前选中的一个动作；需要在同一天记录多个动作时，重复进入本页面保存，同日合并逻辑会自动追加。
- 编辑模式：在记录卡片点击「编辑」会进入本页面，预填该记录第一个动作的内容；保存时直接覆盖原记录（仅保留本次编辑的单个动作，不会触发同日合并）。
  - 由于本页面是 tabBar 页，跳转参数通过临时本地存储 key `powerlifting_editing_record_id` 传递，进入页面后立即消费并清除。
  - 编辑模式的页面顶部展示一条横幅提示，并提供「取消编辑」按钮。

### 3. 同日合并

- 新建模式下若已存在与所选日期相同的记录，则**自动合并**而不是新增一条：
  - 同名动作 → 追加 sets。
  - 不同动作 → 追加新动作条目。
- 编辑模式不会触发合并，始终覆盖原记录。

### 4. 1RM 与百分比输入

- 每个动作可选填一个 1RM（kg），保存在本地存储中（key：`powerlifting_one_rep_max`）。
- 在创建/编辑页选中动作后，会展示该动作当前 1RM；可弹出 `wx.showModal({ editable: true })` 进行修改或清除（留空清除）。
  - 注意：`editable: true` 时 `content` 字段是文本框的**初始值**而非说明，因此把当前 1RM 放入 `content`，提示语用 `placeholderText`。
- 当所选动作存在 1RM 时，每个训练组提供两种重量输入方式，用 kg / % 切换按钮切换：
  - kg：直接输入重量。
  - %：输入 1RM 百分比，自动按 0.5kg 精度换算成实际重量。
- 当重量与 1RM 都已填写时，输入框下方展示换算提示（如 "≈ 80% 1RM" 或 "≈ 100 kg"）。
- 当所选动作没有 1RM 时，% 切换按钮**直接隐藏**（保持卡片简洁），输入仅有 kg 模式。

### 5. 训练记录展示

- 每个 set chip 主文本为 `次数 · 重量kg · RPE x`；重量为 0 时省略 kg 段。
- 当该动作存在 1RM 时，set chip 下方追加副标 `xx% 1RM`。

### 6. 关于页

- 关于页用于介绍本应用，初版保留简短占位内容。
- 关于页提供训练记录导出能力（生成 JSON 文件，使用 `wx.shareFileMessage` 或 `wx.saveFileToDisk` 兜底）。
- 关于页提供训练记录导入能力：
  - 支持一次选择多个文件。
  - 导入成功后**直接覆盖**当前本地训练记录。
  - 因为导入会覆盖数据，执行导入前必须 `wx.showModal` 弹窗提醒用户确认。
  - 导入兼容旧版本（缺失 `weight` 字段时按 0 兜底）以及"裸 `TrainingRecord[]`"格式。

## 数据模型与本地存储

- 训练记录长期存储在 `wx.getStorageSync` 中。
- 集中维护的本地存储 key 见 `miniprogram/utils/training/storage.ts`：
  - `powerlifting_training_records`：训练记录主存。
  - `powerlifting_exercises`：历史遗留的动作选项缓存（当前不再写入，只在需要时读取兜底）。
  - `powerlifting_one_rep_max`：各动作的 1RM 表，结构为 `{ [exerciseName]: number }`。
  - `powerlifting_editing_record_id`：跨 tab 跳转传递"待编辑记录 id"的临时 key，进入 create 页后立即消费并清除。
- 数据结构（见 `miniprogram/utils/training/types.ts`）：
  - `TrainingSet { reps, rpe, weight }`。
  - `TrainingExercise { name, sets[] }`。
  - `TrainingRecord { id, date(YYYY-MM-DD), createdAt, exercises[] }`。
- 旧版本数据（无 `weight`）在 `loadTrainingRecords` 与 `normalizeImportedRecords` 中通过 `normalizeRecord / normalizeSet` 自动补 `weight = 0`，保持向后兼容。

## 数据导入导出

- 当前导出格式版本 `EXPORT_FORMAT_VERSION = 2`。
- 字段结构升级时同步更新 `miniprogram/utils/training/import-export.ts` 与 `miniprogram/utils/training/migration.ts`，并在导入侧确保旧版本仍可被解析。

## 开发要求

- 保持代码风格与当前项目一致，原生小程序 + TS + LESS。
- 不引入不必要的依赖。
- 功能改动应尽量集中且可验证。
- 本地存储 key、导出数据结构和类型定义需要清晰，方便后续维护。
- 颜色 / 间距 / 圆角等样式 token 集中维护，不写裸色值。
- 修改用户可见行为时，**同步更新本文件**（见顶部"维护约定"）。
- **小按钮一律用 `<view bindtap>` 实现**：在 Skyline 渲染下原生 `<button>` 的固定宽度容易被默认样式覆盖、把同行控件挤压成 0 宽，因此除"全宽主/次按钮"外（如 `.primary-button.full` / `.secondary-button.full` / `.exercise-picker-button` / `.exercise-option`），所有 ghost / 图标 / 切换类按钮都使用 view 模拟，避免布局漂移。
- **禁止使用可选链 `?.` 语法**：微信小程序 JS 运行时不支持 `?.` 可选链语法（会抛出 `SyntaxError: Unexpected token .`）。所有涉及可能为空的属性访问，必须改用显式三元表达式，例如 `obj?.prop` → `obj ? obj.prop : undefined`。TypeScript `target` 设为 `ES5` 可让编译器自动降级，但若项目使用 `ES2020` 则需手动替换。

## 后续扩展方向

- 为每个训练动作增加配图、动作说明（已留 `imageUrl` / `description` / `techniqueTips` 字段）。
- 增加训练计划模板和周期规划。
- 增加重量、容量、估算 1RM、趋势图等统计能力。
- 增加按动作筛选训练历史。
- 强化数据格式版本迁移（`migration.ts` 已预留升级链）。

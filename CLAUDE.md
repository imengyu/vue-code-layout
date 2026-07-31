# CLAUDE.md

本文件为 Claude Code 在此仓库工作时提供指引。

## 项目概述

`vue-code-layout` 是一个 Vue 3 编辑器布局组件库，用于开发类 VSCode 的 Web 编辑器界面。发布到 npm，当前版本 1.2.5，MIT 协议。

对外提供两个核心组件：

- **CodeLayout** —— VSCode 外层布局：标题栏、活动栏（ActivityBar）、主侧栏（primarySideBar）、辅助侧栏（secondarySideBar）、底部面板（bottomPanel）、中央区域（centerArea）、状态栏。
- **SplitLayout** —— 中央编辑器区域布局：可无限嵌套切分的网格 + Tab 页，支持拖拽切分。通常放在 CodeLayout 的 `centerArea` 插槽内，也可独立使用。

关键特性：面板拖放（跨区域、Tab 头、切分）、显示/隐藏与右键菜单、布局数据的保存与加载（JSON）、CSS 变量主题化、i18n（内置 en/zh）。

### 平台限制

- 仅支持 Vue 3，**不支持 Vue 2**。
- **不支持 SSR**。
- 为 PC 端设计，不适合移动设备。
- 组件占满父容器，父容器必须有 `position: relative` 和确定的高度。

## 常用命令

```shell
npm install
npm run dev          # 启动示例项目 (vite serve examples)
npm run build-demo   # 构建示例到 examples/dist
npm run build-lib    # 构建库到 lib/ (vite build library)
npm run typecheck    # cd library && vue-tsc --noEmit
npm run docs:dev     # vitepress 文档开发服务
npm run docs:build   # 构建文档
```

无测试框架。`@vue/test-utils` 虽在 devDependencies 中，但没有 vitest/jsdom，也没有 `test` 脚本。修改后请用 `npm run typecheck` + `npm run dev` 手动验证。

`npm run typecheck` 是可信的（需 TypeScript >= 5.6 + vue-tsc 2.x，低版本会因 node_modules 里的 `.d.mts` 解析错误静默跳过所有 library 代码）。

`build-lib` 会改写被 git 跟踪的 `library/tsconfig.tsbuildinfo`，构建后用 `git checkout -- library/tsconfig.tsbuildinfo` 还原。

## 目录结构

```
library/              # 库源码（唯一发布产物来源）
  index.ts            # 入口：导出全部类型/组件 + Vue 插件 install()
  CodeLayout.ts       # 核心数据模型：CodeLayoutConfig、CodeLayoutPanelInternal、CodeLayoutGridInternal
  CodeLayoutRootGrid.ts   # CodeLayout 根网格（三大侧栏容器 + save/loadLayout）
  CodeLayoutConsts.ts     # defaultAccept
  CodeLayout.vue          # CodeLayout 组件（含拖放主逻辑 dragDropToPanelNear）
  CodeLayoutBase.vue      # 外层骨架（标题栏/状态栏/活动栏/区域切分）
  CodeLayoutGroupRender.vue / CodeLayoutPanelRender.vue   # 面板组与面板渲染
  CodeLayoutGroupDraggerHost.vue  # 面板组之间的拖拽调整大小
  SplitLayout/
    SplitN.ts         # SplitLayout 数据模型：SplitNGridInternal/PanelInternal/RootGrid
    SplitLayout.vue   # SplitLayout 组件（拖放、Tab 激活）
    SplitN.vue        # N 等分网格与尺寸计算（百分比）
    SplitNest.vue / SplitTab*.vue
  Composeable/        # 组合式逻辑：DragDrop、MouseHandler、ResizeChecker、PanelMenu、LateClass 等
  Components/         # 可独立使用的子组件：CodeLayoutScrollbar、OverflowCollapseList、SimpleTooltip、CodeLayoutCustomizeLayout
  Icons/              # 内置 SVG 图标组件（Codicon 风格）
  Language/           # i18n：en.ts、zh.ts、index.ts（addCodeLayoutLang / useCodeLayoutLang）
  Scss/               # Base.scss（含全部 CSS 变量）、Menu.scss、Split.scss
  Utils/              # Assert、EventEmitter、HtmlUtils、SaveUtils、Timer
examples/             # 开发用示例项目，vite alias 'vue-code-layout' -> '../../library'
docs/                 # VitePress 文档，中文在 docs/，英文在 docs/en/
lib/                  # 构建产物（gitignore，勿手改）
```

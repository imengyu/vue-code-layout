# CodeLayout 重构方案

> 目标：抛弃现有 CodeLayout 的数据结构与拖放实现，从零重写一套自洽、可测试、不依赖
> SplitLayout 的编辑器外壳布局组件；对外 API 尽量保持兼容。
>
> 原实现全部移动至 `library/old/` 只读保留，仅作查阅参考，不参与构建。

---

## 1. 目标与范围

### 1.1 必须达成

| # | 目标 | 说明 |
|---|---|---|
| G1 | 数据结构重写 | 用「区域 / 组 / 面板」三层固定模型替代当前「面板即组即网格」的自指结构 |
| G2 | 去掉对 SplitLayout 的依赖 | 外壳四区域切分自己实现，两套组件彻底解耦 |
| G3 | 尺寸分配正确 | 面板尺寸改为权重制，布局为纯函数，任何时刻子项之和恒等于容器 |
| G4 | 拖放逻辑重写 | 落点判定 → 拖放计划 → 应用，三段分离，计划层为纯函数可单测 |
| G5 | 对外 API 兼容 | `CodeLayoutConfig`、插槽、`CodeLayoutInstance`、面板实例方法保持可用 |
| G6 | 可测试 | 数据模型、布局算法、拖放解析全部脱离 DOM，用 vitest 覆盖 |

### 1.2 不在本次范围

* SplitLayout 不重写（上个提交已解耦其数据结构，本次只断开 CodeLayout 对它的引用）。
* 不新增功能特性；不改 CSS 变量与视觉风格（Scss 复用）。
* 不支持 Vue 2 / SSR / 移动端（与现状一致）。
* 跨 CodeLayout ↔ SplitLayout 互拖仍不支持（现状也不支持，`sourceFlag` 已隔离）。

### 1.3 范围边界内的行为变更（需在文档中标注）

1. 面板 `size` 语义由「像素」改为「同组内权重」；新增 `getPixelSize()` 取当前实际像素
   （详见 §6.1、§11.3）。
2. 切换区域显示/隐藏不再重建布局树，区域内组件不再被卸载重建（详见 §7.3）。
3. `inhertParentGrid` 作废；`parentGrid` 变为只读派生值（详见 §5.4）。
4. 保存数据格式不向下兼容，旧版 JSON 不再可加载（详见 §11.3）。

### 1.4 已确认的决策（2026-07-31）

| # | 议题 | 决策 |
|---|---|---|
| C1 | `onDropToGrid`/`onDropToPanel` 返回值语义 | **保持现有代码行为**（返回 `true` 阻止），改文档而不改代码（§8.6） |
| C2 | `size` 语义 | 改为权重，**新增 `getPixelSize()`** 获取当前实际像素（§11.3） |
| C3 | 旧保存数据兼容 | **不兼容**，不做 v1 迁移（§11.3） |
| C4 | `library/old/` | **暂时保留**，后续按需手动删除（§13.3） |
| C5 | 多选拖拽 | **不做**，拖放全流程按单节点设计（§8.2） |

---

## 2. 原组件功能清单（重写必须覆盖）

从 `library/CodeLayout.vue`、`CodeLayoutBase.vue`、`CodeLayoutGroupRender.vue`、
`CodeLayoutGroupDraggerHost.vue`、`CodeLayoutPanelRender.vue` 及文档逐项梳理。

### 2.1 外壳结构

* 标题栏：图标 / 主菜单（MenuBar）/ 中心 / 右侧 / 自定义布局弹窗入口；`titleBar` 开关。
* 标题栏上下附加区：`titleBarTop`、`titleBarBottom`。
* 活动栏：主活动栏 + 第二活动栏；位置 `side` / `top` / `bottom` / `hidden`；
  `side` 时按 `primarySideBarPosition` 决定左右挂载，`top`/`bottom` 时退化为侧栏内的 icon Tab。
* 四大区域：primarySideBar、secondarySideBar、bottomPanel、centerArea（插槽）。
* 状态栏：整体插槽或 left/right 两分；`statusBar` 开关。
* 六种 `panelAlignment`：`left` / `center` / `right` / `justify` / `left-side` / `right-side`，
  叠加 `panelPosition: top|bottom`（`-side` 时 panelPosition 失效）。
* `bottomPanelMaximize`：底栏最大化时隐藏 centerArea；拖动底栏尺寸可反向解除最大化。

### 2.2 区域内结构

* 区域含多个「组」，区域自身是 Tab 容器：primarySideBar 由活动栏选中组，
  secondarySideBar 用 icon Tab，bottomPanel 用 text Tab。
* 组含多个「面板」：`tabStyle` 决定组的呈现方式
  （`none`/`single` → 折叠手风琴，`text`/`icon`(+`-bottom`) → Tab，`hidden` → 无头直接透传）。
* 组标题栏（大标题）：`activityBarSubGroupShowTitle` 且组在侧栏时显示。
* 面板折叠头：标题 + 箭头 + 小图标 + actions；点击折叠/展开；相邻面板间可拖拽调整尺寸。
* 空区域提示：`emptyGroup` 插槽 + `emptyText`，且空区域可接收拖放。

### 2.3 交互

* 面板/组拖放：面板→面板（四向/两向）、面板→Tab 头、面板→活动栏项、面板→空区域。
* 拖拽调整尺寸：区域间（外壳分隔条）、组内面板间（折叠模式下的 drag-line）。
* 拖拽到屏幕边缘 40px 自动展开对应区域（`draggingMouseMoveHandler`）。
* 右键菜单：`toggleVisible`、`toggleBadge`、`otherPanelsCheck`、`panelPosition` + 自定义项。
* 自定义布局弹窗（`CodeLayoutCustomizeLayout`）：各区域显隐、侧栏位置、面板对齐。
* Tab 溢出折叠（`OverflowCollapseList`）；Tooltip；badge。
* 非面板数据拖入：`onNonPanelDrag` / `onNonPanelDrop`。
* 键盘控制器（`useKeyBoardControllerTop`）：快捷键注册基础设施。

### 2.4 数据

* `saveLayout()` / `loadLayout(json, cb)` / `clearLayout()`。
* `getPanelByName`、`addGroup`、`removeGroup`、`getRootGrid`、`relayoutAll`、`relayoutGroup`。
* 面板实例：`addPanel`、`removePanel`、`open/close/togglePanel`、`removeSelf(WithShrink)`、
  `setActiveChild`、`reselectActiveChild`、`activeSelf`、`isSelfActived`、`getContainerSize`、
  `relayoutAfterToggleVisible` 等。
* 回调：`onResize`、`onVisibleChange`、`onOpenChange`、`preDropCheck`、`accept`。
* i18n（en/zh + `addCodeLayoutLang` + `stringsOverride`）。

---

## 3. 原实现问题诊断

以下每条都标注了源码位置，重写时逐条对应验证。

### 3.1 数据结构（对应「原有数据结构设计混乱」）

| 编号 | 问题 | 位置 |
|---|---|---|
| D1 | `CodeLayoutPanelInternal` 一个类同时充当顶级网格容器、组、面板三种角色，字段大量场景互斥（`open` 只对面板有意义、`children`/`activePanel` 只对组有意义、`collapse()` 只对区域有意义），文档需要靠「（仅组中使用）」注释来区分 | `CodeLayout.ts:400-837` |
| D2 | `CodeLayoutGridInternal extends CodeLayoutPanelInternal`，导致面板身上也有 `addGroup`，类型上无法阻止非法嵌套；文档明确「组最多嵌套一级」，但类型系统不表达这个约束 | `CodeLayout.ts:841` |
| D3 | `parentGrid` 是手工维护的反范式字段，与树结构重复；靠 `inhertParentGrid` + `addChild`/`addChilds`/`replaceChild` 三处手工赋值同步，任一路径漏写即错（上个提交的「Fix drag parentGrid missing」正是此类 bug） | `CodeLayout.ts:715-778` |
| D4 | `size` 字段在 CodeLayout 中是像素、在 SplitLayout 中是百分比，同名不同义，而 DragDrop 是两者共用模块 | `CodeLayout.ts:1050` / `SplitN.ts:207` |
| D5 | `LateClass` 把数据 → 视图做成命令队列：数据对象 `pushLateAction`，宿主组件 `listenLateAction` 注册回调。一个 name 只能有一个监听者（`Map.set` 覆盖），未挂载时命令无限堆积，卸载时若漏 `unlistenAllLateAction` 就串台 | `LateClass.ts:17-59` |
| D6 | 实例注册表以 `name` 为全局键，而拖放分割时新组名用 `name + '.clone' + Math.floor(Math.random()*10)`，只有 10 种后缀，必然碰撞 | `CodeLayout.vue:463` |
| D7 | 三大区域网格从不登记进 `panelInstances`（只有 `addPanel`/`addChild` 才登记），导致 `saveGridLayoutDataToConfig()` 三次查询恒为 `undefined`，整个函数是死代码——区域尺寸实际从未回存 config | `CodeLayoutBase.vue:337-357`（注释已自承认） |
| D8 | 拖放时手工 `root.addPanelInstanceRef` / `deletePanelInstanceRef` 散落在 `CodeLayout.vue` 与 `CodeLayout.ts` 多处，注册表与树结构容易不一致 | `CodeLayout.vue:468,603,613` |

### 3.2 对 SplitLayout 的依赖（对应「CodeLayout 依赖于 SplitLayout」）

| 编号 | 问题 | 位置 |
|---|---|---|
| S1 | 外壳四区域切分整个借用 `SplitLayout` + `CodeLayoutSplitNRootGrid`，构造一批「名字必须等于插槽名」的伪网格来当区域容器，区域内容再靠具名插槽分发回来 | `CodeLayoutBase.vue:37-47,125-141` |
| S2 | 任何 config 变化（显隐、尺寸、对齐、位置）都走 `loadLayout()` 整树重建：`clearLayout()` + 重新 `addChildGrid`。区域内容随之卸载重建，用户组件状态丢失（文档「组件卸载提示」一节正是在向用户解释这个缺陷） | `CodeLayoutBase.vue:103-280` + 12 个 `watch` |
| S3 | config ↔ 网格状态双向同步靠 `nextNoChangeLayout` 一次性哨兵变量压制 watch 回环，属于典型的时序 hack；`onMinCloseChanged` 回写 config 又会触发 watch，靠这个哨兵挡住 | `CodeLayoutBase.vue:282-293` |
| S4 | `bottomPanelMaximize` 与底栏尺寸互相推导，阈值判断写在 `watch(currentBottom.size)` 里，`fullSize` 计算还依赖 `rootGrid.primarySideBar.size`（另一套数据结构的字段） | `CodeLayoutBase.vue:306-321` |

### 3.3 尺寸分配（对应「CodeLayoutGroupDraggerHost 面板分配大小存在问题」）

| 编号 | 问题 | 位置 |
|---|---|---|
| R1 | 面板尺寸是绝对像素，直接写进数据对象；容器尺寸变化时用「差值增量再分配」逐个补偿，没有任何一处保证 `Σ子项 == 容器`，误差会累积成空隙或溢出 | `CodeLayoutGroupDraggerHost.vue:458-512` |
| R2 | **明确 bug**：`panelHandleOpenClose` 关闭分支统计总和时把兄弟面板的尺寸误写成 `panel.size`（当前面板），应为 `_panel.size`，导致 `allSize` 完全错误 | `CodeLayoutGroupDraggerHost.vue:310-317` |
| R3 | 关闭面板腾出的空间只塞给「找到的第一个」打开面板就 `return`，不按比例分摊 | `CodeLayoutGroupDraggerHost.vue:324-341` |
| R4 | **明确 bug**：`watch(() => props.group.children)` 监听数组引用，而增删走 `children.splice/push` 原地修改，引用不变 → 回调基本不触发；实际重排只能依赖 `LateClass` 那条旁路，两条通路的行为不一致 | `CodeLayoutGroupDraggerHost.vue:549-551` |
| R5 | **明确 bug**：`flushDraggable()` 把用户配置字段 `panel.resizeable` 当内部状态反复覆写，用户设置的 `resizeable: false` 会被静默改掉且无法恢复 | `CodeLayoutGroupDraggerHost.vue:347-368` |
| R6 | 无最小/最大尺寸的整体可行性校验：`minSize` 未设时一律取全局 `panelMinHeight`(150)，N 个面板时 `N*150` 可能远超容器，无降级策略，直接溢出 | `CodeLayoutGroupDraggerHost.vue:67-78` |
| R7 | 初始化依赖 `onMounted` → `nextTick` → `setTimeout(200ms)` 三级延迟串联，且 `relayoutAllWhenSizeChange` 被调用两次，尺寸稳定时机不确定 | `CodeLayoutGroupDraggerHost.vue:629-640` |
| R8 | 布局状态散落在数据对象上（`lastRelayoutSize`、`lastLayoutSizeCounter`）并被拖放判定读取，视图状态污染数据模型 | `CodeLayout.ts:786-787`、`GroupDraggerHost.vue:597` |

### 3.4 拖放（对应「整个组件拖拽面板的逻辑存在问题」）

| 编号 | 问题 | 位置 |
|---|---|---|
| P1 | `dragDropToPanelNear` 单函数 ~150 行、8 个特例分支，分支条件混用 `instanceof CodeLayoutGridInternal`、`getIsTabContainer()`、`dropTo` 字符串、`children.length === 1`，无法推理也无法测试 | `CodeLayout.vue:369-523` |
| P2 | `onDropToGrid` / `onDropToPanel` 的语义与文档相反。文档说「返回 false 阻止拖动」，代码写的是 `const userCancel = cb(...) ?? false; if (userCancel) return;`（即返回 true 才阻止）。examples 里的示例恒返回 `false`，掩盖了这个矛盾。**决策 C1：保留代码行为，改文档**（§8.6） | `CodeLayout.vue:327,375` + `docs/api/CodeLayout.md` |
| P3 | 分割组时新组名靠随机数拼接（见 D6），并且 `Object.assign(new ..., {...reference})` 会连 `LateClass` 的 markRaw 回调容器一起浅拷贝（SplitLayout 侧已用 `cloneGridStyle` 修正过同类问题，CodeLayout 侧未修） | `CodeLayout.vue:461-465` |
| P4 | 拖入后一律 `panel.size = 0` 再指望宿主分配，尺寸正确性完全依赖 `LateClass` 通知是否送达 | `CodeLayout.vue:417,426,511` |
| P5 | `getFlatternChildOrSelf()` 在拖组时静默把组打散成面板、丢弃组本身，用户拖一个组的结果是组消失 | `CodeLayout.ts:811` |
| P6 | 删除逻辑 `removePanelInternal` + `relayoutAfterRemovePanel` 把「收缩策略」「激活项重选」「布局通知」「注册表维护」四件事缠在一起 | `CodeLayout.vue:548-619` |
| P7 | 拖拽会话状态是**模块级全局**（`currentDragPanels`、`dragEndEventDispatch`），同页面多个 CodeLayout 实例互相干扰 | `DragDrop.ts:61-62` |
| P8 | 边缘自动展开用 `window.innerWidth/innerHeight` 硬编码，组件非全屏时判定错位 | `DragDrop.ts:109-121` |
| P9 | 数据结构支持多面板拖拽（`currentDragPanels` 数组），但 CodeLayout 侧只取 `getCurrentDragPanel()`（第 0 个），数组与实际用法不一致。**决策 C5：CodeLayout 不做多选，统一按单节点建模**，消除这处不一致 | `DragDrop.ts:76-78` |
| P10 | 活动栏刷新用「清空 children → `$forceUpdate()` → 塞回」的 hack（源码注释自称 `//fuck`），说明响应式链路有问题 | `CodeLayoutActivityBar.vue:53-61` |
| P11 | `togglePanel()` 里遗留 `console.log` | `CodeLayout.ts:594` |

---

## 4. 重构总体设计

### 4.1 三条设计原则

**原则一：三层固定模型，类型即约束。**
区域（Region）→ 组（Group）→ 面板（Panel），层级固定为 3，深度不可变。
每层是独立的类，字段只包含该层真正需要的东西。文档中「组最多嵌套一级」的约束由类型系统直接表达，
而不再靠运行时注释提醒。

**原则二：尺寸是派生值，不是存储值。**
数据里只存「相对权重 / 百分比」；像素尺寸由纯函数 `computeLayout(children, containerPx, opts)`
在渲染时算出。容器变化只是输入变化，不需要任何补偿逻辑，恒等式
`Σ子项像素 == 容器像素` 由算法本身保证（§6.2）。

**原则三：拖放三段分离。**
`resolveDropTarget`（DOM 落点 → 目标描述）→ `planDrop`（目标描述 + 树 → 变更计划，纯函数）
→ `applyPlan`（计划 → 修改树）。中间层无 DOM 依赖，可直接单测。

### 4.2 与原实现的映射关系

| 原 | 新 | 说明 |
|---|---|---|
| `CodeLayoutPanelInternal`（三合一） | `CodeLayoutPanelInstance` / `CodeLayoutGroupInstance` / `CodeLayoutRegionInstance` | 拆三类，共同基类只放公共字段 |
| `CodeLayoutGridInternal` | `CodeLayoutRegionInstance` | 区域固定三个，不再由用户创建 |
| `CodeLayoutRootGrid` | `CodeLayoutRootGrid`（同名保留，内部重写） | 对外类名不变，避免破坏 `new CodeLayoutRootGrid()` |
| `LateClass` 命令队列 | 删除。视图从数据派生；确需通知视图的场景用 `EventEmitter`（`Utils/EventEmitter.ts` 已有） | 见 §5.5 |
| `parentGrid` 存储字段 | `get region()` 派生 getter（向上走树） | 保留 `parentGrid` 作为兼容别名 |
| `CodeLayoutBase.vue` + SplitLayout | `CodeLayoutShell.vue` + `ShellSplitter.vue` | 自实现四区域切分 |
| `CodeLayoutGroupDraggerHost.vue` | `PanelStack.vue` + `Layout/computeStack.ts` | 算法抽成纯函数 |
| `dragDropToPanelNear`（150 行） | `DragDrop/planDrop.ts`（纯函数）+ `applyPlan.ts` | 见 §8 |

### 4.3 分层架构

```
┌─────────────────────────────────────────────────────────┐
│ CodeLayout.vue        对外组件：props/slots/instance      │
├─────────────────────────────────────────────────────────┤
│ CodeLayoutShell.vue   外壳骨架：标题栏/活动栏/状态栏      │
│   └ ShellSplitter.vue 四区域切分 + 分隔条（替代 SplitLayout）│
├─────────────────────────────────────────────────────────┤
│ RegionRender.vue      区域：组的 Tab 容器                 │
│   └ GroupRender.vue   组：手风琴 or Tab                   │
│       ├ PanelStack.vue    手风琴模式：多面板 + 分隔条      │
│       └ PanelRender.vue   单面板渲染 + 折叠头              │
├─────────────────────────────────────────────────────────┤
│ Model/    数据模型（无 DOM、无 Vue 组件依赖）              │
│ Layout/   布局算法（纯函数）                              │
│ DragDrop/ 拖放解析与计划（planDrop 为纯函数）             │
└─────────────────────────────────────────────────────────┘
```

依赖方向严格单向：组件 → Model/Layout/DragDrop，反向禁止。
Model 层不得 import 任何 `.vue`，只允许 import `reactive`/`markRaw` 等 Vue 响应式原语。

---

## 5. 新数据结构

### 5.1 层级定义

```
CodeLayoutRootGrid                       根，持有三个区域 + 注册表
├── CodeLayoutRegionInstance  'primarySideBar'    区域，Tab 容器，children: Group[]
├── CodeLayoutRegionInstance  'secondarySideBar'
└── CodeLayoutRegionInstance  'bottomPanel'
        └── CodeLayoutGroupInstance                组，children: Panel[]
                └── CodeLayoutPanelInstance        面板，叶子，无 children
```

* 区域固定三个，由 `CodeLayoutRootGrid` 构造函数创建，用户不能增删。
  `centerArea` 不是数据节点，它只是外壳上的一个插槽位。
* 组只能挂在区域下；面板只能挂在组下。层级恒为 3，没有例外分支。
* 区域自身是 Tab 容器（`activeGroup`）：primarySideBar 由活动栏切换，
  secondarySideBar 用 icon Tab，bottomPanel 用 text Tab。

### 5.2 类定义

```ts
// Model/Node.ts —— 公共基类
export abstract class CodeLayoutNode {
  readonly id: string;              // 内部唯一键，单调递增计数器生成，永不重复
  name: string;                     // 用户可见标识，同一布局内唯一（构造时校验）
  title = '';
  tooltip?: string;
  badge?: string | (() => VNode);
  showBadge = true;
  iconLarge?: string | (() => VNode);
  iconSmall?: string | (() => VNode);
  actions?: CodeLayoutActionButton[];
  data?: any;
  draggable = true;
  visible: boolean;                 // 普通响应式字段；不再需要 relayoutAfterToggleVisible
  accept?: CodeLayoutRegionName[];
  preDropCheck?: PreDropCheck;
  onVisibleChange?: (visible: boolean) => void;
  readonly sourceFlag = FLAG_CODE_LAYOUT;

  parent: CodeLayoutNode | null;    // 唯一的结构真相
  get root(): CodeLayoutRootGrid | null;
  get region(): CodeLayoutRegionName;   // 派生：向上走到 Region 取其 name，脱树返回 'none'
  get parentGrid(): CodeLayoutRegionName;  // @deprecated 兼容别名 → region
  get index(): number;              // 在 parent.children 中的下标
  get depth(): 0 | 1 | 2;

  removeSelf(): void;               // 从父级摘除（不收缩）
  removeSelfWithShrink(): void;     // 摘除 + 触发父级空收缩
  isDescendantOf(node): boolean;    // 拖放自环校验用
}
```

```ts
// Model/Panel.ts —— 叶子
export class CodeLayoutPanelInstance extends CodeLayoutNode {
  parent: CodeLayoutGroupInstance | null;
  open = true;                      // 手风琴折叠状态（Tab 模式下无意义，恒 true）
  weight = 1;                       // 同组内相对权重（替代原 size 像素值）
  minSize?: number | [number, number];
  resizeable = true;                // 用户配置，内部绝不写
  noHide = false;
  closeType: CodeLayoutPanelCloseType = 'none';

  get size(): number;               // 兼容读写 → weight（语义已变，见 §11.3）
  set size(v: number);
  getPixelSize(): number;           // 当前实际像素（决策 C2），见 §6.7
  openPanel(closeOthers?: boolean): void;
  closePanel(): void;
  togglePanel(): void;              // 无 console.log
  activeSelf(): void;               // 激活自己所在组 + 让区域激活该组
  isSelfActived(): boolean;
  onOpenChange?: (open: boolean) => void;
  onResize?: (weight: number) => void;
}
```

```ts
// Model/Group.ts —— 中层容器
export class CodeLayoutGroupInstance extends CodeLayoutNode {
  parent: CodeLayoutRegionInstance | null;
  children: CodeLayoutPanelInstance[] = [];
  activePanel: CodeLayoutPanelInstance | null = null;
  tabStyle: CodeLayoutPanelTabStyle = 'none';
  noAutoShink = false;
  weight = 1;                       // 区域内相对权重（区域为 Tab 时不参与布局）

  addPanel(panel: CodeLayoutPanel, index?: number): CodeLayoutPanelInstance;
  removePanel(panel, shrink?: boolean): CodeLayoutPanelInstance;
  setActivePanel(panel | null): void;
  reselectActivePanel(): void;      // 选第一个 visible
  get isTabContainer(): boolean;    // tabStyle in ('text','icon','text-bottom','icon-bottom','hidden')
  get visiblePanels(): CodeLayoutPanelInstance[];
}
```

```ts
// Model/Region.ts —— 顶层区域
export class CodeLayoutRegionInstance extends CodeLayoutNode {
  readonly name: CodeLayoutRegionName;   // 三者之一，只读
  parent: CodeLayoutRootGrid;
  children: CodeLayoutGroupInstance[] = [];
  activeGroup: CodeLayoutGroupInstance | null = null;

  addGroup(group: CodeLayoutGroup, index?: number): CodeLayoutGroupInstance;
  removeGroup(group): CodeLayoutGroupInstance;
  setActiveGroup(group | null): void;
  reselectActiveGroup(): void;
  get visibleGroups(): CodeLayoutGroupInstance[];

  // 区域显隐 = config 上的单一真相，这里只读转发，不再有 collapse() 的双向写
  get open(): boolean;              // 读 config.primarySideBar 等
  openPanel() / closePanel() / togglePanel(): void;   // 兼容旧名，改写 config
}
```

```ts
// Model/RootGrid.ts —— 根
export class CodeLayoutRootGrid {
  readonly primarySideBar: CodeLayoutRegionInstance;
  readonly secondarySideBar: CodeLayoutRegionInstance;
  readonly bottomPanel: CodeLayoutRegionInstance;

  private registry: NodeRegistry;   // 见 §5.3

  getRegion(name: CodeLayoutRegionName): CodeLayoutRegionInstance;
  getNodeByName(name: string): CodeLayoutNode | undefined;
  getPanelByName(name: string): CodeLayoutPanelInstance | undefined;
  clearLayout(): this;
  saveLayout(): CodeLayoutSavedData;
  loadLayout(json, instantiate: (data) => CodeLayoutPanel | CodeLayoutGroup): this;
  forEachNode(cb: (node: CodeLayoutNode) => void): void;
}
```

### 5.3 注册表（解决 D6 / D8）

```ts
// Model/NodeRegistry.ts
class NodeRegistry {
  private byId = new Map<string, CodeLayoutNode>();
  private byName = new Map<string, CodeLayoutNode>();
  register(node): void;    // name 冲突时抛错，信息里带上冲突双方的 id
  unregister(node): void;
  // 只由 attach/detach 两个内部方法调用，其他地方一律不许碰
}
```

* 唯一注册入口：`Model/tree.ts` 的 `attachChild(parent, child, index)` /
  `detachChild(parent, child)`。这两个函数是全库唯一允许修改 `parent`、`children`、注册表的地方。
  其余所有操作（addPanel / removeGroup / 拖放 apply）都必须经由它们。
* `id` 由 `Model/uid.ts` 的单调计数器生成（`cl_1`、`cl_2`…），无随机数，
  快照测试可复现（对照 D6：原实现 `Math.floor(Math.random()*10)`）。
* 组分割/克隆产生的新节点走 `deriveGroupName(base)`，同样用计数器，不用随机。

### 5.4 `parentGrid` 的处置（解决 D3）

原实现把 `parentGrid` 存成字段并在三处手工同步。新实现：

```ts
get region(): CodeLayoutRegionName {
  let n: CodeLayoutNode | null = this;
  while (n && !(n instanceof CodeLayoutRegionInstance)) n = n.parent;
  return n ? n.name : 'none';
}
get parentGrid() { return this.region; }   // @deprecated 只读兼容
```

* 移动节点时不需要做任何同步动作——树一改，派生值自动正确，D3 类 bug 从结构上消失。
* `inhertParentGrid` 保留为 setter no-op 并标 `@deprecated`，避免旧代码报错。

### 5.5 去掉 LateClass（解决 D5、R4、P4）

原实现的数据 → 视图通路是命令队列。新实现分两类处理：

1. **布局类通知全部删除。** 尺寸由 `computeLayout` 从「权重 + 容器尺寸」派生，
   容器尺寸来自 `useElementSize`（ResizeObserver 的响应式封装）。
   增删面板 → `children` 变化 → computed 重算 → 渲染，无需任何 `notifyRelayout`。
   `notifyRelayout` / `relayoutAllWithNewPanel` / `relayoutAllWithResizedSize` /
   `relayoutAllWithRemovePanel` / `relayoutAfterToggleVisible` 全部保留为**空实现 + `@deprecated`**，
   保证旧用户代码调用不报错（这些在文档里是公开 API）。
2. **确实需要「命令」语义的（如让某面板滚动进视野、聚焦）**改用 `Utils/EventEmitter.ts`，
   多监听者、无队列、卸载即摘除。

### 5.6 响应式策略

* 节点实例用 `reactive()` 包装后再挂树（与原实现一致，避免 `this` 逃逸问题）。
* 回调字段（`onResize` 等）、`EventEmitter` 实例用 `markRaw` 标记，防止被深度代理。
* `id` / `name` / `parent` 三者中，`parent` 参与响应式（布局依赖它），
  `id` 只读不响应。

---

## 6. 布局算法（解决 R1–R8）

### 6.1 尺寸语义分层

| 层级 | 字段 | 单位 | 说明 |
|---|---|---|---|
| 外壳区域 | `config.primarySideBarWidth` 等 | 外壳容器百分比 | 与现状一致，不改 config 字段语义 |
| 组（区域内多组共存时） | `group.weight` | 无量纲权重 | 区域为 Tab 容器时不参与布局 |
| 面板（手风琴模式） | `panel.weight` | 无量纲权重 | **语义变更**：原为像素 |
| 折叠面板 | 恒为 `config.panelHeaderHeight` | 像素 | 不参与权重分配 |
| 最小尺寸 | `minSize` | 像素 | 与现状一致 |

权重制的好处：容器尺寸变化时权重不变，比例天然保持，不需要 R1 那套增量补偿。

### 6.2 核心纯函数

```ts
// Layout/computeStack.ts
export interface StackItemInput {
  key: string;
  weight: number;
  minPx: number;
  collapsed: boolean;      // 折叠面板：固定占 headerPx
}
export interface StackItemOutput { key: string; px: number; }

export function computeStack(
  items: StackItemInput[],
  containerPx: number,
  headerPx: number,
): StackItemOutput[];
```

算法（保证 `Σpx === containerPx`）：

1. 折叠项直接分配 `headerPx`；剩余 `free = containerPx - Σheaderpx`。
2. 展开项按 `weight / Σweight` 分配 `free`。
3. **最小值收敛循环**：任何项 `px < minPx` 时把它钉死为 `minPx`、移出可变集合，
   用剩余空间对余下项重新按权重分配；重复直到无新增钉死项或可变集合为空。
   —— 有限次收敛（每轮至少钉死一项），无死循环。
4. **不可行降级**（解决 R6）：若 `Σ所有minPx + Σheaderpx > containerPx`，
   放弃最小值约束，改为纯比例分配并允许内容裁剪，同时保证总和仍等于容器。
   规则明确写进文档：容器过小时最小尺寸不保证。
5. **余数归一**：浮点分配后把误差（`containerPx - Σpx`）补给最后一个展开项，
   使恒等式精确成立。

### 6.3 拖拽调整尺寸 = 权重反解

拖动第 `i` 条分隔条时：

1. 取当前 `computeStack` 结果作为像素基线（`down` 时快照一次）。
2. 鼠标位移 `delta` 只在分隔条**相邻两侧**的可变项之间转移：
   `left.px += delta`、`right.px -= delta`，各自受 `minPx` 夹紧；
   一侧顶到 min 后，继续向更外侧的项索取（保持原实现的"依次索取"手感）。
3. 由新的像素分布反解权重：`weight_k = px_k / Σpx(展开项) * Σweight_原`。
4. 只写 `weight`，不写像素。渲染仍走 `computeStack`，所以拖拽过程中恒等式依然成立。

这样做的直接收益：R1（和不等于容器）、R2/R3（开关面板的空间分摊）在算法层一次性解决，
不再有"开/关面板"与"拖拽"两套互相打架的尺寸逻辑——两者都只是改权重。

### 6.4 开关面板（替代 R2/R3 的 `panelHandleOpenClose`）

不再手工搬运空间。`panel.open` 变化 → `collapsed` 输入变化 → `computeStack` 重算即可。
唯一需要保留的策略：**面板从折叠变展开时，如果它的 weight 是初始值，给它一个合理权重**
（取当前展开项权重的中位数，避免新展开的面板过小）。这条策略写在
`Layout/onPanelOpenChanged.ts` 里，也是纯函数。

### 6.5 分隔条可用性（替代 R5 的 `flushDraggable`）

原实现覆写用户的 `panel.resizeable`。新实现改为**派生 computed**，绝不写数据：

```ts
// Layout/useDraggerVisibility.ts
// 分隔条 i 可用 ⟺ panel[i].resizeable && 前面有展开项 && 自身或后面有展开项
const draggerEnabled = computed<boolean[]>(() => ...);
```

### 6.6 容器尺寸获取

```ts
// Composeable/useElementSize.ts （基于现有 ResizeChecker 重写为响应式返回值）
const { width, height } = useElementSize(containerRef);
```

* 返回 `Ref<number>`，`computeLayout` 直接依赖它，去掉 R7 的三级延迟初始化。
* 首帧宽高为 0 时 `computeStack` 返回全 0，渲染出空布局，
  ResizeObserver 首次回调后自动补正 —— 无需 `setTimeout(200)`。

### 6.7 `getPixelSize()`：像素只读回读（决策 C2）

权重制下数据里没有像素值，但用户仍需要拿到实际像素（例如内嵌 terminal / canvas 需按像素初始化）。
做法是让宿主组件把每帧算出的布局结果回写到一张**只读像素表**，节点从表里查：

```ts
// Layout/pixelRegistry.ts —— 视图 → 数据的只读回写通道
class PixelRegistry {
  private map = markRaw(new Map<string, number>());   // nodeId → px
  set(id: string, px: number): void;                  // 只由渲染组件调用
  get(id: string): number;                            // 未布局/不可见时返回 0
  clear(id: string): void;                            // 组件卸载时清理
}
```

* `PanelStack.vue` / `ShellSplitter.vue` 在 `computeStack` 的 computed 里顺带 `set()`。
* `panel.getPixelSize()` → `root.pixels.get(this.id)`。
* 节点未挂载、不可见、或首帧未测量时返回 `0`，语义与原 `getContainerSize()` 的
  「`lastRelayoutSize` 初值 0」一致。
* 与 R8 的区别：原实现把 `lastRelayoutSize` / `lastLayoutSizeCounter`
  **存进数据对象**并被拖放判定读取（视图状态污染数据模型）；这里像素表是
  `markRaw` 的旁路缓存，只服务于 `getPixelSize()` 这一个只读查询，
  布局与拖放算法一律不读它。
* `getContainerSize()` 保留，转为返回**父容器**像素（`parent` 的 `getPixelSize()`），
  与原语义（「网格宿主容器大小」）对齐。

---

## 7. 外壳：去掉 SplitLayout 依赖（解决 S1–S4）

### 7.1 外壳描述符（纯函数）

外壳结构只由三个 config 字段决定：`panelAlignment`、`panelPosition`、`primarySideBarPosition`。
把「六种对齐 × 上下位置 × 左右镜像」的组合收敛成一个纯函数：

```ts
// Layout/shellLayout.ts
export type ShellSlot = 'primarySideBar' | 'secondarySideBar' | 'bottomPanel' | 'centerArea';
export type ShellNode =
  | { kind: 'slot'; slot: ShellSlot }
  | { kind: 'split'; direction: 'row' | 'column'; children: ShellNode[] };

export function buildShellLayout(config: CodeLayoutConfig): ShellNode;
```

`buildShellLayout` 完整替代 `CodeLayoutBase.vue` 里的 `loadLayout()` + 6 个 `case` 分支
（`CodeLayoutBase.vue:220-277`），且不产生任何数据节点、不 `clearLayout()`。
六种对齐 × 2 位置 × 2 镜像 = 24 种组合，全部进单测快照。

### 7.2 `ShellSplitter.vue`

自实现的 N 分栏，替代 `SplitLayout`/`SplitN.vue`：

* props：`direction`、`items: { slot, sizePercent, minPx, visible, canMinClose }[]`。
* 渲染：flex 容器 + 每个子项 `flex: 0 0 <px>`（px 由 `computeStack` 的百分比版本算出）
  + 相邻子项间插入分隔条。
* 分隔条拖动：改写对应 config 字段（`primarySideBarWidth` 等），
  **单向数据流**：拖动 → 写 config → config 驱动渲染。彻底消除 S3 的 `nextNoChangeLayout` 哨兵。
* 拖到最小值以下继续拖 → 置 `config.<region> = false`（保留原 `canMinClose` 手感）。

### 7.3 显隐/尺寸不重建（解决 S2）

关键差别：

| 变化的 config | 原实现 | 新实现 |
|---|---|---|
| `primarySideBar`（显隐） | `loadLayout()` 整树重建 → 区域内容卸载 | `ShellNode` 不变，仅子项 `visible` 变 → `v-show` 切换，**内容不卸载** |
| `primarySideBarWidth`（尺寸） | `loadLayout()` 整树重建 | 仅像素变化 |
| `bottomPanelMaximize` | 重建 | centerArea `visible` 切换 |
| `panelAlignment` / `panelPosition` / `primarySideBarPosition` | 重建 | `ShellNode` 结构变化 → 允许重挂（与 VSCode 行为一致，可接受） |

即：**只有真正的结构性变化才重挂**，显隐与尺寸一律不重挂。
这直接消除文档「组件卸载提示」中「用户拖拽面板/切换侧栏导致组件被卸载」的坑。
区域内容用稳定 `:key`（区域 name，非索引）挂载，进一步降低复用错乱风险。

### 7.4 `bottomPanelMaximize`（解决 S4）

单一真相：`config.bottomPanelMaximize`。

* `true` → `buildShellLayout` 输出中 centerArea 的 `visible: false`，底栏占满。
* 拖动底栏分隔条使其小于「可用空间 - 阈值」→ 置 `bottomPanelMaximize = false`。
  该判定写在 `ShellSplitter` 的拖动回调里（**用户手势的直接后果**），
  不再写成 `watch(size)` 的副作用回环。
* `fullSize` 由外壳自己的百分比算，不再读另一套数据结构的 `rootGrid.primarySideBar.size`。

### 7.5 区域尺寸回存（解决 D7）

原 `saveGridLayoutDataToConfig()` 是死代码。新实现不需要"回存"这个动作——
区域尺寸的唯一存储位置就是 `config.primarySideBarWidth` 等字段本身，
拖动时直接写它。用户保存 config 即保存尺寸。`saveLayout()` 只负责区域内的组/面板树。

---

## 8. 拖放重写（解决 P1–P11）

### 8.1 三段式

```
[DOM 事件] → resolveDropTarget() → DropTarget
                                      ↓
[树 + DropTarget] → planDrop() → DropPlan        ← 纯函数，单测主战场
                                      ↓
[DropPlan] → applyPlan() → 修改树（经 attachChild/detachChild）
```

### 8.2 落点描述

```ts
// DragDrop/types.ts
export type DropZone =
  | { type: 'panel';        panel: CodeLayoutPanelInstance; side: 'before' | 'after' }
  | { type: 'group-tab';    group: CodeLayoutGroupInstance; index: number }
  | { type: 'group-body';   group: CodeLayoutGroupInstance }
  | { type: 'activity-item'; group: CodeLayoutGroupInstance }
  | { type: 'region-empty'; region: CodeLayoutRegionInstance }
  | { type: 'region-edge';  region: CodeLayoutRegionInstance; side: 'start' | 'end' };

export interface DragPayload {
  sourceFlag: typeof FLAG_CODE_LAYOUT;
  node: CodeLayoutPanelInstance | CodeLayoutGroupInstance;   // 单节点（决策 C5）
}
```

对比原实现：原来靠 `dropTo: 'normal'|'empty'|'tab-header'|'tab-content'|'activiy-bar'`
再叠加 `referencePosition` 和一堆 `instanceof`，共 8 个分支交叉判断（P1）。
现在落点本身就是完整的、互斥的判别联合，`planDrop` 用 `switch` 穷举，编译器保证不漏分支。

按决策 C5，`payload` 只携带单个节点，不做数组。这样消除了 P9 的
「数组类型 + 只取第 0 个」的不一致：类型上就只有一个节点，没有被忽略的元素。
若将来要加多选，改动集中在 `DragPayload`、`planDrop` 的 index 计算与 `applyPlan` 的批量
attach 三处，其余不受影响。

### 8.3 `planDrop`（纯函数）

```ts
export type DropPlan =
  | { op: 'reorder-panel';  panel; targetGroup; index: number }
  | { op: 'move-panel';     panel; fromGroup; targetGroup; index: number }
  | { op: 'reorder-group';  group; targetRegion; index: number }
  | { op: 'move-group';     group; fromRegion; targetRegion; index: number }
  | { op: 'wrap-in-new-group'; panel; targetRegion; index: number }   // 面板拖到区域空白
  | { op: 'none'; reason: string };                                   // 明确拒绝并说明原因

export function planDrop(payload: DragPayload, zone: DropZone, ctx: PlanContext): DropPlan;
```

拒绝条件集中在函数开头，一处判完（原实现散落各处）：

1. 目标是自身或自身后代（`isDescendantOf`）→ `none`。
2. `accept` 不含目标区域 → `none`。
3. `preDropCheck` 返回 false → `none`。
4. `config.onDropToPanel` / `onDropToGrid` 返回 `true` → `none`（**阻止**，见 §8.6）。
5. 结果与当前状态等价（同组同位置）→ `none`，避免无意义的摘除再插入。

`planDrop` 不碰任何树、不触发回调副作用（用户回调在 §8.5 的 session 层调用后作为入参传入），
所以可以直接对着构造出的树做表驱动单测。

### 8.4 `applyPlan`

```ts
export function applyPlan(plan: DropPlan, root: CodeLayoutRootGrid): void;
```

* 一律「先 detach 源节点，再 attach 到目标」，顺序固定，不存在原实现
  "移除会把还没插入面板的目标网格摘掉"那类时序陷阱（SplitLayout 侧曾修过同类问题）。
* 空组收缩（`autoShrinkEmptyGroup`）统一在 `applyPlan` 末尾执行一次，
  且**在插入完成之后**，绝不在摘除阶段进行。
* 新组尺寸：新节点 `weight` 取目标区域内展开项权重中位数（不再是 `size = 0` 等宿主分配，解决 P4）。
* 拖动组时组作为整体移动，绝不打散（解决 P5 的 `getFlatternChildOrSelf`）。
  面板拖到区域空白处才用 `wrap-in-new-group` 建新组，组名走 `deriveGroupName()` 计数器。

### 8.5 拖拽会话（解决 P7、P8）

```ts
// DragDrop/useDragSession.ts
// 由 CodeLayout.vue 用 provide 注入，每个 CodeLayout 实例一个 session 对象
export interface DragSession {
  payload: Ref<DragPayload | null>;
  begin(nodes, ev: DragEvent): void;
  end(): void;
  hoverZone: Ref<DropZone | null>;
}
```

* 会话状态挂在 provide/inject 作用域上，**不再是模块级全局**（P7）：
  同页面多实例互不干扰，跨实例拖拽自然被隔离。
* 边缘自动展开区域改为按**外壳容器**的 `getBoundingClientRect()` 判定，
  而非 `window.innerWidth/innerHeight`（P8）。
* `payload.node` 为单节点（决策 C5），全流程不出现「数组但只用第 0 个」的写法（P9）。

### 8.6 回调语义：保持现有代码行为（决策 C1）

原实现与文档矛盾：文档说「返回 false 阻止」，代码是「返回 true 阻止」。

**决策 C1：保持代码行为不变，改文档。**
`onDropToGrid` / `onDropToPanel` 返回 `true` 阻止拖放，返回 `false` / `undefined` 允许。

* 好处：已有用户代码零影响，不产生行为破坏。
* 代价：与同一份配置里的 `preDropCheck`（「返回 true 允许，false 拒绝」）语义相反，
  两者方向不一致。这一点需要在文档里**并排写明**，避免用户混淆：

  | 回调 | 返回 `true` | 返回 `false` / `undefined` |
  |---|---|---|
  | `preDropCheck` | 允许 | 拒绝 |
  | `onDropToGrid` | **阻止** | 允许 |
  | `onDropToPanel` | **阻止** | 允许 |

* 实现上把这两个回调的调用点统一收进 `planDrop` 的拒绝检查段（§8.3 第 4 条），
  并在源码注释里注明「此处 true 表示阻止，与 preDropCheck 相反，是历史语义，勿改」，
  防止后续维护者按直觉"修正"回去。
* 文档改动位置：`docs/api/CodeLayout.md` 的 `onDropToGrid` / `onDropToPanel` 两行，
  以及 `docs/guide/code-layout.md`「拖拽控制」一节的示例
  （该示例目前恒返回 `false`，含义是"永不阻止"，需补注释说明）。
  中英文两份都要改。

### 8.7 顺带清理

* `CodeLayoutActivityBar.vue` 的 `forceUpdate` hack（清空 children → `$forceUpdate` → 塞回，
  源码自注 `//fuck`）删除：新实现里活动栏直接渲染 `region.children`，
  `activeGroup` 是响应式字段，无需强制刷新（P10）。
* `togglePanel()` 的 `console.log` 删除（P11）。

---

## 9. 文件结构规划

### 9.1 移入 `library/old/`（只读参考）

仅 CodeLayout 独占的文件：

```
library/old/
  CodeLayout.ts                    CodeLayout.vue
  CodeLayoutRootGrid.ts            CodeLayoutBase.vue
  CodeLayoutConsts.ts              CodeLayoutGroupRender.vue
  CodeLayoutGroupDraggerHost.vue   CodeLayoutPanelRender.vue
  CodeLayoutActivityBar.vue        CodeLayoutActionItem.vue
  CodeLayoutTabItem.vue            CodeLayoutCollapseTitle.vue
  CodeLayoutEmpty.vue              CodeLayoutTagControl.vue
```

`library/old/` 不参与构建：不被 `library/index.ts` 引用，
并在 `library/tsconfig.json` 的 `exclude` 中排除（避免 `typecheck` 对废弃代码报错）。

### 9.2 不能移动的共享文件（SplitLayout 仍依赖）

实测依赖（`grep` 结果）：

| 文件 | 被谁依赖 | 处置 |
|---|---|---|
| `CodeLayoutRootEmpty.vue` | `SplitLayout/SplitLayout.vue:30` | 移到 `Components/`，更新两处 import |
| `CodeLayoutActionsRender.vue` | `SplitLayout/SplitTab.vue:88`、`Components/CodeLayoutCustomizeLayout.vue:51` | 移到 `Components/`，更新 import；**保持 `index.ts` 具名导出不变** |
| `Components/CodeLayoutVNodeStringRender.vue` | SplitTabItem、CustomizeLayout | 原地不动 |
| `Composeable/DragDrop.ts` | 两套布局共用 | 拆分，见下 |
| `Language/index.ts` → `import type { CodeLayoutLangConfig } from '../CodeLayout'` | — | 类型移到 `Types.ts`，改 import 路径 |
| `Components/CodeLayoutCustomizeLayout.vue` → `import type { CodeLayoutActionButton, CodeLayoutConfig }` | — | 同上，改指向新 `Types.ts` |

`Composeable/DragDrop.ts` 的处置：
* SplitLayout 用到的 `usePanelDragger` / `usePanelDragOverDetector` / `checkDropPanelDefault` /
  `getCurrentDragPanel` / `FLAG_*` / `usePanelDraggerRoot` 保持原样不动，SplitLayout 零改动。
* CodeLayout 新实现**不复用**这些函数，改用 `DragDrop/useDragSession.ts` 等新模块。
  两者通过 `sourceFlag` 与各自的 provide 作用域天然隔离。
* 代价：短期内存在两套拖拽基础设施。这是为「SplitLayout 零风险」付的价，
  待 SplitLayout 后续重构时再统一（记在 §13 遗留项）。

### 9.3 新文件

```
library/
  index.ts                       ← 更新导出
  Types.ts                       所有对外类型（Config/Panel/Group/ActionButton/Lang…）
  Consts.ts                      defaultCodeLayoutConfig、defaultAccept、区域名常量

  Model/
    uid.ts                       单调 id 计数器 + deriveGroupName
    Node.ts                      CodeLayoutNode 基类
    Panel.ts                     CodeLayoutPanelInstance
    Group.ts                     CodeLayoutGroupInstance
    Region.ts                    CodeLayoutRegionInstance
    RootGrid.ts                  CodeLayoutRootGrid（对外类名不变）
    NodeRegistry.ts              id/name 注册表
    tree.ts                      attachChild / detachChild（唯一结构修改入口）
    shrink.ts                    autoShrinkEmptyGroup
    serialize.ts                 saveLayout / loadLayout（不兼容旧数据，见 §11.3）

  Layout/
    computeStack.ts              手风琴/分栏通用尺寸分配（纯函数）
    shellLayout.ts               buildShellLayout（纯函数）
    resizeDrag.ts                拖拽 → 权重反解（纯函数）
    onPanelOpenChanged.ts        展开时的权重策略（纯函数）
    useDraggerVisibility.ts      分隔条可用性 computed

  DragDrop/
    types.ts                     DropZone / DragPayload / DropPlan
    resolveDropTarget.ts         DOM 落点 → DropZone
    planDrop.ts                  纯函数：计划生成
    applyPlan.ts                 计划 → 树变更
    useDragSession.ts            实例级会话（provide/inject）
    useDropZone.ts              组件侧 dragover/enter/leave/drop 封装

  Composeable/
    useElementSize.ts            ResizeObserver 响应式封装（新增）

  CodeLayout.vue                 对外组件
  CodeLayoutShell.vue            外壳骨架
  ShellSplitter.vue              四区域切分 + 分隔条
  ActivityBar.vue                活动栏（含第二活动栏）
  ActivityBarItem.vue
  RegionRender.vue               区域 = 组的 Tab 容器
  GroupRender.vue                组 = 手风琴 or Tab
  GroupTabBar.vue                组的 Tab 头
  GroupTabItem.vue
  PanelStack.vue                 手风琴：多面板 + 分隔条
  PanelRender.vue                单面板 + 折叠头
  PanelCollapseTitle.vue
  EmptyHint.vue                  空区域/空组提示（可接收拖放）
```

`Scss/`、`Icons/`、`Language/`、`Utils/`、`Components/`（除上述迁入项）、
`Composeable/`（MouseHandler、MiniTimeout、DragEnterLeaveFilter、KeyBoardController、
ResizeChecker、SimpleTooltipDelayLock、Vector2）全部原地复用。

---

## 10. 分阶段实施路线

每个阶段结束都要求 `npm run typecheck` 通过、`npm run test:run` 通过、
`npm run dev` 能起且既有 examples 不崩。

### 阶段 0：搬迁与隔离（不改逻辑）

1. 建 `library/old/`，移入 §9.1 列出的文件。
2. `CodeLayoutRootEmpty.vue`、`CodeLayoutActionsRender.vue` 移入 `Components/`，
   修正 SplitLayout / CustomizeLayout 的 import。
3. 抽 `Types.ts`：把 `CodeLayoutConfig`、`CodeLayoutPanel`、`CodeLayoutActionButton`、
   `CodeLayoutLangConfig`、`CodeLayoutPanelTabStyle` 等纯类型从旧 `CodeLayout.ts` 复制过来
   （复制，不是引用 —— 旧文件即将只读）。
4. `library/tsconfig.json` 增加 `"exclude": ["old/**"]`。
5. `index.ts` 暂时仍导出旧 CodeLayout，保证此阶段 examples 完全可用。

**验收**：typecheck 通过；`npm run dev` 行为与重构前完全一致（纯搬迁）。

### 阶段 1：数据模型 + 布局算法（纯逻辑，无 UI）

1. `Model/` 全部文件。
2. `Layout/computeStack.ts`、`shellLayout.ts`、`resizeDrag.ts`、`onPanelOpenChanged.ts`。
3. 单测（§12.1、§12.2）。

**验收**：单测全绿；模型层与算法层零 `.vue` 依赖（用 lint 规则或 review 保证）。

### 阶段 2：外壳

1. `useElementSize.ts`、`ShellSplitter.vue`、`CodeLayoutShell.vue`。
2. 标题栏、状态栏、活动栏挂载位、centerArea 插槽。
3. 区域内容先用占位块渲染，验证 24 种对齐组合 + 显隐 + 尺寸拖动。

**验收**：手动核对 24 种组合；切换显隐时用 Vue Devtools 确认区域内容组件**未被卸载**（S2 的验收点）。

### 阶段 3：区域 / 组 / 面板渲染

1. `RegionRender.vue`、`GroupRender.vue`、`GroupTabBar/Item.vue`。
2. `PanelStack.vue`（手风琴 + 分隔条）、`PanelRender.vue`、`PanelCollapseTitle.vue`、`EmptyHint.vue`。
3. 接入 `computeStack` / `useDraggerVisibility`；折叠展开、尺寸拖动打通。
4. Tab 溢出折叠复用 `OverflowCollapseList`；Tooltip / badge / actions 复用现有组件。

**验收**：`Σ子项 == 容器` 在窗口缩放 / 开关面板 / 拖动分隔条三种操作后均成立
（用 §12.3 的 DOM 断言测试覆盖）。

### 阶段 4：拖放

1. `DragDrop/` 全部文件。
2. 接入各落点组件：面板体、组 Tab 头、活动栏项、区域空白、区域边缘。
3. 边缘自动展开、非面板数据拖入（`onNonPanelDrag/Drop`）。

**验收**：§12.4 的 `planDrop` 表驱动单测全绿；§12.5 手动清单逐项通过。

### 阶段 5：外围功能

1. 右键菜单（`PanelMenu.ts` 适配新模型：`panel.visible = x` 后不再需要
   `relayoutAfterToggleVisible`，但保留调用以兼容）。
2. `CodeLayoutCustomizeLayout` 适配（只依赖 config，改动应极小）。
3. i18n、键盘控制器接入。
4. `saveLayout` / `loadLayout`（§11.3；不做旧数据迁移，但需保证遇到旧格式时
   **优雅失败**：识别出无 `version` 字段即视为不可用数据，走「无数据 → 新建布局」分支，
   不抛异常、不产生半损坏布局）。

### 阶段 6：切换与清理

1. `index.ts` 改为导出新 CodeLayout。
2. examples 全部跑通（BasicUseage / DataSaveAndLoad / SlotsTest / EmptyTest）。
3. 更新 `docs/api/CodeLayout.md`、`docs/guide/code-layout.md`（中英各一份）：
   * `size` → 权重语义变更 + 新增 `getPixelSize()`（决策 C2）；
   * `onDropToGrid`/`onDropToPanel` 的 `true = 阻止` 语义写清，并与 `preDropCheck`
     并排对照（决策 C1，§8.6）；
   * 保存数据不向下兼容的提示（决策 C3）；
   * 删除「组件卸载提示」中已不复存在的侧栏切换卸载问题（保留 HMR 部分）；
   * 标注 `@deprecated` API 列表。
4. 更新 `CLAUDE.md`：目录结构、测试命令（`npm run test:run` 已可用）。
5. `library/old/` 保留（决策 C4），不删除、不参与构建，后续按需手动清理。

---

## 11. API 兼容策略

### 11.1 保持不变

* 组件名与用法：`<CodeLayout :layoutConfig :layoutData :langConfig :mainMenuConfig :emptyText>`。
* 全部插槽名与参数（`panelRender` 的 `{ panel, open }`、`tabHeaderLeftStart` 的 `{ group }` 等）。
* `CodeLayoutConfig` 全部字段与默认值；`defaultCodeLayoutConfig`。
* `CodeLayoutInstance` 全部方法：`addGroup`、`removeGroup`、`getRootGrid`、`getPanelByName`、
  `relayoutAll`、`relayoutGroup`、`clearLayout`、`loadLayout`、`saveLayout`、`createRootGrid`。
* `new CodeLayoutRootGrid()` 及其 `primarySideBar` / `secondarySideBar` / `bottomPanel` 属性。
* 面板实例常用方法：`addPanel`、`removePanel`、`openPanel`、`closePanel`、`togglePanel`、
  `removeSelf`、`removeSelfWithShrink`、`setActiveChild`、`reselectActiveChild`、
  `activeSelf`、`isSelfActived`、`getContainerSize`。
* `menuConfigs`（内置菜单名不变）、i18n、`CodeLayoutCustomizeLayout` 的 props。

### 11.2 类型别名

```ts
// Types.ts
/** @deprecated 请按语义改用 CodeLayoutPanelInstance / CodeLayoutGroupInstance */
export type CodeLayoutPanelInternal =
  CodeLayoutPanelInstance | CodeLayoutGroupInstance | CodeLayoutRegionInstance;
/** @deprecated */
export type CodeLayoutGridInternal = CodeLayoutRegionInstance;
export type CodeLayoutGrid = CodeLayoutRegionName | 'centerArea' | 'rootGrid' | 'none' | …;
```

为让 `CodeLayoutPanelInternal` 这个联合类型在旧用户代码里仍可直接
`.addPanel(...)` / `.children` / `.activePanel`，在基类 `CodeLayoutNode` 上提供这些成员的
**兼容转发**：容器类型正常工作，叶子类型抛出带明确信息的错误
（`Panel 'x' is a leaf node and has no children`）。

这是一处有意的取舍：类型上不如「叶子就没有 children」纯粹，
但能让现存用户代码（以及 `docs` 中大量以 `CodeLayoutPanelInternal` 为参数类型的回调）
不必改写。纯粹性通过新类型 `CodeLayoutPanelInstance` 等提供给新代码。

### 11.3 破坏性变更清单

| 变更 | 影响 | 缓解 |
|---|---|---|
| `panel.size` 由像素改为权重（决策 C2） | 直接读 `size` 做像素计算的代码结果不同 | **新增 `getPixelSize()`** 取当前实际像素（§6.7）；`size` 保留为 `weight` 的 getter/setter 别名；`getContainerSize()` 仍返回父容器像素；文档标注 |
| 保存数据格式变更（决策 C3） | 旧版 JSON 不可加载 | `saveLayout()` 输出 `{ version: 2, ... }`；`loadLayout()` 检测无 `version` 字段时**不加载，转为「无数据」分支**（调用方会走新建布局路径），保证失败不是半损坏状态，而是「用户可以重新初始化」 |
| `inhertParentGrid` 失效 | 手工设置该字段的代码不再生效 | setter no-op + `@deprecated`；新实现下该字段本无必要 |
| `relayoutXxx` / `notifyRelayout` 变空实现 | 显式调用它们的代码不再有效果 | 保留为空函数不报错；布局已自动化，实际无需调用 |
| `panel.resizeable` 不再被内部覆写（修正 R5） | 依赖被覆写后的值来判断分隔条的代码 | 分隔条状态改由 `useDraggerVisibility` 派生，本就不该读 `resizeable` |

### 11.4 迁移文档

新增 `docs/guide/migration-2.md`（中英双份），内容：
上述破坏性变更表 + 每项的前后代码对照 + `library/old/` 的定位说明。
旧数据兼容方案：由于决策 C3 不做迁移，文档只需说明「2.x 数据格式不兼容 1.x，
升级后请通过页面重新布局一次，之后 `saveLayout()` 即保存为新格式」。

---

## 12. 测试计划

仓库已具备 vitest + jsdom + `@vue/test-utils`（`vitest.config.ts` 匹配
`library/**/*.{test,spec}.{ts,tsx}`），可直接写测试。

### 12.1 数据模型（`Model/*.test.ts`）

* `attachChild` / `detachChild`：parent 指向、children 顺序、注册表增删同步。
* 层级约束：往 Panel 上 `addPanel` 抛错；往 Region 上直接 `addPanel` 抛错。
* `name` 重复注册抛错，错误信息含冲突双方。
* `region` 派生值：移动节点后自动正确；脱树返回 `'none'`（针对 D3）。
* `id` 单调、无重复（针对 D6）：连续创建 1000 个组，断言 id 全不同。
* `activePanel` / `activeGroup`：删除激活项后自动重选第一个 visible。
* `autoShrinkEmptyGroup`：空组被移除；`noAutoShink` 的组保留并触发回调。
* `saveLayout` → `loadLayout` 往返一致（结构 + 权重 + visible + open）。
* 遇到无 `version` 字段的数据视为旧格式，`loadLayout` 忽略它、返回 `false`，
  调用方走新建布局路径（决策 C3）。

### 12.2 布局算法（`Layout/*.test.ts`）

`computeStack`：

* 恒等式：随机 200 组输入（项数 1–10、随机权重、随机 minPx、随机容器），
  断言 `Σpx === containerPx`（允许 ≤0.5px 的浮点容差后归一）。—— 针对 R1
* 全部折叠：每项 `headerPx`，总和等于容器。
* 单项：占满容器。
* 最小值收敛：一项 minPx 很大时它取 minPx，其余按权重分剩余。
* 不可行降级：`ΣminPx > containerPx` 时不抛错、不溢出、总和仍等于容器。—— 针对 R6
* 容器为 0：全 0，不抛错、不产生 NaN。
* 权重为 0 / 负数 / NaN：归一化为安全值，不产生 NaN 输出。

`resizeDrag`：

* 拖动后总和不变；相邻项一增一减。
* 顶到 minPx 后继续拖，向更外侧项索取。
* 反解权重再 `computeStack` 得到的像素与拖动目标一致（往返稳定性）。—— 针对 §6.3

`shellLayout`：24 种（对齐 × 位置 × 镜像）组合的 `ShellNode` 快照；
`bottomPanelMaximize` 下 centerArea 不可见。

`onPanelOpenChanged`：展开首个面板时权重合理（不为 0、不超过容器）。—— 针对 R2/R3

### 12.3 组件级布局（`*.spec.ts`，jsdom + test-utils）

jsdom 无真实布局，需 mock 容器尺寸（stub `offsetWidth`/`offsetHeight` 与 ResizeObserver）。

* `PanelStack`：3 个面板挂载后各 DOM 节点 `style.height` 之和等于容器高。
* 开关某面板后重新断言总和（针对 R2/R3）。
* 容器尺寸变化（触发 mock 的 ResizeObserver 回调）后重新断言总和（针对 R1）。
* `panel.resizeable = false` 的面板，其分隔条不渲染，且**断言 `panel.resizeable` 仍为 `false`**
  （针对 R5 —— 内部不得回写）。
* `ShellSplitter`：切换区域 `visible` 前后，区域内子组件实例 **未被重建**
  （在子组件里埋 `onUnmounted` 计数断言）。—— 针对 S2

### 12.4 拖放（`DragDrop/planDrop.test.ts`）

表驱动，每行一个 `(初始树, payload, zone) → 期望 DropPlan`：

* 面板 → 同组另一面板前/后：`reorder-panel`，index 正确。
* 面板 → 异组面板：`move-panel`。
* 面板 → 组 Tab 头指定位置：`move-panel` 且 index 为落点位置（不是恒定末尾）。
* 面板 → 活动栏项：`move-panel` 到该组末尾。
* 面板 → 区域空白：`wrap-in-new-group`（单面板）。
* 组 → 同区域另一位置：`reorder-group`。
* 组 → 异区域：`move-group`，**且组不被打散**（针对 P5）。
* 拖到自身 / 自身后代：`none`。—— 针对 P1 的自环
* `accept` 不含目标区域：`none`。
* `preDropCheck` 返回 false：`none`。
* `onDropToPanel` 返回 `true`：`none`（阻止）；返回 `false`/`undefined`：正常计划。
  —— 决策 C1（§8.6）
* 结果与现状等价：`none`（不做无意义搬移）。
* 多节点 payload：全部节点按原相对顺序落到目标。—— 针对 P9

`applyPlan.test.ts`：

* 每种 plan 应用后树结构、注册表、`activePanel`/`activeGroup` 均正确。
* 源组被搬空后按 `noAutoShink` 决定是否收缩，且收缩发生在插入之后（针对 §8.4）。
* 应用后新节点 weight 合理（非 0）。—— 针对 P4

### 12.5 手动验收清单（`npm run dev`）

外壳：

* [ ] 6 种 `panelAlignment` × `panelPosition: top/bottom` × `primarySideBarPosition: left/right`
* [ ] 三区域显隐切换（活动栏点击、自定义布局弹窗、右键菜单）
* [ ] 切换显隐后区域内组件状态保留（例如 terminal 面板里的滚动位置）
* [ ] 拖动区域分隔条；拖到最小值以下自动隐藏区域
* [ ] `bottomPanelMaximize` 开关 + 拖动底栏解除最大化
* [ ] 标题栏 / 状态栏 / 菜单栏开关；活动栏 4 种位置；第二活动栏 4 种位置

区域内：

* [ ] 手风琴：折叠/展开、拖动分隔条、无空隙无溢出
* [ ] Tab 组：切换、溢出折叠菜单、`hidden` 样式
* [ ] 组大标题栏（`activityBarSubGroupShowTitle`）
* [ ] 空区域提示与 `emptyText` / `emptyGroup` 插槽
* [ ] badge / tooltip / actions / 图标（large/small）

拖放：

* [ ] 面板在组内重排、跨组、跨区域
* [ ] 拖到 Tab 头指定位置、拖到活动栏项、拖到区域空白
* [ ] 拖组（整组移动，不打散）
* [ ] `draggable: false` 与 `accept` 限制生效
* [ ] 拖到窗口边缘自动展开对应区域（且组件非全屏时判定正确）
* [ ] 非面板数据（文件）拖入触发 `onNonPanelDrag/Drop`
* [ ] 与 SplitLayout 之间互不串扰（拖 CodeLayout 面板到 SplitLayout 无效，反之亦然）

数据：

* [ ] `saveLayout` / `loadLayout` 往返（DataSaveAndLoad 示例）
* [ ] 旧版本 localStorage 数据能加载（手工塞一份 v1 JSON 验证）
* [ ] `clearLayout` + 重置布局
* [ ] 同页面两个 CodeLayout 实例互不干扰（新增一个 examples 页面验证 P7）

---

## 13. 风险与取舍

### 13.1 主要风险

| 风险 | 影响 | 应对 |
|---|---|---|
| 工作量大（约 25 个新文件，几乎重写全部 CodeLayout 组件） | 周期长，中途不可用 | 严格按 §10 分阶段；阶段 0–5 期间 `index.ts` 仍导出旧组件，主干始终可用，最后一步才切换 |
| 权重制改变 `size` 语义 | 用户代码与已保存数据受影响 | getter/setter 别名 + v1 数据自动迁移 + 迁移文档（§11.3） |
| 拖放手感回归 | 用户感知的细节（吸附阈值、四向判定区域大小、延迟聚焦 600ms）可能变味 | 这些常量从旧实现原样搬（`cornerSize=40`、四向 1/4 判定、`focusTimer 600ms`、`delayLeaveTimer 200ms`），并集中到 `Consts.ts` 便于调 |
| jsdom 无真实布局 | 组件级尺寸测试需要 mock，可能测不出真实问题 | 尺寸正确性主要靠 §12.2 的纯函数测试保证；组件级只测「算法输出是否正确写进 style」；真实渲染靠 §12.5 手动验收 |
| 两套拖拽基础设施并存 | 代码重复，维护成本 | 明确记为遗留项（§13.3），SplitLayout 重构时统一 |
| `CodeLayoutPanelInternal` 兼容联合类型 | 叶子节点上仍能看到 `addPanel` 等成员 | 运行时抛明确错误；新代码用新类型；文档引导 |

### 13.2 明确的取舍

1. **兼容优先于纯粹。** `CodeLayoutPanelInternal`、`size`、`relayoutXxx`、`parentGrid`
   全部保留为兼容层。理由：这些都在已发布文档里，1.x 内不宜硬破坏。
   代价是新代码里存在一层 `@deprecated` 噪音。
2. **不重写 SplitLayout。** 上个提交刚解耦其数据结构，本次只断开引用方向。
   代价是拖拽基础设施短期重复。
3. **结构性 config 变化允许重挂。** `panelAlignment` 等改变会重建外壳 DOM 结构。
   理由：这类操作是低频的用户显式动作，且 VSCode 同样有可见的重排；
   换取的是显隐/尺寸这类高频操作完全不重挂。
4. **容器过小时放弃 minSize。** 与其溢出或抛错，不如按比例压缩并在文档中明确这一行为。
5. **多选拖拽只做底层。** 数据与算法层完整支持数组，UI 入口本次不做。

### 13.3 遗留项（本次不做，记录在案）

* 统一 CodeLayout 与 SplitLayout 的拖拽基础设施。
* 统一两套镜像类型定义（`CodeLayoutGrid` ↔ `CodeLayoutSplitNGridName` 等，
  `SplitN.ts:6-14` 的注释已说明这是刻意镜像、需人工同步）。
* 多选拖拽的 UI 入口。
* 删除 `library/old/`（下一个次版本）。
* SplitLayout 自身的重构（其 `SplitN.vue` 的 `onDraggerMove` 同样复杂，
  但本次不在范围内）。

---

## 14. 待确认

以下几点会影响实现细节，开工前希望你确认：

1. **`onDropToGrid`/`onDropToPanel` 语义修正**（§8.6）——按文档改成「返回 false 阻止」，
   还是保持现有代码行为（返回 true 阻止）并改文档？我倾向前者，
   因为 `preDropCheck` 与 examples 都是前者的语义，但这是行为破坏。
2. **`size` 语义**（§11.3）——是否接受改为权重？若必须保持像素语义对外可读写，
   我可以让 `size` 的 getter 返回「当前实际像素」（只读意义上正确），
   但 setter 就无法精确对应，需要折中。
3. **旧数据兼容力度** ——v1 JSON 是否需要保证「视觉上尽量接近」（按像素比例还原权重），
   还是允许退化为等权重？前者实现稍复杂但体验更好。
4. **`library/old/` 的最终去留** ——本次发版保留，还是重构完成即删除？
5. **多选拖拽** ——底层已支持，是否本次一并做 UI（Ctrl 多选 Tab）？

确认后我按 §10 的阶段顺序开始，每个阶段结束会跑 typecheck + 单测并向你汇报。

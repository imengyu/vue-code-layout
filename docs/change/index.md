---
title: 变更日志
nav:
  title: 变更日志
  order: 5
---

## v1.3.0 - 2026/01/10 <Badge type="tip" text="破坏性变更" />

* [新增] CodeLayout, SplitLayout: 布局数据现在通过属性传入并由用户控制，避免组件重新创建后数据丢失。移除了旧事件 `loadLayout` 和 `saveLayout`。
有关新的数据加载和保存方式，请查看 [示例](../en/guide/code-layout.md#save-and-load-data)。
  * 属性:
    * layoutData: 布局数据，现在由用户控制。
* [移除] CodeLayout 和 SplitLayout
  * 属性:
    * saveBeforeUnload
  * 事件:
    * canLoadLayout
    * canSaveLayout
* [移除] SplitLayout 属性: 这些属性已移除，请使用 `layoutData.parentGrid` 和 `layoutData.direction` 替代。
  * rootGridType
  * rootGridDirection

## v1.2.4 - 2026/01/07

* [修复] 修复实例的 openPanel closePanel togglePanel 方法不工作的问题 [#40](https://github.com/imengyu/vue-code-layout/issues/40)
* [修复] 修复底部面板最大化并隐藏后中心区域显示不正确的问题
* [修复] (SplitLayout): 在拖拽面板操作中，添加了目标网格和父网格相同时的处理 ([#37](https://github.com/imengyu/vue-code-layout/issues/37))
* [修复] (SplitLayout): 解决了容器大小变化时非可拉伸面板无法调整的布局问题 ([#36](https://github.com/imengyu/vue-code-layout/issues/36))
* [新增] (CodeLayout): 为自定义布局组件添加了可配置选项 ([#34](https://github.com/imengyu/vue-code-layout/issues/34)) (由 [Yannnser](https://github.com/Yannnser) 贡献)

## v1.2.2 - 2025/09/07

* [修复] 更新 vue3-context-menu 至 1.5.2 ([#31](https://github.com/imengyu/vue-code-layout/issues/31))
* [新增] 为 CodeLayoutSplitNGrid 添加 stretchable 属性，用于设置容器调整大小时网格是否可以拉伸。
* [变更] 使 codelayout 侧边面板在容器调整大小时保持大小。 ([#32](https://github.com/imengyu/vue-code-layout/issues/32))

## v1.2.1 - 2025/05/06

* [新增] 添加面板调整大小、可见性、打开状态变化的回调 (#11)。
* [新增] 为 CodeLayout 面板添加底部位置选择。
* [新增] 添加底部面板位置：左、右、上。
* [新增] 为 CodeLayout 添加自定义面板菜单配置 (#21, 4, 5)。
* [新增] 使活动栏在溢出时可以折叠 (#19)。
* [新增] 当拖放到标签页头部时，将面板添加到最后 (#13)。
* [新增] 为头部添加自定义工具提示 (#18)。
* [新增] 当简单工具提示溢出屏幕时自动调整位置的功能 (#12)。

* [修复] 修复拖拽后面板实例引用错误 (#22)。
* [修复] 修复 secondarySideBar 菜单问题。
* [修复] 修复拖拽面板错误 (#14)。
* [修复] 修复标签页项目不隐藏的问题。
* [修复] 修复 activityBarPosition 控制逻辑 (#21)
* [修复] 修复标签页头部上下文菜单问题 (#21, 6)。
* [修复] 修复 menu showBadge 不生效的问题 (#21)。
* [修复] 修复分割布局拖拽问题 (#15, #20)。
* [修复] 修复点击面板顶部时光标错误状态 (#17)。
* [修复] 修复嵌套拖拽悬停问题。
* [修复] 修复 SimpleTooltip 卡住的问题。
* [修复] 当主侧边栏隐藏时，不隐藏其菜单。
* [修复] 修复拖拽光箱问题 (#23)。
* [修复] 修复拖拽事件错误阻止默认行为 (#23)。
* [修复] 移除用于调试的 console.log。

* [变更] 改进 SplitN 拖拽功能。
* [变更] 更新 vue3-context-menu 到最新版本
* [变更] 将 CodeLayoutScrollbar 移动到独立包 ([@imengyu/vue-scroll-rect](https://github.com/imengyu/vue-scroll-rect))。
* [变更] 将 bottomAlignment 更改为 panelAlignment
* [变更] 更改 codeLayout 的根数据。统一两个组件的根数据。

* [文档] 更新文档 (#16)。
* [文档] 更新 CodeLayout 菜单的文档。

## v1.1.2 - 2024/12/20

* [新增] 增加回调事件允许处理拖拽进入组件的非面板数据。

## v1.1.1 - 2024/12/07

* [变更] 为导出包增加了 es 模块定义。
* [变更] 更新 vue3-context-menu 至最新。

## v1.1.0 - 2024/10/17

* [新增] 为 SplitLayout 添加了自定义渲染标签页功能。
* [文档] 文档细节修改。

## v1.0.9 - 2024/10/10

* [新增] 为 SplitLayout 每个面板添加了 `splitCopy` 用于实现分割编辑器的功能。
* [修复] 修复 SplitLayout 标签页过多时无法滚动问题（#7）。

## v1.0.8 - 2024/10/08

* [新增] 为每个面板添加 `draggable` 属性用于控制此面板是否可以拖动。
* [新增] 为 SplitLayout 添加 `gridActive` 事件用于接收激活网格更改事件。
* [修复] 修复 CodeLayout 拖拽子边栏收缩后自定义布局按钮状态没有修改问题。
* [修复] 修复 SplitLayout 激活的面板事件触发不正确问题。
* [文档] 文档细节修改。

## v1.0.7 - 2024/09/13

* [新增] 第二侧边栏支持大侧栏模式和Tab模式切换 `secondarySideBarAsActivityBar`。
* [修复] 修复拖拽子面板到边栏的当前条目上会导致其隐藏的细节问题。
* [修复] 修复拖拽子面板后，父面板因为切换而卸载后，再切换回来，无法再拖拽的问题。
* [修复] 修复拖拽子面板到顶级侧边栏消失的问题。

## v1.0.6 - 2024/07/12

* [新增] 添加 `titleBarBottom` 和 `titleBarTop` 插槽。
* [新增] CodeLayoutScrollbar 可以获取容器引用并滚动。
* [修复] 修复 `activeSelf` 无法激活隐藏面板问题。
* [修复] 修复 activeSelf 无法激活顶级操作栏的问题。

## v1.0.5

* [修复] 修改拼写错误。

## v1.0.4

* [新增] activeSelf 现在可以递归激活。
* [新增] 导出 CodeLayoutCollapseTitle 组件。
* [修复] 修复了点击面板操作按钮会折叠面板的问题。

## v1.0.3 - 2024/04/07

* [修复] 修复了最大化和恢复面板后高度丢失的问题。
* [修复] 修复了面板最大化按钮状态问题。

## v1.0.2 - 2024/04/05

* [新增] 增加了对中文的支持。
* [修复] 修复了最大化面板后，主区域溢出显示问题。

## v1.0.0 - 2024/03/30

* 正式发布 v1.0.0

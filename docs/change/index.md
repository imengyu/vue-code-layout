---
title: Change log
nav:
  title: Change log
  order: 5
---

## v1.2.0 - 2025/05/06

* [Add] Add panel resize,visible,open change callback (#11).
* [Add] Add CodeLayout panel bottom position choice.
* [Add] Add bottom panel position left,right,top.
* [Add] Add CodeLayout custom panel menu config (#21, 4, 5).
* [Add] Make activitybar can collapse when overflow (#19).
* [Add] Add panel to last when drop on tab header (#13).
* [Add] Add custom tooltip for header (#18).
* [Add] Add that auto adjust position function when Simple tooltip overflow screen (#12).

* [Fix] Fix instance reference error after drag (#22).
* [Fix] Fix secondarySideBar menu issue.
* [Fix] Fix drag panel error (#14).
* [Fix] Fix tab item not hidden issue.
* [Fix] Fix activityBarPosition control logic (#21)
* [Fix] Fix Tab header context menu issue (#21, 6).
* [Fix] Fix issue that menu showBadge does not take effect (#21).
* [Fix] Fix split layout drag issue (#15, #20).
* [Fix] Fix cursor error state when click panel top (#17).
* [Fix] Fix nest drag hover issue.

* [Change] SplitN drag function improvement.
* [Change] Update vue3-context-menu to latest
* [Change] Move CodeLayoutScrollbar to standalone package ([@imengyu/vue-scroll-rect](https://github.com/imengyu/vue-scroll-rect)).
* [Change] Change bottomAlignment to panelAlignment
* [Change] Change root data of codeLayout. Unify root data of the two components.

* [Docs] Update document (#16).
* [Docs] Update docs of CodeLayout menu.

## v1.1.2 - 2024/12/20

* [Add] 增加回调事件允许处理拖拽进入组件的非面板数据。

---

* [Add] Adding callback events allows handling non panel data dragged into components.

## v1.1.1 - 2024/12/07

* [Change] 为导出包增加了 es 模块定义。。
* [Change] 更新 vue3-context-menu 至最新。

---

* [Change] Add es module and update vue3-context-menu.

## v1.1.0 - 2024/10/17

* [Add] 为 SplitLayout 添加了自定义渲染标签页功能。
* [Docs] 文档细节修改。

---

* [Add] Added custom rendering tab slot for SplitLayout.
* [Docs] Update document.

## v1.0.9 - 2024/10/10

* [Add] 为 SplitLayout 每个面板添加了 `splitCopy` 用于实现分割编辑器的功能。
* [Fix] 修复 SplitLayout 标签页过多时无法滚动问题（#7）。

---

* [Add] Added `splitCopy` to each panel of SplitlLayout to implement the functionality of a split editor.
* [Fix] Fixed the issue of not being able to scroll when there are too many SplitLayout tabs (#7).

## v1.0.8 - 2024/10/08

* [Add] 为每个面板添加 `draggable` 属性用于控制此面板是否可以拖动。
* [Add] 为 SplitLayout 添加 `gridActive` 事件用于收到激活网格更改事件。
* [Fix] 修复 CodeLayout 拖拽子边栏收缩后自定义布局按钮状态没有修改问题。
* [Fix] 修复 SplitLayout 激活的面板事件触发不正确问题。
* [Docs] 文档细节修改。

---

* [Add] Add the `draggable` attribute to each panel to control whether it can be dragged.
* [Add] Add a `gridActive` event to SplitLayout to receive activation grid change events.
* [Fix] Fixed the issue where the Customize layout button status was not change after the CodeLayout drag sidebar was shrunk.
* [Fix] Fix the issue of incorrect triggering of `panelActive` event by SplitlLayout.
* [Docs] Update Document.

## v1.0.7 - 2024/09/13

* [Add] 第二侧边栏支持大侧栏模式和Tab模式切换 `secondarySideBarAsActivityBar` 。
* [Fix] 修复拖拽子面板到边栏的当前条目上会导致其隐藏的细节问题。
* [Fix] 修复拖拽子面板后，父面板因为切换而卸载后，再切换回来，无法再拖拽的问题。
* [Fix] 修复拖拽子面板到顶级侧边栏消失的问题。

---

* [Add] The second sidebar supports ActionBar mode and Tab mode switching, `secondarySideBarAsActivityBar`.
* [Fix] Fixed a issue where dragging subpanels to the current entry in the ActionBar would cause it to be hidden.
* [Fix] Fixed an issue where the parent panel could not be dragged again after being unmounted due to switching.
* [Fix] Fixed where drag subpanels to the top sidebar disappeared.

## v1.0.6 - 2024/07/12

* [Add] Add `titleBarBottom` and `titleBarTop` slot.
* [Add] CodeLayoutScrollbar can get container ref and scroll.
* [Fix] Fix a problem that `activeSelf` unable to activate the closed hidden panel.
* [Fix] Fix problem activeSelf can not active top actionbar.

## v1.0.5

* [Fix] Fix type warning.

## v1.0.4

* [Add] activeSelf can be activated recursively.
* [Add] Export CodeLayoutCollapseTitle component.
* [Fix] Fix problem that click panel action button will collapse panel.

## v1.0.3 - 2024/04/07

* [Fix] Fix the height lost issue after maximizing and restoring the panel.
* [Fix] Fix panel maximizing button state issue.

## v1.0.2 - 2024/04/05

* [Added] Add zh language string.
* [Fix] Fix the overflow display issue of the main after maximizing the panel.

## v1.0.0 - 2024/03/30

* Officially release

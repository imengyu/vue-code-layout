---
title: Change log
nav:
  title: Change log
  order: 5
---

## v1.3.0 - 2026/01/10 <Badge type="tip" text="Break Change" />

* [Add] CodeLayout, SplitLayout: The layout data is now passed in through prop and controlled by the user to avoid data loss after the component is recreated. Old event `loadLayout` and `saveLayout` are removed.
For new data load and save way, please check [example](../en/guide/code-layout.md#save-and-load-data).
  * Prop:
    * layoutData: Layout data, data now controlled by user.
* [Remove] CodeLayout and SplitLayout
  * Prop:
    * saveBeforeUnload
  * Events:
    * canLoadLayout
    * canSaveLayout
* [Remove] SplitLayout prop: These props are removed, use `layoutData.parentGrid` and `layoutData.direction` instead.
  * rootGridType
  * rootGridDirection

## v1.2.4 - 2026/01/07

* [Fix] Fix instance openPanel closePanel togglePanel not work issue [#40](https://github.com/imengyu/vue-code-layout/issues/40)
* [Fix] Fix centerarea not shown correctly when bottomPanel maximized and hidden
* [Fix] (SplitLayout): Add handling for the target grid and parent grid being the same in drag and drop panel operations ([#37](https://github.com/imengyu/vue-code-layout/issues/37))
* [Fix] (SplitLayout): Resolves the layout issue where non-stretchable panels cannot adjust when the container size changes ([#36](https://github.com/imengyu/vue-code-layout/issues/36))
* [Add] (CodeLayout): Add configurable options for custom layout components ([#34](https://github.com/imengyu/vue-code-layout/issues/34)) (by [Yannnser](https://github.com/Yannnser))

## v1.2.2 - 2025/09/07

* [Fix] Update vue3-context-menu to 1.5.2 ([#31](https://github.com/imengyu/vue-code-layout/issues/31))
* [Add] Add stretchable to CodeLayoutSplitNGrid to set grid can be stretched when the container is resized.
* [Change] Make codelayout side panel keep size when container resize. ([#32](https://github.com/imengyu/vue-code-layout/issues/32))

## v1.2.1 - 2025/05/06

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
* [Fix] Fix SimpleTooltip stuck issue.
* [Fix] No hide primary side bar menu when it was hidden.
* [Fix] Fix drag light box issue (#23).
* [Fix] Fix drag event wrong preventing default (#23).
* [Fix] Remove console.log for debugging.

* [Change] SplitN drag function improvement.
* [Change] Update vue3-context-menu to latest
* [Change] Move CodeLayoutScrollbar to standalone package ([@imengyu/vue-scroll-rect](https://github.com/imengyu/vue-scroll-rect)).
* [Change] Change bottomAlignment to panelAlignment
* [Change] Change root data of codeLayout. Unify root data of the two components.

* [Docs] Update document (#16).
* [Docs] Update docs of CodeLayout menu.

## v1.1.2 - 2024/12/20

* [Add] Adding callback events allows handling non panel data dragged into components.

## v1.1.1 - 2024/12/07

* [Change] 为导出包增加了 es 模块定义。。
* [Change] 更新 vue3-context-menu 至最新。

---

* [Change] Add es module and update vue3-context-menu.

## v1.1.0 - 2024/10/17

* [Add] Added custom rendering tab slot for SplitLayout.
* [Docs] Update document.

## v1.0.9 - 2024/10/10

* [Add] Added `splitCopy` to each panel of SplitlLayout to implement the functionality of a split editor.
* [Fix] Fixed the issue of not being able to scroll when there are too many SplitLayout tabs (#7).

## v1.0.8 - 2024/10/08

* [Add] Add the `draggable` attribute to each panel to control whether it can be dragged.
* [Add] Add a `gridActive` event to SplitLayout to receive activation grid change events.
* [Fix] Fixed the issue where the Customize layout button status was not change after the CodeLayout drag sidebar was shrunk.
* [Fix] Fix the issue of incorrect triggering of `panelActive` event by SplitlLayout.
* [Docs] Update Document.

## v1.0.7 - 2024/09/13

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

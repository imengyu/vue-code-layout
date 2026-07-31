import type { App } from 'vue';
import '@imengyu/vue3-context-menu/lib/vue3-context-menu.css'

/**
 * 阶段 0：CodeLayout 仍指向 old/ 下的旧实现，保证 examples 与既有用户代码不受影响。
 * 阶段 6 会切换到新实现（见 plan.md §10）。
 *
 * 注意：类型从 old/CodeLayout 导出（它 re-export 了 Types.ts 的全部类型），
 * 避免与 './Types' 同名导出冲突。
 */
export * from './old/CodeLayout'
export * from './old/CodeLayoutRootGrid';
export * from './Consts';
export * from './SplitLayout/SplitN';
export * from './Composeable/DragDrop';
export * from './Composeable/LateClass';
export * from './Composeable/Vector2';
export * from './Composeable/ResizeChecker';
export * from './Composeable/MiniTimeout';
export * from './Composeable/PanelMenu';
export * from './Language/index';
export * from './Utils/SaveUtils';

// import CodeLayout from './old/CodeLayout.vue'
import CodeLayoutActionsRender from './Components/CodeLayoutActionsRender.vue'
// import CodeLayoutCollapseTitle from './old/CodeLayoutCollapseTitle.vue'
import CodeLayoutCustomizeLayout from './Components/CodeLayoutCustomizeLayout.vue'
import CodeLayoutScrollbar from './Components/CodeLayoutScrollbar.vue'
import CodeLayoutVNodeStringRender from './Components/CodeLayoutVNodeStringRender.vue'
import OverflowCollapseList from './Components/OverflowCollapseList.vue'
import SimpleTooltip from './Components/SimpleTooltip.vue'
import SplitLayout from './SplitLayout/SplitLayout.vue'
import SplitTab from './SplitLayout/SplitTab.vue'
import SplitTabItem from './SplitLayout/SplitTabItem.vue'
import SplitN from './SplitLayout/SplitN.vue'

export {
  // CodeLayout,
  CodeLayoutActionsRender,
  // CodeLayoutCollapseTitle,
  CodeLayoutCustomizeLayout,
  CodeLayoutScrollbar,
  CodeLayoutVNodeStringRender,
  OverflowCollapseList,
  SimpleTooltip,
  SplitLayout,
  SplitTab,
  SplitTabItem,
  SplitN,
}

export default {
  install(app: App) {
    // app.component('CodeLayout', CodeLayout);
    app.component('SplitLayout', SplitLayout);
  },
}
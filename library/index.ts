import type { App } from 'vue';

export * from './CodeLayout'
export * from './SplitLayout/SplitN';
export * from './Composeable/DragDrop';
export * from './Composeable/LateClass';
export * from './Composeable/Vector2';
export * from './Composeable/ResizeChecker';
export * from './Composeable/MiniTimeout';
export * from './Composeable/PanelMenu';
export * from './Language/index';

import CodeLayout from './CodeLayout.vue'
import CodeLayoutActionsRender from './CodeLayoutActionsRender.vue'
import CodeLayoutCollapseTitle from './CodeLayoutCollapseTitle.vue'
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
  CodeLayout,
  CodeLayoutActionsRender,
  CodeLayoutCollapseTitle,
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
    app.component('CodeLayout', CodeLayout);
    app.component('SplitLayout', SplitLayout);
  },
}
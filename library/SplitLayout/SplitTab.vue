<template>
  <div 
    :class="[ 
      'code-layout-split-tab',
      context.currentActiveGrid.value === grid ? 'active' : '',
    ]"
    @click="context.activeGrid(grid)"
  >
    <!--tab list-->
    <div
      v-if="grid.children.length > 0" 
      ref="tabScroll" 
      :class="[
        'code-layout-split-tab-list',
        tabHeaderDragOverDetector.dragLightBoxState.value ? 'drag-active' : '',
      ]"
      @dragover="tabHeaderDragOverDetector.handleDragOver"
      @dragleave="tabHeaderDragOverDetector.handleDragLeave"
      @dragenter="tabHeaderDragOverDetector.handleDragEnter"
      @drop="handleTabHeaderDrop"
    >
      <slot name="tabHeaderRender">
        <ScrollRect scroll="horizontal" :scrollBarSize="4" containerClass="code-layout-split-tab-list-tabs">
          <slot
            v-for="(panel, index) in grid.children"
            :key="panel.name"
            :panel="panel" 
            :index="index"
            :active="panel === grid.activePanel"
            :onTabClick="() => onTabClick(panel as CodeLayoutSplitNPanelInternal)"
            :onContextMenu="(e: MouseEvent) => emit('tabItemContextMenu', panel, e)"
            name="tabItemRender" 
          >
            <SplitTabItem 
              :panel="(panel as CodeLayoutSplitNPanelInternal)"
              :active="panel === grid.activePanel"
              @click="onTabClick(panel as CodeLayoutSplitNPanelInternal)"
              @contextmenu="emit('tabItemContextMenu', panel, $event)"
            />
          </slot>
          <slot name="tabHeaderEndRender" :grid="grid" />
        </ScrollRect>
      </slot>
      <div class="code-layout-split-tab-list-extra">
        <slot name="tabHeaderExtraRender" :grid="grid" />
        <CodeLayoutActionsRender v-if="grid.activePanel?.actions" :actions="grid.activePanel?.actions" />
      </div>
    </div>
    <!--tab content -->
    <div 
      ref="tabContent"
      :class="[
        'code-layout-split-tab-content',
        grid.children.length > 0 ? '' : 'empty',
        tabContentDragOverDetector.dragPanelState.value ? 'dragging' : '',
        tabContentDragOverDetector.dragLightBoxState.value ? 'drag-active' : '',
        `drag-over-${tabContentDragOverDetector.dragOverState.value}`,
      ]"
      @dragover="tabContentDragOverDetector.handleDragOver"
      @dragleave="tabContentDragOverDetector.handleDragLeave"
      @dragenter="tabContentDragOverDetector.handleDragEnter"
      @drop="handleTabContentDrop"
    >
      <slot v-if="grid.activePanel" name="tabContentRender" :panel="grid.activePanel" />
      <slot v-else name="tabEmptyContentRender" :grid="grid" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, type PropType, inject, toRefs } from 'vue';
import type { CodeLayoutSplitLayoutContext, CodeLayoutSplitNGridInternal, CodeLayoutSplitNPanelInternal } from './SplitN';
import { getCurrentDragPanel, usePanelDragOverDetector } from '../Composeable/DragDrop';
import { ScrollRect } from '@imengyu/vue-scroll-rect';
import '@imengyu/vue-scroll-rect/lib/vue-scroll-rect.css';
import CodeLayoutActionsRender from '../CodeLayoutActionsRender.vue';
import SplitTabItem from './SplitTabItem.vue'

const props = defineProps({
  grid: {
    type: Object as PropType<CodeLayoutSplitNGridInternal>,
    default: null,
  },
});

const emit = defineEmits([
  'tabItemContextMenu',
  'tabActive',
])

const { grid } = toRefs(props);
const context = inject('splitLayoutContext') as CodeLayoutSplitLayoutContext;
const tabScroll = ref<HTMLElement>();
const tabContent = ref<HTMLElement>();
const horizontal = ref(false);

function onTabClick(panel: CodeLayoutSplitNPanelInternal) {
  const oldActivePanel = grid.value.activePanel;
  emit('tabActive', panel, oldActivePanel);
  grid.value.setActiveChild(panel);
}

const tabHeaderDragOverDetector = usePanelDragOverDetector(
  tabScroll, grid, horizontal,
  () => {}, 
  (e) => context.dragDropNonPanel(e, false, 'tab-header'),
  (dragPanel) => {
    return (
      (!dragPanel.accept || dragPanel.accept.includes(props.grid.parentGrid))
      && (!dragPanel.preDropCheck || dragPanel.preDropCheck(dragPanel, props.grid.parentGrid))
    );
  }
);

function handleTabHeaderDrop(e: DragEvent) {
  const dropPanel = getCurrentDragPanel();
  if (dropPanel) {
    e.preventDefault();
    e.stopPropagation();
    context.dragDropToPanel(props.grid, 'center', dropPanel, true);
  } else if (tabHeaderDragOverDetector.handleDropPreCheck(e)) {
    context.dragDropNonPanel(e, true, 'tab-header', props.grid, 'center');
  }
  tabHeaderDragOverDetector.resetDragOverState();
}

const tabContentDragOverDetector = usePanelDragOverDetector(
  tabContent, grid, 'four',
  () => {}, 
  (e) => context.dragDropNonPanel(e, false, 'tab-content'),
  (dragPanel) => {
    return (
      (!dragPanel.accept || dragPanel.accept.includes(props.grid.parentGrid))
      && (!dragPanel.preDropCheck || dragPanel.preDropCheck(dragPanel, props.grid.parentGrid))
      && !(grid.value.hasChild(dragPanel) && grid.value.children.length === 1) //当前面板只有一个，并且这一个就是它自己，则不可拖放
    );
  },
);

function handleTabContentDrop(e: DragEvent) {
  const dropPanel = getCurrentDragPanel();
  if (dropPanel) {
    e.preventDefault();
    e.stopPropagation();
    context.dragDropToPanel(
      grid.value, 
      tabContentDragOverDetector.dragOverState.value, 
      dropPanel
    );
  } else if (tabContentDragOverDetector.handleDropPreCheck(e)) {
    context.dragDropNonPanel(
      e, true, 'tab-content', 
      grid.value, 
      tabContentDragOverDetector.dragOverState.value
    );
  }
  tabContentDragOverDetector.resetDragOverState();
  tabContentDragOverDetector.resetDragState();
}
</script>
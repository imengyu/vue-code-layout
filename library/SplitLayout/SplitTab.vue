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
          <slot name="tabHeaderStartRender" :grid="grid" />
          <SplitTabControlItem
            v-for="(panel, index) in (grid.children as CodeLayoutSplitNPanelInternal[])"
            :key="panel.name"
            :panel="panel" 
            :dragAddPanels="() => selectedTabs"
            :active="panel === grid.activePanel || selectedTabs.includes(panel)"
            @rangeSelect="onTabRangeSelect(panel)"
            @additionSelect="onTabAdditionSelect(panel)"
            @click="onTabClick(panel)"
            @contextmenu="emit('tabItemContextMenu', panel, $event)"
            @dragEnd="selectedTabs = []"
          >
            <template #sub="{ states }">
              <slot
                :panel="panel" 
                :index="index"
                :states="states"
                name="tabItemRender" 
              >
                <SplitTabItem 
                  :panel="panel"
                  :states="states"
                />
              </slot>
            </template>
          </SplitTabControlItem>
          <slot name="tabHeaderEndRender" :grid="grid" />
        </ScrollRect>
      </slot>
      <div class="code-layout-split-tab-list-extra">
        <slot name="tabHeaderExtraRender" :grid="grid" />
        <CodeLayoutActionsRender v-if="grid.activePanel?.actions" :actions="grid.activePanel?.actions" />
        <slot name="tabHeaderExtraEndRender" :grid="grid" />
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
import { ref, watch, type PropType, inject, toRefs, type Ref } from 'vue';
import type { CodeLayoutSplitLayoutContext, CodeLayoutSplitNGridInternal, CodeLayoutSplitNPanelInternal } from './SplitN';
import { getCurrentDragExternalPanels, usePanelDragOverDetector } from '../Composeable/DragDrop';
import { ScrollRect } from '@imengyu/vue-scroll-rect';
import '@imengyu/vue-scroll-rect/lib/vue-scroll-rect.css';
import CodeLayoutActionsRender from '../CodeLayoutActionsRender.vue';
import SplitTabItem from './SplitTabItem.vue'
import SplitTabControlItem from './SplitTabControlItem.vue'

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
const selectedTabs = ref<CodeLayoutSplitNPanelInternal[]>([]) as Ref<CodeLayoutSplitNPanelInternal[]>;

function onTabAdditionSelect(panel: CodeLayoutSplitNPanelInternal) {
  // 加入或者移除
  if (selectedTabs.value.includes(panel))
    selectedTabs.value.splice(selectedTabs.value.indexOf(panel), 1);
  else
    selectedTabs.value.push(panel); 
}
function onTabRangeSelect(panel: CodeLayoutSplitNPanelInternal) {
  //区间选择
  if (grid.value.activePanel === panel)
    selectedTabs.value = [ panel ];
  else if (grid.value.activePanel) {
    const lastIndex = grid.value.children.indexOf(grid.value.activePanel);
    const currentIndex = grid.value.children.indexOf(panel);
    if (lastIndex === -1 || currentIndex === -1)
      throw new Error('panel not found in grid.children');
    if (lastIndex > currentIndex)
      selectedTabs.value = grid.value.children.slice(currentIndex, lastIndex + 1) as CodeLayoutSplitNPanelInternal[];
    else
      selectedTabs.value = grid.value.children.slice(lastIndex, currentIndex + 1) as CodeLayoutSplitNPanelInternal[];
  } else {
    selectedTabs.value = [ panel ];
  }
}
function onTabClick(panel: CodeLayoutSplitNPanelInternal) {
  const oldActivePanel = grid.value.activePanel;
  emit('tabActive', panel, oldActivePanel);
  grid.value.setActiveChild(panel);
}

watch(() => grid.value.activePanel, (panel) => {
  if (panel) 
    selectedTabs.value = [ panel as CodeLayoutSplitNPanelInternal ];
  else
    selectedTabs.value = [];
}, { immediate: true })

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
  const dropPanels = getCurrentDragExternalPanels();
  if (dropPanels) {
    e.preventDefault();
    e.stopPropagation();
    context.dragDropToPanel(props.grid, 'center', dropPanels, true);
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
  const dropPanels = getCurrentDragExternalPanels();
  if (dropPanels) {
    e.preventDefault();
    e.stopPropagation();
    context.dragDropToPanel(
      grid.value, 
      tabContentDragOverDetector.dragOverState.value, 
      dropPanels
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
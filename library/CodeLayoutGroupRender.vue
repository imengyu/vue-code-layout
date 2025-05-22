<template>
  <!-- 扁平情况下多个条目只显示单页 -->
  <template v-if="show && group.tabStyle === 'hidden'">
    <CodeLayoutGroupRender
      v-if="group.activePanel"
      :show="group.activePanel.visible"
      :group="(group.activePanel as CodeLayoutPanelInternal)"
      :horizontal="false"
    >
      <template v-for="(_, name) in $slots" #[name]="slotData">
        <slot :name v-bind="slotData || {}"></slot>
      </template>
    </CodeLayoutGroupRender>
    <slot v-else name="emptyTabRender" />
  </template>
  <!-- 正常页面 -->
  <div 
    v-else-if="show" 
    ref="container"
    :class="[
      'code-layout-group',
      'tab-' + group.tabStyle,
      type === 'primary' ? 'primary' : '',
      group.tabStyle && (group.tabStyle == 'text-bottom' || group.tabStyle == 'icon-bottom') ? 'reverse-header' : '',
    ]"
  > 
    <!-- TAB栏 -->
    <div 
      v-if="group.tabStyle && group.tabStyle != 'none' && group.tabStyle != 'single'"
      :class="[
        'tab', 
        group.tabStyle,
        dragLightBoxState ? 'drag-active' : '',
      ]"
      data-dropable="true"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @dragenter="handleDragEnter"
      @drop="handleDrop"
      @contextmenu="onContextMenu(group.activePanel, $event)"
    >
      <OverflowCollapseList 
        class="tab-container"
        visibleKey="visible"
        :items="group.children"
        :activeItem="group.activePanel"
        :itemMenuLabel="(p) => (p as CodeLayoutPanelInternal).title"
        :menuDirection="group.tabStyle.endsWith('-bottom') ? 'up' : 'down'"
        :getItemSize="(_, horizontal, index) => (horizontal ? tabRefs[index]?.getWidth() : tabRefs[index]?.getHeight()) ?? 0"
        @overflowItemClicked="(p) => group.setActiveChild(p as CodeLayoutPanelInternal)"
      >
        <template #start>
          <slot name="tabHeaderLeftStart" :group="group" />
        </template>
        <template #item="{ item: panel, visible, index }">
          <CodeLayoutTabItem
            v-show="visible"
            :ref="(ref) => tabRefs[index] = ref"
            :tabStyle="group.tabStyle"
            :active="group.activePanel === panel"
            :panel="(panel as CodeLayoutPanelInternal)"
            @click="handleTabClick(panel as CodeLayoutPanelInternal)"
            @focusSelf="handleTabClick(panel as CodeLayoutPanelInternal)"
          />
        </template>
        <template #end>
          <slot name="tabHeaderLeftEnd" :group="group" />
        </template>
      </OverflowCollapseList>
      <div class="right">
        <slot name="tabHeaderRightStart" :group="group" />
        <CodeLayoutActionsRender v-if="group.activePanel" class="actions" :actions="group.activePanel.actions" />
        <CodeLayoutActionsRender v-if="group.parentGrid === 'bottomPanel'" class="actions" :actions="buttomPanelActions" />
        <CodeLayoutActionsRender v-if="group.parentGrid === 'secondarySideBar'" class="actions" :actions="secondaryPanelActions" />
        <slot name="tabHeaderRightEnd" :group="group" />
      </div>
    </div>
    <!-- 标题栏 -->
    <div 
      v-else-if="showTitleBar"
      class="title-bar"
      :draggable="group.draggable"
      @dragstart="handleDragStart(group, $event)"
      @dragend="handleDragEnd"
      @contextmenu="onContextMenu(group, $event)"
    >
      <slot name="titleBarTitle" :group="group" :title="group.title">
        <span class="title">{{ group.title }}</span>
      </slot>
      <CodeLayoutActionsRender 
        class="actions" 
        :actions="group.actions"
      >
        <template #start>
          <slot name="titleBarActionStart" :group="group" />
        </template>
        <template #end>
          <slot name="titleBarActionEnd" :group="group" />
        </template>
      </CodeLayoutActionsRender>
    </div>
    <!-- 内容区 -->
    <div :class="[ 'content', horizontal ? 'horizontal' : 'vertical' ]">
      <!-- 未有TAB栏情况下多个条目，支持拖拽分割 -->
      <CodeLayoutGroupDraggerHost 
        v-if="group.children.length > 1 && (!group.tabStyle || group.tabStyle === 'none' || group.tabStyle === 'single')"
        :group="group"
        :horizontal="horizontal"
      >
        <template #panelRender="data">
          <slot name="panelRender" v-bind="data" />
        </template>
      </CodeLayoutGroupDraggerHost>
      <!-- 有TAB栏情况下多个条目，支持拖拽分割 -->
      <CodeLayoutGroupDraggerHost 
        v-else-if="group.activePanel && group.activePanel.children.length > 1"
        :group="group.activePanel"
        :horizontal="horizontal"
      >
        <template #panelRender="data">
          <slot name="panelRender" v-bind="data" />
        </template>
      </CodeLayoutGroupDraggerHost>
      <slot 
        v-else-if="(group.tabStyle === 'text' || group.tabStyle === 'icon') && group.children.length == 0"
        name="emptyTabRender" 
      />
      <!-- 有TAB栏情况下单个条目 -->
      <CodeLayoutPanelRender
        v-else-if="group.activePanel"
        :open="true"
        :panel="group.activePanel"
        :alone="true"
        :horizontal="horizontal"
      >
        <template #default="data">
          <slot name="panelRender" v-bind="data" />
        </template>
      </CodeLayoutPanelRender>
      <!-- 未有TAB栏情况下单个条目 -->
      <CodeLayoutPanelRender
        v-else
        :open="true"
        :panel="group"
        :alone="true"
        :horizontal="horizontal"
      >
        <template #default="data">
          <slot name="panelRender" v-bind="data" />
        </template>
      </CodeLayoutPanelRender>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, type PropType, h, inject, type Ref, watch, getCurrentInstance, computed } from 'vue';
import type { CodeLayoutActionButton, CodeLayoutConfig, CodeLayoutContext, CodeLayoutPanelInternal } from './CodeLayout';
import CodeLayoutGroupDraggerHost from './CodeLayoutGroupDraggerHost.vue';
import CodeLayoutPanelRender from './CodeLayoutPanelRender.vue';
import CodeLayoutActionsRender from './CodeLayoutActionsRender.vue';
import CodeLayoutTabItem from './CodeLayoutTabItem.vue';
import OverflowCollapseList from './Components/OverflowCollapseList.vue';
import { getCurrentDragPanel, usePanelDragger, usePanelDragOverDetector } from './Composeable/DragDrop';
import { usePanelMenuControl } from './Composeable/PanelMenu';
import { useCodeLayoutLang } from './Language';
import IconActionClose from './Icons/IconActionClose.vue';
import IconActionMax from './Icons/IconActionMax.vue';
import { toRefs } from 'vue';

const props = defineProps({
  group: {
    type: Object as PropType<CodeLayoutPanelInternal>,
    required: true,
  },
  horizontal: {
    type: Boolean,
    default: true,
  },
  show: {
    type: Boolean,
    default: true,
  },
  type: {
    type: String as PropType<'primary' | 'secondary' | 'bottom' | ''>,
    default: '',
  },
});

const tabRefs = ref<any[]>([]);

const layoutConfig = inject('codeLayoutConfig') as Ref<CodeLayoutConfig>;
const context = inject('codeLayoutContext') as CodeLayoutContext;
const container = ref<HTMLElement>();
const { horizontal, group } = toRefs(props);
  
const showTitleBar = computed(() => {
  if (group.value.tabStyle === 'single' || !group.value.children || group.value.children.length == 0)
    return false;
  if (layoutConfig.value.activityBarSubGroupShowTitle)
    return group.value.parentGrid === 'primarySideBar' || 
      (group.value.parentGrid === 'secondarySideBar' && layoutConfig.value.secondarySideBarAsActivityBar);
  return false;
});

//标签点击函数

function handleTabClick(panel: CodeLayoutPanelInternal) {
  const parent = props.group;
  parent.setActiveChild(panel);
}

//拖放面板处理函数

const {
  handleDragStart,
  handleDragEnd,
} = usePanelDragger();

const {
  dragLightBoxState,
  handleDragOver,
  handleDragEnter,
  handleDragLeave,
  handleDropPreCheck,
  resetDragOverState,
  resetDragState,
} = usePanelDragOverDetector(
  container, group, horizontal,
  () => {}, 
  (e) => context.dragDropNonPanel(e, false, 'empty'),
  (dragPanel) => {
    return (
      (!dragPanel.accept || dragPanel.accept.includes(props.group.parentGrid))
      && (!dragPanel.preDropCheck || dragPanel.preDropCheck(dragPanel, props.group.parentGrid))
    );
  }, 'tab'
);

function handleDrop(e: DragEvent) {
  const dropPanel = getCurrentDragPanel();
  if (dropPanel) {
    e.preventDefault();
    e.stopPropagation();
    context.dragDropToPanelNear(props.group, 'right', dropPanel, 'empty');
  } else if (handleDropPreCheck(e)) {
    e.preventDefault();
    e.stopPropagation();
    context.dragDropNonPanel(e, true, 'empty', props.group, 'right');
  }
  resetDragOverState();
  resetDragState();
}

//菜单处理
const {
  onContextMenu
} = usePanelMenuControl();

const { t } = useCodeLayoutLang();

const bottomPanelMaxArrowDeg = computed(() => {
  const panelAlignment = layoutConfig.value.panelAlignment;
  const panelPosition = layoutConfig.value.panelPosition;
  const bottomPanelMaximize = layoutConfig.value.bottomPanelMaximize;
  if (panelAlignment === 'left-side')
    return bottomPanelMaximize ? -90 : 90;
  else if (panelAlignment === 'right-side')
    return bottomPanelMaximize ? 90 : -90;
  else if (panelPosition === 'top')
    return bottomPanelMaximize ? 0 : 180;
  return bottomPanelMaximize ? 180 : 0;
});

//面板默认操作
const buttomPanelActions = ref<CodeLayoutActionButton[]>([
  {
    icon() { 
      return h(IconActionMax, {
        style: {
          transform: `rotate(${bottomPanelMaxArrowDeg.value}deg)`,
        }
      })
    },
    tooltip: t('maximizePanel'),
    onClick() {
      layoutConfig.value.bottomPanelMaximize = !layoutConfig.value.bottomPanelMaximize;
    },
  },
  {
    icon: () => h(IconActionClose),
    tooltip: t('hidePanel'),
    onClick: () => {
      layoutConfig.value.bottomPanel = false;
    },
  },
]);
const secondaryPanelActions = ref<CodeLayoutActionButton[]>([
  {
    icon: () => h(IconActionClose),
    tooltip: t('hideSecondarySideBar'),
    onClick: () => {
      layoutConfig.value.secondarySideBar = false;
    },
  },
]);

watch(() => layoutConfig.value.bottomPanelMaximize, (v) => {
  buttomPanelActions.value[0].tooltip = v ? t('restorePanelSize') : t('maximizePanel');
});

const instance = getCurrentInstance();

defineExpose({
  forceUpdate() {
    instance?.proxy?.$forceUpdate();
  }
})
</script>

<style lang="scss">

.code-layout-group {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  --tab-padding: 10px;
  --tab-top-padding: 8px;
  --tab-bottom-padding: 4px;
  --tab-font-size: 11px;
  --tab-icon-size: 12px;
  --tab-font-size-small: 11px;

  &.primary {
    background-color: var(--code-layout-color-background-second);
  }
  &.reverse-header {
    flex-direction: column-reverse;

    > .tab {
      border-top: 1px solid var(--code-layout-color-border);

      .tab-item {
        padding: var(--tab-padding);
      }
    }
  }

  //Tab header
  > .tab {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    flex-wrap: nowrap;
    padding: 0 var(--tab-padding);
    margin-bottom: 2px;
    min-height: 30px;

    svg {
      fill: currentColor;
      font-size:  calc(var(--tab-icon-size));
    }

    > .right {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-end;
      flex-wrap: nowrap;
    }

    .tab-container {
      display: flex;
      flex-direction: row;
      align-items: center;
      flex-wrap: nowrap;
      flex-shrink: 1;

      .OverflowItem {
        position: relative;
        padding: calc(var(--tab-top-padding) + 2px) var(--tab-padding) 0 var(--tab-padding);
      }
    }
    .tab-item {
      position: relative;
      padding: var(--tab-top-padding) var(--tab-padding) var(--tab-bottom-padding) var(--tab-padding);
      font-size: var(--tab-font-size);
      line-height: calc(var(--tab-font-size) * 1.5);
      color: var(--code-layout-color-text);
      cursor: pointer;

      .badge {
        position: absolute;
        right: 0;
        bottom: 0;
        display: inline-block;
        padding: 3px;
        transform: scale(0.8);
        border-radius: var(--tab-font-size-small);
        font-size: var(--tab-font-size-small);
        min-width: var(--tab-font-size-small);
        line-height: var(--tab-font-size-small);
        text-align: center;
        background-color: var(--code-layout-color-highlight);
      }

      span {
        pointer-events: none;
      }

      &:hover, &:active, &.active {
        color: var(--code-layout-color-text-light);
      }
      &.active::after {
        position: absolute;
        content: '';
        left: var(--tab-padding);
        right: var(--tab-padding);
        bottom: 0px;
        height: 1px;
        background-color: var(--code-layout-color-text-light);
      }
      &.dragging {
        background-color: var(--code-layout-color-background);
        opacity: 0.7;
      }
      /*&.drag-enter {
        
      }*/
      &.drag-over-left, &.drag-over-up, &.drag-over-down, &.drag-over-right {
        &::before {
          position: absolute;
          content: '';
          top: var(--tab-top-padding);
          bottom: var(--tab-bottom-padding);
          width: var(--code-layout-border-size-larger);
          background-color: var(--code-layout-color-border-light);
        }
      }
      &.drag-over-left, &.drag-over-up {
        &::before {
          left: calc(var(--code-layout-border-size-larger) / 2 * -1);
        }
      }
      &.drag-over-down, &.drag-over-right {
        &::before {
          right: calc(var(--code-layout-border-size-larger) / 2 * -1);
        }
      }
    }

    &.text {
      .badge {
        position: relative;
        right: unset;
        bottom: unset;
        display: inline-block;
        margin-left: 8px;
        padding: 3px 5px;
        border-radius: var(--tab-font-size);
        font-size: var(--tab-font-size);
        min-width: var(--tab-font-size);
        line-height: var(--tab-font-size);
        background-color: var(--code-layout-color-background-light);
      }
    }
    &.drag-active::after {
      background-color: var(--code-layout-color-background-mask-light);
      position: absolute;
      content: '';
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 1;
      pointer-events: none;
    }
  }

  //Resize Tab content
  &.tab-icon, &.tab-text {
    .code-layout-panel {
      width: 100%;
      height: 100%;
    }
  }

  //Single title bat
  > .title-bar {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    flex-wrap: nowrap;
    height: 35px;
    overflow: hidden;
    padding: 0 var(--tab-padding);
    font-size: var(--tab-font-size);
    user-select: none;
  }

  //Content area
  > .content {
    position: relative;
    flex: 1;

    &.vertical {
      .code-layout-panel {
        width: 100%;
      }
      .code-layout-group-dragger-host {
        flex-direction: column;
      }
    }
    &.horizontal {
      .code-layout-panel {
        height: 100%;
      }
      .code-layout-group-dragger-host {
        flex-direction: row;
      }
    }
  }
}

</style>
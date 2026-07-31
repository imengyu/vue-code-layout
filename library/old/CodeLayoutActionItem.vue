<template>
  <SimpleTooltip
    :content="item.tooltip"
    :direction="direction == 'left' ? 'right' : 'left'"
  >
    <div 
      ref="container"
      :class="[
        'item',
        active ? 'active' : '',
        dragLightBoxState ? 'drag-enter' : '',
        `drag-over-${dragOverState}`,
      ]"
      :draggable="true"
      @click="$emit('activeItem', item)"
      @dragstart="handleDragStart(item, $event)"
      @dragend="handleDragEnd"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @dragenter="handleDragEnter"
      @drop="handleDrop"
      @contextmenu="onContextMenu(item, $event)"
    >
      <div class="icon">
        <CodeLayoutVNodeStringRender :content="item.iconLarge" :fallback="item.title ?? item.name" />
      </div>
      <span v-if="item.badge && item.showBadge" class="badge">
        <CodeLayoutVNodeStringRender :content="item.badge" />
      </span>
    </div>
  </SimpleTooltip>
</template>

<script setup lang="ts">
import { inject, ref, toRefs, type PropType, type Ref } from 'vue';
import type { CodeLayoutConfig, CodeLayoutContext, CodeLayoutPanelInternal } from './CodeLayout';
import CodeLayoutVNodeStringRender from './Components/CodeLayoutVNodeStringRender.vue';
import { checkDropPanelDefault, getCurrentDragPanel, usePanelDragger, usePanelDragOverDetector } from './Composeable/DragDrop';
import { usePanelMenuControl } from './Composeable/PanelMenu';
import SimpleTooltip from './Components/SimpleTooltip.vue';

const emit = defineEmits(['activeItem'])

const props = defineProps({
  item: {
    type: Object as PropType<CodeLayoutPanelInternal>,
    required: true,
  },
  active: {
    type: Boolean,
    default: false,
  },
  direction: {
    type: String as PropType<'left'|'right'>,
    default: 'left'
  },
});

const { item } = toRefs(props);
const horizontal = ref(false);
const container = ref<HTMLElement>();
const context = inject('codeLayoutContext') as CodeLayoutContext;
const layoutConfig = inject('codeLayoutConfig') as Ref<CodeLayoutConfig>;

const {
  onContextMenu
} = usePanelMenuControl();

const {
  handleDragStart,
  handleDragEnd,
} = usePanelDragger();

const {
  dragLightBoxState,
  dragOverState,
  handleDragOver,
  handleDragEnter,
  handleDragLeave,
  handleDropPreCheck,
  resetDragOverState,
  resetDragState,
} = usePanelDragOverDetector(
  container, item, horizontal,
  (dragPanel) => {
    if ((dragPanel == item.value || item.value.isChildren(dragPanel)) 
      && item.value.isSelfActived()) //当拖拽到自己上时，不隐藏
      return;
    emit('activeItem')
  },
  (e) => context.dragDropNonPanel(e, false, 'activiy-bar'),
  (dragPanel) => checkDropPanelDefault(dragPanel, item.value.parentGroup, item.value, dragOverState)
);

function handleDrop(e: DragEvent) {
  const dropPanel = getCurrentDragPanel();
  if (dropPanel && dragOverState.value) {
    e.preventDefault();
    e.stopPropagation();
    context.dragDropToPanelNear(item.value, dragOverState.value, dropPanel, 'activiy-bar');
  } else if (handleDropPreCheck(e)) {
    e.preventDefault();
    e.stopPropagation();
    context.dragDropNonPanel(e, true, 'activiy-bar', item.value, dragOverState.value);
  }
  resetDragOverState();
  resetDragState();
}


</script>
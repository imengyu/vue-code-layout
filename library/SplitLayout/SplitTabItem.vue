<template>
  <div 
    ref="container"
    :class="[
      'item',
      active ? 'active' : '',
      dragEnterState ? 'drag-active' : '',
      `drag-over-${dragOverState}`,
    ]"
    :title="panel.tooltip"
    :draggable="panel.draggable"
    @dragstart="handleDragStart(panel, $event)"
    @dragend="handleDragEnd"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @dragenter="handleDragEnter"
    @drop="handleDrop"
    @click="emit('click')"
  >
    <!-- icon and title -->
    <slot name="icon">
      <span class="icon"> 
        <CodeLayoutVNodeStringRender :content="panel.iconSmall || panel.iconLarge" />
      </span>
    </slot>

    <slot name="title">
      <span class="title">{{ panel.title }}</span>
    </slot>

    <slot name="badge">
      <span v-if="panel.badge" class="badge">
        <CodeLayoutVNodeStringRender :content="panel.badge" />
      </span>
    </slot>

    <!-- close -->
    <slot name="close">
      <span 
        v-if="panel.closeType !== 'none'"
        class="close"
        @click.stop="panel.closePanel()"
      >
        <IconClose v-if="panel.closeType === 'close'" class="close-icon" />
        <IconDot v-if="panel.closeType === 'unSave'" class="unsave-dot" />
      </span>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { ref, type PropType, toRefs, inject } from 'vue';
import type { CodeLayoutSplitLayoutContext, CodeLayoutSplitNPanelInternal } from './SplitN';
import CodeLayoutVNodeStringRender from '../Components/CodeLayoutVNodeStringRender.vue';
import IconClose from '../Icons/IconClose.vue';
import IconDot from '../Icons/IconDot.vue';
import { checkDropPanelDefault, getCurrentDragPanel, usePanelDragOverDetector, usePanelDragger } from '../Composeable/DragDrop';

const props = defineProps({
  panel: {
    type: Object as PropType<CodeLayoutSplitNPanelInternal>,
    default: null,
  },
  active: {
    type: Boolean,
    default: true,
  },
});

const container = ref<HTMLElement>();
const horizontal = ref(true);
const { panel } = toRefs(props);
const emit = defineEmits([ 'click', 'contextMenu' ])
const context = inject('splitLayoutContext') as CodeLayoutSplitLayoutContext;

const {
  handleDragStart,
  handleDragEnd,
} = usePanelDragger();

const {
  dragEnterState,
  dragOverState,
  handleDragOver,
  handleDragEnter,
  handleDragLeave,
  handleDropPreCheck,
  resetDragOverState,
  resetDragState,
} = usePanelDragOverDetector(
  container, panel, horizontal, 
  () => emit('click'),
  (e) => context.dragDropNonPanel(e, false, 'tab-header'),
  (dragPanel) => checkDropPanelDefault(dragPanel, panel.value, dragOverState)
);

function handleDrop(e: DragEvent) {
  const dropPanel = getCurrentDragPanel();
  if (dropPanel && dragOverState.value) {
    e.preventDefault();
    e.stopPropagation();
    context.dragDropToPanel(
      panel.value, 
      dragOverState.value, 
      dropPanel,
      true
    );
  } else if (handleDropPreCheck(e)) {
    context.dragDropNonPanel(
      e, true, 'tab-header', 
      panel.value, dragOverState.value
    );
  }
  resetDragOverState();
  resetDragState();
}
</script>
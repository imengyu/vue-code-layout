<template>
  <div 
    ref="container"
    :class="[
      'code-layout-empty',
      dragLightBoxState ? 'drag-active' : '',
    ]"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @dragenter="handleDragEnter"
    @drop="handleDrop"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { inject, ref, toRefs, type PropType } from 'vue';
import type { CodeLayoutContext, CodeLayoutGrid, CodeLayoutPanelInternal } from './CodeLayout';
import { getCurrentDragPanel, usePanelDragOverDetector } from './Composeable/DragDrop';

const props = defineProps({
  panel: {
    type: Object as PropType<CodeLayoutPanelInternal>,
    default: null,
  },
  grid: {
    type: String as PropType<CodeLayoutGrid>,
    required: true,
  },
});
const { panel } = toRefs(props);
const container = ref<HTMLElement>();
const context = inject('codeLayoutContext') as CodeLayoutContext;
const horizontal = ref(false);

const {
  dragLightBoxState,
  handleDragOver,
  handleDragEnter,
  handleDragLeave,
  handleDropPreCheck,
  resetDragOverState,
  resetDragState,
} = usePanelDragOverDetector(
  container, panel, horizontal,
  () => {}, 
  (e) => context.dragDropNonPanel(e, false, 'empty'),
  (dragPanel) => {
    return (
      (!dragPanel.accept || dragPanel.accept.includes(props.grid))
      && (!dragPanel.preDropCheck || dragPanel.preDropCheck(dragPanel, props.grid))
    );
  }
);

function handleDrop(e: DragEvent) {
  const dropPanel = getCurrentDragPanel();
  if (dropPanel) {
    e.preventDefault();
    e.stopPropagation();
    if (props.panel)
      context.dragDropToPanelNear(props.panel, 'right', dropPanel, 'empty');
    else
      context.dragDropToGrid(props.grid, dropPanel);
  } else if (handleDropPreCheck(e)) {
    e.preventDefault();
    e.stopPropagation();
    context.dragDropNonPanel(e, true, 'empty', props.panel, 'right');
  }
  resetDragOverState();
  resetDragState();
}

</script>

<style lang="scss">
.code-layout-empty {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  font-size: 12px;
  color: var(--code-layout-color-text);

  &.drag-active::after {
    background-color: var(--code-layout-color-background-mask-light);
    position: absolute;
    content: '';
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1;
  }
}
</style>
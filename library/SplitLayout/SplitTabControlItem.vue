<template>
  <SimpleTooltip direction="mouse" :content="panel.tooltip">
    <div 
      ref="container"
      class="control-item"
      :draggable="panel.draggable"
      @dragstart="handleDragStart(panel, $event)"
      @dragend="handleDragEnd"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @dragenter="handleDragEnter"
      @drop="handleDrop"
      @click="handleClick"
    >
      <slot :states="{ active, dragLightBoxState, dragOverState }" />
    </div>
  </SimpleTooltip>
</template>

<script setup lang="ts">
import { ref, type PropType, toRefs, inject } from 'vue';
import type { CodeLayoutSplitLayoutContext, CodeLayoutSplitNPanelInternal } from './SplitN';
import { checkDropPanelDefault, getCurrentDragExternalPanels, getCurrentDragPanel, usePanelDragOverDetector, usePanelDragger } from '../Composeable/DragDrop';
import SimpleTooltip from '../Components/SimpleTooltip.vue';
import { useKeyBoardController } from '../Composeable/KeyBoardController';

const props = defineProps({
  panel: {
    type: Object as PropType<CodeLayoutSplitNPanelInternal>,
    default: null,
  },
  active: {
    type: Boolean,
    default: true,
  },
  dragAddPanels: {
    type: Function as PropType<(dragPanel: CodeLayoutSplitNPanelInternal) => CodeLayoutSplitNPanelInternal[]>,
    default: null,
  }
});

const container = ref<HTMLElement>();
const horizontal = ref(true);
const { panel } = toRefs(props);
const emit = defineEmits([ 
  'click', 
  'rangeSelect', 
  'additionSelect', 
  'dragEnd',
  'contextMenu',
])
const context = inject('splitLayoutContext') as CodeLayoutSplitLayoutContext;
const keyBoardController = useKeyBoardController();

const {
  handleDragStart,
  handleDragEnd,
} = usePanelDragger({
  onBeforeDragAddPanels() {
    return props.dragAddPanels?.(panel.value) ?? [];
  },
  onDragEnd() {
    emit('dragEnd');
  },
});

function handleClick(e: MouseEvent) {

  if (keyBoardController.isKeyShiftDown()) {
    emit('rangeSelect', e);
    return;
  }
  if (keyBoardController.isKeyControlDown()) {
    emit('additionSelect', e);
    return; 
  }
  emit('click', e); 
}

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
  container, panel, horizontal, 
  () => emit('click'),
  (e) => context.dragDropNonPanel(e, false, 'tab-header'),
  (dragPanel) => checkDropPanelDefault(dragPanel, panel.value, dragOverState)
);

function handleDrop(e: DragEvent) {
  const dropPanels = getCurrentDragExternalPanels();
  if (dropPanels && dragOverState.value) {
    e.preventDefault();
    e.stopPropagation();
    context.dragDropToPanel(
      panel.value, 
      dragOverState.value, 
      dropPanels,
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
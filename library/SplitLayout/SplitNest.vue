<template>
  <SplitN
    v-if="grid.childGrid?.length"
    ref="splitLayoutRef"
    :key="grid.name"
    :grids="grid.childGrid"
    :horizontal="grid.direction === 'horizontal'"
    :indexOfParent="indexOfParent"
    :isLastOfParent="isLastOfParent"
    :forceDraggerActiveState="topForceDraggerActiveState"
  >
    <template #grid="{ grid: childGrid, index }">
      <SplitNest 
        v-if="(childGrid as CodeLayoutSplitNGridInternal).childGrid?.length"
        :key="childGrid.name"
        :grid="(childGrid as CodeLayoutSplitNGridInternal)"
        :indexOfParent="index"
        :isLastOfParent="index === grid.childGrid.length - 1"
        @orthogonalDraggerHover="(a, b) => handlerChilldOrthogonalDraggerHover(index, a, b)"
        @orthogonalDraggerDrag="(a, b) => handlerChilldOrthogonalDraggerDrag(index, a, b)"
      >
        <template #grid="param">
          <slot name="grid" v-bind="param" />
        </template>
      </SplitNest>
      <slot v-else name="grid" :grid="(childGrid as CodeLayoutSplitNGridInternal)" :index="index" />
    </template>
  </SplitN>
  <slot v-else name="grid" :grid="grid" :index="0" />
</template>

<script setup lang="ts">
import SplitN from './SplitN.vue';
import type { CodeLayoutSplitNGridInternal } from './SplitN';
import { onBeforeUnmount, onMounted, ref, watch, type PropType } from 'vue';

const props = defineProps({
  grid: {
    type: Object as PropType<CodeLayoutSplitNGridInternal>,
    default: null,
  },
  indexOfParent: {
    type: Number,
    default: 0,
  },
  isLastOfParent: {
    type: Boolean,
    default: false,
  }, 
});
defineSlots<{
  'grid': (props: { grid: CodeLayoutSplitNGridInternal, index: number }) => any;
}>();
defineEmits<{
  (e: 'orthogonalDraggerHover', type: string, hover: boolean) : any;
  (e: 'orthogonalDraggerDrag', type: string, ev: MouseEvent) : any;
}>();

const splitLayoutRef = ref<InstanceType<typeof SplitN>>();
const topForceDraggerActiveState = ref(0);

function handlerChilldOrthogonalDraggerHover(index: number, type: string, hover: boolean) {
  if (!hover) {
    topForceDraggerActiveState.value = 0;
    return;
  }
  if (type === 'start')
    topForceDraggerActiveState.value = index;
  else if (type === 'end')
    topForceDraggerActiveState.value = index + 1;
}
function handlerChilldOrthogonalDraggerDrag(index: number, type: string, e: MouseEvent) {
  if (topForceDraggerActiveState.value > 0)
    splitLayoutRef.value?.applyOrthogonalDragger(type, e);
}

//钩子函数
function loadPanelFunctions() {
  props.grid.listenLateAction('notifyRelayout', () => splitLayoutRef.value?.relayoutAll());
  props.grid.listenLateAction('relayoutAllWithNewPanel', (p1, p2) => splitLayoutRef.value?.relayoutAllWithNewPanel(p1, p2));
  props.grid.listenLateAction('relayoutAllWithResizedSize', (p1) => splitLayoutRef.value?.relayoutAllWithResizedSize(p1));
  props.grid.listenLateAction('relayoutAllWithRemovePanel', (p1) => splitLayoutRef.value?.relayoutAllWithRemovePanel(p1));
}
function unloadPanelFunctions(oldValue: CodeLayoutSplitNGridInternal) {
  oldValue.unlistenAllLateAction();
}

watch(() => props.grid, (newValue, oldValue) => {
  unloadPanelFunctions(oldValue);
  loadPanelFunctions();
});
onMounted(() => {
  loadPanelFunctions();
});
onBeforeUnmount(() => {
  unloadPanelFunctions(props.grid);
});

</script>
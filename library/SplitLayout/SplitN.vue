<template>
  <div 
    ref="splitBase" 
    :class="[ 
      'code-layout-split-base',
      horizontal ? 'horizontal' : 'vertical',
    ]"
  >
    <div 
      v-for="(child, index) in grid.childGrid"
      :key="child.name"
      :style="{
        width: horizontal ? `${child.visible ? child.size : 0}%` : undefined,
        height: horizontal ? undefined : `${child.visible ? child.size : 0}%`,
      }"
      :data-panel-name="child.name"
      class="split-n-container"
    >
      <div 
        v-if="(child.visible || child.canMinClose) && index !== 0"
        :class="[
          'code-layout-split-dragger resize inner',
          splitDragging[index] || forceDraggerActiveState === index ? 'active' : '',
        ]" 
        :style="{
          width: horizontal ? `${draggerSize}px` : undefined,
          height: horizontal ? undefined : `${draggerSize}px`,
        }"
        @mousedown="dragHandler($event, index)"
      >
        <div 
          v-if="indexOfParent > 0"
          class="code-layout-split-orthogonal-drag-handle start"
          @mouseenter="onOrthogonalDraggerEnter('start')"
          @mouseleave="onOrthogonalDraggerLeave('start')"
        />
        <div 
          v-if="!isLastOfParent"
          class="code-layout-split-orthogonal-drag-handle end"
          @mouseenter="onOrthogonalDraggerEnter('end')"
          @mouseleave="onOrthogonalDraggerLeave('end')"
        />
      </div>
      <div
        class="content"
      >
        <slot 
          v-if="child.visible"
          name="grid"
          :grid="child"
          :index="index"
        />
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import HtmlUtils from '../Utils/HtmlUtils';
import { createMouseDragHandler } from '../Composeable/MouseHandler';
import { useResizeChecker } from '../Composeable/ResizeChecker';
import { ref, type PropType, onMounted, nextTick, watch, onBeforeUnmount } from 'vue';
import type { CodeLayoutSplitNGridInternal } from './SplitN';

export interface SplitNInstance {
  applyOrthogonalDragger(type: string, e: MouseEvent): void;
}

const emit = defineEmits([
  'orthogonalDraggerHover', 
  'orthogonalDraggerDrag',
]);

const props = defineProps({
  grid: {
    type: Object as PropType<CodeLayoutSplitNGridInternal>,
    default: null,
  },
  /**
   * Is horizontal?
   * 
   * Default: true
   */
  horizontal: {
    type: Boolean,
    default: true,
  },
  /**
   * Set Dragger size (pixel)
   * 
   * Default: true
   */
  draggerSize: {
    type: Number,
    default: 1,
  },
  forceDraggerActiveState: {
    type: Number,
    default: 0,
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

const splitBase = ref<HTMLElement>();
const splitDragging = ref<boolean[]>([]);

let oldSize = 0;
let baseLeft = 0;
let dragPanelSplitIndex = 0;
let dragPanelLeftSize = 0;
let dragPanelRightSize = 0;

let dragPanelLastLeftSize = 0;
let dragPanelLastRightSize = 0;
let dragPanelArray : PanelResizePanelData[] = [];
let dragging = false;
let orthogonalNeedUnHovering = false;

interface PanelResizePanelData {
  panel: CodeLayoutSplitNGridInternal, 
  intitalSize: number;
}

/**
 * 根据面板的最小值或是否可以折叠来调整面板大小
 * @param containerSize 容器大小
 * @param panel 面板
 * @param intitalSize 面板初始大小
 * @param increaseSize 增量大小（正数放大，负数缩小）
 * @returns 返回调整结果
 */
function adjustAndReturnAdjustedSize(
  containerSize: number, 
  panel: CodeLayoutSplitNGridInternal, 
  intitalSize: number, 
  increaseSize: number
) {
  let visibleChangedSize = 0;
  let visibleChanged = false;


  const intitalSizePx = intitalSize / 100 * containerSize; // to px
  const oldSize = (panel.visible ? intitalSizePx : 0); // to px
  const targetSize = oldSize + increaseSize;
  const minSize = getGridMinSizePx(panel);
  const panelSize = Math.max(minSize, targetSize);

  panel.size = panelSize / containerSize * 100; //to precent

  if (panel.canMinClose && minSize > 0) {
    const newValue = targetSize > minSize / 2;
    visibleChanged = newValue != panel.visible;
    if (visibleChanged) { 
      panel.visible = newValue;
      panel.onMinCloseChanged?.(panel, newValue);
      if (panel.visible) {
        visibleChangedSize += targetSize
      } else {
        visibleChangedSize -= targetSize
      }
    }
  }

  const resultRealNewSize = (panel.visible ? panelSize : 0);

  //if (panel.name === 'primarySideBar') {
  //  console.log('resultRealNewSize', resultRealNewSize, 'oldSize', oldSize, 'panelSize', panelSize, 'targetSize', targetSize);
  //}

  return {
    minSize,
    /**
     * 面板的显示状态是否更改
     */
    visibleChanged,
    /**
     * 实际面板占用大小
     */
    resultRealNewSize,
    /**
     * 实际调整的大小(缩小了为负数，放大了为正数)
     */
    adjustedSize: resultRealNewSize - oldSize,
    /**
     * 可见性改变的大小(
     *    面板显示有新空间被占用，为正数；
     *    面板隐藏有新空间被腾出，为负数
     * )
     */
    visibleChangedSize,
  };
}
/**
 * 获取网格最小大小的百分比
 * @param grid 面板
 * @returns 返回百分比
 */
function getGridMinSize(grid: CodeLayoutSplitNGridInternal) {
  if (!splitBase.value)
    throw new Error('!splitBase.value');
  const containerSize = props.horizontal ? 
    splitBase.value.offsetWidth : 
    splitBase.value.offsetHeight;
  const sizePx = getGridMinSizePx(grid);
  if (!sizePx)
    return 0;
  return sizePx / containerSize * 100;
}
/**
 * 获取网格最小大小(像素)
 * @param grid 面板
 * @returns 返回像素
 */
function getGridMinSizePx(grid: CodeLayoutSplitNGridInternal) {
  if (!grid.minSize)
    return 0;
  let minSize = 0;
  if (typeof grid.minSize === 'number') 
    minSize = grid.minSize; 
  else if (props.horizontal)
    minSize = grid.minSize[0];
  else
    minSize = grid.minSize[1];
  return minSize;
}
/**
 * 获取拖拽左侧面板的大小
 */
function calcDraggerLeftSize() {
  dragPanelLeftSize = 0;
  dragPanelRightSize = 0;
  dragPanelArray = [];
  for (let i = 0; i < props.grid.childGrid.length; i++) {
    const panel = props.grid.childGrid[i];
    if (i < dragPanelSplitIndex && panel.visible)
      dragPanelLeftSize += panel.size;
    else if (i >= dragPanelSplitIndex && panel.visible)
      dragPanelRightSize += panel.size;
    dragPanelArray.push({
      panel,
      intitalSize: panel.size, 
    })
  }
}

function onDraggerDown(e: MouseEvent, index: number) {
  e.preventDefault();
  e.stopPropagation();
  baseLeft = props.horizontal ? 
    HtmlUtils.getLeft(splitBase.value!) : 
    HtmlUtils.getTop(splitBase.value!);
  splitDragging.value[index] = true;
  dragPanelSplitIndex = index;
  calcDraggerLeftSize();
}
function onDraggerMove(e: MouseEvent, index: number) {
  if (!splitBase.value)
    return;
  e.preventDefault();
  e.stopPropagation();

  /**
   * 拖拽步骤：
   * 1. 在数组中进行执行面板缩放或者放大操作
   *   1.1 按鼠标移动方向分配移动的大小。
   *   1.2 两侧，获取是否存在继续缩放余量。
   *   1.3 计算两侧是否超出预定大小（无余量），
   *      若有一侧超出预定大小，则调整有余量的一侧。
   *   1.4 若有一侧小于预定大小，则扩展填充空缺空间。
   */

  const containerSize = props.horizontal ? 
    splitBase.value.offsetWidth : 
    splitBase.value.offsetHeight;

  
  const dragPanelLeftSizePx = Math.min(dragPanelLeftSize / 100 * containerSize, containerSize); //to px
  const dragPanelRightSizePx = Math.min(dragPanelRightSize / 100 * containerSize, containerSize); //to px
  const dragSize = ((props.horizontal ? e.x : e.y) - baseLeft);
  /**
   * 移动大小像素左负右正
   */
  const movedSize = dragSize - dragPanelLeftSizePx;
  if (movedSize === 0) 
    return;

  let allHasVisibleChanged = false;

  let leftTargetSize = dragPanelLeftSizePx + movedSize;
  let rightTargetSize = containerSize - leftTargetSize;

  checkSize();

  let leftResult = resizeGroup(true);
  let rightResult = resizeGroup(false);

  const leftCompressOverflow = 
    leftResult.allVisibleSize != leftTargetSize
    || leftResult.allVisibleSize == dragPanelLastLeftSize;
  const rightCompressOverflow = 
    rightResult.allVisibleSize != rightTargetSize
    || rightResult.allVisibleSize == dragPanelLastRightSize;

  dragPanelLastLeftSize = leftResult.allVisibleSize;
  dragPanelLastRightSize = rightResult.allVisibleSize;

  function checkSize() {
    if (leftTargetSize < 0)
      throw new Error('leftTargetSize < 0');
    if (rightTargetSize < 0)
      throw new Error('rightTargetSize < 0'); 
  }
  if (leftCompressOverflow) {
    rightTargetSize = containerSize - leftResult.allVisibleSize;
    leftTargetSize = leftResult.allVisibleSize;
    checkSize();
    resetGroup(false);
    leftResult = resizeGroup(false);
  } 
  if (rightCompressOverflow) {
    leftTargetSize = containerSize - rightResult.allVisibleSize;
    rightTargetSize = rightResult.allVisibleSize; 
    checkSize();
    resetGroup(true);
    rightResult = resizeGroup(true);
  }

  //如果有面板显示状态更新，则刷新大小记录
  if (allHasVisibleChanged)
    calcDraggerLeftSize();

  /**
   * 重置面板大小
   */
  function resetGroup(left: boolean) {
    function resizeLoop(panel: PanelResizePanelData) {
      panel.panel.size = panel.intitalSize;
    }
    if (left) {
      for (let i = index - 1; i >= 0; i--) 
        resizeLoop(dragPanelArray[i]);
    } else {
      for (let i = index; i < dragPanelArray.length; i++) 
        resizeLoop(dragPanelArray[i]);
    }
  }
  /**
   * 调整面板大小
   * @param startIndex 起始索引
   * @param forward 调整方向
   * @returns 返回调整结果
   */
  function resizeGroup(left: boolean) {
    let needResizeSize = left ? 
      leftTargetSize - dragPanelLeftSizePx : 
      rightTargetSize - dragPanelRightSizePx;
    let allMinSize = 0;
    let allVisibleSize = 0;
    let allVisibleChangedSize = 0;

    function resizeLoop(panel: PanelResizePanelData) {
      const { 
        minSize,
        visibleChanged,
        adjustedSize,
        resultRealNewSize, 
        visibleChangedSize,
      } = adjustAndReturnAdjustedSize(
        containerSize, 
        panel.panel, 
        panel.intitalSize,
        needResizeSize,
      );
      if (visibleChanged)
        allHasVisibleChanged = true;
      allMinSize += minSize;
      needResizeSize -= adjustedSize;
      allVisibleSize += resultRealNewSize;
      allVisibleChangedSize += visibleChangedSize;
    }
    
    if (left) {
      for (let i = index - 1; i >= 0; i--) 
        resizeLoop(dragPanelArray[i]);
    } else {
      for (let i = index; i < dragPanelArray.length; i++) 
        resizeLoop(dragPanelArray[i]);
    }

    return {
      needResizeSize,
      allMinSize,
      allVisibleSize,
      allVisibleChangedSize,
    }
  }
}
function onDraggerUp(e: MouseEvent, index: number) {
  splitDragging.value[index] = false;
}
function onOrthogonalDraggerEnter(type: string) {
  emit('orthogonalDraggerHover', type, true)
}
function onOrthogonalDraggerLeave(type: string) {
  if (!dragging) {
    orthogonalNeedUnHovering = false;
    emit('orthogonalDraggerHover', type, false);
  }
  else
    orthogonalNeedUnHovering = true;
}
function applyOrthogonalDragger(type: string, e: MouseEvent) {
  switch (type) {
    case 'down': onDraggerDown(e, props.forceDraggerActiveState); break;
    case 'move': onDraggerMove(e, props.forceDraggerActiveState); break;
    case 'up': onDraggerUp(e, props.forceDraggerActiveState); break;
  }
}

const dragHandler = createMouseDragHandler<number>({
  onDown(e, index) {
    if (splitBase.value && typeof index === 'number') {
      dragging = true;
      onDraggerDown(e, index!);
      emit('orthogonalDraggerDrag', 'down', e);
      return true;
    }
    return false;
  },
  onMove(downPos, movedPos, e, index) {
    if (splitBase.value && typeof index === 'number') { 
      onDraggerMove(e, index!);
      emit('orthogonalDraggerDrag', 'move', e);
    }
  },
  onUp(e, index) {
    dragging = false;
    emit('orthogonalDraggerDrag', 'up', e);
    onDraggerUp(e, index!);
    if (orthogonalNeedUnHovering)
      onOrthogonalDraggerLeave('');
  },
});

//获取当前容器可分配的大小
function getCanAllocSize() {
  if (!splitBase.value)
    throw new Error('!splitBase.value');
  const containerSize = props.horizontal ? 
    splitBase.value.offsetWidth : 
    splitBase.value.offsetHeight;
  let notAllocSpaceAndOpenCount = 0;
  let canAllocSize = 100;
  for (const grid of props.grid.childGrid) {
    grid.lastRelayoutSize = containerSize;
    if (grid.size > 0)
      canAllocSize -= grid.visible ? grid.size : 0;
    else
      notAllocSpaceAndOpenCount++;
  }
  return { 
    canAllocSize: Math.max(canAllocSize, 0), 
    notAllocSpaceAndOpenCount,
  };
}
//获取面板平均分配大小，用于初始化
function getAvgAllocSize() {
  const { canAllocSize, notAllocSpaceAndOpenCount } = getCanAllocSize();
  return notAllocSpaceAndOpenCount > 0 ?
    canAllocSize / notAllocSpaceAndOpenCount
    : 0;
}
//初始大小情况下，有可能有些面板空间还未分配，现在分配这些空间
function allocZeroGridSize() {
  const allocSize = getAvgAllocSize();
  for (const grid of props.grid.childGrid) {
    if (grid.size <= 0) {
      grid.size = Math.max(allocSize, getGridMinSize(grid));
      //console.log('allocZeroGridSize', grid.name, grid.size);
      if (isNaN(grid.size))
        throw new Error('bad grid.size in ' + grid.name);
    }
  }
}

/**
 * 当容器大小或者容器添加/删除时，重新布局已存在面板
 * 0. 计算容器大小变化了多少，是缩小还是放大
 * 1. 获取面板列表，按他们的的大小降序排列
 * 2. 按顺序依次减小/放大到最小值
 * 
 * @param resizedContainerSize 变化的大小，负数为放大，正数为缩小 (容器百分比)
 */
function relayoutAllWithResizedSize(resizedContainerSizePrecent: number) {

  //console.log('relayoutAllWithResizedSize', resizedContainerSizePrecent);
  
  if (!splitBase.value)
    throw new Error('!splitBase.value');

  const containerSizePrecent = 100;
  const containerSize = props.horizontal ? splitBase.value.offsetWidth : splitBase.value.offsetHeight;
  const resizeLarge = (resizedContainerSizePrecent < 0);

  let allPanelsSize = 0;
  const openedPanels = props.grid.childGrid.filter(p => {
    if (!p.visible)
      return false;
    allPanelsSize += p.size;
    return true;
  }).sort((a, b) => a.size > b.size ? 1 : -1);

  //放大情况，所有面板大小已大于容器对象，不再向其分配大小
  if (resizeLarge) {
    if (allPanelsSize >= containerSizePrecent)
      return;
    const overflow = allPanelsSize + (-resizedContainerSizePrecent) - containerSizePrecent;
    if (overflow > 0)
      resizedContainerSizePrecent -= (-overflow);
  }

  //向打开的面板分配大小
  for (let i = 0; i < openedPanels.length; i++) {
    const panel = openedPanels[i];
    const { adjustedSize } = adjustAndReturnAdjustedSize(containerSize, panel, panel.size, -resizedContainerSizePrecent);
    resizedContainerSizePrecent += adjustedSize;
    if (!resizeLarge && resizedContainerSizePrecent <= 0)
      break;
    if (resizeLarge && resizedContainerSizePrecent >= 0)
      break;
  }
}
//当容器添加时，重新布局已存在面板
function relayoutAllWithNewPanel(panels: CodeLayoutSplitNGridInternal[], referencePanel?: CodeLayoutSplitNGridInternal) {
  if (
    panels.length === 1 && referencePanel 
    && referencePanel.size > getGridMinSize(referencePanel) + getGridMinSize(panels[0])
  ) {
    //如果只有一个新网格，且新网格和拖拽目标网格宽度足够，则从他们中间平均分配
    const allocSize = referencePanel.size / 2;
    referencePanel.size = allocSize;
    panels[0].size = allocSize;
  } else {
    //否则平均重新分配全部网格
    for (const grid of props.grid.childGrid)
      grid.size = 0;
    allocZeroGridSize();
  }
} 
//当容器移除时，重新布局已存在面板
function relayoutAllWithRemovePanel(panel: CodeLayoutSplitNGridInternal) {
  relayoutAllWithResizedSize(-panel.size);
} 
//当容器大小改变时，重新布局已存在面板
function relayoutAllWhenSizeChange(newSize: number) {
  const grids = props.grid.childGrid.filter(p => p.visible);

  //全部可以扩展，直接利用百分比，无须调整
  if (grids
    .filter(p => p.visible)
    .reduce((a, b) => a && b.stretchable, true)
  )
    return;

  //对于不能扩展的网格，需要重新计算大小，保持其比例
  let allUnStretchablSizes = 0;
  let allOldStretchableSizes = 0;
  for (const grid of grids) {
    if (!grid.stretchable) {
      const gridRealSize = (grid.size / 100) * oldSize;
      grid.size = gridRealSize / newSize * 100;
      allUnStretchablSizes += grid.size;
    }
  }
  for (const grid of grids) {
    if (grid.stretchable)
      allOldStretchableSizes += grid.size;
  }
  for (const grid of grids) {
    if (grid.stretchable) {
      const precentOfStretchable = grid.size / allOldStretchableSizes;
      grid.size = (100 - allUnStretchablSizes) * precentOfStretchable
    }
  }

  oldSize = newSize;
}
//重新布局
function relayoutAll() {
  allocZeroGridSize();
}
//钩子函数
function loadPanelFunctions() {
  props.grid.listenLateAction('notifyRelayout', () => relayoutAll());
  props.grid.listenLateAction('relayoutAllWithNewPanel', relayoutAllWithNewPanel);
  props.grid.listenLateAction('relayoutAllWithResizedSize', relayoutAllWithResizedSize);
  props.grid.listenLateAction('relayoutAllWithRemovePanel', relayoutAllWithRemovePanel);
}
function unloadPanelFunctions(oldValue: CodeLayoutSplitNGridInternal) {
  oldValue.unlistenAllLateAction();
}

//更改大小后重新布局

const {
  startResizeChecker,
  stopResizeChecker
} = useResizeChecker(splitBase, 
  props.horizontal ? relayoutAllWhenSizeChange : undefined,
  props.horizontal ? undefined : relayoutAllWhenSizeChange
);

watch(() => props.grid, (newValue, oldValue) => {
  unloadPanelFunctions(oldValue);
  loadPanelFunctions();
  allocZeroGridSize();
});
watch(() => props.grid.childGrid.length, () => {
  allocZeroGridSize();
})

onMounted(() => {
  nextTick(() => {
    if(splitBase.value)
      oldSize = props.horizontal ? splitBase.value.offsetWidth : splitBase.value.offsetHeight;
    startResizeChecker();
    allocZeroGridSize();
    loadPanelFunctions();
  });
});
onBeforeUnmount(() => {
  stopResizeChecker();
  unloadPanelFunctions(props.grid);
});

defineExpose<SplitNInstance>({
  applyOrthogonalDragger,
});

</script>

<style lang="scss">
@import "../Scss/Split.scss";
</style>

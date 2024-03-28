<template>
  <SplitNest :grid="(rootGrid as CodeLayoutSplitNGridInternal)">
    <template #grid="{ grid }">
      <slot v-if="showTabHeader" name="tabRender" :grid="grid">
        <SplitTab 
          :grid="grid"
          @tabItemContextMenu="(a, b) => emit('panelContextMenu', a, b)"
          @tabActive="onTabActiveChild"
        >
          <template #tabContentRender="params">
            <slot name="tabContentRender" v-bind="params" />
          </template>
          <template #tabEmptyContentRender="params">
            <slot name="tabEmptyContentRender" v-bind="params" />
          </template>
          <template #tabHeaderExtraRender="params">
            <slot name="tabHeaderExtraRender" v-bind="params" />
          </template>
          <template #tabItemRender="params">
            <slot name="tabItemRender" v-bind="params" />
          </template>
        </SplitTab>
      </slot>
      <slot v-else name="gridRender" :grid="grid" />
    </template>
  </SplitNest>
</template>

<script setup lang="ts">
import { ref, provide, type Ref, type PropType, watch, onMounted, computed, nextTick } from 'vue';
import type { CodeLayoutPanelInternal, CodeLayoutPanelHosterContext, CodeLayoutGrid, CodeLayoutDragDropReferencePosition } from '../CodeLayout';
import { CodeLayoutSplitNGridInternal, type CodeLayoutSplitLayoutContext, type CodeLayoutSplitNInstance, CodeLayoutSplitNPanelInternal } from './SplitN';
import SplitNest from './SplitNest.vue';
import SplitTab from './SplitTab.vue';
import { usePanelDraggerRoot } from '../Composeable/DragDrop';

const emit = defineEmits([ 
  'panelClose', 
  'panelContextMenu',
  'panelActive',
  'panelDrop',
  'canLoadLayout',
]);
const props = defineProps({
  /**
   * Set rootGrid accept value
   */
  rootGridType: {
    type: String as PropType<CodeLayoutGrid>,
    default: 'centerArea',
  },
  /**
   * Show tab header
   */
  showTabHeader: {
    type: Boolean,
    default: true,
  },
})

const panelInstances = new Map<string, CodeLayoutPanelInternal>();
const hosterContext : CodeLayoutPanelHosterContext = {
  panelInstances,
  removePanelInternal,
  childGridActiveChildChanged: onChildGridActiveChildChanged,
  closePanelInternal(panel) {
    new Promise<void>((resolve, reject) => emit('panelClose', panel, resolve, reject))
      .then(() => panel.parentGroup?.removePanel(panel))
      .catch(() => { /*ignore*/ })
  },
}
const rootGrid = ref(new CodeLayoutSplitNGridInternal(hosterContext));
rootGrid.value.size = 100;
rootGrid.value.noAutoShink = true;
rootGrid.value.direction = 'horizontal';
const currentActiveGrid = ref<CodeLayoutSplitNGridInternal|null>(null);

onMounted(() => {
  rootGrid.value.accept = [ props.rootGridType ];
  rootGrid.value.parentGrid = props.rootGridType;
  emit('canLoadLayout', instance);
});
watch(() => props.rootGridType, (v) => {
  rootGrid.value.accept = [ v ];
  rootGrid.value.parentGrid = props.rootGridType;
});

const instance = {
  getGridTreeDebugText: () => {
    let str = '';
    function loop(g: CodeLayoutSplitNGridInternal, intent = 0) {
      str += '\n└';
      for (let i = 0; i < intent; i++)
        str += '─';
      str += `─${g.name} : ${g.size} ${g.direction}`;
      for (const child of g.childGrid) {
        loop(child, intent + 1);
        if (!child.parentGroup)
          str += '\n└───ERROR ▲────';
      }
      for (const child of g.children) {
        str += '\n└';
        for (let i = 0; i < intent + 1; i++)
          str += '─';
        str += `┷─${child.name}`;
      }
    }
    loop(rootGrid.value as CodeLayoutSplitNGridInternal);
    return str;
  },
  getRootGrid: () => rootGrid.value as CodeLayoutSplitNGridInternal,
  getPanelByName: (name) => panelInstances.get(name),
  getActiveGird: () => (currentActiveGrid.value || rootGrid.value) as CodeLayoutSplitNGridInternal,
  getGridByName: (name) => {
    function loop(grid: CodeLayoutSplitNGridInternal, name2: string) : CodeLayoutSplitNGridInternal|undefined {
      for (const iterator of grid.childGrid) {
        if (iterator.name === name2)
          return iterator;
        const a = loop(iterator, name2);
        if (a)
          return a;
      }
    }
    return loop(rootGrid.value as CodeLayoutSplitNGridInternal, name);
  },
  activePanel(name) {
    panelInstances.get(name)?.activeSelf();
  },
  clearLayout() {
    rootGrid.value.childGrid.splice(0);
    rootGrid.value.children.splice(0);
    panelInstances.clear();
  },
  loadLayout(json, instantiatePanelCallback) {
    if (!json)
      return;
    this.clearLayout();

    function loadGrid(grid: any, gridInstance: CodeLayoutSplitNGridInternal) {
      gridInstance.loadFromJson(grid);

      if (grid.childGrid instanceof Array && grid.childGrid.length > 0) {
        for (const childGrid of grid.childGrid) {
          const childGridInstance = new CodeLayoutSplitNGridInternal(hosterContext);
          loadGrid(childGrid, childGridInstance);
          gridInstance.addChildGrid(childGridInstance);
        }
        gridInstance.notifyRelayout()
      } else if (grid.childGrid instanceof Array) {
        for (const childPanel of grid.children) {
          const data = instantiatePanelCallback(childPanel);
          const panel = gridInstance.addPanel(data);
          panel.loadFromJson(childPanel);
        }
      }
    }

    loadGrid(json, rootGrid.value as CodeLayoutSplitNGridInternal);
    rootGrid.value.notifyRelayout();
  },
  saveLayout: () => rootGrid.value.toJson(),
} as CodeLayoutSplitNInstance;

(window as any).instance = instance

const lastActivePanel  = ref<CodeLayoutPanelInternal|null>(null);
const context : CodeLayoutSplitLayoutContext = {
  currentActiveGrid: currentActiveGrid as Ref<CodeLayoutSplitNGridInternal|null>,
  activeGrid(grid) { currentActiveGrid.value = grid; },
  dragDropToPanel,
};

usePanelDraggerRoot();

function onTabActiveChild(old: CodeLayoutPanelInternal, panel: CodeLayoutPanelInternal) {
  if (panel === context.currentActiveGrid.value) {
    emit('panelActive', lastActivePanel.value, panel.activePanel);
    lastActivePanel.value = panel.activePanel;
  }
}

function onChildGridActiveChildChanged(panel: CodeLayoutPanelInternal) {
  if (panel === context.currentActiveGrid.value) {
    emit('panelActive', lastActivePanel.value, panel.activePanel);
    lastActivePanel.value = panel.activePanel;
  }
}

let generatePanelNameCount = 0;

/**
 * 拖放面板操作流程
 * 
 * 1. 获取网格
 * 2. 移除
 *    2.1 目标网格和当前父级网格相同，直接移除而不触发移除收缩
 *    2.2 目标网格和当前父级网格不同，调用 removePanelInternal 触发移除收缩
 * 3. 判断方向
 *    3.1 拖放到网格中或者TAB，则直接插入至网格中指定位置
 *      3.1.2 拖放到TAB末尾，则调整顺序插入至网格末尾
 *    3.2 拖放切割方向与当前网格方向一致
 *      创建新网格包围当前面板
 *      插入至指定位置
 *    3.3 方向不一致，
 *      3.3.1 新建一个网格，方向是相对方向
 *      3.3.2 将面板和当前面板添加至新网格的子级
 * 4. 重新布局计算网格大小
 * 5. 触发旧父级的移除收缩
 * 
 * @param referencePanel 
 * @param referencePosition 
 * @param panel 
 */
function dragDropToPanel(
  referencePanel: CodeLayoutPanelInternal, 
  referencePosition: CodeLayoutDragDropReferencePosition, 
  panel: CodeLayoutPanelInternal, 
  toTab?: boolean | undefined) {

  //1
  let targetGrid : null|CodeLayoutSplitNGridInternal = null;
  if (referencePanel instanceof CodeLayoutSplitNGridInternal)
    targetGrid = referencePanel;
  else if (referencePanel instanceof CodeLayoutSplitNPanelInternal)
    targetGrid = referencePanel.parentGroup as CodeLayoutSplitNGridInternal;
  if (!targetGrid)
    return;

  const oldParent = panel.parentGroup;

  //2
  if (oldParent !== targetGrid || referencePosition !== 'center' || !toTab)
    panel.removeSelf();

  const targetGridParent = targetGrid.parentGroup as CodeLayoutSplitNGridInternal;

  let lateAction: (() => void)|undefined;

  //3
  if (referencePosition === 'center' || toTab) {

    //3.1
    if (!targetGrid.hasChild(panel)) {
      let referencePanelIndex = targetGrid.children.indexOf(referencePanel);
      if (referencePanelIndex === -1)
        referencePanelIndex = targetGrid.children.indexOf(targetGrid.activePanel as CodeLayoutPanelInternal);
      targetGrid.addChild(
        panel, 
        referencePanelIndex + (referencePosition === 'right' || referencePosition === 'down' || referencePosition === 'center' ? 1 : 0)
      );
    } else if (toTab) {
      //3.1.2
      targetGrid.removeChild(panel);
      targetGrid.addChild(panel);
    }
    targetGrid.setActiveChild(panel);
  } else if (targetGridParent && (
    (
      targetGridParent.direction === 'horizontal'
      && (referencePosition === 'left' || referencePosition === 'right')
    )
    || (
      targetGridParent.direction === 'vertical'
      && (referencePosition === 'up' || referencePosition === 'down')
    )
  )) {
    //3.2
    const newGrid = new CodeLayoutSplitNGridInternal(targetGridParent.context);//新面板包围的网格
    Object.assign(newGrid, {
      ...targetGrid,
      direction: targetGrid.direction,
      name: targetGrid.name + Math.floor(Math.random() * 10),
      children: [],
      childGrid: [],
      size: 0,
      noAutoShink: false,
    });
    newGrid.addChild(panel);
    newGrid.setActiveChild(panel);
    targetGridParent.addChildGrid(
      newGrid, 
      targetGridParent.childGrid.indexOf(targetGrid)
        + (referencePosition === 'down' || referencePosition === 'right' ? 1 : 0)
    );
    //重新布局面板
    lateAction = () => {
      targetGridParent.relayoutAllWithNewPanel([ newGrid ], targetGrid!);
    };
  } else {
    //3.3
    const oldParent = targetGrid.parentGroup as CodeLayoutSplitNGridInternal;
    const newGridTop = new CodeLayoutSplitNGridInternal(targetGrid.context);//上级包围的网格
    const newGrid = new CodeLayoutSplitNGridInternal(targetGrid.context);//新面板包围的网格
    Object.assign(newGrid, {
      ...targetGrid,
      direction: targetGrid.direction === 'vertical' ? 'horizontal' : 'vertical',//相对的方向
      name: targetGrid.name + (generatePanelNameCount++),
      children: [],
      childGrid: [],
      size: 0,
      noAutoShink: false,
    });
    Object.assign(newGridTop, {
      ...targetGrid,
      name: targetGrid.name + (generatePanelNameCount++),
      direction: (referencePosition === 'left' || referencePosition === 'right') ? 'horizontal' : 'vertical',
      children: [],
      childGrid: [],
      noAutoShink: false,
    });
    targetGrid.size = 0; //设为0以让后续进行布局
    newGridTop.addChildGrid(targetGrid);
    newGrid.addChild(panel);

    switch (referencePosition) {
      case 'left':
      case 'up':
        newGridTop.addChildGrid(newGrid, 0);
        break;
      case 'right':
      case 'down':
        newGridTop.addChildGrid(newGrid);
        break;
    }

    newGrid.setActiveChild(panel);

    if (targetGrid === rootGrid.value) {
      rootGrid.value = newGridTop;
      rootGrid.value.noAutoShink = true;
    }
    else {
      if (!oldParent)
        throw new Error('oldParent is null');
      oldParent.replaceChildGrid(targetGrid, newGridTop);
    }

    //重新布局面板
    lateAction = () => {
      if (newGridTop.childReplacedBy)
        newGridTop.childReplacedBy.notifyRelayout();
      else
        newGridTop.notifyRelayout();
      newGrid.notifyRelayout();
    };
  }

  //5
  autoShrinkEmptyGrid(oldParent as CodeLayoutSplitNGridInternal, targetGrid);

  nextTick(() => {
    lateAction?.();
  });

  //发出事件
  emit('panelDrop', panel, referencePanel, referencePosition);
}
/**
 * 移除面板操作流程
 * 
 * 1. 从父级网格移除当前面板
 * 2. 检查是否还有其他面板
 *    2.1 如果有，重新选择其他面板激活
 *    2.2 如果没有，并且网格允许收缩，则收缩此网格
 *      2.2.1 移除网格
 *      2.2.2 如果父网格只剩余一个子网格，
 *        则收缩此子网格，将其与父网格替换
 * 
 * @param panel 
 */
function removePanelInternal(panel: CodeLayoutSplitNPanelInternal) {

  const parent = panel.parentGroup as CodeLayoutSplitNGridInternal;
  if (!parent)
    return undefined;

  //1
  parent.removeChild(panel);

  //2.1
  if (parent.children.length > 0) {
    parent.reselectActiveChild();
    return undefined;
  }

  //2.2

  if (parent.noAutoShink || !parent.parentGroup)
    return undefined;

  //2.2.2
  autoShrinkEmptyGrid(parent);
  return undefined;
}

/**
 * 自动收缩空网格
 * @param grid 
 */
function autoShrinkEmptyGrid(grid: CodeLayoutSplitNGridInternal, dropGrid: CodeLayoutSplitNGridInternal|undefined = undefined) {
  if (!grid.parentGroup || grid.noAutoShink || grid.children.length > 0)
    return;

  const parent = grid.parentGroup as CodeLayoutSplitNGridInternal;
  const dropGridIsBorther = dropGrid && dropGrid.parentGroup === grid.parentGroup;
  parent.removeChildGrid(grid);
  //删除网格后，将其大小加到兄弟网格上
  if (dropGrid && dropGridIsBorther)
    dropGrid.size += grid.size;
  else if (parent.childGrid.length > 0)
    parent.childGrid[0].size += grid.size;

  //如果父级网格只剩下一个子网格，则将其与父级网格替换
  if (parent.childGrid.length == 1)
    parent.moveChildGridToSelf(parent.childGrid[0]);
  
  //如果父级网格没有子网格了，继续收缩
  if (parent.children.length == 0 && parent.childGrid.length == 0)
    autoShrinkEmptyGrid(parent);
}

provide('splitLayoutContext', context);
defineExpose(instance);

</script>
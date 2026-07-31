<template>
  <div class="code-layout-split-root">
    <CodeLayoutRootEmpty v-if="!rootGrid" />
    <SplitNest v-else :grid="(rootGrid as CodeLayoutSplitNGridInternal)" v-bind="$attrs">
      <template #grid="{ grid }">
        <slot v-if="showTabHeader" name="tabRender" :grid="grid">
          <SplitTab 
            :grid="grid"
            @tabItemContextMenu="(a, b) => emit('panelContextMenu', a, b)"
            @tabActive="onTabActiveChild"
          >    
            <template v-for="(_, name) in $slots" #[name]="slotData">
              <slot :name v-bind="slotData || {}"></slot>
            </template>
          </SplitTab>
        </slot>
        <slot v-else name="gridRender" :grid="grid" />
      </template>
    </SplitNest>
  </div>
</template>

<script setup lang="ts">
import { ref, provide, type Ref, type PropType, nextTick, computed, watch } from 'vue';
import { type CodeLayoutPanelInternal, type CodeLayoutDragDropReferencePosition, type CodeLayoutConfig, defaultCodeLayoutConfig, type CodeLayoutRootRefDefine } from '../CodeLayout';
import { CodeLayoutSplitNGridInternal, type CodeLayoutSplitLayoutContext, type CodeLayoutSplitNInstance, CodeLayoutSplitNPanelInternal, defaultSplitLayoutConfig, type CodeLayoutSplitNConfig, CodeLayoutSplitNRootGrid, cloneGridStyle, generateSplitGridName } from './SplitN';
import SplitNest from './SplitNest.vue';
import SplitTab from './SplitTab.vue';
import { FLAG_SPLIT_LAYOUT, usePanelDraggerRoot } from '../Composeable/DragDrop';
import { useKeyBoardControllerTop } from '../Composeable/KeyBoardController';
import CodeLayoutRootEmpty from '../CodeLayoutRootEmpty.vue';

const emit = defineEmits([ 
  'panelClose', 
  'panelContextMenu',
  'panelActive',
  'panelDrop',
  'gridActive',
  'update:layoutData'
]);
const props = defineProps({
  /**
   * Whether to display Tab components. When it is `true`, it supports multiple sub panels in one grid, and the components should be rendered in the tabContentRender slot; When it is `false`, only grid segmentation is supported and panel and drag functions are not supported. You should render the content yourself in gridRender.
   */
  showTabHeader: {
    type: Boolean,
    default: true,
  },
  /**
   * Base layout config
   */
  layoutConfig: {
    type: Object as PropType<CodeLayoutSplitNConfig>,
    default: () => defaultSplitLayoutConfig
  },
  /**
   * Layout data
   */
  layoutData: {
    type: Object as PropType<CodeLayoutSplitNRootGrid>,
    default: null
  },
})

const hosterContext : CodeLayoutRootRefDefine = {
  getRef: () => instance,
  removePanelInternal,
  childGridActiveChildChanged: (panel) => onChildGridActiveChildChanged(panel as CodeLayoutSplitNGridInternal),
  closePanelInternal: (panel) => onPanelClose(panel as CodeLayoutSplitNPanelInternal),
}
//根网格初始化带副作用（setRoot / 写 noAutoShink / 写 accept），
//放在 computed 里每次重算都会执行（写 accept 还会自我失效一次），
//因此改为在 layoutData 变化时用 watch 执行一次。
watch(() => props.layoutData, (layoutData) => {
  if (!layoutData)
    return;
  layoutData.root.setRoot(hosterContext);
  layoutData.noAutoShink = true;
  if (!layoutData.accept)
    layoutData.accept = [ layoutData.parentGrid ];
}, { immediate: true });
const rootGrid = computed(() => props.layoutData ?? null);
const currentActiveGrid = ref<CodeLayoutSplitNGridInternal|null>(null);

const instance = {
  getGridTreeDebugText: () => {
    let str = '';
    function loop(g: CodeLayoutSplitNGridInternal, intent = 0) {
      str += '\n└';
      for (let i = 0; i < intent; i++)
        str += '─';
      str += `─${g.name} : ${g.size.toFixed(2)} ${g.direction}`;
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
  getPanelByName: (name) => props.layoutData._root?.getPanelByName(name),
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
    const panel = props.layoutData.root.getPanelByName(name);
    if (!panel) {
      console.warn(`Panel ${name} not found`);
      return;
    }
    panel.activeSelf();
  },
  clearLayout: () => props.layoutData.clearLayout(),
  loadLayout: (json, instantiatePanelCallback) => props.layoutData.loadLayout(json, instantiatePanelCallback),
  saveLayout: () => props.layoutData.saveLayout(),
} as CodeLayoutSplitNInstance;

const lastActivePanel  = ref<CodeLayoutPanelInternal|null>(null);
const context : CodeLayoutSplitLayoutContext = {
  currentActiveGrid: currentActiveGrid as Ref<CodeLayoutSplitNGridInternal|null>,
  getRef: () => instance,
  activeGrid(grid) { 
    const old = currentActiveGrid.value;
    if (old != grid) {
      currentActiveGrid.value = grid;
      context.currentActiveGrid.value = grid;
      emit('gridActive', old, grid)
    }
  },
  dragDropToPanel,
  dragDropNonPanel(e, isDrop, sourcePosition, reference, referencePosition) {
    if (isDrop) {
      props.layoutConfig.onNonPanelDrop?.(e, sourcePosition, reference, referencePosition);
      return false;
    } else {
      return props.layoutConfig.onNonPanelDrag?.(e, sourcePosition) ?? false;
    }
  },
};

usePanelDraggerRoot(FLAG_SPLIT_LAYOUT);
useKeyBoardControllerTop();

function onTabActiveChild(old: CodeLayoutSplitNPanelInternal, panel: CodeLayoutSplitNPanelInternal) {
  const parent = panel.parentGroup as CodeLayoutSplitNGridInternal;
  const oldGrid = currentActiveGrid.value;
  if (oldGrid != parent) {
    context.currentActiveGrid.value = parent;
    parent.onActive?.(parent);
    emit('gridActive', oldGrid, parent)
  }
}

function onPanelClose(panel: CodeLayoutSplitNPanelInternal) {
  return new Promise<void>((resolve, reject) => emit('panelClose', panel, resolve, reject))
      .then(() => {
        panel.parentGroup?.removePanel(panel);
        panel.onClose?.(panel);
      })
      .catch(() => { /*ignore*/ })
}

function onChildGridActiveChildChanged(grid: CodeLayoutSplitNGridInternal) {
  if (context.currentActiveGrid.value === grid) {
    emit('panelActive', lastActivePanel.value, grid.activePanel);
    lastActivePanel.value = grid.activePanel;
  } 
}

/**
 * 拖放面板操作流程
 * 
 * 1. 获取网格
 *    1.1 如果拖拽只有一个网格，目标网格和当前父级网格相同，
 *        且父级网格只有当前面板，则直接返回不做操作
 * 2. 移除
 *    只从原父级移除，绝不在此处触发收缩。
 *    收缩会改动树结构（autoShrinkEmptyGrid → moveChildGridToSelf），
 *    有可能把还没插入面板的 targetGrid 直接从树上摘掉，
 *    导致后续插入进了一个脱树网格、面板凭空消失。
 *    收缩统一延后到步骤 5。
 * 3. 判断方向
 *    3.1 拖放到网格中或者TAB
 *      3.1.1 按落点位置插入至网格中指定位置
 *      3.1.2 拖放到TAB条空白处（参照物是网格自身），则插入至网格末尾
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
  panels: CodeLayoutPanelInternal[], 
  toTab?: boolean | undefined) {

  //0
  if (!panels || panels.length === 0)
    return;
  const parent = panels[0].parentGroup;
  for (const iterator of panels) {
    if (iterator.parentGroup != parent)
      throw new Error('Drop a set of panel that must be in the same parent!');
  }

  let lateAction: (() => void)|undefined;

  
  //1
  let targetGrid : null|CodeLayoutSplitNGridInternal = null;
  if (referencePanel instanceof CodeLayoutSplitNGridInternal)
    targetGrid = referencePanel;
  else if (referencePanel instanceof CodeLayoutSplitNPanelInternal)
    targetGrid = referencePanel.parentGroup as CodeLayoutSplitNGridInternal;
  if (!targetGrid)
    return;

  const oldParents = new Set<CodeLayoutSplitNGridInternal>();

  //1.1
  if (panels.length === 1) {
    const oldParent = panels[0].parentGroup;
    if (targetGrid === oldParent && oldParent.children.length === 1) {
      return;
    }
  }

  //2
  //一律使用不收缩的 removeSelf()，收缩延后到步骤 5 面板插入完成之后。
  for (const panel of panels) {
    const oldParent = panel.parentGroup;
    oldParents.add(oldParent as CodeLayoutSplitNGridInternal);
    panel.removeSelf();
  }

  const targetGridParent = targetGrid.parentGroup as CodeLayoutSplitNGridInternal;

  //3
  if (referencePosition === 'center' || toTab) {

    //3.1
    //参照物是网格自身时（拖到 TAB 条空白处 / 网格中央），无落点可言，插入末尾；
    //参照物是某个面板时（拖到某个 TAB 上），按落点在该面板之前/之后插入。
    //注意：toTab 只表示“不要切分”，不代表忽略落点位置。
    const referencePanelIndex = targetGrid.children.indexOf(referencePanel);
    if (referencePanelIndex === -1) {
      //3.1.2
      targetGrid.addChilds(panels);
    } else {
      targetGrid.addChilds(
        panels,
        referencePanelIndex + (
          referencePosition === 'right' || referencePosition === 'down' || referencePosition === 'center'
            ? 1 : 0
        )
      );
    }
    targetGrid.setActiveChild(panels[0]);
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
    const newGrid = cloneGridStyle(new CodeLayoutSplitNGridInternal(), targetGrid);//新面板包围的网格
    newGrid.direction = targetGrid.direction;
    newGrid.name = generateSplitGridName(targetGrid.name);
    newGrid.size = 0;
    newGrid.noAutoShink = false;
    newGrid.addChilds(panels);
    newGrid.setActiveChild(panels[0]);
    targetGridParent.addChildGrid(
      newGrid, 
      targetGridParent.childGrid.indexOf(targetGrid)
        + (referencePosition === 'down' || referencePosition === 'right' ? 1 : 0)
    );
    //重新布局面板
    lateAction = () => {
      targetGridParent.relayoutAllWithNewPanel([ newGrid ], targetGrid!);
    };
  } else if (targetGrid === rootGrid.value) {
    //3.3.a 目标网格就是根网格（根网格直接挂着面板的情况）
    //根网格必须保持同一个实例（它是 CodeLayoutSplitNRootGrid，
    //承载 clearLayout/loadLayout/saveLayout 等接口，且外部未必监听
    //update:layoutData），所以这里原地重构：把根网格现有面板移入一个新建
    //兄弟网格，再把兄弟网格与新网格一起挂到根网格下。
    const newGrid = cloneGridStyle(new CodeLayoutSplitNGridInternal(), targetGrid);//新面板包围的网格
    const siblingGrid = cloneGridStyle(new CodeLayoutSplitNGridInternal(), targetGrid);//原有面板包围的网格
    for (const grid of [ newGrid, siblingGrid ]) {
      grid.direction = targetGrid.direction;
      grid.name = generateSplitGridName(targetGrid.name);
      grid.size = 0;
      grid.noAutoShink = false;
    }

    const oldChildren = targetGrid.children.slice();
    const oldActivePanel = targetGrid.activePanel;
    targetGrid.children.splice(0);
    targetGrid.activePanel = null;
    siblingGrid.addChilds(oldChildren);
    //沿用原本激活的面板，避免切分后激活项莫名跳到第一个
    siblingGrid.setActiveChild(
      oldActivePanel && oldChildren.includes(oldActivePanel) ? oldActivePanel : (oldChildren[0] ?? null)
    );
    newGrid.addChilds(panels);
    newGrid.setActiveChild(panels[0]);

    targetGrid.direction = (referencePosition === 'left' || referencePosition === 'right')
      ? 'horizontal' : 'vertical';
    if (referencePosition === 'left' || referencePosition === 'up') {
      targetGrid.addChildGrid(newGrid);
      targetGrid.addChildGrid(siblingGrid);
    } else {
      targetGrid.addChildGrid(siblingGrid);
      targetGrid.addChildGrid(newGrid);
    }

    //重新布局面板
    lateAction = () => {
      targetGrid!.notifyRelayout();
      newGrid.notifyRelayout();
      siblingGrid.notifyRelayout();
    };
  } else {
    //3.3.b
    const oldTargetGridParent = targetGrid.parentGroup as CodeLayoutSplitNGridInternal;
    if (!oldTargetGridParent)
      throw new Error('oldTargetGridParent is null');
    const newGridTop = cloneGridStyle(new CodeLayoutSplitNGridInternal(), targetGrid);//上级包围的网格
    const newGrid = cloneGridStyle(new CodeLayoutSplitNGridInternal(), targetGrid);//新面板包围的网格
    newGrid.direction = targetGrid.direction === 'vertical' ? 'horizontal' : 'vertical';//相对的方向
    newGrid.name = generateSplitGridName(targetGrid.name);
    newGrid.size = 0;
    newGrid.noAutoShink = false;
    newGridTop.name = generateSplitGridName(targetGrid.name);
    newGridTop.direction = (referencePosition === 'left' || referencePosition === 'right')
      ? 'horizontal' : 'vertical';
    newGridTop.size = targetGrid.size;
    newGridTop.noAutoShink = false;
    targetGrid.size = 0; //设为0以让后续进行布局
    newGridTop.addChildGrid(targetGrid);
    newGrid.addChilds(panels);

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

    newGrid.setActiveChild(panels[0]);

    oldTargetGridParent.replaceChildGrid(targetGrid, newGridTop);

    //重新布局面板
    //newGridTop 有可能在步骤 5 的收缩中被 moveChildGridToSelf 吸收掉，
    //此时真正承载布局的是 childReplacedBy 指向的网格。
    lateAction = () => {
      if (newGridTop.childReplacedBy)
        newGridTop.childReplacedBy.notifyRelayout();
      else
        newGridTop.notifyRelayout();
      newGrid.notifyRelayout();
    };
  }

  //5
  //面板已插入完毕，此时才收缩腾空的旧父级。
  for (const oldParent of oldParents)
    autoShrinkEmptyGrid(oldParent as CodeLayoutSplitNGridInternal, targetGrid);

  nextTick(() => {
    lateAction?.();
  });

  //发出事件
  //panels 可能是 DragDrop 模块级共享数组，dragend 时会被清空，
  //这里传副本，避免外部异步持有后拿到空数组。
  emit('panelDrop', panels.slice(), referencePanel, referencePosition);
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
  //removeChild 内部在删除的是激活面板时已会 reselectActiveChild
  parent.removeChild(panel);

  //2.1
  if (parent.children.length > 0)
    return undefined;

  //2.2 / 2.2.2 是否可收缩由 autoShrinkEmptyGrid 内部统一判断
  autoShrinkEmptyGrid(parent);
  return undefined;
}

/**
 * 自动收缩空网格
 * @param grid 
 */
function autoShrinkEmptyGrid(grid: CodeLayoutSplitNGridInternal, dropGrid: CodeLayoutSplitNGridInternal|undefined = undefined) {
  //childGrid 也要判：一个还挂着子网格的网格即使没有直接面板，也不能删，
  //否则会连同整棵子树一起丢掉。
  if (!grid.parentGroup || grid.noAutoShink || grid.children.length > 0 || grid.childGrid.length > 0)
    return;

  const parent = grid.parentGroup as CodeLayoutSplitNGridInternal;
  const shrinkSize = grid.size;
  //记录相邻兄弟，用于在没有 dropGrid 时把腾出的空间就近归还
  const indexInParent = parent.childGrid.indexOf(grid);
  const neighbor = parent.childGrid[indexInParent + 1] ?? parent.childGrid[indexInParent - 1];
  const dropGridIsBorther = dropGrid && dropGrid !== grid && dropGrid.parentGroup === parent;
  parent.removeChildGrid(grid);
  //删除网格后，将其大小加到兄弟网格上
  if (dropGridIsBorther)
    dropGrid!.size += shrinkSize;
  else if (neighbor && neighbor.parentGroup === parent)
    neighbor.size += shrinkSize;
  else if (parent.childGrid.length > 0)
    parent.childGrid[0].size += shrinkSize;

  //如果父级网格只剩下一个子网格，则将其与父级网格替换
  if (parent.childGrid.length === 1)
    parent.moveChildGridToSelf(parent.childGrid[0]);
  
  //如果父级网格没有子网格了，继续收缩
  if (parent.children.length === 0 && parent.childGrid.length === 0)
    autoShrinkEmptyGrid(parent);
}

provide('splitLayoutContext', context);
defineExpose(instance);

</script>
<template>
  <CodeLayoutBase 
    ref="codeLayoutBase"
    :config="layoutConfig"
    :primary="panels.primary"
    :secondary="panels.secondary"
    :bottom="panels.bottom"
    @layoutChange="emit('baseLayoutChange')"
  >
    <template #titleBarBottom>
      <slot name="titleBarBottom" />
    </template>
    <template #titleBarTop> 
      <slot name="titleBarTop" />
    </template>
    <template #titleBarIcon>
      <slot name="titleBarIcon" />
    </template>
    <template #titleBarMenu>
      <slot name="titleBarMenu">
        <MenuBar :options="mainMenuConfigWithCollapseState" />
      </slot>
    </template>
    <template #titleBarCenter>
      <slot name="titleBarCenter" />
    </template>
    <template #titleBarRight>
      <CodeLayoutCustomizeLayout 
        v-if="layoutConfig.titleBarShowCustomizeLayout"
      />
      <slot name="titleBarRight" />
    </template>
    <template #activityBar>
      <div class="top">
        <slot name="activityBarTop" />
        <!--no menu bar here show collapsed menu button-->
        <slot v-if="!layoutConfig.menuBar" name="activityBarTopMenuBar">
          <MenuBar :options="mainMenuConfigWithCollapseState" />
        </slot>
        <!--main activityBar items-->
        <CodeLayoutActivityBar
          ref="activityBarGroup" 
          :primary="panels.primary"
          :primarySideBar="layoutConfig.primarySideBar"
          :direction="layoutConfig.primarySideBarPosition"
          @activityBarAcitve="onActivityBarAcitve"
        />
        <slot name="activityBarEnd" />
      </div>
      <div class="bottom">
        <slot name="activityBarBottom" />
      </div>
    </template>
    <template #activityBarSecondary>
      <div class="top">
        <slot name="activityBarSecondaryTop" />
        <!--no menu bar here show collapsed menu button-->
        <slot v-if="!layoutConfig.menuBar" name="activityBarSecondaryTopMenuBar">
          <MenuBar :options="mainMenuConfigWithCollapseState" />
        </slot>
        <!--main activityBar items-->
        <CodeLayoutActivityBar
          ref="activityBarGroup" 
          :primary="panels.secondary"
          :primarySideBar="layoutConfig.secondarySideBar"
          :direction="layoutConfig.primarySideBarPosition == 'left' ? 'right' : 'left'"
          @activityBarAcitve="onActivityBarAcitve2"
        />
        <slot name="activityBarSecondaryEnd" />
      </div>
      <div class="bottom">
        <slot name="activityBarSecondaryBottom" />
      </div>
    </template>
    <template #primarySideBar>
      <CodeLayoutGroupRender
        ref="primarySideBarGroup"
        :group="panels.primary"
        :horizontal="false"
      >
        <template v-for="(_, name) in $slots" #[name]="data">
          <slot :name="name" v-bind="data" />
        </template>
        <template #emptyTabRender>
          <CodeLayoutEmpty :panel="panels.primary" grid="primarySideBar">
            <slot name="emptyGroup" :panel="panels.primary" grid="primarySideBar">{{ emptyText }}</slot>
          </CodeLayoutEmpty>
        </template>
      </CodeLayoutGroupRender>
    </template>
    <template #secondarySideBar>
      <CodeLayoutGroupRender
        ref="secondarySideBarGroup"
        :group="panels.secondary"
        :horizontal="false"
      >
        <template v-for="(_, name) in $slots" #[name]="data">
          <slot :name="name" v-bind="data" />
        </template>
        <template #emptyTabRender>
          <CodeLayoutEmpty :panel="panels.secondary" grid="secondarySideBar">
            <slot name="emptyGroup" :panel="panels.secondary" grid="secondarySideBar">{{ emptyText }}</slot>
          </CodeLayoutEmpty>
        </template>
      </CodeLayoutGroupRender>
    </template>
    <template #bottomPanel>
      <CodeLayoutGroupRender
        ref="bottomPanelGroup"
        :group="panels.bottom"
        :horizontal="true"
      >
        <template v-for="(_, name) in $slots" #[name]="data">
          <slot :name="name" v-bind="data" />
        </template>
        <template #emptyTabRender>
          <CodeLayoutEmpty grid="bottomPanel">
            <slot name="emptyGroup" :panel="panels.bottom" grid="bottomPanel">{{ emptyText }}</slot>
          </CodeLayoutEmpty>
        </template>
      </CodeLayoutGroupRender>
    </template>
    <template #centerArea>
      <slot name="centerArea" />
    </template>
    <template #statusBar>
      <slot name="statusBar" />
    </template>
    <template #statusBarLeft>
      <slot name="statusBarLeft" />
    </template>
    <template #statusBarRight>
      <slot name="statusBarRight" />
    </template>
  </CodeLayoutBase>
</template>

<script setup lang="ts">
import { ref, type Ref, type PropType, onMounted, provide, onBeforeUnmount, toRefs, computed, watch, nextTick, reactive } from 'vue';
import { CodeLayoutPanelInternal, type CodeLayoutConfig, type CodeLayoutContext, type CodeLayoutGrid, type CodeLayoutInstance, CodeLayoutGridInternal, type CodeLayoutDragDropReferencePosition, type CodeLayoutLangConfig, defaultCodeLayoutConfig } from './CodeLayout';
import CodeLayoutBase, { type CodeLayoutBaseInstance } from './CodeLayoutBase.vue';
import CodeLayoutGroupRender from './CodeLayoutGroupRender.vue';
import CodeLayoutEmpty from './CodeLayoutEmpty.vue';
import CodeLayoutCustomizeLayout from './Components/CodeLayoutCustomizeLayout.vue';
import { MenuBar, type MenuOptions, type MenuBarOptions } from '@imengyu/vue3-context-menu';
import { FLAG_CODE_LAYOUT, usePanelDraggerRoot } from './Composeable/DragDrop';
import type { CodeLayoutDragDropReferenceAreaType, CodeLayoutPanel, CodeLayoutPanelHosterContext } from './CodeLayout';
import CodeLayoutActivityBar from './CodeLayoutActivityBar.vue';
import { CodeLayoutSplitNGridInternal } from './SplitLayout/SplitN';
import { useKeyBoardControllerTop } from './Composeable/KeyBoardController';

const codeLayoutBase = ref<CodeLayoutBaseInstance>();
const primarySideBarGroup = ref();
const bottomPanelGroup = ref();
const secondarySideBarGroup = ref();
const activityBarGroup = ref();

const emit = defineEmits([	
  'canLoadLayout',
  'canSaveLayout',
  'baseLayoutChange'
]);
const props = defineProps({
  /**
   * Base layout config
   */
  layoutConfig: {
    type: Object as PropType<CodeLayoutConfig>,
    default: () => defaultCodeLayoutConfig
  },
  /**
   * Language config
   */
  langConfig: {
    type: Object as PropType<CodeLayoutLangConfig>,
    default: () => ({
      lang: 'en',
    }),
  },
  /**
   * Main menu (in top left) config
   */
  mainMenuConfig: {
    type: Object as PropType<MenuOptions>,
    default: null,
  },
  /**
   * The empty text when no panel in the group
   */
  emptyText: {
    type: String,
    default: "Drag a view here to display",
  },
  /**
   * Should the canSaveLayout event be triggered when window. beforeupload
   */
  saveBeforeUnload: {
    type: Boolean,
    default: true,
  },
});
const { layoutConfig } = toRefs(props);
const panelInstances = new Map<string, CodeLayoutPanelInternal>();
const hosterContext : CodeLayoutPanelHosterContext = {
  panelInstances,
  getRef: () => codeLayoutInstance,
  removePanelInternal,
  childGridActiveChildChanged() {},
  closePanelInternal() {}
}

const panels = ref({
  primary: new CodeLayoutSplitNGridInternal(hosterContext, 'primarySideBar', 'hidden', 
  (open) => {
    const _layoutConfig = props.layoutConfig;
    _layoutConfig.primarySideBar = open;
  },
  () => {
    primarySideBarGroup.value.forceUpdate();
    activityBarGroup.value.forceUpdate();
  }),
  secondary: new CodeLayoutSplitNGridInternal(hosterContext,'secondarySideBar', 'icon', 
  (open) => {
    const _layoutConfig = props.layoutConfig;
    _layoutConfig.secondarySideBar = open;
  },
  () => {
    secondarySideBarGroup.value.forceUpdate();
  }),
  bottom: new CodeLayoutSplitNGridInternal(hosterContext,'bottomPanel', 'text', 
  (open) => {
    const _layoutConfig = props.layoutConfig;
    _layoutConfig.bottomPanel = open;
  },
  () => {
    bottomPanelGroup.value.forceUpdate();
  }),
}) as Ref<{
  primary: CodeLayoutSplitNGridInternal,
  secondary: CodeLayoutSplitNGridInternal,
  bottom: CodeLayoutSplitNGridInternal,
}>;

//设置默认的面板拖拽允许
const defaultAccept : CodeLayoutGrid[] = [ 'bottomPanel', 'primarySideBar','secondarySideBar' ];
panels.value.bottom.accept = defaultAccept;
panels.value.primary.accept = defaultAccept;
panels.value.secondary.accept = defaultAccept;

//activity bar 位置根据设置进行切换
function loadActivityBarPosition() {
  switch (layoutConfig.value.activityBarPosition) {
    case 'side':
    case 'hidden':
      panels.value.primary.tabStyle = 'hidden';
      break;
    case 'top':
      panels.value.primary.tabStyle = layoutConfig.value.activityBar ? 'icon' : 'hidden';
      break;
    case 'bottom':
      panels.value.primary.tabStyle = layoutConfig.value.activityBar ? 'icon-bottom' : 'hidden';
      break;
  }
  if (layoutConfig.value.secondarySideBarAsActivityBar)
  {
    switch (layoutConfig.value.secondaryActivityBarPosition) {
      case 'side':
      case 'hidden':
        panels.value.secondary.tabStyle = 'hidden';
        break;
      case 'top':
        panels.value.secondary.tabStyle = 'icon';
        break;
      case 'bottom':
        panels.value.secondary.tabStyle = 'icon-bottom';
        break;
    }
  }
  else {
    switch (layoutConfig.value.activityBarPosition) {
      case 'side':
        panels.value.secondary.tabStyle = 'icon';
        break;
      case 'hidden':
        panels.value.secondary.tabStyle = 'hidden';
        break;
      case 'top':
        panels.value.secondary.tabStyle = layoutConfig.value.activityBar ? 'icon' : 'hidden';
        break;
      case 'bottom':
        panels.value.secondary.tabStyle = layoutConfig.value.activityBar ? 'icon-bottom' : 'hidden';
        break;
    }
  }
}

watch(() => layoutConfig.value.secondarySideBarAsActivityBar, loadActivityBarPosition);
watch(() => layoutConfig.value.secondaryActivityBarPosition, loadActivityBarPosition);
watch(() => layoutConfig.value.activityBarPosition, loadActivityBarPosition);
watch(() => layoutConfig.value.activityBar, loadActivityBarPosition);

//菜单配置
const mainMenuConfigWithCollapseState = computed<MenuBarOptions>(() => {
  return {
    theme: 'code-layout',
    mini: !props.layoutConfig.menuBar,
    barPopDirection: props.layoutConfig.menuBar ? 'bl' : 'tr',
    ...props.mainMenuConfig,
  }
})

//示例接口和上下文接口
const codeLayoutInstance : CodeLayoutInstance = {
  addGroup,
  removeGroup,
  relayoutAll,
  relayoutGroup,
  getRootGrid,
  getPanelByName,
  clearLayout,
  loadLayout,
  saveLayout,
};
const codeLayoutContext : CodeLayoutContext = {
  dragDropToGrid,
  dragDropToPanelNear,
  dragDropNonPanel(e, isDrop, sourcePosition, reference, referencePosition) {
    if (isDrop) {
      props.layoutConfig.onNonPanelDrop?.(e, sourcePosition, reference, referencePosition);
      return false;
    } else {
      return props.layoutConfig.onNonPanelDrag?.(e, sourcePosition) ?? false;
    }
  },
  relayoutTopGridProp(grid, visible) {
    const _layoutConfig = props.layoutConfig;
    switch (grid) {
      case 'primarySideBar': _layoutConfig.primarySideBar = visible; break;
      case 'secondarySideBar': _layoutConfig.secondarySideBar = visible; break;
      case 'bottomPanel': _layoutConfig.bottomPanel = visible; break;
    }
  },
  instance: codeLayoutInstance,
};

/**
 * 拖放处理主函数: 拖放至基础网格根节点
 * @param grid 目标网格
 * @param panel 拖拽面板
 * 
  0. 如果目标网格已存在当前面板，则无需再处理
  1. 从旧的父级移除面板，刷新旧父级
  2. 向目标网格添加面板
 */
function dragDropToGrid(grid: CodeLayoutGrid, panel: CodeLayoutPanelInternal) {

  const gridInstance = getRootGrid(grid);
  if (gridInstance.hasChild(panel))
    return;

  const userCancel = layoutConfig.value.onDropToGrid?.(panel, grid) ?? false;
  if (userCancel)
    return;

  const parent = panel.parentGroup;
  if (parent)
    removePanelInternal(panel);

  panel.parentGrid = grid;

  if (!props.layoutConfig.onGridFirstDrop) {
    gridInstance.addChild(panel);
    return;
  }

  const presolve = props.layoutConfig.onGridFirstDrop(grid, panel);
  if (presolve)
    gridInstance.addChild(presolve ?? panel);
}

/**
 * 拖放处理主函数: 拖拽至面板上
 * @param reference 参考面板
 * @param referencePosition 拖放面板相对于参考面板的位置
 * @param panel 拖放面板
 * @param dropToTabHeader 是否是拖放至TAB头上
 * 
 * 0. 原父级和目标父级一致 且 两个的父级容器都不是tab 
 *    》不移除/调整顺序 
 *    》直接返回
 * 1. 原父级目标父级不一致 》移除
 * 2. 放置面板 》
 *    2.1 TAB头 》在TAB中添加子页
 *      2.1.1 TAB页自己 》在TAB中添加子页
 *    2.2 侧边栏(顶级) 》在侧边栏中添加子页
 *    2.3 组内
 *      2.3.1 》单一 》分隔当前组：
 *          新加一个空容器（拷贝自原组）
 *          当前组和新页作为此组的子级，
 *          新组替换当前组
 *      2.3.2 》多个 》在组中添加子页
 *    2.4 空板 》成为空板的子级 (dragDropToGrid)
 */
function dragDropToPanelNear(
  reference: CodeLayoutPanelInternal,
  referencePosition: CodeLayoutDragDropReferencePosition, 
  panel: CodeLayoutPanelInternal, 
  dropTo: CodeLayoutDragDropReferenceAreaType
) {
  const userCancel = layoutConfig.value.onDropToPanel?.(reference, referencePosition, panel, dropTo) ?? false;
  if (userCancel)
    return;

  const dropToTabHeader = dropTo === 'tab-header';
  const dropToActiviyBar = dropTo === 'activiy-bar';
  const dropToEmpty = dropTo === 'empty';
  const oldParent = panel.parentGroup;

  if (reference === panel)
    throw new Error('Can not drop to self, panel : ' + panel.name);

  //0.1 原父级和目标父级一致(普通容器)
  if (
    oldParent && oldParent === reference.parentGroup
    && !oldParent.getIsTabContainer() && !reference.parentGroup.getIsTabContainer()
  ) {
    oldParent.removeChild(panel);
    oldParent.addChild(panel, reference.getIndexInParent() + (referencePosition === 'right' || referencePosition === 'down' ? 1 : 0))
    oldParent.setActiveChild(panel);
    return;
  }
  //0.2 原父级和目标父级一致(顶级容器)
  if (!oldParent && !reference.parentGroup && reference.parentGrid === panel.parentGrid && dropToTabHeader) {
    const parentGrid = getRootGrid(panel.parentGrid);
    parentGrid.removeChild(panel);
    parentGrid.addChild(panel, reference.getIndexInParent() + (referencePosition === 'right' || referencePosition === 'down' ? 1 : 0))
    parentGrid.setActiveChild(panel);
    return;
  }

  //1. 原父级目标父级不一致 》移除
  removePanelInternal(panel);

  //2. 放置面板
  panel.open = true;

  //2.1 TAB头 》在TAB中添加子页
  if (reference.parentGroup?.getIsTabContainer() && dropToTabHeader) {
    reference.parentGroup.addChild(panel, reference.getIndexInParent() + (referencePosition === 'right' || referencePosition === 'down' ? 1 : 0))
    reference.parentGroup.notifyRelayout();
    reference.parentGroup.setActiveChild(panel);
    panel.size = 0;
    panel.notifyRelayout();
    return;
  }
  //2.1.1 TAB页自己 》在TAB中添加子页
  if (reference.getIsTabContainer()) {
    reference.addChild(panel);
    reference.notifyRelayout();
    reference.setActiveChild(panel);
    panel.size = 0;
    panel.notifyRelayout();
    return;
  }

  //2.2 侧边栏(顶级) 》在侧边栏中添加子页
  if (reference.getIsTopGroup() && dropToEmpty) {
    const grid = getRootGrid(reference.parentGrid);
    grid.addChild(panel);
    panel.notifyRelayout();

    //侧边栏拖拽后自动激活
    if (reference.parentGrid === 'primarySideBar')
      grid.setActiveChild(panel);
    return;
  }

  const newParent = reference.getParent();
  if (!newParent) {
    //2.4 空板 》成为空板的子级 (dragDropToGrid)
    return dragDropToGrid(reference.parentGrid, panel);
  }

  const flatChildren = panel.getFlatternChildOrSelf();

  //2.3 组内
  if (
    (!dropToActiviyBar && newParent.children.length === 1)
    //当拖拽至只有一个子级的TAB页上时，reference 就是需要分割的面板
    || (!dropToTabHeader && newParent instanceof CodeLayoutPanelInternal && newParent.getIsTabContainer())
    //当拖拽至只有一个子级的顶级页上时，reference 就是需要分割的面板
    || (!dropToActiviyBar && newParent instanceof CodeLayoutGridInternal)  
  ) {
    //2.3.1

    const newGroup = new CodeLayoutPanelInternal(hosterContext);
    Object.assign(newGroup, {
      ...reference,
      name: reference.name + '.clone' + Math.floor(Math.random() * 10),
      children: []
    });
    reference.open = true;
    newGroup.addChild(reference);
    panelInstances.set(newGroup.name, newGroup);

    switch (referencePosition) {
      case 'left':
      case 'up':
        newGroup.addChilds(flatChildren, 0);
        break;
      case 'right':
      case 'down':
        newGroup.addChilds(flatChildren);
        break;
    }

    //替换至当前级
    newParent.replaceChild(reference, newGroup);
    newParent.setActiveChild(newGroup);

    for (const child of newGroup.children) {
      child.size = 0;
      child.open = true;
      child.notifyRelayout();
    }

    //重新布局面板
    newGroup.notifyRelayout();
  }
  else {
    //2.3.2

    //插入至指定位置并且重新布局
    const insetIndex = newParent.children.indexOf(reference);
    switch (referencePosition) {
      case 'left':
      case 'up':
        newParent.addChilds(flatChildren, insetIndex);
        break;
      case 'right':
      case 'down':
        newParent.addChilds(flatChildren, insetIndex + 1);
        break;
    }

    //强制将当前面板大小归零，以让容器重新分配大小
    for (const flatPanel of flatChildren)
      flatPanel.size = 0;

    if (!dropToTabHeader) {
      //不是拖拽到TAB上，新插入面板，现在要重新调整其中的大小
      if (newParent instanceof CodeLayoutPanelInternal)
        newParent.relayoutAllWithNewPanel(flatChildren);
    }
      
    panel.notifyRelayout();
    newParent.setActiveChild(panel);
  }
}

/**
 * 移除面板处理函数
 * @param panel 
 * 
 * 移除类型 》
    0. 顶级：直接移除
    1. 侧边栏/标题栏：从侧边栏子级移除
    2. TAB头：从TAB子级移除，触发TAB组【移除重构】
    3. 组：从组中移除，触发普通组【移除重构】
      移除重构 》
        普通组 》
          当前面板是顶级 》
            并且子级数量0个 》
              如果设置不收缩，则保持，通知客户；
              如果设置收缩，则自动收缩顶级；
            并且子级数量等于1个 》
              删除自己，子级替代自己
          当前面板非顶级 》
            普通组子级如果只剩一个，则子级替换自己的位置
        TAB组 》
          如果设置不收缩，则保持TAB，通知客户；
          如果设置收缩且TAB子级数量为0，且处于顶级，则自动收缩顶级；
        其他情况不处理
 */
function removePanelInternal(panel: CodeLayoutPanelInternal) {
    
  if (panel.parentGrid === 'none')
    throw new Error(`Panel ${panel.name} already removed from any group !`);

  const parent = panel.parentGroup;
  if (parent) {
    const isInTab = panel.getIsInTab();
    parent.removeChild(panel);
    //删除面板后将会进行布局
    relayoutAfterRemovePanel(parent, isInTab, panel);
  } else {
    //没有父级，直接从顶级移除
    const parentGrid = getRootGrid(panel.parentGrid);
    parentGrid.removeChild(panel);
  }

  panel.size = 0;
  panel.parentGrid = 'none';
  return undefined;
}
//移除重构: 移除面板后进行布局
function relayoutAfterRemovePanel(group: CodeLayoutPanelInternal, isInTab: boolean, panel: CodeLayoutPanelInternal) {
    
  //TAB组
  if (isInTab) {
    if (group.noAutoShink) {
      //如果设置不收缩，则保持TAB，通知客户
      props.layoutConfig.onNoAutoShinkTabGroup?.(group);
    } else if (group.children.length === 0 && group.getIsTopGroup()) {
      //如果TAB子级数量为0，且处于顶级，则自动收缩顶级
      getRootGrid(group.parentGrid).collapse(false);
    }
    return;
  }

  //普通组
  if (group.getIsTopGroup()) {
    if (group.children.length === 0) {
      if (group.noAutoShink) {
        //如果设置不收缩，则保持，通知客户
        props.layoutConfig.onNoAutoShinkNormalGroup?.(group);
      } else {
        //如果子级数量为0，则自动收缩顶级
        getRootGrid(group.parentGrid).collapse(false);
      }
      return;
    }
    else if (group.children.length === 1) {
      //当前面板子级数量1个，删除自己，子级替代自己
      const gridInstance = getRootGrid(group.parentGrid);
      const firstChildren = group.children[0];
      firstChildren.open = true;
      firstChildren.size = 0;//只有一个容器后直接占满容器
      gridInstance.replaceChild(group, firstChildren);
      panelInstances.delete(group.name);
      return;
    }
  }
  else if (group.children.length === 1) {
    //当前面板子级数量少于1个，删除自己，子级替代自己
    const firstChildren = group.children[0];
    firstChildren.open = true;
    firstChildren.size = 0;//只有一个容器后直接占满容器
    group.parentGroup!.replaceChild(group, firstChildren);
    panelInstances.delete(group.name);
    return;
  }

  //普通组移除状态下，无需其他操作，通知面板进行布局
  panelInstances.get(group.name)?.relayoutAllWithRemovePanel(panel);
}

//布局加载与保存
function clearLayout() {
  panels.value.primary.children.splice(0);
  panels.value.secondary.children.splice(0);
  panels.value.bottom.children.splice(0);
  panels.value.primary.setActiveChild(null);
  panels.value.secondary.setActiveChild(null);
  panels.value.bottom.setActiveChild(null);
  panelInstances.clear();
}
function saveLayout() {
  codeLayoutBase.value?.saveGridLayoutDataToConfig();
  return {
    primary: panels.value.primary.toJson(),
    secondary: panels.value.secondary.toJson(),
    bottom: panels.value.bottom.toJson(),
  };
}
function loadLayout(json: any, instantiatePanelCallback: (data: CodeLayoutPanel) => CodeLayoutPanel) {

  clearLayout();

  if (!json)
    return;

  function loadGrid(gridData: any, gridInstance: CodeLayoutPanelInternal) {
    gridInstance.loadFromJson(gridData);
    if (gridData.children instanceof Array) {
      for (const childPanelData of gridData.children) {
        const panelInstance = gridInstance.addPanel(childPanelData as CodeLayoutPanel);
        loadGrid(childPanelData, instantiatePanelCallback(panelInstance) as CodeLayoutPanelInternal);
      }
    }
    gridInstance.notifyRelayout();
  }

  if (json.primary)
    loadGrid(json.primary, panels.value.primary as CodeLayoutPanelInternal);
  if (json.secondary)
    loadGrid(json.secondary, panels.value.secondary as CodeLayoutPanelInternal);
  if (json.primary)
    loadGrid(json.bottom, panels.value.bottom as CodeLayoutPanelInternal);
}

//处理函数
usePanelDraggerRoot(FLAG_CODE_LAYOUT);

useKeyBoardControllerTop();

provide('codeLayoutConfig', layoutConfig);
provide('codeLayoutLangConfig', props.langConfig);
provide('codeLayoutContext', codeLayoutContext);

function onActivityBarAcitve(panelGroup: CodeLayoutPanelInternal) {
  const _layoutConfig = props.layoutConfig;
  if (panels.value.primary.activePanel === panelGroup && props.layoutConfig.primarySideBarSwitchWithActivityBar) {
    //如果点击当前条目，则切换侧边栏
    _layoutConfig.primarySideBar = !_layoutConfig.primarySideBar;
  } else {
    //如果侧边栏关闭，则打开
    if (!props.layoutConfig.primarySideBar)
      _layoutConfig.primarySideBar = true;
    panels.value.primary.setActiveChild(panelGroup);
  }
} 
function onActivityBarAcitve2(panelGroup: CodeLayoutPanelInternal) {
  const _layoutConfig = props.layoutConfig;
  if (panels.value.secondary.activePanel === panelGroup && props.layoutConfig.primarySideBarSwitchWithActivityBar) {
    //如果点击当前条目，则切换侧边栏
    _layoutConfig.secondarySideBar = !_layoutConfig.secondarySideBar;
  } else {
    //如果侧边栏关闭，则打开
    if (!props.layoutConfig.secondarySideBar)
      _layoutConfig.secondarySideBar = true;
    panels.value.secondary.setActiveChild(panelGroup);
  }
}

//公开控制接口

function getRootGrid(target: CodeLayoutGrid) : CodeLayoutGridInternal {
  switch (target) {
    case 'rootGrid': return codeLayoutBase.value?.getSplitLayoutRef()?.getRootGrid()!;
    case 'primarySideBar': return panels.value.primary as CodeLayoutGridInternal;
    case 'secondarySideBar': return panels.value.secondary as CodeLayoutGridInternal;
    case 'bottomPanel': return panels.value.bottom as CodeLayoutGridInternal;
  }
  throw new Error(`Unknown grid ${target}`);
}
function getPanelByName(name: string) {
  return panelInstances.get(name);
}
function addGroup(panel: CodeLayoutPanel, target: CodeLayoutGrid) {
  const panelInternal = panel as CodeLayoutPanelInternal;

  if (panelInternal.parentGrid && panelInternal.parentGrid !== 'none')
    throw new Error(`Group ${panel.name} already added to ${panelInternal.parentGrid} !`);
  if (panelInstances.has(panelInternal.name))
    throw new Error(`A panel named ${panel.name} already exists`);

  const groupResult = reactive(new CodeLayoutPanelInternal(hosterContext));
  Object.assign(groupResult, panel);
  groupResult.open = panel.startOpen ?? false;
  groupResult.size = panel.size ?? 0;
  groupResult.accept = panel.accept ?? defaultAccept;
  groupResult.parentGrid = target;

  panelInstances.set(panelInternal.name, groupResult as CodeLayoutPanelInternal);
  getRootGrid(target).addChild(groupResult as CodeLayoutPanelInternal);

  return groupResult as CodeLayoutPanelInternal;
}
function removeGroup(panel: CodeLayoutPanelInternal) {
  const grid = panel.parentGrid;
  if (!grid || grid === 'none')
    throw new Error(`Group ${panel.name} already removed from any grid !`);

  const gridInstance = getRootGrid(grid);

  gridInstance.removeChild(panel);
  panel.parentGrid = 'none';
  panelInstances.delete(panel.name);

  return panel;
}
function relayoutAll() {
  panelInstances.forEach(p => p.notifyRelayout());
}
function relayoutGroup(name: string) {
  panelInstances.get(name)?.notifyRelayout();
}

defineExpose(codeLayoutInstance);

onMounted(() => {
  nextTick(() => {
    emit('canLoadLayout', codeLayoutInstance);
    loadActivityBarPosition();
  });
  if (props.saveBeforeUnload)
    window.addEventListener('beforeunload', saveLayoutAtUnmount)
});
onBeforeUnmount(() => {
  saveLayoutAtUnmount();
});

function saveLayoutAtUnmount() {
  window.removeEventListener('beforeunload', saveLayoutAtUnmount);
  codeLayoutBase.value?.saveGridLayoutDataToConfig();
  emit('canSaveLayout', codeLayoutInstance);
}

</script>

<style lang="scss">
@import './Scss/Base.scss';
@import './Scss/Menu.scss';
</style>
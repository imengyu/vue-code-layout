<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div class="code-layout-root">
    <slot name="titleBarTop" />
    <div v-show="config.titleBar" class="code-layout-title-bar">
      <div>
        <slot name="titleBarIcon" />
        <slot v-if="config.menuBar" name="titleBarMenu" />
      </div>
      <div>
        <slot name="titleBarCenter" />
      </div>
      <div>
        <slot name="titleBarRight" />
      </div>
    </div>
    <slot name="titleBarBottom" />
    <!--root-->
    <div class="code-layout-activity">
      <!--activity bar-->
      <div 
        v-show="config.activityBar && config.primarySideBarPosition === 'left' && config.activityBarPosition === 'side'" 
        :class="['code-layout-activity-bar',config.primarySideBarPosition]"
      >
        <slot name="activityBar" />
      </div>
      <div 
        v-show=" config.primarySideBarPosition === 'right' && config.secondaryActivityBarPosition === 'side'" 
        :class="['code-layout-activity-bar','left']"
      >
        <slot name="activityBarSecondary" />
      </div>

      <!-- base area -->
      <div class="code-layout-inner-0">
        <SplitLayout 
          ref="splitLayoutRef"
          :showTabHeader="false"
          :layoutData="(splitLayoutRootGrid as CodeLayoutSplitNRootGrid)"
        >
          <template #gridRender="{ grid }">
            <CodeLayoutTagControl>
              <slot :name="grid.name" />
            </CodeLayoutTagControl>
          </template>
        </SplitLayout>
      </div>
      
      <!--activity bar (right)-->
      <div 
        v-show="config.activityBar && config.primarySideBarPosition === 'right' && config.activityBarPosition === 'side'" 
        :class="['code-layout-activity-bar',config.primarySideBarPosition]"
      >
        <slot name="activityBar" />
      </div>
      <div 
        v-show=" config.primarySideBarPosition === 'left' && config.secondaryActivityBarPosition === 'side'" 
        :class="['code-layout-activity-bar','right']"
      >
        <slot name="activityBarSecondary" />
      </div>

    </div>
    <!--status bar-->
    <div v-show="config.statusBar" class="code-layout-status">
      <slot name="statusBar">
        <div class="left">
          <slot name="statusBarLeft" />
        </div>
        <div class="right">
          <slot name="statusBarRight" />
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, type PropType, watch, onBeforeUnmount, onMounted, nextTick } from 'vue';
import { CodeLayoutSplitNGridInternal, CodeLayoutSplitNRootGrid } from './SplitLayout/SplitN';
import type { CodeLayoutConfig } from './CodeLayout';
import type { CodeLayoutRootGrid } from './CodeLayoutRootGrid';
import SplitLayout from './SplitLayout/SplitLayout.vue';
import CodeLayoutTagControl from './CodeLayoutTagControl.vue';

const splitLayoutRootGrid = ref(new CodeLayoutSplitNRootGrid());

const props = defineProps({
  config: {
    type: Object as PropType<CodeLayoutConfig>,
    required: true,
  },
  rootGrid: {
    type: Object as PropType<CodeLayoutRootGrid>,
    required: false,
  },
});

const currentBottom = ref<CodeLayoutSplitNGridInternal>();

function loadLayout() {
  if (isNextNoChangeLayout())
    return;
  if (!props.rootGrid)
    throw new Error('CodeLayoutBase: rootGrid is not defined');
 
  const rootGrid = splitLayoutRootGrid.value as CodeLayoutSplitNRootGrid;
  const config = props.config;
  const inversePrimary = props.config.primarySideBarPosition === 'right';
  const bottomIsInSide = props.config.panelAlignment.endsWith('-side');
  const reverseBottom = !bottomIsInSide && props.config.panelPosition === 'top';
  rootGrid.parentGrid = 'none';

  const buildSecondary = (parent: CodeLayoutSplitNGridInternal) => {
    const panel = (inversePrimary ? props.rootGrid!.primarySideBar : props.rootGrid!.secondarySideBar).toJson();
    panel.visible = inversePrimary ? config.primarySideBar : config.secondarySideBar;
    panel.size = inversePrimary ? config.primarySideBarWidth : config.secondarySideBarWidth;
    panel.minSize = inversePrimary? config.primarySideBarMinWidth : config.secondarySideBarMinWidth;
    panel.canMinClose = true;
    panel.inhertParentGrid = false;
    panel.stretchable = false;
    panel.parentGrid = inversePrimary ? 'primarySideBar' : 'secondarySideBar';
    const instance = parent.addChildGrid(panel);
    instance.onMinCloseChanged = (grid, visible) => {
      setNextNoChangeLayout();
      inversePrimary? (config.primarySideBar = visible) : (config.secondarySideBar = visible);
    };
    return instance;
  }
  const buildPrimary = (parent: CodeLayoutSplitNGridInternal) => {
    const panel = (inversePrimary? props.rootGrid!.secondarySideBar : props.rootGrid!.primarySideBar).toJson();
    panel.visible = inversePrimary? config.secondarySideBar : config.primarySideBar;
    panel.size = inversePrimary? config.secondarySideBarWidth : config.primarySideBarWidth;
    panel.minSize = inversePrimary? config.secondarySideBarMinWidth : config.primarySideBarMinWidth;
    panel.inhertParentGrid = false;
    panel.parentGrid = inversePrimary ? 'secondarySideBar' : 'primarySideBar';
    panel.canMinClose = true;
    panel.stretchable = false;
    const instance = parent.addChildGrid(panel);
    instance.onMinCloseChanged = (grid, visible) => {
      setNextNoChangeLayout();
      inversePrimary? (config.secondarySideBar = visible) : (config.primarySideBar = visible);
    };
    return instance;
  }
  const buildBottom = (parent: CodeLayoutSplitNGridInternal) => {
    const panel = props.rootGrid!.bottomPanel.toJson();
    const fullSize = bottomIsInSide ? (100 - props.rootGrid!.primarySideBar.size - props.rootGrid!.secondarySideBar.size) : 100;
    panel.visible = config.bottomPanel;
    panel.size = config.bottomPanelMaximize ? fullSize : (config.bottomPanelHeight < fullSize ? config.bottomPanelHeight : 20);
    panel.minSize = config.bottomPanelMinHeight;
    panel.canMinClose = true;
    panel.inhertParentGrid = false;
    panel.stretchable = false;
    panel.parentGrid = 'bottomPanel';
    currentBottom.value = parent.addChildGrid(panel, reverseBottom ? 0 : undefined);
    currentBottom.value.onMinCloseChanged = (grid, visible) => {
      setNextNoChangeLayout();
      config.bottomPanel = visible;
    };
    return currentBottom.value;
  }    
  const buildCenter = (parent: CodeLayoutSplitNGridInternal) => {
    const panel = parent.addGrid({
      name: 'centerArea',
      visible: config.bottomPanelMaximize && config.bottomPanel ? false : true,
      canMinClose: false,
      size: 0,
      minSize: [ config.centerMinWidth, config.centerMinHeight ],
    });
    panel.inhertParentGrid = false;
    panel.parentGrid = 'centerArea';
    return panel;
  }   
  const buildGroup = (
    parent: CodeLayoutSplitNGridInternal, 
    name: string, 
    direction: "vertical" | "horizontal",
    minSize: number|number[]
  ) => {
    const grid = parent.addGrid({
      name,
      visible: true,
      size: 0,
      minSize: minSize,
    }, direction);
    grid.notifyRelayout();
    return grid;
  }    

  splitLayoutRootGrid.value.clearLayout();
  rootGrid.direction = 'horizontal';


  switch (props.config.panelAlignment) {
    case 'left': {
      const baseLeft = buildGroup(rootGrid, 'group1', 'vertical', [ config.centerMinWidth, config.centerMinHeight ]); {
        const baseTop = buildGroup(baseLeft, 'group2', 'horizontal', [ config.centerMinWidth, config.centerMinHeight ]); {
          buildPrimary(baseTop);
          buildCenter(baseTop);
        }
        buildBottom(baseLeft);
      }
      buildSecondary(rootGrid);
      break;
    }
    case 'right': {
      buildPrimary(rootGrid)
      const baseLeft = buildGroup(rootGrid, 'group1', 'vertical', [ config.centerMinWidth, config.centerMinHeight ]); {
        const baseTop = buildGroup(baseLeft, 'group2', 'horizontal', [ config.centerMinWidth, config.centerMinHeight ]); {
          buildCenter(baseTop);
          buildSecondary(baseTop);
        }
        buildBottom(baseLeft);
      }
      break;
    }
    case 'justify': {
      const group = buildGroup(rootGrid, 'group1', 'vertical', 0); {
        const group2 = buildGroup(group, 'group2', 'horizontal', [ config.centerMinWidth, config.centerMinHeight ]); {
          buildPrimary(group2);
          buildCenter(group2);
          buildSecondary(group2);
        }
        buildBottom(group);
      }
      break;
    }
    case 'center': {
      buildPrimary(rootGrid);
      const group = buildGroup(rootGrid, 'group1', 'vertical', [ config.centerMinWidth, config.centerMinHeight ]); {
        buildCenter(group);
        buildBottom(group);
      }
      buildSecondary(rootGrid);
      break;
    }
    case 'left-side': {
      buildPrimary(rootGrid);
      buildBottom(rootGrid);
      buildCenter(rootGrid);
      buildSecondary(rootGrid);
      break;
    }
    case 'right-side': {
      buildPrimary(rootGrid);
      buildCenter(rootGrid);
      buildBottom(rootGrid);
      buildSecondary(rootGrid);
      break;
    }
  }
    
  rootGrid.notifyRelayout();
}

let nextNoChangeLayout = false;

function setNextNoChangeLayout() {
  nextNoChangeLayout = true;
}
function isNextNoChangeLayout() {
  if (nextNoChangeLayout) {
    nextNoChangeLayout = false;
    return true;
  }
  return false;
}

watch(() => props.config.bottomPanel, () => loadLayout());
watch(() => props.config.secondarySideBar, () => loadLayout());
watch(() => props.config.primarySideBar, () => loadLayout());
watch(() => props.config.bottomPanelMaximize, (v) => {
  if (isNextNoChangeLayout())
    return;
  if (v)
    relayoutAfterVarChange();
  else
    loadLayout();
});
watch(() => currentBottom.value?.size, (v) => {
  if (props.rootGrid) {
    const config = props.config;
    const bottomIsInSide = props.config.panelAlignment.endsWith('-side');
    const fullSize = bottomIsInSide ? (100 - props.rootGrid.primarySideBar.size - props.rootGrid.secondarySideBar.size) : 100;
    if (v) {
      if(v < fullSize - 1 && config.bottomPanelMaximize) {
        nextNoChangeLayout = true;
        config.bottomPanelMaximize = false;
      } else if (v >= fullSize && !config.bottomPanelMaximize) {
        nextNoChangeLayout = true;
        config.bottomPanelMaximize = true;
      }
    }
  }
});
watch(() => props.config.panelAlignment, () => loadLayout());
watch(() => props.config.panelPosition, () => loadLayout());
watch(() => props.config.bottomPanelHeight, () => loadLayout());
watch(() => props.config.bottomPanelMinHeight, () => relayoutAfterVarChange());
watch(() => props.config.primarySideBarMinWidth, () => relayoutAfterVarChange());
watch(() => props.config.primarySideBarPosition, () => relayoutAfterVarChange());
watch(() => props.config.primarySideBarWidth, () => loadLayout());
watch(() => props.config.secondarySideBarMinWidth, () => relayoutAfterVarChange());
watch(() => props.config.secondaryActivityBarPosition, () => relayoutAfterVarChange());
watch(() => props.config.secondarySideBarWidth, () => loadLayout());

function relayoutAfterVarChange() {
  saveGridLayoutDataToConfig();
  loadLayout();
}
function saveGridLayoutDataToConfig() {
  const config = props.config;
  const bottomPanel = splitLayoutRootGrid.value.root.getPanelByName('bottomPanel');
  const primarySideBar = splitLayoutRootGrid.value.root.getPanelByName('primarySideBar');
  const secondarySideBar = splitLayoutRootGrid.value.root.getPanelByName('secondarySideBar');
  if (bottomPanel) {
    config.bottomPanel = bottomPanel.visible;
    config.bottomPanelHeight = bottomPanel.size;
  }
  if (primarySideBar) {
    config.primarySideBar = primarySideBar.visible;
    config.primarySideBarWidth = primarySideBar.size;
  }
  if (secondarySideBar) {
    config.secondarySideBar = secondarySideBar.visible;
    config.secondarySideBarWidth = secondarySideBar.size;
  }
}

onMounted(() => {
  nextTick(() => {
    loadLayout();
  });
});
onBeforeUnmount(() => {
  saveGridLayoutDataToConfig();
});
</script>
<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div ref="container" class="code-layout-root">
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

      <!-- base area -->
      <SplitLayout 
        ref="splitLayoutRef"
        rootGridType="rootGrid"
        :showTabHeader="false"
        @canLoadLayout="loadLayout"
        @canSaveLayout="saveGridLayoutDataToConfig"
      >
        <template #gridRender="{ grid }">
          <slot :name="grid.name" />
        </template>
      </SplitLayout>
      
      <!--activity bar (right)-->
      <div 
        v-show="config.activityBar && config.primarySideBarPosition === 'right' && config.activityBarPosition === 'side'" 
        :class="['code-layout-activity-bar',config.primarySideBarPosition]"
      >
        <slot name="activityBar" />
      </div>
    </div>
    <!--status bar-->
    <div v-show="config.statusBar" class="code-layout-status">
      <slot name="statusBar" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, type PropType, watch } from 'vue';
import type { CodeLayoutConfig } from './CodeLayout';
import type { CodeLayoutSplitNGridInternal, CodeLayoutSplitNInstance } from './SplitLayout/SplitN';
import SplitLayout from './SplitLayout/SplitLayout.vue';

export interface CodeLayoutBaseInstance {
  getRef: () => HTMLElement | undefined;
  saveGridLayoutDataToConfig: () => void;
}

const splitLayoutRef = ref<CodeLayoutSplitNInstance>();
const container = ref<HTMLElement>();

const props = defineProps({
  config: {
    type: Object as PropType<CodeLayoutConfig>,
    required: true,
  },
});

const currentBottom = ref<CodeLayoutSplitNGridInternal>();

function loadLayout() {
  if (splitLayoutRef.value) {
    const rootGrid = splitLayoutRef.value.getRootGrid();
    const config = props.config;
    const inversePrimary = props.config.primarySideBarPosition === 'right';

    const buildSecondary = (parent: CodeLayoutSplitNGridInternal) => {
      return parent.addGrid({
        name: inversePrimary ? 'primarySideBar' : 'secondarySideBar',
        visible: inversePrimary ? config.primarySideBar : config.secondarySideBar,
        size: inversePrimary ? config.primarySideBarWidth : config.secondarySideBarWidth,
        minSize: inversePrimary ? config.primarySideBarMinWidth : config.secondarySideBarMinWidth,
        canMinClose: true,
      });
    }
    const buildPrimary = (parent: CodeLayoutSplitNGridInternal) => {
      return parent.addGrid({
        name: inversePrimary ? 'secondarySideBar' : 'primarySideBar',
        visible: inversePrimary ? config.secondarySideBar : config.primarySideBar,
        size: inversePrimary ? config.secondarySideBarWidth : config.primarySideBarWidth,
        minSize: inversePrimary ? config.secondarySideBarMinWidth : config.primarySideBarMinWidth,
        canMinClose: true,
      });
    }
    const buildBottom = (parent: CodeLayoutSplitNGridInternal) => {
      currentBottom.value = parent.addGrid({
        name: 'bottomPanel',
        visible: config.bottomPanel,
        size: config.bottomPanelMaximize ? 100 : (
          config.bottomPanelHeight < 100 ? config.bottomPanelHeight : 20
        ),
        minSize: config.bottomPanelMinHeight,
        canMinClose: true,
      });
      return currentBottom.value;
    }    
    const buildCenter = (parent: CodeLayoutSplitNGridInternal) => {
      return parent.addGrid({
        name: 'centerArea',
        visible: true,
        size: 0,
        minSize: 0,
      });
    }   
    const buildGroup = (parent: CodeLayoutSplitNGridInternal, name: string, direction?: "vertical" | "horizontal") => {
      const grid = parent.addGrid({
        name,
        visible: true,
        size: 0,
        minSize: 0,
      }, direction);
      grid.notifyRelayout();
      return grid;
    }    

    splitLayoutRef.value.clearLayout();
    rootGrid.direction = 'horizontal';

    switch (props.config.bottomAlignment) {
      case 'left': {
        const baseLeft = buildGroup(rootGrid, 'group1', 'vertical'); {
          const baseTop = buildGroup(baseLeft, 'group2', 'horizontal'); {
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
        const baseLeft = buildGroup(rootGrid, 'group1', 'vertical'); {
          const baseTop = buildGroup(baseLeft, 'group2', 'horizontal'); {
            buildCenter(baseTop);
            buildSecondary(baseTop);
          }
          buildBottom(baseLeft);
        }
        break;
      }
      case 'justify': {
        const group = buildGroup(rootGrid, 'group1', 'vertical'); {
          const group2 = buildGroup(group, 'group2', 'horizontal'); {
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
        const group = buildGroup(rootGrid, 'group1', 'vertical'); {
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
}

let nextNoChangeLayout = false;

watch(() => props.config.bottomPanel, loadLayout);
watch(() => props.config.secondarySideBar, loadLayout);
watch(() => props.config.primarySideBar, loadLayout);
watch(() => props.config.bottomPanelMaximize, (v) => {
  if (nextNoChangeLayout) {
    nextNoChangeLayout = false;
    return;
  }
  if (v)
    relayoutAfterVarChange();
  else
    loadLayout();
});
watch(() => currentBottom.value?.size, (v) => {
  const config = props.config;
  if (v && v < 100 && config.bottomPanelMaximize) {
    nextNoChangeLayout = true;
    config.bottomPanelMaximize = false;
  }
});
watch(() => props.config.bottomAlignment, loadLayout);
watch(() => props.config.bottomPanelHeight, loadLayout);
watch(() => props.config.bottomPanelMinHeight, relayoutAfterVarChange);
watch(() => props.config.primarySideBarMinWidth, relayoutAfterVarChange);
watch(() => props.config.primarySideBarPosition, relayoutAfterVarChange);
watch(() => props.config.primarySideBarWidth, loadLayout);
watch(() => props.config.secondarySideBarMinWidth, relayoutAfterVarChange);
watch(() => props.config.secondarySideBarWidth, loadLayout);

function relayoutAfterVarChange() {
  saveGridLayoutDataToConfig();
  loadLayout();
}
function saveGridLayoutDataToConfig() {
  const config = props.config;
  if (splitLayoutRef.value) {
    const bottomPanel = splitLayoutRef.value.getGridByName('bottomPanel');
    const primarySideBar = splitLayoutRef.value.getGridByName('primarySideBar');
    const secondarySideBar = splitLayoutRef.value.getGridByName('secondarySideBar');
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
}

defineExpose<CodeLayoutBaseInstance>({
  getRef: () => container.value,
  saveGridLayoutDataToConfig,
});

</script>
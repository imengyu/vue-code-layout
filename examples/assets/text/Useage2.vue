<template>
  <div class="full-container">
    <CodeLayout 
      ref="codeLayout"
      :layout-config="config"
    >
      <template #centerArea>
        <h1>Center Area</h1>
      </template>
      <template #titleBarIcon>
        <img src="../assets/images/logo.svg" width="20px" style="margin:0 10px 0 13px">
      </template>
      <template #panelRender="{ panel }">
        <template v-if="panel.name === 'explorer.file'">
          <h1>Render Panel Explorer File</h1>
        </template>
        <template v-else-if="panel.name === 'explorer.outline'">
          <h1>Render Panel Explorer outline</h1>
        </template>
        <template v-else-if="panel.name === 'bottom.ports'">
          <h1>Render bottom panel ports</h1>
        </template>
        <template v-else-if="panel.name === 'bottom.terminal'">
          <h1>Render bottom panel terminal</h1>
        </template>
        <span v-else>Panel {{ panel.name }}, no content</span>
      </template>
      <template #statusBar>
        <span>Custom render Status bar area</span>
      </template>
    </CodeLayout>
  </div>
</template>

<script setup lang="ts">
import IconFile from '../assets/icons/IconFile.vue';
import IconSearch from '../assets/icons/IconSearch.vue';
import { ref, reactive, onMounted, nextTick, h } from 'vue';
import type { MenuOptions } from '@imengyu/vue3-context-menu';
import type { CodeLayoutConfig, CodeLayoutInstance, CodeLayoutPanelInternal } from 'vue-code-layout';
import { CodeLayout } from 'vue-code-layout';

const codeLayout = ref<CodeLayoutInstance>();
const config = reactive<CodeLayoutConfig>({
  primarySideBarSwitchWithActivityBar: true,
  primarySideBarPosition: 'left',
  primarySideBarWidth: 20,
  primarySideBarMinWidth: 170,
  activityBarPosition: 'side',
  secondarySideBarWidth: 20,
  secondarySideBarMinWidth: 170,
  bottomPanelHeight: 30,
  bottomPanelMinHeight: 40,
  bottomAlignment: 'center',
  panelHeaderHeight: 24,
  panelMinHeight: 150,
  titleBar: true,
  titleBarShowCustomizeLayout: true,
  activityBar: true,
  primarySideBar: true,
  secondarySideBar: false,
  bottomPanel: true,
  statusBar: true,
  menuBar: true,
});

onMounted(() => {
  nextTick(() => {
    if (codeLayout.value) {

      const groupExplorer = codeLayout.value.addGroup({
        title: 'Explorer',
        tooltip: 'Explorer',
        name: 'explorer',
        tabStyle: 'single',
        badge: '2',
        iconLarge: () => h(IconFile),
      }, 'primarySideBar');
      codeLayout.value.addGroup({
        title: 'Search',
        tooltip: 'Search',
        name: 'search',
        tabStyle: 'single',
        iconLarge: () => h(IconSearch),
      }, 'primarySideBar');

      const bottomGroup = codeLayout.value.getRootGrid('bottomPanel');

      groupExplorer.addPanel({
        title: 'VUE-CODE-LAYOUT',
        tooltip: 'vue-code-layout',
        name: 'explorer.file',
        noHide: true,
        startOpen: true,
        iconSmall: () => h(IconSearch),
        actions: [
          { 
            name: 'test',
            icon: () => h(IconSearch),
            onClick() {},
          },
          { 
            name: 'test2',
            icon: () => h(IconFile),
            onClick() {},
          },
        ]
      });
      groupExplorer.addPanel({
        title: 'OUTLINE',
        tooltip: 'Outline',
        name: 'explorer.outline',
        iconSmall: () => h(IconSearch),
        actions: [
          { 
            name: 'test',
            icon: () => h(IconSearch),
            onClick() {},
          },
          { 
            name: 'test2',
            icon: () => h(IconFile),
            onClick() {},
          },
        ]
      });
    
      bottomGroup.addPanel({
        title: 'PORTS',
        tooltip: 'Ports',
        name: 'bottom.ports',
        startOpen: true,
        iconSmall: () => h(IconSearch),
      });
      bottomGroup.addPanel({
        title: 'TERMINAL',
        tooltip: 'Terminal',
        name: 'bottom.terminal',
      });
    }

  });
});
</script>

<style>
.full-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
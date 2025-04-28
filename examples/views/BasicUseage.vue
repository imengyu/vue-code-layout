<template>
  <div class="full-container">
    <CodeLayout 
      ref="codeLayout"
      :layout-config="config"
      :main-menu-config="menuData"
    >
      <template #titleBarBottom>
        <slot name="extraActions" />
      </template>
      <template #centerArea>
        <slot name="center">
          <SplitLayout
            ref="splitLayout"
            @panelClose="onPanelClose"
            @canLoadLayout="loadInnerLayout"
          >
            <template #tabContentRender="{ panel }">
              <vue-monaco-editor
                v-if="panel.name.startsWith('file')"
                v-model:value="panel.data.value"
                :language="panel.data.language"
                :path="panel.data.path"
                theme="vs-dark"
                :options="MONACO_EDITOR_OPTIONS"
              />
            </template>
            <template #tabEmptyContentRender="{ grid }">
              <h2 :style="{ margin: 0 }">Empty Grid</h2>
            </template>
          </SplitLayout>
        </slot>
      </template>
      <template #titleBarIcon>
        <img src="../assets/images/logo.svg" width="20px" style="margin:0 10px 0 13px">
      </template>
      <template #panelRender="{ panel }">
        <template v-if="panel.name === 'explorer.file'">
          <ScrollRect>
            <img src="../assets/images/placeholder.png">
          </ScrollRect>
        </template>
        <template v-else-if="panel.name === 'explorer.outline'">
          <ScrollRect>
            <img src="../assets/images/placeholder2.png">
          </ScrollRect>
        </template>
        <template v-else-if="panel.name === 'search'">
          <ScrollRect>
            <img src="../assets/images/placeholder5.png">
          </ScrollRect>
        </template>
        <template v-else-if="panel.name === 'debug.a'">
          <h1>debug.a</h1>
        </template>
        <template v-else-if="panel.name === 'debug.b'">
          <h1>debug.b</h1>
          <p>../assets/images/placeholder5.png</p>
        </template>
        <template v-else-if="panel.name === 'bottom.ports'">
          <div class="test-buttons">
            <button @click="testPanelActive">Test active debug b</button>
            <button @click="testFindPanel">Test find panel</button>
          </div>
          <img src="../assets/images/placeholder3.png">
        </template>
        <template v-else-if="panel.name === 'bottom.terminal'">
          <img ref="testResizeFit" style="width:100%;height:100%" src="../assets/images/placeholder4.png">
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
import IconMarkdown from '../assets/icons/IconMarkdown.vue';
import IconVue from '../assets/icons/IconVue.vue';
import { ref, reactive, onMounted, nextTick, h, onBeforeUnmount, toRaw, watch } from 'vue';
import type { MenuOptions } from '@imengyu/vue3-context-menu';
import { 
  CodeLayout, SplitLayout, type CodeLayoutSplitNInstance, 
  type CodeLayoutConfig, type CodeLayoutInstance, type CodeLayoutPanelInternal, 
  defaultCodeLayoutConfig, useResizeChecker
} from 'vue-code-layout';
import { ScrollRect } from '@imengyu/vue-scroll-rect';
import TestContent1 from '../assets/text/Useage.vue?raw';
//import TestContent1 from '../assets/text/Useage2.vue?raw';
import TestContent2 from '../../README.md?raw';

const props = defineProps({
  enableSave: {
    type: Boolean,
    default: false,
  },
})

const splitLayout = ref<CodeLayoutSplitNInstance>();
const codeLayout = ref<CodeLayoutInstance>();

const MONACO_EDITOR_OPTIONS = {
  automaticLayout: true,
  formatOnType: true,
  formatOnPaste: true,
}; 
const codeLayoutConfig : CodeLayoutConfig = {
  ...defaultCodeLayoutConfig,
  titleBar: true,
  titleBarShowCustomizeLayout: true,
  activityBar: true,
  primarySideBar: true,
  secondarySideBar: true,
  bottomPanel: true,
  statusBar: true,
  menuBar: true,
  bottomPanelMaximize: false,
};
const config = reactive<CodeLayoutConfig>({
  ...codeLayoutConfig,
  onResetDefault() {
    for (const key in codeLayoutConfig) {
      (config as Record<string, any>)[key] = (codeLayoutConfig as Record<string, any>)[key];
    }
  },
  onDropToPanel(reference, referencePosition, panel, dropTo) {
    if (reference.name === 'explorer.file' && panel.name === 'explorer.outline') {
      return false;
    }
    return false
  },
  onNonPanelDrag(e, sourcePosition) {
    e.preventDefault();
    //如果用户拖拽进入的是文件，则允许
    if (e.dataTransfer?.items && e.dataTransfer.items.length > 0 && e.dataTransfer.items[0].kind == 'file')
      return true;
    return false;
  },
  onNonPanelDrop(e, sourcePosition, reference, referencePosition) {
    //处理放置事件
    console.log('用户拖拽文件', e.dataTransfer?.files[0].name, sourcePosition, reference, referencePosition);
  },
});

const menuData : MenuOptions = {
  x: 0,
  y: 0,
  items: [
    {
      label: "File",
      children: [
        { label: "New" },
        { label: "Open" },
        { 
          label: "Open recent",
          children: [
            { label: "File 1...." },
            { label: "File 2...." },
            { label: "File 3...." },
            { label: "File 4...." },
            { label: "File 5...." },
          ],
        },
        { label: "Save", divided: true },
        { label: "Save as..." },
        { label: "Close" },
        { label: "Exit" },
      ],
    },
    {
      label: "Edit",
      children: [
        { label: "Undo" },
        { label: "Redo" },
        { label: "Cut", divided: true },
        { label: "Copy" },
        { label: "Find", divided: true },
        { label: "Replace" },
      ],
    },
    {
      label: "View",
      children: [
        { label: "Zoom in" },
        { label: "Zoom out" },
        { label: "Reset zoom" },
        { label: "Full screent", divided: true },
        { label: "Find", divided: true },
        { label: "Replace" },
      ],
    },
    {
      label: "Help",
      children: [
        { 
          label: "Reset Layout",
          onClick: () => {
            onResetAll();
          },
        },
        { label: "About" },
      ],
    },
  ],
  zIndex: 3,
  minWidth: 230,
};

function onPanelClose(panel: CodeLayoutPanelInternal, resolve: () => void) {
  resolve();
}

function onResetAll() {
  localStorage.setItem('CodeLayoutDemoSaveConfig', '');
  localStorage.setItem('CodeLayoutDemoSaveData', '');
  codeLayout.value?.clearLayout();
  loadLayout();
}

function loadInnerLayout() {
  if (splitLayout.value) {
    const grid = splitLayout.value.getRootGrid();
    const splitLeft = grid.addGrid({
      name: 'split1',
    });
    const splitRight = grid.addGrid({
      name: 'split2',
    });
    splitRight.addPanel({
      title: 'BasicUseage.vue (1)',
      tooltip: 'F:\\Programming\\WebProjects\\vue-code-layout\\examples\\views\\BasicUseage.vue',
      name: 'file1',
      iconSmall: () => h(IconVue),
      data: { value: TestContent1, language: 'vue', path: 'F:\\Programming\\WebProjects\\vue-code-layout\\examples\\views\\BasicUseage.vue', },
    });
    splitRight.addPanel({
      title: 'BasicUseage.vue (2)',
      tooltip: 'F:\\Programming\\WebProjects\\vue-code-layout\\examples\\views\\BasicUseage.vue',
      name: 'file2',
      badge: '2',
      iconSmall: () => h(IconVue),
      data: { value: TestContent1, language: 'vue', path: 'F:\\Programming\\WebProjects\\vue-code-layout\\examples\\views\\BasicUseage.vue', },
    });
    splitLeft.addPanel({
      title: 'CodeLayoutHelp.md',
      tooltip: 'F:\\Programming\\WebProjects\\vue-code-layout\\CodeLayoutHelp.md',
      name: 'file3',
      data: { value: TestContent2, language: 'markdown', path: 'F:\\Programming\\WebProjects\\vue-code-layout\\CodeLayoutHelp.md', },
      closeType: 'close',
      iconSmall: () => h(IconMarkdown),
    });
  }
}

function loadLayout() {
  //Load base layout
  if (codeLayout.value) {
    const data = localStorage.getItem('CodeLayoutDemoSaveData');
    if (props.enableSave && data) {
      //If load layout from data, need fill panel data
      codeLayout.value.loadLayout(JSON.parse(data), (panel) => {
        switch (panel.name) {
          case 'explorer':
            panel.title = 'Explorer';
            panel.tooltip = 'Explorer';
            panel.badge = '2';
            panel.iconLarge = () => h(IconFile);
            break;
          case 'search':
            panel.title = 'Search';
            panel.tooltip = 'Search';
            panel.iconLarge = () => h(IconSearch);
            break;
          case 'explorer.file':
            panel.title = 'VUE-CODE-LAYOUT';
            panel.tooltip = 'vue-code-layout';
            panel.actions = [
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
            panel.iconSmall = () => h(IconSearch);
            break; 
          case 'explorer.outline':
            panel.title = 'OUTLINE';
            panel.tooltip = 'Outline';
            panel.actions = [
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
            panel.iconSmall = () => h(IconSearch);
            break;
          case 'bottom.ports':
            panel.title = 'PORTS';
            panel.tooltip = 'Ports';
            panel.iconSmall = () => h(IconSearch);
            break;  
          case 'bottom.terminal':
            panel.title = 'TERMINAL';
            panel.tooltip = 'Terminal';
            panel.iconSmall = () => h(IconSearch);
            panel.actions = [
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
            break;
        }
        return panel;
      });
    } else {
      //No data, create new layout

      const groupExplorer = codeLayout.value.addGroup({
        title: 'Explorer',
        tooltip: 'Explorer',
        name: 'explorer',
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
      const groupDebug = codeLayout.value.addGroup({
        title: 'Debug',
        tooltip: 'Debug',
        name: 'debug',
        iconLarge: () => h(IconFile),
      }, 'primarySideBar');

      for (let index = 0; index < 8; index++) {
        codeLayout.value.addGroup({
          title: 'Test' + index,
          tooltip:  'Test' + index,
          name:  'test' + index,
          iconLarge: () => h(IconFile),
        }, 'primarySideBar');
      }

      const bottomGroup = codeLayout.value.getRootGrid('bottomPanel');

      const groupRight1 = codeLayout.value.addGroup({
        title: 'Right1',
        tooltip: 'Right1',
        name: 'right1',
        iconLarge: () => h(IconFile),
      }, 'secondarySideBar');
      const groupRight2 = codeLayout.value.addGroup({
        title: 'Right2',
        tooltip: 'Right2',
        name: 'right2',
        iconLarge: () => h(IconFile),
      }, 'secondarySideBar');
      groupRight1.addPanel({
        title: 'Right1',
        tooltip: 'Right1',
        name: 'right1.right1',
      });
      groupRight1.addPanel({
        title: 'Right2',
        tooltip: 'Right2',
        name: 'right1.right2',
      });
      groupRight2.addPanel({
        title: 'Right2',
        tooltip: 'Right2',
        name: 'right2.right2',
      });
      groupRight2.addPanel({
        title: 'Right3 No drag',
        tooltip: 'Right3',
        name: 'right2.right3',
        draggable: false,
      });

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
      groupDebug.addPanel({
        title: 'A',
        tooltip: 'Debug a',
        name: 'debug.a',
        iconSmall: () => h(IconSearch),
      });
      groupDebug.addPanel({
        title: 'B',
        tooltip: 'Debug b',
        name: 'debug.b',
        iconSmall: () => h(IconSearch),
      });
      groupDebug.addPanel({
        title: 'C',
        tooltip: 'Debug c',
        name: 'debug.c',
        iconSmall: () => h(IconSearch),
      });

      bottomGroup.addPanel({
        title: 'PORTS',
        tooltip: 'Ports',
        name: 'bottom.ports',
        startOpen: true,
        iconSmall: () => h(IconSearch),
        accept: [ 'bottomPanel' ],
      });
      bottomGroup.addPanel({
        title: 'TERMINAL',
        tooltip: 'Terminal',
        name: 'bottom.terminal',
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

      bottomGroup.onResize = () => {
        console.log('bottomGroup resized!', bottomGroup.size);
      };
    }
  }
  //Load layout config
  if (props.enableSave) {
    const data = localStorage.getItem('CodeLayoutDemoSaveConfig');
    if (data) {
      const dataObj = JSON.parse(data);
      for (const key in dataObj) {
        (config as Record<string, any>)[key] = (dataObj as Record<string, any>)[key];
      }
    }
  }
}
function saveLayout() {
  if (props.enableSave) {
    localStorage.setItem('CodeLayoutDemoSaveData', JSON.stringify(codeLayout.value?.saveLayout()));
    localStorage.setItem('CodeLayoutDemoSaveConfig', JSON.stringify(toRaw(config)));
  }
}

function testPanelActive() {
  codeLayout.value?.getPanelByName('debug.b')?.activeSelf();
}
function testFindPanel() {
  if (!splitLayout.value)
    throw new Error('splitLayout is null');
  console.log(
    splitLayout.value.getPanelByName("file1"), 
    splitLayout.value.getPanelByName("file2"),
    splitLayout.value.getPanelByName("file3")
  );
}

const testResizeFit = ref<HTMLElement>();

const { startResizeChecker, stopResizeChecker } = useResizeChecker(testResizeFit, (newWidth) => {
  console.log('testResizeFit Width changed!', newWidth);
}, (newHeight) => {
  console.log('testResizeFit Height changed!', newHeight);
});



onMounted(() => {
  nextTick(() => {
    loadLayout();
    startResizeChecker();
  });
  window.addEventListener('beforeunload', saveLayout);
});
onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', saveLayout);
  saveLayout();
  stopResizeChecker();
})

defineExpose({
  onResetAll
})
</script>
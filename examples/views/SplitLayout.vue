<template>
  <div class="full-container demo">
    <SplitLayout
      ref="splitLayoutRef"
      @panelClose="onPanelClose"
      @panelDrop="onPanelDrop"
      @panelActive="onPanelActive"
      @panelContextMenu="onPanelMenu"
      @gridActive="onGridActive"
      @canLoadLayout="loadLayout"
      @canSaveLayout="saveLayout"
    >
      <template #tabContentRender="{ panel }">
        <span v-if="panel.name === 'datahelp'">
          Data load and Save Help:
          <br>Drag drop any grid and Refresh page, this page will save your layout data in localStorage.
          <button @click="onResetAll">Reset all to default</button>
        </span>
        <h2 v-else :style="{ backgroundColor: colors[panel.data] }">Grid {{ panel.name }} {{ (panel.parentGroup as CodeLayoutSplitNGridInternal).direction }}</h2>
      </template>
      <template #tabEmptyContentRender="{ grid }">
        <h2>
          Empty Grid {{ grid.name }} {{ grid.direction }}
          <br><button @click="onAddPanel(grid)">+ Add Panel</button>
        </h2>
      </template>
      <template #tabHeaderExtraRender="{ grid }">
        <button @click="onAddPanel(grid)">+ Add Panel</button>
      </template>
    </SplitLayout>
    <div v-if="showData" class="demo-pre">
      <button @click="onPanelReset()">Reset All Panel</button>
      <button @click="onPanelDrop()">Refresh Panel Tree</button>
      <br>
      {{ debugGridTreeText }} 
    </div>
  </div>
</template>

<script setup lang="ts">
import IconSearch from '../assets/icons/IconSearch.vue';
import IconMarkdown from '../assets/icons/IconMarkdown.vue';
import IconVue from '../assets/icons/IconVue.vue';
import IconFile from '../assets/icons/IconFile.vue';
import { ref, onMounted, nextTick, h, onBeforeUnmount } from 'vue';
import type { CodeLayoutPanelInternal, CodeLayoutSplitNPanelInternal } from 'vue-code-layout';
import type { CodeLayoutSplitNGridInternal, CodeLayoutSplitNInstance } from 'vue-code-layout';
import { SplitLayout } from 'vue-code-layout';
import ContextMenuGlobal from '@imengyu/vue3-context-menu';

const colors = [
  '#fb0',
  '#f00',
  '#090',
  '#02a',
  '#155',
  '#f0f',
  '#0a4',
  '#cc0',
  '#f80',
  '#f08',
  '#0a8',
  '#08f',
]
const icons = [
  IconSearch,
  IconMarkdown,
  IconVue,
  IconFile,
];

const emit = defineEmits([	
  "resetAll"	
])
const props = defineProps({
  showData: {
    type: Boolean,
    default: true,
  },
  enableSave: {
    type: Boolean,
    default: false,
  },
})

function getRandomIcon() {
  return icons[Math.floor(Math.random() * icons.length)];
}

const debugGridTreeText = ref('');
const splitLayoutRef = ref<CodeLayoutSplitNInstance>();

let count = 0;

function onPanelClose(panel: CodeLayoutPanelInternal, resolve: () => void) {
  console.log('onPanelClose', panel.name);
  resolve();
  getDebugGridTreeText();
}
function onAddPanel(grid: CodeLayoutSplitNGridInternal) {
  count++;
  grid.addPanel({
    title: `Panel${count}`,
    tooltip: `Panel${count}`,
    name: `panel${count}`,
    data: count,
    iconSmall: () => h(getRandomIcon()),
  });
  getDebugGridTreeText();
}
function onPanelDrop() {
  getDebugGridTreeText();
}
function onPanelReset() {
  onResetAll();
}
function onPanelMenu(panel: CodeLayoutPanelInternal, e: MouseEvent) {
  e.stopPropagation();
  e.preventDefault();

  console.log('panel', panel);

  ContextMenuGlobal.showContextMenu({
    x: e.x,
    y: e.y,
    items: [
      {
        label: "Menu of " + panel.name,
        onClick: () => {
          alert("You click a menu item");
        }
      },
      {
        label: "Split Up",
        onClick: () => {
          (panel as CodeLayoutSplitNPanelInternal).splitCopy('top', (panel) => {
            panel.name = panel.name + '.copy';
            panel.title = panel.title + ' Clone';
            return panel;
          });
        }
      },
      {
        label: "Split Down",
        onClick: () => {
          (panel as CodeLayoutSplitNPanelInternal).splitCopy('bottom', (panel) => {
            panel.name = panel.name + '.copy';
            panel.title = panel.title + ' Clone';
            return panel;
          });
        }
      },
      {
        label: "Split Left",
        onClick: () => {
          (panel as CodeLayoutSplitNPanelInternal).splitCopy('left', (panel) => {
            panel.name = panel.name + '.copy';
            panel.title = panel.title + ' Clone';
            return panel;
          });
        }
      },
      {
        label: "Split Right",
        onClick: () => {
          (panel as CodeLayoutSplitNPanelInternal).splitCopy('right', (panel) => {
            panel.name = panel.name + '.copy';
            panel.title = panel.title + ' Clone';
            return panel;
          });
        }
      },
    ],
  });
}

function getDebugGridTreeText() {
  debugGridTreeText.value = splitLayoutRef.value?.getGridTreeDebugText() ?? '';
}

function onResetAll() {
  localStorage.setItem('SplitLayoutDemoSaveData', '');
  splitLayoutRef.value?.clearLayout();
  loadLayout();
  emit('resetAll');
}
function onPanelActive(old: CodeLayoutSplitNPanelInternal, panel: CodeLayoutSplitNPanelInternal) {
  console.log('onPanelActive', old?.name ?? 'null', '->', panel?.name ?? 'null');
}
function onGridActive(old: CodeLayoutSplitNGridInternal, grid: CodeLayoutSplitNGridInternal) {
  console.log('onGridActive', old?.name ?? 'null', '->', grid?.name ?? 'null');
}


function loadLayout() {
  if (splitLayoutRef.value) {
    const grid = splitLayoutRef.value.getRootGrid();
    grid.direction = 'horizontal';

    const data = localStorage.getItem('SplitLayoutDemoSaveData');
    if (props.enableSave && data) {
      //If load layout from data, need fill panel data
      splitLayoutRef.value.loadLayout(JSON.parse(data), (panel) => {
        if (panel.name === 'datahelp') {
          panel.title = `Data load and Save Help`;
          panel.tooltip = `Help`;
          panel.iconSmall = () => h(IconMarkdown);
        } else {
          count++;
          panel.title = `Panel${count}`;
          panel.tooltip = `Panel${count} tooltip`;
          panel.iconSmall = () => h(getRandomIcon());
          panel.closeType = count === 1 ? 'unSave' : 'close';
          panel.data = count;
        }
        return panel;
      });
    } else {
      const grid1 = grid.addGrid({
        name: 'grid1',
        visible: true,
        size: 0,
        closeType: 'close',
      });
      const grid2 = grid.addGrid({
        name: 'grid2',
        visible: true,
        size: 0,
        minSize: 100,
      });
      const grid3 = grid1.addGrid({
        name: 'grid3',
        visible: true,
        size: 0,
        minSize: 0,
      });
      const grid4 = grid1.addGrid({
        name: 'grid4',
        visible: true,
        size: 0,
        minSize: 100,
        canMinClose: true,
      });

      for (let i = 0; i < 8; i++) {
        count++;
        grid3.addPanel({
          title: `Panel${count}`,
          tooltip: `Panel${count} tooltip`,
          name: `panel${count}`,
          closeType: i === 0 ? 'unSave' : 'close',
          iconSmall: () => h(getRandomIcon()),
          data: i,
        });
      }

      count++;
      grid2.addPanel({
        title: `Panel with actions`,
        tooltip: `Panel${count} tooltip`,
        name: `panel${count}`,
        closeType: 'close',
        badge: '2',
        iconSmall: () => h(getRandomIcon()),
        actions: [
          {
            icon: () => h(IconSearch),
            tooltip: 'Search',
            onClick: () => {
              console.log('Search');
            },
          },
        ],
        data: count,
      });

      getDebugGridTreeText();

      if (props.enableSave) {
        grid4.addPanel({
          title: `Data load and Save Help`,
          tooltip: `Help`,
          name: `datahelp`,
          iconSmall: () => h(IconMarkdown),
        });
      }

      const file1 = splitLayoutRef.value.getPanelByName('file1')
      
      file1?.closePanel()

      grid.notifyRelayout();
    }
  }
}
function saveLayout() {
  if (props.enableSave && splitLayoutRef.value) {
    localStorage.setItem('SplitLayoutDemoSaveData', JSON.stringify(splitLayoutRef.value.saveLayout()));
  }

  splitLayoutRef.value?.getActiveGird()?.activePanel
}

onMounted(() => {
  window.addEventListener('beforeunload', saveLayout);
});
onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', saveLayout);
})
</script>

<style scoped>
h2 {
  height: 100%;
  text-align: center;
  line-height: 100px;
  margin: 0;
  color: var(--code-layout-color-text-light);
}
.demo {
  display: flex;
  flex-direction: row;
  color: var(--code-layout-color-text-light);
}
.demo-pre {
  padding: 10px;
  white-space: pre;
}
</style>
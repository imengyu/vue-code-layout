<template>
  <div class="full-container demo">
    <SplitLayout
      ref="splitLayoutRef"
      @panelClose="onPanelClose"
      @panelDrop="onPanelDrop"
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
import type { CodeLayoutPanelInternal } from '../../library/CodeLayout';
import type { CodeLayoutSplitNGridInternal, CodeLayoutSplitNInstance } from '../../library/SplitLayout/SplitN';
import SplitLayout from '../../library/SplitLayout/SplitLayout.vue';

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

function getDebugGridTreeText() {
  debugGridTreeText.value = splitLayoutRef.value?.getGridTreeDebugText() ?? '';
}

function onResetAll() {
  localStorage.setItem('SplitLayoutDemoSaveData', '');
  splitLayoutRef.value?.clearLayout();
  loadLayout();
  emit('resetAll');
}

function loadLayout() {
  if (splitLayoutRef.value) {
    const grid = splitLayoutRef.value.getRootGrid();

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
      });
      grid.addGrid({
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

      for (let i = 0; i < 4; i++) {
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
      getDebugGridTreeText();

      if (props.enableSave) {
        grid4.addPanel({
          title: `Data load and Save Help`,
          tooltip: `Help`,
          name: `datahelp`,
          iconSmall: () => h(IconMarkdown),
        });
      }

      grid.notifyRelayout();
    }
  }
}
function saveLayout() {
  if (props.enableSave) {
    localStorage.setItem('SplitLayoutDemoSaveData', JSON.stringify(splitLayoutRef.value?.saveLayout()));
  }
}

onMounted(() => {
  nextTick(() => {
    loadLayout();
  });
  window.addEventListener('beforeunload', saveLayout);
});
onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', saveLayout);
  saveLayout();
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
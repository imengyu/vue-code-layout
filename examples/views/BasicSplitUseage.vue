<template>
  <SplitLayout
    ref="splitLayout"
    :layoutData="(splitLayoutData as CodeLayoutSplitNRootGrid)"
    @panelClose="onPanelClose"
  >
    <template #tabContentRender="{ panel }">
      <ScrollRect v-if="panel.name === 'test1'">
        <div>
          <button @click="testCloseSplitLayoutPanel()">Test close this SplitLayout panel</button>
          <slot name="test1Content" />
        </div>
        <TestDropHandler />
      </ScrollRect>
      <vue-monaco-editor
        v-else-if="panel.name.startsWith('file')"
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
</template>


<script setup lang="ts">
import IconMarkdown from '../assets/icons/IconMarkdown.vue';
import IconVue from '../assets/icons/IconVue.vue';
import { ref, onMounted, h } from 'vue';
import { 
  SplitLayout, 
  type CodeLayoutSplitNInstance, 
  type CodeLayoutPanelInternal, 
  CodeLayoutSplitNRootGrid
} from 'vue-code-layout';
import { ScrollRect } from '@imengyu/vue-scroll-rect';
import TestContent1 from '../assets/text/Useage.vue?raw';
import TestContent2 from '../../README.md?raw';
import TestDropHandler from '../components/TestDropHandler.vue';

const splitLayout = ref<CodeLayoutSplitNInstance>();

const MONACO_EDITOR_OPTIONS = {
  automaticLayout: true,
  formatOnType: true,
  formatOnPaste: true,
}; 
const splitLayoutData = ref(new CodeLayoutSplitNRootGrid());

function onPanelClose(panel: CodeLayoutPanelInternal, resolve: () => void) {
  resolve();
}
function loadLayout() {
  const grid = splitLayoutData.value;
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
  splitLeft.addPanel({
    title: 'Test',
    tooltip: 'A simple test panel',
    name: 'test1',
    closeType: 'none',
    iconSmall: () => h(IconMarkdown),
  });
}
function testCloseSplitLayoutPanel() {
  const p = splitLayout.value?.getPanelByName('test1');
  if (p) {
    p.closePanel();
    console.log(p.name + ' panel closed');
  }
  else
    console.log('panel not found');
}

onMounted(() => {
  loadLayout();
});
</script>
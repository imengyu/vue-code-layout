<template>
  <SplitLayout
    :layoutData="(splitLayoutData as CodeLayoutSplitNRootGrid)"
    @panelClose="onPanelClose"
  >
    <template #tabContentRender="{ panel }">
      <GridPlaceholder :name="panel.name" color="#689" />
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
import TestContent1 from '../assets/text/Useage.vue?raw';
import TestContent2 from '../../README.md?raw';
import GridPlaceholder from '@/components/GridPlaceholder.vue';

const splitLayoutData = ref(new CodeLayoutSplitNRootGrid('centerArea2'));
splitLayoutData.value.accept = ['centerArea2'];

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

onMounted(() => {
  loadLayout();
});
</script>
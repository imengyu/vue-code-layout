<template>
  <!--main activityBar items-->
  <OverflowCollapseList 
    class="activity-bar-items"
    direction="vertical"
    :items="primary.children"
    :activeItem="primary.activePanel"
    :itemCollapseMergin="55"
    :itemMenuLabel="(p) => (p as CodeLayoutPanelInternal).title"
    @overflowItemClicked="(p) => $emit('activityBarAcitve', p as CodeLayoutPanelInternal)"
  >
    <template #item="{ item: panelGroup }">
      <CodeLayoutActionItem
        v-show="panelGroup.visible"
        :key="panelGroup.name"
        :item="panelGroup"
        :direction="direction"
        :active="panelGroup.name === primary.activePanel?.name && primarySideBar"
        @activeItem="$emit('activityBarAcitve', panelGroup)"
      />
    </template>
  </OverflowCollapseList>
</template>

<script setup lang="ts">
import { getCurrentInstance, type PropType } from 'vue';
import type { CodeLayoutPanelInternal } from './CodeLayout';
import CodeLayoutActionItem from './CodeLayoutActionItem.vue';
import OverflowCollapseList from './Components/OverflowCollapseList.vue';

const props = defineProps({
  primary: {
    type: Object as PropType<CodeLayoutPanelInternal>,
    required: true
  },
  primarySideBar: {
    type: Boolean,
    default: false
  },
  direction: {
    type: String as PropType<'left'|'right'>,
    default: 'left'
  },
});

defineEmits([ 'activityBarAcitve' ]);

const instance = getCurrentInstance();

defineExpose({
  forceUpdate() {
    //fuck
    const c = props.primary.children;
    props.primary.children = [];
    instance?.proxy?.$forceUpdate();
    props.primary.children = c;
  }
})
</script>
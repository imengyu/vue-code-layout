<template>
  <!--main activityBar items-->
  <CodeLayoutActionItem
    v-for="(panelGroup) in primary.children"
    v-show="panelGroup.visible"
    :key="panelGroup.name"
    :item="panelGroup"
    :active="panelGroup.name === primary.activePanel?.name && primarySideBar"
    @active-item="$emit('activityBarAcitve', panelGroup)"
  />
</template>

<script setup lang="ts">
import { getCurrentInstance, type PropType } from 'vue';
import type { CodeLayoutPanelInternal } from './CodeLayout';
import CodeLayoutActionItem from './CodeLayoutActionItem.vue';

const props = defineProps({
  primary: {
    type: Object as PropType<CodeLayoutPanelInternal>,
    required: true
  },
  primarySideBar: {
    type: Boolean,
    default: false
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
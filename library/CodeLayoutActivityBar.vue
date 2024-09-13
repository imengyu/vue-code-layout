<template>
  <!--main activityBar items-->
  <CodeLayoutActionItem
    v-for="(panelGroup) in primary.children"
    v-show="panelGroup.visible"
    :key="panelGroup.name"
    :item="panelGroup"
    :direction="direction"
    :active="panelGroup.name === primary.activePanel?.name && primarySideBar"
    @activeItem="$emit('activityBarAcitve', panelGroup)"
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
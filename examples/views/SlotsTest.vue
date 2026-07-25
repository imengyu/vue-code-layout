<template>
  <BasicUseage ref="base" :enableSave="saveData" renderSlots>
    <template #center>
      <SplitLayout renderSlots :enableSave="saveData" :showData="false" @resetAll="($refs.base as any).onResetAll()">
      </SplitLayout>
    </template>
  </BasicUseage>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import BasicUseage from './BasicUseage.vue'
import SplitLayout from './SplitLayoutTest.vue'

const saveData = ref(false);
</script>

<style scoped>
.title-bar-extra {
  padding: 2px 10px;
  display: flex;
  flex-direction: row;
}
</style>
<template>
  <input v-model="saveData" type="checkbox">Save data</input>
  
  <BasicUseage ref="base" :enableSave="saveData">
    <template #center>
      <SplitLayout :enableSave="saveData" :showData="false" @resetAll="($refs.base as any).onResetAll()" />
    </template>
  </BasicUseage>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import BasicUseage from './BasicUseage.vue'
import SplitLayout from './SplitLayout.vue'

const saveData = ref(true);
</script>
<template>
  <BasicUseage ref="base" :enableSave="saveData">
    <template #extraActions>
      <div class="title-bar-extra">
        <input v-model="saveData" type="checkbox">Save data</input>
      </div>
    </template>
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

<style scoped>
.title-bar-extra {
  padding: 2px 10px;
  display: flex;
  flex-direction: row;
}
</style>
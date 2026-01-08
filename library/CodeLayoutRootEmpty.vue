<template>
  <div class="code-root-empty">
    You did not provide layoutData.
  </div>
</template>

<script setup lang="ts">
  defineProps({
    showEmpty: {
      type: Boolean,
      default: true
    }
  })
</script>

<style lang="scss">
.code-root-empty {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  font-size: 12px;
  color: var(--code-layout-color-text);
}
</style>
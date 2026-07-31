<template>
  <slot />
</template>

<script setup lang="ts">
import { provide } from 'vue';
import { FLAG_CODE_LAYOUT, SYMBOL_DRAG_FLAG } from './Composeable/DragDrop';

provide(SYMBOL_DRAG_FLAG, FLAG_CODE_LAYOUT);
</script>
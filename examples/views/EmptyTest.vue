<template>
  <textarea v-model="text1"></textarea>
  <input v-model="text2" type="text" />
</template>

<script setup lang="ts">
import { ref } from 'vue';

const text1 = ref('textareatextareatextareatextarea');
const text2 = ref('inputinput');
</script>
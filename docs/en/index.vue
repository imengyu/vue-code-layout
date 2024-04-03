<template>
  <div class="big-home-area">
    <div class="big-title">
      <h1>{{ title }}</h1>
      <p class="big">{{ description }}</p>
      <p></p>
    </div>
    <div class="big-start">
      <button class="primary" @click="goStart">Get started</button>
      <button @click="goView">View Demo</button>
    </div>
    <div class="big-demo">
      <img :src="Img" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import Img from "../../screenshot/first.jpg";
import { useData } from 'vitepress'

const { title, description } = useData()

function goStart() {
  location.href = './guide/start.html'
}
function goView() {
  window.open('https://imengyu.top/pages/vue-code-layout-demo/');
}
</script>

<style lang="scss">
@import '../index.scss';
</style>
<template>
  <div class="test">
    <div class="test-top">
      <div>
        <h1>Vue Code layout</h1>
        <router-link :to="{ name: 'BasicUseage' }" class="link first">Base Layou useage</router-link>
        <router-link :to="{ name: 'SplitLayout' }" class="link first">Split Layout</router-link>
        <router-link :to="{ name: 'DataSaveAndLoad' }" class="link first">Load and save</router-link>
        <!-- <router-link :to="{ name: 'Theme' }">Custom Style</router-link> -->
      </div>
      <div>
        <a href="https://www.npmjs.com/package/vue-code-layout" target="_blank"><img class="m-1" src="https://img.shields.io/npm/v/vue-code-layout.svg?style=for-the-badge" alt="vue-marquee-text-component npm"></a>
        <a href="https://github.com/imengyu/vue-code-layout/blob/master/LICENSE.md" target="_blank"><img alt="GitHub License" src="https://img.shields.io/github/license/imengyu/vue-code-layout?style=for-the-badge"></a>
        <a href="https://www.npmjs.com/package/vue-code-layout" target="_blank"><img alt="NPM Downloads" src="https://img.shields.io/npm/d18m/%40imengyu%2Fvue3-context-menu?style=for-the-badge"></a>
      </div>
    </div>
    <div class="test-host">
      <router-view />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({})
</script>

<style lang="scss">
@import "../library/Scss/Base.scss";

html, body, #app {
  position: relative;
  width: 100%;
  margin: 0;
}
.test {
  position: relative;

  .test-host {
    margin-top: 10px;
    margin-left: 0;
    margin-right: 0;
    height: 86vh;
  }
  .test-top {
    padding-top: 20px;
    padding-right: 150px;
    height: 40px;
    margin-left: 80px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;

    > div {
      display: flex;
      flex-direction: row;
      align-items: flex-end;

      img {
        margin-left: 10px;
      }
    }

    h1 {
      margin: 0;
      color: #000;
      margin-right: 20px;
    }
    .link {
      margin: 0 15px;
      color: #1a7ff1;
      text-decoration: underline;

      &.first {
        margin-left: 0;
      }
    }
  }
}

.full-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: var(--code-layout-color-background);
}
.horbox {
  display: flex;
  flex-direction: row;
  justify-content: center;
}
.box1 {
  padding: 60px 0;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  user-select: none;
  border: 1px solid #3676ff;
  background-color: #89bffc;
}
.box3 {
  position: relative;
  padding: 60px 0;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  user-select: none;
  border: 1px solid #ff9252;
  background-color: #ffefbc;
}
.box4 {
  padding: 10px 0;
  text-align: center;
  font-size: 14px;
  border: 1px dashed #ececec;
  background-color: #dadada;
}
.box6 {
  padding: 60px 0;
  text-align: center;
  font-size: 18px;
  user-select: none;
  color: #000;
  background-color: rgb(245, 245, 245);
  border: 1px dashed #7e7e7e;
}
.box5 {
  padding: 60px 0;
  text-align: center;
  font-size: 18px;
  user-select: none;
  color: #fff;
  background-color: #7e7e7e;
  border: 1px dashed #ececec;
}
.box2 {
  width: 80%;
  padding: 20px 60px;
  margin: 0 auto;
  margin-top: 10px;
  border-radius: 10px;
  background-color: #777777;
  color: #fff;
}
code {
  border-radius: 10px;
}
.grid {
  display: grid;
  grid-template-columns: 33.33% 33.33% 33.33%;
  grid-template-rows: 33.33% 33.33% 33.33%;

  div {
    position: relative;
    padding: 10px;
    text-align: center;
    font-size: 13px;
    user-select: none;
    border: 1px solid #ff9252;
    background-color: #ffefbc;
  }
}

@media screen and (max-width: 1200px) {
  .test {
    .test-top {
      height: 90px;
    }
  }
}
@media screen and (max-width: 800px) {
  .test {
    .test-top {
      height: 100px;
      margin-left: 100px;

      h1 {
        display: block;
        font-size: 27px;
      }
      a {
        margin: 0 10px;
      }
    }
  }
  .fork-img img {
    width: 100px;
    height: 100px;
  }
  .horbox {
    flex-direction: column;
  }
}

@media screen and (max-width: 425px) {
  .test {
    .test-top {
      margin-left: 80px;
      height: 120px;

      h1 {
        font-size: 22px;
      }
    }
  }
  .fork-img img {
    width: 80px;
    height: 80px;
  }
}
</style>

<template>
  <div class="app-container">
    <header class="app-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="app-title">
            <span class="title-icon">⚙️</span>
            Vue Code Layout
          </h1>
          <nav class="nav-menu">
            <router-link :to="{ name: 'BasicUseage' }" class="nav-link">
              <span class="link-icon">🏗️</span>
              Base Layout
            </router-link>
            <router-link :to="{ name: 'SplitLayout' }" class="nav-link">
              <span class="link-icon">🔀</span>
              Split Layout
            </router-link>
            <router-link :to="{ name: 'DataSaveAndLoad' }" class="nav-link">
              <span class="link-icon">💾</span>
              Load & Save
            </router-link>
            <router-link :to="{ name: 'SlotsTest' }" class="nav-link">
              <span class="link-icon">🧩</span>
              Slots
            </router-link>
            <!-- <router-link :to="{ name: 'Theme' }" class="nav-link">
              <span class="link-icon">🎨</span>
              Custom Style
            </router-link> -->
          </nav>
        </div>
        <div class="header-right">
          <div class="social-badges">
            <a href="https://www.npmjs.com/package/vue-code-layout" target="_blank" class="badge-link">
              <img src="https://img.shields.io/npm/v/vue-code-layout.svg?style=for-the-badge" alt="npm version">
            </a>
            <a href="https://github.com/imengyu/vue-code-layout/blob/master/LICENSE.md" target="_blank" class="badge-link">
              <img alt="GitHub License" src="https://img.shields.io/github/license/imengyu/vue-code-layout?style=for-the-badge">
            </a>
            <a href="https://www.npmjs.com/package/vue-code-layout" target="_blank" class="badge-link">
              <img alt="NPM Downloads" src="https://img.shields.io/npm/d18m/%40imengyu%2Fvue3-context-menu?style=for-the-badge">
            </a>
          </div>
        </div>
      </div>
    </header>
    <main class="app-main">
      <div class="content-container">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({})
</script>

<style lang="scss">
@use "../library/Scss/Base.scss" as *;

// 颜色变量定义
$bg-primary: #1a1a1a;
$bg-secondary: #2d2d2d;
$bg-tertiary: #404040;
$bg-light: rgba(255, 255, 255, 0.95);
$text-primary: #e0e0e0;
$text-secondary: #b0b0b0;
$text-muted: #808080;
$accent-primary: #666666;
$accent-hover: #888888;
$border-color: #333333;
$shadow-color: rgba(0, 0, 0, 0.3);

// 全局样式重置和基础设置
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body, #app {
  width: 100%;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: $bg-primary;
  color: $text-primary;
}

// 主容器
.app-container {
  display: flex;
  flex-direction: column;
}
// 头部样式
.app-header {
  background: $bg-secondary;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px $shadow-color;
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;

  .header-content {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
    
    .header-left {
      display: flex;
      align-items: center;
      gap: 2rem;
      flex-wrap: wrap;
    }
  }
}


// 应用标题
.app-title {
  font-size: 1.8rem;
  font-weight: 700;
  background: linear-gradient(135deg, $accent-primary 0%, $accent-hover 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;

  .title-icon {
    font-size: 2rem;
  }
}

// 导航菜单
.nav-menu {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;

  .nav-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    border-radius: 25px;
    text-decoration: none;
    color: $text-secondary;
    font-weight: 500;
    transition: all 0.3s ease;
    background: rgba($accent-primary, 0.1);
    border: 2px solid transparent;

    &:hover {
      background: linear-gradient(135deg, $accent-primary 0%, $accent-hover 100%);
      color: $bg-primary;
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba($accent-primary, 0.3);
    }

    &.router-link-active {
      background: linear-gradient(135deg, $accent-primary 0%, $accent-hover 100%);
      color: $bg-primary;
      box-shadow: 0 4px 15px rgba($accent-primary, 0.2);
    }
    .link-icon {
      font-size: 1.1rem;
    }
  }
}

// 社交徽章
.social-badges {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;

  .badge-link {
    display: inline-block;
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.05);
    } 
    img {
      display: block;
    }
  }
}

// 主内容区域
.app-main {
  flex: 1;
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: flex-start;

  .content-container {
    position: relative;
    width: 100%;
    max-width: 1400px;
    background: $bg-secondary;
    backdrop-filter: blur(10px);
    border-radius: 20px;
    box-shadow: 0 20px 60px $shadow-color;
    overflow: hidden;
    height: calc(86vh - 4rem);
    border: 1px solid $border-color;
  }
}

button {
  padding: 5px 10px;
  background-color: var(--code-layout-color-bg);
  border: none;
  background-color: var(--code-layout-color-background-hover); 
  color: var(--code-layout-color-text); 
  cursor: pointer;

  &:hover {
    background-color: var(--code-layout-color-background-hover-light); 
  }
}
// 容器样式
.horbox {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

// 代码样式
code {
  border-radius: 8px;
  background-color: $bg-primary !important;
  color: $text-primary !important;
  padding: 0.2rem 0.4rem;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}

// 响应式设计
@media screen and (max-width: 1200px) {
  .header-content {
    padding: 0 1.5rem;
  }
  
  .header-left {
    gap: 1rem;
  }
  
  .app-title {
    font-size: 1.5rem;
  }
}

@media screen and (max-width: 992px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .nav-menu {
    width: 100%;
    justify-content: flex-start;
  }
  
  .nav-link {
    flex: 1;
    min-width: 120px;
    justify-content: center;
  }
  
  .social-badges {
    width: 100%;
    justify-content: center;
  }
}

@media screen and (max-width: 768px) {
  .app-header {
    padding: 1rem 0;
  }
  
  .header-content {
    padding: 0 1rem;
  }
  
  .app-title {
    font-size: 1.3rem;
  }
  
  .title-icon {
    font-size: 1.5rem;
  }
  
  .nav-menu {
    gap: 0.5rem;
  }
  
  .nav-link {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
  }
  
  .app-main {
    padding: 1rem;
  }
  
  .content-container {
    min-height: calc(86vh - 2rem);
  }
  
  .social-badges {
    gap: 0.5rem;
  }
  
  .badge-link img {
    max-width: 100%;
    height: auto;
  }
}

@media screen and (max-width: 480px) {
  .app-title {
    font-size: 1.2rem;
  }
  
  .nav-link {
    min-width: auto;
    padding: 0.5rem 0.8rem;
    font-size: 0.85rem;
  }
  
  .link-icon {
    display: none;
  }
}
</style>

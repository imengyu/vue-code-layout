<!--
  CodeLayoutShell —— 外壳骨架：标题栏 / 活动栏挂载位 / 状态栏 + 四区域切分（ShellSplitter）。

  替代原 `CodeLayoutBase.vue`（解决 S1–S4）：
  * 四区域切分由 `ShellSplitter` 自实现，不再借用 SplitLayout。
  * 结构由 `buildShellLayout(config)` 纯函数派生，任何 config 变化只是输入变化，
    显隐/尺寸不再整树重建、区域内容不卸载（解决 S2）。
  * 本组件只负责「外壳 + 具名插槽分发」，区域内部（组/面板）由上层通过插槽注入
    （阶段 2 用占位块验证，阶段 3 接入真实渲染）。
-->
<template>
  <div class="code-layout-root">
    <slot name="titleBarTop" />
    <div v-show="config.titleBar" class="code-layout-title-bar">
      <div>
        <slot name="titleBarIcon" />
        <slot v-if="config.menuBar" name="titleBarMenu" />
      </div>
      <div>
        <slot name="titleBarCenter" />
      </div>
      <div>
        <slot name="titleBarRight" />
      </div>
    </div>
    <slot name="titleBarBottom" />

    <!-- 活动栏 + 区域切分 -->
    <div class="code-layout-activity">
      <!-- 主活动栏（左） -->
      <div
        v-show="config.activityBar && config.primarySideBarPosition === 'left' && config.activityBarPosition === 'side'"
        :class="['code-layout-activity-bar', 'left']"
      >
        <slot name="activityBar" />
      </div>
      <!-- 第二活动栏（左，主侧栏在右时） -->
      <div
        v-show="config.primarySideBarPosition === 'right' && config.secondaryActivityBarPosition === 'side'"
        :class="['code-layout-activity-bar', 'left']"
      >
        <slot name="activityBarSecondary" />
      </div>

      <!-- 区域切分 -->
      <div class="code-layout-inner-0">
        <ShellSplitter :node="shellLayout" :config="config">
          <template v-for="(_, name) in $slots" #[name]="data">
            <slot :name="name" v-bind="data" />
          </template>
        </ShellSplitter>
      </div>

      <!-- 主活动栏（右） -->
      <div
        v-show="config.activityBar && config.primarySideBarPosition === 'right' && config.activityBarPosition === 'side'"
        :class="['code-layout-activity-bar', 'right']"
      >
        <slot name="activityBar" />
      </div>
      <!-- 第二活动栏（右，主侧栏在左时） -->
      <div
        v-show="config.primarySideBarPosition === 'left' && config.secondaryActivityBarPosition === 'side'"
        :class="['code-layout-activity-bar', 'right']"
      >
        <slot name="activityBarSecondary" />
      </div>
    </div>

    <!-- 状态栏 -->
    <div v-show="config.statusBar" class="code-layout-status">
      <slot name="statusBar">
        <div class="left">
          <slot name="statusBarLeft" />
        </div>
        <div class="right">
          <slot name="statusBarRight" />
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, type PropType } from "vue";
import type { CodeLayoutConfig } from "./Types";
import { buildShellLayout, type ShellSplitNode } from "./Layout/shellLayout";
import ShellSplitter from "./ShellSplitter.vue";

defineSlots<Record<string, (props: any) => any>>();

const props = defineProps({
  config: {
    type: Object as PropType<CodeLayoutConfig>,
    required: true,
  },
});

// buildShellLayout 根恒为 split 节点；结构只随 panelAlignment/panelPosition/
// primarySideBarPosition 改变而变（低频结构性变化，允许重挂，见 §7.3）。
const shellLayout = computed(() => buildShellLayout(props.config) as ShellSplitNode);
</script>

<style lang="scss">
@use './Scss/Base.scss' as *;
@use './Scss/Menu.scss' as *;

.code-layout-root {
  position: relative;
}
// 区域切分宿主：占满活动栏之间的剩余空间，作为 ShellSplitter 的定尺容器。
.code-layout-activity > .code-layout-inner-0 {
  flex: 1;
  height: 100%;
  min-width: 0;
  overflow: hidden;
}
</style>

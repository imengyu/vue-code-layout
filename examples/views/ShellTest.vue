<!--
  临时测试页（阶段 2 外壳验收用）

  直接挂载新实现的 CodeLayoutShell，区域内容用占位块渲染，用来人工核对：
  * 24 种外壳组合（panelAlignment × panelPosition × primarySideBarPosition）
  * 三区域显隐切换（内容不卸载：观察占位块里的「挂载时刻」计数不变）
  * 拖动区域分隔条 / 拖到最小值以下自动隐藏
  * bottomPanelMaximize 开关 + 拖底栏解除最大化
  * 标题栏 / 状态栏 / 活动栏开关与位置

  注意：CodeLayoutShell 尚未从 index.ts 对外导出（按计划阶段 6 才切换），
  这里直接以相对路径引入。阶段 3 接入真实区域渲染后本页可删除。
-->
<template>
  <div class="shell-test">
    <!-- 控制面板 -->
    <div class="controls">
      <div class="row">
        <label>panelAlignment</label>
        <select v-model="config.panelAlignment">
          <option v-for="v in alignments" :key="v" :value="v">{{ v }}</option>
        </select>
      </div>
      <div class="row">
        <label>panelPosition</label>
        <select v-model="config.panelPosition">
          <option value="bottom">bottom</option>
          <option value="top">top</option>
        </select>
      </div>
      <div class="row">
        <label>primarySideBarPosition</label>
        <select v-model="config.primarySideBarPosition">
          <option value="left">left</option>
          <option value="right">right</option>
        </select>
      </div>
      <div class="row checks">
        <label><input type="checkbox" v-model="config.primarySideBar" /> primarySideBar</label>
        <label><input type="checkbox" v-model="config.secondarySideBar" /> secondarySideBar</label>
        <label><input type="checkbox" v-model="config.bottomPanel" /> bottomPanel</label>
        <label><input type="checkbox" v-model="config.bottomPanelMaximize" /> bottomPanelMaximize</label>
      </div>
      <div class="row checks">
        <label><input type="checkbox" v-model="config.titleBar" /> titleBar</label>
        <label><input type="checkbox" v-model="config.menuBar" /> menuBar</label>
        <label><input type="checkbox" v-model="config.statusBar" /> statusBar</label>
        <label><input type="checkbox" v-model="config.activityBar" /> activityBar</label>
      </div>
      <div class="row checks">
        <label>activityBarPosition</label>
        <select v-model="config.activityBarPosition">
          <option value="side">side</option>
          <option value="top">top</option>
          <option value="bottom">bottom</option>
          <option value="hidden">hidden</option>
        </select>
        <label>secondaryActivityBarPosition</label>
        <select v-model="config.secondaryActivityBarPosition">
          <option value="side">side</option>
          <option value="top">top</option>
          <option value="bottom">bottom</option>
          <option value="hidden">hidden</option>
        </select>
      </div>
      <div class="row live">
        <span>primaryWidth: {{ config.primarySideBarWidth.toFixed(1) }}%</span>
        <span>secondaryWidth: {{ config.secondarySideBarWidth.toFixed(1) }}%</span>
        <span>bottomHeight: {{ config.bottomPanelHeight.toFixed(1) }}%</span>
      </div>
    </div>

    <!-- 外壳 -->
    <div class="shell-host">
      <CodeLayoutShell :config="config">
        <template #titleBarIcon><div class="ph-title">⚙️ Shell</div></template>
        <template #titleBarMenu><div class="ph-title">Menu</div></template>
        <template #titleBarCenter><div class="ph-title">title center</div></template>
        <template #titleBarRight><div class="ph-title">right</div></template>

        <template #activityBar><div class="ph-activity">A<br />c<br />t</div></template>
        <template #activityBarSecondary><div class="ph-activity">2</div></template>

        <template #primarySideBar>
          <Placeholder region="primarySideBar" color="#264f78" />
        </template>
        <template #secondarySideBar>
          <Placeholder region="secondarySideBar" color="#4b3a6b" />
        </template>
        <template #bottomPanel>
          <Placeholder region="bottomPanel" color="#3a5a40" />
        </template>
        <template #centerArea>
          <Placeholder region="centerArea" color="#2a2a2a" />
        </template>

        <template #statusBarLeft><div class="ph-status">status left</div></template>
        <template #statusBarRight><div class="ph-status">status right</div></template>
      </CodeLayoutShell>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, defineComponent, h, ref } from 'vue';
import CodeLayoutShell from '../../library/CodeLayoutShell.vue';
import { defaultCodeLayoutConfig } from '../../library/Consts';
import type { CodeLayoutConfig } from '../../library/Types';

const alignments: CodeLayoutConfig['panelAlignment'][] = [
  'left', 'center', 'right', 'justify', 'left-side', 'right-side',
];

const config = reactive<CodeLayoutConfig>({
  ...defaultCodeLayoutConfig,
  secondarySideBar: true,
});

/**
 * 区域占位块：显示区域名 + 当前尺寸 + 「首次挂载时刻」。
 * 切换显隐后若时刻不变，说明组件未被卸载重建（S2 验收点）。
 */
const Placeholder = defineComponent({
  name: 'Placeholder',
  props: {
    region: { type: String, required: true },
    color: { type: String, default: '#333' },
  },
  setup(props) {
    const mountedAt = ref(new Date().toLocaleTimeString());
    return () =>
      h('div', {
        class: 'ph-region',
        style: { backgroundColor: props.color },
      }, [
        h('div', { class: 'ph-name' }, props.region),
        h('div', { class: 'ph-meta' }, `mounted @ ${mountedAt.value}`),
      ]);
  },
});
</script>

<style lang="scss">
.shell-test {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;

  .controls {
    flex: 0 0 auto;
    padding: 8px 12px;
    background: #1e1e1e;
    border-bottom: 1px solid #333;
    font-size: 12px;
    color: #ccc;

    .row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 6px;
      flex-wrap: wrap;

      &:last-child { margin-bottom: 0; }
      label { display: inline-flex; align-items: center; gap: 4px; }
      select { background: #2d2d2d; color: #ccc; border: 1px solid #444; padding: 2px 6px; }
      &.live span { font-family: monospace; color: #6a9955; }
    }
  }

  .shell-host {
    position: relative;
    flex: 1;
    min-height: 0;
    border-top: 1px solid #000;
  }
}

// 占位内容样式
.ph-region {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #eee;
  gap: 6px;

  .ph-name { font-size: 14px; font-weight: 600; }
  .ph-meta { font-size: 11px; opacity: 0.7; font-family: monospace; }
}
.ph-title { padding: 0 10px; font-size: 12px; color: #ccc; }
.ph-activity {
  width: 45px;
  padding-top: 10px;
  text-align: center;
  color: #ccc;
  font-size: 12px;
}
.ph-status { padding: 0 10px; font-size: 12px; color: #fff; }
</style>

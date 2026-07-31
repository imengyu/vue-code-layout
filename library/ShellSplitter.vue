<!-- eslint-disable vue/no-mutating-props -->
<!--
  ShellSplitter —— 自实现的递归 N 分栏，替代原 CodeLayoutBase 里借用的 SplitLayout（解决 S1）。

  * 布局由 `planShellSplitter` 把 `ShellNode` + config 翻译为每个子项的 flex 值；
    CSS 负责排版，容器尺寸变化无需任何手工 relayout（解决 S2/R1）。
  * 显隐用 `v-show`：内容 `display:none` 但组件实例不卸载（解决 S2）。
  * 分隔条拖动 = 单向数据流：直接改写 config 字段（primarySideBarWidth 等），
    config 再驱动渲染，彻底消除原实现的 `nextNoChangeLayout` 哨兵（解决 S3）。
  * 拖到最小值以下 → 置 config.<region> = false（保留 canMinClose 手感，§7.2）。
  * 底栏最大化时拖底栏分隔条 → 解除最大化（§7.4），作为用户手势的直接后果，
    不再写成 watch(size) 的副作用回环（解决 S4）。
-->
<template>
  <div ref="rootRef" :class="['cl-shell-split', node.direction]">
    <template v-for="(child, i) in plan.children" :key="child.key">
      <!-- 嵌套 split：把 flex 尺寸作为样式挂到子 splitter 根元素上 -->
      <ShellSplitter
        v-if="child.slot === null && child.node.kind === 'split'"
        :node="child.node"
        :config="config"
        :style="cellStyle(child)"
      >
        <template v-for="(_, name) in $slots" #[name]="data">
          <slot :name="name" v-bind="data" />
        </template>
      </ShellSplitter>
      <!-- 区域 slot 叶子 -->
      <div
        v-else
        v-show="child.visible"
        :class="['cl-shell-cell', child.slot]"
        :style="cellStyle(child)"
        :data-slot="child.slot ?? undefined"
      >
        <slot :name="child.slot!" />
      </div>
      <!-- 相邻可调区域间的分隔条 -->
      <div
        v-if="draggerAfter(i)"
        :class="[
          'code-layout-split-dragger resize cl-shell-dragger',
          node.direction === 'row' ? 'horizontal' : 'vertical',
          { active: activeDraggerIndex === i },
        ]"
        @mousedown="(e) => onDraggerDown(e, draggerAfter(i)!)"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, type PropType } from "vue";
import type { CodeLayoutConfig } from "./Types";
import type { ShellSplitNode } from "./Layout/shellLayout";
import {
  planShellSplitter,
  type ShellChildLayout,
  type ShellDragger,
  type DraggerTarget,
} from "./Layout/shellSizing";
import { useElementSize } from "./Composeable/useElementSize";
import { createMouseDragHandler } from "./Composeable/MouseHandler";
import type { Vector2 } from "./Composeable/Vector2";

defineOptions({ name: "ShellSplitter" });
// 递归转发全部具名插槽；不声明会触发 $slots 的循环类型推导 (TS7022)。
defineSlots<Record<string, (props: any) => any>>();

const props = defineProps({
  node: {
    type: Object as PropType<ShellSplitNode>,
    required: true,
  },
  config: {
    type: Object as PropType<CodeLayoutConfig>,
    required: true,
  },
});

const rootRef = ref<HTMLElement>();
const { width, height } = useElementSize(rootRef);

const plan = computed(() => planShellSplitter(props.node, props.config));

function cellStyle(child: ShellChildLayout): Record<string, string> {
  const minKey = props.node.direction === "row" ? "minWidth" : "minHeight";
  return {
    flex: child.flex,
    [minKey]: `${child.minPx}px`,
    overflow: "hidden",
  };
}

function draggerAfter(index: number): ShellDragger | undefined {
  return plan.value.draggers.find((d) => d.index === index);
}

// ── 分隔条拖动 ──────────────────────────────────────────────
const activeDraggerIndex = ref<number>(-1);

interface DragState {
  spec: ShellDragger;
  axisPx: number;
  startPrevPx: number;
  startNextPx: number;
}
let dragState: DragState | null = null;

const axisSize = (el: Element) =>
  props.node.direction === "row"
    ? (el as HTMLElement).offsetWidth
    : (el as HTMLElement).offsetHeight;

const onDraggerDown = createMouseDragHandler<ShellDragger>({
  onDown(e, spec) {
    if (!spec) return false;
    const draggerEl = e.currentTarget as HTMLElement;
    const prevEl = draggerEl.previousElementSibling;
    const nextEl = draggerEl.nextElementSibling;
    if (!prevEl || !nextEl) return false;
    dragState = {
      spec,
      axisPx: props.node.direction === "row" ? width.value : height.value,
      startPrevPx: axisSize(prevEl),
      startNextPx: axisSize(nextEl),
    };
    activeDraggerIndex.value = spec.index;
    return true;
  },
  onMove(_down: Vector2, moved: Vector2) {
    if (!dragState) return;
    const delta = props.node.direction === "row" ? moved.x : moved.y;
    const { spec, axisPx, startPrevPx, startNextPx } = dragState;
    // 左/上侧区域随 +delta 变大；右/下侧区域随 -delta 变大。
    if (spec.left) applyTarget(spec.left, startPrevPx + delta, axisPx);
    if (spec.right) applyTarget(spec.right, startNextPx - delta, axisPx);
  },
  onUp() {
    dragState = null;
    activeDraggerIndex.value = -1;
  },
});

/**
 * 把某个可调区域调整到 `newPx` 像素（沿主轴）。
 *
 * * 底栏在最大化状态下被拖动 → 先解除最大化（§7.4），再按像素落尺寸。
 * * 拖到最小值一半以下 → 收起该区域（置 config.<region> = false，§7.2）。
 */
function applyTarget(target: DraggerTarget, newPx: number, axisPx: number) {
  const config = props.config;
  if (axisPx <= 0) return;

  // 底栏最大化时，任何对底栏边界的拖动都解除最大化（用户手势的直接后果）。
  if (target.region === "bottomPanel" && config.bottomPanelMaximize)
    config.bottomPanelMaximize = false;

  const minPx = (config[target.minField] as number) || 0;
  if (newPx < minPx * 0.5) {
    // 拖到远小于最小值 → 收起区域。
    config[target.visibleField] = false;
    return;
  }
  const px = Math.max(newPx, minPx);
  const percent = Math.min(99, Math.max(1, (px / axisPx) * 100));
  config[target.sizeField] = percent;
}
</script>

<style lang="scss">
.cl-shell-split {
  position: relative;
  display: flex;
  width: 100%;
  height: 100%;
  align-items: stretch;

  &.row {
    flex-direction: row;
  }
  &.column {
    flex-direction: column;
  }

  > .cl-shell-cell {
    position: relative;
  }

  > .cl-shell-dragger {
    position: relative;
    flex: 0 0 var(--code-layout-border-size);
    background-color: var(--code-layout-color-border-background);
    z-index: 10;
    -webkit-user-select: none;
    user-select: none;
    overflow: visible;

    &::after {
      position: absolute;
      content: "";
      transition: background-color ease-in-out 0.2s;
      z-index: 10;
    }
    &.resize:hover::after,
    &.active::after {
      background-color: var(--code-layout-color-highlight);
    }

    &.horizontal {
      width: var(--code-layout-border-size);
      cursor: ew-resize;
      &::after {
        top: 0;
        bottom: 0;
        left: calc(var(--code-layout-border-size-dragger) / -2);
        width: var(--code-layout-border-size-dragger);
      }
    }
    &.vertical {
      height: var(--code-layout-border-size);
      cursor: ns-resize;
      &::after {
        left: 0;
        right: 0;
        top: calc(var(--code-layout-border-size-dragger) / -2);
        height: var(--code-layout-border-size-dragger);
      }
    }
  }
}
</style>

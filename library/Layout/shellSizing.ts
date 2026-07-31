/**
 * 外壳分栏的尺寸 / 分隔条规划 —— 纯函数（配合 `buildShellLayout` 与 `ShellSplitter.vue`）。
 *
 * 布局本身用 CSS flex（`flex-basis` 百分比 + `min-*` 像素）表达，容器尺寸变化由
 * 浏览器排版，无需任何手工 relayout（对照原实现 S2/R1）。本模块只负责把
 * `ShellNode` + `CodeLayoutConfig` 翻译成「每个子项的 flex 值」与「哪些边界可拖」，
 * 拖动时的像素→百分比换算由组件在拿到实时容器像素后完成。
 */

import type { CodeLayoutConfig } from "../Types";
import type { ShellNode, ShellSlot, ShellSplitNode } from "./shellLayout";

export type ResizableRegion =
  | "primarySideBar"
  | "secondarySideBar"
  | "bottomPanel";

export interface DraggerTarget {
  region: ResizableRegion;
  /** 该区域尺寸所在的 config 字段（百分比语义）。 */
  sizeField: "primarySideBarWidth" | "secondarySideBarWidth" | "bottomPanelHeight";
  /** 该区域最小像素所在的 config 字段。 */
  minField: "primarySideBarMinWidth" | "secondarySideBarMinWidth" | "bottomPanelMinHeight";
  /** 该区域显隐所在的 config 字段（拖到最小值以下时置 false）。 */
  visibleField: ResizableRegion;
}

export interface ShellChildLayout {
  node: ShellNode;
  key: string;
  slot: ShellSlot | null;
  /** `v-show` 内容是否显示；隐藏时 `display:none`，但组件实例不卸载（解决 S2）。 */
  visible: boolean;
  /** 是否占据布局空间（用于判定相邻边界是否成立）。 */
  present: boolean;
  /** flex 简写值，例如 `'1 1 0'` 或 `'0 0 20%'`。 */
  flex: string;
  /** 沿主轴的最小像素；0 表示不限制。 */
  minPx: number;
}

export interface ShellDragger {
  /** 位于 `children[index]` 与 `children[index+1]` 之间。 */
  index: number;
  /** 左/上侧的可调区域（该侧为 stretch 时为 null，拖动时由它吸收）。 */
  left: DraggerTarget | null;
  /** 右/下侧的可调区域。 */
  right: DraggerTarget | null;
}

export interface ShellSplitterPlan {
  children: ShellChildLayout[];
  draggers: ShellDragger[];
}

const REGION_META: Record<ResizableRegion, DraggerTarget> = {
  primarySideBar: {
    region: "primarySideBar",
    sizeField: "primarySideBarWidth",
    minField: "primarySideBarMinWidth",
    visibleField: "primarySideBar",
  },
  secondarySideBar: {
    region: "secondarySideBar",
    sizeField: "secondarySideBarWidth",
    minField: "secondarySideBarMinWidth",
    visibleField: "secondarySideBar",
  },
  bottomPanel: {
    region: "bottomPanel",
    sizeField: "bottomPanelHeight",
    minField: "bottomPanelMinHeight",
    visibleField: "bottomPanel",
  },
};

/** 该节点子树是否包含指定 slot。 */
function contains(node: ShellNode, slot: ShellSlot): boolean {
  if (node.kind === "slot") return node.slot === slot;
  return node.children.some((c) => contains(c, slot));
}

/** 该 slot 是否是「侧栏/底栏」这类可拖拽调尺寸的区域。 */
function regionOf(slot: ShellSlot): ResizableRegion | null {
  return slot === "primarySideBar" ||
    slot === "secondarySideBar" ||
    slot === "bottomPanel"
    ? slot
    : null;
}

/**
 * 计算某个 split 节点的子项布局与分隔条。
 *
 * @param node    当前 split 节点
 * @param config  布局配置
 */
export function planShellSplitter(
  node: ShellSplitNode,
  config: CodeLayoutConfig,
): ShellSplitterPlan {
  const axis = node.direction; // 'row' → 宽度，'column' → 高度
  const centerMin = axis === "row" ? config.centerMinWidth : config.centerMinHeight;
  // 底栏最大化：中心区让位、底栏占满（见 plan.md §7.4）。
  const maximized = config.bottomPanel && config.bottomPanelMaximize;

  const children: ShellChildLayout[] = node.children.map((child, i) => {
    if (child.kind === "split") {
      // split 常规为 stretch；最大化时，只含 center（不含 bottom）的子树整体让位。
      const collapse = maximized && contains(child, "centerArea") && !contains(child, "bottomPanel");
      return {
        node: child,
        key: `split-${i}`,
        slot: null,
        visible: true,
        present: true,
        flex: collapse ? "0 0 0px" : "1 1 0",
        minPx: 0,
      };
    }

    const slot = child.slot;
    switch (slot) {
      case "centerArea":
        // 中心区恒占位（即便被最大化遮挡也保留 0 宽，以维持底栏分隔条边界）。
        return {
          node: child, key: slot, slot, visible: true, present: true,
          flex: maximized ? "0 0 0px" : "1 1 0",
          minPx: maximized ? 0 : centerMin,
        };
      case "bottomPanel":
        return {
          node: child, key: slot, slot,
          visible: config.bottomPanel, present: config.bottomPanel,
          flex: maximized ? "1 1 0" : `0 0 ${config.bottomPanelHeight}%`,
          minPx: maximized ? 0 : config.bottomPanelMinHeight,
        };
      case "primarySideBar":
        return {
          node: child, key: slot, slot,
          visible: config.primarySideBar, present: config.primarySideBar,
          flex: `0 0 ${config.primarySideBarWidth}%`,
          minPx: config.primarySideBarMinWidth,
        };
      case "secondarySideBar":
        return {
          node: child, key: slot, slot,
          visible: config.secondarySideBar, present: config.secondarySideBar,
          flex: `0 0 ${config.secondarySideBarWidth}%`,
          minPx: config.secondarySideBarMinWidth,
        };
    }
  });

  // 分隔条：位于两个「占位中」的子项之间，且相邻至少有一个可调区域 leaf。
  const draggers: ShellDragger[] = [];
  for (let i = 0; i < children.length - 1; i++) {
    // 跳过被隐藏（不占位）的子项，找到左右两个占位子项。
    const l = children[i];
    const r = children[i + 1];
    if (!l.present || !r.present) continue;
    const left = l.slot ? regionMetaOf(l.slot) : null;
    const right = r.slot ? regionMetaOf(r.slot) : null;
    if (!left && !right) continue;
    draggers.push({ index: i, left, right });
  }

  return { children, draggers };
}

function regionMetaOf(slot: ShellSlot): DraggerTarget | null {
  const region = regionOf(slot);
  return region ? REGION_META[region] : null;
}

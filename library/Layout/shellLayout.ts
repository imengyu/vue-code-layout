import type { CodeLayoutConfig } from "../Types";

/**
 * 外壳布局描述符（纯函数）—— 替代原 `CodeLayoutBase.vue` 的 `loadLayout()` +
 * 6 个 case 分支（S1/S2），不产生任何数据节点、不 clearLayout（见 plan.md §7.1）。
 *
 * 外壳结构只由三个 config 字段决定：
 * `panelAlignment` × `panelPosition` × `primarySideBarPosition`。
 */

export type ShellSlot =
  | "primarySideBar"
  | "secondarySideBar"
  | "bottomPanel"
  | "centerArea";

export interface ShellSlotNode {
  kind: "slot";
  slot: ShellSlot;
  /** 是否可见；显隐切换只改此值，不改结构（v-show，内容不卸载，解决 S2）。 */
  visible: boolean;
}

export interface ShellSplitNode {
  kind: "split";
  /** row = 水平（左右），column = 垂直（上下）。 */
  direction: "row" | "column";
  children: ShellNode[];
}

export type ShellNode = ShellSlotNode | ShellSplitNode;

function slotVisible(slot: ShellSlot, config: CodeLayoutConfig): boolean {
  switch (slot) {
    case "primarySideBar": return config.primarySideBar;
    case "secondarySideBar": return config.secondarySideBar;
    case "bottomPanel": return config.bottomPanel;
    // centerArea 在底栏最大化时隐藏（解决 S4）。
    case "centerArea": return !(config.bottomPanelMaximize && config.bottomPanel);
  }
}

function split(direction: "row" | "column", children: ShellNode[]): ShellSplitNode {
  return { kind: "split", direction, children };
}

/**
 * 根据 config 构造外壳布局树。
 *
 * 24 种组合（6 对齐 × 2 位置 × 2 左右镜像）全部可进快照测试。
 */
export function buildShellLayout(config: CodeLayoutConfig): ShellNode {
  const inversePrimary = config.primarySideBarPosition === "right";
  const bottomIsInSide = config.panelAlignment.endsWith("-side");
  const reverseBottom = !bottomIsInSide && config.panelPosition === "top";

  // primary 位（贴近中心的一侧）与 secondary 位（远端）承载哪个逻辑区域，
  // 由 primarySideBarPosition 镜像决定。
  const pSlot: ShellSlot = inversePrimary ? "secondarySideBar" : "primarySideBar";
  const sSlot: ShellSlot = inversePrimary ? "primarySideBar" : "secondarySideBar";

  const slot = (s: ShellSlot): ShellSlotNode => ({
    kind: "slot",
    slot: s,
    visible: slotVisible(s, config),
  });

  const P = slot(pSlot);
  const S = slot(sSlot);
  const center = slot("centerArea");
  const bottom = slot("bottomPanel");

  /** 把 center 区与 bottom 区按 panelPosition 组成一列。 */
  const colWithBottom = (centerNode: ShellNode): ShellSplitNode =>
    split("column", reverseBottom ? [bottom, centerNode] : [centerNode, bottom]);

  switch (config.panelAlignment) {
    case "left":
      return split("row", [colWithBottom(split("row", [P, center])), S]);
    case "right":
      return split("row", [P, colWithBottom(split("row", [center, S]))]);
    case "justify":
      return split("row", [colWithBottom(split("row", [P, center, S]))]);
    case "center":
      return split("row", [P, colWithBottom(center), S]);
    case "left-side":
      return split("row", [P, bottom, center, S]);
    case "right-side":
      return split("row", [P, center, bottom, S]);
    default:
      // 兜底：与 center 一致。
      return split("row", [P, colWithBottom(center), S]);
  }
}

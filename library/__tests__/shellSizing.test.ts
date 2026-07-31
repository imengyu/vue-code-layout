import { describe, it, expect } from "vitest";
import { buildShellLayout, type ShellSplitNode } from "../Layout/shellLayout";
import { planShellSplitter } from "../Layout/shellSizing";
import { defaultCodeLayoutConfig } from "../Consts";
import type { CodeLayoutConfig } from "../Types";

const cfg = (over: Partial<CodeLayoutConfig> = {}): CodeLayoutConfig => ({
  ...defaultCodeLayoutConfig,
  ...over,
});

/** 递归收集树中所有 split 节点。 */
function splits(node: ShellSplitNode, acc: ShellSplitNode[] = []): ShellSplitNode[] {
  acc.push(node);
  for (const c of node.children) if (c.kind === "split") splits(c, acc);
  return acc;
}

/** 找到直接包含指定 slot 叶子的 split 节点。 */
function nodeWithSlot(root: ShellSplitNode, slot: string): ShellSplitNode | undefined {
  return splits(root).find((n) => n.children.some((c) => c.kind === "slot" && c.slot === slot));
}

describe("Layout / planShellSplitter", () => {
  it("侧栏为固定百分比、中心区为 stretch", () => {
    const config = cfg({ panelAlignment: "center", primarySideBarWidth: 20 });
    const root = buildShellLayout(config) as ShellSplitNode;
    const plan = planShellSplitter(root, config);
    const primary = plan.children.find((c) => c.slot === "primarySideBar")!;
    const center = plan.children.find((c) => c.slot === "centerArea");
    expect(primary.flex).toBe("0 0 20%");
    expect(primary.minPx).toBe(config.primarySideBarMinWidth);
    // center 在顶层 row 里以嵌套 split 承载（center 对齐），根层没有 center 叶子。
    if (center) expect(center.flex).toBe("1 1 0");
  });

  it("隐藏的侧栏不占位、内容仍可 v-show（visible=false）", () => {
    const config = cfg({ panelAlignment: "center", primarySideBar: false });
    const root = buildShellLayout(config) as ShellSplitNode;
    const plan = planShellSplitter(root, config);
    const primary = plan.children.find((c) => c.slot === "primarySideBar")!;
    expect(primary.visible).toBe(false);
    expect(primary.present).toBe(false);
  });

  it("底栏最大化：底栏 stretch、中心区让位为 0（仍占位以保留分隔条边界）", () => {
    const config = cfg({ panelAlignment: "center", bottomPanel: true, bottomPanelMaximize: true });
    const root = buildShellLayout(config) as ShellSplitNode;
    // center 与 bottom 同处一个 column
    const col = nodeWithSlot(root, "bottomPanel")!;
    const plan = planShellSplitter(col, config);
    const bottom = plan.children.find((c) => c.slot === "bottomPanel")!;
    const center = plan.children.find((c) => c.slot === "centerArea")!;
    expect(bottom.flex).toBe("1 1 0");
    expect(center.flex).toBe("0 0 0px");
    expect(center.present).toBe(true); // 仍占位
  });

  it("底栏最大化（left 对齐）：含 center 而不含 bottom 的子树整体让位", () => {
    const config = cfg({ panelAlignment: "left", bottomPanel: true, bottomPanelMaximize: true });
    const root = buildShellLayout(config) as ShellSplitNode;
    const col = nodeWithSlot(root, "bottomPanel")!;
    const plan = planShellSplitter(col, config);
    const bottom = plan.children.find((c) => c.slot === "bottomPanel")!;
    const nested = plan.children.find((c) => c.slot === null)!;
    expect(bottom.flex).toBe("1 1 0");
    expect(nested.flex).toBe("0 0 0px"); // 含 center 的内层 row 让位
  });

  it("分隔条只出现在相邻可调区域处", () => {
    const config = cfg({ panelAlignment: "center", secondarySideBar: true });
    const root = buildShellLayout(config) as ShellSplitNode;
    // 顶层 row: [ P, column(center+bottom), S ]，两处边界都邻接侧栏 → 2 条分隔条
    const plan = planShellSplitter(root, config);
    expect(plan.draggers.length).toBe(2);
    // 每条分隔条至少有一侧是可调区域
    for (const d of plan.draggers) expect(d.left || d.right).toBeTruthy();
  });

  it("隐藏一侧侧栏后其相邻分隔条消失", () => {
    const visible = planShellSplitter(
      buildShellLayout(cfg({ panelAlignment: "center", secondarySideBar: true })) as ShellSplitNode,
      cfg({ panelAlignment: "center", secondarySideBar: true }),
    );
    const hidden = planShellSplitter(
      buildShellLayout(cfg({ panelAlignment: "center", secondarySideBar: false })) as ShellSplitNode,
      cfg({ panelAlignment: "center", secondarySideBar: false }),
    );
    expect(hidden.draggers.length).toBeLessThan(visible.draggers.length);
  });
});

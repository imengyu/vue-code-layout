import { describe, it, expect } from "vitest";
import { buildShellLayout, type ShellNode } from "../Layout/shellLayout";
import { defaultCodeLayoutConfig } from "../Consts";
import type { CodeLayoutConfig } from "../Types";

const cfg = (over: Partial<CodeLayoutConfig> = {}): CodeLayoutConfig => ({
  ...defaultCodeLayoutConfig,
  ...over,
});

/** 收集树中出现的 slot（按深度优先顺序）。 */
function slots(node: ShellNode, acc: string[] = []): string[] {
  if (node.kind === "slot") acc.push(node.slot);
  else node.children.forEach((c) => slots(c, acc));
  return acc;
}

function findSlot(node: ShellNode, slot: string): { visible: boolean } | undefined {
  if (node.kind === "slot") return node.slot === slot ? node : undefined;
  for (const c of node.children) {
    const r = findSlot(c, slot);
    if (r) return r;
  }
  return undefined;
}

const ALIGNMENTS: CodeLayoutConfig["panelAlignment"][] = [
  "left", "center", "right", "justify", "left-side", "right-side",
];

describe("Layout / buildShellLayout", () => {
  it("四个 slot 恒各出现一次（任意对齐）", () => {
    for (const panelAlignment of ALIGNMENTS) {
      const tree = buildShellLayout(cfg({ panelAlignment }));
      const s = slots(tree).sort();
      expect(s).toEqual(
        ["bottomPanel", "centerArea", "primarySideBar", "secondarySideBar"].sort(),
      );
    }
  });

  it("primarySideBarPosition=right 镜像左右侧栏顺序", () => {
    const left = buildShellLayout(cfg({ panelAlignment: "center", primarySideBarPosition: "left" }));
    const right = buildShellLayout(cfg({ panelAlignment: "center", primarySideBarPosition: "right" }));
    const lSlots = slots(left).filter((s) => s.endsWith("SideBar"));
    const rSlots = slots(right).filter((s) => s.endsWith("SideBar"));
    expect(lSlots).toEqual(["primarySideBar", "secondarySideBar"]);
    expect(rSlots).toEqual(["secondarySideBar", "primarySideBar"]);
  });

  it("bottomPanelMaximize 时 centerArea 隐藏、bottomPanel 可见", () => {
    const tree = buildShellLayout(cfg({ bottomPanel: true, bottomPanelMaximize: true }));
    expect(findSlot(tree, "centerArea")!.visible).toBe(false);
    expect(findSlot(tree, "bottomPanel")!.visible).toBe(true);
  });

  it("slot 可见性映射 config 开关", () => {
    const tree = buildShellLayout(
      cfg({ primarySideBar: false, secondarySideBar: true, bottomPanel: false }),
    );
    expect(findSlot(tree, "primarySideBar")!.visible).toBe(false);
    expect(findSlot(tree, "secondarySideBar")!.visible).toBe(true);
    expect(findSlot(tree, "bottomPanel")!.visible).toBe(false);
    expect(findSlot(tree, "centerArea")!.visible).toBe(true);
  });

  it("panelPosition=top 时 bottom 排在 center 之前（非 -side 对齐）", () => {
    const bottom = buildShellLayout(cfg({ panelAlignment: "center", panelPosition: "bottom" }));
    const top = buildShellLayout(cfg({ panelAlignment: "center", panelPosition: "top" }));
    const bIdx = (t: ShellNode) => {
      const seq = slots(t);
      return [seq.indexOf("bottomPanel"), seq.indexOf("centerArea")];
    };
    const [bBottom, bCenter] = bIdx(bottom);
    expect(bBottom).toBeGreaterThan(bCenter); // bottom 在后
    const [tBottom, tCenter] = bIdx(top);
    expect(tBottom).toBeLessThan(tCenter); // top 在前
  });

  it("24 组合结构快照", () => {
    const matrix: Record<string, ShellNode> = {};
    for (const panelAlignment of ALIGNMENTS)
      for (const panelPosition of ["top", "bottom"] as const)
        for (const primarySideBarPosition of ["left", "right"] as const)
          matrix[`${panelAlignment}/${panelPosition}/${primarySideBarPosition}`] =
            buildShellLayout(cfg({ panelAlignment, panelPosition, primarySideBarPosition }));
    expect(matrix).toMatchSnapshot();
  });
});

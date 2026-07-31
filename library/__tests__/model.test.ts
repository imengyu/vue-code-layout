import { describe, it, expect, beforeEach } from "vitest";
import { CodeLayoutRootGrid } from "../Model/RootGrid";
import { CodeLayoutGroupInstance } from "../Model/Group";
import { CodeLayoutPanelInstance } from "../Model/Panel";
import { attachChild, detachChild } from "../Model/tree";
import { autoShrinkEmptyGroup } from "../Model/shrink";
import { nextNodeId, deriveGroupName, __resetUidForTest } from "../Model/uid";
import type { CodeLayoutGroup, CodeLayoutPanel } from "../Types";

const g = (name: string, extra: Partial<CodeLayoutGroup> = {}): CodeLayoutGroup =>
  ({ name, title: name, ...extra } as CodeLayoutGroup);
const p = (name: string, extra: Partial<CodeLayoutPanel> = {}): CodeLayoutPanel =>
  ({ name, title: name, ...extra } as CodeLayoutPanel);

describe("Model / tree", () => {
  beforeEach(() => __resetUidForTest());

  it("attachChild 建立父子关系并同步注册表", () => {
    const root = new CodeLayoutRootGrid();
    const group = root.primarySideBar.addGroup(g("explorer"));
    expect(group.parent).toBe(root.primarySideBar);
    expect(root.primarySideBar.children).toContain(group);
    expect(root.getNodeByName("explorer")).toBe(group);
    expect(group.root).toBe(root);

    const panel = group.addPanel(p("files"));
    expect(panel.parent).toBe(group);
    expect(root.getPanelByName("files")).toBe(panel);
  });

  it("detachChild 摘除后清空 parent / root 与注册表", () => {
    const root = new CodeLayoutRootGrid();
    const group = root.primarySideBar.addGroup(g("explorer"));
    const panel = group.addPanel(p("files"));

    detachChild(group, panel);
    expect(panel.parent).toBeNull();
    expect(panel.root).toBeNull();
    expect(root.getPanelByName("files")).toBeUndefined();
    expect(group.children).not.toContain(panel);
  });

  it("层级约束：面板是叶子，不能挂子节点", () => {
    const root = new CodeLayoutRootGrid();
    const group = root.primarySideBar.addGroup(g("explorer"));
    const panel = group.addPanel(p("files"));
    const stray = new CodeLayoutPanelInstance();
    stray.name = "stray";
    expect(() => attachChild(panel, stray)).toThrow(/leaf/);
  });

  it("不能重复挂载同一节点", () => {
    const root = new CodeLayoutRootGrid();
    const group = root.primarySideBar.addGroup(g("explorer"));
    const panel = group.addPanel(p("files"));
    expect(() => attachChild(group, panel)).toThrow(/already attached/);
  });

  it("name 冲突抛错并带上双方 id", () => {
    const root = new CodeLayoutRootGrid();
    root.primarySideBar.addGroup(g("dup"));
    expect(() => root.secondarySideBar.addGroup(g("dup"))).toThrow(/already exists/);
    // 与固定区域重名也应冲突
    expect(() => root.bottomPanel.addGroup(g("primarySideBar"))).toThrow(/already exists/);
  });

  it("region 为派生值：跨区域移动后自动正确，脱树为 none", () => {
    const root = new CodeLayoutRootGrid();
    const group = root.primarySideBar.addGroup(g("explorer"));
    const panel = group.addPanel(p("files"));
    expect(panel.region).toBe("primarySideBar");
    expect(panel.depth).toBe(2);
    expect(group.depth).toBe(1);
    expect(root.primarySideBar.depth).toBe(0);

    panel.removeSelf();
    expect(panel.region).toBe("none");

    // 移动整个 group 到 bottomPanel，其内部面板 region 应随之更新
    const panel2 = group.addPanel(p("files"));
    detachChild(root.primarySideBar, group);
    root.bottomPanel.addGroup(group);
    expect(panel2.region).toBe("bottomPanel");
  });

  it("id 单调递增且可重置；deriveGroupName 唯一", () => {
    __resetUidForTest();
    expect(nextNodeId()).toBe("cl_1");
    expect(nextNodeId()).toBe("cl_2");
    expect(deriveGroupName("base")).toBe("base.g1");
    expect(deriveGroupName("base")).toBe("base.g2");
    __resetUidForTest();
    expect(nextNodeId()).toBe("cl_1");
  });

  it("激活项重选：移除激活面板后落到下一个可见面板", () => {
    const root = new CodeLayoutRootGrid();
    const group = root.primarySideBar.addGroup(g("explorer"));
    const p1 = group.addPanel(p("a"));
    const p2 = group.addPanel(p("b"));
    expect(group.activePanel).toBe(p1);

    group.removePanel(p1);
    expect(group.activePanel).toBe(p2);
  });

  it("激活组重选：区域内首个激活组随挂载/摘除更新", () => {
    const root = new CodeLayoutRootGrid();
    const g1 = root.primarySideBar.addGroup(g("g1"));
    const g2 = root.primarySideBar.addGroup(g("g2"));
    expect(root.primarySideBar.activeGroup).toBe(g1);
    detachChild(root.primarySideBar, g1);
    expect(root.primarySideBar.activeGroup).toBe(g2);
  });

  it("autoShrinkEmptyGroup：空组自动从区域摘除，noAutoShink 保留", () => {
    const root = new CodeLayoutRootGrid();
    const group = root.primarySideBar.addGroup(g("explorer"));
    const panel = group.addPanel(p("files"));
    group.removePanel(panel); // 默认 shrink=true
    expect(group.parent).toBeNull();
    expect(root.primarySideBar.children).not.toContain(group);

    const keep = root.primarySideBar.addGroup(g("keep", { noAutoShink: true }));
    const kp = keep.addPanel(p("kp"));
    keep.removePanel(kp);
    expect(keep.parent).toBe(root.primarySideBar);
    expect(autoShrinkEmptyGroup(keep)).toBe(false);
  });

  it("clearLayout 清空组/面板但保留三个区域", () => {
    const root = new CodeLayoutRootGrid();
    root.primarySideBar.addGroup(g("explorer")).addPanel(p("files"));
    root.clearLayout();
    expect(root.primarySideBar.children.length).toBe(0);
    expect(root.getNodeByName("primarySideBar")).toBe(root.primarySideBar);
    expect(root.getNodeByName("explorer")).toBeUndefined();
  });
});

describe("Model / serialize", () => {
  beforeEach(() => __resetUidForTest());

  const build = () => {
    const root = new CodeLayoutRootGrid();
    const explorer = root.primarySideBar.addGroup(g("explorer"));
    const files = explorer.addPanel(p("files", { size: 2 }));
    const search = explorer.addPanel(p("search", { visible: false }));
    files.open = true;
    explorer.setActivePanel(search);
    root.primarySideBar.setActiveGroup(explorer);
    const terminalGroup = root.bottomPanel.addGroup(g("terminalGroup"));
    terminalGroup.addPanel(p("terminal"));
    return { root, files, search };
  };

  it("save/load 往返一致", () => {
    const { root } = build();
    const saved = root.saveLayout();
    expect(saved.version).toBe(2);
    const json = JSON.parse(JSON.stringify(saved));

    const root2 = new CodeLayoutRootGrid();
    const ok = root2.loadLayout(json, (d) => d);
    expect(ok).toBe(true);

    const explorer2 = root2.getNodeByName("explorer") as CodeLayoutGroupInstance;
    expect(explorer2).toBeTruthy();
    expect(explorer2.children.map((c) => c.name)).toEqual(["files", "search"]);

    const files2 = root2.getPanelByName("files") as CodeLayoutPanelInstance;
    expect(files2.weight).toBe(2);
    expect(files2.open).toBe(true);
    const search2 = root2.getPanelByName("search") as CodeLayoutPanelInstance;
    expect(search2.visible).toBe(false);
    expect(explorer2.activePanel).toBe(search2);
    expect(root2.primarySideBar.activeGroup).toBe(explorer2);
    expect(root2.getPanelByName("terminal")).toBeTruthy();
  });

  it("拒绝 v1 / 损坏数据且不清空现有布局", () => {
    const { root } = build();
    expect(root.loadLayout({ version: 1, grids: {} }, (d) => d)).toBe(false);
    expect(root.loadLayout(null, (d) => d)).toBe(false);
    expect(root.loadLayout("garbage", (d) => d)).toBe(false);
    // 现有布局仍在
    expect(root.getNodeByName("explorer")).toBeTruthy();
  });
});

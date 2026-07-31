import { markRaw } from "vue";
import { CodeLayoutNode } from "./Node";
import { CodeLayoutRegionInstance } from "./Region";
import { CodeLayoutPanelInstance } from "./Panel";
import { NodeRegistry } from "./NodeRegistry";
import { PixelRegistry } from "../Layout/pixelRegistry";
import { saveLayout as serializeSave, loadLayout as serializeLoad } from "./serialize";
import type { CodeLayoutRegionName } from "../Consts";
import type { CodeLayoutGroup, CodeLayoutPanel, CodeLayoutSavedData } from "../Types";

/**
 * 根网格 —— 持有三个固定区域 + 注册表 + 像素表（见 plan.md §5.2）。
 *
 * 对外类名沿用 `CodeLayoutRootGrid`（避免破坏 `new CodeLayoutRootGrid()`），
 * 内部结构已完全重写：不再继承 `CodeLayoutGridInternal`，三区域由本构造函数创建，
 * 用户不能增删。
 */
export class CodeLayoutRootGrid {
  readonly primarySideBar: CodeLayoutRegionInstance;
  readonly secondarySideBar: CodeLayoutRegionInstance;
  readonly bottomPanel: CodeLayoutRegionInstance;

  /** id/name 注册表；只由 tree.ts 的 attach/detach 维护。 */
  readonly registry: NodeRegistry = markRaw(new NodeRegistry());
  /** 视图 → 数据的只读像素回写通道（决策 C2）。 */
  readonly pixels: PixelRegistry = markRaw(new PixelRegistry());

  constructor() {
    this.primarySideBar = new CodeLayoutRegionInstance("primarySideBar", this);
    this.secondarySideBar = new CodeLayoutRegionInstance("secondarySideBar", this);
    this.bottomPanel = new CodeLayoutRegionInstance("bottomPanel", this);

    this.primarySideBar.tabStyle = "hidden";
    this.secondarySideBar.tabStyle = "icon";
    this.bottomPanel.tabStyle = "text";

    // 区域本身也登记进注册表，便于 getNodeByName 命中。
    this.registry.register(this.primarySideBar);
    this.registry.register(this.secondarySideBar);
    this.registry.register(this.bottomPanel);
  }

  /** 按名取区域。 */
  getRegion(name: CodeLayoutRegionName): CodeLayoutRegionInstance {
    switch (name) {
      case "primarySideBar": return this.primarySideBar;
      case "secondarySideBar": return this.secondarySideBar;
      case "bottomPanel": return this.bottomPanel;
      default:
        throw new Error(`Unknown region name: ${name as string}`);
    }
  }

  /** 三区域数组（固定顺序）。 */
  get regions(): CodeLayoutRegionInstance[] {
    return [this.primarySideBar, this.secondarySideBar, this.bottomPanel];
  }

  getNodeByName(name: string): CodeLayoutNode | undefined {
    return this.registry.getByName(name);
  }

  getPanelByName(name: string): CodeLayoutPanelInstance | undefined {
    const node = this.registry.getByName(name);
    return node instanceof CodeLayoutPanelInstance ? node : undefined;
  }

  /**
   * 便捷方法：往指定区域添加组（对应旧 `CodeLayoutInstance.addGroup`）。
   */
  addGroup(group: CodeLayoutGroup, target: CodeLayoutRegionName) {
    return this.getRegion(target).addGroup(group);
  }

  /**
   * 便捷方法：往指定区域的（首个/新建）组添加面板。
   * 若目标区域尚无组，则以面板名派生一个组承载它。
   */
  addPanel(panel: CodeLayoutPanel, target: CodeLayoutRegionName) {
    const region = this.getRegion(target);
    let group = region.children[0];
    if (!group)
      group = region.addGroup({ name: `${target}.default`, title: "" } as CodeLayoutGroup);
    return group.addPanel(panel);
  }

  /** 遍历所有已注册节点（含区域）。 */
  forEachNode(cb: (node: CodeLayoutNode) => void): void {
    this.registry.forEach(cb);
  }

  /** 清空全部区域的组/面板（保留三个区域本身）。 */
  clearLayout(): this {
    for (const region of this.regions) region.clear();
    return this;
  }

  /** 保存布局（版本 2，决策 C3）。 */
  saveLayout(): CodeLayoutSavedData {
    return serializeSave(this);
  }

  /**
   * 从 JSON 恢复布局。检测不到 `version === 2` 即视为旧格式/损坏数据，
   * 不加载并返回 false（走「无数据 → 新建布局」分支）。
   */
  loadLayout(
    json: unknown,
    instantiate: (data: CodeLayoutPanel | CodeLayoutGroup) => CodeLayoutPanel | CodeLayoutGroup,
  ): boolean {
    return serializeLoad(this, json, instantiate);
  }
}

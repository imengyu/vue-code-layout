import { reactive } from "vue";
import { CodeLayoutNode } from "./Node";
import { CodeLayoutPanelInstance, createPanelInstance } from "./Panel";
import type { CodeLayoutRegionInstance } from "./Region";
import { attachChild, detachChild } from "./tree";
import { autoShrinkEmptyGroup } from "./shrink";
import type { CodeLayoutGroup, CodeLayoutPanelTabStyle } from "../Types";

const TAB_STYLES: CodeLayoutPanelTabStyle[] = [
  "text",
  "icon",
  "text-bottom",
  "icon-bottom",
  "hidden",
];

/**
 * 组 —— 三层模型的中层容器，children 只能是面板。
 *
 * 相比原实现：`children` 类型收窄为面板数组（D2，类型即约束）；
 * `weight` 为区域内相对权重（区域作 Tab 容器时不参与布局）。
 */
export class CodeLayoutGroupInstance extends CodeLayoutNode {
  readonly kind = "group" as const;

  childNodes: CodeLayoutPanelInstance[] = [];

  declare parent: CodeLayoutRegionInstance | null;

  /** 组内激活面板（Tab / 手风琴激活项）。 */
  activePanel: CodeLayoutPanelInstance | null = null;
  /** 区域内相对权重。 */
  weight = 1;
  /** 为 true 时即使无子面板也保留，不触发自动收缩。 */
  noAutoShink = false;

  /** 类型收窄的子面板访问器。 */
  get children(): CodeLayoutPanelInstance[] {
    return this.childNodes;
  }

  /** 组是否以 Tab 形式呈现（含 hidden 透传）。 */
  get isTabContainer(): boolean {
    return TAB_STYLES.includes(this.tabStyle);
  }

  get visiblePanels(): CodeLayoutPanelInstance[] {
    return this.childNodes.filter((p) => p.visible);
  }

  /** 组当前像素（决策 C2）。 */
  getPixelSize(): number {
    return this.root?.pixels.get(this.id) ?? 0;
  }

  getContainerSize(): number {
    return this.parent?.getPixelSize() ?? 0;
  }

  /**
   * 往本组添加面板。
   * @param panel 面板定义或已构造的面板实例。
   * @param index 插入位置，缺省追加末尾。
   */
  addPanel(panel: CodeLayoutPanel | CodeLayoutPanelInstance, index?: number): CodeLayoutPanelInstance {
    const inst =
      panel instanceof CodeLayoutPanelInstance ? panel : createPanelInstance(panel);
    attachChild(this, inst, index);
    if (inst.startOpen) inst.open = true;
    return inst;
  }

  /**
   * 从本组移除面板。
   * @param panel 面板实例。
   * @param shrink 移除后若本组变空是否自动收缩，默认 true。
   */
  removePanel(panel: CodeLayoutPanelInstance, shrink = true): CodeLayoutPanelInstance {
    if (panel.parent !== this)
      throw new Error(`Panel "${panel.name}" is not a child of group "${this.name}".`);
    detachChild(this, panel);
    if (shrink) autoShrinkEmptyGroup(this);
    return panel;
  }

  setActivePanel(panel: CodeLayoutPanelInstance | null): void {
    this.activePanel = panel;
  }

  /** 选第一个 visible 面板作为激活项。 */
  reselectActivePanel(): void {
    this.activePanel = this.childNodes.find((p) => p.visible) ?? null;
  }

  handleChildAttached(child: CodeLayoutNode): void {
    if (!this.activePanel) this.activePanel = child as CodeLayoutPanelInstance;
  }

  handleChildDetached(child: CodeLayoutNode): void {
    if (this.activePanel === child) this.reselectActivePanel();
  }

  toString(): string {
    return `Group:${this.name} tabStyle:${this.tabStyle} weight:${this.weight}`;
  }
}

/**
 * 从用户组定义构造一个响应式组实例。
 */
export function createGroupInstance(data: CodeLayoutGroup): CodeLayoutGroupInstance {
  const inst = new CodeLayoutGroupInstance();
  inst.name = data.name;
  inst.title = data.title ?? "";
  if (data.tooltip !== undefined) inst.tooltip = data.tooltip;
  if (data.badge !== undefined) inst.badge = data.badge;
  inst.showBadge = data.showBadge ?? true;
  if (data.iconLarge !== undefined) inst.iconLarge = data.iconLarge;
  if (data.iconSmall !== undefined) inst.iconSmall = data.iconSmall;
  if (data.actions !== undefined) inst.actions = data.actions;
  if (data.data !== undefined) inst.data = data.data;
  inst.draggable = data.draggable ?? true;
  inst.visible = data.visible ?? true;
  if (data.accept !== undefined) inst.accept = data.accept;
  if (data.preDropCheck !== undefined) inst.preDropCheck = data.preDropCheck as never;
  inst.tabStyle = data.tabStyle ?? "none";
  inst.weight = data.size ?? 1;
  inst.noAutoShink = data.noAutoShink ?? false;
  if (data.onVisibleChange !== undefined) inst.onVisibleChange = data.onVisibleChange as never;
  return reactive(inst) as CodeLayoutGroupInstance;
}

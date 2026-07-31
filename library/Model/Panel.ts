import { reactive, type VNode } from "vue";
import { CodeLayoutNode } from "./Node";
import type { CodeLayoutGroupInstance } from "./Group";
import type { CodeLayoutPanel, CodeLayoutPanelCloseType } from "../Types";

/**
 * 面板 —— 三层模型的叶子（无 children）。
 *
 * 相比原 `CodeLayoutPanelInternal`：不再身兼组/区域角色，`children`/`activePanel`
 * 等字段彻底消失（D1）；`size` 语义由像素改为「同组内权重」（决策 C2，见 plan.md §11.3）。
 */
export class CodeLayoutPanelInstance extends CodeLayoutNode {
  readonly kind = "panel" as const;

  /** 面板恒无子节点。 */
  readonly childNodes = null;

  declare parent: CodeLayoutGroupInstance | null;

  private _open = false;

  /** 手风琴折叠状态（Tab 模式下无意义，视为恒 true）。 */
  get open(): boolean {
    return this._open;
  }
  set open(value: boolean) {
    if (value === this._open) return;
    this._open = value;
    this.onOpenChange?.call(this, value);
  }

  /** 同组内相对权重（替代原 size 像素值）。 */
  weight = 1;
  minSize?: number | number[];
  /** 用户配置，内部**绝不**写（修正 R5，见 plan.md §6.5）。 */
  resizeable = true;
  noHide = false;
  startOpen = false;
  closeType: CodeLayoutPanelCloseType = "none";

  onResize?: (this: CodeLayoutPanelInstance, weight: number) => void;
  onOpenChange?: (this: CodeLayoutPanelInstance, open: boolean) => void;

  /**
   * @deprecated `size` 语义已由像素改为权重（决策 C2）。读写都作用于 {@link weight}。
   * 需要实际像素请用 {@link getPixelSize}。
   */
  get size(): number {
    return this.weight;
  }
  set size(value: number) {
    if (value === this.weight) return;
    this.weight = value;
    this.onResize?.call(this, value);
  }

  /** 当前实际像素（决策 C2）。未挂载 / 不可见 / 首帧未测量时返回 0。 */
  getPixelSize(): number {
    return this.root?.pixels.get(this.id) ?? 0;
  }

  /** 父容器（组）当前像素（与原 `getContainerSize` 语义对齐）。 */
  getContainerSize(): number {
    return this.parent?.getPixelSize() ?? 0;
  }

  /** @deprecated 组本身的像素（面板返回自身像素）。 */
  getGroupPixelSize(): number {
    return this.getPixelSize();
  }

  /**
   * 展开本面板。
   * @param closeOthers 展开时是否同时折叠同组其他面板，默认 false。
   */
  openPanel(closeOthers = false): void {
    const group = this.parent;
    if (!group)
      throw new Error(`Panel "${this.name}" is not in any group, cannot open it.`);
    group.setActivePanel(this);
    if (closeOthers) group.children.forEach((p) => (p.open = false));
    this.open = true;
  }

  /** 折叠本面板，并让父组重选激活项。 */
  closePanel(): void {
    this.open = false;
    this.parent?.reselectActivePanel();
  }

  /** 切换折叠状态（无 console.log，修正 P11）。 */
  togglePanel(): boolean {
    this.open = !this.open;
    return this.open;
  }

  /** 让所在组激活自己，并让区域激活该组。 */
  activeSelf(): void {
    const group = this.parent;
    if (!group) return;
    group.setActivePanel(this);
    group.parent?.setActiveGroup(group);
  }

  /** 是否为所在组的激活面板。 */
  isSelfActived(): boolean {
    return this.parent?.activePanel === this;
  }

  //
  // ─── 兼容占位：布局已自动化，以下调用不再有副作用（见 plan.md §5.5 / §11.3） ──
  //

  /** @deprecated 布局已自动化，空实现。 */
  notifyRelayout(): void {}
  /** @deprecated 布局已自动化，空实现。 */
  relayoutAfterToggleVisible(): void {}
  /** @deprecated 布局已自动化，空实现。 */
  relayoutAllWithNewPanel(): void {}
  /** @deprecated 布局已自动化，空实现。 */
  relayoutAllWithRemovePanel(): void {}
  /** @deprecated 布局已自动化，空实现。 */
  relayoutAllWithResizedSize(): void {}

  toString(): string {
    return `Panel:${this.name} weight:${this.weight}`;
  }
}

/** 面板的 badge/icon 渲染函数类型（复用，避免散落）。 */
export type PanelRenderFn = () => VNode;

/**
 * 从用户面板定义构造一个响应式面板实例。
 *
 * 显式逐字段拷贝（而非 `Object.assign`），避免误写 id/kind/childNodes 等内部字段，
 * 并把 `size`（旧像素语义）映射到 `weight`（决策 C2）。
 */
export function createPanelInstance(data: CodeLayoutPanel): CodeLayoutPanelInstance {
  const inst = new CodeLayoutPanelInstance();
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
  if (data.tabStyle !== undefined) inst.tabStyle = data.tabStyle;
  inst.weight = data.size ?? 1;
  if (data.minSize !== undefined) inst.minSize = data.minSize;
  inst.resizeable = true;
  inst.noHide = data.noHide ?? false;
  inst.startOpen = data.startOpen ?? false;
  inst.closeType = data.closeType ?? "none";
  if (data.onResize !== undefined) inst.onResize = data.onResize as never;
  if (data.onOpenChange !== undefined) inst.onOpenChange = data.onOpenChange as never;
  if (data.onVisibleChange !== undefined) inst.onVisibleChange = data.onVisibleChange as never;
  return reactive(inst) as CodeLayoutPanelInstance;
}

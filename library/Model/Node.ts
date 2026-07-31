import type { VNode } from "vue";
import type {
  CodeLayoutActionButton,
  CodeLayoutPanelTabStyle,
} from "../Types";
import type { CodeLayoutGrid } from "../Types";
import type { CodeLayoutRegionName } from "../Consts";
import type { CodeLayoutRootGrid } from "./RootGrid";
import { FLAG_CODE_LAYOUT } from "../Composeable/DragDrop";
import { nextNodeId } from "./uid";
import { detachChild } from "./tree";
import { autoShrinkEmptyGroup } from "./shrink";

/**
 * 节点在三层固定模型中的角色（原则一：类型即约束，见 plan.md §4.1）。
 */
export type CodeLayoutNodeKind = "region" | "group" | "panel";

export type PreDropCheck = (
  dropPanel: unknown,
  targetGrid: CodeLayoutGrid,
  referencePanel?: unknown,
  referencePosition?: unknown,
) => boolean;

/**
 * 三层模型的公共基类：区域 / 组 / 面板共有的字段与派生逻辑。
 *
 * 与原 `CodeLayoutPanelInternal`（三合一自指结构，D1/D2/D3）不同：
 * - 结构真相只有 `parent`；`region` / `parentGrid` 全是派生 getter，
 *   移动节点后自动正确，从结构上消除 D3 类「parentGrid 漏同步」bug。
 * - 不再继承 `LateClass`（D5 命令队列删除，见 plan.md §5.5）。
 */
export abstract class CodeLayoutNode {
  /** 角色判别符。子类用字面量覆盖，避免运行时 `instanceof` 造成的循环依赖。 */
  abstract readonly kind: CodeLayoutNodeKind;

  /** 内部唯一键，单调递增计数器生成，永不重复（解决 D6）。 */
  readonly id: string = nextNodeId();
  /** 用户可见标识，同一布局内唯一（注册表在挂树时校验）。 */
  name = "";
  title = "";
  tooltip?: string;
  badge?: string | (() => VNode);
  showBadge = true;
  iconLarge?: string | (() => VNode);
  iconSmall?: string | (() => VNode);
  actions?: CodeLayoutActionButton[];
  data?: unknown;
  draggable = true;
  accept?: CodeLayoutGrid[];
  preDropCheck?: PreDropCheck;
  tabStyle: CodeLayoutPanelTabStyle = "none";
  readonly sourceFlag = FLAG_CODE_LAYOUT;

  /** 唯一的结构真相：指向父节点（区域的 parent 恒为 null，其容器是 RootGrid）。 */
  parent: CodeLayoutNode | null = null;
  /** 所属根网格的反向引用，仅由 attach/detach 维护（见 tree.ts）。 */
  _root: CodeLayoutRootGrid | null = null;

  /**
   * 容器的子节点数组；叶子（面板）恒为 null。
   * 仅 `tree.ts` 的 attach/detach 直接改动它，其余一律经由容器方法。
   */
  childNodes: CodeLayoutNode[] | null = null;

  private _visible = true;

  /**
   * 是否可见。普通响应式字段（不再需要 `relayoutAfterToggleVisible`，见 plan.md §5.5）；
   * 变化时仍触发 `onVisibleChange` 以兼容旧回调。
   */
  get visible(): boolean {
    return this._visible;
  }
  set visible(value: boolean) {
    if (value === this._visible) return;
    this._visible = value;
    this.onVisibleChange?.call(this, value);
  }

  onVisibleChange?: (this: CodeLayoutNode, visible: boolean) => void;

  /** 所属根网格；未挂树时为 null。 */
  get root(): CodeLayoutRootGrid | null {
    return this._root;
  }

  /**
   * 派生：向上走到 Region 取其 name；脱树返回 `'none'`（解决 D3）。
   */
  get region(): CodeLayoutRegionName | "none" {
    let n: CodeLayoutNode | null = this;
    while (n && n.kind !== "region") n = n.parent;
    return n ? (n.name as CodeLayoutRegionName) : "none";
  }

  /**
   * @deprecated 请改用 {@link region}。保留为只读兼容别名（见 plan.md §5.4）。
   */
  get parentGrid(): CodeLayoutRegionName | "none" {
    return this.region;
  }

  /**
   * @deprecated 已作废。原字段用于手工同步 parentGrid，新模型下 region 为派生值，无需继承。
   * 保留为 no-op setter，避免旧代码赋值时报错。
   */
  get inhertParentGrid(): boolean {
    return false;
  }
  set inhertParentGrid(_v: boolean) {
    /* no-op（见 plan.md §5.4 / §11.3） */
  }

  /** 在 parent 子节点数组中的下标；无 parent 返回 -1。 */
  get index(): number {
    const arr = this.parent?.childNodes;
    return arr ? arr.indexOf(this) : -1;
  }

  /** 层级深度：region=0，group=1，panel=2。 */
  get depth(): 0 | 1 | 2 {
    return this.kind === "region" ? 0 : this.kind === "group" ? 1 : 2;
  }

  /** 从父级摘除（不收缩）。 */
  removeSelf(): void {
    if (this.parent) detachChild(this.parent, this);
  }

  /** 摘除 + 触发父级（组）空收缩。 */
  removeSelfWithShrink(): void {
    const parent = this.parent;
    if (!parent) return;
    detachChild(parent, this);
    if (parent.kind === "group") autoShrinkEmptyGroup(parent);
  }

  /** 是否为 `node` 的后代（含自身）。拖放自环校验用。 */
  isDescendantOf(node: CodeLayoutNode): boolean {
    let n: CodeLayoutNode | null = this;
    while (n) {
      if (n === node) return true;
      n = n.parent;
    }
    return false;
  }

  //
  // ─── 容器钩子（子类覆盖，用于挂/摘子节点时维护激活项） ────────────────
  //

  /** 子节点挂入后回调，默认无操作；容器覆盖以维护 active。 */
  handleChildAttached(_child: CodeLayoutNode): void {
    /* overridden by container */
  }
  /** 子节点摘除后回调，默认无操作；容器覆盖以重选 active。 */
  handleChildDetached(_child: CodeLayoutNode): void {
    /* overridden by container */
  }

  toString(): string {
    return `${this.kind}:${this.name}`;
  }
}

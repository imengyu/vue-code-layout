import { CodeLayoutNode } from "./Node";
import { CodeLayoutGroupInstance, createGroupInstance } from "./Group";
import { attachChild, detachChild } from "./tree";
import type { CodeLayoutRootGrid } from "./RootGrid";
import type { CodeLayoutRegionName } from "../Consts";
import type { CodeLayoutGroup } from "../Types";

/**
 * 顶层区域 —— 三层模型的根下容器，children 只能是组。
 *
 * 固定三个（primarySideBar / secondarySideBar / bottomPanel），由 RootGrid 构造，
 * 用户不能增删（对应原 `CodeLayoutGridInternal`，但不再可被 addGroup 造出新的）。
 * 区域自身是 Tab 容器（`activeGroup`）。
 */
export class CodeLayoutRegionInstance extends CodeLayoutNode {
  readonly kind = "region" as const;

  declare readonly name: CodeLayoutRegionName;
  declare parent: null;

  childNodes: CodeLayoutGroupInstance[] = [];

  activeGroup: CodeLayoutGroupInstance | null = null;

  constructor(name: CodeLayoutRegionName, root: CodeLayoutRootGrid) {
    super();
    (this.name as string) = name;
    this._root = root;
  }

  get children(): CodeLayoutGroupInstance[] {
    return this.childNodes;
  }

  get visibleGroups(): CodeLayoutGroupInstance[] {
    return this.childNodes.filter((g) => g.visible);
  }

  /** 区域当前像素（决策 C2）。 */
  getPixelSize(): number {
    return this.root?.pixels.get(this.id) ?? 0;
  }

  /**
   * 往区域添加组。
   * @param group 组定义或已构造的组实例。
   * @param index 插入位置，缺省追加末尾。
   */
  addGroup(group: CodeLayoutGroup | CodeLayoutGroupInstance, index?: number): CodeLayoutGroupInstance {
    const inst =
      group instanceof CodeLayoutGroupInstance ? group : createGroupInstance(group);
    attachChild(this, inst, index);
    return inst;
  }

  /** 从区域移除组。 */
  removeGroup(group: CodeLayoutGroupInstance): CodeLayoutGroupInstance {
    if (group.parent !== this)
      throw new Error(`Group "${group.name}" is not a child of region "${this.name}".`);
    detachChild(this, group);
    return group;
  }

  setActiveGroup(group: CodeLayoutGroupInstance | null): void {
    this.activeGroup = group;
  }

  /** 选第一个 visible 组作为激活项。 */
  reselectActiveGroup(): void {
    this.activeGroup = this.childNodes.find((g) => g.visible) ?? null;
  }

  handleChildAttached(child: CodeLayoutNode): void {
    if (!this.activeGroup) this.activeGroup = child as CodeLayoutGroupInstance;
  }

  handleChildDetached(child: CodeLayoutNode): void {
    if (this.activeGroup === child) this.reselectActiveGroup();
  }

  /** 清空区域内所有组。 */
  clear(): void {
    for (const group of this.childNodes.slice()) detachChild(this, group);
    this.activeGroup = null;
  }

  toString(): string {
    return `Region:${this.name}`;
  }
}

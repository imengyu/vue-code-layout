import type { CodeLayoutNode } from "./Node";

/**
 * 节点注册表 —— 解决 D6 / D8（原实现注册表以 name 为全局键、且散落多处手工维护，
 * 易与树结构不一致）。
 *
 * 本表**只由** `tree.ts` 的 attach/detach 路径调用（经 `assignRoot`），
 * 其他任何地方都不许直接碰它（见 plan.md §5.3）。
 */
export class NodeRegistry {
  private byId = new Map<string, CodeLayoutNode>();
  private byName = new Map<string, CodeLayoutNode>();

  /**
   * 注册一个节点。若 name 冲突，抛出带上冲突双方 id 的错误。
   */
  register(node: CodeLayoutNode): void {
    const existing = this.byName.get(node.name);
    if (existing && existing !== node) {
      throw new Error(
        `A node named "${node.name}" already exists ` +
        `(existing id: ${existing.id}, new id: ${node.id}).`
      );
    }
    this.byId.set(node.id, node);
    this.byName.set(node.name, node);
  }

  /**
   * 注销一个节点（按 id 与 name 双向清理，name 命中同一实例才删，防误删同名新节点）。
   */
  unregister(node: CodeLayoutNode): void {
    this.byId.delete(node.id);
    if (this.byName.get(node.name) === node)
      this.byName.delete(node.name);
  }

  getById(id: string): CodeLayoutNode | undefined {
    return this.byId.get(id);
  }

  getByName(name: string): CodeLayoutNode | undefined {
    return this.byName.get(name);
  }

  has(name: string): boolean {
    return this.byName.has(name);
  }

  forEach(cb: (node: CodeLayoutNode) => void): void {
    this.byId.forEach(cb);
  }

  clear(): void {
    this.byId.clear();
    this.byName.clear();
  }
}

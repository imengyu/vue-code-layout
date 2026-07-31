import type { CodeLayoutNode } from "./Node";
import type { CodeLayoutRootGrid } from "./RootGrid";

/**
 * 全库**唯一**允许修改 `parent` / `childNodes` / 注册表的地方（见 plan.md §5.3）。
 *
 * 所有对外操作（addPanel / addGroup / removeGroup / 拖放 applyPlan）都必须经由
 * `attachChild` / `detachChild`，以保证树结构与注册表恒一致（解决 D3 / D8）。
 */

/**
 * 递归地把 `node` 及其子孙的 `_root` 设为 `root`，并同步注册表。
 *
 * - root 由 null → 非 null：注册（此时校验 name 唯一性）。
 * - root 由 非 null → null：注销。
 *
 * 这样即使先构建一棵子树（root 为 null，不注册），再整体挂到区域下时，
 * 也会在获得 root 的那一刻统一注册（含唯一性校验）。
 */
function assignRoot(node: CodeLayoutNode, root: CodeLayoutRootGrid | null): void {
  const prev = node._root;
  if (prev === root) return;

  if (prev) prev.registry.unregister(node);
  node._root = root;
  if (root) root.registry.register(node);

  const children = node.childNodes;
  if (children) for (const child of children) assignRoot(child, root);
}

/**
 * 把 `child` 挂到 `parent` 下的 `index` 位置（缺省追加到末尾）。
 */
export function attachChild(
  parent: CodeLayoutNode,
  child: CodeLayoutNode,
  index?: number,
): void {
  if (!parent.childNodes)
    throw new Error(`Node "${parent.name}" (${parent.kind}) is a leaf and cannot have children.`);
  if (child.parent)
    throw new Error(`Node "${child.name}" is already attached to "${child.parent.name}".`);
  if (child === parent)
    throw new Error(`Cannot attach node "${child.name}" to itself.`);

  const arr = parent.childNodes;
  if (typeof index === "number" && index >= 0 && index < arr.length)
    arr.splice(index, 0, child);
  else
    arr.push(child);

  child.parent = parent;
  // 只有当 parent 已在某个 root 下时才会级联注册；否则等 parent 挂树时统一注册。
  assignRoot(child, parent._root);
  parent.handleChildAttached(child);
}

/**
 * 把 `child` 从 `parent` 摘除。纯结构操作，不做收缩（收缩由调用方决定）。
 */
export function detachChild(parent: CodeLayoutNode, child: CodeLayoutNode): void {
  const arr = parent.childNodes;
  if (!arr) return;
  const i = arr.indexOf(child);
  if (i === -1)
    throw new Error(`Node "${child.name}" is not a child of "${parent.name}".`);

  arr.splice(i, 1);
  parent.handleChildDetached(child);
  child.parent = null;
  assignRoot(child, null);
}

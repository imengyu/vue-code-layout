import type { CodeLayoutNode } from "./Node";
import { detachChild } from "./tree";

/**
 * 空组自动收缩（对应原 `autoShrinkEmptyGroup` 语义，见 plan.md §8.4）。
 *
 * 组在移空后若非 `noAutoShink`，则把该组从其区域摘除。
 * 收缩**只发生在插入完成之后**（由调用方保证顺序），绝不在摘除阶段进行。
 *
 * @returns 是否发生了收缩。
 */
export function autoShrinkEmptyGroup(group: CodeLayoutNode): boolean {
  if (group.kind !== "group") return false;
  const children = group.childNodes;
  if (!children || children.length > 0) return false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((group as any).noAutoShink) return false;
  const region = group.parent;
  if (!region) return false;
  detachChild(region, group);
  return true;
}

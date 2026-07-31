import { markRaw } from "vue";

/**
 * 视图 → 数据的**只读**像素回写通道（决策 C2，见 plan.md §6.7）。
 *
 * 权重制下数据里不存像素值。渲染组件（PanelStack / ShellSplitter）在每帧的
 * `computeStack` computed 里把算出的像素 `set()` 进来，节点通过 `getPixelSize()`
 * 只读查询。
 *
 * 与 R8 的区别：这不是「存进数据对象、又被拖放判定读取」的视图状态污染；
 * 它是 `markRaw` 的旁路缓存，只服务 `getPixelSize()` 一个只读查询，
 * 布局与拖放算法一律不读它。
 */
export class PixelRegistry {
  private map = markRaw(new Map<string, number>());

  /** 只由渲染组件调用。 */
  set(id: string, px: number): void {
    this.map.set(id, px);
  }

  /** 未布局 / 不可见 / 首帧未测量时返回 0。 */
  get(id: string): number {
    return this.map.get(id) ?? 0;
  }

  clear(id: string): void {
    this.map.delete(id);
  }

  clearAll(): void {
    this.map.clear();
  }
}

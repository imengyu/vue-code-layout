/**
 * 单调 id 计数器 —— 解决 D6（原实现用 `Math.floor(Math.random()*10)` 造名，必然碰撞）。
 *
 * 所有节点的内部 `id` 与分割/克隆产生的新组名都从这里取号，无随机数，
 * 快照测试可复现（见 plan.md §5.3）。
 */

let nodeCounter = 0;
let groupNameCounter = 0;

/**
 * 生成一个全局唯一、单调递增的节点内部 id（如 `cl_1`、`cl_2`…）。
 */
export function nextNodeId(): string {
  return `cl_${++nodeCounter}`;
}

/**
 * 为分割/克隆产生的新组派生一个唯一名字（如 `base.g1`、`base.g2`…）。
 * @param base 基础名（通常是源组名或区域名）
 */
export function deriveGroupName(base: string): string {
  return `${base}.g${++groupNameCounter}`;
}

/**
 * 仅供测试使用：重置计数器，让 id 序列从头开始，便于快照断言。
 */
export function __resetUidForTest(): void {
  nodeCounter = 0;
  groupNameCounter = 0;
}

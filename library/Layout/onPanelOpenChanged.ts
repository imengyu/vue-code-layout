/**
 * 面板从折叠变展开时的权重策略 —— 纯函数（见 plan.md §6.4，替代 R2/R3 的手工空间搬运）。
 *
 * 开关面板本身不再搬运空间（`collapsed` 输入变化后 `computeStack` 重算即可）。
 * 唯一需要的策略：新展开的面板若权重还是初始值，给它一个合理权重（取当前展开项
 * 权重的中位数），避免它过小。
 */

/** 计算一组权重的中位数；空数组回退为 1。 */
export function median(weights: number[]): number {
  if (weights.length === 0) return 1;
  const sorted = [...weights].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

/**
 * 为一个新展开的面板决定权重。
 *
 * @param currentWeight 该面板当前权重。
 * @param otherExpandedWeights 同组其它已展开面板的权重。
 * @param initialWeight 判定「仍是初始值」的基准（默认 1）。
 * @returns 建议权重：若仍是初始值则取其它展开项权重的中位数，否则保持不变。
 */
export function weightForNewlyExpanded(
  currentWeight: number,
  otherExpandedWeights: number[],
  initialWeight = 1,
): number {
  const isInitial = !Number.isFinite(currentWeight) || currentWeight === initialWeight;
  if (!isInitial) return currentWeight;
  if (otherExpandedWeights.length === 0) return initialWeight;
  const m = median(otherExpandedWeights);
  return m > 0 ? m : initialWeight;
}

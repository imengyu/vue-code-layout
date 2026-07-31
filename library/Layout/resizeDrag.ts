/**
 * 拖拽调整尺寸 = 像素转移 + 权重反解 —— 纯函数（见 plan.md §6.3）。
 *
 * 拖动只在分隔条相邻两侧的项之间转移像素；一侧顶到 minPx 后继续向更外侧的项索取
 * （保持原实现「依次索取」的手感）。总和恒不变。
 */

/**
 * 拖动第 `dividerIndex` 条分隔条（位于 `sizes[dividerIndex]` 与
 * `sizes[dividerIndex+1]` 之间），位移 `delta` 像素（正 = 向右/向下，左侧变大）。
 *
 * @returns 新的像素分布（长度不变，总和不变）。
 */
export function resizeDrag(
  sizes: number[],
  mins: number[],
  dividerIndex: number,
  delta: number,
): number[] {
  const n = sizes.length;
  const s = sizes.slice();
  if (n < 2 || dividerIndex < 0 || dividerIndex >= n - 1 || delta === 0) return s;

  const minOf = (i: number) => Math.max(0, mins[i] || 0);

  if (delta > 0) {
    // 左侧（dividerIndex）变大，向右侧各项依次索取空间。
    let need = delta;
    let removed = 0;
    for (let j = dividerIndex + 1; j < n && need > 1e-9; j++) {
      const can = Math.max(0, s[j] - minOf(j));
      const r = Math.min(need, can);
      s[j] -= r;
      removed += r;
      need -= r;
    }
    s[dividerIndex] += removed;
  } else {
    // 右侧（dividerIndex+1）变大，向左侧各项依次索取空间。
    let need = -delta;
    let removed = 0;
    for (let j = dividerIndex; j >= 0 && need > 1e-9; j--) {
      const can = Math.max(0, s[j] - minOf(j));
      const r = Math.min(need, can);
      s[j] -= r;
      removed += r;
      need -= r;
    }
    s[dividerIndex + 1] += removed;
  }
  return s;
}

/**
 * 由展开项的像素分布反解权重（§6.3 步骤 3）：
 * `weight_k = px_k / Σpx * Σweight_原`。
 *
 * 用此权重再喂给 `computeStack`（无折叠、无 min 命中时）可精确还原像素分布（往返稳定）。
 */
export function solveWeights(expandedPx: number[], prevTotalWeight: number): number[] {
  const totalPx = expandedPx.reduce((a, b) => a + b, 0);
  const totalW = prevTotalWeight > 0 ? prevTotalWeight : expandedPx.length;
  if (totalPx <= 0) return expandedPx.map(() => totalW / (expandedPx.length || 1));
  return expandedPx.map((px) => (px / totalPx) * totalW);
}

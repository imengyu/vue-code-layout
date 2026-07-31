/**
 * 手风琴 / 分栏通用尺寸分配 —— 纯函数，是本次重构的核心（解决 R1–R6）。
 *
 * 不变式：**任何输入下 `Σpx === containerPx`**（容器为 0 时全 0）。
 * 容器尺寸变化只是输入变化，不需要任何增量补偿逻辑（对照原实现 R1）。
 */

export interface StackItemInput {
  key: string;
  /** 相对权重（无量纲）。非正 / 非有限值会被归一化为安全值。 */
  weight: number;
  /** 最小像素；<=0 表示无限制。 */
  minPx: number;
  /** 折叠项固定占 headerPx，不参与权重分配。 */
  collapsed: boolean;
}

export interface StackItemOutput {
  key: string;
  px: number;
}

/** 把不合法的权重（<=0 / NaN / Infinity）归一化为 0，其余原样返回。 */
function sanitizeWeight(w: number): number {
  return Number.isFinite(w) && w > 0 ? w : 0;
}

/**
 * @param items 子项输入
 * @param containerPx 容器像素
 * @param headerPx 折叠项 / 头部固定高度
 */
export function computeStack(
  items: StackItemInput[],
  containerPx: number,
  headerPx: number,
): StackItemOutput[] {
  const n = items.length;
  if (n === 0) return [];
  if (!(containerPx > 0)) return items.map((it) => ({ key: it.key, px: 0 }));

  const header = Math.max(0, headerPx);
  const px = new Array<number>(n).fill(0);

  const expandedIdx: number[] = [];
  const collapsedIdx: number[] = [];
  for (let i = 0; i < n; i++)
    (items[i].collapsed ? collapsedIdx : expandedIdx).push(i);

  const headerTotal = collapsedIdx.length * header;
  const expMinTotal = expandedIdx.reduce(
    (s, i) => s + Math.max(0, items[i].minPx || 0),
    0,
  );

  // ── 不可行降级（解决 R6）：连头部 + 展开项最小值都放不下 → 放弃最小值约束，
  //    按「期望尺寸」等比缩放到容器，保证不溢出且总和仍等于容器。
  if (headerTotal + expMinTotal > containerPx) {
    const desired = items.map((it) => {
      if (it.collapsed) return header || 1;
      const min = Math.max(0, it.minPx || 0);
      return min > 0 ? min : sanitizeWeight(it.weight) || 1;
    });
    const sum = desired.reduce((a, b) => a + b, 0) || 1;
    for (let i = 0; i < n; i++) px[i] = (desired[i] / sum) * containerPx;
    return normalizeRemainder(items, px, containerPx, n - 1);
  }

  // ── 可行路径 ──
  for (const i of collapsedIdx) px[i] = header;
  const free = containerPx - headerTotal;

  if (expandedIdx.length === 0) {
    // 全部折叠：把余数（容器 - 头部总和）补给最后一项，保证恒等式成立。
    return normalizeRemainder(items, px, containerPx, n - 1);
  }

  // 展开项按权重分配 free，含「最小值收敛循环」（§6.2 步骤 3）。
  const variable = new Set(expandedIdx);
  const pinned = new Map<number, number>();

  // 每轮至多钉死一项，有限次收敛。
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const pinnedTotal = [...pinned.values()].reduce((a, b) => a + b, 0);
    const usableFree = free - pinnedTotal;
    let totalW = 0;
    for (const i of variable) totalW += sanitizeWeight(items[i].weight);

    let pinnedSomething = false;
    for (const i of variable) {
      const w = sanitizeWeight(items[i].weight);
      const share = totalW > 0 ? (usableFree * w) / totalW : usableFree / variable.size;
      const min = Math.max(0, items[i].minPx || 0);
      if (min > 0 && share < min - 1e-6) {
        pinned.set(i, min);
        variable.delete(i);
        pinnedSomething = true;
        break;
      }
    }
    if (!pinnedSomething || variable.size === 0) break;
  }

  for (const [i, v] of pinned) px[i] = v;

  const pinnedTotal = [...pinned.values()].reduce((a, b) => a + b, 0);
  const usableFree = free - pinnedTotal;
  let totalW = 0;
  for (const i of variable) totalW += sanitizeWeight(items[i].weight);
  for (const i of variable) {
    const w = sanitizeWeight(items[i].weight);
    px[i] = totalW > 0 ? (usableFree * w) / totalW : usableFree / variable.size;
  }

  // 余数归一：把浮点误差 + 全部钉死时的剩余空间补给一个展开项。
  const target = variable.size > 0 ? [...variable][variable.size - 1] : expandedIdx[expandedIdx.length - 1];
  return normalizeRemainder(items, px, containerPx, target);
}

/** 把 `containerPx - Σpx` 补给 `targetIndex`，使恒等式精确成立。 */
function normalizeRemainder(
  items: StackItemInput[],
  px: number[],
  containerPx: number,
  targetIndex: number,
): StackItemOutput[] {
  const sum = px.reduce((a, b) => a + b, 0);
  const diff = containerPx - sum;
  if (targetIndex >= 0 && targetIndex < px.length) px[targetIndex] += diff;
  return items.map((it, i) => ({ key: it.key, px: px[i] }));
}

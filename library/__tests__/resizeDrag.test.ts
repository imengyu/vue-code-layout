import { describe, it, expect } from "vitest";
import { resizeDrag, solveWeights } from "../Layout/resizeDrag";
import { computeStack, type StackItemInput } from "../Layout/computeStack";

const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);

describe("Layout / resizeDrag", () => {
  it("相邻转移：总和不变", () => {
    const sizes = [100, 100, 200];
    const out = resizeDrag(sizes, [0, 0, 0], 0, 30);
    expect(sum(out)).toBeCloseTo(sum(sizes), 6);
    expect(out[0]).toBe(130);
    expect(out[1]).toBe(70);
    expect(out[2]).toBe(200);
  });

  it("命中 min 后向更外侧索取", () => {
    const sizes = [100, 60, 100];
    const mins = [0, 50, 0];
    // 向右拖 40：b 只能出 10（到 50），剩下 30 向 c 索取
    const out = resizeDrag(sizes, mins, 0, 40);
    expect(sum(out)).toBeCloseTo(260, 6);
    expect(out[1]).toBeGreaterThanOrEqual(50);
    expect(out[0]).toBe(140);
  });

  it("delta=0 或非法 dividerIndex 原样返回", () => {
    const sizes = [100, 100];
    expect(resizeDrag(sizes, [0, 0], 0, 0)).toEqual(sizes);
    expect(resizeDrag(sizes, [0, 0], -1, 10)).toEqual(sizes);
    expect(resizeDrag(sizes, [0, 0], 5, 10)).toEqual(sizes);
  });

  it("solveWeights + computeStack 往返稳定（无折叠无 min）", () => {
    const sizes = [130, 70, 200];
    const prevTotalWeight = 4;
    const weights = solveWeights(sizes, prevTotalWeight);
    const items: StackItemInput[] = sizes.map((_, i) => ({
      key: `k${i}`,
      weight: weights[i],
      minPx: 0,
      collapsed: false,
    }));
    const out = computeStack(items, sum(sizes), 24);
    out.forEach((o, i) => expect(o.px).toBeCloseTo(sizes[i], 4));
  });

  it("solveWeights：全 0 像素回退为均分", () => {
    const w = solveWeights([0, 0, 0], 3);
    expect(w).toEqual([1, 1, 1]);
  });
});

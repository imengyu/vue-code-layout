import { describe, it, expect } from "vitest";
import { computeStack, type StackItemInput } from "../Layout/computeStack";

const item = (
  key: string,
  weight: number,
  minPx = 0,
  collapsed = false,
): StackItemInput => ({ key, weight, minPx, collapsed });

const sum = (out: { px: number }[]) => out.reduce((a, b) => a + b.px, 0);

describe("Layout / computeStack", () => {
  it("不变式：Σpx === containerPx（简单场景）", () => {
    const out = computeStack([item("a", 1), item("b", 1), item("c", 2)], 400, 24);
    expect(sum(out)).toBeCloseTo(400, 6);
    // 权重 1:1:2 → 100:100:200
    expect(out.map((o) => o.px)).toEqual([100, 100, 200]);
  });

  it("空输入返回空数组", () => {
    expect(computeStack([], 400, 24)).toEqual([]);
  });

  it("容器为 0（或负）时全部为 0", () => {
    const out = computeStack([item("a", 1), item("b", 1)], 0, 24);
    expect(out.map((o) => o.px)).toEqual([0, 0]);
    const out2 = computeStack([item("a", 1)], -50, 24);
    expect(out2.map((o) => o.px)).toEqual([0]);
  });

  it("折叠项固定占 headerPx，展开项分剩余", () => {
    const out = computeStack(
      [item("a", 1, 0, true), item("b", 1), item("c", 1)],
      424,
      24,
    );
    const byKey = Object.fromEntries(out.map((o) => [o.key, o.px]));
    expect(byKey.a).toBe(24);
    expect(byKey.b).toBeCloseTo(200, 6);
    expect(byKey.c).toBeCloseTo(200, 6);
    expect(sum(out)).toBeCloseTo(424, 6);
  });

  it("全部折叠：余数补给最后一项，仍等于容器", () => {
    const out = computeStack(
      [item("a", 1, 0, true), item("b", 1, 0, true)],
      100,
      24,
    );
    expect(sum(out)).toBeCloseTo(100, 6);
    expect(out[0].px).toBe(24);
    expect(out[1].px).toBe(76); // 24 + 余数
  });

  it("最小值收敛：可行时尊重 minPx", () => {
    // a 权重极小但 minPx=150，应被钉到 150，其余分给 b
    const out = computeStack([item("a", 1, 150), item("b", 100)], 400, 24);
    const byKey = Object.fromEntries(out.map((o) => [o.key, o.px]));
    expect(byKey.a).toBeGreaterThanOrEqual(150 - 1e-6);
    expect(sum(out)).toBeCloseTo(400, 6);
  });

  it("不可行降级：min 总和超容器仍不溢出且 Σ===container", () => {
    const out = computeStack(
      [item("a", 1, 300), item("b", 1, 300), item("c", 1, 300)],
      400,
      24,
    );
    expect(sum(out)).toBeCloseTo(400, 6);
    for (const o of out) expect(o.px).toBeGreaterThanOrEqual(0);
    expect(Math.max(...out.map((o) => o.px))).toBeLessThanOrEqual(400 + 1e-6);
  });

  it("非法权重（<=0 / NaN / Infinity）不破坏不变式", () => {
    const out = computeStack(
      [item("a", NaN), item("b", -5), item("c", Infinity), item("d", 2)],
      300,
      24,
    );
    expect(sum(out)).toBeCloseTo(300, 6);
    for (const o of out) expect(Number.isFinite(o.px)).toBe(true);
    // 唯一合法权重 d 应拿到全部空间
    const byKey = Object.fromEntries(out.map((o) => [o.key, o.px]));
    expect(byKey.d).toBeCloseTo(300, 6);
  });

  it("属性测试：200 组随机输入下 Σpx 恒等于容器", () => {
    for (let t = 0; t < 200; t++) {
      const n = 1 + Math.floor(Math.random() * 6);
      const items: StackItemInput[] = [];
      for (let i = 0; i < n; i++) {
        items.push(
          item(
            `k${i}`,
            Math.random() < 0.1 ? 0 : Math.random() * 5,
            Math.random() < 0.5 ? Math.floor(Math.random() * 200) : 0,
            Math.random() < 0.3,
          ),
        );
      }
      const container = Math.floor(Math.random() * 1000);
      const header = Math.floor(Math.random() * 40);
      const out = computeStack(items, container, header);
      expect(out.length).toBe(n);
      if (container > 0) expect(sum(out)).toBeCloseTo(container, 4);
      else expect(sum(out)).toBe(0);
      for (const o of out) expect(o.px).toBeGreaterThanOrEqual(-1e-6);
    }
  });
});

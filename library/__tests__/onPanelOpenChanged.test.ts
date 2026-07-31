import { describe, it, expect } from "vitest";
import { median, weightForNewlyExpanded } from "../Layout/onPanelOpenChanged";

describe("Layout / onPanelOpenChanged", () => {
  it("median：奇偶数组与空数组", () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([1, 2, 3, 4])).toBe(2.5);
    expect(median([])).toBe(1);
    expect(median([7])).toBe(7);
  });

  it("仍是初始权重 → 取其它展开项权重的中位数", () => {
    expect(weightForNewlyExpanded(1, [2, 4, 6])).toBe(4);
  });

  it("已被用户改过（非初始）→ 保持不变", () => {
    expect(weightForNewlyExpanded(3, [2, 4, 6])).toBe(3);
  });

  it("没有其它展开项 → 回退到初始权重", () => {
    expect(weightForNewlyExpanded(1, [])).toBe(1);
    // currentWeight 等于自定义初始值 → 视为初始，无其它展开项则回退到该初始值
    expect(weightForNewlyExpanded(5, [], 5)).toBe(5);
  });

  it("当前权重非有限值视为初始", () => {
    expect(weightForNewlyExpanded(NaN, [2, 4])).toBe(3);
  });
});

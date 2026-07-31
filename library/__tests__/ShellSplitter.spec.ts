import { describe, it, expect, beforeAll } from "vitest";
import { defineComponent, h, reactive, nextTick } from "vue";
import { mount } from "@vue/test-utils";
import CodeLayoutShell from "../CodeLayoutShell.vue";
import { defaultCodeLayoutConfig } from "../Consts";
import type { CodeLayoutConfig } from "../Types";

// jsdom 无 ResizeObserver，桩一个空实现（useElementSize 会 new 它）。
beforeAll(() => {
  if (typeof (globalThis as any).ResizeObserver === "undefined") {
    (globalThis as any).ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
});

/** 记录挂载/卸载次数的探针组件，用于验证显隐切换不重建（S2）。 */
let mountCount = 0;
let unmountCount = 0;
const Probe = defineComponent({
  name: "Probe",
  setup() {
    mountCount++;
    return () => h("div", { class: "probe" }, "probe content");
  },
  unmounted() {
    unmountCount++;
  },
});

function mountShell(config: CodeLayoutConfig) {
  return mount(CodeLayoutShell, {
    props: { config },
    slots: {
      primarySideBar: () => h(Probe),
      secondarySideBar: () => h("div", "s"),
      bottomPanel: () => h("div", "b"),
      centerArea: () => h("div", "c"),
    },
    attachTo: document.body,
  });
}

describe("CodeLayoutShell / ShellSplitter", () => {
  it("四个区域插槽都被渲染", () => {
    const config = reactive({ ...defaultCodeLayoutConfig, secondarySideBar: true });
    const wrapper = mountShell(config);
    expect(wrapper.find('[data-slot="primarySideBar"]').exists()).toBe(true);
    expect(wrapper.find('[data-slot="secondarySideBar"]').exists()).toBe(true);
    expect(wrapper.find('[data-slot="bottomPanel"]').exists()).toBe(true);
    expect(wrapper.find('[data-slot="centerArea"]').exists()).toBe(true);
    wrapper.unmount();
  });

  it("切换 primarySideBar 显隐时，区域内容组件不被卸载（S2）", async () => {
    mountCount = 0;
    unmountCount = 0;
    const config = reactive({ ...defaultCodeLayoutConfig, primarySideBar: true });
    const wrapper = mountShell(config);

    expect(mountCount).toBe(1);
    expect(unmountCount).toBe(0);

    // 隐藏 → 再显示
    config.primarySideBar = false;
    await nextTick();
    config.primarySideBar = true;
    await nextTick();

    // v-show 只切 display，探针组件全程不卸载、不重建。
    expect(unmountCount).toBe(0);
    expect(mountCount).toBe(1);
    wrapper.unmount();
  });

  it("隐藏 primarySideBar → 对应 cell 的 display 变为 none（但仍在 DOM 中）", async () => {
    const config = reactive({ ...defaultCodeLayoutConfig, primarySideBar: true });
    const wrapper = mountShell(config);
    const cell = () => wrapper.find('[data-slot="primarySideBar"]');

    expect((cell().element as HTMLElement).style.display).not.toBe("none");
    config.primarySideBar = false;
    await nextTick();
    expect(cell().exists()).toBe(true); // 仍在 DOM
    expect((cell().element as HTMLElement).style.display).toBe("none");
    wrapper.unmount();
  });

  it("改变 panelAlignment 后结构随之变化", async () => {
    const config = reactive({ ...defaultCodeLayoutConfig, panelAlignment: "center" as const });
    const wrapper = mountShell(config);
    // 四区域始终存在
    config.panelAlignment = "justify";
    await nextTick();
    expect(wrapper.find('[data-slot="centerArea"]').exists()).toBe(true);
    expect(wrapper.find('[data-slot="bottomPanel"]').exists()).toBe(true);
    wrapper.unmount();
  });
});

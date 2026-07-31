import { onBeforeUnmount, onMounted, ref, watch, type Ref } from "vue";

/**
 * ResizeObserver 的响应式封装（见 plan.md §6.6）—— 用来替代原实现里
 * `onMounted → nextTick → setTimeout(200ms)` 的三级延迟初始化（对照 R7）。
 *
 * 返回 `width` / `height` 两个 `Ref<number>`，布局 computed 直接依赖它们即可：
 * 容器尺寸变化只是输入变化，无需任何手工 relayout 通知。
 *
 * * 首帧宽高可能为 0（元素尚未布局），此时依赖它的 `computeStack` 返回全 0，
 *   渲染出空布局；ResizeObserver 首次回调后自动补正。
 * * `ResizeObserver` 不存在时（极老环境）退化为一次性测量，不再持续跟踪。
 */
export function useElementSize(elRef: Ref<HTMLElement | undefined>) {
  const width = ref(0);
  const height = ref(0);
  let ro: ResizeObserver | undefined;

  function measure() {
    const el = elRef.value;
    if (el) {
      width.value = el.offsetWidth;
      height.value = el.offsetHeight;
    }
  }

  function observe(el: HTMLElement | undefined) {
    if (ro) ro.disconnect();
    if (!el) return;
    measure();
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => measure());
      ro.observe(el);
    }
  }

  onMounted(() => observe(elRef.value));
  // 元素在挂载后才出现（v-if 等）时重新绑定。
  watch(elRef, (el) => observe(el));
  onBeforeUnmount(() => {
    ro?.disconnect();
    ro = undefined;
  });

  return { width, height, measure };
}

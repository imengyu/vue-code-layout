<template>
  <div
    ref="container"
    :class="[
      'OverflowCollapseList',
      direction,
    ]"
  >
    <slot name="start" />
    <template
      v-for="(item, index) in items"
      :key="item.key ?? index"
    >
      <slot 
        v-if="!visibleKey || item[visibleKey]"
        :item="item"
        :index="index"
        name="item"
      />
    </template>
    <slot name="end" />
    <slot v-if="overflowIndex >= 0" name="overflowItem">
      <div ref="overflowItem" class="OverflowItem" @click="onOverflowItemClicked">
        <IconMore />
      </div>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, type PropType, watch } from 'vue';
import IconMore from '../Icons/IconMore.vue';
import { useResizeChecker } from '../Composeable/ResizeChecker';
import ContextMenu, { type MenuItem } from '@imengyu/vue3-context-menu';
import HtmlUtils from '../Utils/HtmlUtils';

const props = defineProps({
  /**
   * Items to display, render by slot
   */
  items: {
    type: Object as PropType<Array<any>>,
    default: () => ([] as object)
  },
  /**
   * Key of the item.visible, used to identify the item visibility
   */
  visibleKey: {
    type: String,
    default: '',
  },
  /**
   * Direction of the menu
   */
  menuDirection: {  
    type: String as PropType<'up'|'down'>,
    default: 'down',
  },
  /**
   * Activated item, activated item will not be hidden
   */
  activeItem: {
    type: null,
    default: null
  },
  /**
   * Direction of the list, horizontal or vertical
   */
  direction: {
    type: String as PropType<'vertical'|'horizontal'>,
    default: 'horizontal'
  },
  /**
   * Label of the item in the context menu
   */
  itemMenuLabel: {
    type: Function as PropType<(item: any) => string>,
    default: null,
  },
  /**
   * Mergin of the item when collapse
   */
  itemCollapseMergin: {
    type: Number,
    default: 30,
  },
});
const emit = defineEmits([	
  "overflowItemClicked"	
]);

const container = ref<HTMLElement>();
const overflowItem = ref<HTMLElement>();
const overflowIndex = ref(-1);

function doCalcItemOverflow() {
  overflowIndex.value = -1;

  if (!container.value)
    return;

  const visibleKey = props.visibleKey;
  const activeItem = props.activeItem;
  const horizontal = props.direction === 'horizontal';
  const width = (horizontal ? container.value.offsetWidth  : container.value.offsetHeight) - props.itemCollapseMergin;
  const children = container.value.children;
  let x = 0, firstOverflow = -1;

  for (let i = 0; i < children.length && i < props.items.length; i++) {
    const element = children[i] as HTMLElement;
    element.style.display = '';

    if (visibleKey && !props.items[i][visibleKey])
      continue;

    x += horizontal ? element.offsetWidth : element.offsetHeight;
    element.style.display = (x < width || props.items[i] === activeItem) ? '' : 'none';

    if (x >= width && firstOverflow === -1) {
      firstOverflow = i;
      overflowIndex.value = i;
      if (activeItem && props.items.indexOf(activeItem) >= i && i > 0)
        (children[i - 1] as HTMLElement).style.display = 'none';
    }
  }
}

let menuState = false;

function onOverflowItemClicked() {
  if (!overflowItem.value)
    return;
  const horizontal = props.direction === 'horizontal';
  const up = props.menuDirection === 'up';
  if (menuState) {
    menuState = false;
    return;
  }
  menuState = true;
  ContextMenu.showContextMenu({
    theme: 'code-layout',
    adjustPadding: { x: 0, y: 0 },
    x: horizontal ? 
      HtmlUtils.getLeft(overflowItem.value) :
      (HtmlUtils.getLeft(overflowItem.value) + overflowItem.value.clientWidth),
    y: horizontal ?
      (HtmlUtils.getTop(overflowItem.value) + overflowItem.value.offsetHeight) : 
      (HtmlUtils.getTop(overflowItem.value)/*  + (up ? overflowItem.value.offsetHeight : 0) */),
    direction: up ? 'tr' : 'br',
    items: props.items.slice(overflowIndex.value).map((p) => ({
      label: props.itemMenuLabel?.(p) || '',
      onClick() {
        emit('overflowItemClicked', p);
      },
    } as MenuItem))
  })
}

watch(() => props.items, doCalcItemOverflow);
watch(() => props.activeItem, doCalcItemOverflow);

const {
  startResizeChecker,
  stopResizeChecker,
} = useResizeChecker(
  container, 
  () => doCalcItemOverflow(), 
  () => doCalcItemOverflow()
);

onMounted(() => {
  startResizeChecker();
  nextTick(() => {
    doCalcItemOverflow();
  });
});
onBeforeUnmount(() => {
  stopResizeChecker();
})
</script>

<style lang="scss">
.OverflowCollapseList {
  display: flex;
  flex-wrap: nowrap;
  flex-shrink: 0;
  flex-grow: 1;

  &.horizontal {
    flex-direction: row;
    width: 100%;
  }
  &.vertical {
    flex-direction: column;
    height: 100%;
  }

  .OverflowItem {
    position: relative;
    color: var(--code-layout-color-text);
    border-radius: var(--code-layout-border-radius-small);
    background-color: transparent;
    appearance: none;
    border: none;
    outline: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background-color: var(--code-layout-color-background-hover);
    }

    svg {
      fill: currentColor;
      width: 16px;
      height: 16px;
    }
  }

  > * {
    flex-shrink: 0;
  }
}
</style>
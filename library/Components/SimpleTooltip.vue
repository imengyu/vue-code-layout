<template>
  <span ref="container" class="code-layout-tooltip-ref">
    <slot />
    <Teleport :to="teleport">
      <div 
        v-if="show"
        ref="tooltip"
        :class="'code-layout-tooltip ' + arrowDirection"
        :style="{
          left: `${positionX + positionXOffset}px`,
          top: `${positionY + positionYOffset}px`,
        }"
      >
        {{ content }}

        <div class="arrow1" 
          :style="{
            marginLeft: `${-positionXOffset}px`,
            marginTop: `${-positionYOffset}px`,
          }"
        />
        <div class="arrow2" 
          :style="{
            marginLeft: `${-positionXOffset}px`,
            marginTop: `${-positionYOffset}px`,
          }"
        />
      </div>
    </Teleport>
  </span>
</template>

<script lang="ts" setup>
import HtmlUtils from '../Utils/HtmlUtils';
import { onMounted, onBeforeUnmount, nextTick, ref, useSlots, watch, type PropType } from 'vue';
import { useSimpleTooltipDelayLock } from '../Composeable/SimpleTooltipDelayLock';

const props = defineProps({
  /**
   * The content of the tooltip.
   */
  content: {
    type: String,
    default: '',
  },
  /**
   * Whether to enable the tooltip.
   */
  enable: {
    type: Boolean,
    default: true,
  },
  /**
   * The direction of the tooltip.
   * 
   * Default is 'right'.
   * 
   * * mouse: follow the mouse position and no arrow.
   */
  direction: {
    type: String as PropType<'left'|'top'|'bottom'|'right'|'mouse'>,
    default: 'right',
  },
  /**
   * The teleport target of the tooltip.
   * 
   * Default is 'body'.
   */
  teleport: {
    type: String,
    default: 'body',
  },
  /**
   * The main direction offset of the tooltip. (px)
   * 
   * Default is 5.
   */
  offset: {
    type: Number,
    default: 5,
  },
  receiveRef: {
    type: Function as PropType<(ref: HTMLElement) => void>,
    default: () => {}, 
  }
});

const slots = useSlots();
const container = ref<HTMLElement>();
const tooltip = ref<HTMLElement>();
const positionX = ref(0);
const positionY = ref(0);
const positionXOffset = ref(0);
const positionYOffset = ref(0);
const arrowDirection = ref('');
const show = ref(false);

const {
  onEnter,
  onLeave
} = useSimpleTooltipDelayLock();

function getChildEle() {
  if (!container.value)
    return null;
  return container.value.children[0] as HTMLElement || null;
}
function mountChildEvents() {
  const child = getChildEle();
  if (!child) return;

  child.addEventListener('mouseenter', onChildEnter);
  child.addEventListener('mouseleave', onChildLeave);
  child.addEventListener('click', onChildLeave);
}
function unmountChildEvents() {
  const child = getChildEle();
  if (!child) return;
  child.removeEventListener('mouseenter', onChildEnter);
  child.removeEventListener('mouseleave', onChildLeave);
  child.removeEventListener('click', onChildLeave);
}
function onChildEnter(e: MouseEvent) {
  if (props.enable && props.content) {
    onEnter(() => {
      show.value = true;
      calcTooltipPosition(e);
    });
  }
}
function onChildLeave(e: MouseEvent) {
  show.value = false;
  onLeave();
}
function calcTooltipPosition(e: MouseEvent) {
  positionX.value = 0;
  positionY.value = 0;
  positionXOffset.value = 0;
  positionYOffset.value = 0;
  nextTick(() => {
    const child = getChildEle();
    const teleport = document.querySelector(props.teleport) as HTMLElement;
    if (!child || !tooltip.value || !teleport) 
      return;

    let direction = props.direction;

    const eleLeft = HtmlUtils.getLeft(child, teleport);
    const eleTop = HtmlUtils.getTop(child, teleport);

    if (direction === 'top' && eleTop < window.innerHeight / 3)
      direction = 'bottom';

    arrowDirection.value = direction;

    switch (direction) {
      case 'left':
      case 'right':
        positionY.value = eleTop - tooltip.value.offsetHeight / 2 + child.offsetHeight / 2;
        break;
      case 'top':
      case 'bottom':
        positionX.value = eleLeft - tooltip.value.offsetWidth / 2 + child.offsetWidth / 2;
        break;
      case 'mouse':
        positionX.value = e.x + 5;
        break;
    }

    switch (direction) {
      case 'left':
        positionX.value = eleLeft - tooltip.value.offsetWidth - props.offset;
        break;
      case 'top':
        positionY.value = eleTop - tooltip.value.offsetHeight - props.offset;
        break;
      case 'right':
        positionX.value = eleLeft + child.offsetWidth + props.offset;
        break;
      case 'bottom':
        positionY.value = eleTop + child.offsetHeight + props.offset;
        break;
      case 'mouse':
        positionX.value = e.x + 10;
        positionY.value = e.y + 15;
        break;
    }

    nextTick(() => {
      const teleportLeft = HtmlUtils.getLeft(tooltip.value!, teleport);
      const teleportTop = HtmlUtils.getTop(tooltip.value!, teleport);

      positionXOffset.value = teleportLeft < 0 ? -teleportLeft : 0;
      positionYOffset.value = teleportTop < 0 ? -teleportTop : 0;
    });
  });
}

watch(() => slots.default, () => {
  show.value = false;
  unmountChildEvents();
  nextTick(() => mountChildEvents());
});
watch(() => props.enable, (v) => {
  if (!v)
    show.value = false;
});

onMounted(() => {
  nextTick(() => {
    mountChildEvents();
  });
});
onBeforeUnmount(() => {
  unmountChildEvents();
  show.value = false;
});
</script>

<style lang="scss">
@use 'sass:math';

@keyframes code-layout-tooltip-fade-show {
  from {
    opacity: 0;
  } 
  to {
    opacity: 1; 
  }
}

.code-layout-tooltip-ref {
  display: block;
  height: auto;
}
.code-layout-tooltip {
  overflow: visible;
  position: absolute;
  padding: 4px 8px;
  border-radius: var(--code-layout-border-radius-small);
  background-color: var(--code-layout-color-background-second);
  color: var(--code-layout-color-text);
  border: 1px solid var(--code-layout-color-border);
  width: auto;
  z-index: 10;
  font-size: var(--code-layout-font-size);
  animation: code-layout-tooltip-fade-show 0.3s;

  .arrow1, .arrow2 {
    position: absolute;
    display: block;
    width: 0;
    height: 0;
    z-index: 11;
  }

  $triangle-size: 3px;
  $triangle-size2: 4px;

  &.right {
    .arrow1 {
      border-top: $triangle-size solid transparent;
      border-right: $triangle-size solid var(--code-layout-color-background-second);
      border-bottom: $triangle-size solid transparent;
      border-left: $triangle-size solid transparent;
      left: -$triangle-size * 2;
      top: calc(50% - $triangle-size);
    }
    .arrow2 {
      border-top: $triangle-size2 solid transparent;
      border-right: $triangle-size2 solid var(--code-layout-color-border);
      border-bottom: $triangle-size2 solid transparent;
      border-left: $triangle-size2 solid transparent;
      left: -$triangle-size2 * 2;
      top: calc(50% - $triangle-size2);
    }
  } 
  &.left {
    .arrow1 {
      border-top: $triangle-size solid transparent;
      border-right: $triangle-size solid transparent;
      border-bottom: $triangle-size solid transparent;
      border-left: $triangle-size solid var(--code-layout-color-background-second);
      right: -$triangle-size * 2;
      top: calc(50% - $triangle-size);
    }
    .arrow2 {
      border-top: $triangle-size2 solid transparent;
      border-right: $triangle-size2 solid transparent;
      border-bottom: $triangle-size2 solid transparent;
      border-left: $triangle-size2 solid var(--code-layout-color-border);
      right: -$triangle-size2 * 2;
      top: calc(50% - $triangle-size2);
    }
  } 
  &.top {
    .arrow1 {
      border-top: $triangle-size solid var(--code-layout-color-background-second);
      border-right: $triangle-size solid transparent;
      border-bottom: $triangle-size solid transparent;
      border-left: $triangle-size solid transparent;
      bottom: -$triangle-size * 2;
      left: calc(50% - $triangle-size);
    }
    .arrow2 {
      border-top: $triangle-size2 solid var(--code-layout-color-border);
      border-right: $triangle-size2 solid transparent;
      border-bottom: $triangle-size2 solid transparent;
      border-left: $triangle-size2 solid transparent;
      bottom: -$triangle-size2 * 2;
      left: calc(50% - $triangle-size2);
    }
  } 
  &.bottom {
    .arrow1 {
      border-top: $triangle-size solid transparent;
      border-right: $triangle-size solid transparent;
      border-bottom: $triangle-size solid var(--code-layout-color-background-second);
      border-left: $triangle-size solid transparent;
      top: -$triangle-size * 2;
      left: calc(50% - $triangle-size);
    }
    .arrow2 {
      border-top: $triangle-size2 solid transparent;
      border-right: $triangle-size2 solid transparent;
      border-bottom: $triangle-size2 solid var(--code-layout-color-border);
      border-left: $triangle-size2 solid transparent;
      top: -$triangle-size2 * 2;
      left: calc(50% - $triangle-size2);
    }
  } 
}
</style>
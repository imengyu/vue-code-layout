<template>
  <div 
    :class="[ 'code-layout-actions' ]"
    draggable="false"
  > 
    <slot name="start" />
    <SimpleTooltip
      v-for="(action, index) in actions"
      :key="action.name ?? index"
      :content="action.tooltip"
      :direction="action.tooltipDirection ?? 'bottom'"
    >
      <CodeLayoutVNodeStringRender v-if="action.render" :content="action.render" />
      <button 
        v-else
        draggable="false"
        tabindex="0"
        :class="[
          index === actions!.length - 1 ? 'last' : '',
        ]"
        @click="action.onClick"
      >
        <CodeLayoutVNodeStringRender :content="action.icon" />
        <CodeLayoutVNodeStringRender :content="action.text" />
      </button>
    </SimpleTooltip>
    <slot name="end" />
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';
import type { CodeLayoutActionButton } from './CodeLayout';
import CodeLayoutVNodeStringRender from './Components/CodeLayoutVNodeStringRender.vue';
import SimpleTooltip from './Components/SimpleTooltip.vue';

defineProps({
  actions: {
    type: Object as PropType<CodeLayoutActionButton[]>,
    default: () => ([] as any),
  },
});
</script>

<style lang="scss">
.code-layout-actions {
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-shrink: 0;

  button {
    position: relative;
    padding: 2px 4px;
    margin-right: 4px;
    color: var(--code-layout-color-text);
    border-radius: var(--code-layout-border-radius-small);
    font-size: var(--code-layout-font-size-small);
    background-color: transparent;
    appearance: none;
    border: none;
    outline: none;
    cursor: pointer;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    height: 20px;

    &.last {
      margin-right: 0;
    }

    svg {
      fill: currentColor;
    }
    &:hover {
      background-color: var(--code-layout-color-background-hover);
    }
  }
}

</style>
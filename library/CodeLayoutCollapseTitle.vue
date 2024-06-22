<template>
  <div 
    class="code-layout-collapse"
    :draggable="!draggable"
    @dragstart="$emit('dragstart', $event)"
    @dragend="$emit('dragend', $event)"
  >
    <div 
      class="collapse-title"
      :title="tooltip"
      @click="$emit('click', $event)"
      @contextmenu="$emit('contextmenu', $event)"
    >
      <IconArrow class="arrow" />
      <CodeLayoutVNodeStringRender :content="title" />
      <CodeLayoutVNodeStringRender v-if="showIconSmall" :content="iconSmall" />
    </div>
    <CodeLayoutActionsRender class="actions" :actions="actions" />
  </div>
</template>

<script lang="ts" setup>
import CodeLayoutVNodeStringRender from './Components/CodeLayoutVNodeStringRender.vue';
import CodeLayoutActionsRender from './CodeLayoutActionsRender.vue';
import IconArrow from './Icons/IconArrow.vue';
import type { PropType } from 'vue';
import type { CodeLayoutActionButton } from './CodeLayout';

defineEmits([ 'click', 'contextmenu', 'dragstart', 'dragend' ]);
defineProps({
  draggable: {
    type: Boolean,
    default: false,
  },
  showIconSmall: {
    type: Boolean,
    default: false,
  },
  actions: {
    type: Object as PropType<CodeLayoutActionButton[]>,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  tooltip: {
    type: String,
    default: '',
  },
  iconSmall: {
    type: null,
    default: '',
  },
})

</script>

<style lang="scss">
//面板折叠头部
.code-layout-collapse {
  position: relative;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: var(--code-layout-header-height);
  color: var(--code-layout-color-text);
  padding: 0 5px;
  border: 1px solid transparent;
  border-top: 1px solid var(--code-layout-color-border);
  cursor: pointer;
  user-select: none;
  overflow: hidden;

  > .collapse-title {
    flex: 1;
  }

  svg {
    fill: currentColor;
  }

  .actions {
    visibility: hidden;
  }
  .arrow {
    margin-top: 1px;
    margin-right: 2px;
  }

  div {
    display: flex;
    align-items: center;
    flex-direction: row;
    justify-content: start;
  }
  span {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    font-size: 12px;
    min-width: 3ch;
  }

  &.dragging {
    opacity: 0.8;
  }

  &:hover {
    .actions {
      visibility: visible;
    }
  }
  &:focus {
    outline: none;
    border: 1px solid var(--code-layout-color-highlight);

    .actions {
      visibility: visible;
    }
  }
}
</style>
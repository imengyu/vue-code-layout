<template>
  <div
    :class="[
      'item',
      states?.active ? 'active' : '',
      states?.dragLightBoxState ? 'drag-active' : '',
      `drag-over-${states?.dragOverState}`,
    ]"
  >
    <!-- icon and title -->
    <slot name="icon">
      <span class="icon"> 
        <CodeLayoutVNodeStringRender :content="panel.iconSmall || panel.iconLarge" />
      </span>
    </slot>

    <slot name="title">
      <span class="title">{{ panel.title }}</span>
    </slot>

    <slot name="badge">
      <span v-if="panel.badge && panel.showBadge" class="badge">
        <CodeLayoutVNodeStringRender :content="panel.badge" />
      </span>
    </slot>

    <!-- close -->
    <slot name="close">
      <span 
        v-if="panel.closeType !== 'none'"
        class="close"
        @click.stop="panel.closePanel()"
      >
        <IconClose v-if="panel.closeType === 'close'" class="close-icon" />
        <IconDot v-if="panel.closeType === 'unSave'" class="unsave-dot" />
      </span>
    </slot>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';
import type { CodeLayoutSplitNPanelInternal } from './SplitN';
import CodeLayoutVNodeStringRender from '../Components/CodeLayoutVNodeStringRender.vue';
import IconClose from '../Icons/IconClose.vue';
import IconDot from '../Icons/IconDot.vue';

defineProps({
  panel: {
    type: Object as PropType<CodeLayoutSplitNPanelInternal>,
    default: null,
  },
  active: {
    type: Boolean,
    default: true,
  },
  states: {
    type: Object as PropType<{ 
      active: boolean, 
      dragLightBoxState: boolean, 
      dragOverState: string 
    }>,
  },
});
</script>
<template>
  <div
    :class="[
      'grid-placeholder',
      {
        'flat': props.flat,
      }
    ]"
    :style="{ backgroundColor: `color-mix(in srgb, #000 40%, ${props.color} 60%)` }"
  >
    <h2 >
      Grid {{ props.name }} {{ props.direction }}
    </h2>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  name: {
    type: String,
    default: 'Grid',
  },
  direction: {
    type: String,
    default: 'horizontal',
  },
  color: {
    type: String,
    default: '#00a2ff',
  },
  flat: {
    type: Boolean,
    default: false,
  }
})
</script>

<style lang="scss" scoped>
.grid-placeholder {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0;
  overflow: hidden;
  position: relative;

  h2 {
    font-size: 1.2rem;
    font-weight: 600;
    margin: 0;
    margin-bottom: 10px;
    padding: 16px 24px;
    background: rgba(255, 255, 255, 0.8);
    color: #000;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.3);
    transition: all 0.3s ease;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }
  &:hover h2 {
    transform: scale(1.05);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  &.flat {
    h2 {
      box-shadow: none;
      border: none;
      background-color: transparent;
      color: #fff;
    }
  }
}
</style>
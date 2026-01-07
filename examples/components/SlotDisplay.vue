<template>
  <div class="slot-display" :title="name">
    <svg viewBox="0 0 1024 1024" width="50" height="50">
      <path d="M933.339962 233.883974L541.924521 8.127591a60.21776 60.21776 0 0 0-60.21776 0L90.29132 233.883974a60.21776 60.21776 0 0 0-30.10888 52.208798v451.633201a60.21776 60.21776 0 0 0 30.10888 52.208798L481.706761 1015.691153a60.21776 60.21776 0 0 0 60.21776 0l391.415441-225.756382a60.21776 60.21776 0 0 0 30.10888-52.208798v-451.633201a60.21776 60.21776 0 0 0-30.10888-52.208798z m-421.524321-103.935854l270.19709 155.903781-270.437961 156.566176-272.003622-155.301603zM180.617961 392.256683L451.236575 546.835673v312.168869L180.617961 702.799672z m391.41544 466.687641V546.534584l270.618614-156.566176v312.831264z"></path>
    </svg>
  </div>
</template>

<script setup lang="ts">
defineProps({
  name: {
    type: String,
    required: true,
  },
})
</script>

<style>
.slot-display {
  display: block;
  background-color: #f0f0f0;
  border: 1px solid #969696;
  color: #333;
  max-height: 30px;
  word-break: break-all;
  white-space: nowrap;
  font-size: 11px;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
  flex-shrink: 0;

  svg {
    fill: #333;
    width: 20px;
    height: 20px;
  }
}
</style>
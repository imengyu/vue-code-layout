<script lang="ts">
import { defineComponent, h } from 'vue';

export default defineComponent({
  props: {
    content: {
      type: null,
      required: true,
    },
    class: {
      type: String,
      default: '',
    },
    fallback: {
      type: String,
      default: null,
    }
  },
  render() {
    if (typeof this.content === 'string')
      return [ h('span', { class: this.class }, this.content) ];
    if (typeof this.content === 'function')
      return [ this.content() ];
    if (this.fallback != null)
      return [ h('span', { class: this.class }, this.fallback) ];
    return []
  },
})
</script>
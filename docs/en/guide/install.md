# Install

```shell
npm install -save vue-code-layout
```

## Global Import Components

Suggest that you globally import components for the most convenient use.

```js
//main.js
import 'vue-code-layout/lib/vue-code-layout.css'
import CodeLayout from 'vue-code-layout'

createApp(App)
  .use(CodeLayout)
  .mount('#app')  
```

## Local import components

First import the style file:

```js
//main.js
import 'vue-code-layout/lib/vue-code-layout.css'
```

Then import the components where you need to use them:

```vue
<script lang="ts">
import { defineComponent } from 'vue'

//Import Components
import { CodeLayout } from 'vue-code-layout';

export default defineComponent({
  //Registration component
  components: {
    CodeLayout,
  },
  //Omit other codes
});
</script>
```

## Start using

[Start using](./useage.md)

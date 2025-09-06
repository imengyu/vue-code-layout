---
title: 安装
---

# 安装

```shell
npm install -save vue-code-layout
```

## 全局导入组件

建议你全局导入组件，这样使用最方便。

```js
//main.js
import 'vue-code-layout/lib/vue-code-layout.css'
import CodeLayout from 'vue-code-layout'

createApp(App)
  .use(CodeLayout)
  .mount('#app')  
```

## 局部导入组件

首先导入样式文件：

```js
//main.js
import 'vue-code-layout/lib/vue-code-layout.css'
```

然后在你需要使用的地方导入组件使用：

```vue
<script lang="ts">
import { defineComponent } from 'vue'

//导入组件
import { CodeLayout } from 'vue-code-layout';

export default defineComponent({
  //如果不使用setup，请注册组件
  components: {
    CodeLayout,
  },
  //省略其他代码
});
</script>
```

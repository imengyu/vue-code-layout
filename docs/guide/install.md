---
title: 安装
---

# 安装

```shell
npm install -save @imengyu/vue-code-layout
```

> 提示：vue-code-layout 仅支持 Vue3 + Vite

## 全局导入组件

建议你全局导入组件，这样使用最方便。

```js
//main.js
import '@imengyu/vue-code-layout/lib/vue-code-layout.css'
import CodeLayout from '@imengyu/vue-code-layout'

createApp(App)
  .use(CodeLayout)
  .mount('#app')  
```

## 局部导入组件

首先导入样式文件：

```js
//main.js
import '@imengyu/vue-code-layout/lib/vue-code-layout.css'
```

然后在你需要使用的地方导入组件使用：

```vue
<script lang="ts">
import { defineComponent } from 'vue'

//导入组件
import { CodeLayout } from '@imengyu/vue-code-layout';

export default defineComponent({
  //注册组件
  components: {
    CodeLayout,
  },
  //省略其他代码
});
</script>
```

## 开始使用

安装完成后您就可以 [开始使用](./useage.md) 了。

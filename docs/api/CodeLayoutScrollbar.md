# CodeLayoutScrollbar

![CodeLayoutScrollbarDemo](../images/CodeLayoutScrollbarDemo.gif)

CodeLayoutScrollbar是一个Vue的滚动条封装组件，如果你觉得系统内置滚动条与CodeLayout用起来不搭，可以试试使用CodeLayoutScrollbar，它内置了统一的样式。

## Props

| 属性 | 描述 | 类型 | 默认值 |
| :----: | :----: | :----: | :----: |
| scroll | 指定哪些方向可以滚动 | `'both'│'none'│'vertical'│'horizontal'` | `'both'` |
| scrollBarSize | 设置滚动条的大小（像素） | `number` | `8` |

## Slots

| 插槽名 | 描述 | 参数 |
| :----: | :----: | :----: |
| default | 内容渲染插槽 | - |

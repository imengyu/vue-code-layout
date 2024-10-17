# SplitTabItem

用于自定义渲染 SplitLayout 的标签页。需要在 SplitLayout 的插槽中使用。

[请参考文档使用](../guide/split-layout.md#自定义渲染面板头)。

## Props

| 属性 | 描述 | 类型 | 默认值 |
| :----: | :----: | :----: | :----: |
| panel | 面板数据 | `CodeLayoutSplitNPanelnternal` | — |
| active | 当前是否是激活状态 | `boolean` | `true` |

## Slots

| 插槽名 | 描述 | 参数 |
| :----: | :----: | :----: |
| icon | 图标渲染插槽 | - |
| title | 标题内容渲染插槽 | - |
| badge | 标记渲染插槽 | - |
| close | 关闭按钮渲染插槽 | - |

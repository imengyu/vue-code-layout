# OverflowCollapseList

自动溢出计算折叠条目组件，用在 CodeLayout 的一系列按钮组中。导出方便你使用。

## Props

| 属性 | 描述 | 类型 | 默认值 |
| :----: | :----: | :----: | :----: |
| items | 条目数据 | `any[]` | — |
| activeItem | 激活条目，激活的条目不会被隐藏 | `any` | - |
| direction | 布局方向 | `'vertical'│'horizontal'` | `'horizontal'` |
| itemMenuLabel | 溢出菜单的文字创建 | `(item: any) => string` | - |
| itemCollapseMergin | 溢出计算边距 | `(item: any) => string` | `30` |

## Slots

| 插槽名 | 描述 | 参数 |
| :----: | :----: | :----: |
| item | 条目渲染插槽 | - |

## Events

| 事件名 | 描述 | 参数 |
| :----: | :----: | :----: |
| overflowItemClicked | 当用户点击溢出菜单条目时触发 | `item: any` |

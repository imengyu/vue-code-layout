# SplitN

分隔网格组件，此组件是 SplitLayout 的核心功能实现组件。导出方便你使用。

## Props

| 属性 | 描述 | 类型 | 默认值 |
| :----: | :----: | :----: | :----: |
| grids | 网格数据 | `CodeLayoutSplitNGrid[]` | — |
| horizontal | 是否是水平 | `boolean` | `true` |
| draggerSize | 设置拖拽分割线大小（像素） | `number` | `1` |

## Slots

| 插槽名 | 描述 | 参数 |
| :----: | :----: | :----: |
| grid | 网格内容渲染插槽，grid 为当前网格数据 | `{ grid }` |

## 例子

[查看示例](../guide/split-layout.md#独立组件)

# CodeLayoutScrollbar

![CodeLayoutScrollbarDemo](../images/CodeLayoutScrollbarDemo.gif)

CodeLayoutScrollbar是一个Vue的滚动条封装组件，如果你觉得系统内置滚动条与CodeLayout用起来不搭，可以试试使用CodeLayoutScrollbar，它内置了统一的样式。

## Props

| 属性 | 描述 | 类型 | 默认值 |
| :----: | :----: | :----: | :----: |
| scroll | 指定哪些方向可以滚动 | `'both'│'none'│'vertical'│'horizontal'` | `'both'` |
| scrollBarSize | 设置滚动条的大小（像素） | `number` | `8` |
| containerClass | 设置内部容器的CSS类 | `string` | `''` |

## Slots

| 插槽名 | 描述 | 参数 |
| :----: | :----: | :----: |
| default | 内容渲染插槽 | - |

## Instance

### `refreshScrollState(): void`

说明：

强制刷新滚动条状态。

### `getScrollContainer(): HTMLElement | undefined`

说明：

获取内部滚动容器的元素实例。

返回值：

| 类型 | 说明 |
| :----: | :----: |
| HTMLElement | 返回的实例，如果为未定义，则可能是因为组件还未初始化完成 |

### `scrollTo(x: number, y: number): void`

说明：

设置滚动条位置。

参数：

| 名称 | 类型 | 说明 |
| :----: | :----: | :----: |
| x | number | x 轴坐标（像素） |
| y | number | y 轴坐标（像素） |

### `scrollToTop(): void`

说明：

滚动到顶部/最左部。

### `scrollToBottom(): void`

说明：

滚动到底部/最右部。

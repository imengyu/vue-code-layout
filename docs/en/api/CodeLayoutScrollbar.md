# CodeLayoutScrollbar

![CodeLayoutScrollbarDemo](../../images/CodeLayoutScrollbarDemo.gif)

CodeLayoutScrollbar is a Vue scrollbar component. If you feel that the browser scrollbar does not match CodeLayout, you can try using CodeLayoutScrollbar, which has a unified style built-in.

## Props

| Property | Description | Type | Default |
| :----: | :----: | :----: | :----: |
| scroll | Specify which directions can be scrolled | `'both'│'none'│'vertical'│'horizontal'` | `'both'` |
| scrollBarSize | Set the size of the scroll bar in pixels | `number` | `8` |
| containerClass | CSS class of inner container | `string` | `''` |

## Slots

| Slot name | Description | Param |
| :----: | :----: | :----: |
| default | Content rendering slot | - |

## Instance

### `refreshScrollState(): void`

Description:

Force refresh of scrollbar state.

### `getScrollContainer(): HTMLElement | undefined`

Description:

Get the element instance of the internal scrolling container.

Returns:

| Type | Description |
| :----: | :----: |
| HTMLElement | If returned undefined, it may be the component has not been initialized yet |

### `scrollTo(x: number, y: number): void`

Description:

Set scroll position.

Param：

| Name | Type | Description |
| :----: | :----: | :----: |
| x | number | x pos (pixel) |
| y | number | y pos (pixel) |

### `scrollToTop(): void`

Description:

Scroll to bottom/right.

### `scrollToBottom(): void`

Description:

Scroll to bottom/right.

# OverflowCollapseList

![OverflowCollapseList](../../images/OverflowCollapseList.gif)

Automatic overflow calculation folding item component, used in a series of button groups in CodeLayout. Exporting is convenient for you to use.

## Props

| Property | Description | Type | Default |
| :----: | :----: | :----: | :----: |
| items | Items to display, render by slot | `any[]` | — |
| getItemSize | Call back that calc item size. (Required) | `(item: T, horizontal: boolean, index: number) => number` | - |
| activeItem | Activated item, activated item will not be hidden | `any` | - |
| direction | Direction of the list, horizontal or vertical | `'vertical'│'horizontal'` | `'horizontal'` |
| itemMenuLabel | Label of the item in the context menu | `(item: any) => string` | - |
| itemCollapseMergin | Mergin of the item when collapse | `(item: any) => string` | `30` |
| itemKey | Key of the item.key, used to identify the item | `string` | `'name'` |
| visibleKey | Key of the item.visible, used to identify the item visibility | `string` | `''` |

## Slots

| Slot name | Description | Param |
| :----: | :----: | :----: |
| item | Item rendering slot | `{ visible: boolean, item: any, index: number }` |

## Events

| Event name | Description | Param |
| :----: | :----: | :----: |
| overflowItemClicked | Triggered when the user clicks on the overflow menu item | `item: any` |

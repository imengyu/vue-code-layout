# OverflowCollapseList

Automatic overflow calculation folding item component, used in a series of button groups in CodeLayout. Exporting is convenient for you to use.

## Props

| Property | Description | Type | Default |
| :----: | :----: | :----: | :----: |
| items | Items to display, render by slot | `any[]` | — |
| activeItem | Activated item, activated item will not be hidden | `any` | - |
| direction | Direction of the list, horizontal or vertical | `'vertical'│'horizontal'` | `'horizontal'` |
| itemMenuLabel | Label of the item in the context menu | `(item: any) => string` | - |
| itemCollapseMergin | Mergin of the item when collapse | `(item: any) => string` | `30` |

## Slots

| Slot name | Description | Param |
| :----: | :----: | :----: |
| item | Item rendering slot | - |

## Events

| Event name | Description | Param |
| :----: | :----: | :----: |
| overflowItemClicked | Triggered when the user clicks on the overflow menu item | `item: any` |

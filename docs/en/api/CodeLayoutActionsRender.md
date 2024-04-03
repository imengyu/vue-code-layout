# CodeLayoutActionsRender

The operation button group component is used in the panel title bar of CodeLayout for additional panel operations. This component is exported here for your convenience.

## Props

| Property | Description | Type | Default |
| :----: | :----: | :----: | :----: |
| actions | Action items | `CodeLayoutActionButton[]` | `[]` |

## CodeLayoutActionButton

Panel Action button Type Definition.

| Property | Description | Type | Default |
| :----: | :----: | :----: | :----: |
| render | Render the entire content of this button on your own | `() => VNode` | - |
| icon | Render the icon of this button | `() => VNode` | - |
| text | Text of this button | `string` | - |
| tooltip | Tooltip text of this button | `string` | - |
| tooltipDirection | The tooltip direction of the pop-up | `'left'│'top'│'right'│'bottom'` | - |
| onClick | Button click event callback | `() => void` | - |

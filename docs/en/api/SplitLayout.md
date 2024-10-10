# SplitLayout

Split layout components in the file editor center.

## Props

| Property | Description | Type | Default |
| :----: | :----: | :----: | :----: |
| saveBeforeUnload | Should the canSaveLayout event be triggered when window. beforeupload | `boolean` | `true` |
| showTabHeader | Whether to display Tab components. When it is `true`, it supports multiple sub panels in one grid, and the components should be rendered in the tabContentRender slot; When it is `false`, only grid segmentation is supported and panel and drag functions are not supported. You should render the content yourself in gridRender. | `boolean` | `true` |
| rootGridType | Specify the type of the root grid, usually used to set different types in multiple components to restrict mutual dragging | `CodeLayoutGrid` | `'centerArea'` |

## Events

| Event name | Description | Param |
| :----: | :----: | :----: |
| panelClose | This event is triggered when the panel is closed, and can be asynchronously called to resolve or reject to prevent closure | `panel: CodeLayoutSplitNPanelInternal, resolve: () => void, reject: (e?: any) => void)` |
| panelContextMenu | Trigger this event when the user clicks on the panel | `panel: CodeLayoutSplitNPanelInternal, event: MouseEvent` |
| panelActive | Trigger event when the user clicks to activate the panel | `lastActivePanel: CodeLayoutSplitNPanelInternal, panel: CodeLayoutSplitNPanelInternal` |
| panelDrop | Trigger event when the user drags and drops the panel | `panel: CodeLayoutSplitNPanelInternal, referencePanel: CodeLayoutSplitNPanelInternal, referencePosition: CodeLayoutDragDropReferencePosition` |
| gridActive | Trigger event when the user clicks to activate the grid | `lastActivePanel: CodeLayoutSplitNGridInternal, panel: CodeLayoutSplitNGridInternal` |
| canLoadLayout | This event is triggered when a component is loaded, and loading layout operations can be performed in this event | `ref: CodeLayoutSplitNInstance` |
| canSaveLayout | This event is triggered when the component is unmount, and loading and saving operations can be performed in this event | `ref: CodeLayoutSplitNInstance` |

## Slots

| Slot name | Description | Param |
| :----: | :----: | :----: |
| tabContentRender | Panel content rendering slot | `{ panel: CodeLayoutSplitNPanelInternal }` |
| tabEmptyContentRender | The rendering slot when there are no sub panels in the non shrinking grid | `{ grid: CodeLayoutSplitNGridInternal }` |
| tabHeaderExtraRender | Additional area rendering slot for Tab head | `{ grid: CodeLayoutSplitNGridInternal }` |
| tabItemRender | Custom rendering of Tab item | `{ index: number, panel: CodeLayoutSplitNPanelInternal, active: boolean }` |
| tabRender | Custom Tab component rendering, usually you don't need to customize | `{ grid: CodeLayoutSplitNGridInternal }` |
| gridRender | When `showTabHeader` is `false`, render the content in this slot yourself | `{ grid: CodeLayoutSplitNGridInternal }` |

## CodeLayoutSplitNInstance

### `getRootGrid(): CodeLayoutSplitNGridInternal`

Description:

Get root grid instance.

Returns:

| Type | Description |
| :----: | :----: |
| CodeLayoutSplitNGridInternal | Root grid instance. |

### `getPanelByName(name: string): CodeLayoutSplitNPanelInternal | undefined`

Description:

Get panel instance by name.

Param：

| Name | Description |
| :----: | :----: |
| name | The panel name. |

Returns:

| Type | Description |
| :----: | :----: |
| `CodeLayoutSplitNPanelInternal` or `undefined` |  Panel instance, if panel is not found in the component, return undefined |

### `getGridByName(name: string): CodeLayoutSplitNGridInternal | undefined`

Description:

Get grid instance by name.

Param：

| Name | Description |
| :----: | :----: |
| name | The grid name. |

Returns:

| Type | Description |
| :----: | :----: |
| `CodeLayoutSplitNGridInternal` or `undefined` | Grid instance, if grid is not found in the component, return undefined |

### `getActiveGird(): CodeLayoutSplitNGridInternal|undefined`

Description:

Obtain a grid that is currently actived by user and can be used to add panels.

### `activePanel(name: string): void`

Description:

Activate the specified panel through Name. If the specified Name panel does not exist in the component, it has no effect.

This method will change ActiveGird.

Param：

| Name | Description |
| :----: | :----: |
| name | Panel name |

### `clearLayout(): void`

Description:

Clear all grid.

### `loadLayout(json: any, instantiatePanelCallback: (data: CodeLayoutSplitNPanel) => CodeLayoutSplitNPanel): void`

Description:

Load the previous layout from JSON data, will clear all panels, instantiatePanelCallback will sequentially call all panels, where you can process panel data.

Note that since saving layout data only saves the basic position, size, and other information of each layout, and does not contain information that cannot be serialized (such as callback functions and icons), when loading layout data, it is necessary to fill in this data in instantiatePanelCallback based on the passed in panel name.

```ts
const data = localStorage.getItem('LayoutData');
if (data) {
  //If load layout from data, need fill panel data
  splitLayout.value.loadLayout(JSON.parse(data), (panel) => {
    switch (panel.name) {
      case 'file1':
        panel.title = 'File 1';
        panel.tooltip = 'File path c://...';
        panel.badge = '2';
        panel.iconSmall = () => h(IconFile);
        break;
    }
    return panel;
  });
} else {
  //No data, create new layout
  //...
}
```

Param：

| Name | Description |
| :----: | :----: |
| json | json data from `saveLayout`. |
| instantiatePanelCallback | process layout data panel. |

### `saveLayout(): any`

Description:

Save the layout dragged by the user to the JSON data, and after the next entry, call `loadLayout` to reload and restore the original layout from the JSON data.

Note: Some basic layout data (CodeLayoutConfig) needs to be save after called this function.

Returns:

| Type | Description |
| :----: | :----: |
| `object` | json |

## CodeLayoutSplitNPanelInternal

Panel type definition of SplitLayout.

| Property | Description | Type | Default |
| :----: | :----: | :----: | :----: |
| name | Name of this panel. | `string` | - |
| title | Title of this panel. | `string` | - |
| tooltip | Tooltip of this panel. | `string` | - |
| badge | Badge of this panel. | `string` | - |
| iconSmall | Icon of panel | `() => VNode` | - |
| size | The size of the current panel (in pixels), specified as 0 when created, will be automatically allocated by the component | `number` | 0 |
| parentGroup | Parent grid instance of this panel. | `CodeLayoutSplitNPanelInternal` | - |
| parentGrid | Parent toplevel grid name of this panel. | `CodeLayoutGrid` | - |
| accept | Set which grids the current panel can be dragged and dropped onto. | `CodeLayoutGrid[]` | - |
| actions | Custom user actions. | [`CodeLayoutActionButton[]`](../api/CodeLayoutActionsRender.md#codelayoutactionbutton) | `false` |
| data | Custom data attached to the current panel. | `any` | - |

### `closePanel(): void`

Description:

Manually trigger the closing operation of the current panel.

### `splitCopy(direction: CodeLayoutSplitCopyDirection, instanceCb: (panel: CodeLayoutSplitNPanel) => CodeLayoutSplitNPanel): void`

Description:

克隆当前面板并且向指定方向分割。通常用于文件编辑器需要分成两个窗口编辑时使用。

Param:

| Name | Description |
| :----: | :----: |
| direction | Split direction |
| instanceCb | New panel instance callback, can modify params |

For example, the following reference code is bound to the `panelContextMenu` event of the panel. Users can right-click on the menu item to clone and split the selected panel in four directions.

```ts
function onPanelMenu(panel: CodeLayoutPanelInternal, e: MouseEvent) {
  e.stopPropagation();
  e.preventDefault();
  
  ContextMenuGlobal.showContextMenu({
    x: e.x,
    y: e.y,
    items: [
      {
        label: "Split Up",
        onClick: () => {
          (panel as CodeLayoutSplitNPanelInternal).splitCopy('top', (panel) => {
            panel.name = panel.name + '.copy';
            panel.title = panel.title + ' Clone';
            return panel;
          });
        }
      },
      {
        label: "Split Down",
        onClick: () => {
          (panel as CodeLayoutSplitNPanelInternal).splitCopy('bottom', (panel) => {
            panel.name = panel.name + '.copy';
            panel.title = panel.title + ' Clone';
            return panel;
          });
        }
      },
      {
        label: "Split Left",
        onClick: () => {
          (panel as CodeLayoutSplitNPanelInternal).splitCopy('left', (panel) => {
            panel.name = panel.name + '.copy';
            panel.title = panel.title + ' Clone';
            return panel;
          });
        }
      },
      {
        label: "Split Right",
        onClick: () => {
          (panel as CodeLayoutSplitNPanelInternal).splitCopy('right', (panel) => {
            panel.name = panel.name + '.copy';
            panel.title = panel.title + ' Clone';
            return panel;
          });
        }
      },
    ],
  });
}

```

## CodeLayoutSplitNGridInternal

Grid type definition of SplitLayout.

| Property | Description | Type | Default |
| :----: | :----: | :----: | :----: |
| canMinClose | Set whether users can close the current panel by continuously shrinking it. | `boolean` | `false` |
| direction | Layout direction. | `'vertical'│'horizontal'` | `'vertical'` |
| childGrid | Child grid of this grid. | `CodeLayoutSplitNGridInternal[]` | - |

### `addGrid(grid: CodeLayoutSplitNGrid): CodeLayoutSplitNPanelInternal`

Description:

Add a child grid to this grid.

Param：

| Name | Description |
| :----: | :----: |
| grid | Grid to add |

Returns:

Child grid instance.

### `removePanel(grid: CodeLayoutSplitNGrid)`

Description:

Remove a child grid from this grid.

Param：

| Name | Description |
| :----: | :----: |
| grid | Grid to remove |

### `addPanel(panel: CodeLayoutSplitNPanel): CodeLayoutSplitNPanelInternal`

Description:

Add sub panels to the current Grid.

Param：

| Name | Description |
| :----: | :----: |
| panel | Panel data |

Returns:

Child panel instance.

### `removePanel(panel: CodeLayoutSplitNPanelInternal, shrink = false): CodeLayoutSplitNPanelInternal`

Description:

Remove panel from this grid.

Param：

| Name | Description |
| :----: | :----: |
| panel | Panel instance. |
| shrink | Automatically shrink? Default true |

### `setActiveChild(child: CodeLayoutSplitNPanelInternal|null): void`

Description:

Set activePanel.

Param：

| Name | Description |
| :----: | :----: |
| child | The panel to be activated |

### `reselectActiveChild(): void`

Description:

Re select an available panel as the active panel.

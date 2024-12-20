# CodeLayout

Editor shell layout component.

## Props

| Property | Description | Type | Default |
| :----: | :----: | :----: | :----: |
| layoutConfig | Base layout config | [`CodeLayoutConfig`](#CodeLayoutConfig) | — |
| langConfig | Language config | [`CodeLayoutLangConfig`](#CodeLayoutLangConfig) | — |
| mainMenuConfig | Main menu (in top left) config | [`MenuOptions`](../guide/code-layout.md#built-in-main-menu) | — |
| emptyText | The empty text when no panel in the group | `string` | `'Drag a view here to display'` |
| saveBeforeUnload | Should the canSaveLayout event be triggered when window. beforeupload | `boolean` | `true` |

## Events

| Event name | Description | Param |
| :----: | :----: | :----: |
| canLoadLayout | This event is triggered when a component is loaded, and loading layout operations can be performed in this event | `ref: CodeLayoutInstance` |
| canSaveLayout | This event is triggered when the component is unmount, and loading and saving operations can be performed in this event | `ref: CodeLayoutInstance` |

## Slots

| Slot name | Description | Param |
| :----: | :----: | :----: |
| panelRender | Panel content rendering solt | `{ panel: CodeLayoutPanelInternal, open: boolean }` |
| titleBarIcon | Title bar rendering icon position | - |
| titleBarMenu | Title bar rendering main menu position | - |
| titleBarCenter | Title bar center position | - |
| titleBarRight | Right position of title bar | - |
| activityBarTopBar | At the btopottom of the main activity bar | - |
| activityBarBottom | At the bottom of the main activity bar | - |
| activityBarSecondaryTopBar | At the btopottom of the secondary activity bar | - |
| activityBarSecondarBottom | At the bottom of the secondary activity bar | - |
| emptyGroup | Empty group render slot | `{ panel: CodeLayoutGridInternal }` |
| centerArea | Central area, where SliptLayout or other editor components can be placed | - |
| statusBar | Status bar position | - |
| emptyGroup | Customize rendering of empty group content | `{ grid: CodeLayoutGrid }` |

## CodeLayoutInstance

### `addGroup: (panel: CodeLayoutPanel, target: CodeLayoutGrid) => CodeLayoutPanelInternal`

Description:

Add top level group to layout.

Param：

| Name | Description |
| :----: | :----: |
| panel | Group define. |
| target | Target grid. |

Returns:

| Type | Description |
| :----: | :----: |
| CodeLayoutPanelInternal | Group instance. |

### `removeGroup(panel: CodeLayoutPanelInternal): void`

Description:

Remove top level group from layout.

Param：

| Name | Description |
| :----: | :----: |
| panel | Group instance. |

### `relayoutAll: () => void`

Description:

Force relayout all group.

Generally, adding panels to a group will automatically relayout, but it can also be manually called up.

### `relayoutGroup(name: string): void`

Description:

Force relayout a group.

Generally, adding panels to a group will automatically relayout, but it can also be manually called up.

Param：

| Name | Description |
| :----: | :----: |
| name | Group name. |

### `getRootGrid(target: CodeLayoutGrid): CodeLayoutGridInternal`

Description:

Get the internal root grid instance.

Param：

| Name | Description |
| :----: | :----: |
| target | Grid name. |

Returns:

| Type | Description |
| :----: | :----: |
| [CodeLayoutGridInternal](#codelayoutgridinternal) | Top level grid instance |

### `getPanelByName(name: string): CodeLayoutPanelInternal | undefined`

Description:

Get panel instance by name.

Param：

| Name | Description |
| :----: | :----: |
| name | The panel name. |

Returns:

| Type | Description |
| :----: | :----: |
| `CodeLayoutPanelInternal` or `undefined` | Found panel instance, if this panel is not found in the component, return undefined |

### `clearLayout(): void`

Description:

Clear all panels.

### `loadLayout(json: any, instantiatePanelCallback: (data: CodeLayoutPanel) => CodeLayoutPanel): void`

Description:

Load the previous layout from JSON data, will clear all panels, instantiatePanelCallback will sequentially call all panels, where you can process panel data.

Note that since saving layout data only saves the basic position, size, and other information of each layout, and does not contain information that cannot be serialized (such as callback functions and icons), when loading layout data, it is necessary to fill in this data in instantiatePanelCallback based on the passed in panel name.

```ts
const data = localStorage.getItem('LayoutData');
if (data) {
  //If load layout from data, need fill panel data
  codeLayout.value.loadLayout(JSON.parse(data), (panel) => {
    switch (panel.name) {
      case 'explorer':
        panel.title = 'Explorer';
        panel.tooltip = 'Explorer';
        panel.badge = '2';
        panel.iconLarge = () => h(IconFile);
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

## CodeLayoutConfig

Layout Type Definition

Default data can be copied when creating objects:

```ts
import { defaultCodeLayoutConfig } from 'vue-code-layout';

const config = reactive<CodeLayoutConfig>({
  ...defaultCodeLayoutConfig,
  primarySideBarWidth: 40,
});
```

| Property | Description | Type | Default |
| :----: | :----: | :----: | :----: |
| primarySideBarSwitchWithActivityBar | <div style="width:250px">Control whether to switch the display of the primarySideBar when clicking on the selected item in the activity bar</div> | `boolean` | `true` |
| primarySideBarPosition | The position of the primarySideBar | `'left'│'right'` | `'left'` |
| primarySideBarWidth | The size of the primarySideBar (0-100, percentage) | `number` | `20` |
| primarySideBarMinWidth | The minimum size of the primarySideBar in pixels | `number` | `170` |
| secondarySideBarWidth | The size of the secondarySideBar (0-100, percentage) | `number` | `20` |
| secondarySideBarMinWidth | The minimum size of the secondarySideBar in pixels | `number` | `170` |
| secondarySideBarAsActivityBar | Whether the secondary sidebar appears as an active bar like the primarySidebar | `boolean` | `false` |
| bottomPanelHeight | The size of the bottomPanel (0-100, percentage) | `number` | `30` |
| bottomPanelMinHeight | The minimum size of the bottomPanel in pixels | `number` | `40` |
| bottomAlignment | The layout position of the bottomPanel<ul><li>left: At the bottom left</li><li>center: At the bottom center</li><li>right: At the bottom right</li><li>justify: At the bottom center and justify</li><li>left-side: Center left</li><li>right-side: Center right</li></ul> | `'left'│'center'│'right'│'justify'│'left-side'│'right-side'` | `'center'` |
| activityBarPosition | The position of the activityBar<ul><li>side: Main left</li><li>top: In primarySideBar top</li><li>hidden: No activityBar</li></ul> | `'side'│'top'│'hidden'` | `'side'` |
| secondaryActivityBarPosition | The position of the secondary activityBar (when `secondarySideBarAsActivityBar` is set to `true`) <ul><li>side: Main left</li><li>top: In primarySideBar top</li><li>hidden: No activityBar</li></ul> | `'side'│'top'│'hidden'` | `'side'` |
| panelHeaderHeight | The height of the panel title in pixels | `number` | `24` |
| panelMinHeight | The minimum height (in pixels) for all panels | `number` | `150` |
| titleBar | Show title bar? | `boolean` | `true` |
| titleBarShowCustomizeLayout | Display Customize layout pop-up at the top of the title bar? | `boolean` | `true` |
| activityBar | Show activity bar? | `boolean` | `true` |
| primarySideBar | Show primarySideBar? | `boolean` | `true` |
| secondarySideBar | Show secondarySideBar? | `boolean` | `false` |
| bottomPanel | Show bottomPanel? | `boolean` | `true` |
| bottomPanelMaximize | Can the bottomPanel be maximized? | `boolean` | `true` |
| statusBar | Show statusBar? | `boolean` | `true` |
| menuBar | Show menuBar? | `boolean` | `true` |
| onResetDefault | When the user clicks the reset button in the custom layout pop-up, this callback is triggered | `() => void` | - |
| onStartDrag | When the user starts dragging the panel, this callback is triggered, which can return false to prevent the user from dragging | `(panel: CodeLayoutPanelInternal) => boolean` | - |
| onEndDrag | Trigger this callback when the user completes dragging the panel | `(panel: CodeLayoutPanelInternal) => void` | - |
| onDropToGrid | When the user drags a panel to a root group, this callback is triggered, which can return false to prevent the user from dragging | `(panel: CodeLayoutPanelInternal, grid: CodeLayoutGrid) => boolean` | - |
| onDropToPanel | When the user drags a panel to another panel, this callback is triggered, which can return false to prevent the user from dragging | `(reference: CodeLayoutPanelInternal, referencePosition: CodeLayoutDragDropReferencePosition, panel: CodeLayoutPanelInternal, dropTo: string) => boolean` | - |
| onGridFirstDrop | When the user drags a panel to a group, this callback is triggered to customize and modify the panel data that will eventually be added to the group | `(grid: CodeLayoutGrid, panel: CodeLayoutPanelInternal) => CodeLayoutPanelInternal` | - |
| onNoAutoShinkTabGroup | When a non shrinking TAB group is set to attempt to shrink, this callback will be triggered | `(group: CodeLayoutPanelInternal) => void` | - |
| onNoAutoShinkNormalGroup | This callback is triggered when a regular group that is set to not shrink attempts to shrink | `(group: CodeLayoutPanelInternal) => void` | - |
| onNonPanelDrag | This callback is triggered when  user drag a non-panel data into component. You can check here whether dragging is allowed or not. | `(e: DragEvent, sourcePosition: CodeLayoutDragDropReferenceAreaType) => boolean` | - |
| onNonPanelDrop | This callback is triggered when user drop a non-panel data into component.  | `(e: DragEvent, sourcePosition: CodeLayoutDragDropReferenceAreaType, reference: CodeLayoutPanelInternal︱undefined, referencePosition: CodeLayoutDragDropReferencePosition︱undefined) => void` | - |

## CodeLayoutLangConfig

Basic language defined objects.

| Property | Description | Type | Default |
| :----: | :----: | :----: | :----: |
| lang | Language of component | `string` | `en` |
| stringsOverride | Override some strings of current language. | [`Partial<CodeLayoutLangDefine>`](../guide/i18n) | - |

## CodeLayoutPanelInternal

Definition of panel/group instance classes.

Due to the use of the same data instance for groups and panels, some properties and methods have different usage scenarios. Annotations (only used within groups) can only be used in instances that serve as groups. Please refer to the documentation for usage.

| Property | Description | Type | Default |
| :----: | :----: | :----: | :----: |
| name | Name of this panel. | `string` | - |
| title | Title of this panel. | `string` | - |
| tooltip | Tooltip of this panel. | `string` | - |
| badge | Badge of this panel. | `string` | - |
| open | Specify whether the current panel is open | `boolean` | `false` |
| startOpen | When creating, specify whether the current panel is open | `boolean` | `false` |
| iconSmall | Small icon of panel | `() => VNode` | - |
| iconLarge | Large icon of panel (usually displayed in the activity bar) | `() => VNode` | - |
| resizeable | Set user can resize this panel. | `boolean` | `true` |
| visible | Show panel? | `boolean` | `true` |
| draggable | Specify whether the current panel allows dragging | `boolean` | `true` |
| showBadge | Specify whether the current panel's badge is displayed | `boolean` | `true` |
| size | The size of the current panel (in pixels), specified as 0 when created, will be automatically allocated by the component | `number` | 0 |
| parentGroup | Parent grid instance of this panel. | `CodeLayoutPanelInternal` | - |
| parentGrid | Parent toplevel grid name of this panel. | `CodeLayoutGrid` | - |
| accept | Set which grids the current panel can be dragged and dropped onto. | `CodeLayoutGrid[]` | - |
| noHide | Set whether users cannot hide this panel. | `boolean` | `false` |
| noAutoShink | Set whether the current grid triggers its own remove/merge operation after all subpanels/grids are removed. Set to true will keep grid display, even if it does not have child panels/grids.(Only valid for group) | `boolean` | `false` |
| actions | Custom user actions. | [`CodeLayoutActionButton[]`](../api/CodeLayoutActionsRender.md#codelayoutactionbutton) | `false` |
| data | Custom data attached to the current panel. | `any` | - |

### `addPanel(panel: CodeLayoutPanel, startOpen = false): CodeLayoutPanelInternal`

Description:

(only used within groups) Add sub panels to the current group.

Param：

| Name | Description |
| :----: | :----: |
| panel | Panel data |
| startOpen | Is it open state when adding |

Returns:

Subpanel instance.

### `removePanel(panel: CodeLayoutPanel, shrink = false): CodeLayoutPanelInternal`

Description:

(only used within groups) Remove panel from this group.

Param：

| Name | Description |
| :----: | :----: |
| panel | Panel instance. |
| shrink | Automatically shrink? Default true |

### `openPanel(closeOthers = true): void`

Description:

Open this panel.

Param：

| Name | Description |
| :----: | :----: |
| closeOthers | When opening oneself, do you also close other panels at the same level, Default: false |

### `closePanel(): void`

Description:

Close this panel.

### `togglePanel(): void`

Description:

Toggle open state of this panel.

### `removeSelfWithShrink(): void`

Description:

Remove the current panel/grid from its parent and trigger automatic shrink/merge operations.

### `removeSelf(): void`

Description:

Remove the current panel/grid from its parent.

### `reselectActiveChild(): void`

Description:

(only used within groups) Re select an available panel as the active panel.

### `activeSelf(): void`

Description:

Set parent activePanel to self.

### `getContainerSize(): number`

Description:

Get grid hoster container size (pixel).

### `notifyRelayout(): void`

Description:

(only used within groups) Notify hoster container force relayout.

### `relayoutAllWithNewPanel(panels: CodeLayoutPanelInternal[], referencePanel?: CodeLayoutPanelInternal): void`

Description:

(only used within groups) Notify hoster container there has new grids was added and needs to relayout.

Param：

| Name | Description |
| :----: | :----: |
| panels | Newly added panel instances |
| referencePanel | Reserve Param, no need to pass it on |

### `relayoutAllWithRemovePanel(panel: CodeLayoutPanelInternal): void`

Description:

(only used within groups) Notify hoster container there has grids was removed and needs to relayout.

### `relayoutAllWithResizedSize(panel: CodeLayoutPanelInternal): void`

Description:

(only used within groups) Notify hoster container to relayout when container size changed.

## CodeLayoutGridInternal

Definition of top-level grid group instance class.

### `collapse(open: boolean): void`

Description:

Open or collapse the current top-level grid.

Param：

| Name | Description |
| :----: | :----: |
| open | Is open? |

# SplitLayout

文件编辑器中心分割布局组件。

## Props

| 属性 | 描述 | 类型 | 默认值 |
| :----: | :----: | :----: | :----: |
| saveBeforeUnload | 是否应该在 `window.beforeunload` 时触发 `canSaveLayout` 事件 | `boolean` | `true` |
| showTabHeader | 是否显示TAB分组组件，当为 `true` 时，支持一个网格多个子面板，应该在tabContentRender插槽中渲染组件；当为 `false` 时，仅支持网格分割不支持面板与拖拽功能，应该在gridRender中自己渲染内容。 | `boolean` | `true` |
| rootGridType | 指定根网格的类型，通常用于在多个组件中设置不同的类型以限制互相拖拽 | `CodeLayoutGrid` | `'centerArea'` |

## Events

| 事件名 | 描述 | 参数 |
| :----: | :----: | :----: |
| panelClose | 面板关闭时触发此事件，可以异步调用 resolve，或者 reject 阻止关闭 | `panel: CodeLayoutSplitNPanelInternal, resolve: () => void, reject: (e?: any) => void)` |
| panelContextMenu | 用户在面板上点击右键菜单时触发此事件 | `panel: CodeLayoutSplitNPanelInternal, event: MouseEvent` |
| panelActive | 当用户点击激活面板时触发事件 | `lastActivePanel: CodeLayoutSplitNPanelInternal, panel: CodeLayoutSplitNPanelInternal` |
| panelDrop | 当用户拖拽面板放置时触发事件 | `panel: CodeLayoutSplitNPanelInternal, referencePanel: CodeLayoutSplitNPanelInternal, referencePosition: CodeLayoutDragDropReferencePosition` |
| gridActive | 当用户点击激活网格时触发事件 | `lastActivePanel: CodeLayoutSplitNGridInternal, panel: CodeLayoutSplitNGridInternal` |
| canLoadLayout | 组件加载时触发此事件，可在此事件中执行加载布局操作 | `ref: CodeLayoutSplitNInstance` |
| canSaveLayout | 组件卸载时触发此事件，可在此事件中执行加载保存操作 | `ref: CodeLayoutSplitNInstance` |

## Slots

| 插槽名 | 描述 | 参数 |
| :----: | :----: | :----: |
| tabContentRender | 面板内容渲染插槽 | `{ panel: CodeLayoutSplitNPanelInternal }` |
| tabEmptyContentRender | 当不收缩网格没有子面板时的渲染插槽 | `{ grid: CodeLayoutSplitNGridInternal }` |
| tabHeaderExtraRender | TAB头部额外区域渲染插槽 | `{ grid: CodeLayoutSplitNGridInternal }` |
| tabItemRender | TAB标签的自定义渲染 | `{ index: number, panel: CodeLayoutSplitNPanelInternal, active: boolean }` |
| tabRender | 自定义TAB渲染，通常你不需要自定义 | `{ grid: CodeLayoutSplitNGridInternal }` |
| gridRender | 当 `showTabHeader` 为 `false` 时，仅支持网格分割不支持面板与拖拽功能，在此插槽中自己渲染内容 | `{ grid: CodeLayoutSplitNGridInternal }` |

## CodeLayoutSplitNInstance

### `getRootGrid(): CodeLayoutSplitNGridInternal`

说明：

获取根网格。

返回值：

| 类型 | 说明 |
| :----: | :----: |
| CodeLayoutSplitNGridInternal | 返回的组实例 |

### `getPanelByName(name: string): CodeLayoutSplitNPanelInternal | undefined`

说明：

通过名称获取指定的面板。

参数：

| 名称 | 说明 |
| :----: | :----: |
| name | 面板名称 |

返回值：

| 类型 | 说明 |
| :----: | :----: |
| `CodeLayoutSplitNPanelInternal` or `undefined` | 找到的面板实例，如果在组件中未找到此面板，则返回undefined |

### `getGridByName(name: string): CodeLayoutSplitNGridInternal | undefined`

说明：

通过名称获取指定的网格。

参数：

| 名称 | 说明 |
| :----: | :----: |
| name | 网格名称 |

返回值：

| 类型 | 说明 |
| :----: | :----: |
| `CodeLayoutSplitNGridInternal` or `undefined` | 找到的网格实例，如果在组件中未找到此网格，则返回undefined |

### `getActiveGird(): CodeLayoutSplitNGridInternal|undefined`

说明：

获取用户当前激活的可用于添加面板的网格。

### `activePanel(name: string): void`

说明：

通过名称激活指定的面板，如果指定名称面板在组件中不存在，则没有效果。

此函数会同时修改激活的网格。

参数：

| 名称 | 说明 |
| :----: | :----: |
| name | 网格名称 |

### `clearLayout(): void`

说明：

清空当前组件中的所有面板与网格数据。

### `loadLayout(json: any, instantiatePanelCallback: (data: CodeLayoutSplitNPanel) => CodeLayoutSplitNPanel): void`

说明：

加载布局数据，根据面板名称实例化面板。

注，由于保存布局数据仅保存每个布局的基础位置、大小等信息，并不包含无法序列化的信息（例如回调函数，图标），所以加载布局数据时需要在 instantiatePanelCallback 中，根据传入的面板名称填充这些数据。

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

参数：

| 名称 | 说明 |
| :----: | :----: |
| json | `saveLayout` 返回的布局数据 |
| instantiatePanelCallback | 实例化面板回调，传入参数为面板基础信息 |

### `saveLayout(): any`

说明：

保存用户拖拽后的布局至JSON数据中，在下一次进入后可调用 `loadLayout` 重新从JSON数据加载恢复原布局。

返回值：

| 类型 | 说明 |
| :----: | :----: |
| `object` | 布局数据 |

## CodeLayoutSplitNPanelInternal

Panel type definition of SplitLayout.

| 属性 | 描述 | 类型 | 默认值 |
| :----: | :----: | :----: | :----: |
| name | 面板名称，用于查找面板 | `string` | - |
| title | 面板标题 | `string` | - |
| tooltip | 面板的工具提示 | `string` | - |
| badge | 面板的标记 | `string` | - |
| iconSmall | 面板图标 | `() => VNode` | - |
| size | 当前面板的大小（百分比），创建时指定为0将由组件自动分配大小 | `number` | 0 |
| parentGroup | 获取当前面板的父级组 | `CodeLayoutSplitNPanelInternal` | - |
| parentGrid | 获取当前面板所属的顶级组 | `CodeLayoutGrid` | - |
| accept | 设置当前面板可以拖放到哪些顶级网格上 | `CodeLayoutGrid[]` | - |
| actions | 当前面板的自定义操作 | [`CodeLayoutActionButton[]`](../api/CodeLayoutActionsRender.md#codelayoutactionbutton) | `false` |
| data | 面板的自定义数据 | `any` | - |

### `closePanel(): void`

说明：

手动触发当前面板的关闭操作。

## CodeLayoutSplitNGridInternal

Grid type definition of SplitLayout.

| 属性 | 描述 | 类型 | 默认值 |
| :----: | :----: | :----: | :----: |
| canMinClose | Set whether users can close the current panel by continuously shrinking it. | `boolean` | `false` |
| direction | Layout direction. | `'vertical'│'horizontal'` | `'vertical'` |
| childGrid | Child grid of this grid. | `CodeLayoutSplitNGridInternal[]` | - |

### `addGrid(grid: CodeLayoutSplitNGrid): CodeLayoutSplitNPanelInternal`

说明：

向当前网格添加子网格。

参数：

| 名称 | 说明 |
| :----: | :----: |
| grid | 网格数据 |

返回值：

子网格实例。

### `removePanel(grid: CodeLayoutSplitNGrid)`

说明：

向当前网格移除子网格。

参数：

| 名称 | 说明 |
| :----: | :----: |
| grid | 网格数据 |

### `addPanel(panel: CodeLayoutSplitNPanel, startOpen = false): CodeLayoutSplitNPanelInternal`

说明：

向当前组添加子面板。

参数：

| 名称 | 说明 |
| :----: | :----: |
| panel | 面板数据 |
| startOpen | 添加时是否是打开状态 |

返回值：

子面板实例。

### `removePanel(panel: CodeLayoutSplitNPanelInternal, shrink = false): CodeLayoutSplitNPanelInternal`

说明：

向当前组移除子面板。

参数：

| 名称 | 说明 |
| :----: | :----: |
| panel | 面板实例 |
| shrink | 是否执行收缩操作 |

### `setActiveChild(child: CodeLayoutSplitNPanelInternal|null): void`

说明：

设置激活的面板。

参数：

| 名称 | 说明 |
| :----: | :----: |
| child | 要激活的面板 |

### `reselectActiveChild(): void`

说明：

重新选中一个可用的面板作为激活的面板。

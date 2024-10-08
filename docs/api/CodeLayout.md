---
title: CodeLayout
nav:
  title: API参考
  order: 3
---

# CodeLayout

编辑器外壳布局组件。

## Props

| 属性 | 描述 | 类型 | 默认值 |
| :----: | :----: | :----: | :----: |
| layoutConfig | 基础布局数据 | [`CodeLayoutConfig`](#CodeLayoutConfig) | — |
| langConfig | 组件内置语言数据定义 | [`CodeLayoutLangConfig`](#CodeLayoutLangConfig) | — |
| mainMenuConfig | 内置主菜单配置 | [`MenuOptions`](../guide/code-layout.md#内置主菜单) | — |
| emptyText | 组中没有面板时的空文本 | `string` | `'Drag a view here to display'` |
| saveBeforeUnload | 是否应该在 window.beforeunload 时触发 canSaveLayout 事件 | `boolean` | `true` |

## Events

| 事件名 | 描述 | 参数 |
| :----: | :----: | :----: |
| canLoadLayout | 组件加载时触发此事件，可在此事件中执行加载布局操作 | `ref: CodeLayoutInstance` |
| canSaveLayout | 组件卸载时触发此事件，可在此事件中执行加载保存操作 | `ref: CodeLayoutInstance` |

## Slots

| 插槽名 | 描述 | 参数 |
| :----: | :----: | :----: |
| panelRender | 面板内容渲染核心位置 | `{ panel: CodeLayoutPanelInternal, open: boolean }` |
| titleBarIcon | 标题栏渲染图标位置 | - |
| titleBarMenu | 标题栏渲染主菜单位置 | - |
| titleBarCenter | 标题栏中心位置 | - |
| titleBarRight | 标题栏右侧位置 | - |
| activityBarTopBar | 主活动栏顶部 | - |
| activityBarBottom | 主活动栏底部 | - |
| activityBarSecondaryTopBar | 副活动栏顶部 | - |
| activityBarSecondarBottom | 副活动栏底部 | - |
| emptyGroup | 空组渲染插槽 | `{ panel: CodeLayoutGridInternal }` |
| centerArea | 中心区域，这里可以放置SliptLayout或者其他编辑器核心组件 | - |
| statusBar | 状态栏位置 | - |
| emptyGroup | 自定义渲染空组内容 | `{ grid: CodeLayoutGrid }` |

## CodeLayoutInstance

### `addGroup: (panel: CodeLayoutPanel, target: CodeLayoutGrid) => CodeLayoutPanelInternal`

说明：

在顶级组下添加子组。

参数：

| 名称 | 说明 |
| :----: | :----: |
| panel | 要添加的组数据 |
| target | 添加的目标根网格 |

返回值：

| 类型 | 说明 |
| :----: | :----: |
| CodeLayoutPanelInternal | 返回的组实例 |

### `removeGroup(panel: CodeLayoutPanelInternal): void`

说明：

从顶级组下移除组。

参数：

| 名称 | 说明 |
| :----: | :----: |
| panel | 要移除的组数据 |

### `relayoutAll: () => void`

说明：

强制重新布局所有组。

一般情况下向组中添加面板，会自动完成布局，但也可手动调用布局。

### `relayoutGroup(name: string): void`

说明：

强制布局指定名称的组。

一般情况下向组中添加面板，会自动完成布局，但也可手动调用布局。

参数：

| 名称 | 说明 |
| :----: | :----: |
| name | 组名称 |

### `getRootGrid(target: CodeLayoutGrid): CodeLayoutGridInternal`

说明：

获取指定的根组。

参数：

| 名称 | 说明 |
| :----: | :----: |
| target | 根组名称 |

返回值：

| 类型 | 说明 |
| :----: | :----: |
| [CodeLayoutGridInternal](#codelayoutgridinternal) | 返回的顶级组实例 |

### `getPanelByName(name: string): CodeLayoutPanelInternal | undefined`

说明：

通过名称获取指定的面板。

参数：

| 名称 | 说明 |
| :----: | :----: |
| name | 面板名称 |

返回值：

| 类型 | 说明 |
| :----: | :----: |
| `CodeLayoutPanelInternal` or `undefined` | 找到的面板实例，如果在组件中未找到此面板，则返回undefined |

### `clearLayout(): void`

说明：

清空当前组件中的所有面板与组数据。

### `loadLayout(json: any, instantiatePanelCallback: (data: CodeLayoutPanel) => CodeLayoutPanel): void`

说明：

加载布局数据，根据面板名称实例化面板。

注，由于保存布局数据仅保存每个布局的基础位置、大小等信息，并不包含无法序列化的信息（例如回调函数，图标），所以加载布局数据时需要在 instantiatePanelCallback 中，根据传入的面板名称填充这些数据。

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

参数：

| 名称 | 说明 |
| :----: | :----: |
| json | `saveLayout` 返回的布局数据 |
| instantiatePanelCallback | 实例化面板回调，传入参数为面板基础信息 |

### `saveLayout(): any`

说明：

保存用户拖拽后的布局至JSON数据中，在下一次进入后可调用 `loadLayout` 重新从JSON数据加载恢复原布局。

注：一些基础布局数据（CodeLayoutConfig）需要调用此函数后才会同步至响应变量中，因此应该先调用此函数再保存基础布局数据。

返回值：

| 类型 | 说明 |
| :----: | :----: |
| `object` | 布局数据 |

## CodeLayoutConfig

基础布局数据定义对象。

在创建对象时可以复制默认数据：

```ts
import { defaultCodeLayoutConfig } from 'vue-code-layout';

const config = reactive<CodeLayoutConfig>({
  ...defaultCodeLayoutConfig,
  primarySideBarWidth: 40,
});
```

| Property | Description | Type | Default |
| :----: | :----: | :----: | :----: |
| primarySideBarSwitchWithActivityBar | <div style="width:250px">控制在活动栏中点击选中项目时，是否执行切换显示主侧栏的操作</div> | `boolean` | `true` |
| primarySideBarPosition | 主侧栏的位置 | `'left'│'right'` | `'left'` |
| primarySideBarWidth | 主侧栏的大小（0-100，百分比） | `number` | `20` |
| primarySideBarMinWidth | 主侧栏的最小大小（像素） | `number` | `170` |
| secondarySideBarWidth | 辅助侧边栏的大小（0-100，百分比） | `number` | `20` |
| secondarySideBarMinWidth | 辅助侧边栏的最小大小（像素） | `number` | `170` |
| secondarySideBarAsActivityBar | 辅助侧边栏是否像主侧边栏一样显示为活动栏 | `boolean` | `false` |
| bottomPanelHeight | 面板的大小（0-100，百分比） | `number` | `30` |
| bottomPanelMinHeight | 面板最小大小（像素） | `number` | `40` |
| bottomAlignment | 面板布局位置<ul><li>left: 底部左对齐</li><li>center：底部居中</li><li>right：底部右对齐</li><li>justify：底部两端对齐</li><li>left-side：左侧</li><li>right-side：右侧</li></ul> | `'left'│'center'│'right'│'justify'│'left-side'│'right-side'` | `'center'` |
| activityBarPosition | 活动栏的布局位置<ul><li>side: 左侧</li><li>top：顶部</li><li>hidden：隐藏</li></ul> | `'side'│'top'│'hidden'` | `'side'` |
| secondaryActivityBarPosition | 第二活动栏（当 `secondarySideBarAsActivityBar` 设置为 `true`）的布局位置<ul><li>side: 左侧</li><li>top：顶部</li><li>hidden：隐藏</li></ul> | `'side'│'top'│'hidden'` | `'side'` |
| panelHeaderHeight | 面板标题的高度（像素） | `number` | `24` |
| panelMinHeight | 所有面板缩放最小高度（像素） | `number` | `150` |
| titleBar | 是否显示标题栏 | `boolean` | `true` |
| titleBarShowCustomizeLayout | 是否在标题栏顶部显示自定义布局弹窗 | `boolean` | `true` |
| activityBar | 是否显示活动栏 | `boolean` | `true` |
| primarySideBar | 是否显示主侧栏 | `boolean` | `true` |
| secondarySideBar | 是否显示辅助侧边栏 | `boolean` | `false` |
| bottomPanel | 是否显示面板 | `boolean` | `true` |
| bottomPanelMaximize | 面板是否可以最大化 | `boolean` | `true` |
| statusBar | 是否显示状态栏 | `boolean` | `true` |
| menuBar | 是否显示菜单栏 | `boolean` | `true` |
| onResetDefault | 当用户在自定义布局弹窗中点击重置按钮时，触发此回调 | `() => void` | - |
| onStartDrag | 当用户开始拖拽面板时，触发此回调，可以返回false，阻止用户拖动 | `(panel: CodeLayoutPanelInternal) => boolean` | - |
| onEndDrag | 用户完成拖拽面板时触发此回调 | `(panel: CodeLayoutPanelInternal) => void` | - |
| onDropToGrid | 当用户拖拽面板至一个根组时，触发此回调，可以返回false，阻止用户拖动 | `(panel: CodeLayoutPanelInternal, grid: CodeLayoutGrid) => boolean` | - |
| onDropToPanel | 当用户拖拽面板至另一个面板时，触发此回调，可以返回false，阻止用户拖动 | `(reference: CodeLayoutPanelInternal, referencePosition: CodeLayoutDragDropReferencePosition, panel: CodeLayoutPanelInternal, dropTo: string) => boolean` | - |
| onGridFirstDrop | 当用户拖拽面板至一个组时，触发此回调，可以自定义修改最终加入组的面板数据 | `(grid: CodeLayoutGrid, panel: CodeLayoutPanelInternal) => CodeLayoutPanelInternal` | - |
| onNoAutoShinkTabGroup | 当设置了不收缩的TAB组尝试收缩时，会触发此回调 | `(group: CodeLayoutPanelInternal) => void` | - |
| onNoAutoShinkNormalGroup | 当设置了不收缩的普通组尝试收缩时，会触发此回调 | `(group: CodeLayoutPanelInternal) => void` | - |

## CodeLayoutLangConfig

基础语言定义对象。

| 属性 | 描述 | 类型 | 默认值 |
| :----: | :----: | :----: | :----: |
| lang | 指定组件使用的语言 | `string` | `en` |
| stringsOverride | 覆盖语言字符串 | [`Partial<CodeLayoutLangDefine>`](../guide/i18n) | - |

## CodeLayoutPanelInternal

面板/组实例类定义。

由于组和面板使用同一个数据实例，一些属性和方法一不同的使用场景，标注（仅组中使用）仅可在作为组的实例中使用，请参照文档使用。

| 属性 | 描述 | 类型 | 默认值 |
| :----: | :----: | :----: | :----: |
| name | 面板名称，用于查找面板 | `string` | - |
| title | 面板标题 | `string` | - |
| tooltip | 面板的工具提示 | `string` | - |
| badge | 面板的标记 | `string` | - |
| open | 指定当前面板是否是打开状态 | `boolean` | `false` |
| startOpen | 创建时指定当前面板是否处于打开状态 | `boolean` | `false` |
| iconSmall | 面板小图标 | `() => VNode` | - |
| iconLarge | 面板大图标（通常显示在活动栏） | `() => VNode` | - |
| resizeable | 指定当前面板是否可以调整大小 | `boolean` | `true` |
| visible | 指定当前面板是否显示 | `boolean` | `true` |
| showBadge | 指定当前面板的标记（badge）是否显示 | `boolean` | `true` |
| size | 当前面板的大小（像素），创建时指定为0将由组件自动分配大小 | `number` | 0 |
| parentGroup | 获取当前面板的父级组 | `CodeLayoutPanelInternal` | - |
| parentGrid | 获取当前面板所属的顶级组 | `CodeLayoutGrid` | - |
| accept | 设置当前面板可以拖放到哪些顶级网格上 | `CodeLayoutGrid[]` | - |
| noHide | 是否禁止用户对当前面板做出隐藏操作 | `boolean` | `false` |
| noAutoShink | 是否禁止自动收缩当前网格(仅组有效) | `boolean` | `false` |
| actions | 当前面板的自定义操作 | [`CodeLayoutActionButton[]`](../api/CodeLayoutActionsRender.md#codelayoutactionbutton) | `false` |
| data | 面板的自定义数据 | `any` | - |

### `addPanel(panel: CodeLayoutPanel, startOpen = false): CodeLayoutPanelInternal`

说明：

（仅组中使用）向当前组添加子面板。

参数：

| 名称 | 说明 |
| :----: | :----: |
| panel | 面板数据 |
| startOpen | 添加时是否是打开状态 |

返回值：

子面板实例。

### `removePanel(panel: CodeLayoutPanel, shrink = false): CodeLayoutPanelInternal`

说明：

（仅组中使用）向当前组移除子面板。

参数：

| 名称 | 说明 |
| :----: | :----: |
| panel | 面板实例 |
| shrink | 是否执行收缩操作 |

### `openPanel(closeOthers = true): void`

说明：

打开自己面板。

参数：

| 名称 | 说明 |
| :----: | :----: |
| closeOthers | 打开自己时，是否同时关闭同级的其他面板 |

### `closePanel(): void`

说明：

关闭自己面板。

### `togglePanel(): void`

说明：

切换自己面板的打开状态。

### `removeSelfWithShrink(): void`

说明：

从父级移除自己并且触发自动收缩。

### `removeSelf(): void`

说明：

从父级移除自己。

### `reselectActiveChild(): void`

说明：

（仅组中使用）重新选中一个可用的面板作为激活的面板。

### `activeSelf(): void`

说明：

激活自己作为父级激活的面板。

### `getContainerSize(): number`

说明：

获取网格宿主容器大小（像素）。

### `notifyRelayout(): void`

说明：

（仅组中使用）通知宿主容器强制重新布局。

### `relayoutAllWithNewPanel(panels: CodeLayoutPanelInternal[], referencePanel?: CodeLayoutPanelInternal): void`

说明：

（仅组中使用）当向组中添加了面板时，通知宿主容器强制重新布局。

参数：

| 名称 | 说明 |
| :----: | :----: |
| panels | 新添加的面板实例 |
| referencePanel | 预留参数，无需传递 |

### `relayoutAllWithRemovePanel(panel: CodeLayoutPanelInternal): void`

说明：

（仅组中使用）当向组中移除了面板时，通知宿主容器强制重新布局。一般情况不需要手动调用。

### `relayoutAllWithResizedSize(panel: CodeLayoutPanelInternal): void`

说明：

（仅组中使用）当宿主容器大小变化时通知其强制重新布局。一般情况不需要手动调用。

## CodeLayoutGridInternal

顶级网格组实例类定义。

### `collapse(open: boolean): void`

说明：

展开或折叠当前顶级网格。

参数：

| 名称 | 说明 |
| :----: | :----: |
| open | 是否是展开 |
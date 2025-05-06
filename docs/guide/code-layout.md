# CodeLayout使用方法

## 基础示例

推荐将 CodeLayout 置于顶级组件并设置宽高占满屏幕。

::: warning
本组件设计为占满父级容器，请为父级容器设置 `position: relative;` 样式以及一个确定的高度，否则组件将无法正确计算高度、无法正常显示。
:::

::: warning
此组件是为PC平台设计的。不适合移动设备。
:::

::: danger
此组件不支持SSR。
:::

要使用 CodeLayout ，有以下步骤：

1. 需要[导入组件](./install.md#全局导入组件).
2. 定义基础布局数据：基础布局数据控制了几个主要部分的大小、位置、是否显示等等状态。
3. 定义插槽与内容：在组件中，内容是以“面板”为单位来组织的，所以需要添加面板数据，然后在插槽中渲染。

例如，下方是一个最简单的示例：

```vue preview
<template>
  <CodeLayout 
    ref="codeLayout"
    :layout-config="config"
    style="height: 400px"
  >
    <template #panelRender="{ panel }">
      <!--
        每个面板都会调用此插槽来渲染，你可以根据 
        panel.name 来判断当前是那个面板，渲染对应内容 
      -->
      <span>Panel {{ panel.name }}, content</span>
    </template>
  </CodeLayout>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, nextTick, h } from 'vue';
import { type CodeLayoutConfig, type CodeLayoutInstance, defaultCodeLayoutConfig } from 'vue-code-layout';
import IconFile from '../../examples/assets/icons/IconFile.vue';
import IconSearch from '../../examples/assets/icons/IconSearch.vue';

//2. 定义布局的基础定义，这些数据控制了
//几个主要部分的大小、位置、是否显示等等状态
const config = reactive<CodeLayoutConfig>({
  ...defaultCodeLayoutConfig,
  primarySideBarSwitchWithActivityBar: true,
  primarySideBarPosition: 'left',
  primarySideBarWidth: 40,
  primarySideBarMinWidth: 170,
  activityBarPosition: 'side',
  secondarySideBarWidth: 20,
  secondarySideBarMinWidth: 170,
  bottomPanelHeight: 50,
  bottomPanelMinHeight: 40,
  panelAlignment: 'center',
  panelHeaderHeight: 24,
  panelMinHeight: 150,
  titleBar: true,
  titleBarShowCustomizeLayout: true,
  activityBar: true,
  primarySideBar: true,
  secondarySideBar: false,
  bottomPanel: true,
  statusBar: true,
  menuBar: true,
  bottomPanelMaximize: false
});

//定义实例
const codeLayout = ref<CodeLayoutInstance>();

/**
 * 3. 向组件中添加面板数据
 */
function loadLayout() {

  //向第一侧边栏添加两个组
  const groupExplorer = codeLayout.value.addGroup({
    title: 'Explorer',
    tooltip: 'Explorer',
    name: 'explorer',
    badge: '2',
    iconLarge: () => h(IconFile),
  }, 'primarySideBar');
  codeLayout.value.addGroup({
    title: 'Search',
    tooltip: 'Search',
    name: 'search',
    tabStyle: 'single',
    iconLarge: () => h(IconSearch),
  }, 'primarySideBar');

  //获取底栏实例网格
  const bottomGroup = codeLayout.value.getRootGrid('bottomPanel');

  //向第一侧边栏刚刚添加的组中再加入面板
  groupExplorer.addPanel({
    title: 'VUE-CODE-LAYOUT',
    tooltip: 'vue-code-layout',
    name: 'explorer.file',
    noHide: true,
    startOpen: true,
    iconSmall: () => h(IconSearch),
    actions: [
      { 
        name: 'test',
        icon: () => h(IconSearch),
        onClick() {},
      },
      { 
        name: 'test2',
        icon: () => h(IconFile),
        onClick() {},
      },
    ]
  });
  groupExplorer.addPanel({
    title: 'OUTLINE',
    tooltip: 'Outline',
    name: 'explorer.outline',
    iconSmall: () => h(IconSearch),
    actions: [
      { 
        name: 'test',
        icon: () => h(IconSearch),
        onClick() {},
      },
      { 
        name: 'test2',
        icon: () => h(IconFile),
        onClick() {},
      },
    ]
  });

  //向底栏加入面板
  bottomGroup.addPanel({
    title: 'PORTS',
    tooltip: 'Ports',
    name: 'bottom.ports',
    startOpen: true,
    iconSmall: () => h(IconSearch),
  });
  bottomGroup.addPanel({
    title: 'TERMINAL',
    tooltip: 'Terminal',
    name: 'bottom.terminal',
    actions: [
      { 
        name: 'test',
        icon: () => h(IconSearch),
        onClick() {},
      },
      { 
        name: 'test2',
        icon: () => h(IconFile),
        onClick() {},
      },
    ]
  });
}

onMounted(() => {
  nextTick(() => {
    loadLayout();
  });
});

</script>

```

::: tip
将组件用于 [Electron](https://www.electronjs.org/zh/docs/latest/) 窗口中是一个不错的选择。
:::

## 面板操作

定义：

* *组*：组是一个容器，它可以包含多个子面板
* *面板*：面板，内容是以“面板”为单位来组织的，面板是最终让你渲染内容的基本单元。用户对每个面板都可以进行拖动、显示/隐藏、打开/关闭操作。

以VSCode的Explorer这个区域为例，Explorer点击它，里面还有Folders、Outline、Timeline等等，
所以边上的Explorer是一个组，里面的Folders、Outline、Timeline是面板。

你可以向组件中添加你的面板，或者获取面板实例进行对应操作或者设置。

要操作 CodeLayout 组件，需要先获取它的实例，然后调用实例上的方法：

```ts
import { CodeLayoutInstance } from 'vue-code-layout';

//将 codeLayoutInstance 变量通过 ref 属性绑定到 CodeLayout 组件上
const codeLayoutInstance = ref<CodeLayoutInstance>();
```

### 获取根组

如[介绍](./useage.md)所述，组件分为三个大板块，组件提供了获取根组方法：

```ts
const primarySideBar = codeLayoutInstance.value.getRootGrid('primarySideBar'); //获取第一侧边栏组
const secondarySideBar = codeLayoutInstance.value.getRootGrid('secondarySideBar'); //获取第二侧边栏组
const bottomPanel = codeLayoutInstance.value.getRootGrid('bottomPanel'); //获取底栏组

```

### 添加组/面板

你可以向根中添加组，例如，下面的代码向第一侧边栏添加了一个标题是“Explorer”的组：

```ts
const groupExplorer = codeLayout.value.addGroup({
  title: 'Explorer',
  tooltip: 'Explorer',
  name: 'explorer',
  badge: '2',
  iconLarge: () => h(IconFile),
}, 'primarySideBar');

```

获取到组后，你可以在自定义组或者根组中添加面板：

```ts
groupExplorer.addPanel({
  title: 'VUE-CODE-LAYOUT',
  tooltip: 'vue-code-layout',
  name: 'explorer.file',
  noHide: true,
  startOpen: true,
  iconSmall: () => h(IconSearch),
  actions: [
    { 
      name: 'test',
      icon: () => h(IconSearch),
      onClick() {},
    },
    { 
      name: 'test2',
      icon: () => h(IconFile),
      onClick() {},
    },
  ]
});
bottomPanel.addPanel({
  title: 'TERMINAL',
  tooltip: 'Terminal',
  name: 'bottom.terminal',
  actions: [
    { 
      name: 'test',
      icon: () => h(IconSearch),
      onClick() {},
    },
    { 
      name: 'test2',
      icon: () => h(IconFile),
      onClick() {},
    },
  ]
});
```

提示：目前 CodeLayout 不支持组中再嵌套组（VSCode 中也没有嵌套组的功能），用户拖拽时不会产生嵌套的组，因此您在使用代码添加时不要嵌套组，在非根组组中再嵌套组将不会显示。

组最多只嵌套一级（仅根组下可产生组）。

### 获取面板

添加面板时 `name` 属性必须保证唯一，因此你可以使用name查询已添加的面板实例，并对其更改：

```ts
//获取面板并修改badge
const groupExplorer = codeLayout.value.getPanelByName('explorer')
groupExplorer.badge = '3';
```

### 面板显示、隐藏

通过实例上的 `visible` 属性可以控制面板的显示、隐藏。

```ts
groupExplorer.visible = false;
```

### 删除面板

```ts
groupExplorer.removeSelfWithShrink(); //删除自己，并触发父级组的自动收缩（自动收缩会合并空组）
```

## 标记、图标、标题、自定义操作

一个面板支持以下配置字段来控制一些信息的显示，它的显示位置如图所示：

竖向：
![CodeLayoutTitle1](../images/CodeLayoutTitle1.jpg)

横向：
![CodeLayoutTitle2](../images/CodeLayoutTitle2.jpg)

你可以在创建时指定这些属性，也可以在创建后通过实例属性修改。

```ts
const groupExplorer = codeLayout.value.addGroup({
  name: 'explorer',
  //标题文字
  title: 'Explorer',
  //鼠标悬浮时显示的工具提示
  tooltip: 'Explorer',
  //标记，推荐2个数字内
  badge: '2', 
  //大图标（一般在ActionBar中显示）
  iconLarge: () => h(IconFile), 
  //小图标（一般在面板头部显示）
  iconSmall: () => h(IconFile), 
  //自定义操作，自定义操作会在面板头部右侧以按钮形式显示
  actions: [
    { 
      name: 'test',
      icon: () => h(IconSearch),
      onClick() {},
    },
    { 
      name: 'test2',
      icon: () => h(IconFile),
      onClick() {},
    },
  ]
}, 'primarySideBar');
```

## 面板右键菜单 <Badge type="tip" text="^1.2.0" />

面板可以自定义用户右键点击时的菜单，通过 `CodeLayoutConfig.menuConfigs` 可以配置菜单。

* `builtinMenus` 用于控制内置菜单的显示，你可以设置为 `[]` 来隐藏所有内置菜单，或者是配置显示其中的一个或者多个。

|菜单名称|说明|
|---|---|
|toggleVisible|隐藏当前面板|
|toggleBadge|切换当前面板标记是否显示|
|otherPanelsCheck|其他面板显示/隐藏切换|
|panelPosition|主网格（侧边栏，面板）的显示位置控制|

* `customMenus` 用于自定义菜单，可设置回调，回调会传入当前面板的实例，你可以返回自定义菜单项目，显示自己的菜单，允许菜单插入指定位置（例如插入到内置菜单前面）。

```ts
const config = reactive<CodeLayoutConfig>({
  ...codeLayoutConfig,
  menuConfigs: {
    builtinMenus: [ 'toggleVisible', 'toggleBadge', 'otherPanelsCheck', 'panelPosition' ] ,
    customMenus: [
      {
        create: (panel, t, data) => {
          //在回调中返回自定义菜单。使用 vue3-context-menu 的菜单定义。
          return [
            { 
              label: `This is my menu '${panel.name}' custom item.`, 
              onClick: () => {
                console.log('menu clicked');
              }
            }
          ]
        },
        insertIndex: 0 //插入到内置菜单前面，不填写则默认插入到末尾
      }
    ]
  }
});
```

## 拖拽控制

### 面板拖拽控制

默认情况下所有面板都可以互相拖拽，可以从一个根组拖拽至另一个根组。

要对这个操作进行限制，你可以使用一下方法：

* 设置某个面板不可拖拽。

  ```ts
  bottomGroup.addPanel({
    title: 'PORTS',
    tooltip: 'Ports',
    name: 'bottom.ports',
    draggable: false, //禁止拖拽 // [!code ++]
  });
  ```

* 通过 `accept` 限制面板可以放置的根组，例如下方的面板过设置 accept 限制了面板仅可以放置在 底栏 根组。

  ```ts
  bottomGroup.addPanel({
    title: 'PORTS',
    tooltip: 'Ports',
    name: 'bottom.ports',
    startOpen: true,
    iconSmall: () => h(IconSearch),
    accept: [ 'bottomPanel' ], //限制 // [!code ++]
  });
  ```

* 通过自定义回调自由处理

    可以在基础配置中设置拖拽回调，在回调中返回false表示阻止拖拽。

    |参数名称|类型|说明|
    |-|-|-|
    |reference|CodeLayoutPanel|用户正在尝试放置位置的面板实例|
    |referencePosition|string|放置位置|
    |panel|CodeLayoutPanel|用户正在拖拽的面板实例|
    |dropTo|string|表示拖拽放置目标类型|

    ```ts
    const config = reactive<CodeLayoutConfig>({
      onDropToPanel(reference, referencePosition, panel, dropTo) {
        if (reference.name === 'explorer.file' && panel.name === 'explorer.outline') {
          return false;
        }
        return false
      },
    });
    ```

### 自定义数据拖拽控制

你可以处理拖拽到组件中的非面板数据，例如用户将一个文件拖拽进入组件的某些位置。

你可以在 `layoutConfig` 的 `onNonPanelDrag` 和 `onNonPanelDrop` 事件中处理，其中 ：

* `onNonPanelDrag` 为检查回调，用于判断是否允许用户拖拽，你可以在此回调中判断用户拖拽数据是否被允许，返回 false 将显示阻止用户拖拽状态。
* `onNonPanelDrop` 为放置回调，可以在其中中执行放置操作。同时会传入当前用户放置的面板实例和参考位置。

::: tip
组件不会阻止默认浏览器行为，例如将拖拽进入的文件打开，请在检查回调中调用 `e.preventDefault()` 来阻止浏览器的默认行为。
:::

```ts
const config = reactive<CodeLayoutConfig>({
  ...defaultCodeLayoutConfig,
  onNonPanelDrag(e, sourcePosition) {
    e.preventDefault();
    //如果用户拖拽进入的是文件，则允许
    if (e.dataTransfer?.items && e.dataTransfer.items.length > 0 && e.dataTransfer.items[0].kind == 'file')
      return true;
    return false;
  },
  onNonPanelDrop(e, sourcePosition, reference, referencePosition) {
    //处理放置事件
    console.log('用户拖拽文件', e.dataTransfer?.files[0].name, sourcePosition, reference, referencePosition);
  },
});
```

## 保存与加载数据

CodeLayout支持你保存用户拖拽后的布局至JSON数据中，在下一次进入后重新从JSON数据加载恢复原布局。

CodeLayout 支持 `canLoadLayout`、`canSaveLayout` 两个事件，事件回调中会返回当前组件实例，你可以在事件回调中执行加载与保存操作，也可以在其他时机通过调用组件实例上的 `loadLayout`, `saveLayout` 函数自由控制加载与保存操作。

```vue
<template>
  <CodeLayout 
    ref="codeLayout"
    :layout-config="config"
    style="height: 400px"
    @canLoadLayout="loadLayout"
    @canSaveLayout="saveLayout"
  />
</template>

<script lang="ts" setup>
const 

const codeLayout = ref<CodeLayoutInstance>();

//可以在事件回调中执行加载与保存操作，默认事件回调会在组件初始化与卸载时触发
//事件会传递组件实例 ref，可以直接调用，等同于 codeLayout.value
function loadLayout(ref: CodeLayoutInstance) {
  //在这里加载
}
function saveLayout(ref: CodeLayoutInstance) {
  //在这里保存
}

//也可以在其他自定时机通过调用组件实例方法来加载/保存数据
onMounted(() => {
  codeLayout.value.loadLayout();
})
</script>
```

### 保存数据

通过调用 saveLayout 方法保存布局数据。

同时你也应该保存基础布局数据（CodeLayoutConfig），这部分数据定义了每个基础组的大小，是否显示，基础布局设置等，
要保存这个数据，只需要在调用 saveLayout 函数后，将 config 变量保存即可。

```ts
import { toRaw, reactive } from 'vue';
import { type CodeLayoutConfig } from 'vue-code-layout';

const config = reactive<CodeLayoutConfig>({
  //...省略
});

const json = codeLayout.value.saveLayout();

localStorage.setItem('LayoutData', json);
localStorage.setItem('LayoutConfig', toRaw(config)); //保存布局
```

### 加载数据

基础布局数据只需要重新将保存的数据加载至变量中即可。

```ts
import { toRaw, reactive } from 'vue';
import { type CodeLayoutConfig } from 'vue-code-layout';

//加载基础布局数据至 config 变量中。
const config = reactive<CodeLayoutConfig>({
  //此处仅为示例，有多种方法可以填充数据，你可以用自己喜欢的方法
  ...JSON.parse(localStorage.getItem('LayoutConfig'))
});
```

布局数据仅保存每个布局的基础位置、大小等信息，并不包含无法序列化的信息（例如回调函数，图标），所以你还需要在 loadLayout 的回调，根据面板名称填充这些数据，以实例化面板。

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
      case 'search':
        panel.title = 'Search';
        panel.tooltip = 'Search';
        panel.iconLarge = () => h(IconSearch);
        break;
      case 'explorer.file':
        panel.title = 'VUE-CODE-LAYOUT';
        panel.tooltip = 'vue-code-layout';
        panel.actions = [
          { 
            name: 'test',
            icon: () => h(IconSearch),
            onClick() {},
          },
          { 
            name: 'test2',
            icon: () => h(IconFile),
            onClick() {},
          },
        ]
        panel.iconSmall = () => h(IconSearch);
        break; 
      case 'explorer.outline':
        panel.title = 'OUTLINE';
        panel.tooltip = 'Outline';
        panel.actions = [
          { 
            name: 'test',
            icon: () => h(IconSearch),
            onClick() {},
          },
          { 
            name: 'test2',
            icon: () => h(IconFile),
            onClick() {},
          },
        ]
        panel.iconSmall = () => h(IconSearch);
        break;
      case 'bottom.ports':
        panel.title = 'PORTS';
        panel.tooltip = 'Ports';
        panel.iconSmall = () => h(IconSearch);
        break;  
      case 'bottom.terminal':
        panel.title = 'TERMINAL';
        panel.tooltip = 'Terminal';
        panel.iconSmall = () => h(IconSearch);
        break;
    }
    return panel;
  });
} else {
  //No data, create new layout
  //...
}
```

## 内置主菜单

由于 CodeLayout 依赖菜单功能，所以菜单功能与CodeLayout集成，
如果你的应用需要主菜单，可以参考以下示例快速配置主菜单，也可以通过 titleBarMenu 插槽自己渲染菜单。

菜单基于 [vue3-context-menu](https://github.com/imengyu/vue3-context-menu) 组件实现，其中的配置请参考其[文档](https://docs.imengyu.top/vue3-context-menu-docs)。

```vue
<template>
  <CodeLayout 
    ref="codeLayout"
    :layoutConfig="config"
    :mainMenuConfig="menuData"
    style="height: 400px"
  >
    <template #titleBarIcon>
      <img :src="logo" width="20px" style="margin:0 10px 0 13px">
    </template>
  </CodeLayout>
</template>

<script lang="ts" setup>
import { reactive } from 'vue';
import type { MenuOptions } from '@imengyu/vue3-context-menu';
import logo from '../../examples/assets/images/logo.svg';

const config = reactive<CodeLayoutConfig>({
  primarySideBarSwitchWithActivityBar: true,
  primarySideBarPosition: 'left',
  primarySideBarWidth: 40,
  primarySideBarMinWidth: 170,
  activityBarPosition: 'side',
  secondarySideBarWidth: 20,
  secondarySideBarMinWidth: 170,
  bottomPanelHeight: 50,
  bottomPanelMinHeight: 10,
  panelAlignment: 'center',
  panelHeaderHeight: 24,
  panelMinHeight: 150,
  titleBar: true,
  titleBarShowCustomizeLayout: true,
  activityBar: true,
  primarySideBar: true,
  secondarySideBar: false,
  bottomPanel: true,
  statusBar: true,
  menuBar: true,
  bottomPanelMaximize: false
});
const menuData : MenuOptions = {
  x: 0,
  y: 0,
  items: [
    {
      label: "File",
      children: [
        { label: "New" },
        { label: "Open" },
        { 
          label: "Open recent",
          children: [
            { label: "File 1...." },
            { label: "File 2...." },
            { label: "File 3...." },
            { label: "File 4...." },
            { label: "File 5...." },
          ],
        },
        { label: "Save", divided: true },
        { label: "Save as..." },
        { label: "Close" },
        { label: "Exit" },
      ],
    },
    {
      label: "Edit",
      children: [
        { label: "Undo" },
        { label: "Redo" },
        { label: "Cut", divided: true },
        { label: "Copy" },
        { label: "Find", divided: true },
        { label: "Replace" },
      ],
    },
    {
      label: "View",
      children: [
        { label: "Zoom in" },
        { label: "Zoom out" },
        { label: "Reset zoom" },
        { label: "Full screent", divided: true },
        { label: "Find", divided: true },
        { label: "Replace" },
      ],
    },
    {
      label: "Help",
      children: [
        { label: "About" },
      ],
    },
  ],
  zIndex: 3,
  minWidth: 230,
};
</script>
```

## 其他部分自定义插槽

CodeLayout 还提供了一些插槽供您使用：

![CodeLayoutSlots](../images/CodeLayoutSlots.jpg)

* titleBarIcon 标题栏渲染图标位置
* titleBarMenu 标题栏渲染主菜单位置
* titleBarCenter 标题栏中心位置
* titleBarRight 标题栏右侧位置（VSCode这里放置关闭按钮）
* titleBarTop 标题栏上部空间
* titleBarBottom 标题栏底部，在中心区域之上的空间，可以放置自定义操作
* activityBarBottom 活动栏栏底部（VSCode这里放置设置按钮）
* centerArea 中心区域，这里可以放置SliptLayout或者其他编辑器核心组件
* statusBar 状态栏位置

## 组件卸载提示

提示：以下两种情况，Vue可能会将你的组件卸载重新创建：

* 用户拖拽一个面板至其他面板
* 在开发模式下，当你修改了代码后，HMR重载

这时Vue可能会将你的组件卸载重新创建，组件状态会丢失，所以你需要处理自己的组件，在卸载时保存相关状态。

::: tip
**提示：** 在开发模式下，当你修改了代码后，HMR重载可能会将 CodeLayout 也卸载，如果您仅在onMounted回调中插入面板，则这时是不会重新再触发的，所以组件内面板数据会丢失，要解决这个问题，可以把原来在onMounted回调中插入面板的逻辑移至 CodeLayout 的 canLoadLayout 事件回调中，即可重新创建数据。
:::

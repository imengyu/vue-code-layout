# CodeLayout usage

## Basic examples

It is recommended to place CodeLayout at the top-level component and set the width and height to fill the screen.

::: warning
This component is designed to fill the parent container. Please set `position: relative` style for the parent container and set a certain height, otherwise the component will not be able to calculate the height correctly and display properly.
:::

To use CodeLayout, there are the following steps:

1. [Import Component](./install.md#global-import-components).
2. Define basic layout data: Basic layout data controls the size, position, and display status of several main parts.
3. Define slots and content: In components, content is organized on a "panel" basis, so panel data needs to be added and rendered in the slots.

For example:

::: my-sandbox {template=vue3-ts}

```ts /src/main.ts
import { createApp } from 'vue'
import App from './App.vue'
import CodeLayout from 'vue-code-layout'
import 'vue-code-layout/lib/vue-code-layout.css'

createApp(App)
  .use(CodeLayout)
  .mount('#app')  
```

```vue /src/App.vue [active]
<template>
  <CodeLayout 
    ref="codeLayout"
    :layout-config="config"
    style="height: 100vh"
  >
    <template #panelRender="{ panel }">
      <!--
        Each panel will call this slot for rendering, and you can customize it based on
        panel.name is used to determine which panel is currently present and render the corresponding content
      -->
      <span>Panel {{ panel.name }}, content</span>
    </template>
  </CodeLayout>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, nextTick, h } from 'vue';
import IconFile from './IconFile.vue';
import IconSearch from './IconSearch.vue';
import { type CodeLayoutConfig, type CodeLayoutInstance, defaultCodeLayoutConfig } from 'vue-code-layout';

//2. Define the basic definition of layout
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
  bottomAlignment: 'center',
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

//Instance ref
const codeLayout = ref<CodeLayoutInstance>();

/**
 * 3. Add panel data to components
 */
function loadLayout() {

  //Add two groups to the primarySideBar
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

  //Get the bottomPanel instance
  const bottomGroup = codeLayout.value.getRootGrid('bottomPanel');

  //Add a panel to the group just added to the primarySideBar
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

  //Add panels to the bottom panel
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

```vue /src/IconFile.vue
<template>
  <svg
    class="icon"
    style="width: 1em;height: 1em;vertical-align: middle;fill: currentColor;overflow: hidden;" viewBox="0 0 1024 1024"
    version="1.1" xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M640 0L938.666667 298.666667V938.666667a85.333333 85.333333 0 0 1-85.333334 85.333333H170.666667a85.333333 85.333333 0 0 1-85.333334-85.333333V85.333333a85.333333 85.333333 0 0 1 85.333334-85.333333h469.333333zM597.333333 85.333333H170.666667v853.333334h682.666666V341.333333H597.333333V85.333333z m85.333334 341.333334H256v85.333333h426.666667V426.666667zM512 682.666667H256v85.333333h256V682.666667z"
    />
  </svg>
</template>
```

```vue /src/IconSearch.vue
<template>
  <svg
    class="icon"
    style="width: 1em;height: 1em;vertical-align: middle;fill: currentColor;overflow: hidden;" viewBox="0 0 1024 1024"
    version="1.1" xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M727.771429 669.257143c58.514286-69.485714 91.428571-160.914286 91.428571-259.657143C819.2 182.857143 636.342857 0 409.6 0S0 182.857143 0 409.6s182.857143 409.6 409.6 409.6c98.742857 0 190.171429-32.914286 259.657143-91.428571l296.228571 296.228571 58.514286-58.514286-296.228571-296.228571z m-318.171429 69.485714c-179.2 0-329.142857-146.285714-329.142857-329.142857s146.285714-329.142857 329.142857-329.142857 329.142857 146.285714 329.142857 329.142857-149.942857 329.142857-329.142857 329.142857z"
    />
  </svg>
</template>
```

:::

## Panel operation

Definition:

* *Group*: A group is a container that can contain multiple sub panels
* *Panel*: Panel, the content is organized in units of "panels", and the panel is the basic unit that ultimately allows you to render the content. Users can drag, show/hide, and open/close each panel.

Taking the Explorer section of VSCode as an example, clicks on Explorer, there are also folders, outline, timeline, and so on inside,

So the Explorer is a group, and the Folders, Outline, and Timeline are panels.

You can add your panels to the components, or obtain panel instances for corresponding operations or settings.

To using the CodeLayout component, you need to first obtain its instance, and then call the method on the instance:

```ts
import { CodeLayoutInstance } from 'vue-code-layout';

//Bind the codeLayoutInstance variable to the CodeLayout component through the ref attribute
const codeLayoutInstance = ref<CodeLayoutInstance>();
```

### Get Root Group

As [Introduce](./useage.md) said, The component is divided into four major sections, and the component provides a method to obtain the root group:

```ts
const primarySideBar = codeLayoutInstance.value.getRootGrid('primarySideBar'); 
const secondarySideBar = codeLayoutInstance.value.getRootGrid('secondarySideBar');
const bottomPanel = codeLayoutInstance.value.getRootGrid('bottomPanel');

```

### Add Group/Panel

You can add groups to the root, for example, the following code adds a group titled "Explorer" to the first sidebar:

```ts
const groupExplorer = codeLayout.value.addGroup({
  title: 'Explorer',
  tooltip: 'Explorer',
  name: 'explorer',
  badge: '2',
  iconLarge: () => h(IconFile),
}, 'primarySideBar');

```

After obtaining the group, you can add panels to the custom group or root group:

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

Tip: Currently, CodeLayout does not support nested groups within groups (VSCode also does not have nested group functionality). When users drag and drop, nested groups will not be generated. Therefore, when using code to add, do not nest groups as it may cause problems.

Groups can only be nested up to one level (groups can only be generated under the root group).

### Get panel instance

When adding a panel, the 'name' attribute must be guaranteed to be unique, so you can use name to query the added panel instances and change them:

```ts
//Get the panel and modify the badge
const groupExplorer = codeLayout.value.getPanelByName('explorer')
groupExplorer.badge = '3';
```

### Panel show, hide

The display and hiding of the panel can be controlled through the `visible` attribute on the instance.

```ts
groupExplorer.visible = false;
```

### Delete panel

```ts
groupExplorer.removeSelfWithShrink(); //Delete oneself and trigger automatic shrinkage of the parent group (automatic shrinkage will merge empty groups)
```

## Badge, Icon, Title, Actions

A panel supports the following configuration fields to control the display of some information, and its display position is shown in the figure:

Vertical:
![CodeLayoutTitle1](../../images/CodeLayoutTitle1.jpg)

Horizontal:
![CodeLayoutTitle2](../../images/CodeLayoutTitle2.jpg)

You can specify these properties during creation or modify them through instance properties after creation.

```ts
const groupExplorer = codeLayout.value.addGroup({
  name: 'explorer',
  //Title Text
  title: 'Explorer',
  //Tooltips displayed when hovering the mouse
  tooltip: 'Explorer',
  //Badge, recommended within 2 digits
  badge: '2', 
  //Large icons (usually displayed in ActionBar)
  iconLarge: () => h(IconFile), 
  //Small icons (usually displayed at the top of the panel)
  iconSmall: () => h(IconFile), 
  //Custom actions, which will be displayed as buttons on the right side of the panel header
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

## Drag control

By default, all panels can be dragged and dropped from one root group to another.
To restrict this operation, you can use the following methods:

* Set a panel to be non draggable.

  ```ts
  bottomGroup.addPanel({
    title: 'PORTS',
    tooltip: 'Ports',
    name: 'bottom.ports',
    draggable: false, //No dragging allowed
  });
  ```

1. By using `accept` to limit the root groups that panels can be placed in, for example, the panel below is set to accept, which limits the panel to only be placed in the bottom panel root group.

  ```ts
  bottomGroup.addPanel({
    title: 'PORTS',
    tooltip: 'Ports',
    name: 'bottom.ports',
    startOpen: true,
    iconSmall: () => h(IconSearch),
    accept: [ 'bottomPanel' ], //limit
  });
  ```

2. Processing through custom callbacks

    By customizing callbacks, drag callbacks can be set in the basic configuration, and returning false in the callback indicates that drag is blocked.

    |Name|Type|Explain|
    |-|-|-|
    |reference|CodeLayoutPanel|The panel instance that user attempts to place reference position|
    |referencePosition|string|Drop position|
    |panel|CodeLayoutPanel|The panel instance that the user is dragging|
    |dropTo|string|Drop target type|

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

## Saving and Loading Data

CodeLayout supports you to save the layout dragged by the user to JSON data, and then reload it from JSON data to restore the original layout after the next entry.

CodeLayout supports two events, `canLoadLayout` and `canSaveLayout`. In the event callback, the current component instance will be returned. You can perform load and save operations in the event callback, or at other times, you can freely control the load and save operations by calling the `loadLayout` and `saveLayout` functions on the component instance.

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
import { ref, onMounted } from 'vue';
import type { CodeLayoutInstance } from 'vue-code-layout';

const codeLayout = ref<CodeLayoutInstance>();

//Load and save operations can be performed in event callbacks, which are triggered by default during component initialization and uninstallation
//The event will pass the component instance ref, which can be directly called, equivalent to codeLayout.value
function loadLayout(ref: CodeLayoutInstance) {
  //Load here
}
function saveLayout(ref: CodeLayoutInstance) {
  //Save here
}

//You can also load/save data by calling component instance methods at other custom times
onMounted(() => {
  codeLayout.value.loadLayout();
})
</script>
```

### Save data

Save layout data by calling the `saveLayout` method.

At the same time, you should also save the basic layout data (CodeLayoutConfig), which defines the size of each basic group, whether to display it, basic layout settings, etc,
To save this data, simply call the `saveLayout` function and save the config variable.

```ts
import { toRaw, reactive } from 'vue';
import type { CodeLayoutConfig } from 'vue-code-layout';

const config = reactive<CodeLayoutConfig>({
  //...
});

const json = codeLayout.value.saveLayout();

localStorage.setItem('LayoutData', json);
localStorage.setItem('LayoutConfig', toRaw(config)); //Save basic layout data
```

### Load data

The basic layout data only needs to be reloaded into variables after saving.

```ts
import { toRaw, reactive } from 'vue';
import type { CodeLayoutConfig } from 'vue-code-layout';

//Load basic layout data
const config = reactive<CodeLayoutConfig>({
  //This is just an example. There are multiple methods to fill in the data, and you can use your preferred method
  ...JSON.parse(localStorage.getItem('LayoutConfig'))
});
```

Layout data only stores the basic position, size, and other information of each layout, and does not contain information that cannot be serialized (such as callback functions and icons). So you also need to fill in these data based on the panel name in the callback of loadLayout to instantiated the panel.

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

## Built-in main menu

Due to CodeLayout's dependence on menu functions, menu functions are integrated with CodeLayout,
If your application requires a main menu, you can refer to the following examples to quickly configure the main menu, or you can render the menu yourself through the titleBarMenu slot.

The menu is based on [vue3-context-menu](https://github.com/imengyu/vue3-context-menu), Please refer to its [documentation](https://docs.imengyu.top/vue3-context-menu-docs) for configuration.

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
import logo from '../../../examples/assets/images/logo.svg';

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
  bottomAlignment: 'center',
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

## Other slots

CodeLayout are also provided some solts for your use:

![CodeLayoutSlots](../../images/CodeLayoutSlots.jpg)

* titleBarIcon: Title bar rendering icon position
* titleBarMenu: Title bar rendering main menu position
* titleBarCenter: Title bar center position
* titleBarRight: Position on the right side of the title bar (VSCode places the close button here)
* titleBarTop: Area above the title bar
* titleBarBottom: The area at the bottom of the title bar, above the center area, where custom actions can be placed
* activityBarBottom: At the bottom of the activity bar (where VSCode places the settings button)
* centerArea: The central area of CenterArea, where SliptLayout or other editor core components can be placed
* statusBar: Status Bar Position

## TIP: Component unmont

Tip: Vue may unmont and recreate your components in the following two situations:

* Users drag and drop a panel to another panel
* In development mode, when you modify the code, HMR overloads

At this point, Vue may unmont and recreate your component, causing the component state to be lost. Therefore, you need to handle your own component and save the relevant state.

::: tip
**Tip:** In development mode, when you modify the code, HMR overloading may also unmount `CodeLayout`. If you only add panels in the `onMounted` callback, it will not be triggered again, so panel data within the component will be lost. To solve this problem, you can move the logic of add panels in the `onMounted` callback to the `canLoadLayout` event callback in `CodeLayout` to recreate the data.
:::

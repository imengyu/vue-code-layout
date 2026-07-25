# CodeLayout usage

## Basic examples

It is recommended to place CodeLayout at the top-level component and set the width and height to fill the screen.

::: warning
This component is designed to fill the parent container. Please set `position: relative` style for the parent container and set a certain height, otherwise the component will not be able to calculate the height correctly and display properly.
:::

::: warning
This component is desgined for PC platform. It is not suitable for mobile devices.
:::

::: danger
This component is not support SSR.
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
    :layout-data="layoutData"
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
//1. Import component
import { type CodeLayoutConfig, type CodeLayoutInstance, defaultCodeLayoutConfig, CodeLayoutRootGrid } from 'vue-code-layout';

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

//Instance ref
const codeLayout = ref<CodeLayoutInstance>();
//Define layout data
const layoutData = ref(new CodeLayoutRootGrid());

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

::: tip
Using this component in the [Electron](https://www.electronjs.org/) is a good choice.
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
import { type CodeLayoutInstance, CodeLayoutRootGrid } from 'vue-code-layout';

//Bind the codeLayoutInstance variable to the CodeLayout component through the ref attribute
const codeLayoutInstance = ref<CodeLayoutInstance>();
const layoutData = ref(new CodeLayoutRootGrid());
```

### Get Root Group

As [Introduce](./useage.md) said, The component is divided into four major sections, and the component provides a method to obtain the root group:

```ts
const primarySideBar = codeLayoutInstance.value.getRootGrid('primarySideBar'); 
const secondarySideBar = codeLayoutInstance.value.getRootGrid('secondarySideBar');
const bottomPanel = codeLayoutInstance.value.getRootGrid('bottomPanel');

```

Root layout data also provides these methods:

```ts
const primarySideBar = layoutData.value.primarySideBar;
const secondarySideBar = layoutData.value.secondarySideBar;
const bottomPanel = layoutData.value.bottomPanel;
```

### Add Group/Panel

You can add groups to the root, for example, the following code adds a group titled "Explorer" to the first sidebar:

```ts
//Add group to root with instance method
const groupExplorer = codeLayout.value.addGroup({
  title: 'Explorer',
  tooltip: 'Explorer',
  name: 'explorer',
  badge: '2',
  iconLarge: () => h(IconFile),
}, 'primarySideBar');

//Add group use grid method
const groupExplorer = primarySideBar.addGroup({
  title: 'Explorer',
  tooltip: 'Explorer',
  name: 'explorer',
  badge: '2',
  iconLarge: () => h(IconFile),
});
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

:::info
Tip: Currently, CodeLayout does not support nested groups within groups (VSCode also does not have nested group functionality). When users drag and drop, nested groups will not be generated. Therefore, when using code to add, do not nest groups as it may cause problems.

Groups can only be nested up to one level (groups can only be generated under the root group).
:::

### Get panel instance

When adding a panel, the `name` attribute must be guaranteed to be unique, so you can use name to query the panel instances and modify the attributes of them:

```ts
//Get the panel and modify the badge
const groupExplorer = layoutData.value.getPanelByName('explorer') //Method in layout data
const groupExplorer = codeLayout.value.getPanelByName('explorer') //Method in instance
groupExplorer.badge = '3';
```

### Panel show, hide

The display and hiding of the panel can be controlled through the `visible` attribute on the instance.

```ts
panel.visible = false;
panel.relayoutAfterToggleVisible();
```

::: tip
Note：When the panel visible state is changed, need to call `relayoutAfterToggleVisible` to relayout the group.
:::

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

## Panel Context menu <Badge type="tip" text="^1.2.0" />

The panel can customize the menu when the user right clicks, config with `CodeLayoutConfig.menuConfigs`.

* `builtinMenus` Used to control the display of built-in menus, you can set it to '[]' to hide all built-in menus, or configure the display of one or more of them.

|Name|Desc|
|---|---|
|toggleVisible|Hide the current panel|
|toggleBadge|Switch whether the current panel marker is displayed or not|
|otherPanelsCheck|Other panels display/hide switch|
|panelPosition|Control the display position of the main grid (sidebar, panel)|

* `customMenus` Used for customizing menus, callback can be set, and the callback will be passed to the instance of the current panel. You can return the custom menu item, display your own menu, it also allow the menu to be inserted in a specified position (such as in front of the built-in menu).

```ts
const config = reactive<CodeLayoutConfig>({
  ...codeLayoutConfig,
  menuConfigs: {
    builtinMenus: [ 'toggleVisible', 'toggleBadge', 'otherPanelsCheck', 'panelPosition' ] ,
    customMenus: [
      {
        create: (panel, t, data) => {
          //Return the custom menu items. Use the menu definition of vue3 context menu.
          return [
            { 
              label: `This is my menu '${panel.name}' custom item.`, 
              onClick: () => {
                console.log('menu clicked');
              }
            }
          ]
        },
        insertIndex: 0 //Insert in front of the built-in menu, if not set, it will be inserted at the end by default
      }
    ]
  }
});
```

## Drag control

### Panel drag control

By default, all panels can be dragged and dropped from one root group to another.
To restrict this operation, you can use the following methods:

* Set a panel to be non draggable.

  ```ts
  bottomGroup.addPanel({
    title: 'PORTS',
    tooltip: 'Ports',
    name: 'bottom.ports',
    draggable: false, //No dragging allowed // [!code ++]
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
    accept: [ 'bottomPanel' ], //limit // [!code ++]
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

### Custom data drag and drop control

You can handle non panel data dragged into components, such as users dragging a file into component.

You can handle it in the `onNonPanelDrag` and `onNonPanelDrop` events of `layoutConfig`, where:

* `onNonPanelDrag` is a check callback used to determine whether users are allowed to drop. You can check whether user dragging data is allowed in this callback. Returning false will display the status of preventing user dragging.
* `onNonPanelDrop` is a drop callback that can perform drop operations within it. At the same time, the panel instance and reference position placed by the current user will be passed in.

::: tip
The component will not prevent the default browser behavior. For example, to open a dragged file, please call `e.preventDefault()` in the check callback to prevent the default browser behavior.
:::

```ts
const config = reactive<CodeLayoutConfig>({
  ...defaultCodeLayoutConfig,
  onNonPanelDrag(e, sourcePosition) {
    e.preventDefault();
    //If the user drags in a file, it is allowed
    if (e.dataTransfer?.items && e.dataTransfer.items.length > 0 && e.dataTransfer.items[0].kind == 'file')
      return true;
    return false;
  },
  onNonPanelDrop(e, sourcePosition, reference, referencePosition) {
    //Handling drag events
    console.log('User drop', e.dataTransfer?.files[0].name, sourcePosition, reference, referencePosition);
  },
});
```

### Drag tip

When an embedded custom component needs to handle dragging, please call `e.stopPropagation()` in its own drag handling function to prevent the event from bubbling, otherwise the event will bubble into the CodeLayout component, making it unable to handle dragging.

```ts
function onDragOver(e: DragEvent) {
  e.preventDefault();
  e.stopPropagation();
}
```

## Save and Load Data

CodeLayout supports saving the layout after user drag operations as JSON data, and loading it from JSON data to restore the original layout when entering the application next time. Here's a complete example based on an actual project:

The project provides a `useLocalStorage` utility class that allows for easy implementation of automatic data saving and loading.

The `useLocalStorage` utility class automatically performs operations at the following times:

* **When the page loads**: Automatically loads data from local storage
* **Before page unload and when the component is unmounted**: Automatically saves data to local storage

This ensures that users' layout modifications are not lost when the page is refreshed or when they re-enter the application.

::: tip
Tip: Layout data does not store non-serializable objects, such as functions and icons, and for internationalization purposes, it also does not store `title` and `tooltip`. This information needs to be manually set from callbacks when loading.
:::

```vue
<template>
  <CodeLayout 
    ref="codeLayout"
    :layoutConfig="config"
    :layoutData="(layoutData as CodeLayoutRootGrid)"
    :mainMenuConfig="menuData"
  >
    <!-- Component content -->
  </CodeLayout>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue';
import { 
  CodeLayout, 
  type CodeLayoutConfig, 
  type CodeLayoutInstance, 
  defaultCodeLayoutConfig,
  CodeLayoutRootGrid,
  useLocalStorage,
} from 'vue-code-layout';
import { h } from 'vue';
import IconFile from '@/assets/icons/IconFile.vue';
import IconSearch from '@/assets/icons/IconSearch.vue';

const codeLayout = ref<CodeLayoutInstance>();
const layoutData = ref(new CodeLayoutRootGrid());

// Configuration information
const codeLayoutConfig: CodeLayoutConfig = {
  ...defaultCodeLayoutConfig,
  titleBar: true,
  activityBar: true,
  primarySideBar: true,
  // Other configuration items
};
const config = reactive<CodeLayoutConfig>({
  ...codeLayoutConfig,
  // Other reactive configurations
});

// Save layout configuration
const { clearData: clearConfigData } = useLocalStorage(
  'CodeLayoutDemoSaveConfig',
  null,
  // Callback when loading
  (dataObj) => {
    if (dataObj) {
      for (const key in dataObj) {
        (config as Record<string, any>)[key] = (dataObj as Record<string, any>)[key];
      }
    }
  },
  // Callback when saving
  () => {
    return config;
  }
);

// Save layout data
const { clearData: clearLayoutData } = useLocalStorage(
  'CodeLayoutDemoSaveData',
  null,
  // Callback when loading
  (data) => {
    if (data) {
      // Load layout data and refill panel properties that are not serialized
      layoutData.value.loadLayout(data, (panel) => {
        // Set different properties based on panel name
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
            panel.iconSmall = () => h(IconSearch);
            break;
          // Other panel configurations...
          default:
            panel.title = panel.name;
            panel.tooltip = `Panel ${panel.name}`;
            panel.iconLarge = () => h(IconSearch);
            panel.iconSmall = () => h(IconSearch);
            break;
        }
        return panel;
      });
    } else {
      // No saved data, create a new layout
      if (codeLayout.value) {
        // Create initial layout
        const groupExplorer = codeLayout.value.addGroup({
          title: 'Explorer',
          tooltip: 'Explorer',
          name: 'explorer',
          badge: '2',
          iconLarge: () => h(IconFile),
        }, 'primarySideBar');
        
        // Add other panels...
      }
    }
  },
  // Callback when saving
  () => {
    // Only save if there are contents in the layout
    return layoutData.value.children.length > 0 ? layoutData.value.saveLayout() /** Serialize to json */ : null;
  }
);

// Reset all layout data
function onResetAll() {
  layoutData.value.clearLayout();
  // useLocalStorage internally encapsulates that it will automatically call the load callback again after clearing
  clearConfigData();
  clearLayoutData();
}
</script>
```

## Built-in main menu

Due to CodeLayout's dependence on menu functions, menu functions are integrated with CodeLayout,
If your application requires a main menu, you can refer to the following examples to quickly configure the main menu, or you can render the menu yourself through the `titleBarMenu` slot.

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

## Other slots

CodeLayout are also provided some solts for your use:

![CodeLayoutSlots](../../images/CodeLayoutSlots.jpg)

* titleBarIcon: Title bar rendering icon position
* titleBarMenu: Title bar rendering main menu position
* titleBarCenter: Title bar center position
* titleBarRight: Position on the right side of the title bar (VSCode places the close button here)
* titleBarCustomizeLayout: Customize layout button position, can be used to place a custom layout button or config CodeLayoutCustomizeLayout component
* titleBarTop: Area above the title bar
* titleBarBottom: The area at the bottom of the title bar, above the center area, where custom actions can be placed

* activityBarTop Top of activity bar buttons
* activityBarEnd Bottom of activity bar buttons
* activityBarBottom At the bottom of the activity bar (where VSCode places the settings button)
  * activityBar If Secondary activity bar was set：
    * activityBarSecondaryTop
    * activityBarSecondaryEnd
    * activityBarSecondaryBottom

* tabHeaderLeftStart Panel Group in tab mode, left of buttons, params `{ group }`
* tabHeaderLeftEnd Panel Group in tab mode, right of buttons, params `{ group }`
* tabHeaderRightStart Panel Group in tab mode, extra actions start, params `{ group }`
* tabHeaderRightEnd Panel Group in tab mode, extra actions end, params `{ group }`

* titleBarTitle Panel Group title, params `{ group, title }`
* titleBarActionStart Panel Group extra actions start, params `{ group }`
* titleBarActionEnd Panel Group extra actions end, params `{ group }`

* centerArea: The central area of CenterArea, where SliptLayout or other editor core components can be placed

* statusBar: Status Bar Position
  * statusBarLeft Status Bar left
  * statusBarRight Status Bar right

* emptyGroup No panel in a group, params `{ group }`

## TIP: Component unmont

Tip: Vue may unmont and recreate your components in the following two situations:

* Users drag and drop a panel to another panel
* In development mode, when you modify the code, HMR overloads

At this point, Vue may unmont and recreate your component, causing the component state to be lost. Therefore, you need to handle your own component and save the relevant state.

::: tip
**Tip:** In development mode, when you modify the code, HMR overloading may also unmount `CodeLayout`. If you only add panels in the `onMounted` callback, it will not be triggered again, so panel data within the component will be lost. To solve this problem, you can move the logic of add panels in the `onMounted` callback to the `canLoadLayout` event callback in `CodeLayout` to recreate the data.
:::

# SplitLayout usage

## Basic examples

It is recommended to place `SplitLayout` in the top-level component or `CodeLayout`'s `centerArea` slot and set the width and height to fill the screen.

::: warning
This component is designed to fill the parent container. Please set `position: relative` style for the parent container and set a certain height, otherwise the component will not be able to calculate the height correctly and display properly.
:::

::: warning
This component is desgined for PC platform. It is not suitable for mobile devices.
:::

::: danger
This component is not support SSR.
:::

To use SplitLayout, there are the following steps:

1. [Import Components](./install.md#global-import-components).
2. Defining Slots and Content: In components, content is organized on a "panel" basis, so panel data needs to be added and then rendered in the slots.

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
  <div class="demo">
    <SplitLayout
      ref="splitLayoutRef"
      @canLoadLayout="loadLayout"
      @panelClose="onPanelClose"
    >
      <template #tabContentRender="{ panel }">
        <!--
          Each panel will call this slot for rendering, and you can customize it based on panel.name is used to determine which panel is currently present and render the corresponding content
          panel.data Can store custom data
        -->
        <h2 :style="{ backgroundColor: colors[panel.data] }">Grid {{ panel.name }}</h2>
      </template>
      <template #tabEmptyContentRender="{ grid }">
        <h2>
          Empty Grid {{ grid.name }}
          <br><button @click="onAddPanel(grid)">+ Add</button>
        </h2>
      </template>
      <template #tabHeaderExtraRender="{ grid }">
        <button @click="onAddPanel(grid)">+ Add</button>
      </template>
    </SplitLayout>
  </div>
</template>

<script lang="ts" setup>
import { ref, nextTick, h } from 'vue';
import type { CodeLayoutSplitNInstance, CodeLayoutSplitNPanelInternal, CodeLayoutSplitNGridInternal } from 'vue-code-layout';

const colors = [
  '#fb0',
  '#f00',
  '#090',
  '#02a',
  '#155',
  '#f0f',
  '#0a4',
  '#cc0',
  '#f80',
  '#f08',
  '#0a8',
  '#08f',
]

//Instance ref
const splitLayoutRef = ref<CodeLayoutSplitNInstance>();

let count = 0;

//Panel close callback
function onPanelClose(panel: CodeLayoutSplitNPanelInternal, resolve: () => void) {
  console.log('onPanelClose', panel.name);
  resolve();
}
//Add button
function onAddPanel(grid: CodeLayoutSplitNGridInternal) {
  count++;
  grid.addPanel({
    title: `Panel${count}`,
    tooltip: `Panel${count}`,
    name: `panel${count}`,
    data: count,
  });
}

//Add panel data to components
function loadLayout() {
  if (splitLayoutRef.value) {
    const grid = splitLayoutRef.value.getRootGrid();
    const grid1 = grid.addGrid({
      name: 'grid1',
      visible: true,
      size: 0,
    });
    const grid2 = grid.addGrid({
      name: 'grid2',
      visible: true,
      size: 0,
      minSize: 100,
    });
    const grid3 = grid1.addGrid({
      name: 'grid3',
      visible: true,
      size: 0,
      minSize: 0,
    });
    grid1.addGrid({
      name: 'grid4',
      visible: true,
      size: 0,
      minSize: 100,
      canMinClose: true,
    });

    for (let i = 0; i < 2; i++) {
      count++;
      grid3.addPanel({
        title: `Panel${count}`,
        tooltip: `Panel${count} tooltip`,
        name: `panel${count}`,
        closeType: 'close',
        data: count,
      });
    }
    for (let i = 0; i < 2; i++) {
      count++;
      grid2.addPanel({
        title: `Panel${count}`,
        tooltip: `Panel${count} tooltip`,
        name: `panel${count}`,
        closeType: 'close',
        data: count,
      });
    }
    grid.notifyRelayout();
  }
}

</script>


<style scoped>
h2 {
  height: 100%;
  text-align: center;
  line-height: 100px;
  margin: 0;
  color: var(--code-layout-color-text-light);
}
.demo {
  height: 400px;
  display: flex;
  flex-direction: row;
  color: var(--code-layout-color-text-light);
  background-color: var(--code-layout-color-background);
}
</style>

```

:::

## Panel operation

Definition:

* **Grid**：A grid is a container that can contain multiple panels, composed in Tab mode, but can only have one displayed panel at the same time; Alternatively, it can be a parent grid that contains sub grids divided in different directions. It has two layout directions, horizontal and vertical.
* **Panel**：Panel, the content is organized in units of "panels", and the panel is the basic unit that ultimately allows you to render the content. Users can drag and close each panel.

You can add your panels to the components, or obtain panel instances for corresponding operations.

To operate the SplitLayout component, you need to first obtain its instance, and then call the method on the instance:

```ts
import { CodeLayoutSplitNInstance } from 'vue-code-layout';

//Bind the splitLayoutRef variable to the SplitLayout component through the ref attribute
const splitLayoutRef = ref<CodeLayoutSplitNInstance>();
```

### Get Root Grid

The component provides a method to obtain the root grid:

```ts
const grid = splitLayoutRef.value.getRootGrid();
```

### Root Grid Direction

The default layout direction for the root grid is horizontal (layout direction is only used for sub grids, sub panels are displayed in Tab mode), You can also change it to vertical.

```ts
const grid = splitLayoutRef.value.getRootGrid();
grid.direction = 'vertical';
```

### Add Grid/Panel

You can add a grid to the root, for example, the following code adds a grid to the root:

```ts
const grid1 = grid.addGrid({
  name: 'grid1',
  visible: true,
  size: 0,
});
```

The default direction of the grid is perpendicular to the parent, for example, if the parent grid is horizontal, the added sub grid direction is vertical.

After obtaining the grid, you can add panels to the custom grid:

```ts
grid1.addPanel({
  title: `Panel title`,
  tooltip: `Panel Help`,
  name: `datahelp`,
  iconSmall: () => h(IconMarkdown),
});
```

Note: The 'name' attribute of the panel must be unique, but it is not required for the grid.

### Get panel

When adding a panel, the 'name' attribute must be unique, so you can use name to query the added panel instance:

```ts
//Add panels to obtain panels and modify badge
const file1 = splitLayoutRef.value.getPanelByName('file1')
file1.badge = '3';
```

### Close panel

User can close panel.

#### Close button

The panel supports the close button. When creating the panel, you can specify the close button or modify the properties after obtaining the instance:

```ts
const grid1 = grid.addGrid({
  name: 'grid1',
  visible: true,
  size: 0,
  closeType: 'close', //Display close button
});
```

```ts
//Obtain panels and modify closeType
const file1 = splitLayoutRef.value.getPanelByName('file1')
file1.closeType = 'unSave';
```

![Close](../../images/SplitLayoutTitleClose.jpg)

* unSave Display a dot to indicate that the current file has not been saved
* close Display a close button (x)
* none No close button (default)

#### Close processing

After setting the close button, when the user clicks the close button, the `panelClose` event will be triggered at the top level, where you can handle your own business logic,
Save the file, etc. You can perform the closing operation asynchronously, and then call resolve to delete the panel, or call reject to cancel the deletion of the panel.

```ts
//Close callback
function onPanelClose(panel: CodeLayoutPanelInternal, resolve: () => void, reject: (e: any) => void) {
  console.log('onPanelClose', panel.name);
  resolve();
}
```

#### Manual close

In the code, the `closePanel` `function on the panel instance can also be manually called to perform a close operation, which is consistent with the user's click to close.

```ts
const file1 = splitLayoutRef.value.getPanelByName('file1')
file1.closePanel();
```

### Prohibit automatic grid shrinkage

Users are allowed to drag and drop panels between grids. By default, when all panels in a grid are removed, the panel will automatically shrink (removing itself) to make space for other panels.

If you do not want the grids you manually added to be removed, you can specify that shrinking is not allowed when creating the panels, so that when the grid is empty, it will not be removed, and the tabEmptyContentRender slot will be called during rendering, where you can render custom content.

```ts
const grid1 = grid.addGrid({
  name: 'grid1',
  visible: true,
  size: 0,
  noAutoShink: true,
});
```

### Get user focused grid/panel

Sometimes you need to retrieve the currently activated grid/panel, for example, to save a file that the user is currently editing, you can use `getActiveGird` to retrieve the currently activated grid.

```ts
const grid = splitLayoutRef.value?.getActiveGird();
```

After obtaining the grid, you can access the `activePanel` on the instance to retrieve the currently activated panel. If you bind your own editor context on the panel, you can call it.

```ts
const panel = grid?.activePanel;
if (panel != null) {
  panel.data.save(); //Call the save method in the context of my editor
}
```

::: tip
You can listen to the `gridActive` event of SplitLayout to obtain the user's latest activated grid.
:::

### Custom data drag and drop control

You can handle non panel data dragged into components, such as users dragging a file into component.

You can handle it in the `onNonPanelDrag` and `onNonPanelDrop` events of `layoutConfig`, where:

* `onNonPanelDrag` is a check callback used to determine whether users are allowed to drop. You can check whether user dragging data is allowed in this callback. Returning false will display the status of preventing user dragging.
* `onNonPanelDrop` is a drop callback that can perform drop operations within it. At the same time, the panel instance and reference position placed by the current user will be passed in.

::: tip
The component will not prevent the default browser behavior. For example, to open a dragged file, please call `e.preventDefault()` in the check callback to prevent the default browser behavior.
:::

```ts
const config = reactive<CodeLayoutSplitNConfig>({
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

## Badge, Icon, Title, Actions

A panel supports the following configuration fields to control the display of some information, and its display position is shown in the figure:

![SplitLayoutTitle](../../images/SplitLayoutTitle.jpg)

You can specify these properties during creation or modify them through instance properties after creation.

```ts
grid2.addPanel({
  name: 'file1',
  //Tile text
  title: 'File name',
  //Tooltips displayed when hovering the mouse
  tooltip: 'File path',
  //badge, recommended within 2 digits
  badge: '2', 
  //Icon
  iconSmall: () => h(IconFile), 
  //Custom actions, which will be displayed as buttons on the right side of the header when the panel is activated
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

## Panel menu

You can define contextmenu of a Panel, use `panelContextMenu` event callback to display your menu.

```vue
<template>
  <SplitLayout
    ref="splitLayoutRef"
    @panelContextMenu="onPanelMenu"
  >
    <!--Other codes...-->
  </SplitLayout>
</template>

<script setup lang="ts">
//...Other codes

function onPanelMenu(panel: CodeLayoutPanelInternal, e: MouseEvent) {
  e.stopPropagation();
  e.preventDefault();
  //Here i use vue3-context-menu library to show menu, you can use other menu library
  ContextMenuGlobal.showContextMenu({
    x: e.x,
    y: e.y,
    items: [
      {
        label: "Menu of " + panel.name,
        onClick: () => {
          alert("You click a menu item");
        }
      },
    ],
  });
}
</script>
```

## Customize render Tab header

### Tab item

Split Layout supports custom rendering tab item, allowing you to customize rendering of a certain part or all parts.
You can use the `tabItemRender` slot to render tab entries, which allows for the entire overlay rendering.

If you only need to customize certain parts of the rendering, you can import the default tab component `SplitTabItem`, which supports the functionality of default tabs but also allows you to customize a certain part of them.

```vue
<template>
  <SplitLayout
    ref="splitLayoutRef"
  >
    <!--Other codes...-->

    <template #tabItemRender="{ index, panel, states }">
      <SplitTabItem 
        :panel="(panel as CodeLayoutSplitNPanelInternal)"
        :states="states"
      >
        <template #title>
          <span :style="{ color: colors[panel.data] }">{{ panel.title }}</span>
        </template>
        <template #icon>
          <MyIcon />
        </template>
        <template #badge>
          <span class="badge">99+</span>
        </template>
        <template #close>
          <MyCloseIcon />
        </template>
      </SplitTabItem>
    </template>
  </SplitLayout>
</template>

<script setup lang="ts">
import { SplitLayout, SplitTabItem } from 'vue-code-layout';
//...Other codes...
</script>
```

### Tab tail

You can use the `tabHeaderExtraRender` slot to render the tail area of a tab, for example, the example below adds a 'Add Panel' button at the end of the tab.

```vue
<template>
  <SplitLayout
    ref="splitLayoutRef"
  >
    <!--Other codes...-->
    <template #tabHeaderExtraRender="{ grid }">
      <button @click="onAddPanel(grid)">+ 添加面板</button>
    </template>
  </SplitLayout>
</template>
```

### Other slots of tab

* tabHeaderStartRender : Scroll region start of tab header
* tabHeaderEndRender : Scroll region end of tab header

## Saving and Loading Data

SplitLayout supports you to save user dragged layouts to JSON data, and then reload and restore the original layout from JSON data on the next entry.

SplitLayout supports two events, `canLoadLayout` and `canSaveLayout`. In the event callback, the current component instance will be returned. You can perform load and save operations in the event callback, or at other times, you can freely control the load and save operations by calling the `loadLayout` and `saveLayout` functions on the component instance.

```vue
<template>
  <SplitLayout 
    ref="splitLayout"
    style="height: 400px"
    @canLoadLayout="loadLayout"
    @canSaveLayout="saveLayout"
  />
</template>

<script lang="ts" setup>
const splitLayout = ref<CodeLayoutSplitNInstance>();

//Load and save operations can be performed in event callbacks, which are triggered by default during component initialization and uninstallation
//The event will pass the component instance ref, which can be directly called, equivalent to splitLayout.value
function loadLayout(ref: CodeLayoutSplitNInstance) {
  //Load here
}
function saveLayout(ref: CodeLayoutSplitNInstance) {
  //Save here
}

//You can also load/save data by calling component instance methods at other custom times
onMounted(() => {
  splitLayout.value.loadLayout();
})
</script>
```

### Save data

Save layout data by calling the `saveLayout` method.

```ts
const json = splitLayout.value.saveLayout();
localStorage.setItem('SplitLayoutData', json);
```

### Load data

Layout data only stores the basic position, size, and other information of each layout, and does not contain information that cannot be serialized (such as callback functions and icons). So you also need to fill in these data based on the panel name in the callback of loadLayout to instantiated the panel.

```ts
const data = localStorage.getItem('SplitLayoutData');
if (data) {
  //If load layout from data, need fill panel data
  splitLayout.value.loadLayout(JSON.parse(data), (panel) => {
    switch (panel.name) {
      case 'file1':
        panel.title = 'File 1';
        panel.tooltip = 'File 1 path';
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

## TIP: Component unmont

Tip: Vue may unmont and recreate your components in the following two situations:

* Users drag and drop a panel to another panel
* In development mode, when you modify the code, HMR overloads

At this point, Vue may unmont and recreate your component, causing the component state to be lost. Therefore, you need to handle your own component and save the relevant state.

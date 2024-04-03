
# vue-code-layout

A Vue editor layout component that like VSCode and can be used to develop web editors.

![screenshot](https://raw.githubusercontent.com/imengyu/vue-code-layout/master/screenshot/first.jpg)

---

English | [中文](./README.CN.md)

## Features

* Simple and easy to use, small size
* Support adding panels
* Support drag and drop panel
* Support customize panel icons, text, rendering, etc
* Supports VSCode outer layout and inner editor area layout
* Support saving and loading data
* Support defining CSS styles

### Install

```
npm install -save vue-code-layout
```

Import in main.ts:

```js
import 'vue-code-layout/lib/vue-code-layout.css'
import VueCodeLayout from 'vue-code-layout'

createApp(App)
  .use(VueCodeLayout)  

```

For detailed usage, please refer to the documentation.

## Documentation

[Documentation](https://imengyu.top/pages/vue-code-layout-docs/)

[Demo](https://imengyu.top/pages/vue-code-layout-demo/)

## Develop

```shell
git clone git@github.com:imengyu/vue-code-layout.git
cd vue-code-layout
npm install
npm run dev        # Development serve project
npm run build-demo # Build example project
npm run build-lib  # Build library project
```

## Problem

Open source projects require everyone's support to get better and better.

If you encounter any problems, you can submit an issue and I will do my best to solve it for you.

If you have any good modifications, welecome submit a PR!

## AD: Author's other project

* [vue3-context-menu](https://github.com/imengyu/vue3-context-menu)
* [vue-dock-layout](https://github.com/imengyu/vue-dock-layout)
* [vue-dynamic-form A data driven form component for vue3](https://github.com/imengyu/vue-dynamic-form)

## License

[MIT](./LICENSE)

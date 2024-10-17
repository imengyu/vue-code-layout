---
title: 自定义样式
order: 5
---

# 自定义样式

如果你觉得默认样式不好看，想修改掉它，还可以覆盖默认css样式，所有的css样式定义都在[源代码/Base.scss](https://github.com/imengyu/vue-code-layout/blob/master/library/Scss/Base.scss) 中。你可以将所有样式复制出来，按需修改，存放在你的文件中。然后在导入的地方覆盖默认样式：

```js
import 'vue-code-layout/lib/vue-code-layout.css'
import '你的样式scss文件路径.scss'
```

## css变量

组件的样式抽离了一些css变量供您使用，你可以很方便的修改颜色，无须每个状态都特殊指定。

```scss
//公用颜色与大小变量 
:root {
  --code-layout-color-background: #1e1e1e; //背景颜色
  --code-layout-color-background-second: #252526;
  --code-layout-color-background-light: #333333;
  --code-layout-color-background-highlight: #04395e;
  --code-layout-color-background-hover: #363737;
  --code-layout-color-background-hover-light: #464646;
  --code-layout-color-background-mask-light: rgba(255,255,255,0.2);
  --code-layout-color-highlight: #0078d4; //高亮颜色
  --code-layout-color-text: #ccc; //文字颜色
  --code-layout-color-text-light: #fff;
  --code-layout-color-text-highlight: #2f94f1;
  --code-layout-color-text-gray: #818181;
  --code-layout-color-text-disabled: #727272;
  --code-layout-color-border: #474747; //边框颜色
  --code-layout-color-border-light: #cccccc;
  --code-layout-color-border-background: #2a2a2a;
  --code-layout-color-border-white: #fff;
  --code-layout-color-shadow: rgba(0,0,0,0.15); //阴影颜色
  --code-layout-color-scrollbar-thumb: rgba(204, 204, 204, 0.4); //滚动条颜色
  --code-layout-color-scrollbar-thumb-light: rgba(204, 204, 204, 0.6);
  --code-layout-border-size: 1px; //边框大小
  --code-layout-border-size-larger: 2px;
  --code-layout-border-size-dragger: 4px;
  --code-layout-sash-size: 8px; //合并拖拽条大小
  --code-layout-border-radius-small: 5px; //圆角大小
  --code-layout-border-radius-large: 5px;
  --code-layout-header-height: 22px; //CodeLayout面板标题大小
  --code-layout-titlebar-background: #3c3c3c; //CodeLayout标题栏背景颜色
  --code-layout-titlebar-height: 35px; //CodeLayout标题栏插槽大小
  --code-layout-status-height: 20px; //CodeLayout状态栏颜色
  --code-layout-font-size: 13px; //CodeLayou基础字体大小
  --code-layout-font-size-small: 11px;
}

//SplitLayout Tab组件特殊变量
.code-layout-split-tab {
  --tab-height: 35px; //TAB组件高度
  --tab-font-size: 12px; //TAB组件字体大小
  --tab-icon-size: 14px; //TAB组件图标大小
  --tab-text-color: var(--code-layout-color-text); //TAB组件文字与背景颜色，默认继承于CodeLayout以保证风格统一
  --tab-active-text-color: var(--code-layout-color-text-light);
  --tab-mormal-color: var(--code-layout-color-background-light);
  --tab-active-color: var(--code-layout-color-background);
  --tab-border-color: var(--code-layout-color-background-second);
  --tab-button-normal-color: transparent;
  --tab-button-hover-color: var(--code-layout-color-background-hover-light);
  --tab-close-size: 18px;  //TAB组件关闭按钮的大小
}
```

## 自定义字体

你可以通过 css 自定义设置字体：

```scss
//设置所有组件的字体
.code-layout-root {
  font-family: 'Times New Roman', Times, serif;
}
```

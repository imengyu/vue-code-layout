# Custom style

If you think the default style doesn't look good and want to modify it, you can also overwrite the default CSS style. All CSS style definitions are in the [Base.scss](https://github.com/imengyu/vue-code-layout/blob/master/library/Scss/Base.scss). You can copy all styles, modify them as needed, and store them in your file. Then overwrite the default style at the import location:

```js
import 'vue-code-layout/lib/vue-code-layout.css'
import 'Your style scss file path.scss'
```

## CSS variables

The style of the component has extracted some CSS variables for you to use, making it easy for you to modify colors without having to specify each state specifically.

```scss
//Common color and size variables 
:root {
  --code-layout-color-background: #1e1e1e; //background color
  --code-layout-color-background-second: #252526;
  --code-layout-color-background-light: #333333;
  --code-layout-color-background-highlight: #04395e;
  --code-layout-color-background-hover: #363737;
  --code-layout-color-background-hover-light: #464646;
  --code-layout-color-background-mask-light: rgba(255,255,255,0.2);
  --code-layout-color-highlight: #0078d4; //highlight color 
  --code-layout-color-text: #ccc; //text color
  --code-layout-color-text-light: #fff;
  --code-layout-color-text-highlight: #2f94f1;
  --code-layout-color-text-gray: #818181;
  --code-layout-color-text-disabled: #727272;
  --code-layout-color-border: #474747; //border color
  --code-layout-color-border-light: #cccccc;
  --code-layout-color-border-background: #2a2a2a;
  --code-layout-color-border-white: #fff;
  --code-layout-color-shadow: rgba(0,0,0,0.15); //shadow size
  --code-layout-color-scrollbar-thumb: rgba(204, 204, 204, 0.4); //scrollbar color
  --code-layout-color-scrollbar-thumb-light: rgba(204, 204, 204, 0.6);
  --code-layout-border-size: 1px; //border size
  --code-layout-border-size-larger: 2px;
  --code-layout-border-size-dragger: 4px;
  --code-layout-sash-size: 8px; //xy merge drag bar size
  --code-layout-border-radius-small: 5px; //border radius
  --code-layout-border-radius-large: 5px;
  --code-layout-header-height: 22px; //CodeLayout panel title size
  --code-layout-titlebar-background: #3c3c3c; //CodeLayout Title Bar Background Color
  --code-layout-titlebar-height: 35px; //CodeLayout Title height
  --code-layout-status-height: 20px; //CodeLayout status height
  --code-layout-font-size: 13px; //CodeLayou font size
  --code-layout-font-size-small: 11px;
}

//SplitLayout Tab Component specific variables
.code-layout-split-tab {
  --tab-height: 35px; //Base Height
  --tab-font-size: 12px; //Font size
  --tab-icon-size: 14px; //Icon size
  --tab-text-color: var(--code-layout-color-text); //TAB component text and background color, inherited by default from CodeLayout to ensure consistent style
  --tab-active-text-color: var(--code-layout-color-text-light);
  --tab-mormal-color: var(--code-layout-color-background-light);
  --tab-active-color: var(--code-layout-color-background);
  --tab-border-color: var(--code-layout-color-background-second);
  --tab-button-normal-color: transparent;
  --tab-button-hover-color: var(--code-layout-color-background-hover-light);
  --tab-close-size: 18px;  //The size of the TAB component close button
}
```

## Custom font

You can customize the font through CSS:

```scss
//Set the font for all components
.code-layout-root {
  font-family: 'Times New Roman', Times, serif;
}
```

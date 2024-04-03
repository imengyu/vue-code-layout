---
title: Introduce
order: 2
---

# Introduce

Tip: This component is not a wrapper of the original VScode component, but a re implemented component in Vue, so its functionality may differ from the original VScode.

## CodeLayout

CodeLayout is a layout component similar to the VScode, It can be used to build the interface of your editor.

It consists of four major areas:

* primarySideBar: The primary sideBar, usually displayed on the left, places the most important content.
* secondarySideBar: Secondary sideBar, usually displayed on the right side.
* bottomPanel: Bottom Panel area.
* centerArea: The central area, usually displaying the editor area, is exposed through a slot where the SplitLayout component can be embedded to make editor layout.

The content of primarySideBar, secondarySideBar, and bottomPanel can be customized through slots and data, and all content can be dragged and placed between them.

In addition, the title bar area and status bar area are implemented together in the component, which can be customized through slots.

The default layout position is shown in the figure:

![CodeLayoutBase](../../images/CodeLayoutBase.jpg)

CodeLayout also comes with a custom layout feature similar to VScode. By default, clicking the control button in the upper right corner of the title bar will bring up this pop-up window.

CodeLayout also supports saving layout data and restoring it in the next load.

[👉 CodeLayout usage](./code-layout.md)

## SplitLayout

SplitLayout is designed for split layouts in multiple editors, supporting infinite levels of panel nesting and splitting. It is typically used in file editors when multiple files need to be opened and edited simultaneously.

![SplitLayout](../../images/SplitLayout.jpg)

[👉 SplitLayout usage](./split-layout.md)

## CodeLayoutScrollbar

![CodeLayoutScrollbarDemo](../../images/CodeLayoutScrollbarDemo.gif)

CodeLayoutScrollbar is a Vue scrollbar component. If you feel that the system scrollbar does not match CodeLayout, you can try using CodeLayoutScrollbar, which has a unified style built-in.

[👉 CodeLayoutScrollbar reference](../api/CodeLayoutScrollbar.md)

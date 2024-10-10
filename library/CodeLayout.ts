import { reactive, type VNode } from "vue";
import { LateClass } from "./Composeable/LateClass";
import type { CodeLayoutLangDefine } from "./Language";
import '@imengyu/vue3-context-menu/lib/vue3-context-menu.css'

/**
 * Layout Type Definition
 * 
 * Default data can be copied when creating objects:
 * ```ts
  import { defaultCodeLayoutConfig } from 'vue-code-layout';

  const config = reactive<CodeLayoutConfig>({
    ...defaultCodeLayoutConfig,
    primarySideBarWidth: 40,
  });
  ```
 */
export interface CodeLayoutConfig {
  /**
   * Control whether to switch the display of the primarySideBar when clicking on the selected item in the activity bar
   */
  primarySideBarSwitchWithActivityBar: boolean,
  /**
   * The position of the primarySideBar
   */
  primarySideBarPosition: 'left'|'right',
  /**
   * The size of the primarySideBar (0-100, percentage)
   */
  primarySideBarWidth: number,
  /**
   * The minimum size of the primarySideBar in pixels
   */
  primarySideBarMinWidth: number,
  /**
   * The size of the secondarySideBar (0-100, percentage)
   */
  secondarySideBarWidth: number,
  /**
   * The minimum size of the secondarySideBar in pixels
   */
  secondarySideBarMinWidth: number,
  /**
   * The size of the bottomPanel (0-100, percentage)
   */
  bottomPanelHeight: number,
  /**
   * The minimum size of the bottomPanel in pixels
   */
  bottomPanelMinHeight: number,
  /**
   * The layout position of the bottomPanel
   * * left: At the bottom left
   * * center: At the bottom center
   * * right: At the bottom right
   * * justify: At the bottom center and justify
   * * left-side: Center left
   * * right-side: Center right
   */
  bottomAlignment: 'left'|'center'|'right'|'justify'|'left-side'|'right-side',
  /**
   * The position of the activityBar
   * * side: Main left
   * * top: In primarySideBar top
   * * hidden: No activityBar
   */
  activityBarPosition: 'side'|'top'|'hidden',
  /**
   * The height of the panel title in pixels
   */
  panelHeaderHeight: number,
  /**
   * The minimum height (in pixels) for all panels
   */
  panelMinHeight: number,
  /**
   * Show title bar?
   */
  titleBar: boolean,
  /**
   * Display Customize layout pop-up at the top of the title bar?
   */
  titleBarShowCustomizeLayout: boolean,
  /**
   * Show activity bar?
   */
  activityBar: boolean,
  /**
   * Show primarySideBar?
   */
  primarySideBar: boolean,
  /**
   * Show secondarySideBar?
   */
  secondarySideBar: boolean,
  /**
   * Make secondary panel control as activity bar?
   */
  secondarySideBarAsActivityBar: boolean,
   /**
   * The position of the secondary panel's activityBar when `secondarySideBarAsActivityBar` is true.
   * * side: Main left
   * * top: In primarySideBar top
   * * hidden: No activityBar
   */
  secondaryActivityBarPosition: 'side'|'top'|'hidden',
  /**
   * Show bottomPanel?
   */
  bottomPanel: boolean,
  /**
   * Can the bottomPanel be maximized?
   */
  bottomPanelMaximize: boolean,
  /**
   * Show statusBar?
   */
  statusBar: boolean,
  /**
   * Show menuBar?
   */
  menuBar: boolean,

  //Events

  /**
   * When the user clicks the reset button in the custom layout pop-up, this callback is triggered
   */
  onResetDefault?: () => void;
  /**
   * When the user starts dragging the panel, this callback is triggered, which can return false to prevent the user from dragging
   */
  onStartDrag?: (panel: CodeLayoutPanelInternal) => boolean;
  /**
   * Trigger this callback when the user completes dragging the panel
   */
  onEndDrag?: (panel: CodeLayoutPanelInternal) => void;
  /**
   * When the user drags a panel to a root group, this callback is triggered, which can return false to prevent the user from dragging
   */
  onDropToGrid?: (panel: CodeLayoutPanelInternal, grid: CodeLayoutGrid) => boolean;
  /**
   * When the user drags a panel to another panel, this callback is triggered, which can return false to prevent the user from dragging
   */
  onDropToPanel?: (
    reference: CodeLayoutPanelInternal,
    referencePosition: CodeLayoutDragDropReferencePosition, 
    panel: CodeLayoutPanelInternal, 
    dropTo: 'normal'|'empty'|'tab-header'|'activiy-bar'
  ) => boolean;
  /**
   * When the user drags a panel to a group, this callback is triggered to customize and modify the panel data that will eventually be added to the group
   */
  onGridFirstDrop?: (grid: CodeLayoutGrid, panel: CodeLayoutPanelInternal) => CodeLayoutPanelInternal; 
  /**
   * When a non shrinking TAB group is set to attempt to shrink, this callback will be triggered
   */
  onNoAutoShinkTabGroup?: (group: CodeLayoutPanelInternal) => void,
  /**
   * This callback is triggered when a regular group that is set to not shrink attempts to shrink
   */
  onNoAutoShinkNormalGroup?: (group: CodeLayoutPanelInternal) => void,
}
/**
 * Language Layout Definition
 */
export interface CodeLayoutLangConfig {
  /**
   * Language of component
   */
  lang: string,
  /**
   * Override some strings of current language.
   * 
   * * The complete list can be viewed in source code Language/en.ts
   */
  stringsOverride?: Partial<CodeLayoutLangDefine>,
}

/**
 * Default CodeLayoutConfig
 */
export const defaultCodeLayoutConfig : CodeLayoutConfig = {
  primarySideBarSwitchWithActivityBar: true,
  primarySideBarPosition: "left",
  primarySideBarWidth: 20,
  primarySideBarMinWidth: 170,
  activityBarPosition: "side",
  secondarySideBarWidth: 20,
  secondarySideBarMinWidth: 170,
  secondarySideBarAsActivityBar: false,
  secondaryActivityBarPosition: 'side',
  bottomPanelHeight: 30,
  bottomPanelMinHeight: 40,
  bottomPanelMaximize: false,
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
}

//用户接口定义

export type CodeLayoutGrid = 'primarySideBar'|'secondarySideBar'|'bottomPanel'|'centerArea'|'centerArea1'|'centerArea2'|'rootGrid'|'none';

export type CodeLayoutPanelCloseType = 'unSave'|'close'|'none';

/**
 * Instance of CodeLayout.
 * 
 * Can use like this:
 * ```
 * const codeLayout = ref<CodeLayoutInstance>(); 
 * codeLayout.value.addGroup(...);
 * ```
 */
export interface CodeLayoutInstance {
  /**
   * Get panel instance by name.
   * @param name The panel name.
   * @returns Found panel instance, if this panel is not found in the component, return undefined
   */
  getPanelByName(name: string): CodeLayoutPanelInternal | undefined,
  /**
   * Add top level group to layout.
   * @param panel Group define.
   * @param target Target grid.
   * @returns Group instance.
   */
  addGroup: (panel: CodeLayoutPanel, target: CodeLayoutGrid) => CodeLayoutPanelInternal;
  /**
   * Remove top level group from layout.
   * @param panel Group instance.
   */
  removeGroup(panel: CodeLayoutPanelInternal): void;
  /**
   * Get the internal root grid instance.
   * @param target Grid name.
   * @returns Top level grid instance
   */
  getRootGrid(target: CodeLayoutGrid): CodeLayoutGridInternal,
  /**
   * Force relayout all group.
   * @returns 
   */
  relayoutAll: () => void;
  /**
   * Force relayout a group.
   * @param name Group name.
   */
  relayoutGroup(name: string): void;
  /**
   * Save the layout dragged by the user to the JSON data, and after the next entry, call 'loadLayout' to reload and restore the original layout from the JSON data.
   * 
   * Note: Some basic layout data (CodeLayoutConfig) needs to be save after called this function.
   */
  saveLayout(): any;
  /**
   * Clear all panels.
   */
  clearLayout(): void;
  /**
   * Load the previous layout from JSON data, will clear all panels,
   * instantiatePanelCallback will sequentially call all panels, where you can process panel data.
   * @param json json data from `saveLayout`.
   * @param instantiatePanelCallback process layout data panel.
   */
  loadLayout(json: any, instantiatePanelCallback: (data: CodeLayoutPanel) => CodeLayoutPanel): void;
}

//内部类定义

export interface CodeLayoutPanelHosterContext {
  panelInstances: Map<string, CodeLayoutPanelInternal>;
  childGridActiveChildChanged(panel: CodeLayoutPanelInternal): void,
  removePanelInternal(panel: CodeLayoutPanelInternal): undefined|CodeLayoutPanelInternal;
  closePanelInternal(panel: CodeLayoutPanelInternal): void;
}

export class CodeLayoutPanelInternal extends LateClass implements CodeLayoutPanel {

  public constructor(context: CodeLayoutPanelHosterContext) {
    super();
    this.context = context;
  }

  context: CodeLayoutPanelHosterContext;
  /**
   * Title of this panel.
   * 
   * * Display in header.
   */
  title = '';
  /**
   * Name of this panel.
   * 
   * Don't change this value after panel added to layout.
   * 
   * You can obtain an instance of a panel using this name in the `CodeLayout.getPanelByName` instance method. 
   * 
   * * This name needs to be unique in a CodeLayout/SplitLayout.
   */
  name = '';
  /**
   * Open state of this panel.
   * 
   * * Only used in CodeLayout. 
   * In SplitLayout, all panels are always in open state.
   */
  open = false;
  /**
   * Set user can resize this panel.
   * 
   * * Only used in CodeLayout.
   */
  resizeable = true;
  /**
   * Show panel?
   * 
   * * Only used in CodeLayout.
   * 
   * After changed, need call `relayoutAfterToggleVisible` to apply.
   */
  visible = true;
  showBadge = true;
  /**
   * Size of this panel.
   * 
   * * In CodeLayout, it's pixel size.
   * * In SplitLayout, it's percentage size.
   */
  size = 0;
  /**
   * Child panel of this grid.
   */
  children : CodeLayoutPanelInternal[] = [];
  /**
   * Active child of this grid.
   * 
   * * Use in Tab
   */
  activePanel: CodeLayoutPanelInternal|null = null;
  /**
   * Parent grid instance of this panel.
   */
  parentGroup: CodeLayoutPanelInternal|null = null;
  /**
   * Parent toplevel grid name of this panel.
   */
  parentGrid: CodeLayoutGrid = 'none';
 
  tooltip?: string;
  badge?: string|(() => VNode)|undefined;
  accept?: CodeLayoutGrid[];
  draggable = true;
  preDropCheck?: (
    dropPanel: CodeLayoutPanel, 
    targetGrid: CodeLayoutGrid,
    referencePanel?: CodeLayoutPanel|undefined,
    referencePosition?: CodeLayoutDragDropReferencePosition|undefined,
  ) => boolean;
  tabStyle?: CodeLayoutPanelTabStyle;
  noAutoShink = false;
  noHide = false;
  minSize?: number|undefined;
  startOpen?: boolean|undefined;
  iconLarge?: string|(() => VNode)|undefined;
  iconSmall?: string|(() => VNode)|undefined;
  closeType: CodeLayoutPanelCloseType = 'none';
  actions?: CodeLayoutActionButton[]|undefined;
  data?: any = undefined;

  //Public

  /**
   * Add child panel to this grid.
   * @param panel Child panel
   * @param startOpen Is the sub panel in an open state
   * @returns Child panel instance
   */
  addPanel(panel: CodeLayoutPanel, startOpen = false, index?: number) {
    const panelInternal = panel as CodeLayoutPanelInternal;
    
    if (panelInternal.parentGroup)
      throw new Error(`Panel ${panel.name} already added to ${panelInternal.parentGroup.name} !`);
    if (this.context.panelInstances.has(panelInternal.name))
      throw new Error(`A panel named ${panel.name} already exists`);
  
    const panelResult = reactive(new CodeLayoutPanelInternal(this.context));
    Object.assign(panelResult, panel);
    panelResult.children = [];
    panelResult.open = panel.startOpen ?? false;
    panelResult.size = panel.size ?? 0;
    panelResult.accept = panel.accept ?? this.accept;
    panelResult.parentGrid = this.parentGrid;
    this.addChild(panelResult as CodeLayoutPanelInternal, index);
  
    if (startOpen || panel.startOpen)
      panelResult.openPanel();
  
    this.context.panelInstances.set(panelInternal.name, panelResult as CodeLayoutPanelInternal);
  
    return panelResult;
  }
  /**
   * Remove panel from this group.
   * @param panel Panel instance.
   * @param shrink Automatically shrink? Default true
   */
  removePanel(panel: CodeLayoutPanelInternal, shrink = true) {
    if (panel.parentGroup !== this)
      throw new Error(`Panel ${panel.name} is not child of this group !`);
    if (shrink)
      this.context.removePanelInternal(panel);
    else
      this.removeChild(panel);
    this.context.panelInstances.delete(panel.name);
    return panel;
  }
  /**
   * Open this panel.
   * @param closeOthers When opening oneself, do you also close other panels at the same level, Default: false
   */
  openPanel(closeOthers = false) {
    if (this.parentGroup) {
      const group = this.parentGroup;
      group.activePanel = this;
      if (closeOthers)
        group.children.forEach(p => p.open = false);
      this.open = true;
    } else {
      throw new Error(`Panel ${this.name} has not in any container, can not active it.`);
    } 
  }
  /**
   * Close this panel.
   */
  closePanel() {
    if (this.parentGroup) {
      const group = this.parentGroup;
      this.parentGroup.reselectActiveChild();
      group.open = false;
    } else {
      throw new Error(`Panel ${this.name} has not in any container, can not active it.`);
    } 
  }
  /**
   * Toggle open state of this panel.
   * @returns Return new open state
   */
  togglePanel() {
    if (this.parentGroup) {
      const group = this.parentGroup;
      this.parentGroup.activePanel = this;
      group.open = !group.open;
      return group.open;
    } else {
      throw new Error(`Panel ${this.name} has not in any container, can not active it.`);
    } 
  }

  /**
   * Remove the current panel/grid from its parent.
   * @returns 
   */
  removeSelf() {
    return this.parentGroup?.removePanel(this, false);
  }
  /**
   * Remove the current panel/grid from its parent and 
   * trigger automatic shrink operations.
   * @returns 
   */
  removeSelfWithShrink() {
    return this.parentGroup?.removePanel(this, true);
  }
  /**
   * Set activePanel.
   * @param child The panel to be activated
   */
  setActiveChild(child: CodeLayoutPanelInternal|null) {
    this.activePanel = child;
  }
  /**
   * Auto select a visible panel as activePanel.
   */
  reselectActiveChild() {
    this.activePanel = this.children.find((p) => p.visible) || null;
  }
  /**
   * Set parent activePanel to self.
   */
  activeSelf() {
    if (this.parentGroup) {
      this.parentGroup.setActiveChild(this);
      this.parentGroup.activeSelf();
    }
  }
  /**
   * Get is this panel actived in parent (Tab)
   */
  isSelfActived() {
    if (this.parentGroup)
      return this.parentGroup.activePanel == this;
    return false;
  }
  /**
   * Check panel is children.
   */
  isChildren(panel: CodeLayoutPanelInternal) {
    return this.children.includes(panel);
  }
  /**
   * Get grid hoster container size (pixel).
   * @returns 
   */
  getContainerSize() {
    return this.lastRelayoutSize;
  }
  /**
   * Notify hoster container force relayout.
   */
  notifyRelayout() {
    this.pushLateAction('notifyRelayout');
  }
  /**
   * Notify hoster container there has new grids was added and needs to relayout.
   * 
   * * This method is called internally, and generally you do not need to use this method.
   * @param panels New panels
   * @param referencePanel Drop grid.
   */
  relayoutAllWithNewPanel(panels: CodeLayoutPanelInternal[], referencePanel?: CodeLayoutPanelInternal) {
    this.pushLateAction('relayoutAllWithNewPanel', panels, referencePanel);
  }
  /**
   * Notify hoster container there has grids was visible changed and needs to relayout.
   * @param panel Changed panel.
   */
  relayoutAfterToggleVisible(panel?: CodeLayoutPanelInternal) {
    if (!panel)
      panel = this;
    const parent = panel.getParent();
    if (!parent)
      return;
    if (panel.visible) {
      if (parent instanceof CodeLayoutPanelInternal)
        parent.relayoutAllWithNewPanel([ panel ]);
      parent.setActiveChild(panel);
    } else {
      if (parent instanceof CodeLayoutPanelInternal)
        parent.relayoutAllWithRemovePanel(panel);
      parent.reselectActiveChild();
    }
  }
  /**
   * Notify hoster container there has grids was removed and needs to relayout.
   * 
   * * This method is called internally, and generally you do not need to use this method.
   * @param panel Removed panel.
   */
  relayoutAllWithRemovePanel(panel: CodeLayoutPanelInternal) {
    this.pushLateAction('relayoutAllWithRemovePanel', panel);
  }
  /**
   * Notify hoster container to relayout when container size changed.
   * 
   * * This method is called internally, and generally you do not need to use this method.
   * @param resizedContainerSize 
   */
  relayoutAllWithResizedSize(resizedContainerSize: number) {
    this.pushLateAction('relayoutAllWithResizedSize', resizedContainerSize);
  }

  //Internal
  //These methods is called internally, and you do not need to use them.

  addChild(child: CodeLayoutPanelInternal, index?: number) {
    if (!(child instanceof CodeLayoutPanelInternal))
      throw new Error('Try add bad panel data');
    if (this.name === child.name)
      throw new Error('Try add self');
    if (typeof index === 'number')
      this.children.splice(index, 0, child);
    else
      this.children.push(child);
    child.parentGroup = this;
    child.parentGrid = this.parentGrid;
    if (!this.activePanel)
      this.activePanel = child;
  }
  addChilds(childs: CodeLayoutPanelInternal[], startIndex?: number) {
    for (const child of childs) {
      if (!(child instanceof CodeLayoutPanelInternal))
        throw new Error('Try add bad panel data');
    }
    if (typeof startIndex === 'number')
      this.children.splice(startIndex, 0, ...childs);
    else
      this.children.push(...childs);
    for (const child of childs) {
      if (this.name === child.name)
        throw new Error('Try add self');
      child.parentGroup = this;
      child.parentGrid = this.parentGrid;
    }
    if (!this.activePanel)
      this.activePanel = this.children[0];
  }
  removeChild(child: CodeLayoutPanelInternal) {
    this.children.splice(this.children.indexOf(child), 1);
    child.parentGroup = null;
    //如果被删除面板是激活面板，则选另外一个面板激活
    if (child.name === this.activePanel?.name)
      this.reselectActiveChild();
  }
  replaceChild(oldChild: CodeLayoutPanelInternal, child: CodeLayoutPanelInternal) {
    this.children.splice(
      this.children.indexOf(oldChild), 
      1, 
      child);   
    oldChild.parentGroup = null;
    //如果被删除面板是激活面板，则选另外一个面板激活
    if (this.activePanel?.name === oldChild.name)
      this.activePanel = child;
    child.parentGroup = this;
    child.parentGrid = this.parentGrid;
  }
  hasChild(child: CodeLayoutPanelInternal) {
    return this.children.includes(child);
  }

  lastRelayoutSize = 0;
  lastLayoutSizeCounter = 0;

  getIsTabContainer() {
    return this.tabStyle === 'text' || this.tabStyle === 'icon';
  }
  getIsTopGroup() {
    return !this.parentGroup
  }
  getIsInTab() {
    return this.parentGroup?.getIsTabContainer() ?? false;
  }
  getParent() : CodeLayoutPanelInternal|null {
    return this.parentGroup;
  }
  getIndexInParent() {
    if (this.parentGroup)
      return this.parentGroup.children.indexOf(this) ?? 0;
    return this.getParent()?.children.indexOf(this) ?? 0;
  }
  getLastChildOrSelf() {
    return this.children.length > 0 ? 
      this.children[this.children.length - 1] 
      : this;
  }
  getFlatternChildOrSelf() {
    return this.children.length > 0 ? this.children : [ this ];
  }

  toJson() : any {
    return {
      name: this.name,
      open: this.open,
      resizeable: this.resizeable,
      visible: this.visible,
      showBadge: this.showBadge,
      size: this.size,
      children: this.children.map(p => p.toJson()),
    }
  }
  loadFromJson(json: any)  {
    this.name = json.name;
    this.open = json.open;
    this.resizeable = json.resizeable;
    this.visible = json.visible;
    this.showBadge = json.showBadge;
    this.size = json.size;
  }
}

/**
 * Definition of top-level grid group instance class.
 */
export class CodeLayoutGridInternal extends CodeLayoutPanelInternal {

  public constructor(
    name: CodeLayoutGrid,
    tabStyle: CodeLayoutPanelTabStyle,
    context: CodeLayoutPanelHosterContext,
    onSwitchCollapse: (open: boolean) => void,
    onActiveSelf: () => void,
  ) {
    super(context);
    this.name = name;
    this.tabStyle = tabStyle;
    this.parentGrid = name;
    this.onActiveSelf = onActiveSelf;
    this.onSwitchCollapse = onSwitchCollapse;
  }

  private onSwitchCollapse?: (open: boolean) => void;
  private onActiveSelf?: () => void;

  activeSelf() {
    if (!this.open)
      this.collapse(true);
    this.onActiveSelf?.();
  }

  /**
   * Open or collapse the current top-level grid.
   * @param open Is open?
   */
  collapse(open: boolean) {
    this.onSwitchCollapse?.(open);
  }
}

export type CodeLayoutPanelTabStyle = 'none'|'single'|'text'|'icon'|'hidden';

/**
 * Panel User Type Definition
 */
export interface CodeLayoutPanel {
  /**
   * Title of this panel.
   * 
   * * Display in header.
   */
  title: string;
  /**
   * Tooltip of this panel.
   */
  tooltip?: string;
  /**
   * Name of this panel.
   * 
   * You can obtain an instance of a panel using this name in the `CodeLayout.getPanelByName` instance method. 
   * 
   * * This name needs to be unique in a CodeLayout/SplitLayout.
   */
  name: string;
  /**
   * Badge of this panel.
   */
  badge?: string|(() => VNode)|undefined;
  /**
   * Show panel?
   * 
   * * Only used in CodeLayout.
   */
  visible?: boolean;
  /**
   * Show badge?
   */
  showBadge?: boolean;
  /**
   * Is this panel draggable?
   * 
   * Default is true.
   */
  draggable?: boolean; 

  /**
   * Set which grids the current panel can be dragged and dropped onto.
   */
  accept?: CodeLayoutGrid[];
  /**
   * Custom check callback before this panel drop.
   * @param dropPanel The panel being prepared for drop.
   * @param targetGrid Target grid.
   * @param referencePanel Drop reference panel.
   * @param referencePosition Place position relative to the reference panel.
   * @returns Return true to allow user drop, false to reject.
   */
  preDropCheck?: (
    dropPanel: CodeLayoutPanel, 
    targetGrid: CodeLayoutGrid,
    referencePanel?: CodeLayoutPanel|undefined,
    referencePosition?: CodeLayoutDragDropReferencePosition|undefined,
  ) => boolean;

  /**
   * Set tab style of this grid.
   * 
   * * Only used in CodeLayout.
   * 
   * Tab style:
   * * none: No tab control.
   * * single: Used internal.
   * * text: Tab control and header only show text.
   * * icon: Tab control and header only show icon.
   * * hidden: Has tab control but tab header was hidden.
   * 
   * Default: 'none'
   */
  tabStyle?: CodeLayoutPanelTabStyle;
  /**
   * Set whether the current grid triggers its own remove/merge 
   * operation after all subpanels/grids are removed.
   * 
   * Set to true will keep grid display, even if it does not have child panels/grids.
   * 
   * Default: false
   */
  noAutoShink?: boolean;
  /**
   * Set whether users cannot hide this panel.
   * 
   * * Only used in CodeLayout.
   * 
   * Default: false
   */
  noHide?: boolean;
  /**
   * Size of this panel.
   * 
   * * In CodeLayout, it's pixel size.
   * * In SplitLayout, it's percentage size.
   */
  size?: number|undefined;
  /**
   * Min size of this gird/panel. (In pixel)
   */
  minSize?: number|undefined;
  /**
   * Is the sub panel in an open state when added to a grid.
   * 
   * * Only used in CodeLayout.
   */
  startOpen?: boolean|undefined;
  /**
   * Icon of this panel (Large, render in ActionBar).
   */
  iconLarge?: string|(() => VNode)|undefined;
  /**
   * Icon of this panel (Small, render in TabBar, Header).
   */
  iconSmall?: string|(() => VNode)|undefined;
  /**
   * Set close button type of this panel.
   * 
   * * Only used in SplitLayout.
   * 
   * Type:
   * * unSave: A dot remind users that file are not save (⚪).
   * * close: Normal close button (X).
   * * none: No close button.
   * 
   * Default: 'none'
   */
  closeType?: CodeLayoutPanelCloseType|undefined;
  /**
  * Custom user actions.
  * 
  * * Only used in CodeLayout.
  */
  actions?: CodeLayoutActionButton[]|undefined;
  /**
   * Custom data attached to the current panel.
   */
  data?: any;
}
/**
 * Panel Action button Type Definition
 */
export interface CodeLayoutActionButton {
  name?: string,
  /**
   * Render this action button by yourself.
   */
  render?: (() => VNode)|undefined,
  /**
   * Render icon of this action button.
   */
  icon?: string|(() => VNode),
  /**
   * Text of this action button.
   */
  text?: string,
  /**
   * Tooltip of this action button.
   */
  tooltip?: string,
  /**
   * Tooltip direction.
   */
  tooltipDirection?: 'left'|'top'|'right'|'bottom',
  /**
   * Click callback
   * @returns 
   */
  onClick?: () => void,
}

//运行时类型定义
export type CodeLayoutDragDropReferencePosition = ''|'up'|'down'|'left'|'right'|'center'|'';

export interface CodeLayoutContext {
  dragDropToGrid: (grid: CodeLayoutGrid, panel: CodeLayoutPanelInternal) => void,
  dragDropToPanelNear: (
    reference: CodeLayoutPanelInternal, 
    referencePosition: CodeLayoutDragDropReferencePosition, 
    panel: CodeLayoutPanelInternal, 
    dropTo: 'normal'|'empty'|'tab-header'|'activiy-bar',
  ) => void,
  relayoutTopGridProp: (grid: CodeLayoutGrid, visible: boolean) => void,
  instance: CodeLayoutInstance;
}

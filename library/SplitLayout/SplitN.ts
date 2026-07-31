import { nextTick, reactive, type Ref, type VNode } from "vue";
import { LateClass } from "../Composeable/LateClass";
import { FLAG_SPLIT_LAYOUT } from "../Composeable/DragDrop";
import { assert, requireNotNull } from "../Utils/Assert";

/**
 * SplitLayout 的数据结构是完全独立的一套，不继承、不 import CodeLayout 的数据结构。
 *
 * 下面这几个纯类型别名与 CodeLayout 侧（CodeLayout.ts 中的 CodeLayoutGrid、
 * CodeLayoutDragDropReferencePosition 等）是**刻意镜像**的：结构保持逐字一致，
 * 这样两边的面板数据在用户代码里互相传递时仍然编译通过。
 *
 * 代价是改动其中一侧时需要人工同步另一侧。修改此处请同步检查 CodeLayout.ts。
 */

/**
 * Top level grid name definition of SplitLayout.
 */
export type CodeLayoutSplitNGridName = 'primarySideBar'|'secondarySideBar'|'bottomPanel'|'centerArea'|'rootGrid'|'none'|
  //Some center area grid.
  'centerArea1'|'centerArea2'|'centerArea3'|'centerArea4'|'centerArea5'|'centerArea6';

/**
 * Drop source postition definition of SplitLayout.
 */
export type CodeLayoutSplitNDragDropReferencePosition = ''|'up'|'down'|'left'|'right'|'center';

/**
 * Drop source area definition of SplitLayout.
 */
export type CodeLayoutSplitNDragDropReferenceAreaType = 'normal'|'empty'|'tab-header'|'tab-content'|'activiy-bar';

/**
 * Tab style definition of SplitLayout.
 *
 * * In SplitLayout only `hidden` is meaningful: tab header will be hidden.
 */
export type CodeLayoutSplitNTabStyle = 'none'|'single'|'text'|'text-bottom'|'icon'|'icon-bottom'|'hidden';

/**
 * Close button type definition of SplitLayout panel.
 *
 * * unSave: A dot remind users that file are not save (⚪).
 * * close: Normal close button (X).
 * * none: No close button.
 */
export type CodeLayoutSplitNPanelCloseType = 'unSave'|'close'|'none';

export type CodeLayoutSplitCopyDirection = 'left'|'top'|'bottom'|'right';

/**
 * Action button type definition of SplitLayout.
 */
export interface CodeLayoutSplitNActionButton {
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
   */
  onClick?: () => void,
}

/**
 * Host component (SplitLayout) callbacks that data model needs.
 */
export interface CodeLayoutSplitNRootRefDefine {
  /**
   * Get the root layout component instance.
   * @returns CodeLayoutSplitNInstance
   */
  getRef(): any;
  childGridActiveChildChanged(grid: CodeLayoutSplitNGridInternal): void;
  removePanelInternal(panel: CodeLayoutSplitNPanelInternal): undefined|CodeLayoutSplitNPanelInternal;
  closePanelInternal(panel: CodeLayoutSplitNPanelInternal): void;
}

/**
 * Root reference of a SplitLayout tree.
 *
 * Holds the link to host component and the panel name registry.
 */
export class CodeLayoutSplitNRootRef {
  private _rootGrid: CodeLayoutSplitNRootRefDefine|undefined;
  private panelInstances = new Map<string, CodeLayoutSplitNPanelInternal>();

  constructor(rootGrid?: CodeLayoutSplitNRootRefDefine|undefined) {
    this._rootGrid = rootGrid;
  }
  setRoot(rootGrid: CodeLayoutSplitNRootRefDefine|null) {
    this._rootGrid = rootGrid ?? undefined;
  }
  /**
   * Get the root layout component instance.
   */
  getRoot() {
    return requireNotNull(this._rootGrid);
  }
  /**
   * Get panel instance by name.
   * @param name The panel name.
   * @returns Found panel instance, if this panel is not found in the component, return undefined
   */
  getPanelByName(name: string): CodeLayoutSplitNPanelInternal | undefined {
    return this.panelInstances.get(name);
  }
  forEachPanelInstanceRef(callback: (panel: CodeLayoutSplitNPanelInternal) => void) {
    this.panelInstances.forEach(callback);
  }
  addPanelInstanceRef(panel: CodeLayoutSplitNPanelInternal) {
    this.panelInstances.set(panel.name, panel);
  }
  deletePanelInstanceRef(panelName: string) {
    this.panelInstances.delete(panelName);
  }
  existsPanelInstanceRef(panelName: string) {
    return this.panelInstances.has(panelName);
  }
  clearPanelInstanceRef() {
    this.panelInstances.clear();
  }
}

/**
 * Common user type definition shared by SplitLayout grid and panel.
 */
export interface CodeLayoutSplitNNodeCommon {
  /**
   * Name of this grid/panel.
   *
   * * This name needs to be unique in a SplitLayout.
   */
  name: string;
  /**
   * Tooltip of this panel.
   */
  tooltip?: string;
  /**
   * Badge of this panel.
   */
  badge?: string|(() => VNode)|undefined;
  /**
   * Is this panel draggable?
   *
   * Default is true.
   */
  draggable?: boolean;
  /**
   * When self is parent grid, Set which panel can be dropped into.
   *
   * Default is inherit from parent grid.
   */
  accept?: CodeLayoutSplitNGridName[];
  /**
   * Custom check callback before this panel drop.
   * @param dropPanel The panel being prepared for drop.
   * @param targetGrid Target grid.
   * @param referencePanel Drop reference panel.
   * @param referencePosition Place position relative to the reference panel.
   * @returns Return true to allow user drop, false to reject.
   */
  preDropCheck?: (
    dropPanel: any,
    targetGrid: CodeLayoutSplitNGridName,
    referencePanel?: any,
    referencePosition?: CodeLayoutSplitNDragDropReferencePosition|undefined,
  ) => boolean;
  /**
   * Resize callback for this grid/panel.
   * @param size New size
   */
  onResize?: (this: CodeLayoutSplitNPanelInternal, size: number) => void;
  /**
   * Visible change callback for this grid/panel.
   * @param visible New visible state.
   */
  onVisibleChange?: (this: CodeLayoutSplitNPanelInternal, visible: boolean) => void;
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
   * Size of this grid/panel. (percentage size)
   */
  size?: number|undefined;
  /**
   * Min size of this gird/panel. (In pixel)
   *
   * * If is a array, means x and y minium size.
   * * 0 means no limit.
   *
   * Default: 0
   */
  minSize?: number|number[]|undefined;
  /**
   * Icon of this panel (Large).
   */
  iconLarge?: string|(() => VNode)|undefined;
  /**
   * Icon of this panel (Small, render in TabBar, Header).
   */
  iconSmall?: string|(() => VNode)|undefined;
  /**
   * Set close button type of this panel.
   *
   * Default: 'none'
   */
  closeType?: CodeLayoutSplitNPanelCloseType|undefined;
  /**
   * Custom user actions.
   */
  actions?: CodeLayoutSplitNActionButton[]|undefined;
  /**
   * Should this grid/panel inherit `parentGrid` field from parent ?
   * @default true
   */
  inhertParentGrid?: boolean;
  /**
   * Custom data attached to the current grid/panel.
   */
  data?: any;
}

/**
 * Grid user type definition of SplitLayout.
 */
export interface CodeLayoutSplitNGrid extends CodeLayoutSplitNNodeCommon {
  /**
   * Show this grid?
   */
  visible?: boolean;
  /**
   * Show badge?
   */
  showBadge?: boolean;
  /**
   * Set tab style of this grid.
   *
   * * hidden: Tab header was hidden.
   */
  tabStyle?: CodeLayoutSplitNTabStyle;
  /**
   * Set whether users can close the current panel by continuously shrinking it.
   *
   * Default: false
   */
  canMinClose?: boolean;
  /**
   * Set whether this grid can be stretched when the container is resized.
   *
   * Default: true
   */
  stretchable?: boolean;
  /**
   * Size of this panel. (percentage size)
   */
  size: number;

  /**
   * Callback when canMinClose is set to true, and this panel visible was changed by user dragging.
   */
  onMinCloseChanged?: (grid: CodeLayoutSplitNGrid, visible: boolean) => void;
  /**
   * Callback when user actived this grid.
   */
  onActive?: (grid: CodeLayoutSplitNGrid) => void;
  /**
   * Callback when user changed activePanel.
   */
  onActivePanelChanged?: (grid: CodeLayoutSplitNGrid, panel: CodeLayoutSplitNPanel) => void;
}
/**
 * Panel user type definition of SplitLayout.
 */
export interface CodeLayoutSplitNPanel extends CodeLayoutSplitNNodeCommon {
  /**
   * Title of this panel.
   *
   * * Display in header.
   */
  title: string;
  /**
   * Callback when user actived this panel.
   */
  onActive?: (grid: CodeLayoutSplitNPanel) => void;
  /**
   * Callback when user closed this panel.
   */
  onClose?: (grid: CodeLayoutSplitNPanel) => void;
}

/**
 * Base node (grid/panel) type definition of SplitLayout.
 *
 * This is the independent counterpart of CodeLayout's panel base class,
 * it holds only what SplitLayout actually needs.
 */
export class CodeLayoutSplitNNodeInternal extends LateClass {

  private _size = 0;
  private _visible = true;
  _root : CodeLayoutSplitNRootRef|null = null;

  /**
   * Get the root instance.
   */
  get root() {
    return requireNotNull(this._root, 'This panel is not added to any layout!');
  }
  /**
   * Title of this panel.
   *
   * * Display in header.
   */
  title = '';
  /**
   * Name of this grid/panel.
   *
   * Don't change this value after it added to layout.
   *
   * * This name needs to be unique in a SplitLayout.
   */
  name = '';
  /**
   * Open state of this grid/panel.
   *
   * * In SplitLayout all panels are always in open state. This field is kept
   *   because it takes part in layout json (toJson/loadFromJson).
   */
  open = false;
  /**
   * Show this grid/panel?
   *
   * After changed, need call `relayoutAfterToggleVisible` to apply.
   */
  get visible() {
    return this._visible;
  }
  set visible(value: boolean) {
    if (value === this._visible)
      return;
    this._visible = value;
    this.onVisibleChange?.call(this as unknown as CodeLayoutSplitNPanelInternal, this.visible);
  }
  /**
   * Size of this grid/panel. (percentage size)
   */
  get size() {
    return this._size;
  }
  set size(value: number) {
    if (value === this._size)
      return;
    this._size = value;
    this.onResize?.call(this as unknown as CodeLayoutSplitNPanelInternal, this.size);
  }
  /**
   * Show badge?
   */
  showBadge = true;
  /**
   * Set user can resize this grid/panel.
   *
   * * Kept because it takes part in layout json (toJson/loadFromJson).
   */
  resizeable = true;
  /**
   * Child panels of this grid.
   *
   * * Always empty on a panel.
   */
  children : CodeLayoutSplitNPanelInternal[] = [];
  /**
   * Active child of this grid.
   *
   * * Use in Tab
   */
  activePanel: CodeLayoutSplitNPanelInternal|null = null;
  /**
   * Parent grid instance of this grid/panel.
   */
  parentGroup: CodeLayoutSplitNGridInternal|null = null;
  /**
   * Parent toplevel grid name of this grid/panel.
   */
  parentGrid: CodeLayoutSplitNGridName = 'none';

  inhertParentGrid = true;

  tooltip?: string;
  badge?: string|(() => VNode)|undefined;
  accept?: CodeLayoutSplitNGridName[];
  draggable = true;
  preDropCheck?: (
    dropPanel: any,
    targetGrid: CodeLayoutSplitNGridName,
    referencePanel?: any,
    referencePosition?: CodeLayoutSplitNDragDropReferencePosition|undefined,
  ) => boolean;
  onResize?: (this: CodeLayoutSplitNPanelInternal, size: number) => void;
  onVisibleChange?: (this: CodeLayoutSplitNPanelInternal, visible: boolean) => void;

  tabStyle?: CodeLayoutSplitNTabStyle;
  noAutoShink = false;
  minSize?: number|number[]|undefined;
  iconLarge?: string|(() => VNode)|undefined;
  iconSmall?: string|(() => VNode)|undefined;
  closeType: CodeLayoutSplitNPanelCloseType = 'none';
  actions?: CodeLayoutSplitNActionButton[]|undefined;
  data?: any = undefined;
  sourceFlag = FLAG_SPLIT_LAYOUT;

  //Public

  /**
   * Remove the current panel/grid from its parent.
   */
  removeSelf() {
    return this.parentGroup?.removePanel(this as unknown as CodeLayoutSplitNPanelInternal, false);
  }
  /**
   * Remove the current panel/grid from its parent and
   * trigger automatic shrink operations.
   */
  removeSelfWithShrink() {
    return this.parentGroup?.removePanel(this as unknown as CodeLayoutSplitNPanelInternal, true);
  }
  /**
   * Set parent activePanel to self.
   */
  activeSelf() {
    if (this.parentGroup) {
      this.parentGroup.setActiveChild(this as unknown as CodeLayoutSplitNPanelInternal);
      this.parentGroup.activeSelf();
    }
  }
  /**
   * Get is this panel actived in parent (Tab)
   */
  isSelfActived() {
    if (this.parentGroup)
      return this.parentGroup.activePanel === (this as unknown as CodeLayoutSplitNPanelInternal);
    return false;
  }
  /**
   * Get grid hoster container size (pixel).
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
  relayoutAllWithNewPanel(panels: CodeLayoutSplitNNodeInternal[], referencePanel?: CodeLayoutSplitNNodeInternal) {
    this.pushLateAction('relayoutAllWithNewPanel', panels, referencePanel);
  }
  /**
   * Notify hoster container there has grids was visible changed and needs to relayout.
   * @param panel Changed panel.
   */
  relayoutAfterToggleVisible(panel?: CodeLayoutSplitNNodeInternal) {
    if (!panel)
      panel = this;
    const parent = panel.getParent();
    if (!parent)
      return;
    if (panel.visible) {
      parent.relayoutAllWithNewPanel([ panel ]);
      parent.setActiveChild(panel as unknown as CodeLayoutSplitNPanelInternal);
    } else {
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
  relayoutAllWithRemovePanel(panel: CodeLayoutSplitNNodeInternal) {
    this.pushLateAction('relayoutAllWithRemovePanel', panel);
  }
  /**
   * Notify hoster container to relayout when container size changed.
   *
   * * This method is called internally, and generally you do not need to use this method.
   */
  relayoutAllWithResizedSize(resizedContainerSize: number) {
    this.pushLateAction('relayoutAllWithResizedSize', resizedContainerSize);
  }

  //Internal
  //These methods is called internally, and you do not need to use them.

  getParent() : CodeLayoutSplitNGridInternal|null {
    return this.parentGroup;
  }
  getIndexInParent() {
    return this.parentGroup?.children.indexOf(this as unknown as CodeLayoutSplitNPanelInternal) ?? 0;
  }

  lastRelayoutSize = 0;
  lastLayoutSizeCounter = 0;

  toString() {
    return `Panel: ${this.name} size: ${this.size}`
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

let gridNameCounter = 0;

/**
 * 为新建网格生成一个不重复的名称。
 *
 * 网格名称是 `v-for` 的 `:key` 与 `getGridByName` 的依据，重名会导致
 * 渲染节点复用错乱与查找取错，因此这里使用单调递增计数器而非随机数。
 * @param baseName 基础名称，通常是被切分网格的名称
 */
export function generateSplitGridName(baseName: string) {
  return `${baseName}-${gridNameCounter++}`;
}

/**
 * 从一个已存在网格上复制“表现层与配置”字段到新网格。
 *
 * 不能直接用 `Object.assign(newGrid, { ...sourceGrid })`：那样会把
 * `LateClass` 的 `_lateNotifyCallbacks` / `_lateNotifyItems`（markRaw 的 Map 与数组）
 * 按引用复制过去，使新旧网格共享同一份延迟回调容器，relayout 通知会串台；
 * 同时还会带上 `childReplacedBy`、`activePanel`、`parentGroup`、`_root`
 * 等结构性脏状态。
 *
 * @param target 新网格
 * @param source 来源网格
 */
export function cloneGridStyle(
  target: CodeLayoutSplitNGridInternal,
  source: CodeLayoutSplitNGridInternal,
) {
  //_root 是整个布局共享的同一个 CodeLayoutSplitNRootRef（addChildGrid/addChild 也是这样传播的），
  //必须带上：新网格在挂入树之前就可能要 addChilds，那会用到 this.root。
  target._root = source._root;
  target.tabStyle = source.tabStyle;
  target.minSize = source.minSize;
  target.accept = source.accept;
  target.draggable = source.draggable;
  target.resizeable = source.resizeable;
  target.stretchable = source.stretchable;
  target.canMinClose = source.canMinClose;
  target.parentGrid = source.parentGrid;
  target.inhertParentGrid = source.inhertParentGrid;
  target.preDropCheck = source.preDropCheck;
  target.sourceFlag = source.sourceFlag;
  target.closeType = source.closeType;
  target.iconLarge = source.iconLarge;
  target.iconSmall = source.iconSmall;
  target.actions = source.actions;
  target.data = source.data;
  return target;
}

/**
 * Panel type definition of SplitLayout.
 */
export class CodeLayoutSplitNPanelInternal extends CodeLayoutSplitNNodeInternal implements CodeLayoutSplitNPanel {

  public constructor() {
    super();
    this.open = true;
    this.sourceFlag = FLAG_SPLIT_LAYOUT;
  }

  onActive?: (grid: CodeLayoutSplitNPanel) => void;
  onClose?: (grid: CodeLayoutSplitNPanel) => void;

  /**
   * Panel in SplitLayout always open, no need to call the open method.
   * @deprecated
   */
  openPanel(): void {
    throw new Error('SplitLayout panel can only close');
  }
  /**
   * Close this panel.
   *
   * This method will trigger panelClose event in SplitLayout.
   */
  closePanel(): void {
    this.root.getRoot().closePanelInternal(this);
  }

  /**
   * Copy this panel and split it
   * @param direction Split direction
   * @param instanceCb New panel instance callback, can modify params
  */
  splitCopy(direction: CodeLayoutSplitCopyDirection, instanceCb: (panel: CodeLayoutSplitNPanel) => CodeLayoutSplitNPanel) {
    /**
     * 向网格中添加面板
     *    如果父级与目标方向一致，则直接添加
     *    如果父级与目标方向不一致，则
     *      分割当前网格，在下一级创建网格
     *        一半是当前父级所有子面板
     *        一半是新的面板
     */

    const self = this;
    const adjustGrid = requireNotNull(this.parentGroup, "No parent grid!");
    //用 requireNotNull 而非 assertNotNull：断言函数不会在闭包内保持收窄，
    //而下面的 createSameSideGrid 闭包要用到它。
    const parentGrid = requireNotNull(adjustGrid.parentGroup, "No top grid!");

    //创建相同方向的网格
    function createSameSideGrid(prev = false) {
      const newGrid = cloneGridStyle(new CodeLayoutSplitNGridInternal(), adjustGrid);
      newGrid.direction = adjustGrid.direction;
      newGrid.name = generateSplitGridName(adjustGrid.name);
      newGrid.size = 0;
      newGrid.noAutoShink = false;
      parentGrid.addChildGrid(
        newGrid,
        parentGrid.childGrid.indexOf(adjustGrid) + (prev ? -1 : 0)
      );
      return newGrid;
    }
    //创建垂直方向的网格
    function createSubGrid(prev = false) {
      //新网格上部，放之前的面板
      const newGrid = cloneGridStyle(new CodeLayoutSplitNGridInternal(), adjustGrid);
      newGrid.direction = adjustGrid.direction == 'horizontal' ? 'vertical' : 'horizontal';
      newGrid.name = generateSplitGridName(adjustGrid.name);
      newGrid.size = 0;
      newGrid.noAutoShink = false;
      newGrid.addChilds(adjustGrid.children.slice());
      newGrid.setActiveChild(self);
      adjustGrid.children = [];
      adjustGrid.childGrid = [];
      adjustGrid.addChildGrid(newGrid);

      //新网格，放新的面板
      const newGridOther = cloneGridStyle(new CodeLayoutSplitNGridInternal(), adjustGrid);
      newGridOther.direction = adjustGrid.direction == 'horizontal' ? 'vertical' : 'horizontal';
      newGridOther.name = generateSplitGridName(adjustGrid.name);
      newGridOther.size = 0;
      newGridOther.noAutoShink = false;
      adjustGrid.addChildGrid(newGridOther, prev ? 0 : 1);
      return newGridOther;
    }

    let newGrid: CodeLayoutSplitNGridInternal;

    switch (direction) {
      case 'left': {
        newGrid = adjustGrid.direction == 'horizontal' ?
          createSubGrid(true) :
          createSameSideGrid(true);
        break;
      }
      case 'right': {
        newGrid = adjustGrid.direction == 'horizontal' ?
          createSubGrid() :
          createSameSideGrid();
        break;
      }
      case 'top': {
        newGrid = adjustGrid.direction == 'vertical' ?
          createSubGrid(true) :
          createSameSideGrid(true);
        break;
      }
      case 'bottom': {
        newGrid = adjustGrid.direction == 'vertical' ?
          createSubGrid() :
          createSameSideGrid();
        break;
      }
      default:
        throw new Error('Unknow direction: ' + direction)
    }
    const newPanelDef : CodeLayoutSplitNPanel = {
      title: this.title,
      tooltip: this.tooltip,
      name: this.name,
      badge: this.badge,
      draggable: this.draggable,
      accept: this.accept,
      size: this.size,
      minSize: this.minSize,
      iconLarge: this.iconLarge,
      iconSmall: this.iconSmall,
      closeType: this.closeType,
    };
    const newPanel = newGrid.addPanel(instanceCb(newPanelDef));
    newGrid.setActiveChild(newPanel);

    nextTick(() => {
      parentGrid.notifyRelayout();
      adjustGrid.notifyRelayout();
      newGrid.notifyRelayout();
    });
  }
}
/**
 * Grid type definition of SplitLayout.
 */
export class CodeLayoutSplitNGridInternal extends CodeLayoutSplitNNodeInternal implements CodeLayoutSplitNGrid {

  public constructor(
    name : CodeLayoutSplitNGridName = 'centerArea',
    tabStyle: CodeLayoutSplitNTabStyle = 'text',
    onSwitchCollapse: (open: boolean) => void = () => {},
    onActiveSelf: () => void = () => {},
  ) {
    super();
    this.name = name;
    this.tabStyle = tabStyle;
    this.parentGrid = name;
    this.open = true;
    this.sourceFlag = FLAG_SPLIT_LAYOUT;
    this.onActiveSelf = onActiveSelf;
    this.onSwitchCollapse = onSwitchCollapse;
  }

  private onSwitchCollapse?: (open: boolean) => void;
  private onActiveSelf?: () => void;

  stretchable = true;
  /**
   * Set whether users can close the current panel by continuously shrinking it.
   */
  canMinClose = false;
  /**
   * Layout direction.
   */
  direction: 'vertical'|'horizontal' = 'vertical';
  /**
   * Child grid of this grid.
   */
  childGrid : CodeLayoutSplitNGridInternal[] = [];

  activeSelf() {
    if (!this.open)
      this.collapse(true);
    this.onActiveSelf?.();
  }

  closePanel(): void {
    this.collapse(false);
  }
  openPanel(): void {
    this.collapse(true);
  }
  togglePanel(): void {
    this.collapse(!this.open);
  }

  /**
   * Open or collapse the current grid.
   * @param open Is open?
   */
  collapse(open: boolean) {
    this.open = open;
    this.onSwitchCollapse?.(open);
  }

  toString() {
    return `Grid: ${this.name} size: ${this.size}`
  }

  getPanelByName(name: string) : CodeLayoutSplitNPanelInternal|null {
    return this.root.getPanelByName(name) ?? null;
  }

  //Public

  /**
   * Add a child grid to this grid.
   * @param grid Grid to add
   * @param direction Direction, default is the direction perpendicular to the current grid
   * @returns Child grid instance.
   */
  addGrid(grid: CodeLayoutSplitNGrid, direction: "vertical" | "horizontal" | undefined = undefined) {
    const panelInternal = grid as CodeLayoutSplitNGridInternal;

    if (panelInternal.parentGroup)
      throw new Error(`Panel ${grid.name} already added to ${panelInternal.parentGroup.name} !`);

    const panelResult = reactive(Object.assign(new CodeLayoutSplitNGridInternal(), grid));
    panelResult.children = [];
    panelResult.childGrid = [];
    panelResult.open = true;
    panelResult.size = grid.size ?? 0;
    panelResult.accept = grid.accept ?? this.accept;
    panelResult.direction = direction ?? (this.direction === 'vertical' ? 'horizontal' : 'vertical');
    this.addChildGrid(panelResult as CodeLayoutSplitNGridInternal);
    return panelResult as CodeLayoutSplitNGridInternal;
  }
  /**
   * Remove a child grid from this grid.
   * @param grid Grid to remove
   */
  removeGrid(grid: CodeLayoutSplitNGrid) {
    const panelInternal = grid as CodeLayoutSplitNGridInternal;
    if (panelInternal.parentGroup !== this)
      throw new Error(`Panel ${grid.name} is not child of this group !`);
    this.removeChildGrid(panelInternal);
    return grid;
  }
  /**
   * Add a child panel to this grid.
   * @param panel Panel to add
   * @param index Insert position
   * @returns Child panel instance.
   */
  addPanel(panel: CodeLayoutSplitNPanel, index?: number) {
    const panelInternal = panel as CodeLayoutSplitNPanelInternal;

    assert(!panelInternal.parentGroup, `Panel ${panel.name} already added to ${panelInternal.parentGroup?.name} !`);
    assert(!this.root.existsPanelInstanceRef(panelInternal.name), `A panel named ${panel.name} already exists in this layout`);

    const panelResult = reactive(Object.assign(new CodeLayoutSplitNPanelInternal(), panel));
    panelResult.children = [];
    panelResult.size = panel.size ?? 0;
    panelResult.accept = panel.accept ?? this.accept;
    this.addChild(panelResult as CodeLayoutSplitNPanelInternal, index);
    this.root.addPanelInstanceRef(panelResult as CodeLayoutSplitNPanelInternal);
    return panelResult as CodeLayoutSplitNPanelInternal;
  }
  /**
   * Remove panel from this grid.
   * @param panel Panel instance.
   * @param shrink Automatically shrink? Default true
   */
  removePanel(panel: CodeLayoutSplitNPanelInternal, shrink = true) {
    if (panel.parentGroup !== this)
      throw new Error(`Panel ${panel.name} is not child of this group !`);
    if (shrink)
      this.root.getRoot().removePanelInternal(panel);
    else
      this.removeChild(panel);
    return panel;
  }

  moveChildGridToSelf(childGrid: CodeLayoutSplitNGridInternal) {
    const activePanel = childGrid.activePanel;
    childGrid.childReplacedBy = this;
    this.children.push(...childGrid.children);
    for (const iterator of this.children)
      iterator.parentGroup = this;
    for (const iterator of this.childGrid)
      iterator.parentGroup = null;
    this.childGrid.splice(0);
    for (const iterator of childGrid.childGrid)
      this.childGrid.push(iterator);
    for (const iterator of this.childGrid)
      iterator.parentGroup = this;
    this.direction = childGrid.direction;
    //清理被吸收网格的悬挂引用：
    //其 children/childGrid 已全部移交给自身，若不清空，
    //同一批面板会同时挂在两个网格的 children 上（parentGroup 只指向新父级），
    //后续任何对这个已脱树网格的误操作都会静默生效而不是立刻暴露。
    childGrid.children.splice(0);
    childGrid.childGrid.splice(0);
    childGrid.activePanel = null;
    childGrid.parentGroup = null;
    this.setActiveChild(activePanel);
  }

  getContainerSize(): number {
    this.pushLateAction('getContainerSize');
    return super.getContainerSize();
  }

  /**
   * Set activePanel.
   * @param child The panel to be activated
   */
  setActiveChild(child: CodeLayoutSplitNPanelInternal|null) {
    this.activePanel = child;
    this.root.getRoot().childGridActiveChildChanged(this);
  }
  /**
   * Auto select a visible panel as activePanel.
   */
  reselectActiveChild() {
    this.activePanel = this.children.find((p) => p.visible) || null;
    this.root.getRoot().childGridActiveChildChanged(this);
  }
  /**
   * Check panel is children.
   */
  isChildren(panel: CodeLayoutSplitNPanelInternal) {
    return this.children.includes(panel);
  }

  onActive?: (grid: CodeLayoutSplitNGrid) => void;
  onActivePanelChanged?: (grid: CodeLayoutSplitNGrid, panel: CodeLayoutSplitNPanel) => void;
  onMinCloseChanged?: (grid: CodeLayoutSplitNGrid, visible: boolean) => void;

  //Internal
  //These methods is called internally, and you do not need to use them.

  childReplacedBy: CodeLayoutSplitNGridInternal|null = null;

  addChild(child: CodeLayoutSplitNPanelInternal, index?: number) {
    if (!(child instanceof CodeLayoutSplitNPanelInternal))
      throw new Error('Try add bad panel data');
    if (this.name === child.name)
      throw new Error('Try add self');
    if (typeof index === 'number')
      this.children.splice(index, 0, child);
    else
      this.children.push(child);
    child.parentGroup = this;
    child._root = this._root;
    if (child.inhertParentGrid)
      child.parentGrid = this.parentGrid;
    if (!this.activePanel)
      this.activePanel = child;
    this.root.addPanelInstanceRef(child);
  }
  addChilds(childs: CodeLayoutSplitNPanelInternal[], startIndex?: number) {
    for (const child of childs) {
      if (!(child instanceof CodeLayoutSplitNPanelInternal))
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
      child._root = this._root;
      if (child.inhertParentGrid)
        child.parentGrid = this.parentGrid;
      this.root.addPanelInstanceRef(child);
    }
    if (!this.activePanel)
      this.activePanel = this.children[0];
  }
  removeChild(child: CodeLayoutSplitNPanelInternal) {
    this.children.splice(this.children.indexOf(child), 1);
    child.parentGroup = null;
    child._root = null;
    //如果被删除面板是激活面板，则选另外一个面板激活
    if (child.name === this.activePanel?.name)
      this.reselectActiveChild();
    this.root.deletePanelInstanceRef(child.name);
  }
  replaceChild(oldChild: CodeLayoutSplitNPanelInternal, child: CodeLayoutSplitNPanelInternal) {
    this.children.splice(
      this.children.indexOf(oldChild),
      1,
      child);
    if (oldChild.parentGroup === this)
      oldChild.parentGroup = null;
    //如果被删除面板是激活面板，则选另外一个面板激活
    if (this.activePanel?.name === oldChild.name)
      this.activePanel = child;
    this.root.deletePanelInstanceRef(oldChild.name);
    this.root.addPanelInstanceRef(child);
    child.parentGroup = this;
    child._root = this._root;
    if (child.inhertParentGrid)
      child.parentGrid = this.parentGrid;
  }
  hasChild(child: CodeLayoutSplitNPanelInternal) {
    return this.children.includes(child);
  }
  findChild(name: string) {
    return this.children.find(child => child.name === name);
  }

  addChildGrid(child: CodeLayoutSplitNGridInternal, index?: number) {
    if (typeof index === 'number')
      this.childGrid.splice(index, 0, child);
    else
      this.childGrid.push(child);
    child.parentGroup = this;
    child._root = this._root;
    if (child.inhertParentGrid)
      child.parentGrid = this.parentGrid;
    return child;
  }
  addChildGrids(childs: CodeLayoutSplitNGridInternal[], startIndex?: number) {
    if (typeof startIndex === 'number')
      this.childGrid.splice(startIndex, 0, ...childs);
    else
      this.childGrid.push(...childs);
    for (const child of childs) {
      child.parentGroup = this;
      child._root = this._root;
      if (child.inhertParentGrid)
        child.parentGrid = this.parentGrid;
    }
  }
  removeChildGrid(child: CodeLayoutSplitNGridInternal) {
    this.childGrid.splice(this.childGrid.indexOf(child), 1);
    child.parentGroup = null;
    child._root = null;
  }
  replaceChildGrid(oldChild: CodeLayoutSplitNGridInternal, child: CodeLayoutSplitNGridInternal) {
    const index = this.childGrid.indexOf(oldChild);
    if (index === -1)
      throw new Error(`Panel ${oldChild.name} is not child of this group !`);
    this.childGrid.splice(
      index,
      1,
      child
    );
    if (oldChild.parentGroup === this)
      oldChild.parentGroup = null;
    child._root = this._root;
    child.parentGroup = this;
    if (child.inhertParentGrid)
      child.parentGrid = this.parentGrid;
  }
  hasChildGrid(child: CodeLayoutSplitNGridInternal) {
    return this.childGrid.includes(child);
  }

  toJson() : any {
    return {
      ...super.toJson(),
      canMinClose: this.canMinClose,
      direction: this.direction,
      childGrid: this.childGrid.map(p => p.toJson()),
    }
  }
  loadFromJson(json: any): void {
    this.direction = json.direction || this.direction;
    this.canMinClose = json.canMinClose ?? this.canMinClose;
    super.loadFromJson(json);
  }
}
/**
 * Root grid of SplitLayout.
 *
 * This grid is the root grid of SplitLayout, and it is the only grid that can be set to SplitLayout.layoutData.
 */
export class CodeLayoutSplitNRootGrid extends CodeLayoutSplitNGridInternal {
  constructor(grid: CodeLayoutSplitNGridName = 'centerArea') {
    super();
    this.name = 'root';
    this.direction = 'horizontal';
    this.parentGrid = grid;
    this.canMinClose = false;
    this.noAutoShink = true;
    this._root = new CodeLayoutSplitNRootRef();
  }

  /**
   * Clear all panels and child grids in this layout.
   */
  clearLayout() {
    this.childGrid.splice(0);
    this.children.splice(0);
    this._root?.clearPanelInstanceRef();
    return this;
  }
  /**
   * Load the previous layout from JSON data, will clear all panels,
   * instantiatePanelCallback will sequentially call all panels, where you can process panel data.
   * @param json Layout json data.
   * @param instantiatePanelCallback Callback to process layout data panel.
   */
  loadLayout(json: object, instantiatePanelCallback: (panel: any) => CodeLayoutSplitNPanel) {
    if (!json)
      return this;
    this.clearLayout();

    function loadGrid(grid: any, gridInstance: CodeLayoutSplitNGridInternal) {
      gridInstance.loadFromJson(grid);

      if (grid.childGrid instanceof Array && grid.childGrid.length > 0) {
        for (const childGrid of grid.childGrid) {
          const childGridInstance = new CodeLayoutSplitNGridInternal();
          loadGrid(childGrid, childGridInstance);
          gridInstance.addChildGrid(childGridInstance);
        }
        gridInstance.notifyRelayout()
      } else if (grid.childGrid instanceof Array) {
        for (const childPanel of grid.children) {
          const data = instantiatePanelCallback(childPanel);
          const panel = gridInstance.addPanel(data);
          panel.loadFromJson(childPanel);
        }
      }
    }

    loadGrid(json, this);
    this.notifyRelayout();
    return this;
  }
  /**
   * Save layout to json.
   * @returns Layout json data.
   */
  saveLayout() {
    return this.toJson();
  }

  /**
   * Get grid instance by name.
   * @param name The grid name.
   * @returns Grid instance, if grid is not found in the component, return undefined
   */
  getGridByName(name: string)  {
    function loop(grid: CodeLayoutSplitNGridInternal, name2: string) : CodeLayoutSplitNGridInternal|undefined {
      for (const iterator of grid.childGrid) {
        if (iterator.name === name2)
          return iterator;
        const a = loop(iterator, name2);
        if (a)
          return a;
      }
    }
    return loop(this, name);
  }
}

/**
 * Default SplitLayout config
 */
export const defaultSplitLayoutConfig : CodeLayoutSplitNConfig = {

};

/**
 * SplitLayout other config
 */
export interface CodeLayoutSplitNConfig {
  /**
   * This callback is triggered when  user drag a non-panel data into component. You can check here whether dragging is allowed or not.
   * @param e Raw DragEvent
   * @returns Return true allows drop, false prevent drop.
   */
  onNonPanelDrag?: (e: DragEvent, sourcePosition: CodeLayoutSplitNDragDropReferenceAreaType) => boolean;
  /**
   * This callback is triggered when user drop a non-panel data into component.
   * @param e Raw DragEvent
   * @param reference Drop source panel.
   * @param referencePosition Drop source position.
   */
  onNonPanelDrop?: (
    e: DragEvent,
    sourcePosition: CodeLayoutSplitNDragDropReferenceAreaType,
    reference: CodeLayoutSplitNNodeInternal|undefined,
    referencePosition: CodeLayoutSplitNDragDropReferencePosition|undefined
  ) => void;
}

/**
 * Instance of SplitLayout.
 *
 * Can use like this:
 * ```
 * const splitLayout = ref<CodeLayoutSplitNInstance>();
 * const rootGrid = splitLayout.value.getRootGrid();
 * ```
 */
export interface CodeLayoutSplitNInstance {
  /**
   * Get panel instance by name.
   * @param name The panel name.
   * @returns Panel instance, if panel is not found in the component, return undefined
   */
  getPanelByName(name: string): CodeLayoutSplitNPanelInternal | undefined,
  /**
   * Get grid instance by name.
   * @param name The grid name.
   * @returns Grid instance, if grid is not found in the component, return undefined
   */
  getGridByName(name: string): CodeLayoutSplitNGridInternal | undefined,
  /**
   * Obtain a grid that is currently actived by user and can be used to add panels.
   */
  getActiveGird() : CodeLayoutSplitNGridInternal|undefined;
  /**
   * Clear all layout data.
   */
  clearLayout(): void;
  /**
   * Load layout from json data.
   * @param json Json data.
   * @param instantiatePanelCallback Callback to instantiate panel.
   */
  loadLayout(json: any, instantiatePanelCallback: (data: CodeLayoutSplitNPanel) => CodeLayoutSplitNPanel): void;
  /**
   * Save layout to json data.
   * @returns Json data.
   */
  saveLayout(): any;

  getGridTreeDebugText() : string;

  /**
   * Activate the specified panel through Name. If the specified Name panel does not exist in the component, it has no effect.
   *
   * This method will change ActiveGird.
   *
   * @param name Panel name
   */
  activePanel(name: string): void;
}

export interface CodeLayoutSplitLayoutContext {
  currentActiveGrid: Ref<CodeLayoutSplitNGridInternal|null>,
  getRef(): any;
  activeGrid(grid: CodeLayoutSplitNGridInternal) : void;
  dragDropToPanel(
    referencePanel: CodeLayoutSplitNNodeInternal,
    referencePosition: CodeLayoutSplitNDragDropReferencePosition,
    panels: CodeLayoutSplitNPanelInternal[],
    toTab?: boolean
  ) : void;
  dragDropNonPanel(
    e: DragEvent,
    isDrop: boolean,
    sourcePosition: CodeLayoutSplitNDragDropReferenceAreaType,
    referencePanel?: CodeLayoutSplitNNodeInternal,
    referencePosition?: CodeLayoutSplitNDragDropReferencePosition
  ): boolean;
}

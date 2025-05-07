import { nextTick, reactive, type Ref } from "vue";
import { CodeLayoutGridInternal, CodeLayoutPanelInternal, type CodeLayoutPanelHosterContext, type CodeLayoutPanel, type CodeLayoutDragDropReferencePosition, type CodeLayoutDragDropReferenceAreaType, type CodeLayoutPanelTabStyle, type CodeLayoutGrid } from "../CodeLayout";
import { FLAG_SPLIT_LAYOUT } from "../Composeable/DragDrop";


export interface CodeLayoutSplitNGrid extends Omit<CodeLayoutPanel, 'title'> {
  /**
   * Set whether users can close the current panel by continuously shrinking it.
   * 
   * Default: false
   */
  canMinClose?: boolean;

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
export interface CodeLayoutSplitNPanel extends Omit<CodeLayoutPanel, 'visible'|'showBadge'|'tabStyle'|'noHide'|'startOpen'> {
  /**
   * Callback when user actived this panel.
   */
  onActive?: (grid: CodeLayoutSplitNPanel) => void;
  /**
   * Callback when user closed this panel.
   */
  onClose?: (grid: CodeLayoutSplitNPanel) => void;
}

export type CodeLayoutSplitCopyDirection = 'left'|'top'|'bottom'|'right';


/**
 * Panel type definition of SplitLayout.
 */
export class CodeLayoutSplitNPanelInternal extends CodeLayoutPanelInternal implements CodeLayoutSplitNPanel {

  public constructor(context: CodeLayoutPanelHosterContext) {
    super(context);
    this.open = true;
    this.sourceFlag = FLAG_SPLIT_LAYOUT;
  }

  onActive?: (grid: CodeLayoutSplitNPanel) => void;
  onClose?: (grid: CodeLayoutSplitNPanel) => void;

  /**
   * Panel in SplitLayout always open, no need to call the open method.
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
    this.context.closePanelInternal(this);
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
    const adjustGrid = this.parentGroup as CodeLayoutSplitNGridInternal;
    const parentGrid = this.parentGroup?.parentGroup as CodeLayoutSplitNGridInternal;

    if (!parentGrid)
      throw new Error("No top grid!");

    //创建相同方向的网格
    function createSameSideGrid(prev = false) {
      const newGrid = new CodeLayoutSplitNGridInternal(adjustGrid.context);
      Object.assign(newGrid, {
        ...adjustGrid,
        direction: adjustGrid.direction,
        name: adjustGrid.name + Math.floor(Math.random() * 10),
        children: [],
        childGrid: [],
        size: 0,
        noAutoShink: false,
      });
      parentGrid.addChildGrid(
        newGrid, 
        parentGrid.childGrid.indexOf(adjustGrid) + (prev ? -1 : 0)
      );
      return newGrid;
    }
    //创建垂直方向的网格
    function createSubGrid(prev = false) {
      //新网格上部，放之前的面板
      const newGrid = new CodeLayoutSplitNGridInternal(adjustGrid.context);
      Object.assign(newGrid, {
        ...adjustGrid,
        direction: adjustGrid.direction == 'horizontal' ? 'vertical' : 'horizontal',
        name: adjustGrid.name + Math.floor(Math.random() * 10),
        children: [],
        childGrid: [],
        size: 0,
        noAutoShink: false,
      });
      newGrid.addChilds(adjustGrid.children);
      newGrid.setActiveChild(self);
      adjustGrid.children = [];
      adjustGrid.childGrid = [];
      adjustGrid.addChildGrid(newGrid);

      //新网格，放新的面板
      const newGridOther = new CodeLayoutSplitNGridInternal(adjustGrid.context);
      Object.assign(newGridOther, {
        ...adjustGrid,
        direction: adjustGrid.direction == 'horizontal' ? 'vertical' : 'horizontal',
        name: adjustGrid.name + Math.floor(Math.random() * 10),
        children: [],
        childGrid: [],
        size: 0,
        noAutoShink: false,
      });
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
 * 
 * Events:
 */
export class CodeLayoutSplitNGridInternal extends CodeLayoutGridInternal implements CodeLayoutSplitNGrid {

  public constructor(
    context: CodeLayoutPanelHosterContext,
    name : CodeLayoutGrid = 'centerArea',
    tabStyle: CodeLayoutPanelTabStyle = 'text',
    onSwitchCollapse: (open: boolean) => void = () => {},
    onActiveSelf: () => void = () => {},
  ) {
    super(name, tabStyle, context, onSwitchCollapse, onActiveSelf);
    this.open = true;
    this.sourceFlag = FLAG_SPLIT_LAYOUT;
  }

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

    const panelResult = reactive(new CodeLayoutSplitNGridInternal(this.context));
    Object.assign(panelResult, grid);
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
  addPanel(panel: CodeLayoutSplitNPanel, startOpen?: boolean, index?: number) {
    const panelInternal = panel as CodeLayoutPanelInternal;
    
    if (panelInternal.parentGroup)
      throw new Error(`Panel ${panel.name} already added to ${panelInternal.parentGroup.name} !`);
    if (this.context.panelInstances.has(panelInternal.name))
      throw new Error(`A panel named ${panel.name} already exists in this layout`);
  
    const panelResult = reactive(new CodeLayoutSplitNPanelInternal(this.context));
    Object.assign(panelResult, panel);
    panelResult.children = [];
    panelResult.size = panel.size ?? 0;
    panelResult.accept = panel.accept ?? this.accept;
    this.addChild(panelResult as CodeLayoutSplitNPanelInternal, index);
    this.context.panelInstances.set(panelInternal.name, panelResult as CodeLayoutSplitNPanelInternal);
  
    return panelResult as CodeLayoutSplitNPanelInternal;
  }

  moveChildGridToSelf(childGrid: CodeLayoutSplitNGridInternal) {
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
    this.setActiveChild(childGrid.activePanel);
  }

  getContainerSize(): number {
    this.pushLateAction('getContainerSize');
    return super.getContainerSize();
  }

  setActiveChild(child: CodeLayoutPanelInternal|null) {
    super.setActiveChild(child);
    this.context.childGridActiveChildChanged(this);
  }
  reselectActiveChild(): void {
    super.reselectActiveChild();
    this.context.childGridActiveChildChanged(this);
  }

  onActive?: (grid: CodeLayoutSplitNGrid) => void;
  onActivePanelChanged?: (grid: CodeLayoutSplitNGrid, panel: CodeLayoutSplitNPanel) => void;
  onMinCloseChanged?: (grid: CodeLayoutSplitNGrid, visible: boolean) => void;

  //Internal
  //These methods is called internally, and you do not need to use them.

  childReplacedBy: CodeLayoutSplitNGridInternal|null = null;

  addChildGrid(child: CodeLayoutSplitNGridInternal, index?: number) {
    if (typeof index === 'number')
      this.childGrid.splice(index, 0, child);
    else
      this.childGrid.push(child);
    child.parentGroup = this;
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
      if (child.inhertParentGrid)
        child.parentGrid = this.parentGrid;
    }
  }
  removeChildGrid(child: CodeLayoutSplitNGridInternal) {
    this.childGrid.splice(this.childGrid.indexOf(child), 1);
    child.parentGroup = null;
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
  onNonPanelDrag?: (e: DragEvent, sourcePosition: CodeLayoutDragDropReferenceAreaType) => boolean;
  /**
   * This callback is triggered when user drop a non-panel data into component. 
   * @param e Raw DragEvent
   * @param reference Drop source panel.
   * @param referencePosition Drop source position.
   */
  onNonPanelDrop?: (e: DragEvent, sourcePosition: CodeLayoutDragDropReferenceAreaType, reference: CodeLayoutPanelInternal|undefined, referencePosition: CodeLayoutDragDropReferencePosition|undefined) => void;
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
   * Get root grid instance.
   * @returns Root grid instance.
   */
  getRootGrid() : CodeLayoutSplitNGridInternal;
  /**
   * Get panel instance by name.
   * @param name The panel name.
   * @returns Panel instance, if panel is not found in the component, return undefined
   */
  getPanelByName(name: string): CodeLayoutPanelInternal | undefined,
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

  getGridTreeDebugText() : string;

  /**
   * Activate the specified panel through Name. If the specified Name panel does not exist in the component, it has no effect.
   * 
   * This method will change ActiveGird.
   * 
   * @param name Panel name
   */
  activePanel(name: string): void;
  /**
   * Clear all grid.
   */
  clearLayout(): void;
  /**
   * Save current layout to JSON data.
   */
  saveLayout(): any;
  /**
   * Load the previous layout from JSON data, 
   * instantiatePanelCallback will sequentially call all panels, where you can process panel data.
   */
  loadLayout(json: any, instantiatePanelCallback: (data: CodeLayoutSplitNPanel) => CodeLayoutSplitNPanel): void;
}

export interface CodeLayoutSplitLayoutContext {
  currentActiveGrid: Ref<CodeLayoutSplitNGridInternal|null>,
  getRef(): any;
  activeGrid(grid: CodeLayoutSplitNGridInternal) : void;
  dragDropToPanel(referencePanel: CodeLayoutPanelInternal, referencePosition: CodeLayoutDragDropReferencePosition, panel: CodeLayoutPanelInternal, toTab?: boolean) : void;
  dragDropNonPanel(e: DragEvent, isDrop: boolean, sourcePosition: CodeLayoutDragDropReferenceAreaType, referencePanel?: CodeLayoutPanelInternal, referencePosition?: CodeLayoutDragDropReferencePosition): boolean;
}
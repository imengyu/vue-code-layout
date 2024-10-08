import { reactive, type Ref } from "vue";
import { CodeLayoutGridInternal, CodeLayoutPanelInternal, type CodeLayoutPanelHosterContext, type CodeLayoutPanel, type CodeLayoutDragDropReferencePosition } from "../CodeLayout";


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


/**
 * Panel type definition of SplitLayout.
 */
export class CodeLayoutSplitNPanelInternal extends CodeLayoutPanelInternal implements CodeLayoutSplitNPanel {

  public constructor(context: CodeLayoutPanelHosterContext) {
    super(context);
    this.open = true;
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
}
/**
 * Grid type definition of SplitLayout.
 * 
 * Events:
 */
export class CodeLayoutSplitNGridInternal extends CodeLayoutGridInternal implements CodeLayoutSplitNGrid {

  public constructor(context: CodeLayoutPanelHosterContext) {
    super('centerArea', 'text', context, () => {}, () => {});
    this.open = true;
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
    panelResult.parentGrid = this.parentGrid;
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
  addPanel(panel: CodeLayoutSplitNPanel) {
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
    this.addChild(panelResult as CodeLayoutSplitNPanelInternal);
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
    child.parentGrid = this.parentGrid;
  }
  addChildGrids(childs: CodeLayoutSplitNGridInternal[], startIndex?: number) {
    if (typeof startIndex === 'number')
      this.childGrid.splice(startIndex, 0, ...childs);
    else
      this.childGrid.push(...childs);
    for (const child of childs) {
      child.parentGroup = this;
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
  activeGrid(grid: CodeLayoutSplitNGridInternal) : void;
  dragDropToPanel(referencePanel: CodeLayoutPanelInternal, referencePosition: CodeLayoutDragDropReferencePosition, panel: CodeLayoutPanelInternal, toTab?: boolean) : void;
}
import type { Ref } from "vue";
import { CodeLayoutGridInternal, CodeLayoutPanelInternal, type CodeLayoutConfig, type CodeLayoutGrid, type CodeLayoutPanel } from "./CodeLayout";
import { CodeLayoutSplitNGridInternal } from "./SplitLayout/SplitN";
import { assertNotNull } from "./Utils/Assert";

/**
 * Default accept grid names for panel drag and drop.
 */
export const defaultAccept : CodeLayoutGrid[] = [ 'bottomPanel', 'primarySideBar','secondarySideBar' ];

/**
 * Root grid of CodeLayout.
 */
export class CodeLayoutRootGrid extends CodeLayoutGridInternal {

  constructor() {
    super('rootGrid', 'none', () => {}, () => {});

    this.primarySideBar = new CodeLayoutSplitNGridInternal('primarySideBar', 'hidden', 
      (open) => {
        assertNotNull(this.layoutConfig);
        const _layoutConfig = this.layoutConfig.value;
        _layoutConfig.primarySideBar = open;
      },
      () => {
        this.primarySideBarGroup?.value.forceUpdate();
        this.activityBarGroup?.value.forceUpdate();
      });
    this.secondarySideBar = new CodeLayoutSplitNGridInternal('secondarySideBar', 'icon', 
      (open) => {
        assertNotNull(this.layoutConfig);
        const _layoutConfig = this.layoutConfig.value;
        _layoutConfig.secondarySideBar = open;
      },
      () => {
        this.secondarySideBarGroup?.value.forceUpdate();
      });
    this.bottomPanel = new CodeLayoutSplitNGridInternal('bottomPanel', 'text', 
      (open) => { 
        assertNotNull(this.layoutConfig);
        const _layoutConfig = this.layoutConfig.value;
        _layoutConfig.bottomPanel = open;
      },
      () => {
        this.bottomPanelGroup?.value.forceUpdate();
      });

    this.addChild(this.primarySideBar);
    this.addChild(this.secondarySideBar);
    this.addChild(this.bottomPanel);
    this.children.forEach(child => {
      child.accept = defaultAccept;
    });
  }

  /**
   * Primary side bar grid.
   */
  primarySideBar: CodeLayoutSplitNGridInternal;
  /**
   * Secondary side bar grid.
   */
  secondarySideBar: CodeLayoutSplitNGridInternal;
  /**
   * Bottom panel grid.
   */
  bottomPanel: CodeLayoutSplitNGridInternal;

  layoutConfig?: Ref<CodeLayoutConfig>;
  primarySideBarGroup?: Ref<any>;
  bottomPanelGroup?: Ref<any>;
  secondarySideBarGroup?: Ref<any>;
  activityBarGroup?: Ref<any>;

  /**
   * Clear all panels.
   */
  clearLayout() {
    this.primarySideBar.children.splice(0);
    this.secondarySideBar.children.splice(0);
    this.bottomPanel.children.splice(0);
    this.primarySideBar.setActiveChild(null);
    this.secondarySideBar.setActiveChild(null);
    this.bottomPanel.setActiveChild(null);
    this.hoster?.clearPanelInstanceRef();
  }
  /**
   * Save the layout dragged by the user to the JSON data, and after the next entry, call 'loadLayout' to reload and restore the original layout from the JSON data.
   * 
   * Note: Some basic layout data (CodeLayoutConfig) needs to be save after called this function.
   */
  saveLayout() {
    return {
      primary: this.primarySideBar.toJson(),
      secondary: this.secondarySideBar.toJson(),
      bottom: this.bottomPanel.toJson(),
    };
  }
  /**
   * Load the previous layout from JSON data, will clear all panels,
   * instantiatePanelCallback will sequentially call all panels, where you can process panel data.
   * @param json json data from `saveLayout`.
   * @param instantiatePanelCallback process layout data panel.
   */
  loadLayout(json: any, instantiatePanelCallback: (data: CodeLayoutPanel) => CodeLayoutPanel) {

    this.clearLayout();

    if (!json)
      return;

    function loadGrid(gridData: any, gridInstance: CodeLayoutPanelInternal) {
      gridInstance.loadFromJson(gridData);
      if (gridData.children instanceof Array) {
        for (const childPanelData of gridData.children) {
          const panelInstance = gridInstance.addPanel(childPanelData as CodeLayoutPanel);
          loadGrid(childPanelData, instantiatePanelCallback(panelInstance) as CodeLayoutPanelInternal);
        }
      }
      gridInstance.notifyRelayout();
    }

    if (json.primary) {
      loadGrid(json.primary, this.primarySideBar as CodeLayoutPanelInternal);
    }
    if (json.secondary) {
      loadGrid(json.secondary, this.secondarySideBar as CodeLayoutPanelInternal);
    } 
    if (json.bottom) {
      loadGrid(json.bottom, this.bottomPanel as CodeLayoutPanelInternal);
    }
  }

}

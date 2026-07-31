import { PanelMenuBuiltins } from "./Composeable/PanelMenu";
import type { CodeLayoutConfig, CodeLayoutGrid } from "./Types";

/**
 * Default CodeLayoutConfig
 */
export const defaultCodeLayoutConfig: CodeLayoutConfig = {
  primarySideBarSwitchWithActivityBar: true,
  primarySideBarPosition: "left",
  primarySideBarWidth: 20,
  primarySideBarMinWidth: 170,
  activityBarPosition: "side",
  activityBarSubGroupShowTitle: true,
  secondarySideBarWidth: 20,
  secondarySideBarMinWidth: 170,
  secondaryActivityBarPosition: 'side',
  bottomPanelHeight: 30,
  bottomPanelMinHeight: 40,
  bottomPanelMaximize: false,
  panelAlignment: 'center',
  panelPosition: 'bottom',
  centerMinWidth: 300,
  centerMinHeight: 100,
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
  menuConfigs: {
    builtinMenus: Object.keys(PanelMenuBuiltins),
    customMenus: [],
  }
};

/**
 * Default accept grid names for panel drag and drop.
 */
export const defaultAccept: CodeLayoutGrid[] = [ 'bottomPanel', 'primarySideBar','secondarySideBar' ];

export type CodeLayoutRegionName = 'primarySideBar' | 'secondarySideBar' | 'bottomPanel';

export const REGION_NAMES: readonly CodeLayoutRegionName[] = ['primarySideBar', 'secondarySideBar', 'bottomPanel'] as const;

import type { VNode } from "vue";
import type { PanelMenuRegistryItem } from "./Composeable/PanelMenu";
import type { CodeLayoutLangDefine } from "./Language";

/**
 * 阶段 0 说明：本文件是从重构前的 `CodeLayout.ts` 抽出的**纯类型**定义，
 * 逐字复制，未作任何改动。目的是让 Language / Components / Composeable
 * 等共享模块不再 import 即将成为只读参考的 `old/CodeLayout.ts`。
 *
 * 后续阶段（§5）会用 Model/ 下的真实类型替换掉文件末尾那几个占位声明。
 */

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
  primarySideBarSwitchWithActivityBar: boolean,
  primarySideBarPosition: 'left'|'right',
  primarySideBarWidth: number,
  primarySideBarMinWidth: number,
  secondarySideBarWidth: number,
  secondarySideBarMinWidth: number,
  bottomPanelHeight: number,
  bottomPanelMinHeight: number,
  centerMinHeight: number,
  centerMinWidth: number,
  panelAlignment: 'left'|'center'|'right'|'justify'|'left-side'|'right-side',
  panelPosition: 'top'|'bottom'
  activityBarPosition: 'side'|'top'|'hidden'|'bottom',
  panelHeaderHeight: number,
  panelMinHeight: number,
  titleBar: boolean,
  titleBarShowCustomizeLayout: boolean,
  activityBar: boolean,
  activityBarSubGroupShowTitle: boolean,
  primarySideBar: boolean,
  secondarySideBar: boolean,
  secondaryActivityBarPosition: 'side'|'top'|'hidden'|'bottom',
  bottomPanel: boolean,
  bottomPanelMaximize: boolean,
  statusBar: boolean,
  menuBar: boolean,
  menuConfigs: {
    builtinMenus: string[],
    customMenus: PanelMenuRegistryItem[],
  };

  //Events

  onResetDefault?: () => void;
  onStartDrag?: (panel: CodeLayoutPanelInternal[]) => boolean;
  onEndDrag?: (panel: CodeLayoutPanelInternal[]) => void;
  onDropToGrid?: (panel: CodeLayoutPanelInternal, grid: CodeLayoutGrid) => boolean;
  onDropToPanel?: (
    reference: CodeLayoutPanelInternal,
    referencePosition: CodeLayoutDragDropReferencePosition,
    panel: CodeLayoutPanelInternal,
    dropTo: CodeLayoutDragDropReferenceAreaType
  ) => boolean;
  onGridFirstDrop?: (grid: CodeLayoutGrid, panel: CodeLayoutPanelInternal) => CodeLayoutPanelInternal;
  onNoAutoShinkTabGroup?: (group: CodeLayoutPanelInternal) => void,
  onNoAutoShinkNormalGroup?: (group: CodeLayoutPanelInternal) => void,
  onNonPanelDrag?: (e: DragEvent, sourcePosition: CodeLayoutDragDropReferenceAreaType) => boolean;
  onNonPanelDrop?: (
    e: DragEvent,
    sourcePosition: CodeLayoutDragDropReferenceAreaType,
    reference: CodeLayoutPanelInternal|undefined,
    referencePosition: CodeLayoutDragDropReferencePosition|undefined
  ) => void;
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

export type CodeLayoutGrid = 'primarySideBar'|'secondarySideBar'|'bottomPanel'|'centerArea'|'rootGrid'|'none'|
  //Some center area grid.
  'centerArea1'|'centerArea2'|'centerArea3'|'centerArea4'|'centerArea5'|'centerArea6';

export type CodeLayoutPanelCloseType = 'unSave'|'close'|'none';

export type CodeLayoutPanelTabStyle = 'none'|'single'|'text'|'text-bottom'|'icon'|'icon-bottom'|'hidden';

/**
 * Drop source postition Definition
 *
 * 注意：`''` 是有效值，代表「无落点」，组件中 `dragOverState` 的初始值即为 `''`。
 */
export type CodeLayoutDragDropReferencePosition = ''|'up'|'down'|'left'|'right'|'center';

/**
 * Drop source area Definition
 */
export type CodeLayoutDragDropReferenceAreaType = 'normal'|'empty'|'tab-header'|'tab-content'|'activiy-bar';

/**
 * Panel User Type Definition
 */
export interface CodeLayoutPanel {
  title: string;
  tooltip?: string;
  name: string;
  badge?: string|(() => VNode)|undefined;
  visible?: boolean;
  showBadge?: boolean;
  draggable?: boolean;
  accept?: CodeLayoutGrid[];
  preDropCheck?: (
    dropPanel: CodeLayoutPanel,
    targetGrid: CodeLayoutGrid,
    referencePanel?: CodeLayoutPanel|undefined,
    referencePosition?: CodeLayoutDragDropReferencePosition|undefined,
  ) => boolean;
  onResize?: (this: CodeLayoutPanelInternal, size: number) => void;
  onVisibleChange?: (this: CodeLayoutPanelInternal, visible: boolean) => void;
  onOpenChange?: (this: CodeLayoutPanelInternal, state: boolean) => void;
  tabStyle?: CodeLayoutPanelTabStyle;
  noAutoShink?: boolean;
  noHide?: boolean;
  /**
   * Size of this panel.
   *
   * * In CodeLayout, it's pixel size.
   * * In SplitLayout, it's percentage size.
   *
   * @remarks 重构后 CodeLayout 侧语义将改为「同组内权重」，
   * 并新增 `getPixelSize()` 取实际像素（见 plan.md §6.7 / §11.3，决策 C2）。
   */
  size?: number|undefined;
  minSize?: number|number[]|undefined;
  startOpen?: boolean|undefined;
  iconLarge?: string|(() => VNode)|undefined;
  iconSmall?: string|(() => VNode)|undefined;
  closeType?: CodeLayoutPanelCloseType|undefined;
  actions?: CodeLayoutActionButton[]|undefined;
  /**
   * Should this panel inherit `parentGrid` field from parent ?
   * @default true
   * @deprecated 重构后失效（见 plan.md §5.4）。
   */
  inhertParentGrid?: boolean;
  data?: any;
}

/**
 * Panel Action button Type Definition
 *
 * `name` 为可选 —— SplitLayout 侧的镜像类型 `CodeLayoutSplitNActionButton`
 * 同样是可选，`SplitTab.vue` 会把它传给 `CodeLayoutActionsRender`，
 * 两者必须保持一致。
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
   */
  onClick?: () => void,
}

//
// ─── 以下为阶段 0 的占位声明 ────────────────────────────────────────────
// 仅为让 PanelMenu.ts 等共享模块通过类型检查而存在。
// 阶段 1 会用 Model/Node.ts、Model/Region.ts 中的真实类实现替换（见 plan.md §5.2、§11.2）。
//

/**
 * @deprecated 阶段 1 起请按语义改用
 * `CodeLayoutPanelInstance` / `CodeLayoutGroupInstance` / `CodeLayoutRegionInstance`。
 */
export interface CodeLayoutPanelInternal extends CodeLayoutPanel {
  /** 运行时恒存在，阶段 1 由 Model 层提供真实实现 */
  relayoutAfterToggleVisible(): void;
  parentGroup: any;
  parentGrid: string;
  getParent(): any;
}

/**
 * @deprecated 阶段 1 起改用 `CodeLayoutRegionInstance`。
 */
export interface CodeLayoutGridInternal {
  [key: string]: any;
}

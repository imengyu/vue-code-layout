import type { CodeLayoutRootGrid } from "./RootGrid";
import type { CodeLayoutRegionInstance } from "./Region";
import type {
  CodeLayoutGroup,
  CodeLayoutPanel,
  CodeLayoutSavedData,
  CodeLayoutSavedGroup,
  CodeLayoutSavedPanel,
  CodeLayoutSavedRegion,
} from "../Types";

/**
 * saveLayout / loadLayout（版本 2，不兼容旧数据，见 plan.md §11.3，决策 C3）。
 *
 * 只序列化「区域内的组/面板树 + 运行时状态（权重/显隐/展开/激活）」，
 * 不序列化区域尺寸（区域尺寸的唯一存储位置是 `config.*Width` 等字段，解决 D7）。
 */

function saveRegion(region: CodeLayoutRegionInstance): CodeLayoutSavedRegion {
  return {
    name: region.name,
    activeGroupName: region.activeGroup?.name,
    children: region.children.map<CodeLayoutSavedGroup>((group) => ({
      name: group.name,
      title: group.title,
      tabStyle: group.tabStyle,
      weight: group.weight,
      visible: group.visible,
      noAutoShink: group.noAutoShink,
      activePanelName: group.activePanel?.name,
      children: group.children.map<CodeLayoutSavedPanel>((panel) => ({
        name: panel.name,
        title: panel.title,
        weight: panel.weight,
        visible: panel.visible,
        open: panel.open,
        showBadge: panel.showBadge,
      })),
    })),
  };
}

export function saveLayout(root: CodeLayoutRootGrid): CodeLayoutSavedData {
  return {
    version: 2,
    regions: {
      primarySideBar: saveRegion(root.primarySideBar),
      secondarySideBar: saveRegion(root.secondarySideBar),
      bottomPanel: saveRegion(root.bottomPanel),
    },
  };
}

/**
 * 判定一份数据是否是可加载的版本 2 数据。
 */
function isSavedDataV2(json: unknown): json is CodeLayoutSavedData {
  return (
    !!json &&
    typeof json === "object" &&
    (json as { version?: unknown }).version === 2 &&
    typeof (json as { regions?: unknown }).regions === "object"
  );
}

function loadRegion(
  region: CodeLayoutRegionInstance,
  saved: CodeLayoutSavedRegion | undefined,
  instantiate: (data: CodeLayoutPanel | CodeLayoutGroup) => CodeLayoutPanel | CodeLayoutGroup,
): void {
  if (!saved || !Array.isArray(saved.children)) return;

  for (const savedGroup of saved.children) {
    const groupDef = instantiate({
      name: savedGroup.name,
      title: savedGroup.title,
      tabStyle: savedGroup.tabStyle,
      size: savedGroup.weight,
      visible: savedGroup.visible,
      noAutoShink: savedGroup.noAutoShink,
    } as CodeLayoutGroup) as CodeLayoutGroup;

    const group = region.addGroup(groupDef);
    group.weight = savedGroup.weight;
    group.visible = savedGroup.visible;
    group.noAutoShink = savedGroup.noAutoShink;

    for (const savedPanel of savedGroup.children ?? []) {
      const panelDef = instantiate({
        name: savedPanel.name,
        title: savedPanel.title,
        size: savedPanel.weight,
        visible: savedPanel.visible,
        showBadge: savedPanel.showBadge,
      } as CodeLayoutPanel) as CodeLayoutPanel;

      const panel = group.addPanel(panelDef);
      panel.weight = savedPanel.weight;
      panel.visible = savedPanel.visible;
      panel.open = savedPanel.open;
      panel.showBadge = savedPanel.showBadge;
    }

    if (savedGroup.activePanelName) {
      const active = group.children.find((p) => p.name === savedGroup.activePanelName);
      if (active) group.setActivePanel(active);
    }
  }

  if (saved.activeGroupName) {
    const active = region.children.find((g) => g.name === saved.activeGroupName);
    if (active) region.setActiveGroup(active);
  }
}

export function loadLayout(
  root: CodeLayoutRootGrid,
  json: unknown,
  instantiate: (data: CodeLayoutPanel | CodeLayoutGroup) => CodeLayoutPanel | CodeLayoutGroup,
): boolean {
  if (!isSavedDataV2(json)) return false;

  root.clearLayout();
  loadRegion(root.primarySideBar, json.regions.primarySideBar, instantiate);
  loadRegion(root.secondarySideBar, json.regions.secondarySideBar, instantiate);
  loadRegion(root.bottomPanel, json.regions.bottomPanel, instantiate);
  return true;
}

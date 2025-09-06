import ContextMenu, { type MenuItem } from "@imengyu/vue3-context-menu";
import type { CodeLayoutConfig, CodeLayoutContext, CodeLayoutPanelInternal } from "../CodeLayout";
import { useCodeLayoutLang, type CodeLayoutLangDefine } from "../Language";
import { inject, type Ref } from "vue";

export const PanelMenuBuiltins : Record<string, PanelMenuRegistryItem> = {
  'toggleVisible': {
    create: (panel, t, data) => {
      return [
        { 
          label: `${t(panel.visible ? 'hide' : 'show')} '${panel.name}'`, 
          disabled: panel.noHide || data.showCount <= 1,
          onClick: () => {
            panel.visible = !panel.visible;
            panel.relayoutAfterToggleVisible();
          }
        }
      ]
    },
  },
  'toggleBadge': { 
    create: (panel, t, data) => {
      return [
        { 
          label: `${t(panel.showBadge ? 'hide' : 'show')} ${t('badge')}`,
          hidden: !panel.parentGroup?.getIsTopGroup(),
          divided: 'down',
          onClick: () => {
            panel.showBadge = !panel.showBadge;
          }
        }
      ]
    }
  },
  'otherPanelsCheck': { 
    create: (panel, t, data) => {
      return data.parentArray.map(othersPanel => {
        return {
          label: othersPanel.name,
          checked: othersPanel.visible,
          disabled: othersPanel.noHide || (data.showCount <= 1 && othersPanel.visible),
          onClick() {
            othersPanel.visible = !othersPanel.visible;
            othersPanel.relayoutAfterToggleVisible();
          },
        } as MenuItem
      })
    }
  },
  'panelPosition': { 
    create: (panel, t, data) => {
      return [
        ...((panel.parentGrid === 'primarySideBar' || (
          panel.parentGrid === 'secondarySideBar' && 
          !data.layoutConfig.value.secondarySideBarAsActivityBar)
        ) ? [
          { 
            label: t('activityBarPosition'),
            divided: 'up',
            children: [
              { 
                label: t('side'),
                checked: data.layoutConfig.value.activityBarPosition === 'side',
                onClick() { data.layoutConfig.value.activityBarPosition = 'side';}
              },
              { 
                label: t('top'),
                checked: data.layoutConfig.value.activityBarPosition === 'top',
                onClick() { data.layoutConfig.value.activityBarPosition = 'top';}
              },
              { 
                label: t('bottom'),
                checked: data.layoutConfig.value.activityBarPosition === 'bottom',
                onClick() { data.layoutConfig.value.activityBarPosition = 'bottom';}
              },
              { 
                label: t('hidden'),
                checked: data.layoutConfig.value.activityBarPosition === 'hidden',
                onClick() { data.layoutConfig.value.activityBarPosition = 'hidden';}
              },
            ]
          },
          ...(panel.parentGrid === 'secondarySideBar' ? [
            { 
              label: data.layoutConfig.value.primarySideBarPosition === 'left' ? 
                t('moveSecondarySideBarLeft') : t('moveSecondarySideBarRight'),
              onClick() {
                data.layoutConfig.value.primarySideBarPosition =
                  (data.layoutConfig.value.primarySideBarPosition === 'left') ? 'right' : 'left';
              }
            },
            { 
              label:`${t('hide')} ${t('secondarySideBar')}`,
              hidden: !data.layoutConfig.value.secondarySideBar,
              onClick() {
                data.context.relayoutTopGridProp('secondarySideBar', false);
              }
            },
          ] : [
            { 
              label: data.layoutConfig.value.primarySideBarPosition === 'left' ? 
                t('movePrimarySideBarRight') : t('movePrimarySideBarLeft'),
              onClick() {
                data.layoutConfig.value.primarySideBarPosition =
                  (data.layoutConfig.value.primarySideBarPosition === 'left') ? 'right' : 'left';
              }
            },
            { 
              label:`${t('hide')} ${t('primarySideBar')}`,
              hidden: !data.layoutConfig.value.primarySideBar,
              onClick() {
                data.context.relayoutTopGridProp('primarySideBar', false);
              }
            },
          ]),
        ] as MenuItem[] : []),
        ...((panel.parentGrid === 'secondarySideBar' && data.layoutConfig.value.secondarySideBarAsActivityBar) ? [
          { 
            label: t('secondaryActivityBarPosition'),
            divided: 'up',
            children: [
              { 
                label: t('side'),
                checked: data.layoutConfig.value.secondaryActivityBarPosition === 'side',
                onClick() { data.layoutConfig.value.secondaryActivityBarPosition = 'side';}
              },
              { 
                label: t('top'),
                checked: data.layoutConfig.value.secondaryActivityBarPosition === 'top',
                onClick() { data.layoutConfig.value.secondaryActivityBarPosition = 'top';}
              },
              { 
                label: t('bottom'),
                checked: data.layoutConfig.value.secondaryActivityBarPosition === 'bottom',
                onClick() { data.layoutConfig.value.secondaryActivityBarPosition = 'bottom';}
              },
              { 
                label: t('hidden'),
                checked: data.layoutConfig.value.secondaryActivityBarPosition === 'hidden',
                onClick() { data.layoutConfig.value.secondaryActivityBarPosition = 'hidden';}
              },
            ]
          },
          { 
            label: data.layoutConfig.value.primarySideBarPosition === 'left' ? 
              t('moveSecondarySideBarLeft') : t('moveSecondarySideBarRight'),
            onClick() {
              data.layoutConfig.value.primarySideBarPosition =
                (data.layoutConfig.value.primarySideBarPosition === 'left') ? 'right' : 'left';
            }
          },
          { 
            label:`${t('hide')} ${t('secondarySideBar')}`,
            hidden: !data.layoutConfig.value.primarySideBar,
            onClick() {
              data.context.relayoutTopGridProp('secondarySideBar', false);
            }
          },
        ] as MenuItem[] : []),
        ...(panel.parentGrid === 'bottomPanel' ? [ 
          { 
            label: t('panelPosition'),
            divided: 'up',
            children: [
              { 
                label: t('top'),
                checked: !data.layoutConfig.value.panelAlignment.endsWith('-side') && data.layoutConfig.value.panelPosition === 'top',
                onClick() { 
                  data.layoutConfig.value.panelPosition = 'top'; 
                  data.layoutConfig.value.panelAlignment = 'center';
                }
              },
              { 
                label: t('leftSide'),
                checked: data.layoutConfig.value.panelAlignment === 'left-side',
                onClick() { data.layoutConfig.value.panelAlignment = 'left-side'; }
              },
              { 
                label: t('rightSide'),
                checked: data.layoutConfig.value.panelAlignment === 'right-side',
                onClick() { data.layoutConfig.value.panelAlignment = 'right-side'; }
              },
              { 
                label: t('bottom'),
                checked: !data.layoutConfig.value.panelAlignment.endsWith('-side') && data.layoutConfig.value.panelPosition === 'bottom',
                onClick() { 
                  data.layoutConfig.value.panelPosition = 'bottom'; 
                  data.layoutConfig.value.panelAlignment = 'center';
                }
              },
            ]
          },
          { 
            label: t('alignPanel'),
            children: [
              { 
                label: t('center'),
                checked: data.layoutConfig.value.panelAlignment === 'center',
                onClick() { data.layoutConfig.value.panelAlignment = 'center';}
              },
              { 
                label: t('justify'),
                checked: data.layoutConfig.value.panelAlignment === 'justify',
                onClick() { data.layoutConfig.value.panelAlignment = 'justify';}
              },
              { 
                label: t('left'),
                checked: data.layoutConfig.value.panelAlignment === 'left',
                onClick() { data.layoutConfig.value.panelAlignment = 'left';}
              },
              { 
                label: t('right'),
                checked: data.layoutConfig.value.panelAlignment === 'right',
                onClick() { data.layoutConfig.value.panelAlignment = 'right';}
              },
            ]
          },
          { 
            label:`${t('hide')} ${t('panel')}`,
            hidden: !data.layoutConfig.value.bottomPanel,
            onClick() {
              data.context.relayoutTopGridProp('bottomPanel', false);
            }
          },
        ] as MenuItem[] : [])
      ]
    }
  },
}

export type PanelMenuRegistryItem = {
  /**
   * Create menu callback.
   * @param panel Panel instance.
   * @param t Language format function.
   * @param data External data.
   * @returns 
   */
  create: (
    panel: CodeLayoutPanelInternal, 
    t: (key: keyof CodeLayoutLangDefine) => string,
    data: {
      /**
       * Top context.
       */
      context: CodeLayoutContext,
      /**
       * CodeLayoutConfig.
       */
      layoutConfig: Ref<CodeLayoutConfig>,
      /**
       * Parent panel instance.
       */
      parent: CodeLayoutPanelInternal,
      /**
       * The array of this panel's parent.
       */
      parentArray: CodeLayoutPanelInternal[],
      /**
       * Visible panels count.
       */
      showCount: number,
    }
  ) => MenuItem[],
  /**
   * Insert index, default is push to end.
   */
  insertIndex?: number,
}

export function usePanelMenuControl() {

  const { t } = useCodeLayoutLang();
  const context = inject('codeLayoutContext') as CodeLayoutContext;
  const layoutConfig = inject('codeLayoutConfig') as Ref<CodeLayoutConfig>;

  function onContextMenu(panel: CodeLayoutPanelInternal|null, e: MouseEvent) {
    if (!panel)
      return;
    const parent = panel.getParent();
    if (!parent)
      return;
    const parentArray = parent.children;
    if (!parentArray)
      return;

    let showCount = 0;
    for (const iterator of parentArray)
      showCount += iterator.visible ? 1 : 0;

    e.preventDefault();
    e.stopPropagation();

    //Add menus
    const createMenuData = {
      context,
      layoutConfig,
      parent,
      parentArray,
      showCount,
    };
    const items: MenuItem[] = [];
    for (const key in PanelMenuBuiltins)
      if (layoutConfig.value.menuConfigs.builtinMenus.includes(key))
        items.push(...PanelMenuBuiltins[key].create(panel, t, createMenuData)) 
    for (const item of layoutConfig.value.menuConfigs.customMenus) {
      const iitems = item.create(panel, t, createMenuData)
      if (typeof item.insertIndex === 'number')
        items.splice(item.insertIndex, 0, ...iitems);
      else
        items.push(...iitems);
    }

    //Show context menu
    ContextMenu.showContextMenu({
      x: e.x,
      y: e.y,
      theme: 'code-layout',
      items 
    });
  }

  return {
    onContextMenu,
  }
}
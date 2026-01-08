import { computed, inject, onBeforeUnmount, onMounted, provide, ref, type Ref } from "vue";
import type { CodeLayoutConfig, CodeLayoutDragDropReferencePosition, CodeLayoutPanelInternal } from "../CodeLayout";
import HtmlUtils from '../Utils/HtmlUtils';
import { createMiniTimeOut } from "./MiniTimeout";
import { useDragEnterLeaveFilter } from "./DragEnterLeaveFilter";

export function checkDropPanelDefault(
  dragPanel: CodeLayoutPanelInternal,
  referencePanel: CodeLayoutPanelInternal,
  dragOverState: Ref<CodeLayoutDragDropReferencePosition>,
) {
  return (
    dragPanel !== referencePanel
    && (!dragPanel.accept || dragPanel.accept.includes(referencePanel.parentGrid))
    && (!dragPanel.preDropCheck || dragPanel.preDropCheck(dragPanel, referencePanel.parentGrid, referencePanel, dragOverState.value))
  );
}

const dragEndEventDispatch : (() => void)[] = [];
const currentDragPanels : CodeLayoutPanelInternal[] = [];

function dispatchAllDragEndEvent() {
  for (const f of dragEndEventDispatch) {
    f();
  }
}
function clearAllCurrentDragPanels() {
  currentDragPanels.splice(0, currentDragPanels.length);
}

//获取当前的拖拽面板
export function getCurrentDragPanel() {
  return currentDragPanels[0] || null;
}
export function getCurrentDragExternalPanels() {
  return currentDragPanels.length > 0 ? currentDragPanels : null;
}

export const FLAG_CODE_LAYOUT = 'CodeLayout';
export const FLAG_SPLIT_LAYOUT = 'SplitLayout';
export const SYMBOL_DRAG_FLAG = Symbol('codeLayoutDragFlag');

export function usePanelDraggerRoot(key: string) {
  const dragPanelState = ref(false);

  provide(SYMBOL_DRAG_FLAG, key);
  provide('dragPanelState', dragPanelState);
  provide('setDragPanelState', () => dragPanelState.value = true);
  provide('resetDragPanelState', () => dragPanelState.value = false);
}

//拖拽开始函数封装
export function usePanelDragger(config?: {
  onBeforeDragAddPanels?: () => CodeLayoutPanelInternal[],
  onDragEnd?: () => void,
  onDragStart?: () => void,
}) {
  const dragPanelState = inject('dragPanelState') as Ref<boolean>;
  const setDragPanelState = inject('setDragPanelState') as () => void;
  const resetDragPanelState = inject('resetDragPanelState') as () => void;
  const layoutConfig = inject('codeLayoutConfig', undefined) as Ref<CodeLayoutConfig>|undefined;
  const cornerSize = 40;
  const dragSelfState = ref(false);

  function draggingMouseMoveHandler(e: MouseEvent) {    
    if (layoutConfig) {
      if (e.x < cornerSize) {
        layoutConfig.value.primarySideBar = true;
      } 
      if (e.x >= window.innerWidth - cornerSize) {
        layoutConfig.value.secondarySideBar = true;
      }
      if (e.y >= window.innerHeight - cornerSize) {
        layoutConfig.value.bottomPanel = true;
      }
    }
  }
  function handleDragStart(panel: CodeLayoutPanelInternal, ev: DragEvent) {
    config?.onDragStart?.();
    if (config?.onBeforeDragAddPanels) {
      const panels = config.onBeforeDragAddPanels();
      for (const p of panels) {
        if (!currentDragPanels.includes(p))
          currentDragPanels.push(p);
      }
    }
    if (!currentDragPanels.includes(panel))
      currentDragPanels.push(panel);
    const userCancel = layoutConfig?.value?.onStartDrag?.(currentDragPanels) ?? false;
    if (userCancel) {
      clearAllCurrentDragPanels();
      return;
    }
    ev.stopPropagation();
    (ev.target as HTMLElement).classList.add("dragging");
    dragSelfState.value = true;
    dispatchAllDragEndEvent();
    setDragPanelState();
    document.addEventListener('dragover', draggingMouseMoveHandler);
  }
  function handleDragEnd(ev: DragEvent) {
    if (currentDragPanels.length > 0) {
      layoutConfig?.value?.onEndDrag?.(currentDragPanels);
      clearAllCurrentDragPanels();
    }
    (ev.target as HTMLElement).classList.remove("dragging");
    dragSelfState.value = false;
    resetDragPanelState();
    document.removeEventListener('dragover', draggingMouseMoveHandler);
    config?.onDragEnd?.();
    dispatchAllDragEndEvent();
  }
  return {
    dragSelfState,
    handleDragStart,
    handleDragEnd,
  }
}

//拖拽进入和悬浮效果控制
export function usePanelDragOverDetector(
  container: Ref<HTMLElement|undefined>,
  selfPanel: Ref<CodeLayoutPanelInternal>|undefined,
  horizontal: Ref<boolean>|'four'|'center',
  focusPanel: (dragPanel: CodeLayoutPanelInternal) => void,
  dragCustomHandler: (e: DragEvent) => boolean,
  dragoverChecking?: ((dragPanel: CodeLayoutPanelInternal) => boolean)|undefined,
  tag?: string,
) {
  
  const codeLayoutDragFlag = inject(SYMBOL_DRAG_FLAG, '');
  const dragPanelState = inject('dragPanelState') as Ref<boolean>;
  const resetDragPanelState = inject('resetDragPanelState') as () => void;
  const dragEnterState = ref(false);
  const dragOverState = ref<CodeLayoutDragDropReferencePosition>('');
  const focusTimer = createMiniTimeOut(600, () => {
    const drag = getCurrentDragPanel();
    if (drag != null)
      focusPanel(drag);
  });
  const delayLeaveTimer = createMiniTimeOut(200, () => {
    dragOverState.value = '';
  });
  let currentDropBaseScreenPosX = 0;
  let currentDropBaseScreenPosY = 0;

  const {
    onDragEnter: handleDragEnter,
    onDragLeave: handleDragLeave,
    reset: handleDragReset,
  } = useDragEnterLeaveFilter((e) => {
    focusTimer.start();
    delayLeaveTimer.stop();

    currentDropBaseScreenPosX = HtmlUtils.getLeft(container.value!);
    currentDropBaseScreenPosY = HtmlUtils.getTop(container.value!);
    dragOverState.value = '';
    dragEnterState.value = true;

    handleDragOver(e);    
  }, (e) => {
    dragEnterState.value = false;
    dragOverState.value = '';
    focusTimer.stop();
    delayLeaveTimer.start();
  }, container, 'CodeLayoutDragDropDetector')

  function handleDragOver(e: DragEvent) {
    if (!e.dataTransfer)
      return;

    delayLeaveTimer.stop();
  
    //检查面板，必须存在面板
    const panel = getCurrentDragPanel();
    if (!panel) {
      dragOverState.value = '';
      e.dataTransfer.dropEffect = 'none';
      return;
    }
    //面板来源必须一致不能混用
    if (panel.sourceFlag != codeLayoutDragFlag) {
      dragOverState.value = '';
      e.dataTransfer.dropEffect = 'none';
      return;
    }

    // 如果是内部拖拽数据，则不应该让浏览器处理弹出窗口
    e.preventDefault();

    //检查面板，面板并且不能是自己或者自己的父级
    if (
      (
        selfPanel && panel !== selfPanel.value 
        && !panel.children.includes(selfPanel.value)
        && (!dragoverChecking || dragoverChecking(panel))
      )
      || dragCustomHandler(e)
    ) {
      e.stopPropagation();
      e.dataTransfer.dropEffect = 'copy';

      if (!container.value)
        return;

      if (horizontal === 'four') {
        const posX = (e.x - currentDropBaseScreenPosX);
        const posY = (e.y - currentDropBaseScreenPosY);

        if (posX < container.value.offsetWidth / 4) {
          dragOverState.value = 'left';
        } else if (posX > container.value.offsetWidth - container.value.offsetWidth / 4) {
          dragOverState.value = 'right';
        } else if (posY < container.value.offsetHeight / 4) {
          dragOverState.value = 'up';
        } else if (posY > container.value.offsetHeight - container.value.offsetHeight / 4) {
          dragOverState.value = 'down';
        } else  {
          dragOverState.value = 'center';
        } 
      } else if (horizontal === 'center') {
        dragOverState.value = 'center';
      } else if (horizontal) {
        const pos = (horizontal.value ? 
          (e.x - currentDropBaseScreenPosX) : 
          (e.y - currentDropBaseScreenPosY)
        ) ;
        dragOverState.value = (pos > (horizontal.value ? 
          container.value.offsetWidth : 
          container.value.offsetHeight) / 2
        ) ? 
          (horizontal.value ? 'right' : 'down')
           : (horizontal.value ? 'left' : 'up');
      } else {
        dragOverState.value = '';
        e.dataTransfer.dropEffect = 'none';
      }

    }
  }
  function resetDragOverState() {
    handleDragReset();
    focusTimer.stop();
    dragEnterState.value = false;
    dragOverState.value = '';
  }
  function resetDragState() {
    handleDragReset();
    resetDragPanelState();
  }

  const dragLightBoxState = computed(() => {
    return dragEnterState.value && dragOverState.value !== '';
  });

  function globalReset() {
    resetDragOverState();
    resetDragState();
  }

  onMounted(() => {
    dragEndEventDispatch.push(globalReset) 
  });
  onBeforeUnmount(() => {
    const index = dragEndEventDispatch.indexOf(globalReset);
    if (index > -1)
      dragEndEventDispatch.splice(index, 1); 
  })

  return {
    dragPanelState,
    dragEnterState,
    dragLightBoxState,
    dragOverState,
    handleDropPreCheck(e: DragEvent) {
      return dragCustomHandler(e);
    },
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    resetDragOverState,
    resetDragState,
  }
}
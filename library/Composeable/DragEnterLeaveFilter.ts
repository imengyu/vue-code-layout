import type { Ref } from "vue";
import { SimpleDelay } from "../Utils/Timer/Timer";

const globalDragStateHolder = new Map<string, DragStateHolder>();

interface DragStateHolder {
  element: Ref<HTMLElement|undefined>,
  forceLeave: (e: DragEvent) => void,
}

/**
 * 筛选反人类的 dragenter、dragleave事件，以保证在进入子节点后不会触发dragleave事件
 * @param ref 
 * @param onEnter 
 * @param onLeave 
 * @returns 
 */
export function useDragEnterLeaveFilter(
  onEnter: (e: DragEvent) => void,
  onLeave: (e: DragEvent) => void,
  element: Ref<HTMLElement|undefined>,
  storageHolderTag?: string,
) {

  const delayLeaveTimer = new SimpleDelay(undefined, () => {
    lockLeaveState--;
    if (lockLeaveState > 0)
      delayLeaveTimer.start();
  }, 0);

  let lockLeaveState = 0;
  let enterState = false;

  function reset() {
    lockLeaveState = 0;
    enterState = false;
    removeFromHolder();
  }

  const holder : DragStateHolder = {
    element,
    forceLeave: (e: DragEvent) => {
      onDragLeave(e);
    },
  }

  function addToHolder(e: DragEvent) {
    if (storageHolderTag) {
      const oldHolder = globalDragStateHolder.get(storageHolderTag);
      if (oldHolder && oldHolder.element.value !== element.value)
        oldHolder.forceLeave(e);
      globalDragStateHolder.set(storageHolderTag, holder);
    }
  }
  function removeFromHolder() {
    if (storageHolderTag) {
      const oldHolder = globalDragStateHolder.get(storageHolderTag);
      if (oldHolder && oldHolder === holder) 
        globalDragStateHolder.delete(storageHolderTag);
    }
  }

  //在进入子节点时，先会触发一次子节点的dragenter，
  //再触发一次之前节点dragleave
  //所以这里会用延时筛掉这次无效的dragleave

  function onDragEnter(e: DragEvent) {
    if (enterState) {
      lockLeaveState++;
      delayLeaveTimer.start();
      return;
    }
    enterState = true;
    onEnter(e);
    addToHolder(e);
  }

  function onDragLeave(e: DragEvent) {
    if (lockLeaveState > 0)
      return;
    if (!enterState)
      return;
    enterState = false;
    
    onLeave(e);
    removeFromHolder();
  }

  return {
    onDragEnter,
    onDragLeave,
    reset,
  }
}
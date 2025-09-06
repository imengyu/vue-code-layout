
let showDelayTimer = 0;
let hideDelayTimer = 0;
let showState = false;

export function useSimpleTooltipDelayLock() {

  let leaveState = false;

  function onEnter(cb: () => void) {
    leaveState = false;
    if (hideDelayTimer > 0) {
      clearTimeout(hideDelayTimer);
      hideDelayTimer = 0;
    }
    if (showState) {
      cb();
      return;
    }
    if (showDelayTimer > 0) 
      clearTimeout(showDelayTimer);
    showDelayTimer = setTimeout(() => {
      if (!leaveState) {
        cb();
        showState = true;
      }
    }, 650) as any;
  }
  function onLeave() {
    if (hideDelayTimer > 0) 
      clearTimeout(hideDelayTimer);
    if (showDelayTimer > 0)  {
      clearTimeout(showDelayTimer);
      showDelayTimer = 0;
    }
    hideDelayTimer = setTimeout(() => {
      showState = false;
      leaveState = true;
    }, 250) as any;
  }

  return {
    onEnter,
    onLeave,
  }
}
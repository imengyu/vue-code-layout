import { inject, onBeforeUnmount, onMounted, provide } from "vue";

type ShortcutCallback = () => void;
export interface ShortcutConfig {
  id?: number;
  /**
   * Main Key
   */
  key: string;
  /**
   * Is trigger in keydown event, otherwise in keyup event.
   * @default false
   */
  keyDown?: boolean;
  /**
   * Need Ctrl key be pressed
   * @default false
   */
  keyControl?: boolean;
  /**
   * Need CAltrl key be pressed
   * @default false
   */
  keyAlt?: boolean;
  /**
   * Need Shift key be pressed
   * @default false
   */
  keyShift?: boolean;
  /**
   * Handler Callback
   */
  callback: ShortcutCallback;
}

export const KeyBorardControllerSymbol = Symbol('KeyBoardController');

export interface KeyBoardController {
  onKeyDown: (e: KeyboardEvent) => void;
  onKeyUp: (e: KeyboardEvent) => void;
  isKeyAltDown: () => boolean;
  isKeyShiftDown: () => boolean;
  isKeyControlDown: () => boolean;
  registerShortcut(config: ShortcutConfig): number;
  unregisterShortcut(id: number): void; 
}

export function useKeyBoardControllerTop() : KeyBoardController {
  
  let keyControlDown = false;
  let keyShiftDown = false;
  let keyAltDown = false;

  let shortcutsLastId = 0;
  const shortcuts = new Map<string, ShortcutConfig>();

  function onKeyDown(e : KeyboardEvent) {
    switch(e.code) {
      case 'ShiftRight':
      case 'ShiftLeft':
        keyShiftDown = true;
        break;
      case 'ControlRight':
      case 'ControlLeft':
        keyControlDown = true;
        break;
      case 'AltRight':
      case 'AltLeft':
        keyAltDown = true;
        break;
      default: {
        const shortcut = shortcuts.get(e.code);
        if (
          shortcut && !shortcut.keyDown
          && (
            (!shortcut.keyAlt || keyAltDown)
            || (!shortcut.keyShift || keyShiftDown)
            || (!shortcut.keyControl || keyControlDown)
          )
        )
          shortcut.callback();
        break;
      }
    }
  }
  function onKeyUp(e : KeyboardEvent) {
    switch(e.code) {
      case 'ShiftRight':
      case 'ShiftLeft':
        keyShiftDown = false;
        break;
      case 'ControlRight':
      case 'ControlLeft':
        keyControlDown = false;
        break;
      case 'AltRight':
      case 'AltLeft':
        keyAltDown = false;
        break;
      default: {
        const shortcut = shortcuts.get(e.code);
        if (
          shortcut && shortcut.keyDown
          && (
            (!shortcut.keyAlt || keyAltDown)
            || (!shortcut.keyShift || keyShiftDown)
            || (!shortcut.keyControl || keyControlDown)
          )
        )
          shortcut.callback();
        break;
      }
    }

  }

  onMounted(() => {
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
  });
  onBeforeUnmount(() => {
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('keyup', onKeyUp);
  });

  const topCotext = inject(KeyBorardControllerSymbol, undefined);

  const context = {
    isKeyAltDown: () => keyAltDown,
    isKeyShiftDown: () => keyShiftDown,
    isKeyControlDown: () => keyControlDown,
    registerShortcut(config: ShortcutConfig) {
      const id = ++ shortcutsLastId;
      config.id = id;
      shortcuts.set(config.key, config);
      return id;
    },
    unregisterShortcut(id: number) {
      for (const element of shortcuts) {
        if (element[1].id === id)  {
          shortcuts.delete(element[0]);
          break;
        }
      }
    },
  }

  provide(KeyBorardControllerSymbol, topCotext ?? context);

  return {
    onKeyDown,
    onKeyUp,
    ...context,
  }
}

export function useKeyBoardController() : KeyBoardController {
  return inject(KeyBorardControllerSymbol, undefined) as unknown as KeyBoardController;
}
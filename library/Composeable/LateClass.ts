import { markRaw } from "vue";

export type  LateClassCallback = (...args: any[]) => any;

/**
 * 用于将对象发生上的调用进行延迟发送
 */
export class LateClass {
  private _lateNotifyCallbacks = markRaw(new Map<string, LateClassCallback>());
  private _lateNotifyItems : {
    name: string,
    args: any[],
    resolve: (d: any) => void,
    reject: (e: any) => void,
  }[] = markRaw([]);

  listenLateAction(name: string, cb: LateClassCallback) {
    this._lateNotifyCallbacks.set(name, cb);
    this.applyLateActions(name);
  }
  unlistenLateAction(name: string) {
    this._lateNotifyCallbacks.delete(name);
  }
  unlistenAllLateAction() {
    this._lateNotifyCallbacks.clear();
  }
  applyLateActions(name: string) {
    const cb = this._lateNotifyCallbacks.get(name);
    if (cb) {
      for(let i = this._lateNotifyItems.length - 1; i >= 0; i--) {
        const iterator = this._lateNotifyItems[i];
        if (iterator.name === name) {
          try {
            iterator.resolve(cb(...iterator.args));
          } catch (e) {
            iterator.reject(e);
          }
          this._lateNotifyItems.splice(i, 1);
        }
      }
    }
  }

  pushLateAction(name: string, ...args: any[]) : Promise<any> {
    const cb = this._lateNotifyCallbacks.get(name);
    if (cb) {
      try {
        return Promise.resolve(cb(...args));
      } catch (e) {
        return Promise.reject(e);
      }
    }
    else {
      return new Promise<any>((resolve, reject) => {
        const instance = { name, args, resolve, reject };
        this._lateNotifyItems.push(instance);
      });
    }
  }
}
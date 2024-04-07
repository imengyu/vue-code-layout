/**
 * 简易浏览器端使用的 EventEmitter
 */
export class EventEmitter {

  private listeners = new Map<string, Function[]>;
  private anyHandler : ((event: string, args: any[]) => any) |null = null;

  /**
   * 监听事件
   * @param event 事件名称
   * @param cb 回调函数
   * @returns 
   */
  public on(event: string, cb: Function) : this {
    let array = this.listeners.get(event);
    if (!array)
      array = [];
    if (!array.includes(cb))
      array.push(cb);
    this.listeners.set(event, array);
    return this;
  }
  /**
   * 监听全部事件。
   * 此回调只能设置一个，设置后，其他通过 on 函数设置的监听器无效。
   * @returns 
   */
  public any(cb: (event: string, args: any[]) => any) : this {
    this.anyHandler = cb;
    return this;
  }
  /**
   * 触发事件
   * @param event 事件名称
   * @param a 事件参数
   * @returns 
   */
  public emit(event: string, ...a: any[]) : this {
    const args = Array.prototype.slice.call(arguments);

    if (this.anyHandler) {
      this.anyHandler(event, args);
      return this;
    }

    const array = this.listeners.get(event);
    args.shift();
    if (array) {
      array.forEach(cb => {
        cb.apply(null, args);
      });
    }
    return this;
  }
  /**
   * 触发异步事件，并获取返回值
   * @param event 事件名称
   * @param a 事件参数
   * @returns 如果有多个事件监听器，则返回包含所有事件监听器返回值的数组。如果只有一个事件监听器，返回此监听器返回值。
   */
  public async emitAsync(event: string, ...a: any[]) : Promise<any> {
    const args = Array.prototype.slice.call(arguments);

    if (this.anyHandler)
      return await this.anyHandler(event, args);

    const array = this.listeners.get(event);
    args.shift();
    if (array) {
      let result : any[] = [];
      for (const cb of array) 
        result.push(await cb.apply(null, args));
      return result.length === 1 ? result[0] : result;
    }
    return undefined;
  }
  /**
   * 取消监听事件
   * @param event 事件名称
   * @param listener 监听器，如果为空，则移除全部监听器
   */
  public off(event: string, listener?: Function|undefined) {
    if (!listener) {
      this.clear(event);
      return;
    }
    const array = this.listeners.get(event);
    if (array) {
      const index = array.indexOf(listener);
      if (index !== -1)
        array.splice(index, 1);
    }
  }
  /**
   * 监听一次事件
   * @param event 事件名
   * @param listener 监听器
   * @returns 
   */
  public once(event: string, listener: Function) : this {
    const self = this;

    function handler() {
      const args = Array.prototype.slice.call(arguments);
      listener.apply(null, args);
      self.off(event, handler);
    }

    this.on(event, handler);
    return this;
  }
  /**
   * 清除指定事件监听器
   * @param event 事件名
   */
  public clear(event: string) {
    this.listeners.delete(event);
  }
  /**
   * 获取事件监听器
   * @param event 
   * @returns 
   */
  public get(event: string) {
    return this.listeners.get(event);
  }
}

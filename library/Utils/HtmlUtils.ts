export default {
  getTop,
  getLeft,
  getElementIndex,
  getElementAbsolutePositionInParent,
};

/**
 * 获取元素的绝对纵坐标
 * @param e 元素
 * @param stopClass 递归向上查找，遇到指定类的父级时停止
 */
function getTop(e: HTMLElement, stopClassOrEle ? : string|HTMLElement) : number {
  let offset = e.offsetTop;
  const parent = e.offsetParent as HTMLElement;
  if (
    e.offsetParent !== null && (
      !stopClassOrEle 
      || (typeof stopClassOrEle === 'string' ? 
        !parent.classList.contains(stopClassOrEle) :
        e.offsetParent !== stopClassOrEle
      )
    )
  ) 
    offset += getTop(parent, stopClassOrEle) - parent.scrollTop;
  return offset;
}
/**
 * 获取元素的绝对横坐标
 * @param e 元素
 * @param stopClass 递归向上查找，遇到指定类的父级时停止
 */
function getLeft(e: HTMLElement, stopClassOrEle ? : string|HTMLElement) : number {
  let offset = e.offsetLeft;
  const parent = e.offsetParent as HTMLElement;
  if (
    e.offsetParent !== null && (
      !stopClassOrEle 
      || (typeof stopClassOrEle === 'string' ? 
        !parent.classList.contains(stopClassOrEle) :
        e.offsetParent !== stopClassOrEle
      )
    )
  ) 
    offset += getLeft(parent, stopClassOrEle) - parent.scrollLeft;
    
  return offset;
}

/**
 * 获取元素在指定父级的绝对坐标
 * @param e 元素
 * @param parent 计算的父级，未指定则是body
 * @returns 
 */
function getElementAbsolutePositionInParent(e: HTMLElement, parent: HTMLElement|undefined) {
  return {
    x: getLeft(e, parent),
    y: getTop(e, parent),
  }
}

/**
 * 获取一个元素在它父元素的DOM树位置
 * @param element 元素
 * @returns 索引，如果没有，则返回-1
 */
function getElementIndex(element: HTMLElement) : number {
  for (let i = 0, c = (element.parentNode as HTMLElement).childNodes.length; i < c; i++)
    if ((element.parentNode as HTMLElement).childNodes.item(i) === element) return i;
  return -1;
}

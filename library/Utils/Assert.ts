
/**
 * 断言条件为true
 * @param condition 要断言的条件
 * @param message 断言失败时的错误信息
 */
export function assert(condition: boolean, message?: string): asserts condition {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}
/**
 * 断言对象不为null
 * @param obj 要断言的对象
 * @param message 断言失败时的错误信息
 */
export function assertNotNull<T>(obj: T, message?: string): asserts obj is NonNullable<T> {
  if (obj === null || obj === undefined) {
    throw new Error(message || 'Object is null or undefined');
  }
}
/**
 * 断言对象不为null
 * @param obj 要断言的对象
 * @param message 断言失败时的错误信息
 */
export function requireNotNull<T>(obj: T, message?: string): NonNullable<T> {
  if (obj === null || obj === undefined) {
    throw new Error(message || 'Object is null or undefined');
  }
  return obj;
}

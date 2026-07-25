import { ref, onMounted, onBeforeUnmount } from 'vue';

/**
 * 页面数据本地存储工具
 * @param saveName 保存名称，用于区分不同的存储数据
 * @param initialValue 初始值
 * @returns 包含保存、加载和数据引用的对象
 */
export function useLocalStorage(
  saveName: string, initialValue: object|null, 
  onLoad?: (data: object|null) => void, 
  onSave?: (data: object|null) => object|null|undefined
) {
  const data = ref<object|null>(initialValue);
  
  /**
   * 保存数据到本地存储
   */
  const saveData = () => {
    try {
      const newData = onSave?.(data.value as any);
      if (newData !== undefined) {
        data.value = newData;
      }
      localStorage.setItem(saveName, JSON.stringify(data.value));
    } catch (error) {
      console.error(`保存数据失败 (${saveName}):`, error);
    }
  };
  
  /**
   * 从本地存储加载数据
   */
  const loadData = () => {
    try {
      const savedData = localStorage.getItem(saveName);
      if (savedData)
        data.value = JSON.parse(savedData);
      onLoad?.(data.value || initialValue);
    } catch (error) {
      console.error(`加载数据失败 (${saveName}):`, error);
    }
  };
  
  /**
   * 清除本地存储中的数据
   */
  const clearData = () => {
    try {
      localStorage.removeItem(saveName);
      data.value = initialValue;
      onLoad?.(initialValue);
    } catch (error) {
      console.error(`清除数据失败 (${saveName}):`, error);
    }
  };
  
  // 页面加载时自动加载数据
  onMounted(() => {
    setTimeout(() => loadData(), 200);
    window.addEventListener('beforeunload', saveData);
  });
  
  // 页面卸载前自动保存数据
  onBeforeUnmount(() => {
    window.removeEventListener('beforeunload', saveData);
    saveData();
  });
  
  return {
    data,
    saveData,
    loadData,
    clearData
  };
}

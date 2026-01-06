<template>
  <div class="drag-drop-test">
    <h3>Vue3 拖放测试组件</h3>
    
    <!-- 拖放区域 -->
    <div 
      ref="dropAreaRef"
      class="drop-area"
      :class="{ active: isDragOver }"
      @dragover.prevent="handleDragOver"
      @dragenter.prevent="handleDragEnter"
      @dragleave="handleDragLeave"
      @drop.prevent="handleDrop"
    >
      <p v-if="!dropData.length">将文件、文本或链接拖放到此区域</p>
      <p v-else>已放置 {{ dropData.length }} 项数据 ↓</p>
    </div>

    <!-- 放置数据展示区 -->
    <div class="drop-data-display" v-if="dropData.length">
      <h4>放置数据详情：</h4>
      <div 
        class="data-item" 
        v-for="(item, index) in dropData" 
        :key="index"
      >
        <div class="data-header">
          <span class="data-type" :class="item.type">{{ item.type }}</span>
          <button @click="removeItem(index)">×</button>
        </div>
        
        <!-- 文本/链接类型 -->
        <div v-if="item.type === 'text' || item.type === 'link'" class="data-content">
          <p><strong>内容：</strong>{{ item.content }}</p>
        </div>
        
        <!-- 文件类型 -->
        <div v-if="item.type === 'file'" class="data-content">
          <p><strong>文件名：</strong>{{ item.content.name }}</p>
          <p><strong>大小：</strong>{{ formatFileSize(item.content.size) }}</p>
          <p><strong>类型：</strong>{{ item.content.type || '未知' }}</p>
          <p><strong>路径：</strong>{{ item.content.path || '浏览器环境无路径' }}</p>
        </div>
        
        <!-- 其他类型 -->
        <div v-if="item.type === 'other'" class="data-content">
          <p><strong>原始数据：</strong>{{ JSON.stringify(item.content) }}</p>
        </div>
      </div>
      
      <button class="clear-btn" @click="clearAll">清空所有数据</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue';

// 拖放区域DOM引用
const dropAreaRef = ref(null);
// 是否有拖拽元素悬停在区域上
const isDragOver = ref(false);
// 存储放置的数据列表
const dropData = ref([]);

// 处理拖拽元素进入区域
const handleDragEnter = (e) => {
  // 防止重复触发（多子元素时）
  if (e.dataTransfer.effectAllowed !== 'none') {
    isDragOver.value = true;
  }
};

// 处理拖拽元素离开区域
const handleDragLeave = (e) => {
  // 检查是否真的离开区域（不是进入子元素）
  if (!dropAreaRef.value.contains(e.relatedTarget)) {
    isDragOver.value = false;
  }
};

// 处理拖拽元素在区域上移动（必须阻止默认行为才能触发drop）
const handleDragOver = (e) => {
  e.preventDefault();
  e.stopPropagation();
  // 设置允许放置的操作类型
  e.dataTransfer.dropEffect = 'copy';
};

// 处理放置事件
const handleDrop = (e) => {
  e.preventDefault();
  isDragOver.value = false;
  
  const dataTransfer = e.dataTransfer;
  const newData = [];

  // 1. 处理文件
  if (dataTransfer.files.length) {
    Array.from(dataTransfer.files).forEach(file => {
      newData.push({
        type: 'file',
        content: file
      });
    });
  } 
  // 2. 处理文本/链接
  else if (dataTransfer.getData('text')) {
    const text = dataTransfer.getData('text');
    // 判断是否为链接
    const isLink = /^https?:\/\/.+/.test(text);
    newData.push({
      type: isLink ? 'link' : 'text',
      content: text
    });
  } 
  // 3. 其他类型数据
  else {
    newData.push({
      type: 'other',
      content: dataTransfer.types.reduce((acc, type) => {
        acc[type] = dataTransfer.getData(type);
        return acc;
      }, {})
    });
  }

  // 添加到数据列表
  dropData.value = [...dropData.value, ...newData];
};

// 格式化文件大小（字节转KB/MB）
const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
};

// 移除单个数据项
const removeItem = (index) => {
  dropData.value.splice(index, 1);
};

// 清空所有数据
const clearAll = () => {
  dropData.value = [];
};

// 组件卸载时清理状态
onUnmounted(() => {
  isDragOver.value = false;
  dropData.value = [];
});
</script>

<style scoped>
.drag-drop-test {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.drop-area {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 60px 20px;
  text-align: center;
  margin: 20px 0;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #f9f9f9;
}

.drop-area.active {
  border-color: #42b983;
  background-color: #f0fdf4;
  transform: scale(1.02);
}

.drop-data-display {
  margin-top: 30px;
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.data-item {
  padding: 15px;
  margin: 10px 0;
  background-color: white;
  border-radius: 6px;
  border-left: 4px solid #ccc;
}

.data-type {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: white;
}

.data-type.file {
  background-color: #42b983;
  border-left-color: #42b983;
}

.data-type.link {
  background-color: #3498db;
  border-left-color: #3498db;
}

.data-type.text {
  background-color: #9b59b6;
  border-left-color: #9b59b6;
}

.data-type.other {
  background-color: #f39c12;
  border-left-color: #f39c12;
}

.data-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.data-header button {
  background: transparent;
  border: none;
  color: #999;
  font-size: 16px;
  cursor: pointer;
  padding: 0 6px;
}

.data-header button:hover {
  color: #e74c3c;
}

.data-content {
  font-size: 14px;
  line-height: 1.6;
  color: #333;
}

.clear-btn {
  margin-top: 20px;
  padding: 8px 16px;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.clear-btn:hover {
  background-color: #c0392b;
}
</style>
import { defineStore } from "pinia";
import { ref } from "vue";

export const useAppStore = defineStore("app", () => {
  // 需要缓存的视图
  const cacheViews = ref<string[]>(["Home"]);

  // 添加缓存视图
  const addCacheView = (name: string) => {
    if (!cacheViews.value.includes(name)) {
      cacheViews.value.push(name);
    }
  };

  // 移除缓存视图
  const removeCacheView = (name: string) => {
    const index = cacheViews.value.indexOf(name);
    if (index > -1) {
      cacheViews.value.splice(index, 1);
    }
  };

  // 清空缓存视图
  const clearCacheViews = () => {
    cacheViews.value = [];
  };

  return {
    cacheViews,
    addCacheView,
    removeCacheView,
    clearCacheViews,
  };
});

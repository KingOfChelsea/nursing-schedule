import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useTagsViewStore = defineStore('tagsView', () => {
  // 已访问的标签页列表
  const visitedViews = ref([])
  
  // 缓存的页面名称列表（用于 keep-alive）
  const cachedViews = ref([])

  // 获取所有标签页
  const getVisitedViews = computed(() => visitedViews.value)
  
  // 获取所有缓存页面
  const getCachedViews = computed(() => cachedViews.value)

  // 添加标签页
  function addView(view) {
    // 检查是否已存在相同路径的标签
    const hasView = visitedViews.value.some(v => v.path === view.path)
    
    if (!hasView) {
      // 添加新标签
      visitedViews.value.push({
        name: view.name,
        path: view.path,
        title: view.title || '未命名'
      })
      
      // 如果有组件名称，添加到缓存
      if (view.name) {
        addCachedView(view.name)
      }
    }
  }

  // 添加缓存页面
  function addCachedView(name) {
    if (typeof name !== 'string') return
    
    if (!cachedViews.value.includes(name)) {
      cachedViews.value.push(name)
    }
  }

  // 删除标签页
  function removeView(path) {
    // 找到要删除的视图
    const view = visitedViews.value.find(v => v.path === path)
    
    if (view) {
      // 从标签列表中移除
      visitedViews.value = visitedViews.value.filter(v => v.path !== path)
      
      // 从缓存中移除
      if (view.name) {
        removeCachedView(view.name)
      }
    }
  }

  // 删除缓存页面
  function removeCachedView(name) {
    cachedViews.value = cachedViews.value.filter(n => n !== name)
  }

  // 删除其他所有标签页（保留当前）
  function removeOtherViews(currentView) {
    visitedViews.value = visitedViews.value.filter(v => {
      if (v.path === currentView.path) return true
      if (v.name) removeCachedView(v.name)
      return false
    })
  }

  // 删除所有标签页（保留首页）
  function removeAllViews() {
    const homeView = visitedViews.value.find(v => v.path === '/')
    
    visitedViews.value = homeView ? [homeView] : []
    cachedViews.value = homeView?.name ? [homeView.name] : []
  }

  // 删除所有缓存
  function delAllCachedViews() {
    cachedViews.value = []
  }

  // 更新标签标题
  function updateViewTitle(path, newTitle) {
    const view = visitedViews.value.find(v => v.path === path)
    if (view) {
      view.title = newTitle
    }
  }

  return {
    visitedViews,
    cachedViews,
    getVisitedViews,
    getCachedViews,
    addView,
    addCachedView,
    removeView,
    removeCachedView,
    removeOtherViews,
    removeAllViews,
    delAllCachedViews,
    updateViewTitle
  }
})
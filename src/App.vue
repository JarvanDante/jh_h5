<template>
  <div id="app">
    <div v-if="showGlobalLoading" class="global-loading-overlay">
      <div class="global-loading-dots">
        <span v-for="i in 5" :key="i"></span>
      </div>
    </div>

    <div class="app-container">
      <router-view v-slot="{ Component }">
        <keep-alive :include="cacheViews">
          <component :is="Component" />
        </keep-alive>
      </router-view>

      <!-- 全局底部导航栏 -->
      <div class="global-tabbar">
        <div class="tabbar-item" :class="{ active: isHomeActive }" @click="navigateTo('/')">
          <van-icon :name="isHomeActive ? 'wap-home' : 'wap-home-o'" size="20" />
          <span>Home</span>
        </div>
        <div
          class="tabbar-item"
          :class="{ active: currentRoute === '/promotion' }"
          @click="navigateTo('/promotion')"
        >
          <van-icon :name="currentRoute === '/promotion' ? 'gift' : 'gift-o'" size="20" />
          <span>Promotion</span>
        </div>
        <!-- Invite 活动下线，先注释底部中间入口 -->
        <!--
        <div
          class="tabbar-item"
          :class="{ active: currentRoute === '/invite_activity' }"
          @click="navigateTo('/invite_activity')"
        >
          <van-icon
            :name="currentRoute === '/invite_activity' ? 'friends' : 'friends-o'"
            size="20"
          />
          <span>Invite</span>
        </div>
        -->
        <div
          class="tabbar-item"
          :class="{ active: currentRoute === '/deposit' }"
          @click="navigateTo('/deposit')"
        >
          <van-icon :name="currentRoute === '/deposit' ? 'gold-coin' : 'gold-coin-o'" size="20" />
          <span>Deposit</span>
        </div>
        <div
          class="tabbar-item"
          :class="{ active: currentRoute === '/user' }"
          @click="navigateTo('/user')"
        >
          <van-icon :name="currentRoute === '/user' ? 'manager' : 'manager-o'" size="20" />
          <span>Members</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'

const router = useRouter()
const route = useRoute()
const appStore = useAppStore()
const cacheViews = computed(() => appStore.cacheViews)
const currentRoute = computed(() => route.path)
const showGlobalLoading = ref(true)
let loadingCount = 0
let loadingShownAt = Date.now()
let showTimer: number | null = null
let hideTimer: number | null = null
let forceHideTimer: number | null = null
// 防闪烁：耗时小于 300ms 的加载不展示
const showDelayMs = 300
const minLoadingMs = 100
const maxLoadingMs = 2000

const scheduleForceHide = () => {
  // 兜底：避免计数异常导致全局 loading 永久不消失
  if (!forceHideTimer) {
    forceHideTimer = window.setTimeout(() => {
      loadingCount = 0
      showGlobalLoading.value = false
      forceHideTimer = null
    }, maxLoadingMs)
  }
}

const showLoading = () => {
  loadingCount += 1

  if (hideTimer) {
    window.clearTimeout(hideTimer)
    hideTimer = null
  }

  if (showGlobalLoading.value) {
    scheduleForceHide()
    return
  }

  if (showTimer) return

  showTimer = window.setTimeout(() => {
    showTimer = null
    if (loadingCount === 0 || showGlobalLoading.value) return
    showGlobalLoading.value = true
    loadingShownAt = Date.now()
    scheduleForceHide()
  }, showDelayMs)
}

const hideLoading = () => {
  loadingCount = Math.max(0, loadingCount - 1)
  if (loadingCount !== 0) return

  // 还没到展示阈值就结束，直接取消展示
  if (showTimer) {
    window.clearTimeout(showTimer)
    showTimer = null
  }

  if (!showGlobalLoading.value) {
    if (forceHideTimer) {
      window.clearTimeout(forceHideTimer)
      forceHideTimer = null
    }
    return
  }

  const elapsed = Date.now() - loadingShownAt
  const remain = Math.max(0, minLoadingMs - elapsed)

  if (hideTimer) {
    window.clearTimeout(hideTimer)
  }

  hideTimer = window.setTimeout(() => {
    if (loadingCount === 0) {
      showGlobalLoading.value = false
      if (forceHideTimer) {
        window.clearTimeout(forceHideTimer)
        forceHideTimer = null
      }
    }
    hideTimer = null
  }, remain)
}

const onGlobalLoadingStart = () => {
  showLoading()
}

const onGlobalLoadingEnd = () => {
  hideLoading()
}

const onGlobalLoadingReset = () => {
  loadingCount = 0
  showGlobalLoading.value = false
  if (showTimer) {
    window.clearTimeout(showTimer)
    showTimer = null
  }
  if (hideTimer) {
    window.clearTimeout(hideTimer)
    hideTimer = null
  }
  if (forceHideTimer) {
    window.clearTimeout(forceHideTimer)
    forceHideTimer = null
  }
}

onMounted(() => {
  // 首屏加载
  showGlobalLoading.value = true
  loadingShownAt = Date.now()
  const hideInitialLoading = () => {
    const elapsed = Date.now() - loadingShownAt
    const remain = Math.max(0, minLoadingMs - elapsed)
    setTimeout(() => {
      if (loadingCount === 0) {
        showGlobalLoading.value = false
      }
    }, remain)
  }

  if (document.readyState === 'complete') {
    hideInitialLoading()
  } else {
    window.addEventListener('load', hideInitialLoading, { once: true })
  }

  // 路由切换 + 慢接口 全局 loading 事件
  window.addEventListener('app:global-loading-start', onGlobalLoadingStart)
  window.addEventListener('app:global-loading-end', onGlobalLoadingEnd)
  window.addEventListener('app:global-loading-reset', onGlobalLoadingReset)
})

onBeforeUnmount(() => {
  window.removeEventListener('app:global-loading-start', onGlobalLoadingStart)
  window.removeEventListener('app:global-loading-end', onGlobalLoadingEnd)
  window.removeEventListener('app:global-loading-reset', onGlobalLoadingReset)
  if (showTimer) {
    window.clearTimeout(showTimer)
    showTimer = null
  }
  if (hideTimer) {
    window.clearTimeout(hideTimer)
    hideTimer = null
  }
  if (forceHideTimer) {
    window.clearTimeout(forceHideTimer)
    forceHideTimer = null
  }
})

// 判断是否是首页（包括 / 和 /home）
const isHomeActive = computed(() => {
  return currentRoute.value === '/' || currentRoute.value === '/home'
})

const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<style lang="scss">
#app {
  width: 100%;
  height: 100%;
  background: #1a1a1a;
  display: flex;
  align-items: center;
  justify-content: center;
}

.global-loading-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
}

.global-loading-dots {
  display: flex;
  gap: 8px;
}

.global-loading-dots span {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  animation: bounce 1.2s infinite ease-in-out;
}

.global-loading-dots span:nth-child(1) {
  animation-delay: 0s;
  background: #f472b6;
}

.global-loading-dots span:nth-child(2) {
  animation-delay: 0.15s;
  background: #c084fc;
}

.global-loading-dots span:nth-child(3) {
  animation-delay: 0.3s;
  background: #818cf8;
}

.global-loading-dots span:nth-child(4) {
  animation-delay: 0.45s;
  background: #22d3ee;
}

.global-loading-dots span:nth-child(5) {
  animation-delay: 0.6s;
  background: #34d399;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  50% {
    transform: translateY(-8px);
    opacity: 1;
  }
}

.app-container {
  width: 100%;
  max-width: 414px;
  height: 100%;
  background: #000;
  box-shadow: 0 0 50px rgba(0, 0, 0, 0.8);
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
}

// 移动设备适配：小于 414px 时占满屏幕
@media (max-width: 414px) {
  #app {
    background: #000;
  }

  .app-container {
    max-width: 100%;
    box-shadow: none;
  }
}

// 全局底部导航栏
.global-tabbar {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 414px;
  height: 60px;
  background: #1f1f1f;
  border-top: 1px solid #333;
  box-shadow: 0 -2px 8px rgba(85, 37, 131, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 5px 8px;
  z-index: 1000;

  .tabbar-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    cursor: pointer;
    transition: all 0.3s ease;
    color: #999;

    span {
      font-size: 11px;
      font-weight: 500;
    }

    :deep(.van-icon) {
      color: #999;
      transition: all 0.3s ease;
    }

    &.active {
      color: #fdb927;

      :deep(.van-icon) {
        color: #fdb927;
      }
    }

    &:active {
      transform: scale(0.95);
    }
  }

  @media (max-width: 414px) {
    left: 0;
    transform: none;
    max-width: 100%;
  }
}
</style>

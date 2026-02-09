<template>
  <div id="app">
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
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'

const router = useRouter()
const route = useRoute()
const appStore = useAppStore()
const cacheViews = computed(() => appStore.cacheViews)
const currentRoute = computed(() => route.path)

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

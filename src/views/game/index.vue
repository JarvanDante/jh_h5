<template>
  <div class="game-page">
    <!-- 游戏加载中 -->
    <div v-if="loading" class="loading-container">
      <van-loading type="spinner" size="48px" color="#552583">加载游戏中...</van-loading>
    </div>

    <!-- 游戏容器 -->
    <div v-if="!loading && !error" class="game-wrapper">
      <!-- 游戏iframe -->
      <iframe :src="gameUrl" class="game-iframe" frameborder="0" allow="autoplay"></iframe>

      <!-- 返回按钮覆盖层 -->
      <div class="back-button-overlay">
        <div class="back-button" @click="goBack">
          <van-icon name="arrow-left" size="24" color="#fff" />
          <span>back</span>
        </div>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="error-container">
      <van-empty description="游戏加载失败">
        <van-button type="primary" @click="goBack">返回首页</van-button>
      </van-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import { gameApi } from '@/api/modules/game'

const router = useRouter()
const route = useRoute()

const loading = ref(true)
const error = ref(false)
const gameUrl = ref('')

// 获取路由参数
const gameId = ref(Number(route.query.game_id) || 0)
const gameKey = ref(String(route.query.key) || '')

// 返回上一页
const goBack = () => {
  router.back()
}

// 进入游戏
const enterGame = async () => {
  if (!gameId.value) {
    showToast('游戏ID不能为空')
    error.value = true
    loading.value = false
    return
  }

  try {
    loading.value = true
    error.value = false

    const res = await gameApi.redirectToGame({
      game_id: gameId.value,
      key: gameKey.value,
      mobile: 1,
    })

    if (res?.url) {
      gameUrl.value = res.url
    } else {
      showToast('获取游戏链接失败')
      error.value = true
    }
  } catch (err: any) {
    showToast(err?.message || '进入游戏失败')
    error.value = true
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  enterGame()
})

onUnmounted(() => {
  // 组件卸载时无需特殊清理
})
</script>

<style lang="scss" scoped>
.game-page {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  background: #000;
  z-index: 9999;
  overflow: hidden;

  // 游戏容器
  .game-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    background: #000;
  }

  // 游戏iframe
  .game-iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: none;
    z-index: 1;
  }

  // 返回按钮覆盖层
  .back-button-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 999999;
  }

  // 返回按钮
  .back-button {
    position: absolute;
    top: 16px;
    left: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 18px;
    background: rgba(0, 0, 0, 0.85);
    border-radius: 24px;
    cursor: pointer;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.6);
    pointer-events: auto;
    border: 1px solid rgba(255, 255, 255, 0.1);

    &:active {
      transform: scale(0.95);
      background: rgba(0, 0, 0, 0.95);
    }

    &:hover {
      background: rgba(0, 0, 0, 0.9);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.7);
    }

    span {
      color: #fff;
      font-size: 15px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
  }

  // 加载中容器
  .loading-container {
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    color: #fff;
    z-index: 2;
  }

  // 错误容器
  .error-container {
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    z-index: 2;
  }
}
</style>

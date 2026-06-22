<template>
  <div class="game-page">
    <div v-if="loading" class="loading-container">
      <van-loading type="spinner" size="48px" color="#552583">{{ t('game.loading') }}</van-loading>
    </div>

    <div v-if="!loading && !error" class="game-wrapper">
      <iframe :src="gameUrl" class="game-iframe" frameborder="0" allow="autoplay"></iframe>

      <div class="back-button-overlay">
        <div class="back-button" @click="goBack">
          <van-icon name="arrow-left" size="24" color="#fff" />
          <span>{{ t('game.back') }}</span>
        </div>
      </div>
    </div>

    <div v-if="error" class="error-container">
      <van-empty :description="t('game.loadFailed')">
        <van-button type="primary" @click="goBack">{{ t('game.backHome') }}</van-button>
      </van-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { showToast } from 'vant'
import { gameApi } from '@/api/modules/game'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const { t } = useI18n()

const loading = ref(true)
const error = ref(false)
const gameUrl = ref('')

const gameId = ref(Number(route.query.game_id) || 0)
const gameKey = ref(String(route.query.key) || '')

const goBack = () => {
  router.back()
}

const enterGame = async () => {
  if (!gameId.value) {
    showToast(t('game.idRequired'))
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
      showToast(t('game.urlFailed'))
      error.value = true
    }
  } catch (err: any) {
    showToast(err?.message || t('game.enterFailed'))
    error.value = true
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (!userStore.isLogin) {
    showToast(t('common.pleaseLoginFirst'))
    router.push('/login')
    return
  }

  enterGame()
})

onUnmounted(() => {})
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

  .game-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    background: #000;
  }

  .game-iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: none;
    z-index: 1;
  }

  .back-button-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 999999;
  }

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

<template>
  <div class="error-page">
    <van-empty image="error" :description="t('notFound.description')">
      <van-button round type="primary" @click="goHome">{{ t('notFound.backHome') }}</van-button>
    </van-empty>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { t } = useI18n()

const goHome = () => {
  router.replace('/home')
}
</script>

<style lang="scss" scoped>
.error-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f7f8fa;
}
</style>

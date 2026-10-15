<template>
  <div class="rate-limit-page">
    <div class="card">
      <div class="icon-wrap">
        <van-icon name="clock-o" size="40" />
      </div>
      <h1>{{ t('rateLimit.title') }}</h1>
      <p>{{ t('rateLimit.description') }}</p>
      <button type="button" class="retry" @click="retry">{{ t('rateLimit.retry') }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { unlockRateLimited } from '@/utils/rate-limit'

const router = useRouter()
const { t } = useI18n()

const retry = () => {
  unlockRateLimited()
  router.replace('/home')
}
</script>

<style lang="scss" scoped>
.rate-limit-page {
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 24px 48px;
  background:
    radial-gradient(circle at 50% 0%, rgba(109, 40, 217, 0.45), transparent 55%),
    #12081f;
}

.card {
  width: 100%;
  padding: 36px 24px 28px;
  border-radius: 20px;
  text-align: center;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.icon-wrap {
  width: 76px;
  height: 76px;
  margin: 0 auto 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fdb927;
  background: rgba(253, 185, 39, 0.12);
}

h1 {
  margin: 0 0 10px;
  color: #fff;
  font-size: 22px;
  font-weight: 700;
}

p {
  margin: 0 0 28px;
  color: rgba(255, 255, 255, 0.72);
  font-size: 14px;
  line-height: 1.6;
}

.retry {
  width: 100%;
  height: 44px;
  border: 0;
  border-radius: 22px;
  background: #fdb927;
  color: #3a2500;
  font-size: 15px;
  font-weight: 700;
}
</style>

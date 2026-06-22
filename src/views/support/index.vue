<template>
  <div class="support-page">
    <div class="top-bar">
      <van-icon name="arrow-left" size="24" color="#fff" @click="router.back()" />
      <span class="title">{{ t('support.title') }}</span>
      <span class="placeholder"></span>
    </div>

    <iframe class="support-frame" :src="lhcChatUrl" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const { t } = useI18n()

const lhcChatUrl = computed(() => {
  let base = ''
  try {
    const raw = localStorage.getItem('site_setting')
    if (raw) {
      const setting = JSON.parse(raw)
      base = String(setting?.service_url || '').trim()
    }
  } catch (error) {
    console.error('Failed to parse site_setting:', error)
  }

  if (!base) {
    base = 'http://localhost:8086/index.php/chat/start'
  }

  // 兼容后台仅配置域名/端口（如 //localhost:8086）
  if (base.startsWith('//')) {
    const hostOnly = base.slice(2)
    const isLocal = /^(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?$/i.test(hostOnly)
    base = `${isLocal ? 'http:' : window.location.protocol}${base}`
  }
  if (!/^https?:\/\//i.test(base)) {
    const isLocal = /^(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?(\/|$)/i.test(base)
    base = `${isLocal ? 'http' : 'https'}://${base}`
  }
  if (!/\/index\.php\/chat\/start/i.test(base)) {
    base = `${base.replace(/\/$/, '')}/index.php/chat/start`
  }
  const rawName = String(userStore.userInfo?.username || '').trim()
  const email = String((userStore.userInfo as any)?.email || '').trim()

  const gradeName = String((userStore.userInfo as any)?.grade_name || '').trim()
  const vipRaw =
    (userStore.userInfo as any)?.vip_level ??
    (userStore.userInfo as any)?.grade_id ??
    (userStore.userInfo as any)?.vip
  const vipLevel = Number(vipRaw)

  const vipLabel = gradeName || (Number.isFinite(vipLevel) && vipLevel > 0 ? `VIP${vipLevel}` : '')
  const uname = rawName && vipLabel ? `${rawName} (${vipLabel})` : rawName

  if (!userStore.isLogin || !uname) return base

  const query = new URLSearchParams()
  query.set('prefill[username]', uname)
  if (email) query.set('prefill[email]', email)

  return `${base}?${query.toString()}`
})
</script>

<style scoped lang="scss">
.support-page {
  height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  background: #fff;

  .top-bar {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    background: linear-gradient(135deg, #552583 0%, #7b3fa8 100%);

    .title {
      color: #fff;
      font-size: 18px;
      font-weight: bold;
    }

    .placeholder {
      width: 24px;
      height: 24px;
    }
  }

  .support-frame {
    width: 100%;
    flex: 1;
    border: none;
    background: #fff;
  }
}
</style>

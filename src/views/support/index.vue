<template>
  <div class="support-page">
    <div class="top-bar">
      <van-icon name="arrow-left" size="24" color="#fff" @click="router.back()" />
      <span class="title">Support</span>
      <span class="placeholder"></span>
    </div>

    <iframe class="support-frame" :src="lhcChatUrl" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const lhcChatUrl = computed(() => {
  const base = 'http://localhost:8086/index.php/chat/start'
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

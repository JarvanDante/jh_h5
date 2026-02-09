<template>
  <div class="messages-page">
    <!-- 顶部导航栏 -->
    <div class="top-bar">
      <van-icon name="arrow-left" size="24" color="#fff" @click="router.back()" />
      <span class="title">Messages</span>
      <span class="mark-all" @click="markAllRead">Read All</span>
    </div>

    <!-- 消息列表 -->
    <div class="message-list">
      <van-loading v-if="loading" type="spinner" size="24px" class="loading-center"
        >Loading...</van-loading
      >
      <template v-else-if="messages.length > 0">
        <div
          v-for="msg in messages"
          :key="msg.id"
          class="message-item"
          :class="{ unread: !msg.is_read }"
          @click="openMessage(msg)"
        >
          <div class="msg-icon">
            <van-icon :name="getMessageIcon(msg)" size="22" color="#fdb927" />
            <span v-if="!msg.is_read" class="unread-dot"></span>
          </div>
          <div class="msg-body">
            <div class="msg-header">
              <span class="msg-title">{{ msg.title }}</span>
              <span class="msg-time">{{ formatTime(msg.created_at) }}</span>
            </div>
            <p class="msg-preview">{{ msg.content }}</p>
          </div>
        </div>
      </template>
      <van-empty v-else description="No messages yet" />
    </div>

    <!-- 消息详情弹窗 -->
    <!-- 消息详情弹窗 -->
    <div v-if="showDetail" class="detail-overlay" @click="showDetail = false">
      <div class="detail-popup" @click.stop>
        <div class="detail-close" @click="showDetail = false">
          <van-icon name="cross" size="16" color="rgba(255,255,255,0.6)" />
        </div>
        <div class="detail-icon-wrap">
          <van-icon
            :name="currentMsg ? getMessageIcon(currentMsg) : 'bullhorn-o'"
            size="28"
            color="#fff"
          />
        </div>
        <div class="detail-title">{{ currentMsg?.title }}</div>
        <div class="detail-time">{{ currentMsg ? formatTime(currentMsg.created_at) : '' }}</div>
        <div class="detail-divider"></div>
        <div class="detail-content">{{ currentMsg?.content }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { userApi } from '@/api/modules/user'

const router = useRouter()
const loading = ref(false)
const showDetail = ref(false)
const currentMsg = ref<any>(null)

interface Message {
  id: number
  title: string
  content: string
  is_read: boolean
  created_at: string
}

const messages = ref<Message[]>([])

const fetchMessages = async () => {
  try {
    loading.value = true
    const res = await userApi.getMessageList()
    if (res?.list) {
      messages.value = res.list
    }
  } catch (error) {
    console.error('获取消息列表失败:', error)
  } finally {
    loading.value = false
  }
}

const getMessageIcon = (msg: Message) => {
  if (msg.title?.includes('VIP')) return 'gem-o'
  if (msg.title?.includes('Deposit') || msg.content?.includes('deposit')) return 'gold-coin-o'
  if (msg.title?.includes('Withdraw') || msg.content?.includes('withdraw')) return 'cash-o'
  return 'bullhorn-o'
}

const formatTime = (time: string) => {
  if (!time) return ''
  const d = new Date(time)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${month}-${day}`
}

const openMessage = async (msg: Message) => {
  currentMsg.value = msg
  showDetail.value = true
  if (!msg.is_read) {
    msg.is_read = true
    try {
      await userApi.readMessage(msg.id)
    } catch (error) {
      console.error('标记消息已读失败:', error)
    }
  }
}

const markAllRead = async () => {
  const unread = messages.value.filter((m) => !m.is_read)
  if (unread.length === 0) {
    showToast('No unread messages')
    return
  }

  unread.forEach((m) => (m.is_read = true))
  try {
    await Promise.all(unread.map((m) => userApi.readMessage(m.id)))
    showToast('All marked as read')
  } catch (error) {
    console.error('批量标记已读失败:', error)
    showToast('Failed to mark all')
  }
}

onMounted(() => {
  fetchMessages()
})
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.messages-page {
  min-height: 100vh;
  background: #fff;
  padding-bottom: 70px;

  .top-bar {
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

    .mark-all {
      color: #fdb927;
      font-size: 13px;
      cursor: pointer;

      &:active {
        opacity: 0.7;
      }
    }
  }

  .message-list {
    padding: 12px 12px 0;

    .loading-center {
      display: flex;
      justify-content: center;
      padding: 60px 0;
    }
  }

  .message-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 14px 16px 14px 20px;
    margin-bottom: 10px;
    background: linear-gradient(135deg, #552583 0%, #6b2fa0 100%);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 2px 8px rgba(85, 37, 131, 0.2);
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 5px;
      background: transparent;
    }

    &:active {
      transform: scale(0.98);
      box-shadow: 0 1px 4px rgba(85, 37, 131, 0.2);
    }

    &.unread {
      box-shadow: 0 2px 12px rgba(253, 185, 39, 0.3);
      border: 1.5px solid rgba(253, 185, 39, 0.5);
      background: linear-gradient(135deg, #5e2a90 0%, #7b3fa8 100%);

      &::before {
        background: transparent;
      }

      &::after {
        content: 'NEW';
        position: absolute;
        top: 8px;
        left: -28px;
        width: 90px;
        text-align: center;
        font-size: 9px;
        font-weight: bold;
        color: #552583;
        background: linear-gradient(135deg, #fdb927, #f4a020);
        transform: rotate(-45deg);
        padding: 2px 0;
        letter-spacing: 1px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }
    }

    .msg-icon {
      position: relative;
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: rgba(253, 185, 39, 0.15);
      border: 1px solid rgba(253, 185, 39, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      .unread-dot {
        position: absolute;
        top: -3px;
        right: -3px;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: #ff4757;
        border: 1.5px solid #552583;
      }
    }

    .msg-body {
      flex: 1;
      min-width: 0;

      .msg-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 4px;

        .msg-title {
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          flex: 1;
          margin-right: 8px;
        }

        .msg-time {
          color: rgba(253, 185, 39, 0.7);
          font-size: 11px;
          flex-shrink: 0;
        }
      }

      .msg-preview {
        color: rgba(255, 255, 255, 0.65);
        font-size: 12px;
        line-height: 1.4;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }

  .detail-overlay {
    position: fixed;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 414px;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 24px;

    @media (max-width: 414px) {
      left: 0;
      transform: none;
      max-width: 100%;
    }
  }

  .detail-popup {
    width: 100%;
    background: linear-gradient(135deg, #552583 0%, #3a1a5e 100%);
    border-radius: 16px;
    padding: 24px 20px;
    position: relative;
    box-shadow: 0 8px 32px rgba(85, 37, 131, 0.5);
    border: 1px solid rgba(253, 185, 39, 0.2);

    .detail-close {
      position: absolute;
      top: 12px;
      right: 12px;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;

      &:active {
        background: rgba(255, 255, 255, 0.2);
      }
    }

    .detail-icon-wrap {
      width: 52px;
      height: 52px;
      border-radius: 14px;
      background: linear-gradient(135deg, #fdb927 0%, #f4a020 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 14px;
      box-shadow: 0 4px 12px rgba(253, 185, 39, 0.3);
    }

    .detail-title {
      text-align: center;
      font-size: 17px;
      font-weight: bold;
      color: #fff;
      margin-bottom: 4px;
    }

    .detail-time {
      text-align: center;
      font-size: 12px;
      color: rgba(253, 185, 39, 0.7);
      margin-bottom: 14px;
    }

    .detail-divider {
      height: 1px;
      background: rgba(253, 185, 39, 0.15);
      margin-bottom: 14px;
    }

    .detail-content {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.8);
      line-height: 1.7;
      word-break: break-word;
    }
  }
}
</style>

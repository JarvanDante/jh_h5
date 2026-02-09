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
            <van-icon :name="getMessageIcon(msg.type)" size="22" color="#fdb927" />
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
    <van-popup v-model:show="showDetail" position="bottom" round :style="{ maxHeight: '70%' }">
      <div class="msg-detail">
        <div class="detail-header">
          <span class="detail-title">{{ currentMsg?.title }}</span>
          <span class="detail-time">{{ currentMsg ? formatTime(currentMsg.created_at) : '' }}</span>
        </div>
        <div class="detail-content">{{ currentMsg?.content }}</div>
      </div>
    </van-popup>
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
  type: number // 1=system, 2=promotion, 3=transaction
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

const getMessageIcon = (type: number) => {
  const icons: Record<number, string> = {
    1: 'bullhorn-o',
    2: 'gift-o',
    3: 'gold-coin-o',
  }
  return icons[type] || 'chat-o'
}

const formatTime = (time: string) => {
  if (!time) return ''
  const d = new Date(time)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return `${d.getMonth() + 1}/${d.getDate()}`
}

const openMessage = (msg: Message) => {
  currentMsg.value = msg
  showDetail.value = true
  if (!msg.is_read) {
    msg.is_read = true
    // TODO: call API to mark as read
  }
}

const markAllRead = () => {
  messages.value.forEach((m) => (m.is_read = true))
  showToast('All marked as read')
  // TODO: call API to mark all read
}

onMounted(() => {
  fetchMessages()
})
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.messages-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #552583 0%, #3a1a5e 60%, #1a0a2e 100%);
  padding-bottom: 70px;

  .top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    background: transparent;

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
    padding: 0 12px;

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
    padding: 14px 16px;
    margin-bottom: 8px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    cursor: pointer;
    transition: background 0.2s;

    &:active {
      background: rgba(255, 255, 255, 0.14);
    }

    &.unread {
      background: rgba(253, 185, 39, 0.08);
      border-left: 3px solid #fdb927;
    }

    .msg-icon {
      position: relative;
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: rgba(253, 185, 39, 0.12);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      .unread-dot {
        position: absolute;
        top: -2px;
        right: -2px;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #ff4757;
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
          color: rgba(255, 255, 255, 0.4);
          font-size: 11px;
          flex-shrink: 0;
        }
      }

      .msg-preview {
        color: rgba(255, 255, 255, 0.6);
        font-size: 12px;
        line-height: 1.4;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }

  .msg-detail {
    padding: 24px 20px;

    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      .detail-title {
        font-size: 17px;
        font-weight: bold;
        color: #333;
      }

      .detail-time {
        font-size: 12px;
        color: #999;
      }
    }

    .detail-content {
      font-size: 14px;
      color: #555;
      line-height: 1.7;
    }
  }
}
</style>

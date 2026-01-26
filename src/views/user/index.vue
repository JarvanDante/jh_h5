<template>
  <div class="user-page">
    <!-- 顶部用户信息卡片 -->
    <div class="user-header">
      <!-- 头像 -->
      <div class="avatar-wrapper">
        <img :src="userStore.userInfo?.avatar || defaultAvatar" alt="avatar" class="avatar" />
      </div>

      <!-- 用户信息 -->
      <div class="user-info">
        <div class="id-row">
          <span class="label">ID:</span>
          <span class="value">{{ userId }}</span>
          <van-icon name="copy" size="16" color="#fff" @click="copyId" />
          <div class="vip-badge">
            <van-icon name="crown" size="12" color="#FDB927" />
            <span>V0</span>
          </div>
        </div>
        <div class="account-row">
          <span class="label">Account:</span>
          <span class="value">{{ accountNumber }}</span>
        </div>
        <div class="balance-row">
          <van-icon name="balance-o" size="20" color="#fff" />
          <span class="amount">{{ balance }}</span>
          <van-icon name="replay" size="20" color="#fff" @click="refreshBalance" />
        </div>
      </div>

      <!-- 消息图标 -->
      <div class="message-icon">
        <van-badge :content="messageCount" max="99">
          <van-icon name="envelop-o" size="32" color="#fff" @click="goToMessages" />
        </van-badge>
      </div>
    </div>

    <!-- 存款/提款按钮 -->
    <div class="action-buttons">
      <van-button class="withdraw-btn" block @click="handleWithdraw">
        <div class="btn-content">
          <van-icon name="credit-pay" size="24" />
          <span>Withdraw</span>
        </div>
      </van-button>
      <van-button class="deposit-btn" block @click="handleDeposit">
        <div class="btn-content">
          <van-icon name="credit-pay" size="24" />
          <span>Deposit</span>
        </div>
      </van-button>
    </div>

    <!-- VIP 进度卡片 -->
    <div class="vip-card">
      <div class="vip-icon">
        <van-icon name="crown" size="32" color="#FDB927" />
        <span class="vip-level">V0</span>
      </div>
      <div class="vip-info">
        <div class="vip-text">
          <span>Remaining</span>
          <span class="vip-highlight">VIP1</span>
          <span>Remaining to Bet</span>
          <span class="vip-amount">1,000.00</span>
        </div>
        <div class="progress-bar">
          <div class="progress-label">Need to Bet</div>
          <div class="progress-value">0.00/1,000.00</div>
        </div>
        <van-progress :percentage="0" stroke-width="8" color="#FDB927" />
      </div>
      <van-icon name="arrow" size="20" color="#999" />
    </div>

    <!-- 菜单列表 -->
    <div class="menu-card">
      <div class="menu-item" @click="goToReport">
        <div class="menu-icon report-icon">📊</div>
        <span class="menu-title">Report</span>
        <van-icon name="arrow" size="20" color="rgba(255,255,255,0.6)" />
      </div>

      <div class="menu-divider"></div>

      <div class="menu-item" @click="goToInvite">
        <div class="menu-icon invite-icon">👥</div>
        <div class="menu-content">
          <span class="menu-title">Invite</span>
          <span class="menu-subtitle">Hook the Fortune, Spin the Fun!</span>
        </div>
        <van-icon name="arrow" size="20" color="rgba(255,255,255,0.6)" />
      </div>

      <div class="menu-divider"></div>

      <div class="menu-item" @click="goToRedeem">
        <div class="menu-icon redeem-icon">🎁</div>
        <span class="menu-title">Redeem</span>
        <van-icon name="arrow" size="20" color="rgba(255,255,255,0.6)" />
      </div>

      <div class="menu-divider"></div>

      <div class="menu-item" @click="goToSupport">
        <div class="menu-icon support-icon">💬</div>
        <span class="menu-title">Support</span>
        <van-badge :content="supportCount" max="99" />
        <van-icon name="arrow" size="20" color="rgba(255,255,255,0.6)" />
      </div>

      <div class="menu-divider"></div>

      <div class="menu-item" @click="goToSecurity">
        <div class="menu-icon security-icon">🛡️</div>
        <span class="menu-title">Security Center</span>
        <van-icon name="arrow" size="20" color="rgba(255,255,255,0.6)" />
      </div>

      <div class="menu-divider"></div>

      <div class="menu-item" @click="goToLanguage">
        <div class="menu-icon language-icon">🌐</div>
        <span class="menu-title">Language</span>
        <van-icon name="arrow" size="20" color="rgba(255,255,255,0.6)" />
      </div>

      <div class="menu-divider"></div>

      <div class="menu-item" @click="handleLogout">
        <div class="menu-icon logout-icon">🚪</div>
        <span class="menu-title">Logout</span>
        <van-icon name="arrow" size="20" color="rgba(255,255,255,0.6)" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showConfirmDialog, showToast } from 'vant'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

// 默认狮子头像（本地图片）
const defaultAvatar = '/lion-avatar..png'

// 用户数据
const userId = computed(() => userStore.userInfo?.id || '285560778')
const accountNumber = computed(() => userStore.userInfo?.username || '9186570127')
const balance = computed(() => {
  // 优先从 localStorage 中的 user_balance 获取余额
  try {
    const userBalance = localStorage.getItem('user_balance')
    if (userBalance) {
      const balanceData = JSON.parse(userBalance)
      return balanceData.balance || '0.00'
    }
  } catch (error) {
    console.error('Failed to parse user_balance from localStorage:', error)
  }

  // 如果没有余额数据，从用户信息中获取
  return userStore.userInfo?.balance || '0.00'
})
const messageCount = ref(7)
const supportCount = ref(7)

// 方法
const copyId = () => {
  // 复制 ID 到剪贴板
  navigator.clipboard.writeText(userId.value.toString())
  showToast('ID copied')
}

const refreshBalance = async () => {
  if (!userStore.isLogin) {
    showToast('Please login first')
    return
  }

  try {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api'

    // 先调用刷新余额接口
    const refreshBalanceUrl = `${apiBaseUrl}/frontend/balance/refresh-balance`
    const refreshBalanceResponse = await fetch(refreshBalanceUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${userStore.token}`,
      },
    })

    const refreshBalanceResult = await refreshBalanceResponse.json()

    // 检查 token 是否过期
    if (refreshBalanceResult.code === 401 || refreshBalanceResult.code === 403) {
      // Token 过期，尝试刷新
      const refreshToken = userStore.refreshToken
      if (refreshToken) {
        const refreshUrl = `${apiBaseUrl}/frontend/app/refresh-token`
        const refreshResponse = await fetch(refreshUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            refresh_token: refreshToken,
          }),
        })

        const refreshResult = await refreshResponse.json()

        if (refreshResult.code === 0 && refreshResult.data?.token) {
          // 更新 token
          userStore.setToken(refreshResult.data.token)
          if (refreshResult.data.refresh_token) {
            userStore.setRefreshToken(refreshResult.data.refresh_token)
          }

          // 使用新 token 重新请求余额
          const retryResponse = await fetch(refreshBalanceUrl, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${refreshResult.data.token}`,
            },
          })

          const retryResult = await retryResponse.json()

          if (retryResult.code === 0 && retryResult.data) {
            // 保存余额信息到 localStorage
            localStorage.setItem('user_balance', JSON.stringify(retryResult.data))

            // 更新用户信息中的余额
            if (userStore.userInfo) {
              userStore.setUserInfo({
                ...userStore.userInfo,
                balance: retryResult.data.balance || '0.00',
              })
            }
            // showToast('Balance refreshed')
          }
        } else {
          // 刷新失败，跳转到登录页
          userStore.logout()
          showToast('Login expired, please login again')
          router.push('/login')
        }
      } else {
        // 没有 refresh_token，跳转到登录页
        userStore.logout()
        showToast('Please login again')
        router.push('/login')
      }
      return
    }

    if (refreshBalanceResult.code === 0 && refreshBalanceResult.data) {
      // 保存余额信息到 localStorage
      localStorage.setItem('user_balance', JSON.stringify(refreshBalanceResult.data))

      // 更新用户信息中的余额
      if (userStore.userInfo) {
        userStore.setUserInfo({
          ...userStore.userInfo,
          balance: refreshBalanceResult.data.balance || '0.00',
        })
      }
      // showToast('Balance refreshed')
    } else {
      showToast(refreshBalanceResult.msg || 'Failed to refresh balance')
    }
  } catch (error) {
    console.error('Failed to refresh balance:', error)
    showToast('Failed to refresh balance')
  }
}

const goToMessages = () => {
  showToast('Messages')
}

const handleWithdraw = () => {
  if (!userStore.isLogin) {
    showToast('Please login first')
    router.push('/login')
    return
  }
  showToast('Withdraw')
}

const handleDeposit = () => {
  if (!userStore.isLogin) {
    showToast('Please login first')
    router.push('/login')
    return
  }
  router.push('/deposit')
}

const goToReport = () => {
  showToast('Report')
}

const goToInvite = () => {
  router.push('/invite')
}

const goToRedeem = () => {
  showToast('Redeem')
}

const goToSupport = () => {
  showToast('Support')
}

const goToSecurity = () => {
  showToast('Security Center')
}

const goToLanguage = () => {
  showToast('Language')
}

const handleLogout = async () => {
  try {
    await showConfirmDialog({
      title: 'Confirm',
      message: 'Are you sure you want to logout?',
    })

    userStore.logout()
    showToast('Logged out successfully')
    router.replace('/home')
  } catch (error) {
    // 用户取消
  }
}

// 页面加载时获取用户信息
onMounted(() => {
  // 检查是否登录
  if (!userStore.isLogin) {
    showToast('Please login first')
    router.push('/login')
    return
  }

  // 清除可能损坏的数据
  try {
    // 如果已登录，自动刷新余额
    if (userStore.isLogin) {
      refreshBalance()
    }
  } catch (error) {
    console.error('Error on mount:', error)
  }
})
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.user-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 16px;
  padding-bottom: 70px;

  // 顶部用户信息卡片
  .user-header {
    position: relative;
    background: linear-gradient(135deg, #552583 0%, #7b3fa8 100%);
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 16px;
    box-shadow: 0 4px 12px rgba(85, 37, 131, 0.4);
    display: flex;
    gap: 16px;

    .avatar-wrapper {
      flex-shrink: 0;

      .avatar {
        width: 100px;
        height: 100px;
        border-radius: 16px;
        object-fit: cover;
        background: #fff;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      }
    }

    .user-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
      color: #fff;

      .id-row {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 16px;

        .label {
          color: #fff;
          font-weight: bold;
        }

        .value {
          color: #fff;
          font-weight: bold;
        }

        .van-icon {
          cursor: pointer;
          transition: transform 0.2s;

          &:active {
            transform: scale(0.9);
          }
        }

        .vip-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          background: rgba(253, 185, 39, 0.2);
          border: 1px solid #fdb927;
          border-radius: 12px;
          padding: 2px 8px;
          margin-left: auto;

          span {
            color: #fdb927;
            font-size: 12px;
            font-weight: bold;
          }
        }
      }

      .account-row {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;

        .label {
          color: rgba(255, 255, 255, 0.8);
        }

        .value {
          color: #fff;
        }
      }

      .balance-row {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-top: 4px;

        .amount {
          font-size: 28px;
          font-weight: bold;
          color: #fdb927;
        }

        .van-icon {
          cursor: pointer;
          transition: transform 0.2s;

          &:active {
            transform: scale(0.9);
          }
        }
      }
    }

    .message-icon {
      position: absolute;
      top: 20px;
      right: 20px;
      cursor: pointer;
      transition: transform 0.2s;

      &:active {
        transform: scale(0.9);
      }
    }
  }

  // 存款/提款按钮
  .action-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 8px;

    .withdraw-btn,
    .deposit-btn {
      height: 60px;
      border-radius: 16px;
      font-weight: bold;
      font-size: 16px;
      transition: all 0.3s;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      padding: 0;

      &:active {
        transform: scale(0.98);
      }

      .btn-content {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        width: 100%;
        height: 100%;
      }

      :deep(.van-icon) {
        font-size: 24px;
      }
    }

    .withdraw-btn {
      background: linear-gradient(135deg, #552583 0%, #7b3fa8 100%);
      color: #fff;
      border: 3px solid #fdb927;
      box-shadow: 0 4px 12px rgba(85, 37, 131, 0.4);

      &:active {
        box-shadow: 0 2px 8px rgba(85, 37, 131, 0.4);
      }
    }

    .deposit-btn {
      background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
      color: #fff;
      border: none;
      box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);

      &:active {
        box-shadow: 0 2px 8px rgba(34, 197, 94, 0.4);
      }
    }
  }

  // VIP 进度卡片
  .vip-card {
    background: linear-gradient(135deg, #552583 0%, #7b3fa8 100%);
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 4px 12px rgba(85, 37, 131, 0.4);
    cursor: pointer;
    transition: transform 0.2s;

    &:active {
      transform: scale(0.98);
    }

    .vip-icon {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      flex-shrink: 0;

      .vip-level {
        color: #fdb927;
        font-size: 12px;
        font-weight: bold;
      }
    }

    .vip-info {
      flex: 1;
      min-width: 0;

      .vip-text {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 8px;
        font-size: 13px;
        color: rgba(255, 255, 255, 0.8);
        flex-wrap: wrap;

        .vip-highlight {
          color: #fdb927;
          font-weight: bold;
        }

        .vip-amount {
          color: #fff;
          font-weight: bold;
        }
      }

      .progress-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 4px;
        font-size: 12px;

        .progress-label {
          color: rgba(255, 255, 255, 0.7);
        }

        .progress-value {
          color: rgba(255, 255, 255, 0.9);
        }
      }

      :deep(.van-progress) {
        .van-progress__portion {
          background: #fdb927;
        }

        .van-progress__pivot {
          background: #fdb927;
          color: #552583;
        }
      }
    }

    .van-icon {
      color: rgba(255, 255, 255, 0.6);
    }
  }

  // 菜单卡片
  .menu-card {
    background: linear-gradient(135deg, #552583 0%, #7b3fa8 100%);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(85, 37, 131, 0.3);

    .menu-divider {
      height: 1px;
      background: rgba(255, 255, 255, 0.1);
      margin: 0 16px;
    }

    .menu-item {
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      transition: all 0.2s;

      &:active {
        background: rgba(253, 185, 39, 0.1);
      }

      .menu-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        flex-shrink: 0;
        background: rgba(253, 185, 39, 0.2);
        border: 2px solid #fdb927;
      }

      .report-icon {
        background: rgba(249, 115, 22, 0.2);
        border-color: #f97316;
      }

      .invite-icon {
        background: rgba(236, 72, 153, 0.2);
        border-color: #ec4899;
      }

      .redeem-icon {
        background: rgba(236, 72, 153, 0.2);
        border-color: #ec4899;
      }

      .support-icon {
        background: rgba(139, 92, 246, 0.2);
        border-color: #8b5cf6;
      }

      .security-icon {
        background: rgba(16, 185, 129, 0.2);
        border-color: #10b981;
      }

      .language-icon {
        background: rgba(139, 92, 246, 0.2);
        border-color: #8b5cf6;
      }

      .logout-icon {
        background: rgba(249, 115, 22, 0.2);
        border-color: #f97316;
      }

      .menu-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 0;

        .menu-title {
          color: #fff;
          font-size: 16px;
          font-weight: 600;
        }

        .menu-subtitle {
          color: rgba(255, 255, 255, 0.7);
          font-size: 12px;
        }
      }

      .menu-title {
        flex: 1;
        color: #fff;
        font-size: 16px;
        font-weight: 600;
      }

      :deep(.van-badge) {
        margin-left: auto;

        .van-badge__wrapper {
          .van-badge {
            background: #fdb927;
            color: #552583;
            border: none;
          }
        }
      }

      .van-icon {
        flex-shrink: 0;
        color: rgba(255, 255, 255, 0.6);
      }
    }
  }
}
</style>

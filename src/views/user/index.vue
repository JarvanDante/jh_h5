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
        </div>
        <div class="account-row">
          <span class="label">Account:</span>
          <span class="value">{{ accountNumber }}</span>
        </div>
        <div class="balance-row">
          <van-icon name="balance-o" size="20" color="#fff" />
          <div class="amount">{{ displayBalance }}</div>
          <van-icon
            name="replay"
            size="20"
            color="#fff"
            :class="{ rotating: isRefreshing }"
            @click="refreshBalance"
          />
        </div>
      </div>

      <!-- 消息图标 -->
      <div class="message-icon" @click="goToMessages">
        <van-icon name="envelop-o" size="26" color="#fdb927" />
        <span v-if="messageCount > 0" class="msg-badge">{{
          messageCount > 99 ? '99+' : messageCount
        }}</span>
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
    <div class="vip-card" @click="router.push('/vip')">
      <!-- 顶部：当前等级 + 下一等级目标 -->
      <div class="vip-top-row">
        <span class="vip-badge" :style="getVipBadgeStyle()"
          >👑 {{ currentGrade?.name || 'VIP0' }}</span
        >
        <div class="vip-next-tag" v-if="nextGrade">
          <van-icon name="arrow-up" size="10" color="#fdb927" />
          <span>{{ nextGrade.name }}</span>
        </div>
        <div class="vip-max-tag" v-else>🎉 MAX</div>
        <van-icon name="arrow" size="16" color="rgba(255,255,255,0.4)" class="arrow-icon" />
      </div>

      <!-- 中间：升级条件 + 各自进度条 -->
      <div class="vip-req-row" v-if="nextGrade">
        <div class="req-col">
          <div class="req-item">
            <div class="req-left">
              <span class="req-icon">💰</span>
              <span class="req-label">Deposit</span>
            </div>
            <span class="req-value">₱{{ depositCurrent }}</span>
          </div>
          <van-progress
            :percentage="depositProgress"
            stroke-width="3"
            color="linear-gradient(90deg, #4ade80, #22c55e)"
            track-color="rgba(0,0,0,0.25)"
            :show-pivot="false"
          />
        </div>
        <div class="req-divider"></div>
        <div class="req-col">
          <div class="req-item">
            <div class="req-left">
              <span class="req-icon">🎰</span>
              <span class="req-label">Bet</span>
            </div>
            <span class="req-value">₱{{ betCurrent }}</span>
          </div>
          <van-progress
            :percentage="betProgress"
            stroke-width="3"
            color="linear-gradient(90deg, #fdb927, #f4a020)"
            track-color="rgba(0,0,0,0.25)"
            :show-pivot="false"
          />
        </div>
      </div>
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

      <div class="menu-item" @click="goToRebate">
        <div class="menu-icon redeem-icon">🎁</div>
        <span class="menu-title">Rebate</span>
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

      <div class="menu-item" @click="handleLogout">
        <div class="menu-icon logout-icon">🚪</div>
        <span class="menu-title">Logout</span>
        <van-icon name="arrow" size="20" color="rgba(255,255,255,0.6)" />
      </div>
    </div>

    <!-- 资金密码提示弹窗 -->
    <FundPasswordDialog v-model:show="showFundPasswordDialog" @confirm="handleConfirmSetPassword" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showConfirmDialog, showToast } from 'vant'
import { useUserStore } from '@/stores/user'
import { userApi } from '@/api/modules/user'
import { getVipUpgradeProgress, type VipUpgradeProgressResponse } from '@/api/modules/balance'
import type { GradeInfo } from '@/api/modules/user'
import FundPasswordDialog from '@/components/FundPasswordDialog.vue'
import { signedFetch } from '@/utils/request'

const router = useRouter()
const userStore = useUserStore()

// VIP等级数据
const gradeList = ref<GradeInfo[]>([])
const userGradeId = computed(() => userStore.userInfo?.grade_id || 1)
const currentGrade = computed(() => gradeList.value.find((g) => g.id === userGradeId.value))
const nextGrade = computed(() => {
  const idx = gradeList.value.findIndex((g) => g.id === userGradeId.value)
  if (idx >= 0 && idx < gradeList.value.length - 1) {
    return gradeList.value[idx + 1]
  }
  return null
})
// VIP升级进度数据（来自API）
const vipUpgradeProgress = ref<VipUpgradeProgressResponse | null>(null)

const depositProgress = computed(() => vipUpgradeProgress.value?.deposit_progress ?? 0)
const betProgress = computed(() => vipUpgradeProgress.value?.bet_progress ?? 0)

const depositCurrent = computed(() => {
  const val = vipUpgradeProgress.value?.deposit_amount ?? 0
  return val.toFixed(2)
})
const depositTarget = computed(() => {
  const val = vipUpgradeProgress.value?.next_payment_limit ?? 0
  return val.toFixed(2)
})
const betCurrent = computed(() => {
  const val = vipUpgradeProgress.value?.bet_amount ?? 0
  return val.toFixed(2)
})
const betTarget = computed(() => {
  const val = vipUpgradeProgress.value?.next_bet_limit ?? 0
  return val.toFixed(2)
})

async function fetchVipProgress() {
  try {
    const res = await getVipUpgradeProgress()
    if (res) {
      vipUpgradeProgress.value = res
    }
  } catch (e) {
    console.error('获取VIP升级进度失败:', e)
  }
}

async function fetchGradeList() {
  try {
    const res = await userApi.getGradeList()
    if (res?.list) {
      gradeList.value = res.list
    }
  } catch (e) {
    console.error('获取等级列表失败:', e)
  }
}

const badgeGradients: string[] = [
  'linear-gradient(135deg, #6b7280, #9ca3af)',
  'linear-gradient(135deg, #552583, #7b3fa8)',
  'linear-gradient(135deg, #2563eb, #3b82f6)',
  'linear-gradient(135deg, #0891b2, #22d3ee)',
  'linear-gradient(135deg, #059669, #34d399)',
  'linear-gradient(135deg, #65a30d, #a3e635)',
  'linear-gradient(135deg, #d97706, #fbbf24)',
  'linear-gradient(135deg, #ea580c, #fb923c)',
  'linear-gradient(135deg, #dc2626, #f87171)',
  'linear-gradient(135deg, #4f46e5, #818cf8)',
  'linear-gradient(135deg, #9333ea, #c084fc)',
  'linear-gradient(135deg, #7c3aed, #a78bfa)',
  'linear-gradient(135deg, #be185d, #f472b6)',
  'linear-gradient(135deg, #b45309, #fcd34d)',
  'linear-gradient(135deg, #dc2626, #fdb927)',
]

function getVipBadgeStyle() {
  const idx = gradeList.value.findIndex((g) => g.id === userGradeId.value)
  return { background: badgeGradients[idx >= 0 ? idx : 0] || badgeGradients[0] }
}

// 资金密码弹窗
const showFundPasswordDialog = ref(false)

// 默认狮子头像（本地图片）
const defaultAvatar = '/lion-avatar..png'

// 用户数据
const userId = computed(() => userStore.userInfo?.id || '285560778')
const accountNumber = computed(() => userStore.userInfo?.username || '9188888888')
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
const messageCount = ref(0)
const supportCount = ref(7)

// 余额动画相关
const isRefreshing = ref(false)
const displayBalance = ref('0.00')

// 数字滚动动画 - 简单的数字递增效果
const animateBalance = (oldValue: string, newValue: string) => {
  const oldNum = parseFloat(oldValue) || 0
  const newNum = parseFloat(newValue) || 0
  const duration = 800 // 动画持续时间
  const steps = 30 // 动画步数
  const stepDuration = duration / steps
  const increment = (newNum - oldNum) / steps

  let currentStep = 0
  const timer = setInterval(() => {
    currentStep++
    if (currentStep >= steps) {
      displayBalance.value = newValue
      clearInterval(timer)
    } else {
      const currentValue = oldNum + increment * currentStep
      displayBalance.value = currentValue.toFixed(2)
    }
  }, stepDuration)
}

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

  if (isRefreshing.value) {
    return // 防止重复点击
  }

  isRefreshing.value = true
  const oldBalance = displayBalance.value

  try {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api'

    // 先调用刷新余额接口
    const refreshBalanceUrl = `${apiBaseUrl}/frontend/balance/refresh-balance`
    const refreshBalanceResponse = await signedFetch(refreshBalanceUrl, {
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
        const refreshResponse = await signedFetch(refreshUrl, {
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
          const retryResponse = await signedFetch(refreshBalanceUrl, {
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
              // 从 localStorage 获取完整的 user_info（包含 grade_id 和 is_pay_password）
              let fullUserInfo = { ...userStore.userInfo }
              try {
                const storedUserInfo = localStorage.getItem('user_info')
                if (storedUserInfo) {
                  fullUserInfo = JSON.parse(storedUserInfo)
                }
              } catch (error) {
                console.error('Failed to parse user_info:', error)
              }

              userStore.setUserInfo({
                ...fullUserInfo,
                balance: retryResult.data.balance || '0.00',
              })
            }

            // 触发余额动画
            animateBalance(oldBalance, retryResult.data.balance || '0.00')
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
      isRefreshing.value = false
      return
    }

    if (refreshBalanceResult.code === 0 && refreshBalanceResult.data) {
      // 保存余额信息到 localStorage
      localStorage.setItem('user_balance', JSON.stringify(refreshBalanceResult.data))

      // 更新用户信息中的余额
      if (userStore.userInfo) {
        // 从 localStorage 获取完整的 user_info（包含 grade_id 和 is_pay_password）
        let fullUserInfo = { ...userStore.userInfo }
        try {
          const storedUserInfo = localStorage.getItem('user_info')
          if (storedUserInfo) {
            fullUserInfo = JSON.parse(storedUserInfo)
          }
        } catch (error) {
          console.error('Failed to parse user_info:', error)
        }

        userStore.setUserInfo({
          ...fullUserInfo,
          balance: refreshBalanceResult.data.balance || '0.00',
        })
      }

      // 触发余额动画
      animateBalance(oldBalance, refreshBalanceResult.data.balance || '0.00')
    } else {
      showToast(refreshBalanceResult.msg || 'Failed to refresh balance')
    }
  } catch (error) {
    console.error('Failed to refresh balance:', error)
    showToast('Failed to refresh balance')
  } finally {
    setTimeout(() => {
      isRefreshing.value = false
    }, 1000) // 确保动画完成后才允许再次点击
  }
}

const fetchUnreadCount = async () => {
  if (!userStore.isLogin) {
    messageCount.value = 0
    return
  }
  try {
    const res = await userApi.getUnreadCount()
    if (res && typeof res.count === 'number') {
      messageCount.value = res.count
    } else {
      messageCount.value = 0
    }
  } catch (error) {
    console.error('获取未读消息数量失败:', error)
  }
}

const goToMessages = () => {
  router.push('/messages')
}

const handleWithdraw = () => {
  if (!userStore.isLogin) {
    showToast('Please login first')
    router.push('/login')
    return
  }

  // 检查是否设置了提现密码
  try {
    const storedUserInfo = localStorage.getItem('user_info')
    if (storedUserInfo) {
      const userInfo = JSON.parse(storedUserInfo)
      if (userInfo.is_pay_password === 0 || !userInfo.is_pay_password) {
        // 未设置提现密码，显示提示弹窗
        showFundPasswordDialog.value = true
        return
      }
    }
  } catch (error) {
    console.error('Failed to check pay password:', error)
  }

  // 已设置密码，直接跳转到提现页面
  router.push('/withdraw')
}

// 确认设置密码
const handleConfirmSetPassword = () => {
  router.push('/withdraw/set-password')
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
  if (!userStore.isLogin) {
    showToast('Please login first')
    router.push('/login')
    return
  }
  router.push('/report')
}

const goToInvite = () => {
  router.push('/invite_activity')
}

const goToRebate = () => {
  router.push('/rebate')
}

const goToSupport = () => {
  showToast('Support')
}

const goToSecurity = () => {
  router.push('/security')
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
onMounted(async () => {
  // 检查是否登录
  if (!userStore.isLogin) {
    showToast('Please login first')
    router.push('/login')
    return
  }

  // 获取VIP等级列表
  fetchGradeList()

  // 获取VIP升级进度
  fetchVipProgress()

  // 初始化显示余额
  displayBalance.value = balance.value

  // 获取未读消息数量
  fetchUnreadCount()

  // 请求用户信息接口
  try {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api'
    const userInfoUrl = `${apiBaseUrl}/frontend/app/user-info`

    const response = await signedFetch(userInfoUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${userStore.token}`,
      },
    })

    const result = await response.json()

    // 检查 token 是否过期
    if (result.code === 401 || result.code === 403) {
      // Token 过期，尝试刷新
      const refreshToken = userStore.refreshToken
      if (refreshToken) {
        const refreshUrl = `${apiBaseUrl}/frontend/app/refresh-token`
        const refreshResponse = await signedFetch(refreshUrl, {
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

          // 使用新 token 重新请求用户信息
          const retryResponse = await signedFetch(userInfoUrl, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${refreshResult.data.token}`,
            },
          })

          const retryResult = await retryResponse.json()

          if (retryResult.code === 0 && retryResult.data) {
            // 获取现有的 user_info
            let existingUserInfo = {}
            try {
              const storedUserInfo = localStorage.getItem('user_info')
              if (storedUserInfo) {
                existingUserInfo = JSON.parse(storedUserInfo)
              }
            } catch (error) {
              console.error('Failed to parse existing user_info:', error)
            }

            // 合并数据，只覆盖特定字段
            const updatedUserInfo = {
              ...existingUserInfo,
            }

            // 明确覆盖这些字段（即使值为 0 或空字符串）
            if ('grade_id' in retryResult.data) {
              updatedUserInfo.grade_id = retryResult.data.grade_id
            }
            if ('grade_name' in retryResult.data) {
              updatedUserInfo.grade_name = retryResult.data.grade_name
            }
            if ('is_pay_password' in retryResult.data) {
              updatedUserInfo.is_pay_password = retryResult.data.is_pay_password
            }

            // 保存更新后的用户信息到 localStorage
            localStorage.setItem('user_info', JSON.stringify(updatedUserInfo))
            console.log('User info updated in localStorage:', updatedUserInfo)
            console.log(
              'Updated fields - grade_id:',
              updatedUserInfo.grade_id,
              'grade_name:',
              updatedUserInfo.grade_name,
              'is_pay_password:',
              updatedUserInfo.is_pay_password,
            )
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
    } else if (result.code === 0 && result.data) {
      // 获取现有的 user_info
      let existingUserInfo = {}
      try {
        const storedUserInfo = localStorage.getItem('user_info')
        if (storedUserInfo) {
          existingUserInfo = JSON.parse(storedUserInfo)
        }
      } catch (error) {
        console.error('Failed to parse existing user_info:', error)
      }

      // 合并数据，只覆盖特定字段
      const updatedUserInfo = {
        ...existingUserInfo,
      }

      // 明确覆盖这些字段（即使值为 0 或空字符串）
      if ('grade_id' in result.data) {
        updatedUserInfo.grade_id = result.data.grade_id
      } else {
        console.log('grade_id NOT found in result.data')
      }

      if ('grade_name' in result.data) {
        updatedUserInfo.grade_name = result.data.grade_name
      } else {
        console.log('grade_name NOT found in result.data')
      }

      if ('is_pay_password' in result.data) {
        updatedUserInfo.is_pay_password = result.data.is_pay_password
      } else {
        console.log('is_pay_password NOT found in result.data')
      }

      // 保存更新后的用户信息到 localStorage
      localStorage.setItem('user_info', JSON.stringify(updatedUserInfo))

      // 立即读取验证
      const verification = localStorage.getItem('user_info')
    } else {
      console.error('Failed to get user info:', result.msg || result)
    }
  } catch (error) {
    console.error('Error fetching user info:', error)
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

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

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
          font-size: 17px;
          font-weight: bold;
          color: #fdb927;
          transition: all 0.3s ease;
        }

        .van-icon {
          cursor: pointer;
          transition: transform 0.2s;

          &:active {
            transform: scale(0.9);
          }

          &.rotating {
            animation: rotate 1s linear;
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
      background: none;
      border: none;
      padding: 0;
      line-height: 1;

      :deep(.van-icon) {
        background: none !important;
        border: none !important;
      }

      .msg-badge {
        position: absolute;
        top: -6px;
        right: -8px;
        min-width: 16px;
        height: 16px;
        padding: 0 4px;
        border-radius: 8px;
        background: #ff4757;
        color: #fff;
        font-size: 10px;
        font-weight: bold;
        line-height: 16px;
        text-align: center;
      }

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
    background: linear-gradient(135deg, #552583 0%, #3a1a5c 50%, #6b2fa0 100%);
    border-radius: 12px;
    padding: 8px 12px;
    margin-bottom: 16px;
    box-shadow: 0 4px 16px rgba(85, 37, 131, 0.4);
    cursor: pointer;
    transition: transform 0.2s;
    position: relative;
    overflow: hidden;

    // 装饰光晕
    &::after {
      content: '';
      position: absolute;
      top: -30%;
      right: -15%;
      width: 140px;
      height: 140px;
      background: radial-gradient(circle, rgba(253, 185, 39, 0.1) 0%, transparent 70%);
      border-radius: 50%;
      pointer-events: none;
    }

    &:active {
      transform: scale(0.98);
    }

    .vip-top-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;

      .vip-badge {
        display: inline-block;
        font-size: 12px;
        font-weight: 900;
        color: #fff;
        padding: 3px 10px;
        border-radius: 20px;
        letter-spacing: 0.5px;
        flex-shrink: 0;
      }

      .vip-next-tag {
        display: flex;
        align-items: center;
        gap: 2px;
        background: rgba(253, 185, 39, 0.15);
        border: 1px solid rgba(253, 185, 39, 0.3);
        border-radius: 10px;
        padding: 1px 6px;

        span {
          font-size: 10px;
          font-weight: 700;
          color: #fdb927;
        }
      }

      .vip-max-tag {
        font-size: 10px;
        font-weight: 800;
        color: #fdb927;
      }

      .arrow-icon {
        margin-left: auto;
      }
    }

    .vip-req-row {
      display: flex;
      align-items: stretch;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 8px;
      padding: 5px 8px;
      margin-bottom: 0;

      .req-col {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 3px;
      }

      .req-item {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .req-left {
          display: flex;
          align-items: center;
          gap: 3px;
        }

        .req-icon {
          font-size: 12px;
          flex-shrink: 0;
        }

        .req-label {
          font-size: 9px;
          color: rgba(255, 255, 255, 0.5);
          font-weight: 500;
        }

        .req-value {
          font-size: 11px;
          font-weight: 800;
          color: #fff;
        }
      }

      .req-divider {
        width: 1px;
        background: rgba(255, 255, 255, 0.12);
        margin: 0 6px;
        flex-shrink: 0;
      }
    }

    .vip-desc {
      flex: 1;
      font-size: 13px;
      color: rgba(255, 255, 255, 0.7);
      em {
        font-style: normal;
        font-weight: 800;
        color: #fdb927;
      }
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

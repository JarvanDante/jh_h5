<template>
  <div class="set-password-page">
    <!-- 顶部导航栏 -->
    <div class="top-bar">
      <van-icon name="arrow-left" size="24" color="#fff" @click="goBack" />
      <span class="title">Withdraw Password</span>
      <div class="placeholder"></div>
    </div>

    <!-- 设置密码表单 -->
    <div v-if="!isSuccess" class="content">
      <!-- 标题 -->
      <div class="page-title">Set Withdraw Password</div>

      <!-- 新密码输入 -->
      <div class="password-section">
        <div class="section-label">New Withdraw Password</div>
        <div class="password-inputs">
          <input
            v-for="(digit, index) in newPassword"
            :key="'new-' + index"
            :ref="(el) => (newPasswordRefs[index] = el)"
            type="password"
            maxlength="1"
            class="password-input"
            :class="{ active: currentNewIndex === index, filled: digit !== '' }"
            :value="digit"
            @input="handleNewPasswordInput(index, $event)"
            @keydown="handleKeyDown(index, $event, 'new')"
            @focus="currentNewIndex = index"
          />
        </div>
      </div>

      <!-- 确认密码输入 -->
      <div class="password-section">
        <div class="section-label">Confirm New Password</div>
        <div class="password-inputs">
          <input
            v-for="(digit, index) in confirmPassword"
            :key="'confirm-' + index"
            :ref="(el) => (confirmPasswordRefs[index] = el)"
            type="password"
            maxlength="1"
            class="password-input"
            :class="{ active: currentConfirmIndex === index, filled: digit !== '' }"
            :value="digit"
            @input="handleConfirmPasswordInput(index, $event)"
            @keydown="handleKeyDown(index, $event, 'confirm')"
            @focus="currentConfirmIndex = index"
          />
        </div>
      </div>

      <!-- 提示文字 -->
      <div class="hint-text">
        The first withdrawal, you need to set the withdrawal password first
      </div>

      <!-- 提交按钮 -->
      <van-button class="submit-btn" block :loading="isSubmitting" @click="handleSubmit">
        Withdraw Now
      </van-button>
    </div>

    <!-- 成功页面 -->
    <div v-else class="success-content">
      <!-- 成功图标 -->
      <div class="success-icon">
        <van-icon name="success" size="80" color="#07c160" />
      </div>

      <!-- 成功标题 -->
      <div class="success-title">Set successfully</div>

      <!-- 成功提示 -->
      <div class="success-message">
        Your new password has been set. Please remember your password
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <van-button class="home-btn" block @click="goToHome">Return to homepage</van-button>
        <van-button class="withdraw-btn" block @click="goToWithdraw">
          Continue withdrawal
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

// 页面状态
const isSuccess = ref(false)

// 密码输入
const newPassword = ref(['', '', '', '', '', ''])
const confirmPassword = ref(['', '', '', '', '', ''])
const currentNewIndex = ref(0)
const currentConfirmIndex = ref(0)

// 输入框引用
const newPasswordRefs = ref<(HTMLInputElement | null)[]>([])
const confirmPasswordRefs = ref<(HTMLInputElement | null)[]>([])

// 提交状态
const isSubmitting = ref(false)

// 页面加载时检查是否已设置密码
onMounted(() => {
  try {
    const storedUserInfo = localStorage.getItem('user_info')
    if (storedUserInfo) {
      const userInfo = JSON.parse(storedUserInfo)
      // 如果已经设置了支付密码，直接显示成功页面
      if (userInfo.is_pay_password === 1) {
        isSuccess.value = true
      }
    }
  } catch (error) {
    console.error('Failed to check pay password status:', error)
  }
})

// 处理新密码输入
const handleNewPasswordInput = (index: number, event: Event) => {
  const input = event.target as HTMLInputElement
  const value = input.value

  if (value && /^\d$/.test(value)) {
    newPassword.value[index] = value

    // 自动跳转到下一个输入框
    if (index < 5) {
      currentNewIndex.value = index + 1
      newPasswordRefs.value[index + 1]?.focus()
    } else {
      // 最后一个输入框，跳转到确认密码第一个输入框
      currentConfirmIndex.value = 0
      confirmPasswordRefs.value[0]?.focus()
    }
  } else {
    input.value = ''
  }
}

// 处理确认密码输入
const handleConfirmPasswordInput = (index: number, event: Event) => {
  const input = event.target as HTMLInputElement
  const value = input.value

  if (value && /^\d$/.test(value)) {
    confirmPassword.value[index] = value

    // 自动跳转到下一个输入框
    if (index < 5) {
      currentConfirmIndex.value = index + 1
      confirmPasswordRefs.value[index + 1]?.focus()
    }
  } else {
    input.value = ''
  }
}

// 处理键盘事件
const handleKeyDown = (index: number, event: KeyboardEvent, type: 'new' | 'confirm') => {
  if (event.key === 'Backspace') {
    event.preventDefault()

    if (type === 'new') {
      if (newPassword.value[index]) {
        newPassword.value[index] = ''
      } else if (index > 0) {
        currentNewIndex.value = index - 1
        newPasswordRefs.value[index - 1]?.focus()
        newPassword.value[index - 1] = ''
      }
    } else {
      if (confirmPassword.value[index]) {
        confirmPassword.value[index] = ''
      } else if (index > 0) {
        currentConfirmIndex.value = index - 1
        confirmPasswordRefs.value[index - 1]?.focus()
        confirmPassword.value[index - 1] = ''
      }
    }
  }
}

// 提交密码
const handleSubmit = async () => {
  const newPwd = newPassword.value.join('')
  const confirmPwd = confirmPassword.value.join('')

  // 验证密码长度
  if (newPwd.length !== 6) {
    showToast('Please enter 6-digit password')
    return
  }

  if (confirmPwd.length !== 6) {
    showToast('Please confirm your password')
    return
  }

  // 验证两次密码是否一致
  if (newPwd !== confirmPwd) {
    showToast('Passwords do not match')
    return
  }

  // 验证是否全是数字
  if (!/^\d{6}$/.test(newPwd)) {
    showToast('Password must be 6 digits')
    return
  }

  isSubmitting.value = true

  try {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api'
    const setPasswordUrl = `${apiBaseUrl}/frontend/app/set-pay-password`

    const response = await fetch(setPasswordUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userStore.token}`,
      },
      body: JSON.stringify({
        pay_password: newPwd,
      }),
    })

    const result = await response.json()

    if (result.code === 0) {
      // 更新 localStorage 中的 is_pay_password
      try {
        const storedUserInfo = localStorage.getItem('user_info')
        if (storedUserInfo) {
          const userInfo = JSON.parse(storedUserInfo)
          userInfo.is_pay_password = 1
          localStorage.setItem('user_info', JSON.stringify(userInfo))
        }
      } catch (error) {
        console.error('Failed to update user_info:', error)
      }

      // 显示成功页面
      isSuccess.value = true
    } else {
      showToast(result.msg || 'Failed to set password')
    }
  } catch (error) {
    console.error('Error setting password:', error)
    showToast('Failed to set password')
  } finally {
    isSubmitting.value = false
  }
}

// 返回首页
const goToHome = () => {
  router.replace('/home')
}

// 继续提现
const goToWithdraw = () => {
  router.replace('/withdraw')
}

// 返回
const goBack = () => {
  router.back()
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.set-password-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #1a0d2e 0%, #3d1f5c 100%);

  .top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: #552583;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .title {
      color: #fff;
      font-size: 20px;
      font-weight: bold;
    }

    .placeholder {
      width: 24px;
    }
  }

  .content {
    padding: 40px 24px;

    .page-title {
      color: #fff;
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 48px;
      text-align: left;
    }

    .password-section {
      margin-bottom: 40px;

      .section-label {
        color: rgba(255, 255, 255, 0.7);
        font-size: 14px;
        margin-bottom: 16px;
      }

      .password-inputs {
        display: grid;
        grid-template-columns: repeat(6, 1fr);
        gap: 8px;
        max-width: 320px;

        .password-input {
          width: 100%;
          height: 48px;
          background: rgba(255, 255, 255, 0.08);
          border: 2px solid rgba(255, 255, 255, 0.15);
          border-radius: 8px;
          color: #fff;
          font-size: 20px;
          font-weight: bold;
          text-align: center;
          outline: none;
          transition: all 0.3s;

          &.active {
            border-color: $secondary-color;
            background: rgba(253, 185, 39, 0.1);
            box-shadow: 0 0 0 2px rgba(253, 185, 39, 0.2);
          }

          &.filled {
            border-color: $secondary-color;
            background: rgba(253, 185, 39, 0.15);
          }

          &:focus {
            border-color: $secondary-color;
            background: rgba(253, 185, 39, 0.1);
          }
        }
      }
    }

    .hint-text {
      color: rgba(255, 255, 255, 0.6);
      font-size: 13px;
      line-height: 1.6;
      margin-bottom: 48px;
      text-align: center;
    }

    .submit-btn {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: #fff;
      border: none;
      border-radius: 16px;
      font-size: 18px;
      font-weight: bold;
      height: 56px;
      box-shadow: 0 4px 16px rgba(59, 130, 246, 0.4);
      transition: all 0.3s ease;
      touch-action: manipulation;
      user-select: none;
      -webkit-tap-highlight-color: transparent;

      &:active {
        transform: scale(0.98);
        opacity: 0.9;
      }
    }
  }

  // 成功页面
  .success-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 24px 40px;
    min-height: calc(100vh - 120px);

    .success-icon {
      margin-bottom: 32px;
      animation: scaleIn 0.5s ease-out;
    }

    .success-title {
      color: #fff;
      font-size: 28px;
      font-weight: bold;
      margin-bottom: 16px;
      text-align: center;
    }

    .success-message {
      color: rgba(255, 255, 255, 0.8);
      font-size: 15px;
      line-height: 1.6;
      text-align: center;
      margin-bottom: 48px;
      max-width: 320px;
    }

    .action-buttons {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 16px;

      .home-btn {
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        color: #fff;
        border: none;
        border-radius: 16px;
        font-size: 16px;
        font-weight: bold;
        height: 52px;
        box-shadow: 0 4px 16px rgba(59, 130, 246, 0.4);
        transition: all 0.3s ease;
        touch-action: manipulation;
        user-select: none;
        -webkit-tap-highlight-color: transparent;

        &:active {
          transform: scale(0.98);
          opacity: 0.9;
        }
      }

      .withdraw-btn {
        background: linear-gradient(135deg, #552583 0%, #7b3fa8 100%);
        color: #fff;
        border: none;
        border-radius: 16px;
        font-size: 16px;
        font-weight: bold;
        height: 52px;
        box-shadow: 0 4px 16px rgba(85, 37, 131, 0.4);
        transition: all 0.3s ease;
        touch-action: manipulation;
        user-select: none;
        -webkit-tap-highlight-color: transparent;

        &:active {
          transform: scale(0.98);
          opacity: 0.9;
        }
      }
    }
  }
}

@keyframes scaleIn {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>

<template>
  <div class="set-password-page">
    <!-- 顶部导航栏 -->
    <div class="top-bar">
      <van-icon name="arrow-left" size="24" color="#fff" @click="goBack" />
      <span class="title">Withdraw Password</span>
      <div class="placeholder"></div>
    </div>

    <div class="content">
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
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

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

  isSubmitting.value = true

  try {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api'
    const setPasswordUrl = `${apiBaseUrl}/frontend/user/set-pay-password`

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
      showToast('Password set successfully')

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

      // 跳转到提现页面
      router.replace('/withdraw')
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
}
</style>

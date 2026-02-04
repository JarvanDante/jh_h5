<template>
  <div class="login-page">
    <van-nav-bar
      title="Login"
      left-arrow
      @click-left="goBack"
      :style="{ background: 'linear-gradient(135deg, #552583 0%, #7B3FA8 100%)' }"
    />

    <div class="login-form">
      <div class="logo">
        <div class="logo-icon">🎰</div>
        <p class="welcome-text">Welcome Back!</p>
      </div>

      <van-form @submit="onSubmit">
        <van-cell-group inset>
          <van-field
            v-model="formData.username"
            name="username"
            label="Username"
            placeholder="Enter username"
            :rules="[{ required: true, message: 'Please enter username' }]"
          />
          <van-field
            v-model="formData.password"
            type="password"
            name="password"
            label="Password"
            placeholder="Enter password"
            :rules="[{ required: true, message: 'Please enter password' }]"
          />
          <van-field
            v-model="formData.captcha"
            name="captcha"
            label="Captcha"
            placeholder="Enter captcha code"
            :rules="[{ required: true, message: 'Please enter captcha code' }]"
          >
            <template #button>
              <img :src="captchaUrl" alt="captcha" class="captcha-image" @click="refreshCaptcha" />
            </template>
          </van-field>
        </van-cell-group>

        <div class="submit-button">
          <van-button round block color="#552583" native-type="submit" :loading="loading">
            Login
          </van-button>
        </div>

        <div class="extra-links">
          <a @click="handleForgotPassword" class="link">Forgot Password?</a>
          <a @click="goToRegister" class="link">Register</a>
        </div>
      </van-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showDialog } from 'vant'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loading = ref(false)
const formData = reactive({
  username: '',
  password: '',
  captcha: '',
})

// 获取 API 基础路径
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api'

// 验证码时间戳 - 用于验证码和登录请求
const captchaTime = ref(Date.now().toString())

// 验证码URL - 使用完整的 API 路径
const captchaUrl = ref(`${apiBaseUrl}/frontend/app/captcha?time=${captchaTime.value}`)

// 刷新验证码
const refreshCaptcha = () => {
  captchaTime.value = Date.now().toString()
  captchaUrl.value = `${apiBaseUrl}/frontend/app/captcha?time=${captchaTime.value}`
}

// 返回上一页
const goBack = () => {
  router.back()
}

const onSubmit = async () => {
  try {
    loading.value = true

    // 验证验证码
    if (!formData.captcha) {
      showToast('Please enter captcha code')
      return
    }

    // 调用真实的登录接口
    const loginUrl = `${apiBaseUrl}/frontend/app/login`
    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        username: formData.username,
        password: formData.password,
        code: formData.captcha,
        time: captchaTime.value,
      }),
    })

    const result = await response.json()

    if (result.code === 0 && result.data) {
      // 登录成功
      const { token, refresh_token } = result.data

      // 保存 token
      userStore.setToken(token)

      // 保存 refresh_token
      if (refresh_token) {
        userStore.setRefreshToken(refresh_token)
      }

      // 使用 token 获取用户详细信息
      try {
        const userInfoUrl = `${apiBaseUrl}/frontend/app/user-info`
        const userInfoResponse = await fetch(userInfoUrl, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const userInfoResult = await userInfoResponse.json()

        if (userInfoResult.code === 0 && userInfoResult.data) {
          // 保存用户详细信息 - 使用 user_id 作为 id
          userStore.setUserInfo({
            id: userInfoResult.data.user_id || 0,
            username: userInfoResult.data.username || formData.username,
            nickname:
              userInfoResult.data.nickname || userInfoResult.data.username || formData.username,
            avatar: userInfoResult.data.avatar || '',
            mobile: userInfoResult.data.mobile || '',
            email: userInfoResult.data.email || '',
            balance: userInfoResult.data.balance || '0.00',
            realname: userInfoResult.data.realname || '',
            grade_name: userInfoResult.data.grade_name || '',
          })
        }
      } catch (error) {
        console.error('Failed to fetch user info:', error)
        // 即使获取用户信息失败，也继续登录流程
      }

      // 调用刷新余额接口
      try {
        const refreshBalanceUrl = `${apiBaseUrl}/frontend/balance/refresh-balance`
        const refreshBalanceResponse = await fetch(refreshBalanceUrl, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const refreshBalanceResult = await refreshBalanceResponse.json()

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
        }
      } catch (error) {
        console.error('Failed to refresh balance:', error)
        // 余额刷新失败不影响登录流程
      }

      showToast('Login successful')

      // 跳转到之前的页面或首页
      const redirect = route.query.redirect as string
      router.replace(redirect || '/home')
    } else {
      // 登录失败
      showToast(result.msg || 'Login failed')
      // 刷新验证码
      refreshCaptcha()
      // 清空验证码输入
      formData.captcha = ''
    }
  } catch (error) {
    console.error('Login failed:', error)
    showToast('Login failed')
    // 刷新验证码
    refreshCaptcha()
    // 清空验证码输入
    formData.captcha = ''
  } finally {
    loading.value = false
  }
}

// 跳转到注册页
const goToRegister = () => {
  router.push('/register')
}

// 处理忘记密码
const handleForgotPassword = () => {
  showDialog({
    title: 'Forgot Password?',
    message:
      'Please contact our customer service to reset your password.\n\n📱 Telegram: @YourSupport\n💬 WhatsApp: +1234567890\n📧 Email: support@example.com',
    confirmButtonText: 'OK',
    confirmButtonColor: '#552583',
  })
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.login-page {
  min-height: 100vh;
  background: $background-color;

  :deep(.van-nav-bar) {
    .van-nav-bar__title {
      color: #fff;
    }

    .van-icon {
      color: #fff;
    }
  }

  .login-form {
    padding: 40px 16px;

    .logo {
      text-align: center;
      margin-bottom: 48px;

      .logo-icon {
        font-size: 80px;
        margin-bottom: 24px;
        animation: pulse 2s ease-in-out infinite;
      }

      .welcome-text {
        color: #1f1f1f;
        font-size: 24px;
        font-weight: 600;
        margin: 0;
      }
    }

    @keyframes pulse {
      0%,
      100% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.05);
      }
    }

    .submit-button {
      margin-top: 24px;
      padding: 0 16px;
    }

    .captcha-image {
      height: 40px;
      width: 120px;
      border-radius: 4px;
      cursor: pointer;
      border: 1px solid #ebedf0;
      object-fit: cover;
    }

    .extra-links {
      display: flex;
      justify-content: space-between;
      padding: 16px;
      margin-top: 16px;

      .link {
        color: #552583;
        font-size: 14px;
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
}
</style>

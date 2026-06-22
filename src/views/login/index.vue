<template>
  <div class="login-page">
    <!-- 背景层 -->
    <div class="bg-image"></div>
    <div class="bg-glow-1"></div>
    <div class="bg-glow-2"></div>
    <div class="bg-glow-3"></div>

    <van-nav-bar
      :title="t('login.title')"
      left-arrow
      @click-left="goBack"
      :style="{ background: 'linear-gradient(135deg, #552583 0%, #7B3FA8 100%)' }"
    />

    <div class="login-form">
      <div class="logo">
        <div class="logo-icon">🎰</div>
        <p class="welcome-text">{{ t('login.welcomeBack') }}</p>
      </div>

      <van-form @submit="onSubmit">
        <van-cell-group inset>
          <van-field
            v-model="formData.username"
            name="username"
            :label="t('login.username')"
            :placeholder="t('login.usernamePlaceholder')"
            :rules="[{ required: true, message: t('login.usernameRequired') }]"
          />
          <van-field
            v-model="formData.password"
            :type="showPassword ? 'text' : 'password'"
            name="password"
            :label="t('login.password')"
            :placeholder="t('login.passwordPlaceholder')"
            :rules="[{ required: true, message: t('login.passwordRequired') }]"
          >
            <template #right-icon>
              <van-icon
                class="eye-icon"
                :name="showPassword ? 'closed-eye' : 'eye-o'"
                @click="showPassword = !showPassword"
              />
            </template>
          </van-field>
          <van-field
            v-model="formData.captcha"
            name="captcha"
            :label="t('login.captcha')"
            :placeholder="t('login.captchaPlaceholder')"
            maxlength="4"
            :rules="[{ required: true, message: t('login.captchaRequired') }]"
          >
            <template #button>
              <img :src="captchaUrl" alt="captcha" class="captcha-image" @click="refreshCaptcha" />
            </template>
          </van-field>
        </van-cell-group>

        <div class="submit-button">
          <van-button round block color="#552583" native-type="submit" :loading="loading">
            {{ t('login.title') }}
          </van-button>
        </div>

        <div class="extra-links">
          <a @click="handleForgotPassword" class="link">{{ t('login.forgotPassword') }}</a>
          <a @click="goToRegister" class="link">{{ t('common.register') }}</a>
        </div>
      </van-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { showToast, showDialog } from 'vant'
import { useUserStore } from '@/stores/user'
import { userApi } from '@/api'
import { signedFetch } from '@/utils/request'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const { t } = useI18n()

const loading = ref(false)
const showPassword = ref(false)
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

onMounted(() => {
  // 兜底：进入登录页时重置可能残留的全局 loading
  window.dispatchEvent(new CustomEvent('app:global-loading-reset'))
})

// 刷新验证码
const refreshCaptcha = () => {
  captchaTime.value = Date.now().toString()
  captchaUrl.value = `${apiBaseUrl}/frontend/app/captcha?time=${captchaTime.value}`
}

// 返回上一页
const goBack = () => {
  router.back()
}

const detectClientMeta = () => {
  const ua = navigator.userAgent || ''
  const uaLower = ua.toLowerCase()

  let os = 'Unknown'
  if (uaLower.includes('android')) os = 'Android'
  else if (uaLower.includes('iphone') || uaLower.includes('ios')) os = 'iOS'
  else if (uaLower.includes('ipad')) os = 'iPadOS'
  else if (uaLower.includes('windows')) os = 'Windows'
  else if (uaLower.includes('mac os') || uaLower.includes('macintosh')) os = 'macOS'
  else if (uaLower.includes('linux')) os = 'Linux'

  let browser = 'Unknown'
  if (uaLower.includes('edg/')) browser = 'Edge'
  else if (uaLower.includes('opr/') || uaLower.includes('opera')) browser = 'Opera'
  else if (uaLower.includes('chrome/')) browser = 'Chrome'
  else if (uaLower.includes('safari/') && !uaLower.includes('chrome/')) browser = 'Safari'
  else if (uaLower.includes('firefox/')) browser = 'Firefox'

  const network = (navigator as any).connection?.effectiveType || ''
  const screen = `${window.screen.width || 0}x${window.screen.height || 0}`

  return { os, browser, network, screen }
}

const onSubmit = async () => {
  try {
    loading.value = true

    // 验证验证码
    if (!formData.captcha) {
      showToast(t('login.captchaRequired'))
      return
    }

    // 调用真实的登录接口
    const loginUrl = `${apiBaseUrl}/frontend/app/login`
    const clientMeta = detectClientMeta()
    const response = await signedFetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Device-OS': clientMeta.os,
        'X-Device-Browser': clientMeta.browser,
        'X-Network-Type': clientMeta.network,
        'X-Screen-Resolution': clientMeta.screen,
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

      // 请求用户信息接口
      let latestBalance = '0.00'
      try {
        const userInfoRes = await userApi.getUserInfo()
        if (userInfoRes) {
          latestBalance = userInfoRes.balance || '0.00'
          userStore.setUserInfo({
            id: userInfoRes.user_id || 0,
            username: userInfoRes.username || formData.username,
            nickname: userInfoRes.nickname || userInfoRes.username || formData.username,
            avatar: userInfoRes.avatar || '',
            mobile: userInfoRes.mobile || '',
            email: userInfoRes.email || '',
            balance: latestBalance,
            realname: userInfoRes.realname || '',
            grade_name: userInfoRes.grade_name || '',
          })
        }
      } catch (error) {
        console.error('Failed to fetch user info:', error)
      }

      // 先同步一次余额，避免旧余额残留
      localStorage.setItem(
        'user_balance',
        JSON.stringify({ balance: latestBalance, balance_frozen: '0.00', points: 0 }),
      )

      // 调用刷新余额接口
      try {
        const refreshBalanceUrl = `${apiBaseUrl}/frontend/balance/refresh-balance`
        const refreshBalanceResponse = await signedFetch(refreshBalanceUrl, {
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
      }

      showToast(t('login.loginSuccess'))

      // 登录成功后回到首页时，广告弹窗再展示一次
      localStorage.setItem('ad_popup_resume', '1')

      // 跳转到之前的页面或首页
      const redirect = route.query.redirect as string
      router.replace(redirect || '/home')
    } else {
      // 登录失败
      showToast(result.msg || t('login.loginFailed'))
      // 刷新验证码
      refreshCaptcha()
      // 清空验证码输入
      formData.captcha = ''
    }
  } catch (error) {
    console.error('Login failed:', error)
    showToast(t('login.loginFailed'))
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
    title: t('login.forgotPasswordTitle'),
    message: t('login.forgotPasswordMessage'),
    confirmButtonText: t('common.ok'),
    confirmButtonColor: '#552583',
  })
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.login-page {
  min-height: 100vh;
  background: #0d0618;
  position: relative;
  overflow: hidden;

  // 背景图 - 置灰低透明度
  .bg-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: url('/coin.webp') center center / cover no-repeat;
    filter: grayscale(100%) brightness(0.3);
    opacity: 0.25;
    pointer-events: none;
    z-index: 0;
  }

  // 紫色光晕 - 左上
  .bg-glow-1 {
    position: absolute;
    top: -10%;
    left: -15%;
    width: 50%;
    height: 45%;
    background: radial-gradient(circle, rgba(85, 37, 131, 0.4) 0%, transparent 70%);
    filter: blur(50px);
    pointer-events: none;
    z-index: 0;
  }

  // 金色光晕 - 右下
  .bg-glow-2 {
    position: absolute;
    bottom: 5%;
    right: -10%;
    width: 45%;
    height: 40%;
    background: radial-gradient(circle, rgba(253, 185, 39, 0.1) 0%, transparent 70%);
    filter: blur(60px);
    pointer-events: none;
    z-index: 0;
  }

  // 紫色光晕 - 右上角微弱
  .bg-glow-3 {
    position: absolute;
    top: 15%;
    right: -5%;
    width: 35%;
    height: 30%;
    background: radial-gradient(circle, rgba(123, 63, 168, 0.2) 0%, transparent 70%);
    filter: blur(40px);
    pointer-events: none;
    z-index: 0;
  }

  :deep(.van-nav-bar) {
    .van-nav-bar__title {
      color: #fff;
    }

    .van-icon {
      color: #fff;
    }

    &::after {
      display: none;
    }
  }

  .login-form {
    padding: 40px 16px;
    position: relative;
    z-index: 1;

    .logo {
      text-align: center;
      margin-bottom: 48px;

      .logo-icon {
        font-size: 80px;
        margin-bottom: 24px;
        animation: pulse 2s ease-in-out infinite;
      }

      .welcome-text {
        color: rgba(255, 255, 255, 0.9);
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

      :deep(.van-button) {
        background: linear-gradient(135deg, #552583, #7b3fa8) !important;
        border: none !important;
        box-shadow: 0 4px 16px rgba(85, 37, 131, 0.5);
      }
    }

    .captcha-image {
      height: 32px;
      width: 100px;
      border-radius: 6px;
      cursor: pointer;
      border: 1px solid rgba(255, 255, 255, 0.15);
      object-fit: cover;
      filter: invert(1) hue-rotate(180deg) brightness(0.9);
    }

    :deep(.van-cell-group--inset) {
      background: rgba(255, 255, 255, 0.07);
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(12px);
    }

    :deep(.van-cell) {
      background: transparent;
      padding: 12px 16px;
      align-items: center;
      &::after {
        border-color: rgba(255, 255, 255, 0.08);
      }
    }

    :deep(.van-field__label) {
      color: rgba(255, 255, 255, 0.6);
      width: 5.2em;
    }
    :deep(.van-field__control) {
      color: #fff;
    }
    :deep(.van-field__control::placeholder) {
      color: rgba(255, 255, 255, 0.3);
    }

    .extra-links {
      display: flex;
      justify-content: space-between;
      padding: 16px;
      margin-top: 16px;

      .link {
        color: #fdb927;
        font-size: 14px;
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  }

  .eye-icon {
    font-size: 18px;
    color: #999;
    padding: 0 4px;
    cursor: pointer;
  }
}
</style>

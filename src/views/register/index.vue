<template>
  <div class="register-page">
    <!-- 背景层 -->
    <div class="bg-image"></div>
    <div class="bg-glow-1"></div>
    <div class="bg-glow-2"></div>
    <div class="bg-glow-3"></div>

    <van-nav-bar
      title="Register"
      left-arrow
      @click-left="onClickLeft"
      :style="{ background: 'linear-gradient(135deg, #552583 0%, #7B3FA8 100%)' }"
    />

    <div class="register-form">
      <div class="logo">
        <div class="logo-icon">🎰</div>
        <p class="welcome-text">Join Us Now!</p>
      </div>

      <van-form @submit="onSubmit">
        <van-cell-group inset>
          <van-field
            v-model="formData.username"
            name="username"
            label="Username"
            placeholder="Letters and numbers (6~16)"
            :rules="[{ required: true, message: 'Please enter username' }]"
          />
          <van-field
            v-model="formData.password"
            :type="showPassword ? 'text' : 'password'"
            name="password"
            label="Password"
            placeholder="password(6~20)"
            :rules="[
              { required: true, message: 'Please enter password' },
              { min: 6, message: 'Password must be at least 6 characters' },
            ]"
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
            v-model="formData.confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            name="confirmPassword"
            label="Confirm"
            placeholder="Confirm password"
            :rules="[
              { required: true, message: 'Please confirm password' },
              { validator: validatePassword, message: 'Passwords do not match' },
            ]"
          >
            <template #right-icon>
              <van-icon
                class="eye-icon"
                :name="showConfirmPassword ? 'closed-eye' : 'eye-o'"
                @click="showConfirmPassword = !showConfirmPassword"
              />
            </template>
          </van-field>
          <van-field
            v-model="formData.captchaCode"
            name="captchaCode"
            label="Captcha"
            placeholder="Enter captcha"
            maxlength="4"
            :rules="[{ required: true, message: 'Please enter captcha code' }]"
          >
            <template #button>
              <img
                :src="captchaImage"
                alt="captcha"
                class="captcha-image"
                @click="refreshCaptcha"
              />
            </template>
          </van-field>
        </van-cell-group>

        <!-- 协议勾选 -->
        <div class="agreement-section">
          <van-checkbox v-model="agreed" icon-size="16px">
            <span class="agreement-text"> I am 18+ and agree to the terms & conditions </span>
          </van-checkbox>
        </div>

        <!-- 注册按钮 -->
        <div class="submit-button">
          <van-button round block color="#552583" native-type="submit" :loading="loading">
            Register
          </van-button>
        </div>

        <!-- 快速注册按钮 -->
        <!-- <div class="quick-register-section">
          <van-button
            round
            block
            plain
            color="#FDB927"
            :loading="quickLoading"
            @click="handleQuickRegister"
          >
            Quick Register 🎁
          </van-button>
        </div> -->

        <!-- Invite 活动下线，去掉注册页邀请提示 -->
        <!-- <div class="tips-text">💡 Invite 1 person and get ₱200</div> -->

        <!-- 已有账号 -->
        <div class="login-link">
          <span>Already have an account?</span>
          <a @click="goToLogin">Login now</a>
        </div>
      </van-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import { useUserStore } from '@/stores/user'
import { refreshBalance as refreshBalanceApi, userApi } from '@/api'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loading = ref(false)
const quickLoading = ref(false)
const agreed = ref(false)
const captchaImage = ref('')
const captchaTime = ref('') // 改为字符串类型
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const inviteCode = ref('') // 邀请码

const formData = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  captchaCode: '',
})

// 验证密码是否一致
const validatePassword = () => {
  return formData.password === formData.confirmPassword
}

// 获取当前域名
const getCurrentDomain = () => {
  return window.location.hostname
}

// 获取微秒时间戳（字符串）
const getMicrosecondTimestamp = () => {
  return String(Date.now() * 1000)
}

// 获取验证码
const getCaptcha = async () => {
  try {
    captchaTime.value = getMicrosecondTimestamp()

    // 直接使用图片 URL
    captchaImage.value = `${import.meta.env.VITE_API_BASE_URL}/frontend/app/captcha?time=${captchaTime.value}`
  } catch (error) {
    console.error('Failed to get captcha:', error)
    showToast('Failed to load captcha')
  }
}

// 刷新验证码
const refreshCaptcha = () => {
  getCaptcha()
}

const onClickLeft = () => {
  router.back()
}

const extractRpcMessage = (rawMsg?: string) => {
  if (!rawMsg) return ''
  const match = rawMsg.match(/desc\\s*=\\s*(.*)$/)
  if (match && match[1]) {
    return match[1].trim()
  }
  return rawMsg
}

// 普通注册
const onSubmit = async () => {
  if (!agreed.value) {
    showToast('Please agree to the terms & conditions')
    return
  }

  if (!formData.captchaCode) {
    showToast('Please enter captcha code')
    return
  }

  try {
    loading.value = true

    // 调用注册接口
    const res: any = await userApi.register({
      username: formData.username,
      password: formData.password,
      time: captchaTime.value,
      code: formData.captchaCode,
      invite_code: inviteCode.value, // 传递邀请码
    })

    if (res?.code && res.code !== 0) {
      showToast(extractRpcMessage(res.msg) || 'Registration failed')
      refreshCaptcha()
      return
    }

    if (!res?.token) {
      showToast(extractRpcMessage(res?.message) || 'Registration failed')
      refreshCaptcha()
      return
    }

    // 1. 先保存 token
    userStore.setToken(res.token)

    // 2. 保存 refresh_token（如果有）
    if (res.refresh_token) {
      userStore.setRefreshToken(res.refresh_token)
    }

    // 3. 请求用户信息接口
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
      console.error('Failed to get user info:', error)
    }

    // 先同步一次余额，避免旧余额残留
    localStorage.setItem(
      'user_balance',
      JSON.stringify({ balance: latestBalance, balance_frozen: '0.00', points: 0 }),
    )

    // 再刷新余额（以服务端为准）
    try {
      const balanceRes = await refreshBalanceApi()
      if (balanceRes) {
        localStorage.setItem('user_balance', JSON.stringify(balanceRes))
        if (userStore.userInfo) {
          userStore.setUserInfo({
            ...userStore.userInfo,
            balance: balanceRes.balance || '0.00',
          })
        }
      }
    } catch (error) {
      console.error('Failed to refresh balance:', error)
    }

    showToast('Registration successful!')

    // 跳转到首页
    setTimeout(() => {
      router.replace('/home')
    }, 500)
  } catch (error: any) {
    console.error('Registration failed:', error)
    const errorMsg = error?.response?.data?.message || error?.message || 'Registration failed'
    showToast(errorMsg)
    // 刷新验证码
    refreshCaptcha()
  } finally {
    loading.value = false
  }
}

// 快速注册
const handleQuickRegister = async () => {
  if (!agreed.value) {
    showToast('Please agree to the terms & conditions')
    return
  }

  try {
    quickLoading.value = true

    // 调用快速注册接口
    const res = await userApi.quickRegister({
      time: getMicrosecondTimestamp(),
      domain: getCurrentDomain(),
    })

    // 1. 先保存 token
    if (res.token) {
      userStore.setToken(res.token)

      // 2. 然后请求用户信息接口
      let latestBalance = '0.00'
      try {
        const userInfo = await userApi.getUserInfo(res.token)
        if (userInfo) {
          latestBalance = userInfo.balance || '0.00'
          userStore.setUserInfo(userInfo)
        }
      } catch (error) {
        console.error('Failed to get user info:', error)
      }

      // 先同步一次余额，避免旧余额残留
      localStorage.setItem(
        'user_balance',
        JSON.stringify({ balance: latestBalance, balance_frozen: '0.00', points: 0 }),
      )

      // 再刷新余额（以服务端为准）
      try {
        const balanceRes = await refreshBalanceApi()
        if (balanceRes) {
          localStorage.setItem('user_balance', JSON.stringify(balanceRes))
          if (userStore.userInfo) {
            userStore.setUserInfo({
              ...userStore.userInfo,
              balance: balanceRes.balance || '0.00',
            })
          }
        }
      } catch (error) {
        console.error('Failed to refresh balance:', error)
      }
    }

    showToast(res.message || 'Quick registration successful!')

    // 跳转到首页
    setTimeout(() => {
      router.replace('/home')
    }, 1000)
  } catch (error: any) {
    console.error('Quick registration failed:', error)
    const errorMsg = error?.response?.data?.message || error?.message || 'Quick registration failed'
    showToast(errorMsg)
  } finally {
    quickLoading.value = false
  }
}

const goToLogin = () => {
  router.push('/login')
}

// 页面加载时获取验证码
onMounted(() => {
  getCaptcha()
  // 从 URL 获取邀请码（支持 i 和 invite_code 两种参数名）
  const code = route.query.i || route.query.invite_code
  if (code) {
    inviteCode.value = String(code)
    console.log('邀请码:', inviteCode.value)
  }
})
</script>

<style lang="scss" scoped>
.register-page {
  min-height: 100vh;
  background: #0d0618;
  position: relative;
  overflow: hidden;
  --van-checkbox-checked-icon-color: #552583;

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

  .bg-glow-1 {
    position: absolute;
    top: -10%;
    right: -15%;
    width: 50%;
    height: 45%;
    background: radial-gradient(circle, rgba(85, 37, 131, 0.4) 0%, transparent 70%);
    filter: blur(50px);
    pointer-events: none;
    z-index: 0;
  }

  .bg-glow-2 {
    position: absolute;
    bottom: 5%;
    left: -10%;
    width: 45%;
    height: 40%;
    background: radial-gradient(circle, rgba(253, 185, 39, 0.1) 0%, transparent 70%);
    filter: blur(60px);
    pointer-events: none;
    z-index: 0;
  }

  .bg-glow-3 {
    position: absolute;
    top: 30%;
    left: -5%;
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

  .register-form {
    padding: 20px 16px;
    position: relative;
    z-index: 1;

    .logo {
      text-align: center;
      margin-bottom: 24px;

      .logo-icon {
        font-size: 60px;
        margin-bottom: 12px;
        animation: pulse 2s ease-in-out infinite;
      }

      .welcome-text {
        color: rgba(255, 255, 255, 0.9);
        font-size: 20px;
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

    .captcha-image {
      height: 32px;
      width: 100px;
      border-radius: 6px;
      cursor: pointer;
      border: 1px solid rgba(255, 255, 255, 0.15);
      object-fit: cover;
      filter: invert(1) hue-rotate(180deg) brightness(0.9);
    }

    :deep(.van-cell-group) {
      margin-bottom: 12px;
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

    :deep(.van-cell) {
      padding: 10px 16px;
    }

    .agreement-section {
      padding: 12px 16px;
      margin-top: 8px;
      display: flex;
      justify-content: center;

      :deep(.van-checkbox) {
        .van-checkbox__icon {
          border-color: #c8c9cc;
          border-radius: 50%;
          background-color: transparent;
          border-width: 2px;
        }

        .van-checkbox__icon--checked {
          background: #552583 !important;
          border-color: #552583 !important;

          .van-icon {
            color: #fff !important;
            background-color: #552583 !important;
          }
        }
      }

      .agreement-text {
        color: rgba(255, 255, 255, 0.6);
        font-size: 12px;
        line-height: 1.5;
      }
    }

    .submit-button {
      margin-top: 16px;
      padding: 0 16px;

      :deep(.van-button) {
        height: 44px;
        font-size: 16px;
        background: linear-gradient(135deg, #552583, #7b3fa8) !important;
        border: none !important;
        box-shadow: 0 4px 16px rgba(85, 37, 131, 0.5);
      }
    }

    .quick-register-section {
      margin-top: 10px;
      padding: 0 16px;

      :deep(.van-button) {
        height: 44px;
        font-size: 16px;
      }

      :deep(.van-button--plain) {
        background: #fff;
        border: 2px solid #fdb927;
        color: #fdb927;

        &:active {
          background: rgba(253, 185, 39, 0.1);
        }
      }
    }

    .tips-text {
      text-align: center;
      color: #fdb927;
      font-size: 12px;
      margin-top: 12px;
      padding: 6px 16px;
      background: rgba(253, 185, 39, 0.1);
      border-radius: 8px;
      margin-left: 16px;
      margin-right: 16px;
    }

    .login-link {
      text-align: center;
      padding: 12px 16px 20px;
      margin-top: 12px;
      color: rgba(255, 255, 255, 0.5);
      font-size: 13px;

      a {
        color: #fdb927;
        margin-left: 8px;
        text-decoration: none;
        font-weight: 500;
        cursor: pointer;

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

// 全局强制覆盖 Vant Checkbox 颜色
.van-checkbox__icon--checked {
  background-color: #552583 !important;
  border: 2px solid #552583 !important;
  box-shadow: none !important;

  &::before,
  &::after {
    border-color: #552583 !important;
    background-color: #552583 !important;
  }
}

.van-checkbox__icon--checked .van-icon {
  color: #fff !important;
  background-color: transparent !important;
  border-color: #552583 !important;
}

// 覆盖父元素可能的边框
.van-checkbox--checked .van-checkbox__icon {
  background-color: #552583 !important;
  border-color: #552583 !important;
  box-shadow: none !important;
}

// 覆盖 Vant CSS 变量
:root {
  --van-checkbox-checked-icon-color: #552583 !important;
}
</style>

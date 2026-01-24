<template>
  <div class="register-page">
    <!-- 返回按钮 -->
    <div class="back-button" @click="onClickLeft">
      <van-icon name="arrow-left" size="24" color="#fff" />
    </div>

    <div class="register-container">
      <!-- Logo 区域 -->
      <div class="logo-section">
        <div class="logo-icon">🎰</div>
        <div class="logo-text">JILIEVO.CC</div>
      </div>

      <!-- 注册表单 -->
      <div class="register-form">
        <h2 class="form-title">Register</h2>

        <van-form @submit="onSubmit">
          <!-- 用户名 -->
          <div class="form-item">
            <span class="required">*</span>
            <van-field
              v-model="formData.username"
              name="username"
              placeholder="Username"
              :rules="[{ required: true, message: 'Please enter username' }]"
            />
          </div>

          <!-- 密码 -->
          <div class="form-item">
            <span class="required">*</span>
            <van-field
              v-model="formData.password"
              type="password"
              name="password"
              placeholder="Password"
              :rules="[
                { required: true, message: 'Please enter password' },
                { min: 6, message: 'Password must be at least 6 characters' },
              ]"
            />
          </div>

          <!-- 确认密码 -->
          <div class="form-item">
            <span class="required">*</span>
            <van-field
              v-model="formData.confirmPassword"
              type="password"
              name="confirmPassword"
              placeholder="Confirm password"
              :rules="[
                { required: true, message: 'Please confirm password' },
                { validator: validatePassword, message: 'Passwords do not match' },
              ]"
            />
          </div>

          <!-- 邀请码（可选） -->
          <div class="form-item">
            <van-field
              v-model="formData.inviteCode"
              name="inviteCode"
              placeholder="Invite code (optional)"
            />
          </div>

          <!-- 协议勾选 -->
          <div class="agreement-section">
            <van-checkbox v-model="agreed" icon-size="18px">
              <span class="agreement-text">
                I am 18 years old and agree to the terms & conditions of JILIEVO.CLUB
              </span>
            </van-checkbox>
          </div>

          <!-- 注册按钮 -->
          <div class="submit-button">
            <van-button
              block
              :loading="loading"
              :disabled="!agreed"
              native-type="submit"
              class="register-btn"
            >
              <span class="btn-text">Register</span>
              <span class="btn-icon">🎁</span>
            </van-button>
          </div>

          <!-- 快速注册按钮 -->
          <div class="submit-button">
            <van-button
              block
              :loading="loading"
              :disabled="!agreed"
              native-type="submit"
              class="quick-register-btn"
            >
              <span class="btn-text">QuickRegister</span>
              <span class="btn-icon">🎁</span>
            </van-button>
          </div>

          <!-- 提示信息 -->
          <div class="tips-text">JILIEVO Tips: Invite 1 person and get ₱200</div>
        </van-form>

        <!-- 一键登录 -->
        <div class="one-click-login">
          <div class="divider">
            <span>One-Click Login</span>
          </div>
          <div class="social-buttons">
            <div class="social-btn facebook" @click="handleSocialLogin('facebook')">
              <van-icon name="friends-o" size="32" color="#fff" />
            </div>
            <div class="social-btn google" @click="handleSocialLogin('google')">
              <van-icon name="fire-o" size="32" color="#fff" />
            </div>
            <div class="social-btn telegram" @click="handleSocialLogin('telegram')">
              <van-icon name="chat-o" size="32" color="#fff" />
            </div>
          </div>
        </div>

        <!-- 已有账号 -->
        <div class="login-link">
          <span>Already have an account?</span>
          <a @click="goToLogin">Login now</a>
        </div>
      </div>
    </div>

    <!-- 悬浮按钮 -->
    <div class="float-buttons">
      <div class="float-btn close" @click="onClickLeft">
        <van-icon name="cross" size="20" color="#fff" />
      </div>
      <div class="float-btn top" @click="scrollToTop">
        <van-icon name="arrow-up" size="20" color="#fff" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import { useUserStore } from '@/stores/user'
import { userApi } from '@/api'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loading = ref(false)
const agreed = ref(false)

const formData = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  inviteCode: '',
})

// 验证密码是否一致
const validatePassword = () => {
  return formData.password === formData.confirmPassword
}

const onClickLeft = () => {
  router.back()
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const onSubmit = async () => {
  if (!agreed.value) {
    showToast('Please agree to the terms & conditions')
    return
  }

  try {
    loading.value = true

    // 调用快速注册接口
    const res = await userApi.quickRegister({
      username: formData.username,
      password: formData.password,
      invite_code: formData.inviteCode || undefined,
    })

    // 保存 token 和用户信息
    if (res.token) {
      userStore.setToken(res.token)
    }

    if (res.userInfo) {
      userStore.setUserInfo(res.userInfo)
    }

    showToast(res.message || 'Registration successful!')

    // 跳转到首页
    setTimeout(() => {
      router.replace('/home')
    }, 1000)
  } catch (error: any) {
    console.error('Registration failed:', error)
    const errorMsg = error?.response?.data?.message || error?.message || 'Registration failed'
    showToast(errorMsg)
  } finally {
    loading.value = false
  }
}

const handleSocialLogin = (platform: string) => {
  showToast(`Login with ${platform}`)
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.register-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #2d1a3d 0%, #1a0f1e 100%);
  position: relative;
  overflow-x: hidden;

  // 背景装饰
  &::before {
    content: '';
    position: absolute;
    top: -100px;
    left: 50%;
    transform: translateX(-50%);
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(253, 185, 39, 0.15) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
  }

  // 返回按钮
  .back-button {
    position: absolute;
    top: 20px;
    left: 20px;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 10;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    backdrop-filter: blur(10px);
  }

  .register-container {
    padding: 80px 20px 40px;
    position: relative;
    z-index: 1;

    // Logo 区域
    .logo-section {
      text-align: center;
      margin-bottom: 40px;

      .logo-icon {
        font-size: 64px;
        margin-bottom: 12px;
        animation: bounce 2s infinite;
      }

      .logo-text {
        font-size: 28px;
        font-weight: bold;
        background: $gradient-gold;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        letter-spacing: 2px;
      }
    }

    // 注册表单
    .register-form {
      background: rgba(0, 0, 0, 0.4);
      border-radius: $border-radius-xl;
      padding: 32px 20px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(253, 185, 39, 0.2);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);

      .form-title {
        text-align: center;
        color: #fff;
        font-size: 28px;
        font-weight: bold;
        margin-bottom: 24px;
      }

      .form-item {
        position: relative;
        margin-bottom: 16px;

        .required {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #ff4d4f;
          font-size: 16px;
          z-index: 1;
        }

        :deep(.van-field) {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: $border-radius-md;
          padding: 14px 16px 14px 28px;
          color: #fff;
          font-size: 15px;

          .van-field__control {
            color: #fff;

            &::placeholder {
              color: rgba(255, 255, 255, 0.5);
            }
          }
        }
      }

      // 协议勾选
      .agreement-section {
        margin: 20px 0;

        :deep(.van-checkbox) {
          .van-checkbox__icon {
            border-color: rgba(255, 255, 255, 0.3);
          }

          .van-checkbox__icon--checked {
            background-color: $secondary-color;
            border-color: $secondary-color;
          }
        }

        .agreement-text {
          color: rgba(255, 255, 255, 0.8);
          font-size: 13px;
          line-height: 1.5;
        }
      }

      // 注册按钮
      .submit-button {
        margin: 24px 0 16px;

        .register-btn {
          background: $gradient-gold;
          border: none;
          border-radius: 999px;
          height: 52px;
          font-size: 18px;
          font-weight: bold;
          color: $text-color;
          box-shadow: 0 4px 16px rgba(253, 185, 39, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: $transition-base;

          &:active {
            transform: scale(0.98);
          }

          &:disabled {
            opacity: 0.5;
            box-shadow: none;
          }

          .btn-text {
            font-size: 18px;
          }

          .btn-icon {
            font-size: 20px;
          }
        }

        .register-btn {
          background: $gradient-gold;
          border: none;
          border-radius: 999px;
          height: 52px;
          font-size: 18px;
          font-weight: bold;
          color: $text-color;
          box-shadow: 0 4px 16px rgba(253, 185, 39, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: $transition-base;

          &:active {
            transform: scale(0.98);
          }

          &:disabled {
            opacity: 0.5;
            box-shadow: none;
          }

          .btn-text {
            font-size: 18px;
          }

          .btn-icon {
            font-size: 20px;
          }
        }
        .quick-register-btn {
          background: transparent !important; // 无背景
          background-color: transparent !important;

          border-radius: 999px;
          height: 52px;

          font-size: 18px;
          font-weight: bold;
          color: $text-color-light;

          border: 1px solid $secondary-color;
          box-shadow: 0 4px 16px rgba(253, 185, 39, 0.4);

          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;

          opacity: 1; // 你之前是0，会看不到

          &:active {
            transform: scale(0.98);
          }

          &:disabled {
            opacity: 0.5;
            box-shadow: none;
          }

          .btn-text {
            font-size: 18px;
          }

          .btn-icon {
            font-size: 20px;
          }
        }
      }

      // 提示信息
      .tips-text {
        text-align: center;
        color: $secondary-color;
        font-size: 13px;
        margin-bottom: 24px;
        padding: 8px;
        background: rgba(253, 185, 39, 0.1);
        border-radius: $border-radius-md;
      }

      // 一键登录
      .one-click-login {
        margin: 32px 0 24px;

        .divider {
          display: flex;
          align-items: center;
          margin-bottom: 20px;

          &::before,
          &::after {
            content: '';
            flex: 1;
            height: 1px;
            background: rgba(255, 255, 255, 0.2);
          }

          span {
            padding: 0 16px;
            color: rgba(255, 255, 255, 0.6);
            font-size: 14px;
          }
        }

        .social-buttons {
          display: flex;
          justify-content: center;
          gap: 20px;

          .social-btn {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: $transition-base;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);

            &:active {
              transform: scale(0.95);
            }

            &.facebook {
              background: #1877f2;
            }

            &.google {
              background: #db4437;
            }

            &.telegram {
              background: #0088cc;
            }
          }
        }
      }

      // 已有账号
      .login-link {
        text-align: center;
        color: rgba(255, 255, 255, 0.7);
        font-size: 14px;

        a {
          color: $secondary-color;
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
  }

  // 悬浮按钮
  .float-buttons {
    position: fixed;
    right: 20px;
    bottom: 40px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    z-index: 999;

    .float-btn {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      transition: $transition-base;
      backdrop-filter: blur(10px);

      &:active {
        transform: scale(0.9);
      }

      &.close {
        background: rgba(255, 255, 255, 0.2);
      }

      &.top {
        background: $gradient-purple-gold;
      }
    }
  }
}

// 动画
@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
</style>

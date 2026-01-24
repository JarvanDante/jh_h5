<template>
  <div class="login-page">
    <van-nav-bar
      title="Login"
      left-arrow
      @click-left="onClickLeft"
      :style="{ background: 'linear-gradient(135deg, #552583 0%, #7B3FA8 100%)' }"
    />

    <div class="login-form">
      <div class="logo">
        <div class="logo-icon">🎰</div>
        <h1>JILIEVO.CC</h1>
        <p>Welcome Back!</p>
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
        </van-cell-group>

        <div class="submit-button">
          <van-button round block color="#552583" native-type="submit" :loading="loading">
            Login
          </van-button>

          <!-- 测试用快速登录按钮 -->
          <van-button round block plain color="#FDB927" @click="quickLogin" class="quick-login-btn">
            Quick Login (Test)
          </van-button>
        </div>

        <div class="extra-links">
          <a href="#" class="link">Forgot Password?</a>
          <a @click="goToRegister" class="link">Register</a>
        </div>
      </van-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loading = ref(false)
const formData = reactive({
  username: '',
  password: '',
})

const onClickLeft = () => {
  router.back()
}

const onSubmit = async () => {
  try {
    loading.value = true

    // 模拟登录请求
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // 模拟登录成功
    const mockToken = 'mock-token-' + Date.now()
    const mockUserInfo = {
      id: 1,
      username: formData.username,
      nickname: formData.username,
      avatar: '',
      mobile: '',
      email: '',
    }

    userStore.setToken(mockToken)
    userStore.setUserInfo(mockUserInfo)

    showToast('Login successful')

    // 跳转到之前的页面或首页
    const redirect = route.query.redirect as string
    router.replace(redirect || '/home')
  } catch (error) {
    console.error('Login failed:', error)
    showToast('Login failed')
  } finally {
    loading.value = false
  }
}

// 快速登录（测试用）
const quickLogin = () => {
  formData.username = 'karson'
  formData.password = '123456'
  onSubmit()
}

// 跳转到注册页
const goToRegister = () => {
  router.push('/register')
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

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
      margin-bottom: 40px;

      .logo-icon {
        font-size: 64px;
        margin-bottom: 16px;
      }

      h1 {
        font-size: 32px;
        background: $gradient-purple-gold;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin-bottom: 8px;
      }

      p {
        color: $text-color-secondary;
        font-size: 14px;
      }
    }

    .submit-button {
      margin-top: 24px;
      padding: 0 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;

      .quick-login-btn {
        margin-top: 8px;
      }
    }

    .extra-links {
      display: flex;
      justify-content: space-between;
      padding: 16px;
      margin-top: 16px;

      .link {
        color: $primary-color;
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

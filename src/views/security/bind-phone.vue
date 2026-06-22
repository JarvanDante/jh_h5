<template>
  <div class="bind-phone-page">
    <div class="top-bar">
      <van-icon name="arrow-left" size="24" color="#fff" @click="goBack" />
      <span class="title">{{ t('route.bindPhone') }}</span>
      <div class="placeholder"></div>
    </div>

    <div class="content">
      <div class="form-card">
        <div class="form-title">{{ t('security.phoneNumber') }}</div>
        <van-field
          v-model="phoneInput"
          type="tel"
          placeholder="9XXXXXXXXX"
          maxlength="10"
          clearable
        >
          <template #left-icon>
            <span class="phone-prefix">
              <van-icon name="phone-o" color="#552583" />
              <span class="prefix-text">+63</span>
            </span>
          </template>
        </van-field>

        <van-button
          block
          class="submit-btn"
          :loading="submitting"
          :disabled="submitting"
          @click="handleSubmit"
        >
          {{ t('common.confirm') }}
        </van-button>
      </div>
    </div>

    <transition name="fade">
      <div v-if="localToastVisible" class="local-toast">{{ localToastMessage }}</div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { showLoadingToast, closeToast } from 'vant'
import { userApi } from '@/api/modules/user'

const router = useRouter()
const { t } = useI18n()

const phoneInput = ref('')
const submitting = ref(false)

const localToastVisible = ref(false)
const localToastMessage = ref('')
let localToastTimer: ReturnType<typeof setTimeout> | null = null

const showLocalToast = (message: string, duration = 2000) => {
  localToastMessage.value = message
  localToastVisible.value = true
  if (localToastTimer) {
    clearTimeout(localToastTimer)
  }
  localToastTimer = setTimeout(() => {
    localToastVisible.value = false
  }, duration)
}

const goBack = () => {
  router.back()
}

const validatePhone = (phone: string): boolean => {
  if (!phone) {
    showLocalToast(t('security.enterPhone'))
    return false
  }
  const phoneRegex = /^[0-9]{10}$/
  if (!phoneRegex.test(phone)) {
    showLocalToast(t('security.invalidPhone'))
    return false
  }
  return true
}

const getResponseMessage = (response: any, fallback: string) => {
  const msg =
    response?.message ||
    response?.msg ||
    response?.data?.message ||
    response?.data?.msg ||
    response?.data?.data?.message ||
    response?.data?.data?.msg ||
    (typeof response === 'string' ? response : '')
  if (msg && String(msg).trim()) {
    return String(msg)
  }
  return fallback
}

const handleSubmit = async () => {
  if (!validatePhone(phoneInput.value)) return
  if (submitting.value) return

  submitting.value = true
  try {
    showLoadingToast({
      message: t('common.binding'),
      forbidClick: true,
      duration: 0,
    })

    const response = await userApi.bindMobile({ mobile: phoneInput.value })

    closeToast()
    showLocalToast(getResponseMessage(response, t('security.phoneBoundSuccess')))
  } catch (error: any) {
    closeToast()
    showLocalToast(error?.message || t('security.phoneBindFailed'))
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.bind-phone-page {
  min-height: 100vh;
  background: #ffffff;

  .top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: $gradient-purple;
    box-shadow: $shadow-md;

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
    padding: 24px 16px;
  }

  .form-card {
    background: #fff;
    border-radius: 12px;
    padding: 20px 16px;
    box-shadow: $shadow-sm;

    .form-title {
      font-size: 16px;
      font-weight: 600;
      color: #333;
      margin-bottom: 12px;
    }
  }

  :deep(.van-field) {
    background: #f5f5f5;
    border-radius: 12px;
    padding: 12px 16px;
    border: 2px solid transparent;
    transition: all 0.3s;

    &:focus-within {
      background: #fff;
      border-color: #552583;
      box-shadow: 0 0 0 4px rgba(85, 37, 131, 0.1);
    }

    .van-field__left-icon {
      margin-right: 12px;
    }

    .van-field__control {
      font-size: 15px;
      color: #333;

      &::placeholder {
        color: #999;
      }
    }

    .van-field__clear {
      color: #999;
    }
  }

  .phone-prefix {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .prefix-text {
    font-size: 14px;
    color: #552583;
    font-weight: 600;
  }

  .submit-btn {
    margin-top: 16px;
    height: 44px;
    border-radius: 8px;
    background: linear-gradient(135deg, #552583 0%, #7b3fa8 100%);
    color: #fff;
    border: none;
  }
}

.local-toast {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  z-index: 9999;
  max-width: 80%;
  text-align: center;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

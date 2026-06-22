<template>
  <div class="change-password-page">
    <div class="top-bar">
      <van-icon name="arrow-left" size="24" color="#fff" @click="goBack" />
      <span class="title">{{ t('route.changeAssetsPassword') }}</span>
      <div class="placeholder"></div>
    </div>

    <div class="content">
      <div class="form-card">
        <div class="form-title">{{ t('security.assetsPassword') }}</div>

        <van-field
          v-model="oldPassword"
          :type="showOld ? 'text' : 'tel'"
          inputmode="numeric"
          @update:model-value="(val) => (oldPassword = sanitizePayPassword(String(val ?? '')))"
          :placeholder="t('security.oldPassword6Placeholder')"
          maxlength="6"
          clearable
        >
          <template #left-icon>
            <van-icon name="shield-o" color="#552583" />
          </template>
          <template #right-icon>
            <van-icon :name="showOld ? 'eye-o' : 'closed-eye'" @click="showOld = !showOld" />
          </template>
        </van-field>

        <van-field
          v-model="newPassword"
          :type="showNew ? 'text' : 'tel'"
          inputmode="numeric"
          @update:model-value="(val) => (newPassword = sanitizePayPassword(String(val ?? '')))"
          :placeholder="t('security.newPassword6Placeholder')"
          maxlength="6"
          clearable
          class="mt-12"
        >
          <template #left-icon>
            <van-icon name="shield-o" color="#552583" />
          </template>
          <template #right-icon>
            <van-icon :name="showNew ? 'eye-o' : 'closed-eye'" @click="showNew = !showNew" />
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

const oldPassword = ref('')
const newPassword = ref('')
const showOld = ref(false)
const showNew = ref(false)
const sanitizePayPassword = (value: string) => value.replace(/\D/g, '').slice(0, 6)

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

const validatePassword = (oldPwd: string, newPwd: string): boolean => {
  if (!oldPwd) {
    showLocalToast(t('security.enterOldPassword'))
    return false
  }
  if (!newPwd) {
    showLocalToast(t('security.enterNewPassword'))
    return false
  }
  const payPasswordRegex = /^[0-9]{6}$/
  if (!payPasswordRegex.test(oldPwd)) {
    showLocalToast(t('security.oldPassword6Digits'))
    return false
  }
  if (!payPasswordRegex.test(newPwd)) {
    showLocalToast(t('security.newPassword6Digits'))
    return false
  }
  if (oldPwd === newPwd) {
    showLocalToast(t('security.passwordMustDiffer'))
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
  if (!validatePassword(oldPassword.value, newPassword.value)) return
  if (submitting.value) return

  submitting.value = true
  try {
    showLoadingToast({
      message: t('common.changing'),
      forbidClick: true,
      duration: 0,
    })

    const response = await userApi.changePayPassword({
      old_pay_password: oldPassword.value,
      new_pay_password: newPassword.value,
    })

    closeToast()
    showLocalToast(getResponseMessage(response, t('security.passwordChangedSuccess')))
  } catch (error: any) {
    closeToast()
    showLocalToast(error?.message || t('security.passwordChangeFailed'))
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.change-password-page {
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
      font-size: 18px;
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

    .mt-12 {
      margin-top: 12px;
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

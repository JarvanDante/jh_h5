<template>
  <div class="security-page">
    <!-- 顶部导航栏 -->
    <div class="top-bar">
      <van-icon name="arrow-left" size="24" color="#fff" @click="goBack" />
      <span class="title">{{ t('security.title') }}</span>
      <div class="placeholder"></div>
    </div>

    <!-- 安全信息列表 -->
    <div class="security-list">
      <!-- Account -->
      <div class="security-item">
        <div class="item-left">
          <van-icon name="user-o" size="24" color="#552583" />
          <span class="item-label">{{ t('common.account') }}</span>
        </div>
        <span class="item-value">{{ userInfo.account || '9176661233' }}</span>
      </div>

      <!-- Phone -->
      <div class="security-item clickable" @click="handleBindPhone">
        <div class="item-left">
          <van-icon name="phone-o" size="24" color="#552583" />
          <span class="item-label">{{ t('security.phone') }}</span>
        </div>
        <div class="item-right">
          <span class="item-value" :class="{ unbound: !userInfo.phone }">
            {{ userInfo.phone || t('common.unbound') }}
          </span>
          <van-icon name="arrow" size="16" color="#999" />
        </div>
      </div>

      <!-- Email -->
      <div class="security-item clickable" @click="handleBindEmail">
        <div class="item-left">
          <van-icon name="envelop-o" size="24" color="#552583" />
          <span class="item-label">{{ t('security.email') }}</span>
        </div>
        <div class="item-right">
          <span class="item-value" :class="{ unbound: !userInfo.email }">
            {{ userInfo.email || t('common.unbound') }}
          </span>
          <van-icon name="arrow" size="16" color="#999" />
        </div>
      </div>

      <!-- Login Password -->
      <div class="security-item clickable" @click="handleChangeLoginPassword">
        <div class="item-left">
          <van-icon name="lock" size="24" color="#552583" />
          <span class="item-label">{{ t('security.loginPassword') }}</span>
        </div>
        <div class="item-right">
          <span class="item-status">{{
            Number(userInfo.isPassword) === 1 ? t('common.alreadySet') : t('common.unbound')
          }}</span>
          <van-icon name="arrow" size="16" color="#999" />
        </div>
      </div>

      <!-- Assets Password -->
      <div class="security-item clickable" @click="handleChangePayPassword">
        <div class="item-left">
          <van-icon name="shield-o" size="24" color="#552583" />
          <span class="item-label">{{ t('security.assetsPassword') }}</span>
        </div>
        <div class="item-right">
          <span class="item-status">{{
            Number(userInfo.isPayPassword) === 1 ? t('common.alreadySet') : t('common.unbound')
          }}</span>
          <van-icon name="arrow" size="16" color="#999" />
        </div>
      </div>
    </div>

    <!-- 手机号/邮箱改为页面跳转，不再使用弹窗 -->

    <!-- 登录/资金密码改为页面跳转，不再使用弹窗 -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { userApi } from '@/api/modules/user'

const router = useRouter()
const { t } = useI18n()

// 用户信息
const userInfo = ref({
  account: '',
  phone: '',
  email: '',
  isPassword: 0,
  isPayPassword: 0,
})

// 弹窗逻辑已移除（改为页面跳转）

const goBack = () => {
  router.back()
}

// 处理绑定手机（跳转页面）
const handleBindPhone = () => {
  router.push('/security/bind-phone')
}

// 处理绑定邮箱（跳转页面）
const handleBindEmail = () => {
  router.push('/security/bind-email')
}

// 处理修改登录密码（跳转页面）
const handleChangeLoginPassword = () => {
  if (Number(userInfo.value.isPassword) === 1) {
    router.push('/security/change-login-password')
    return
  }
  router.push('/security/bind-login-password')
}

// 处理修改支付密码（跳转页面）
const handleChangePayPassword = () => {
  if (Number(userInfo.value.isPayPassword) === 1) {
    router.push('/security/change-assets-password')
    return
  }
  router.push('/security/bind-pay-password')
}

// 手机号/邮箱弹窗逻辑已移除（改为页面跳转）

// 登录/资金密码的弹窗逻辑已移除（改为页面跳转）

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    const info = await userApi.getUserInfo()
    userInfo.value = {
      account: info.username || '',
      phone: info.mobile || '',
      email: info.email || '',
      isPassword: Number(info.is_password ?? info.isPassword ?? 0),
      isPayPassword: Number(info.is_pay_password ?? info.isPayPassword ?? 0),
    }
  } catch (error) {
    console.error('Failed to fetch user info:', error)
  }
}

onMounted(() => {
  fetchUserInfo()
})
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.security-page {
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

    .van-icon {
      cursor: pointer;
      transition: transform 0.2s;

      &:active {
        transform: scale(0.9);
      }
    }
  }

  .security-list {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 1px;

    .security-item {
      background: #f5f5f5;
      border-radius: 0;
      padding: 20px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #e5e5e5;
      transition: all 0.2s;

      &:first-child {
        border-radius: 12px 12px 0 0;
      }

      &:last-child {
        border-radius: 0 0 12px 12px;
        border-bottom: none;
      }

      &.clickable {
        cursor: pointer;
        touch-action: manipulation;
        user-select: none;
        -webkit-tap-highlight-color: transparent;

        &:active {
          background: #e8e8e8;
        }
      }

      .item-left {
        display: flex;
        align-items: center;
        gap: 12px;

        .item-label {
          color: #333;
          font-size: 16px;
          font-weight: 500;
        }
      }

      .item-value {
        color: #666;
        font-size: 15px;

        &.unbound {
          color: #999;
        }
      }

      .item-right {
        display: flex;
        align-items: center;
        gap: 8px;

        .item-status {
          color: #999;
          font-size: 14px;
        }
      }
    }
  }
}

// 弹窗样式美化
:deep(.bind-dialog) {
  border-radius: 16px;
  overflow: hidden;

  .van-dialog__header {
    padding: 20px 24px 16px;
    font-size: 18px;
    font-weight: 600;
    color: #333;
  }

  .van-dialog__content {
    padding: 0;
  }

  .van-dialog__footer {
    padding: 12px 16px 16px;

    .van-button {
      border-radius: 8px;
      font-size: 16px;
      font-weight: 500;
      height: 44px;
    }

    .van-dialog__cancel {
      color: #666;
      background: #f5f5f5;
      border: none;

      &:active {
        background: #e8e8e8;
      }
    }

    .van-dialog__confirm {
      background: linear-gradient(135deg, #552583 0%, #7b3fa8 100%);
      color: #fff;
      border: none;

      &:active {
        opacity: 0.8;
      }
    }
  }
}

.dialog-content {
  padding: 16px 24px 24px;

  .mt-12 {
    margin-top: 12px;
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
}

:deep(.security-toast) {
  background: rgba(0, 0, 0, 0.75);
  color: #fff;
  font-size: 14px;
}

:deep(.security-toast .van-toast__text) {
  color: #fff;
}
</style>

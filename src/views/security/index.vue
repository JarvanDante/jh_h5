<template>
  <div class="security-page">
    <!-- 顶部导航栏 -->
    <div class="top-bar">
      <van-icon name="arrow-left" size="24" color="#fff" @click="goBack" />
      <span class="title">Security Center</span>
      <div class="placeholder"></div>
    </div>

    <!-- 安全信息列表 -->
    <div class="security-list">
      <!-- Account -->
      <div class="security-item">
        <div class="item-left">
          <van-icon name="user-o" size="24" color="#552583" />
          <span class="item-label">Account</span>
        </div>
        <span class="item-value">{{ userInfo.account || '9176661233' }}</span>
      </div>

      <!-- Phone -->
      <div class="security-item clickable" @click="handleBindPhone">
        <div class="item-left">
          <van-icon name="phone-o" size="24" color="#552583" />
          <span class="item-label">Phone</span>
        </div>
        <div class="item-right">
          <span class="item-value" :class="{ unbound: !userInfo.phone }">
            {{ userInfo.phone || 'Unbound' }}
          </span>
          <van-icon name="arrow" size="16" color="#999" />
        </div>
      </div>

      <!-- Email -->
      <div class="security-item clickable" @click="handleBindEmail">
        <div class="item-left">
          <van-icon name="envelop-o" size="24" color="#552583" />
          <span class="item-label">Email</span>
        </div>
        <div class="item-right">
          <span class="item-value" :class="{ unbound: !userInfo.email }">
            {{ userInfo.email || 'Unbound' }}
          </span>
          <van-icon name="arrow" size="16" color="#999" />
        </div>
      </div>

      <!-- Login Password -->
      <div class="security-item clickable" @click="handleChangeLoginPassword">
        <div class="item-left">
          <van-icon name="lock" size="24" color="#552583" />
          <span class="item-label">Login Password</span>
        </div>
        <div class="item-right">
          <span class="item-status">{{
            Number(userInfo.isPassword) === 1 ? 'Already Set' : 'Unbound'
          }}</span>
          <van-icon name="arrow" size="16" color="#999" />
        </div>
      </div>

      <!-- Assets Password -->
      <div class="security-item clickable" @click="handleChangePayPassword">
        <div class="item-left">
          <van-icon name="shield-o" size="24" color="#552583" />
          <span class="item-label">Assets Password</span>
        </div>
        <div class="item-right">
          <span class="item-status">{{
            Number(userInfo.isPayPassword) === 1 ? 'Already Set' : 'Unbound'
          }}</span>
          <van-icon name="arrow" size="16" color="#999" />
        </div>
      </div>
    </div>

    <!-- 绑定手机弹窗 -->
    <van-dialog
      v-model:show="showPhoneDialog"
      title="Bind Phone"
      show-cancel-button
      :before-close="handlePhoneBeforeClose"
      class-name="bind-dialog"
    >
      <div class="dialog-content">
        <van-field
          v-model="phoneInput"
          type="tel"
          placeholder="Enter phone number (8-15 digits)"
          clearable
          maxlength="15"
        />
      </div>
    </van-dialog>

    <!-- 绑定邮箱弹窗 -->
    <van-dialog
      v-model:show="showEmailDialog"
      title="Bind Email"
      show-cancel-button
      :before-close="handleEmailBeforeClose"
      class-name="bind-dialog"
    >
      <div class="dialog-content">
        <van-field v-model="emailInput" type="email" placeholder="Enter email address" clearable />
      </div>
    </van-dialog>

    <!-- 修改登录密码弹窗 -->
    <van-dialog
      v-model:show="showLoginPasswordDialog"
      title="Change Login Password"
      show-cancel-button
      :before-close="handleLoginPasswordBeforeClose"
      class-name="bind-dialog"
    >
      <div class="dialog-content">
        <van-field
          v-model="loginPasswordForm.oldPassword"
          type="password"
          placeholder="Enter old password"
          clearable
        />
        <van-field
          v-model="loginPasswordForm.newPassword"
          type="password"
          placeholder="Enter new password (6-20 characters)"
          clearable
          class="mt-12"
        />
      </div>
    </van-dialog>

    <!-- 修改支付密码弹窗 -->
    <van-dialog
      v-model:show="showPayPasswordDialog"
      title="Change Assets Password"
      show-cancel-button
      :before-close="handlePayPasswordBeforeClose"
      class-name="bind-dialog"
    >
      <div class="dialog-content">
        <van-field
          v-model="payPasswordForm.oldPassword"
          type="password"
          placeholder="Enter old password (6 digits)"
          clearable
          maxlength="6"
        />
        <van-field
          v-model="payPasswordForm.newPassword"
          type="password"
          placeholder="Enter new password (6 digits)"
          clearable
          maxlength="6"
          class="mt-12"
        />
      </div>
    </van-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { userApi } from '@/api/modules/user'

const router = useRouter()

// 用户信息
const userInfo = ref({
  account: '',
  phone: '',
  email: '',
  isPassword: 0,
  isPayPassword: 0,
})

// 弹窗显示状态
const showPhoneDialog = ref(false)
const showEmailDialog = ref(false)
const showLoginPasswordDialog = ref(false)
const showPayPasswordDialog = ref(false)

// 输入值
const phoneInput = ref('')
const emailInput = ref('')
const loginPasswordForm = ref({
  oldPassword: '',
  newPassword: '',
})
const payPasswordForm = ref({
  oldPassword: '',
  newPassword: '',
})

const goBack = () => {
  router.back()
}

// 处理绑定手机
const handleBindPhone = () => {
  phoneInput.value = ''
  showPhoneDialog.value = true
}

// 处理绑定邮箱
const handleBindEmail = () => {
  emailInput.value = ''
  showEmailDialog.value = true
}

// 处理修改登录密码
const handleChangeLoginPassword = () => {
  loginPasswordForm.value = {
    oldPassword: '',
    newPassword: '',
  }
  showLoginPasswordDialog.value = true
}

// 处理修改支付密码
const handleChangePayPassword = () => {
  payPasswordForm.value = {
    oldPassword: '',
    newPassword: '',
  }
  showPayPasswordDialog.value = true
}

// 手机号弹窗关闭前处理
const handlePhoneBeforeClose = async (action: string) => {
  if (action === 'confirm') {
    // 验证手机号
    if (!phoneInput.value) {
      showToast('Please enter phone number')
      return false
    }
    if (!/^\d{8,15}$/.test(phoneInput.value)) {
      showToast('Phone number must be 8-15 digits')
      return false
    }

    try {
      await userApi.bindMobile({ mobile: phoneInput.value })
      showToast('Phone bound successfully')
      await fetchUserInfo()
      return true
    } catch (error: any) {
      showToast(error.message || 'Failed to bind phone')
      return false
    }
  }
  return true
}

// 邮箱弹窗关闭前处理
const handleEmailBeforeClose = async (action: string) => {
  if (action === 'confirm') {
    // 验证邮箱
    if (!emailInput.value) {
      showToast('Please enter email address')
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)) {
      showToast('Please enter a valid email address')
      return false
    }

    try {
      await userApi.bindEmail({ email: emailInput.value })
      showToast('Email bound successfully')
      await fetchUserInfo()
      return true
    } catch (error: any) {
      showToast(error.message || 'Failed to bind email')
      return false
    }
  }
  return true
}

// 登录密码弹窗关闭前处理
const handleLoginPasswordBeforeClose = async (action: string) => {
  if (action === 'confirm') {
    const { oldPassword, newPassword } = loginPasswordForm.value

    // 验证输入
    if (!oldPassword) {
      showToast('Please enter old password')
      return false
    }
    if (!newPassword) {
      showToast('Please enter new password')
      return false
    }
    if (newPassword.length < 6 || newPassword.length > 20) {
      showToast('Password must be 6-20 characters')
      return false
    }
    if (oldPassword === newPassword) {
      showToast('New password cannot be the same as old password')
      return false
    }

    try {
      await userApi.changeLoginPassword({
        old_password: oldPassword,
        new_password: newPassword,
      })
      showToast('Login password changed successfully')
      return true
    } catch (error: any) {
      showToast(error.message || 'Failed to change login password')
      return false
    }
  }
  return true
}

// 支付密码弹窗关闭前处理
const handlePayPasswordBeforeClose = async (action: string) => {
  if (action === 'confirm') {
    const { oldPassword, newPassword } = payPasswordForm.value

    // 验证输入
    if (!oldPassword) {
      showToast('Please enter old password')
      return false
    }
    if (!newPassword) {
      showToast('Please enter new password')
      return false
    }
    if (!/^\d{6}$/.test(newPassword)) {
      showToast('Password must be 6 digits')
      return false
    }
    if (oldPassword === newPassword) {
      showToast('New password cannot be the same as old password')
      return false
    }

    try {
      await userApi.changePayPassword({
        old_pay_password: oldPassword,
        new_pay_password: newPassword,
      })
      showToast('Assets password changed successfully')
      return true
    } catch (error: any) {
      showToast(error.message || 'Failed to change assets password')
      return false
    }
  }
  return true
}

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

<template>
  <div class="add-account-page">
    <!-- 顶部导航栏 -->
    <div class="top-bar">
      <van-icon name="arrow-left" size="24" color="#fff" @click="goBack" />
      <span class="title">{{ t('withdrawAddAccount.title') }}</span>
      <div class="placeholder"></div>
    </div>

    <!-- 内容区域 -->
    <div class="content">
      <!-- 提现方式选择 -->
      <div class="withdraw-methods">
        <div
          v-for="method in withdrawMethods"
          :key="method.id"
          class="method-tab"
          :class="{ active: selectedMethod === method.id }"
          @click="selectMethod(method.id)"
        >
          {{ method.name }}
        </div>
      </div>

      <!-- 提示信息 -->
      <div class="notice-list">
        <div class="notice-item">
          <span class="notice-number">1.</span>
          <span class="notice-text notice-red">
            To ensure fast remittance, please fill in your full name, which should be consistent
            with the account.
          </span>
        </div>
        <div class="notice-item">
          <span class="notice-number">2.</span>
          <span class="notice-text">
            Please check your account information. Transfers will not be made to incorrect accounts.
          </span>
        </div>
      </div>

      <!-- 表单 -->
      <van-form @submit="handleSubmit">
        <!-- 姓名输入 -->
        <div class="form-item">
          <div class="form-label">Name <span class="required">*</span></div>
          <van-field
            v-model="formData.name"
            placeholder="Please enter your name"
            :border="false"
            class="custom-field"
          />
        </div>

        <!-- 账号输入 -->
        <div class="form-item">
          <div class="form-label">
            {{ selectedMethod === 1 ? 'Gcash Account' : 'Maya Account' }}
            <span class="required">*</span>
          </div>
          <div class="account-input-wrapper">
            <div class="country-code">
              <img
                src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 36 36'%3E%3Cpath fill='%230038A8' d='M32 5H4a4 4 0 0 0-4 4v9h36V9a4 4 0 0 0-4-4z'/%3E%3Cpath fill='%23CE1126' d='M4 31h28a4 4 0 0 0 4-4v-9H0v9a4 4 0 0 0 4 4z'/%3E%3Cpath fill='%23FFF' d='M0 13h36v10H0z'/%3E%3Cpath fill='%23FCD116' d='m5 16 1.5 1.5L5 19l1.5 1.5L5 22h3l-1.5-1.5L8 19l-1.5-1.5L8 16H5zm0 0 1.5 1.5L5 19l1.5 1.5L5 22h3l-1.5-1.5L8 19l-1.5-1.5L8 16H5z'/%3E%3C/svg%3E"
                alt="PH"
                class="flag-icon"
              />
              <span>+63</span>
            </div>
            <van-field
              v-model="formData.accountNumber"
              type="tel"
              placeholder="9188888888"
              :border="false"
              class="account-field"
            />
          </div>
        </div>

        <!-- 提交按钮 -->
        <div class="submit-wrapper">
          <van-button class="submit-btn" block native-type="submit">add account</van-button>
        </div>
      </van-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { showToast } from 'vant'
import { addBankCard } from '@/api'

const router = useRouter()
const { t } = useI18n()

// 选中的提现方式
const selectedMethod = ref(1) // 1=Gcash, 2=Maya

// 提现方式列表
const withdrawMethods = ref([
  { id: 1, name: 'Gcash' },
  { id: 2, name: 'Maya' },
])

// 表单数据
const formData = reactive({
  name: '',
  accountNumber: '',
})

// 选择提现方式
const selectMethod = (methodId: number) => {
  selectedMethod.value = methodId
  // 切换方式时清空账号
  formData.accountNumber = ''
}

// 返回
const goBack = () => {
  router.back()
}

// 提交表单
const handleSubmit = async () => {
  // 验证姓名
  if (!formData.name || !formData.name.trim()) {
    showToast(t('withdrawAddAccount.enterName'))
    return
  }

  // 验证账号
  if (!formData.accountNumber || !formData.accountNumber.trim()) {
    showToast(t('withdrawAddAccount.enterAccount'))
    return
  }

  // 验证手机号格式（菲律宾手机号通常是10位数字，以9开头）
  const phoneRegex = /^9\d{9}$/
  if (!phoneRegex.test(formData.accountNumber)) {
    showToast(t('withdrawAddAccount.invalidAccount'))
    return
  }

  try {
    // 调用添加银行卡 API
    const res = await addBankCard({
      type: selectedMethod.value, // 1=Gcash, 2=Maya
      card_account: formData.name,
      card_no: `${formData.accountNumber}`,
    })

    if (res.success) {
      showToast(t('withdrawAddAccount.success'))
      // 返回上一页
      setTimeout(() => {
        router.back()
      }, 1000)
    } else {
      showToast(res.message || t('withdrawAddAccount.failed'))
    }
  } catch (error: any) {
    console.error('添加账户失败:', error)
    showToast(error.message || t('withdrawAddAccount.failed'))
  }
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.add-account-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 50px;

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
    padding: 20px 16px;
  }

  // 提现方式选择
  .withdraw-methods {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-bottom: 24px;

    .method-tab {
      background: #fff;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      padding: 16px;
      text-align: center;
      font-size: 18px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      touch-action: manipulation;
      user-select: none;
      -webkit-tap-highlight-color: transparent;

      // Gcash 默认蓝色
      &:nth-child(1) {
        color: #007dff;
        border-color: #007dff;

        &.active {
          background: linear-gradient(135deg, #007dff 0%, #0056b3 100%);
          color: #fff;
          box-shadow: 0 4px 16px rgba(0, 125, 255, 0.4);
        }
      }

      // Maya 绿色
      &:nth-child(2) {
        color: #00d632;
        border-color: #00d632;

        &.active {
          background: linear-gradient(135deg, #00d632 0%, #00a826 100%);
          color: #fff;
          box-shadow: 0 4px 16px rgba(0, 214, 50, 0.4);
        }
      }

      &:active {
        transform: scale(0.95);
      }
    }
  }

  // 提示信息
  .notice-list {
    margin-bottom: 32px;
    background: #fff;
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

    .notice-item {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
      line-height: 1.6;

      &:last-child {
        margin-bottom: 0;
      }

      .notice-number {
        color: $danger-color;
        font-size: 15px;
        font-weight: 600;
        flex-shrink: 0;
      }

      .notice-text {
        color: #666;
        font-size: 14px;

        &.notice-red {
          color: $danger-color;
        }
      }
    }
  }

  // 表单项
  .form-item {
    margin-bottom: 24px;

    .form-label {
      color: #333;
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 12px;

      .required {
        color: $danger-color;
        margin-left: 4px;
      }
    }

    .custom-field {
      background: #fff;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      padding: 16px;
      color: #333;
      font-size: 15px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

      :deep(.van-field__control) {
        color: #333;

        &::placeholder {
          color: #999;
        }
      }
    }

    // 账号输入包装器
    .account-input-wrapper {
      display: flex;
      align-items: center;
      background: #fff;
      border: 2px solid $success-color;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

      .country-code {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 16px;
        border-right: 2px solid #e5e7eb;
        color: #333;
        font-size: 15px;
        font-weight: 600;
        flex-shrink: 0;

        .flag-icon {
          width: 24px;
          height: 24px;
          border-radius: 50%;
        }
      }

      .account-field {
        flex: 1;
        background: transparent;
        padding: 16px;
        color: #333;
        font-size: 15px;

        :deep(.van-field__control) {
          color: #333;

          &::placeholder {
            color: #999;
          }
        }
      }
    }
  }

  // 提交按钮
  .submit-wrapper {
    margin-top: 40px;

    .submit-btn {
      background: $gradient-purple;
      color: #fff;
      border: none;
      border-radius: 16px;
      font-size: 18px;
      font-weight: bold;
      height: 56px;
      box-shadow: 0 4px 16px rgba(85, 37, 131, 0.4);
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

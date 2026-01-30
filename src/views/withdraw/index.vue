<template>
  <div class="withdraw-page">
    <!-- 顶部导航栏 -->
    <div class="top-bar">
      <van-icon name="arrow-left" size="24" color="#fff" @click="goBack" />
      <span class="title">Withdraw</span>
      <van-icon name="notes-o" size="24" color="#fff" @click="showHistory" />
    </div>

    <!-- 余额和流水要求卡片 -->
    <div class="info-cards">
      <div class="info-card">
        <div class="card-header">
          <span class="card-title">Account Balance</span>
          <van-icon name="replay" size="20" color="#3b82f6" @click="refreshBalance" />
        </div>
        <div class="card-amount">{{ formatAmount(accountBalance) }}</div>
      </div>

      <div class="info-card">
        <div class="card-header">
          <span class="card-title">Rollover requirement</span>
          <van-icon name="replay" size="20" color="#3b82f6" @click="refreshRollover" />
        </div>
        <div class="card-amount">{{ formatAmount(rolloverRequirement) }}</div>
        <div class="view-details" @click="showRolloverDetails">
          View details <van-icon name="arrow" size="12" />
        </div>
      </div>
    </div>

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

    <!-- 快捷金额选择 -->
    <div class="quick-amounts">
      <div
        v-for="amount in quickAmounts"
        :key="amount"
        class="amount-btn"
        :class="{ active: withdrawAmount === amount.toString() }"
        @click="selectAmount(amount)"
      >
        {{ formatAmount(amount) }}
      </div>
    </div>

    <!-- 金额范围提示 -->
    <div class="amount-range">
      <van-icon name="balance-o" size="20" color="#999" />
      <span>{{ minAmount }} - {{ formatAmount(maxAmount) }}</span>
    </div>

    <!-- 提现账户管理 -->
    <div class="account-section">
      <div class="section-header">
        <span class="section-title">withdrawal account</span>
        <span class="my-account" @click="goToMyAccount">my account</span>
      </div>

      <!-- 无账户提示 -->
      <div v-if="!hasAccount" class="no-account">
        <div class="no-account-icon">
          <van-icon name="card" size="80" color="#4b5563" />
        </div>
        <div class="no-account-text">Please add a bank account for withdrawal purposes</div>
        <van-button class="add-account-btn" @click="addAccount">
          <van-icon name="plus" size="16" />
          add account
        </van-button>
      </div>

      <!-- 已有账户显示 -->
      <div v-else class="account-card">
        <div class="account-info">
          <div class="account-name">{{ selectedAccount.bankName }}</div>
          <div class="account-number">{{ selectedAccount.accountNumber }}</div>
        </div>
        <van-icon name="edit" size="20" color="#3b82f6" @click="editAccount" />
      </div>
    </div>

    <!-- 提现按钮 -->
    <div class="withdraw-action">
      <van-button class="withdraw-btn" block @click="handleWithdraw">Withdraw Now</van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showDialog } from 'vant'

const router = useRouter()

// 账户余额
const accountBalance = ref(0.0)

// 流水要求
const rolloverRequirement = ref(0.0)

// 选中的提现方式
const selectedMethod = ref('gcash')

// 提现金额
const withdrawAmount = ref('')

// 是否有提现账户
const hasAccount = ref(false)

// 选中的账户
const selectedAccount = ref({
  bankName: 'Gcash',
  accountNumber: '09123456789',
})

// 提现方式列表
const withdrawMethods = ref([
  { id: 'gcash', name: 'Gcash' },
  { id: 'maya', name: 'Maya' },
])

// 快捷金额
const quickAmounts = ref([100.0, 300.0, 800.0, 1000.0, 3000.0, 8000.0, 10000.0, 2000.0, 50000.0])

// 最小金额
const minAmount = ref(50.0)

// 最大金额
const maxAmount = ref(50000.0)

// 格式化金额显示
const formatAmount = (amount: number) => {
  return amount.toFixed(2)
}

// 选择提现方式
const selectMethod = (methodId: string) => {
  selectedMethod.value = methodId
}

// 选择快捷金额
const selectAmount = (amount: number) => {
  withdrawAmount.value = amount.toString()
}

// 刷新余额
const refreshBalance = () => {
  showToast('Refreshing balance...')
  // TODO: 调用 API 刷新余额
}

// 刷新流水要求
const refreshRollover = () => {
  showToast('Refreshing rollover...')
  // TODO: 调用 API 刷新流水要求
}

// 显示流水详情
const showRolloverDetails = () => {
  router.push('/withdraw/history?tab=audit')
}

// 返回
const goBack = () => {
  router.back()
}

// 显示历史记录
const showHistory = () => {
  router.push('/withdraw/history')
}

// 前往我的账户
const goToMyAccount = () => {
  router.push('/withdraw/account')
}

// 添加账户
const addAccount = () => {
  router.push('/withdraw/account')
}

// 编辑账户
const editAccount = () => {
  showToast('Edit Account')
  // TODO: 跳转到编辑账户页面
}

// 处理提现
const handleWithdraw = () => {
  if (!hasAccount.value) {
    showToast('Please add a bank account first')
    return
  }

  if (!withdrawAmount.value || parseFloat(withdrawAmount.value) <= 0) {
    showToast('Please select or enter a valid amount')
    return
  }

  const amount = parseFloat(withdrawAmount.value)

  if (amount < minAmount.value) {
    showToast(`Minimum withdrawal amount is ₱${formatAmount(minAmount.value)}`)
    return
  }

  if (amount > maxAmount.value) {
    showToast(`Maximum withdrawal amount is ₱${formatAmount(maxAmount.value)}`)
    return
  }

  if (amount > accountBalance.value) {
    showToast('Insufficient balance')
    return
  }

  showDialog({
    title: 'Confirm Withdrawal',
    message: `Withdraw ₱${formatAmount(amount)} to ${selectedAccount.value.bankName}?`,
    showCancelButton: true,
  })
    .then(() => {
      showToast('Withdrawal request submitted')
      // TODO: 调用提现 API
    })
    .catch(() => {
      // 用户取消
    })
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.withdraw-page {
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
  }

  // 信息卡片
  .info-cards {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    padding: 16px;

    .info-card {
      background: #fff;
      border: 2px solid #e5e7eb;
      border-radius: 16px;
      padding: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      position: relative;

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        .card-title {
          color: #666;
          font-size: 13px;
          font-weight: 500;
        }
      }

      .card-amount {
        color: $primary-color;
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 8px;
      }

      .view-details {
        color: $primary-color;
        font-size: 12px;
        display: flex;
        align-items: center;
        gap: 4px;
        cursor: pointer;

        &:active {
          opacity: 0.7;
        }
      }
    }
  }

  // 提现方式选择
  .withdraw-methods {
    display: flex;
    gap: 12px;
    padding: 0 16px 20px;

    .method-tab {
      flex: 1;
      background: #fff;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      padding: 12px;
      text-align: center;
      color: $primary-color;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      touch-action: manipulation;
      user-select: none;
      -webkit-tap-highlight-color: transparent;

      &.active {
        background: $gradient-purple;
        border: 2px solid $secondary-color;
        color: #fff;
        box-shadow:
          0 0 0 2px $secondary-color,
          0 4px 16px rgba(85, 37, 131, 0.4);
      }

      &:active {
        transform: scale(0.95);
      }
    }
  }

  // 快捷金额选择
  .quick-amounts {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    padding: 0 16px 20px;

    .amount-btn {
      background: #fff;
      border: 2px solid #e5e7eb;
      border-radius: 16px;
      padding: 20px 12px;
      text-align: center;
      color: $primary-color;
      font-size: 18px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      touch-action: manipulation;
      user-select: none;
      -webkit-tap-highlight-color: transparent;

      &.active {
        background: $gradient-purple;
        border: 2px solid $secondary-color;
        color: #fff;
        box-shadow:
          0 0 0 2px $secondary-color,
          0 4px 16px rgba(85, 37, 131, 0.4);
      }

      &:active {
        transform: scale(0.95);
      }
    }
  }

  // 金额范围提示
  .amount-range {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 16px 24px;
    color: #666;
    font-size: 16px;
    font-weight: 600;
  }

  // 账户管理区域
  .account-section {
    margin: 0 16px 24px;
    background: #fff;
    border: 2px solid #e5e7eb;
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 2px solid #e5e7eb;

      .section-title {
        color: #333;
        font-size: 16px;
        font-weight: 600;
      }

      .my-account {
        color: $primary-color;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;

        &:active {
          opacity: 0.7;
        }
      }
    }

    // 无账户提示
    .no-account {
      text-align: center;
      padding: 20px 0;

      .no-account-icon {
        margin-bottom: 16px;
        opacity: 0.3;
      }

      .no-account-text {
        color: #999;
        font-size: 14px;
        line-height: 1.6;
        margin-bottom: 20px;
      }

      .add-account-btn {
        background: $success-color;
        color: #fff;
        border: none;
        border-radius: 12px;
        padding: 10px 24px;
        font-size: 14px;
        font-weight: 600;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        box-shadow: 0 2px 8px rgba(7, 193, 96, 0.3);
        touch-action: manipulation;
        user-select: none;
        -webkit-tap-highlight-color: transparent;

        &:active {
          opacity: 0.8;
        }
      }
    }

    // 账户卡片
    .account-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f5f5f5;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      padding: 16px;

      .account-info {
        .account-name {
          color: $primary-color;
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 6px;
        }

        .account-number {
          color: #666;
          font-size: 14px;
        }
      }
    }
  }

  // 提现按钮
  .withdraw-action {
    padding: 0 16px;

    .withdraw-btn {
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

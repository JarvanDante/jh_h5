<template>
  <div class="deposit-page">
    <!-- 顶部导航栏 -->
    <div class="top-bar">
      <div class="placeholder"></div>
      <span class="title">Deposit</span>
      <van-icon name="notes-o" size="24" color="#fff" @click="showHistory" />
    </div>

    <!-- 在线存款标签 -->
    <div class="deposit-online-section">
      <div class="section-header">
        <span class="reco-badge">RECO</span>
        <span class="section-title">Deposite on-line</span>
      </div>
    </div>

    <!-- 支付方式网格 -->
    <div class="payment-methods">
      <div
        v-for="method in paymentMethods"
        :key="method.id"
        class="payment-card"
        :class="{ active: selectedMethod === method.id }"
        @click="selectMethod(method.id)"
      >
        <span v-if="method.recommended" class="reco-badge-small">RECO</span>
        <div class="method-name">{{ method.name }}</div>
        <div class="method-icon">🔥</div>
      </div>
    </div>

    <!-- 提示信息 -->
    <div class="bonus-notice">
      <div class="notice-icon">🔥🔥</div>
      <div class="notice-text">
        Dear Player, Enjoy a 1% bonus on all Gcash/Maya deposits! Keep both wallets ready to avoid
        interruptions. Thanks for your support! we'll keep improving our services and benefits for
        you!
      </div>
    </div>

    <!-- 金额输入 -->
    <div class="amount-input-section">
      <div class="amount-display">
        <span class="currency">₱</span>
        <input v-model="depositAmount" type="number" class="amount-input" placeholder="100" />
      </div>
      <div class="gift-display">
        <van-icon name="cross" size="16" color="#999" />
        <span class="gift-label">GIFT</span>
        <span class="gift-amount">+{{ giftAmount }}</span>
      </div>
    </div>

    <!-- 快捷金额选择 -->
    <div class="quick-amounts">
      <div
        v-for="amount in quickAmounts"
        :key="amount"
        class="amount-btn"
        :class="{ active: depositAmount === amount.toString() }"
        @click="selectAmount(amount)"
      >
        {{ formatAmount(amount) }}
      </div>
    </div>

    <!-- 存款按钮 -->
    <div class="deposit-action">
      <van-button class="deposit-btn" block @click="handleDeposit">Deposit Now</van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'

const router = useRouter()

// 选中的支付方式
const selectedMethod = ref('gcash2')

// 存款金额
const depositAmount = ref('100')

// 支付方式列表
const paymentMethods = ref([
  { id: 'gcash2', name: 'Gcash²', recommended: true },
  { id: 'gcash1', name: 'Gcash¹', recommended: true },
  { id: 'gcash', name: 'Gcash', recommended: true },
  { id: 'maya', name: 'maya', recommended: false },
  { id: 'maya2', name: 'maya²', recommended: true },
  { id: 'gotyme', name: 'Gotyme', recommended: true },
])

// 快捷金额
const quickAmounts = ref([100, 300, 500, 1000, 2000, 5000, 10000, 30000, 50000])

// 计算赠送金额（1%）
const giftAmount = computed(() => {
  const amount = parseFloat(depositAmount.value) || 0
  return (amount * 0.01).toFixed(2)
})

// 选择支付方式
const selectMethod = (methodId: string) => {
  selectedMethod.value = methodId
}

// 选择快捷金额
const selectAmount = (amount: number) => {
  depositAmount.value = amount.toString()
}

// 格式化金额显示
const formatAmount = (amount: number) => {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

// 显示历史记录
const showHistory = () => {
  showToast('Deposit History')
}

// 处理存款
const handleDeposit = () => {
  if (!depositAmount.value || parseFloat(depositAmount.value) <= 0) {
    showToast('Please enter a valid amount')
    return
  }
  showToast(`Depositing ₱${depositAmount.value} via ${selectedMethod.value}`)
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.deposit-page {
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

  // 在线存款标签
  .deposit-online-section {
    padding: 16px;
    background: #fff;
    margin-bottom: 16px;

    .section-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding-bottom: 12px;
      border-bottom: 2px solid #e5e7eb;

      .reco-badge {
        background: #ef4444;
        color: #fff;
        padding: 4px 12px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: bold;
      }

      .section-title {
        color: #333;
        font-size: 16px;
        font-weight: 600;
      }
    }
  }

  // 支付方式网格
  .payment-methods {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    padding: 0 16px 16px;

    .payment-card {
      position: relative;
      background: #fff;
      border: 2px solid #e5e7eb;
      border-radius: 16px;
      padding: 12px 8px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      aspect-ratio: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      &.active {
        background: linear-gradient(135deg, #552583 0%, #7b3fa8 100%);
        border: 3px solid #fdb927;
        box-shadow: 0 4px 16px rgba(85, 37, 131, 0.4);

        .method-name {
          color: #fff;
        }
      }

      &:active {
        transform: scale(0.95);
      }

      .reco-badge-small {
        position: absolute;
        top: 4px;
        right: 4px;
        background: #ef4444;
        color: #fff;
        padding: 2px 6px;
        border-radius: 6px;
        font-size: 8px;
        font-weight: bold;
      }

      .method-name {
        color: #552583;
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 6px;
      }

      .method-icon {
        font-size: 32px;
      }
    }
  }

  // 提示信息
  .bonus-notice {
    margin: 0 16px 20px;
    padding: 20px;
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    display: flex;
    gap: 12px;

    .notice-icon {
      font-size: 32px;
      flex-shrink: 0;
    }

    .notice-text {
      color: #999;
      font-size: 13px;
      line-height: 1.6;
    }
  }

  // 金额输入区域
  .amount-input-section {
    margin: 0 16px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;

    .amount-display {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 8px;

      .currency {
        color: #fdb927;
        font-size: 28px;
        font-weight: bold;
      }

      .amount-input {
        flex: 1;
        background: transparent;
        border: none;
        outline: none;
        color: #333;
        font-size: 28px;
        font-weight: bold;

        &::placeholder {
          color: #ccc;
        }
      }
    }

    .gift-display {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      background: #1f1f1f;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

      .gift-label {
        color: #999;
        font-size: 13px;
        font-weight: 600;
      }

      .gift-amount {
        color: #22c55e;
        font-size: 16px;
        font-weight: bold;
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
      color: #552583;
      font-size: 18px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

      &.active {
        background: linear-gradient(135deg, #552583 0%, #7b3fa8 100%);
        border: 3px solid #fdb927;
        color: #fff;
        box-shadow: 0 4px 16px rgba(85, 37, 131, 0.4);
      }

      &:active {
        transform: scale(0.95);
      }
    }
  }

  // 存款按钮
  .deposit-action {
    padding: 0 16px;

    .deposit-btn {
      background: linear-gradient(135deg, #552583 0%, #7b3fa8 100%);
      color: #fff;
      border: none;
      border-radius: 16px;
      font-size: 18px;
      font-weight: bold;
      height: 56px;
      box-shadow: 0 4px 16px rgba(85, 37, 131, 0.4);
      transition: all 0.3s ease;

      &:active {
        transform: scale(0.98);
        opacity: 0.9;
      }
    }
  }
}
</style>

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
          <van-icon
            name="replay"
            size="20"
            color="#3b82f6"
            :class="{ rotating: isRefreshing }"
            @click="refreshBalance"
          />
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
        v-for="channel in withdrawChannels"
        :key="channel.id"
        class="method-tab"
        :class="{ active: selectedMethod === channel.id }"
        @click="selectMethod(channel.id)"
      >
        {{ channel.name }}
      </div>
    </div>

    <!-- 金额选择卡片 -->
    <div class="amount-card">
      <!-- 快捷金额选择 -->
      <div class="quick-amounts">
        <div
          v-for="amount in quickAmounts"
          :key="amount"
          class="amount-btn"
          :class="{
            active: parseFloat(withdrawAmount) === amount,
            disabled: amount > accountBalance,
          }"
          @click="amount <= accountBalance && selectAmount(amount)"
        >
          {{ formatAmount(amount) }}
        </div>
      </div>

      <!-- 金额输入框 -->
      <div class="amount-input-wrapper">
        <span class="currency-symbol">₱</span>
        <input
          v-model="withdrawAmount"
          type="number"
          :placeholder="`${minAmount} - ${formatAmount(maxAmount)}`"
          class="amount-input"
        />
      </div>
    </div>

    <!-- 提现账户管理 -->
    <div class="account-section">
      <div class="section-header">
        <span class="section-title">withdrawal account</span>
        <span class="my-account" @click="goToMyAccount">my account</span>
      </div>

      <!-- 无账户提示 -->
      <div v-if="defaultBankCards.length === 0" class="no-account">
        <div class="no-account-icon">
          <van-icon name="card" size="80" color="#4b5563" />
        </div>
        <div class="no-account-text">Please add a bank account for withdrawal purposes</div>
        <van-button class="add-account-btn" @click="addAccount">
          <van-icon name="plus" size="16" />
          add account
        </van-button>
      </div>

      <!-- 银行卡列表 -->
      <div v-else class="bank-card-list">
        <div v-for="card in defaultBankCards" :key="card.id" class="bank-card-item">
          <div class="card-icon">
            <img v-if="card.type === 1" src="/gcash-icon.png" alt="GCash" class="payment-icon" />
            <img v-else-if="card.type === 2" src="/maya-icon.png" alt="Maya" class="payment-icon" />
            <van-icon v-else name="card" size="40" color="#552583" />
          </div>
          <div class="card-info">
            <div class="card-name">{{ getCardTypeName(card.type) }}</div>
            <div class="card-number">{{ maskCardNumber(card.card_no) }}</div>
          </div>
          <van-icon name="success" size="24" color="#552583" class="check-icon" />
        </div>
      </div>
    </div>

    <!-- 提现按钮 -->
    <div class="withdraw-action">
      <van-button class="withdraw-btn" block @click="handleWithdraw">Withdraw Now</van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showDialog, closeToast } from 'vant'
import {
  getWithdrawList,
  type WithdrawChannel,
  refreshBalance as refreshBalanceApi,
  getBankCardList,
  type BankCard,
  setDefaultBankCard,
  getWithdrawNonce,
  withdraw,
  recallGameBalance,
} from '@/api'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

// 账户余额
const accountBalance = ref(0.0)

// 流水要求
const rolloverRequirement = ref(0.0)

// 是否正在刷新余额
const isRefreshing = ref(false)

// 提现渠道列表
const withdrawChannels = ref<WithdrawChannel[]>([])

// 选中的提现方式ID
const selectedMethod = ref<number | null>(null)

// 提现金额
const withdrawAmount = ref('')

// 银行卡列表
const bankCards = ref<BankCard[]>([])

// 获取选中的提现渠道
const selectedChannel = computed(() => {
  if (!selectedMethod.value) return null
  return withdrawChannels.value.find((channel) => channel.id === selectedMethod.value)
})

// 只显示默认的银行卡
const defaultBankCards = computed(() => {
  return bankCards.value.filter((card) => card.is_default === 1)
})

// 获取当前渠道的快捷金额列表
const quickAmounts = computed(() => {
  if (!selectedChannel.value || !selectedChannel.value.money_list.length) {
    return [100.0, 300.0, 800.0, 1000.0, 3000.0, 8000.0, 10000.0, 2000.0, 50000.0]
  }
  // 将字符串数组转换为数字数组
  return selectedChannel.value.money_list.map((amount) => parseFloat(amount))
})

// 最小金额
const minAmount = computed(() => {
  return selectedChannel.value?.each_min || 50.0
})

// 最大金额
const maxAmount = computed(() => {
  return selectedChannel.value?.each_max || 50000.0
})

// 加载提现渠道列表
const loadWithdrawChannels = async () => {
  try {
    const res = await getWithdrawList()
    withdrawChannels.value = res.list || []

    // 默认选中第一个渠道
    if (withdrawChannels.value.length > 0) {
      selectedMethod.value = withdrawChannels.value[0].id

      // 自动选中第一个快捷金额
      const firstChannel = withdrawChannels.value[0]
      if (firstChannel.money_list && firstChannel.money_list.length > 0) {
        withdrawAmount.value = firstChannel.money_list[0]
      }
    }
  } catch (error) {
    console.error('Failed to load withdraw channels:', error)
    showToast('Failed to load withdrawal methods')
  }
}

// 格式化金额显示
const formatAmount = (amount: number) => {
  return amount.toFixed(2)
}

// 选择提现方式
const selectMethod = (channelId: number) => {
  selectedMethod.value = channelId
  // 切换提现方式时，重置金额为第一个快捷金额
  const channel = withdrawChannels.value.find((c) => c.id === channelId)
  if (channel && channel.money_list && channel.money_list.length > 0) {
    // 直接从渠道的money_list获取第一个金额并转换为数字
    const firstAmount = parseFloat(channel.money_list[0])
    // 转换回字符串时保持数字格式，不要添加小数点
    withdrawAmount.value = String(firstAmount)
  } else {
    withdrawAmount.value = ''
  }
}

// 选择快捷金额
const selectAmount = (amount: number) => {
  withdrawAmount.value = amount.toString()
}

// 刷新余额
const refreshBalance = async () => {
  if (isRefreshing.value) return

  isRefreshing.value = true

  try {
    const res = await refreshBalanceApi()

    // 更新余额显示
    accountBalance.value = parseFloat(res.balance || '0')

    // 更新用户store中的余额
    if (userStore.userInfo) {
      userStore.setUserInfo({
        ...userStore.userInfo,
        balance: res.balance || '0.00',
      })
    }
  } catch (error) {
    console.error('Failed to refresh balance:', error)
    showToast('Failed to refresh balance')
  } finally {
    // 动画持续1秒后才能再次点击
    setTimeout(() => {
      isRefreshing.value = false
    }, 1000)
  }
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
  router.push('/withdraw/add-account')
}

// 加载银行卡列表
const loadBankCards = async () => {
  try {
    const res = await getBankCardList()
    bankCards.value = res.list || []
  } catch (error) {
    console.error('Failed to load bank cards:', error)
  }
}

// 获取卡类型名称
const getCardTypeName = (type: number) => {
  return type === 1 ? 'Gcash' : type === 2 ? 'Maya' : 'Bank Card'
}

// 遮罩卡号
const maskCardNumber = (cardNo: string) => {
  if (!cardNo || cardNo.length < 4) return cardNo
  const lastFour = cardNo.slice(-4)
  return `*******${lastFour}`
}

// 处理提现
const handleWithdraw = async () => {
  if (!selectedMethod.value) {
    showToast('Please select a withdrawal method')
    return
  }

  if (defaultBankCards.value.length === 0) {
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

  if (maxAmount.value > 0 && amount > maxAmount.value) {
    showToast(`Maximum withdrawal amount is ₱${formatAmount(maxAmount.value)}`)
    return
  }

  if (amount > accountBalance.value) {
    showToast('Insufficient balance')
    return
  }

  const channel = selectedChannel.value
  if (!channel) {
    showToast('Please select a withdrawal method')
    return
  }

  try {
    // 显示确认对话框
    await showDialog({
      title: 'Confirm Withdrawal',
      message: `Withdraw ₱${formatAmount(amount)} ${channel.name}?`,
      showCancelButton: true,
    })

    // 显示加载提示
    let toast = showToast({
      type: 'loading',
      message: 'Processing...',
      duration: 0,
      forbidClick: true,
    })

    // 显示加载提示
    showToast({
      type: 'loading',
      message: 'Processing...',
      duration: 0,
      forbidClick: true,
    })

    try {
      // 第1步：一键回收游戏余额
      const recallRes = await recallGameBalance()
      if (!recallRes.success) {
        closeToast()
        showToast({
          type: 'fail',
          message: recallRes.message || 'Failed to recall game balance',
        })
        return
      }

      // 第2步：获取提现 nonce
      const nonceRes = await getWithdrawNonce()
      if (!nonceRes.nonce) {
        closeToast()
        showToast({
          type: 'fail',
          message: 'Failed to get nonce',
        })
        return
      }

      // 第3步：提交提现申请
      // 获取默认银行卡ID
      const defaultCard = defaultBankCards.value[0]
      if (!defaultCard) {
        closeToast()
        showToast({
          type: 'fail',
          message: 'Please add a bank account first',
        })
        return
      }

      const withdrawRes = await withdraw({
        nonce: nonceRes.nonce,
        money: amount,
        withdraw_id: channel.withdraw_id,
        bank_card_id: defaultCard.id,
      })

      closeToast()

      if (withdrawRes.success) {
        // 显示成功提示（绿色对号），使用接口返回的 message
        showToast({
          type: 'success',
          message: withdrawRes.message || 'Withdrawal successful!',
          duration: 2000,
        })

        // 刷新余额
        await refreshBalance()

        // 清空输入
        withdrawAmount.value = ''

        // 可选：跳转到提现历史页面
        setTimeout(() => {
          router.push('/withdraw/history')
        }, 2000)
      } else {
        showToast({
          type: 'fail',
          message: withdrawRes.message || 'Withdrawal failed',
        })
      }
    } catch (error: any) {
      closeToast()
      console.error('Withdrawal error:', error)
      showToast({
        type: 'fail',
        message: error.message || 'Withdrawal failed, please try again',
      })
    }
  } catch {
    // 用户取消了确认对话框
  }
}

// 页面加载时获取提现渠道列表
onMounted(() => {
  loadWithdrawChannels()
  loadBankCards()

  // 如果已登录，加载用户余额
  if (userStore.isLogin && userStore.userInfo) {
    accountBalance.value = parseFloat(userStore.userInfo.balance || '0')
  }
})
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

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

        .van-icon {
          cursor: pointer;
          transition: opacity 0.3s;

          &:active {
            opacity: 0.7;
          }

          &.rotating {
            animation: rotate 1s linear;
          }
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

  // 金额选择卡片
  .amount-card {
    margin: 0 16px 20px;
    background: #fff;
    border: 2px solid #e5e7eb;
    border-radius: 16px;
    padding: 20px 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  // 快捷金额选择
  .quick-amounts {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    padding: 0 0 20px 0;

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

      &.disabled {
        background: #f5f5f5;
        border: 2px solid #e5e7eb;
        color: #ccc;
        cursor: not-allowed;
        opacity: 0.5;

        &:active {
          transform: none;
        }
      }

      &:active:not(.disabled) {
        transform: scale(0.95);
      }
    }
  }

  // 金额输入框
  .amount-input-wrapper {
    position: relative;
    padding: 0;

    .currency-symbol {
      position: absolute;
      left: 20px;
      top: 50%;
      transform: translateY(-50%);
      color: #fdb927;
      font-size: 22px;
      font-weight: bold;
      pointer-events: none;
      z-index: 1;
      line-height: 1;
    }

    .amount-input {
      width: 100%;
      background: #e1d3f6;
      border: 2px solid rgba(85, 37, 131, 0.2);
      border-radius: 16px;
      padding: 14px 20px 14px 45px;
      color: #552583;
      font-size: 18px;
      font-weight: 700;
      outline: none;
      transition: all 0.3s ease;
      box-sizing: border-box;

      &::placeholder {
        color: #fdb927;
        font-weight: 600;
      }

      &:focus {
        border-color: rgba(85, 37, 131, 0.4);
        background: #e0d3f0;
      }

      // 移除number类型输入框的上下箭头
      &::-webkit-outer-spin-button,
      &::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }

      &[type='number'] {
        -moz-appearance: textfield;
      }
    }
  }

  // 账户管理区域
  .account-section {
    margin: 0 16px 24px;
    background: #fff;
    border: 2px solid #e5e7eb;
    border-radius: 16px;
    padding: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 5px;
      padding-bottom: 5px;
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
      padding: 0px 0;

      .no-account-icon {
        margin-bottom: 1px;
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

    // 银行卡列表
    .bank-card-list {
      .bank-card-item {
        display: flex;
        align-items: center;
        gap: 16px;
        background: linear-gradient(135deg, #552583 0%, #7b3fa8 100%);
        border: 2px solid #fdb927;
        border-radius: 12px;
        padding: 16px;
        margin-bottom: 12px;
        box-shadow:
          0 0 0 2px #fdb927,
          0 4px 16px rgba(85, 37, 131, 0.4);
        transition: all 0.3s ease;

        &:last-child {
          margin-bottom: 0;
        }

        .card-icon {
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          overflow: hidden;

          .payment-icon {
            width: 70px;
            height: 70px;
            object-fit: cover;
            object-position: center;
            border-radius: 50%;
          }
        }

        .card-info {
          flex: 1;

          .card-name {
            color: #fff;
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 6px;
          }

          .card-number {
            color: rgba(255, 255, 255, 0.9);
            font-size: 14px;
            font-weight: 500;
            letter-spacing: 1px;
          }
        }

        .check-icon {
          flex-shrink: 0;
          background: #fff;
          border-radius: 50%;
          padding: 2px;
        }
      }
    }
  }

  // 提现按钮
  .withdraw-action {
    padding: 0 16px 20px 16px;

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

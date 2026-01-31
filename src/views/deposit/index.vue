<template>
  <div class="deposit-page">
    <!-- 顶部导航栏 -->
    <div class="top-bar">
      <van-icon name="arrow-left" size="24" color="#fff" @click="goBack" />
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
        v-for="channel in paymentChannels"
        :key="channel.id"
        class="payment-card"
        :class="{ active: selectedMethod === channel.id }"
        @click="selectMethod(channel.id)"
      >
        <span v-if="channel.sort >= 90" class="reco-badge-small">RECO</span>
        <div class="card-content">
          <div class="method-name">{{ channel.name }}</div>
          <div class="method-icon">🔥</div>
        </div>
      </div>
    </div>

    <!-- 提示信息 - 显示选中渠道的remark -->
    <div v-if="selectedChannel && selectedChannel.remark" class="bonus-notice">
      <div class="notice-icon">🔥🔥</div>
      <div class="notice-text">
        {{ selectedChannel.remark }}
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
        :class="{ active: parseFloat(depositAmount) === amount }"
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { getPaymentList, getDepositNonce, createDepositOrder, type PaymentChannel } from '@/api'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

// 返回
const goBack = () => {
  router.back()
}

// 支付渠道列表
const paymentChannels = ref<PaymentChannel[]>([])

// 选中的支付方式ID
const selectedMethod = ref<number | null>(null)

// 存款金额
const depositAmount = ref('100')

// 获取选中的支付渠道
const selectedChannel = computed(() => {
  if (!selectedMethod.value) return null
  return paymentChannels.value.find((channel) => channel.id === selectedMethod.value)
})

// 获取当前渠道的快捷金额列表
const quickAmounts = computed(() => {
  if (!selectedChannel.value || !selectedChannel.value.money_list.length) {
    return [100, 300, 500, 1000, 2000, 5000, 10000, 30000, 50000]
  }
  // 将字符串数组转换为数字数组
  return selectedChannel.value.money_list.map((amount) => parseFloat(amount))
})

// 计算赠送金额（1%）
const giftAmount = computed(() => {
  const amount = parseFloat(depositAmount.value) || 0
  return (amount * 0.01).toFixed(2)
})

// 加载支付渠道列表
const loadPaymentChannels = async () => {
  try {
    const res = await getPaymentList()
    paymentChannels.value = res.list || []

    // 默认选中第一个渠道
    if (paymentChannels.value.length > 0) {
      selectedMethod.value = paymentChannels.value[0].id

      // 自动选中第一个快捷金额
      const firstChannel = paymentChannels.value[0]
      if (firstChannel.money_list && firstChannel.money_list.length > 0) {
        depositAmount.value = firstChannel.money_list[0]
      }
    }
  } catch (error) {
    console.error('Failed to load payment channels:', error)
    showToast('Failed to load payment methods')
  }
}

// 选择支付方式
const selectMethod = (channelId: number) => {
  selectedMethod.value = channelId
  // 切换支付方式时，重置金额为第一个快捷金额
  const channel = paymentChannels.value.find((c) => c.id === channelId)
  if (channel && channel.money_list && channel.money_list.length > 0) {
    // 直接从渠道的money_list获取第一个金额并转换为数字
    const firstAmount = parseFloat(channel.money_list[0])
    // 转换回字符串时保持数字格式，不要添加小数点
    depositAmount.value = String(firstAmount)
  } else {
    depositAmount.value = ''
  }
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
  router.push('/deposit/history')
}

// 处理存款
const handleDeposit = async () => {
  // 检查登录状态
  if (!userStore.isLogin) {
    showToast('Please login first')
    router.push('/login')
    return
  }

  if (!selectedMethod.value) {
    showToast('Please select a payment method')
    return
  }

  if (!depositAmount.value || parseFloat(depositAmount.value) <= 0) {
    showToast('Please enter a valid amount')
    return
  }

  const channel = selectedChannel.value
  if (!channel) {
    showToast('Payment channel not found')
    return
  }

  const amount = parseFloat(depositAmount.value)

  // 检查金额范围
  if (amount < channel.each_min) {
    showToast(`Minimum amount is ₱${channel.each_min}`)
    return
  }

  if (channel.each_max > 0 && amount > channel.each_max) {
    showToast(`Maximum amount is ₱${channel.each_max}`)
    return
  }

  try {
    // 显示加载提示
    showLoadingToast({
      message: 'Processing...',
      forbidClick: true,
      duration: 0,
    })

    // 1. 先获取 nonce
    const nonceRes = await getDepositNonce()
    console.log('Nonce response:', nonceRes)

    if (!nonceRes.nonce) {
      closeToast()
      showToast('Failed to get nonce')
      return
    }

    // 2. 创建充值订单
    const orderRes = await createDepositOrder({
      payment_id: channel.payment_id,
      order_type: 'deposit',
      money: amount,
      nonce: nonceRes.nonce,
    })

    closeToast()

    console.log('Deposit order response:', orderRes)

    // 3. 处理返回结果 - 跳转到支付页面显示二维码
    if (orderRes.result === 'ok' && orderRes.image_url) {
      // 将订单数据编码后传递给支付页面
      const orderData = encodeURIComponent(JSON.stringify(orderRes))
      router.push({
        path: '/deposit/payment',
        query: {
          data: orderData,
          amount: amount.toString(),
        },
      })
    } else {
      showToast('Failed to create order')
    }
  } catch (error: any) {
    closeToast()
    console.error('Deposit failed:', error)

    // 处理错误信息
    if (error.response?.data?.msg) {
      showToast(error.response.data.msg)
    } else if (error.message) {
      showToast(error.message)
    } else {
      showToast('Deposit failed, please try again')
    }
  }
}

// 页面加载时获取支付渠道列表
onMounted(() => {
  loadPaymentChannels()
})
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
      border-radius: 12px;
      padding: 10px 12px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      touch-action: manipulation;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
      min-height: 60px;

      &.active {
        background: linear-gradient(135deg, #552583 0%, #7b3fa8 100%);
        border: 2px solid #fdb927;
        box-shadow:
          0 0 0 2px #fdb927,
          0 4px 16px rgba(85, 37, 131, 0.4);

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

      .card-content {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        width: 100%;
      }

      .method-name {
        color: #552583;
        font-size: 14px;
        font-weight: 600;
      }

      .method-icon {
        font-size: 20px;
        line-height: 1;
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
      touch-action: manipulation;
      user-select: none;
      -webkit-tap-highlight-color: transparent;

      &.active {
        background: linear-gradient(135deg, #552583 0%, #7b3fa8 100%);
        border: 2px solid #fdb927;
        color: #fff;
        box-shadow:
          0 0 0 2px #fdb927,
          0 4px 16px rgba(85, 37, 131, 0.4);
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

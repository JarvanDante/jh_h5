<template>
  <div class="deposit-payment-page">
    <!-- 顶部导航栏 -->
    <div class="top-bar">
      <div class="back-btn" @click="goBack">Finish</div>
      <span class="title">{{ t('depositPayment.title') }}</span>
      <van-icon name="notes-o" size="24" color="#fff" @click="showHistory" />
    </div>

    <!-- 主要内容区域 -->
    <div class="content-wrapper">
      <!-- 支付信息卡片 -->
      <div class="payment-card">
        <!-- 商户信息 -->
        <div class="merchant-info">
          <span class="label">Merchant</span>
          <span class="value">{{ orderInfo.channel_name || 'N/A' }}</span>
        </div>

        <!-- 金额信息 -->
        <div class="amount-info">
          <span class="label">Amount Due</span>
          <span class="amount">PHP {{ depositAmount }}</span>
        </div>

        <!-- Next 按钮 -->
        <div class="next-btn-wrapper">
          <van-button class="next-btn" block>Next</van-button>
        </div>

        <!-- 二维码图片 -->
        <div class="qr-code-section">
          <img
            v-if="orderInfo.image_url"
            :src="orderInfo.image_url"
            alt="Payment QR Code"
            class="qr-code-image"
            @error="handleImageError"
          />
          <van-loading v-else type="spinner" size="48px" color="#552583">Loading...</van-loading>
        </div>
      </div>

      <!-- 订单详情（可选显示） -->
      <div class="order-details">
        <div class="detail-row">
          <span class="detail-label">Order No:</span>
          <span class="detail-value">{{ orderInfo.order_sn }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Account:</span>
          <span class="detail-value">{{ orderInfo.channel_card_no }}</span>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <van-button class="save-btn" block @click="saveImage">
          <van-icon name="photo" size="18" />
          Save QR Code
        </van-button>
        <van-button class="complete-btn" block @click="handleComplete">
          Payment Completed
        </van-button>
      </div>

      <!-- 提示信息 -->
      <div class="tips-section">
        <div class="tips-title">
          <van-icon name="info-o" size="16" color="#fdb927" />
          <span>Payment Instructions</span>
        </div>
        <ul class="tips-list">
          <li>Scan the QR code to complete payment</li>
          <li>Payment must be completed within 15 minutes</li>
          <li>Click "Payment Completed" after successful payment</li>
          <li>Contact customer service if you need help</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { showToast, showConfirmDialog } from 'vant'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()

// 订单信息
const orderInfo = ref({
  order_sn: '',
  channel_name: '',
  channel_card_no: '',
  image_url: '',
  sys_trade_no: '',
  result: '',
})

// 充值金额
const depositAmount = ref('0')

// 返回
const goBack = async () => {
  try {
    await showConfirmDialog({
      title: 'Confirm',
      message: 'Are you sure you want to leave? Please make sure you have completed the payment.',
    })
    router.back()
  } catch {
    // 用户取消
  }
}

// 显示历史记录
const showHistory = () => {
  router.push('/deposit/history')
}

// 保存图片
const saveImage = () => {
  if (!orderInfo.value.image_url) {
    showToast(t('depositPayment.imageNotAvailable'))
    return
  }

  // 创建一个隐藏的 a 标签来下载图片
  const link = document.createElement('a')
  link.href = orderInfo.value.image_url
  link.download = `payment_qr_${orderInfo.value.order_sn}.jpg`
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  showToast(t('depositPayment.qrSaved'))
}

// 处理图片加载错误
const handleImageError = () => {
  showToast(t('depositPayment.qrLoadFailed'))
}

// 支付完成
const handleComplete = async () => {
  try {
    await showConfirmDialog({
      title: 'Confirm',
      message: 'Have you completed the payment?',
    })

    showToast(t('depositPayment.confirmSubmitted'))

    // 延迟跳转到首页
    setTimeout(() => {
      router.replace('/home')
    }, 1500)
  } catch {
    // 用户取消
  }
}

// 页面加载时从路由参数获取订单信息
onMounted(() => {
  const queryData = route.query.data as string
  const amount = route.query.amount as string

  if (amount) {
    depositAmount.value = amount
  }

  if (queryData) {
    try {
      const data = JSON.parse(decodeURIComponent(queryData))
      orderInfo.value = {
        order_sn: data.order_sn || '',
        channel_name: data.channel_name || '',
        channel_card_no: data.channel_card_no || '',
        image_url: data.image_url || '',
        sys_trade_no: data.sys_trade_no || '',
        result: data.result || '',
      }
    } catch (error) {
      console.error('Failed to parse order data:', error)
      showToast(t('depositPayment.invalidOrder'))
      router.back()
    }
  } else {
    showToast(t('depositPayment.orderNotFound'))
    router.back()
  }
})
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.deposit-payment-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #552583 0%, #7b3fa8 50%, #8b4fb8 100%);
  padding-bottom: 20px;

  .top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background: #3d1a5f;

    .back-btn {
      color: #fff;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      padding: 4px 8px;

      &:active {
        opacity: 0.7;
      }
    }

    .title {
      color: #fff;
      font-size: 20px;
      font-weight: bold;
    }
  }

  // 内容包装器
  .content-wrapper {
    padding: 12px;
  }

  // 支付信息卡片
  .payment-card {
    background: #fff;
    border-radius: 16px;
    padding: 16px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    margin-bottom: 10px;

    // 商户信息
    .merchant-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 10px;
      border-bottom: 1px solid #e5e7eb;
      margin-bottom: 10px;

      .label {
        color: #9ca3af;
        font-size: 14px;
      }

      .value {
        color: #1f2937;
        font-size: 16px;
        font-weight: 700;
      }
    }

    // 金额信息
    .amount-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .label {
        color: #9ca3af;
        font-size: 14px;
      }

      .amount {
        color: #2563eb;
        font-size: 22px;
        font-weight: 800;
      }
    }

    // Next 按钮
    .next-btn-wrapper {
      margin-bottom: 12px;

      .next-btn {
        background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
        color: #fff;
        border: none;
        border-radius: 12px;
        font-size: 16px;
        font-weight: 700;
        height: 44px;
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);

        &:active {
          opacity: 0.9;
          transform: translateY(1px);
        }
      }
    }

    // 二维码区域
    .qr-code-section {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 170px;
      max-height: 190px;
      background: #f9fafb;
      border-radius: 10px;
      padding: 10px;

      .qr-code-image {
        max-width: 100%;
        max-height: 170px;
        object-fit: contain;
        border-radius: 8px;
      }
    }
  }

  // 订单详情
  .order-details {
    background: rgba(255, 255, 255, 0.98);
    border-radius: 14px;
    padding: 12px 14px;
    margin-bottom: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 8px 0;
      gap: 12px;

      &:not(:last-child) {
        border-bottom: 1px solid #f3f4f6;
      }

      .detail-label {
        color: #6b7280;
        font-size: 13px;
        font-weight: 500;
        flex-shrink: 0;
        width: 70px;
      }

      .detail-value {
        color: #1f2937;
        font-size: 13px;
        font-weight: 600;
        word-break: break-word;
        text-align: right;
        flex: 1;
        line-height: 1.5;
      }
    }
  }

  // 操作按钮
  .action-buttons {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 10px;

    .save-btn {
      background: #fff;
      color: #552583;
      border: 2px solid #fff;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 700;
      height: 46px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      box-shadow: 0 4px 12px rgba(255, 255, 255, 0.3);

      &:active {
        transform: scale(0.98);
        opacity: 0.9;
      }
    }

    .complete-btn {
      background: linear-gradient(135deg, #fdb927 0%, #f59e0b 100%);
      color: #1f2937;
      border: none;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 800;
      height: 50px;
      box-shadow: 0 6px 20px rgba(253, 185, 39, 0.5);
      letter-spacing: 0.5px;

      &:active {
        transform: scale(0.98);
        opacity: 0.95;
      }
    }
  }

  // 提示信息
  .tips-section {
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    padding: 12px;
    backdrop-filter: blur(10px);

    .tips-title {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 8px;
      color: #fdb927;
      font-size: 14px;
      font-weight: 700;
    }

    .tips-list {
      padding-left: 18px;
      margin: 0;

      li {
        color: rgba(255, 255, 255, 0.9);
        font-size: 12px;
        line-height: 1.6;
        list-style-type: disc;

        &::marker {
          color: #fdb927;
        }
      }
    }
  }
}
</style>

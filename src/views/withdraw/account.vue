<template>
  <div class="account-page">
    <!-- 顶部导航栏 -->
    <div class="top-bar">
      <van-icon name="arrow-left" size="24" color="#fff" @click="goBack" />
      <span class="title">{{ t('withdrawAccount.title') }}</span>
      <div class="placeholder"></div>
    </div>

    <!-- 内容区域 -->
    <div class="content">
      <!-- 如果有银行卡数据，只显示列表 -->
      <div v-if="bankCards.length > 0" class="bank-cards-view">
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

        <!-- 银行卡列表 -->
        <div class="bank-card-list">
          <div
            v-for="card in filteredBankCards"
            :key="card.id"
            class="bank-card-item"
            :class="{ default: card.is_default === 1 }"
          >
            <div class="card-content">
              <div class="card-icon">
                <img
                  v-if="card.type === 1"
                  src="/gcash-icon.png"
                  alt="GCash"
                  class="payment-icon"
                />
                <img
                  v-else-if="card.type === 2"
                  src="/maya-icon.png"
                  alt="Maya"
                  class="payment-icon"
                />
                <van-icon v-else name="card" size="40" color="#552583" />
              </div>
              <div class="card-info">
                <div class="card-name">{{ getCardTypeName(card.type) }}</div>
                <div class="card-number">{{ maskCardNumber(card.card_no) }}</div>
              </div>
              <div v-if="card.is_default === 1" class="default-badge">
                <van-icon name="success" size="18" color="#fff" />
                <span>default</span>
              </div>
            </div>

            <!-- 非默认卡片显示操作按钮 -->
            <div v-if="card.is_default !== 1" class="card-actions">
              <van-button
                class="action-btn set-default-btn"
                size="small"
                @click="handleSetDefault(card.id)"
              >
                Set Default
              </van-button>
              <van-button class="action-btn delete-btn" size="small" @click="handleDelete(card.id)">
                Delete
              </van-button>
            </div>
          </div>
        </div>

        <!-- 添加账户按钮 -->
        <div class="add-account-section">
          <div class="add-account-btn" @click="showAddForm">
            <van-icon name="plus" size="20" color="#3b82f6" />
            <span>add account</span>
          </div>
        </div>
      </div>

      <!-- 如果没有银行卡数据，显示空状态 -->
      <div v-else class="empty-state">
        <van-empty description="No bank account yet" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { showToast, showDialog } from 'vant'
import { getBankCardList, setDefaultBankCard, deleteBankCard, type BankCard } from '@/api'

const router = useRouter()
const { t } = useI18n()

// 选中的提现方式
const selectedMethod = ref(1) // 1=Gcash, 2=Maya

// 提现方式列表
const withdrawMethods = ref([
  { id: 1, name: 'Gcash' },
  { id: 2, name: 'Maya' },
])

// 银行卡列表
const bankCards = ref<BankCard[]>([])

// 根据选中的方式过滤银行卡
const filteredBankCards = computed(() => {
  return bankCards.value.filter((card) => card.type === selectedMethod.value)
})

// 加载银行卡列表
const loadBankCards = async () => {
  try {
    const res = await getBankCardList()
    bankCards.value = res.list || []
  } catch (error) {
    console.error('Failed to load bank cards:', error)
  }
}

// 选择提现方式
const selectMethod = (methodId: number) => {
  selectedMethod.value = methodId
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

// 显示添加表单
const showAddForm = () => {
  router.push('/withdraw/add-account')
}

// 设置默认银行卡
const handleSetDefault = async (cardId: number) => {
  try {
    const res = await setDefaultBankCard(cardId)
    if (res.success) {
      showToast(t('withdrawAccount.setDefaultSuccess'))
      // 重新加载银行卡列表
      await loadBankCards()
    } else {
      showToast(res.message || t('withdrawAccount.setDefaultFailed'))
    }
  } catch (error: any) {
    console.error('设置默认银行卡失败:', error)
    showToast(error.message || t('withdrawAccount.setDefaultFailed'))
  }
}

// 删除银行卡
const handleDelete = async (cardId: number) => {
  try {
    await showDialog({
      title: t('common.confirm'),
      message: t('withdrawAccount.deleteConfirm'),
      showCancelButton: true,
      confirmButtonText: t('common.confirm'),
      confirmButtonColor: '#ee0a24',
    })

    const res = await deleteBankCard(cardId)
    if (res.success) {
      showToast(t('withdrawAccount.deleteSuccess'))
      // 重新加载银行卡列表
      await loadBankCards()
    } else {
      showToast(res.message || t('withdrawAccount.deleteFailed'))
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      showToast(error.message || t('withdrawAccount.deleteFailed'))
    }
  }
}

// 返回
const goBack = () => {
  router.back()
}

// 页面加载时获取银行卡列表
onMounted(() => {
  loadBankCards()
})
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.account-page {
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

  // 银行卡列表视图
  .bank-cards-view {
    .bank-card-list {
      margin-bottom: 24px;

      .bank-card-item {
        background: linear-gradient(135deg, #552583 0%, #7b3fa8 100%);
        border: 2px solid #fdb927;
        border-radius: 16px;
        padding: 16px;
        margin-bottom: 16px;
        box-shadow:
          0 0 0 2px #fdb927,
          0 4px 20px rgba(85, 37, 131, 0.3);
        transition: all 0.3s ease;

        &:last-child {
          margin-bottom: 0;
        }

        .card-content {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .card-icon {
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;

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

        .default-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 255, 255, 0.25);
          border-radius: 20px;
          padding: 6px 14px;
          flex-shrink: 0;

          span {
            color: #fff;
            font-size: 14px;
            font-weight: 600;
          }
        }

        .card-actions {
          display: flex;
          gap: 12px;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.2);

          .action-btn {
            flex: 1;
            height: 40px;
            border-radius: 10px;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.3s ease;
            touch-action: manipulation;
            user-select: none;
            -webkit-tap-highlight-color: transparent;

            &.set-default-btn {
              background: rgba(255, 255, 255, 0.9);
              color: #552583;
              border: none;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

              &:active {
                transform: scale(0.98);
                background: #fff;
              }
            }

            &.delete-btn {
              background: transparent;
              color: #fff;
              border: 2px solid rgba(255, 255, 255, 0.6);

              &:active {
                transform: scale(0.98);
                background: rgba(255, 255, 255, 0.1);
              }
            }
          }
        }
      }
    }

    .add-account-section {
      .add-account-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        background: #fff;
        border: 2px dashed #3b82f6;
        border-radius: 16px;
        padding: 20px;
        color: #3b82f6;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        touch-action: manipulation;
        user-select: none;
        -webkit-tap-highlight-color: transparent;

        &:active {
          transform: scale(0.98);
          background: #f0f9ff;
        }
      }
    }
  }

  // 空状态
  .empty-state {
    padding: 60px 20px;
    text-align: center;
  }
}
</style>

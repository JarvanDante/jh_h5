<template>
  <div class="promotion-page">
    <!-- 顶部导航栏 -->
    <div class="top-bar">
      <van-icon name="arrow-left" size="24" color="#fff" @click="goBack" />
      <span class="title">Promotion</span>
      <div class="placeholder"></div>
    </div>

    <!-- 标签页导航 -->
    <van-tabs
      v-model:active="activeTab"
      color="#FDB927"
      title-active-color="#FDB927"
      background="#1f1f1f"
    >
      <van-tab title="Events">
        <div class="promotion-list">
          <div
            v-for="promo in eventPromotions"
            :key="promo.id"
            class="promo-card"
            @click="handlePromoClick(promo)"
          >
            <div class="card-header">
              <span class="site-badge">PH988.PH</span>
            </div>
            <div class="card-content">
              <div class="promo-info">
                <h3 class="promo-title">{{ promo.title }}</h3>
                <p class="promo-desc">{{ promo.description }}</p>
                <van-button class="claim-btn" size="small" color="#FDB927">Claim Now</van-button>
              </div>
              <div class="promo-image">
                <img :src="promo.image" :alt="promo.title" />
              </div>
            </div>
          </div>
        </div>
      </van-tab>

      <van-tab title="Rebate">
        <div class="promotion-list">
          <div
            v-for="promo in rebatePromotions"
            :key="promo.id"
            class="promo-card"
            @click="handlePromoClick(promo)"
          >
            <div class="card-header">
              <span class="site-badge">PH988.PH</span>
            </div>
            <div class="card-content">
              <div class="promo-info">
                <h3 class="promo-title">{{ promo.title }}</h3>
                <p class="promo-desc">{{ promo.description }}</p>
                <van-button class="claim-btn" size="small" color="#FDB927">Claim Now</van-button>
              </div>
              <div class="promo-image">
                <img :src="promo.image" :alt="promo.title" />
              </div>
            </div>
          </div>
        </div>
      </van-tab>

      <van-tab title="VIP">
        <div class="promotion-list">
          <div
            v-for="promo in vipPromotions"
            :key="promo.id"
            class="promo-card"
            @click="handlePromoClick(promo)"
          >
            <div class="card-header">
              <span class="site-badge">PH988.PH</span>
            </div>
            <div class="card-content">
              <div class="promo-info">
                <h3 class="promo-title">{{ promo.title }}</h3>
                <p class="promo-desc">{{ promo.description }}</p>
                <van-button class="claim-btn" size="small" color="#FDB927">Claim Now</van-button>
              </div>
              <div class="promo-image">
                <img :src="promo.image" :alt="promo.title" />
              </div>
            </div>
          </div>
        </div>
      </van-tab>

      <van-tab title="Redeem">
        <div class="promotion-list">
          <div class="redeem-section">
            <div class="redeem-input-wrapper">
              <van-field
                v-model="redeemCode"
                placeholder="Enter your redeem code"
                clearable
                class="redeem-input"
              />
              <van-button class="redeem-btn" color="#FDB927" @click="handleRedeem"
                >Redeem</van-button
              >
            </div>
          </div>
        </div>
      </van-tab>

      <van-tab title="History">
        <div class="promotion-list">
          <div v-if="historyList.length === 0" class="empty-state">
            <van-empty description="No promotion history" />
          </div>
          <div v-else class="history-list">
            <div v-for="item in historyList" :key="item.id" class="history-item">
              <div class="history-info">
                <h4>{{ item.title }}</h4>
                <p class="history-time">{{ item.time }}</p>
              </div>
              <div class="history-status" :class="item.status">{{ item.statusText }}</div>
            </div>
          </div>
        </div>
      </van-tab>

      <van-tab title="Reward">
        <div class="promotion-list">
          <div v-if="rewardList.length === 0" class="empty-state">
            <van-empty description="No rewards available" />
          </div>
          <div v-else class="reward-list">
            <div v-for="reward in rewardList" :key="reward.id" class="reward-item">
              <div class="reward-icon">🎁</div>
              <div class="reward-info">
                <h4>{{ reward.title }}</h4>
                <p class="reward-amount">₱{{ reward.amount }}</p>
              </div>
              <van-button size="small" color="#FDB927" @click="handleClaimReward(reward)"
                >Claim</van-button
              >
            </div>
          </div>
        </div>
      </van-tab>
    </van-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'

const router = useRouter()
const activeTab = ref(0)
const redeemCode = ref('')

// 活动促销数据
const eventPromotions = ref([
  {
    id: 1,
    title: 'Welcome Bonus',
    description: 'Get 100% bonus up to ₱10,000 on your first deposit!',
    image: 'https://via.placeholder.com/120x120/FDB927/552583?text=Welcome',
  },
  {
    id: 2,
    title: 'Daily Spin',
    description: 'Spin the wheel daily and win amazing prizes!',
    image: 'https://via.placeholder.com/120x120/552583/FDB927?text=Spin',
  },
  {
    id: 3,
    title: 'Weekend Bonus',
    description: "Extra 50% bonus every weekend. Don't miss out!",
    image: 'https://via.placeholder.com/120x120/FDB927/552583?text=Weekend',
  },
])

// 返水促销数据
const rebatePromotions = ref([
  {
    id: 4,
    title: 'Daily Rebate',
    description: 'Get up to 1.2% daily rebate on all your bets!',
    image: 'https://via.placeholder.com/120x120/552583/FDB927?text=Rebate',
  },
  {
    id: 5,
    title: 'Weekly Cashback',
    description: 'Receive 5% cashback on your weekly losses!',
    image: 'https://via.placeholder.com/120x120/FDB927/552583?text=Cashback',
  },
])

// VIP促销数据
const vipPromotions = ref([
  {
    id: 6,
    title: 'VIP Exclusive',
    description: 'Join VIP club and enjoy exclusive benefits!',
    image: 'https://via.placeholder.com/120x120/FDB927/552583?text=VIP',
  },
  {
    id: 7,
    title: 'VIP Birthday Bonus',
    description: 'Special birthday bonus for all VIP members!',
    image: 'https://via.placeholder.com/120x120/552583/FDB927?text=Birthday',
  },
])

// 历史记录
const historyList = ref([
  {
    id: 1,
    title: 'Welcome Bonus',
    time: '2025-01-20 10:30:00',
    status: 'completed',
    statusText: 'Completed',
  },
  {
    id: 2,
    title: 'Daily Spin',
    time: '2025-01-21 15:20:00',
    status: 'pending',
    statusText: 'Pending',
  },
])

// 奖励列表
const rewardList = ref([
  {
    id: 1,
    title: 'Login Reward',
    amount: '100.00',
  },
  {
    id: 2,
    title: 'Daily Task Reward',
    amount: '50.00',
  },
])

const goBack = () => {
  router.back()
}

const handlePromoClick = (promo: any) => {
  showToast(`View details: ${promo.title}`)
}

const handleRedeem = () => {
  if (!redeemCode.value) {
    showToast('Please enter redeem code')
    return
  }
  showToast(`Redeeming: ${redeemCode.value}`)
  redeemCode.value = ''
}

const handleClaimReward = (reward: any) => {
  showToast(`Claiming reward: ${reward.title}`)
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.promotion-page {
  min-height: 100vh;
  background: #000;
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
      font-size: 18px;
      font-weight: bold;
    }

    .placeholder {
      width: 24px;
    }
  }

  :deep(.van-tabs) {
    .van-tabs__wrap {
      background: #1f1f1f;
      border-bottom: 1px solid #333;
    }

    .van-tabs__nav {
      background: transparent;
    }

    .van-tab {
      color: #999;
      font-size: 14px;
      font-weight: 500;

      &--active {
        color: #fdb927;
        font-weight: bold;
      }
    }

    .van-tabs__line {
      background: #fdb927;
    }

    .van-tabs__content {
      background: #000;
    }
  }

  .promotion-list {
    padding: 16px;
    min-height: calc(100vh - 150px);
  }

  .promo-card {
    background: #552583;
    border: 2px solid #fdb927;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 16px;
    box-shadow: 0 4px 12px rgba(253, 185, 39, 0.3);
    cursor: pointer;
    transition: all 0.3s ease;

    &:active {
      transform: scale(0.98);
    }

    .card-header {
      margin-bottom: 12px;

      .site-badge {
        display: inline-block;
        background: rgba(255, 255, 255, 0.2);
        color: #fff;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: bold;
      }
    }

    .card-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;

      .promo-info {
        flex: 1;

        .promo-title {
          color: #fff;
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 8px;
        }

        .promo-desc {
          color: rgba(255, 255, 255, 0.9);
          font-size: 13px;
          line-height: 1.5;
          margin-bottom: 12px;
        }

        .claim-btn {
          font-weight: bold;
          border-radius: 20px;
          padding: 8px 20px;
        }
      }

      .promo-image {
        width: 100px;
        height: 100px;
        flex-shrink: 0;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 8px;
        }
      }
    }
  }

  .redeem-section {
    .redeem-input-wrapper {
      display: flex;
      gap: 12px;
      align-items: center;

      .redeem-input {
        flex: 1;

        :deep(.van-field__control) {
          color: #fff;
        }

        :deep(.van-cell) {
          background: #1f1f1f;
          border: 1px solid #333;
          border-radius: 8px;
        }
      }

      .redeem-btn {
        font-weight: bold;
        border-radius: 8px;
        padding: 12px 24px;
      }
    }
  }

  .empty-state {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 300px;
  }

  .history-list {
    .history-item {
      background: #1f1f1f;
      border: 1px solid #333;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .history-info {
        flex: 1;

        h4 {
          color: #fff;
          font-size: 15px;
          font-weight: bold;
          margin-bottom: 4px;
        }

        .history-time {
          color: #999;
          font-size: 12px;
        }
      }

      .history-status {
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: bold;

        &.completed {
          background: rgba(34, 197, 94, 0.2);
          color: #22c55e;
        }

        &.pending {
          background: rgba(251, 191, 36, 0.2);
          color: #fbbf24;
        }
      }
    }
  }

  .reward-list {
    .reward-item {
      background: #1f1f1f;
      border: 1px solid #333;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 12px;

      .reward-icon {
        width: 48px;
        height: 48px;
        font-size: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #fdb927, #ff9800);
        border-radius: 50%;
      }

      .reward-info {
        flex: 1;

        h4 {
          color: #fff;
          font-size: 15px;
          font-weight: bold;
          margin-bottom: 4px;
        }

        .reward-amount {
          color: #fdb927;
          font-size: 16px;
          font-weight: bold;
        }
      }
    }
  }
}
</style>

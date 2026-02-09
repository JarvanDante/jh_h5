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
      color="#552583"
      title-active-color="#552583"
      background="#fff"
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
    </van-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'

const router = useRouter()
const activeTab = ref(0)

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

const goBack = () => {
  router.back()
}

const handlePromoClick = (promo: any) => {
  showToast(`View details: ${promo.title}`)
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.promotion-page {
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
      font-size: 18px;
      font-weight: bold;
    }

    .placeholder {
      width: 24px;
    }
  }

  :deep(.van-tabs) {
    .van-tabs__wrap {
      background: #fff;
      border-bottom: 1px solid #eee;
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
      background: #f5f5f5;
    }
  }

  .promotion-list {
    padding: 16px;
    min-height: calc(100vh - 150px);
  }

  .promo-card {
    background: linear-gradient(135deg, #552583 0%, #7b3fa8 100%);
    border: none;
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 16px;
    box-shadow: 0 4px 12px rgba(85, 37, 131, 0.4);
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(85, 37, 131, 0.5);
    }

    &:active {
      transform: scale(0.98);
    }

    .card-header {
      margin-bottom: 12px;

      .site-badge {
        display: inline-block;
        background: rgba(253, 185, 39, 0.2);
        border: 1px solid #fdb927;
        color: #fdb927;
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
          padding: 8px 24px;
          background: linear-gradient(135deg, #fdb927 0%, #ff9800 100%);
          border: none;
          box-shadow: 0 2px 8px rgba(253, 185, 39, 0.4);
        }
      }

      .promo-image {
        width: 100px;
        height: 100px;
        flex-shrink: 0;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 8px;
        display: flex;
        align-items: center;
        justify-content: center;

        img {
          width: 100%;
          height: 100%;
          object-fit: contain;
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
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(253, 185, 39, 0.3);
          border-radius: 8px;
          color: #fff;
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
      background: linear-gradient(135deg, #552583 0%, #7b3fa8 100%);
      border: none;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 12px;
      box-shadow: 0 4px 12px rgba(85, 37, 131, 0.4);
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
      background: linear-gradient(135deg, #552583 0%, #7b3fa8 100%);
      border: none;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 12px;
      box-shadow: 0 4px 12px rgba(85, 37, 131, 0.4);
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

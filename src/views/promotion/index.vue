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
          <van-loading v-if="eventsLoading" type="spinner" size="24px" class="loading-center"
            >Loading...</van-loading
          >
          <template v-else-if="eventPromotions.length > 0">
            <div
              v-for="promo in eventPromotions"
              :key="promo.id"
              class="event-card"
              @click="handlePromoClick(promo)"
            >
              <div class="event-icon">{{ getActivityIcon(promo.code) }}</div>
              <div class="event-body">
                <h3 class="event-title">{{ promo.name }}</h3>
                <p v-if="promo.description" class="event-desc">{{ promo.description }}</p>
                <div class="event-status">
                  <span v-if="promo.status === 1" class="status-tag active">Active</span>
                  <span v-else class="status-tag inactive">Inactive</span>
                </div>
              </div>
              <van-icon name="arrow" size="20" color="#fdb927" />
            </div>
          </template>
          <van-empty v-else description="No events available" />
        </div>
      </van-tab>

      <van-tab title="Rebate">
        <div class="promotion-list">
          <div class="rebate-card" @click="router.push('/rebate')">
            <div class="rebate-icon">💰</div>
            <div class="rebate-body">
              <h3 class="rebate-title">Daily Rebate</h3>
              <p class="rebate-desc">Bet more, earn more. Get rebate on every bet you place.</p>
              <div class="rebate-highlights">
                <span class="highlight-tag">Up to 1.2%</span>
                <span class="highlight-tag">Auto Claim</span>
                <span class="highlight-tag">Daily</span>
              </div>
            </div>
            <van-icon name="arrow" size="20" color="#fdb927" />
          </div>
        </div>
      </van-tab>

      <van-tab title="VIP">
        <div class="promotion-list">
          <div class="vip-card" @click="router.push('/vip')">
            <div class="vip-crown">👑</div>
            <div class="vip-body">
              <h3 class="vip-title">VIP Club</h3>
              <p class="vip-desc">Level up and unlock exclusive rewards, bonuses and privileges.</p>
              <div class="vip-highlights">
                <span class="highlight-tag">Upgrade Bonus</span>
                <span class="highlight-tag">Exclusive</span>
              </div>
            </div>
            <van-icon name="arrow" size="20" color="#fdb927" />
          </div>
        </div>
      </van-tab>
    </van-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { userApi } from '@/api/modules/user'

const router = useRouter()
const activeTab = ref(0)

// Events 活动数据（从接口获取）
const eventPromotions = ref<any[]>([])
const eventsLoading = ref(false)

// 获取活动列表
const fetchSiteActivities = async () => {
  try {
    eventsLoading.value = true
    const res = await userApi.getSiteActivityList()
    console.log('活动列表响应:', res)
    const rawList = res?.list && res.list.length > 0 ? res.list : Array.isArray(res) ? res : []

    // 只展示启用中的活动，并过滤掉 Invite（已下线）
    eventPromotions.value = rawList.filter((item: any) => Number(item?.status) === 1 && item?.code !== 'INVITE')
  } catch (error) {
    console.error('获取活动列表失败:', error)
  } finally {
    eventsLoading.value = false
  }
}

onMounted(() => {
  fetchSiteActivities()
})

const goBack = () => {
  router.back()
}

const handlePromoClick = (promo: any) => {
  if (promo.uri) {
    router.push(promo.uri)
  }
}

// 根据活动 code 返回对应图标
const getActivityIcon = (code: string) => {
  const iconMap: Record<string, string> = {
    LUCKY: '🎡',
    DEPOSIT: '💰',
    REGISTER: '🎁',
    INVITE: '👥',
    SIGNIN: '📅',
    REBATE: '💵',
  }
  return iconMap[code] || '🎯'
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

    .loading-center {
      display: flex;
      justify-content: center;
      padding: 40px 0;
    }
  }

  .event-card {
    background: linear-gradient(135deg, #552583 0%, #7b3fa8 100%);
    border-radius: 16px;
    padding: 16px 20px;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 14px;
    box-shadow: 0 4px 12px rgba(85, 37, 131, 0.4);
    cursor: pointer;
    transition: all 0.3s ease;

    &:active {
      transform: scale(0.98);
    }

    .event-icon {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      background: rgba(253, 185, 39, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      flex-shrink: 0;
    }

    .event-body {
      flex: 1;
      min-width: 0;

      .event-title {
        color: #fff;
        font-size: 15px;
        font-weight: bold;
        margin-bottom: 4px;
      }

      .event-desc {
        color: rgba(255, 255, 255, 0.75);
        font-size: 12px;
        line-height: 1.4;
        margin-bottom: 6px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .event-status {
        .status-tag {
          font-size: 11px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 10px;

          &.active {
            background: rgba(34, 197, 94, 0.2);
            color: #4ade80;
          }

          &.inactive {
            background: rgba(255, 255, 255, 0.1);
            color: rgba(255, 255, 255, 0.5);
          }
        }
      }
    }
  }

  .vip-card {
    background: linear-gradient(135deg, #552583 0%, #7b3fa8 100%);
    border-radius: 16px;
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 14px;
    box-shadow: 0 4px 12px rgba(85, 37, 131, 0.4);
    cursor: pointer;
    transition: all 0.3s ease;

    &:active {
      transform: scale(0.98);
    }

    .vip-crown {
      width: 52px;
      height: 52px;
      border-radius: 14px;
      background: rgba(253, 185, 39, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      flex-shrink: 0;
    }

    .vip-body {
      flex: 1;
      min-width: 0;

      .vip-title {
        color: #fff;
        font-size: 17px;
        font-weight: bold;
        margin-bottom: 4px;
      }

      .vip-desc {
        color: rgba(255, 255, 255, 0.8);
        font-size: 12px;
        line-height: 1.4;
        margin-bottom: 10px;
      }

      .vip-highlights {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;

        .highlight-tag {
          background: rgba(253, 185, 39, 0.2);
          border: 1px solid rgba(253, 185, 39, 0.4);
          color: #fdb927;
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 600;
        }
      }
    }
  }

  .rebate-card {
    background: linear-gradient(135deg, #552583 0%, #7b3fa8 100%);
    border-radius: 16px;
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 14px;
    box-shadow: 0 4px 12px rgba(85, 37, 131, 0.4);
    cursor: pointer;
    transition: all 0.3s ease;

    &:active {
      transform: scale(0.98);
    }

    .rebate-icon {
      width: 52px;
      height: 52px;
      border-radius: 14px;
      background: rgba(253, 185, 39, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      flex-shrink: 0;
    }

    .rebate-body {
      flex: 1;
      min-width: 0;

      .rebate-title {
        color: #fff;
        font-size: 17px;
        font-weight: bold;
        margin-bottom: 4px;
      }

      .rebate-desc {
        color: rgba(255, 255, 255, 0.8);
        font-size: 12px;
        line-height: 1.4;
        margin-bottom: 10px;
      }

      .rebate-highlights {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;

        .highlight-tag {
          background: rgba(253, 185, 39, 0.2);
          border: 1px solid rgba(253, 185, 39, 0.4);
          color: #fdb927;
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 600;
        }
      }
    }
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
}
</style>

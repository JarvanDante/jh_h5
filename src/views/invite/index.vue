<template>
  <div class="invite-page">
    <!-- 顶部导航栏 -->
    <div class="top-bar">
      <van-icon name="arrow-left" size="24" color="#fff" @click="goBack" />
      <span class="title">Invite Friends</span>
      <div class="placeholder"></div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card blue">
        <div class="stat-label">Today's Income</div>
        <div class="stat-value">{{ todayIncome }}</div>
      </div>
      <div class="stat-card purple">
        <div class="stat-label">Yesterday's Income</div>
        <div class="stat-value">{{ yesterdayIncome }}</div>
      </div>
      <div class="stat-card purple-alt">
        <div class="stat-label">Registers</div>
        <div class="stat-value">{{ registers }}</div>
      </div>
      <div class="stat-card blue-alt">
        <div class="stat-label">Valid Referral</div>
        <div class="stat-value">{{ validReferral }}</div>
      </div>
    </div>

    <!-- 分享区域 -->
    <div class="share-section">
      <h3 class="section-title">Share to your friends</h3>
      <div class="share-label">Share to your friends</div>
      <div class="social-icons">
        <div class="social-icon facebook" @click="shareToSocial('facebook')">
          <van-icon name="facebook" size="28" color="#fff" />
        </div>
        <div class="social-icon twitter" @click="shareToSocial('twitter')">
          <van-icon name="twitter" size="28" color="#fff" />
        </div>
        <div class="social-icon telegram" @click="shareToSocial('telegram')">
          <van-icon name="chat-o" size="28" color="#fff" />
        </div>
        <div class="social-icon whatsapp" @click="shareToSocial('whatsapp')">
          <van-icon name="chat-o" size="28" color="#fff" />
        </div>
        <div class="social-icon wechat" @click="shareToSocial('wechat')">
          <van-icon name="chat-o" size="28" color="#fff" />
        </div>
        <div class="social-icon line" @click="shareToSocial('line')">
          <van-icon name="chat-o" size="28" color="#fff" />
        </div>
        <div class="social-icon share" @click="shareToSocial('more')">
          <van-icon name="share-o" size="28" color="#fff" />
        </div>
      </div>
      <div class="invite-link">
        <van-icon name="link" size="20" color="#666" />
        <input type="text" :value="inviteLink" readonly class="link-input" />
        <van-button size="small" color="#5b7cff" @click="copyLink">Copy</van-button>
      </div>
    </div>

    <!-- 排行榜 -->
    <div class="leaderboard-section">
      <h2 class="section-title-large">Leaderboard</h2>
      <div class="leaderboard-podium">
        <div class="podium-item second">
          <div class="rank-badge">2</div>
          <div class="avatar">
            <img src="https://via.placeholder.com/80/4ecdc4/ffffff?text=2" alt="Rank 2" />
          </div>
          <div class="username">aw*****7</div>
          <div class="amount">₱ 916,093.27</div>
        </div>
        <div class="podium-item first">
          <div class="rank-badge">1</div>
          <div class="avatar">
            <img src="https://via.placeholder.com/100/ffd700/ffffff?text=1" alt="Rank 1" />
          </div>
          <div class="username">ch*****0</div>
          <div class="amount">₱ 4,515,890.01</div>
        </div>
        <div class="podium-item third">
          <div class="rank-badge">3</div>
          <div class="avatar">
            <img src="https://via.placeholder.com/80/ff6b6b/ffffff?text=3" alt="Rank 3" />
          </div>
          <div class="username">iv*****s</div>
          <div class="amount">₱ 849,602.96</div>
        </div>
      </div>
    </div>

    <!-- 奖励领取记录 -->
    <div class="rewards-received-section">
      <h2 class="section-title-large">Who received the rewards</h2>
      <div class="rewards-list">
        <div class="rewards-scroll-container">
          <!-- 第一组数据 -->
          <div v-for="reward in rewardsReceived" :key="`first-${reward.id}`" class="reward-item">
            <span class="reward-username">{{ reward.username }}</span>
            <span class="reward-status">Received</span>
            <span class="reward-prize">{{ reward.prize }}</span>
          </div>
          <!-- 第二组数据（用于无缝循环） -->
          <div v-for="reward in rewardsReceived" :key="`second-${reward.id}`" class="reward-item">
            <span class="reward-username">{{ reward.username }}</span>
            <span class="reward-status">Received</span>
            <span class="reward-prize">{{ reward.prize }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 奖励发放统计 -->
    <div class="rewards-stats-section">
      <h2 class="section-title-large">Rewards Released to Date</h2>
      <div class="rewards-stats-list">
        <div class="stats-item">
          <div class="stats-icon">⭐</div>
          <div class="stats-info">
            <div class="stats-label">Invitation Rewards</div>
            <div class="stats-amount">₱ 84,079,611.00</div>
            <div class="stats-claimed">295287 claimed</div>
          </div>
        </div>
        <div class="stats-item">
          <div class="stats-icon">🏆</div>
          <div class="stats-info">
            <div class="stats-label">Achievement Rewards</div>
            <div class="stats-amount">₱ 37,669,410.00</div>
            <div class="stats-claimed">203976 claimed</div>
          </div>
        </div>
        <div class="stats-item">
          <div class="stats-icon">💰</div>
          <div class="stats-info">
            <div class="stats-label">Deposit Rebate</div>
            <div class="stats-amount">₱ 35,841,170.97</div>
            <div class="stats-claimed">616602 claimed</div>
          </div>
        </div>
        <div class="stats-item">
          <div class="stats-icon">🎰</div>
          <div class="stats-info">
            <div class="stats-label">Betting Rebate</div>
            <div class="stats-amount">₱ 139,043,989.62</div>
            <div class="stats-claimed">3840522 claimed</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 赚钱方式 -->
    <div class="make-money-section">
      <div class="make-money-card">
        <div class="make-money-icon">🤑</div>
        <div class="make-money-content">
          <h3>Ways to make money</h3>
          <div class="money-amount">₱ 888.00</div>
          <div class="money-label">Betting Rebate Rewards</div>
        </div>
      </div>
    </div>

    <!-- 奖金支付时间 -->
    <div class="bonus-payment-section">
      <h2 class="section-title-large">Bonus payment time</h2>
      <div class="social-platforms">
        <div class="platform-icon facebook">
          <van-icon name="facebook" size="32" color="#fff" />
        </div>
        <div class="platform-icon telegram">
          <van-icon name="chat-o" size="32" color="#fff" />
        </div>
        <div class="platform-icon whatsapp">
          <van-icon name="chat-o" size="32" color="#fff" />
        </div>
        <div class="platform-icon instagram">
          <van-icon name="photo-o" size="32" color="#fff" />
        </div>
        <div class="platform-icon tiktok">
          <van-icon name="video-o" size="32" color="#fff" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'

const router = useRouter()

// 统计数据
const todayIncome = ref('---')
const yesterdayIncome = ref('---')
const registers = ref('---')
const validReferral = ref('---')

// 邀请链接
const inviteLink = ref('http://www.jilievok.com/?r=')

// 奖励领取记录（所有记录都滚动）
const rewardsReceived = ref([
  { id: 1, username: 'je*********7', prize: 'Prize Wheel' },
  { id: 2, username: 'tj*********j', prize: '₱ 188.00' },
  { id: 3, username: 'lu***a', prize: '₱ 208.00' },
  { id: 4, username: 'ma***k', prize: '₱ 350.00' },
  { id: 5, username: 'lu***a', prize: '₱ 280.00' },
  { id: 6, username: 'ch*****0', prize: 'Prize Wheel' },
  { id: 7, username: 'iv*****s', prize: '₱ 420.00' },
  { id: 8, username: 'aw*****7', prize: 'Prize Wheel' },
])

// 滚动显示的奖励记录（从下往上滚动）
const scrollingRewards = ref([
  { id: 5, username: 'ch*****0', prize: 'Prize Wheel' },
  { id: 6, username: 'iv*****s', prize: '₱ 420.00' },
  { id: 7, username: 'aw*****7', prize: 'Prize Wheel' },
  { id: 8, username: 'lu***a', prize: '₱ 280.00' },
])

const goBack = () => {
  router.back()
}

const shareToSocial = (platform: string) => {
  showToast(`Share to ${platform}`)
}

const copyLink = () => {
  navigator.clipboard.writeText(inviteLink.value)
  showToast('Link copied!')
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.invite-page {
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

  // 统计卡片网格
  .stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    padding: 16px;

    .stat-card {
      padding: 20px 16px;
      border-radius: 12px;
      text-align: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);

      &.blue {
        background: #552583;
      }

      &.purple {
        background: #552583;
      }

      &.purple-alt {
        background: #552583;
      }

      &.blue-alt {
        background: #552583;
      }

      .stat-label {
        color: #fff;
        font-size: 13px;
        margin-bottom: 8px;
        opacity: 0.95;
      }

      .stat-value {
        color: #fdb927;
        font-size: 20px;
        font-weight: bold;
      }
    }
  }

  // 分享区域
  .share-section {
    margin: 0 16px 24px;
    padding: 20px;
    background: #1f1f1f;
    border-radius: 12px;

    .section-title {
      color: #fdb927;
      font-size: 18px;
      font-weight: bold;
      text-align: center;
      margin-bottom: 16px;
    }

    .share-label {
      color: #999;
      font-size: 13px;
      margin-bottom: 12px;
    }

    .social-icons {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
      flex-wrap: wrap;

      .social-icon {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: transform 0.2s;

        &:active {
          transform: scale(0.9);
        }

        &.facebook {
          background: #1877f2;
        }

        &.twitter {
          background: #000;
        }

        &.telegram {
          background: #0088cc;
        }

        &.whatsapp {
          background: #25d366;
        }

        &.wechat {
          background: #07c160;
        }

        &.line {
          background: #00b900;
        }

        &.share {
          background: #5b7cff;
        }
      }
    }

    .invite-link {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: #000;
      border: 1px solid #333;
      border-radius: 8px;

      .link-input {
        flex: 1;
        border: none;
        outline: none;
        font-size: 13px;
        color: #fff;
        background: transparent;
      }
    }
  }

  // 排行榜
  .leaderboard-section {
    margin: 0 16px 24px;

    .section-title-large {
      color: #fff;
      font-size: 22px;
      font-weight: bold;
      text-align: center;
      margin-bottom: 20px;
    }

    .leaderboard-podium {
      background: #552583;
      border-radius: 16px;
      padding: 24px 16px;
      display: flex;
      justify-content: center;
      align-items: flex-end;
      gap: 16px;

      .podium-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;

        .rank-badge {
          position: absolute;
          top: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 28px;
          height: 28px;
          background: #fff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 14px;
          color: #552583;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .avatar {
          margin-bottom: 8px;
          border-radius: 50%;
          overflow: hidden;
          border: 3px solid #fff;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }

        .username {
          color: #fff;
          font-size: 12px;
          margin-bottom: 4px;
        }

        .amount {
          color: #fdb927;
          font-size: 13px;
          font-weight: bold;
        }

        &.first {
          .avatar {
            width: 100px;
            height: 100px;
          }
        }

        &.second,
        &.third {
          .avatar {
            width: 80px;
            height: 80px;
          }
        }
      }
    }
  }

  // 奖励领取记录
  .rewards-received-section {
    margin: 0 16px 24px;

    .section-title-large {
      color: #fff;
      font-size: 20px;
      font-weight: bold;
      text-align: center;
      margin-bottom: 16px;
    }

    .rewards-list {
      background: #552583;
      border-radius: 16px;
      padding: 16px;
      height: 280px;
      overflow: hidden;
      position: relative;

      .rewards-scroll-container {
        animation: continuousScroll 20s linear infinite;
      }

      .reward-item {
        background: rgba(255, 255, 255, 0.95);
        border-radius: 24px;
        padding: 12px 20px;
        margin-bottom: 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .reward-username {
          color: #333;
          font-size: 14px;
          flex: 1;
        }

        .reward-status {
          color: #999;
          font-size: 13px;
          margin: 0 12px;
        }

        .reward-prize {
          color: #552583;
          font-size: 14px;
          font-weight: bold;
        }
      }
    }
  }

  @keyframes continuousScroll {
    0% {
      transform: translateY(0);
    }
    100% {
      transform: translateY(-50%);
    }
  }

  // 奖励发放统计
  .rewards-stats-section {
    margin: 0 16px 24px;

    .section-title-large {
      color: #fff;
      font-size: 20px;
      font-weight: bold;
      text-align: center;
      margin-bottom: 16px;
    }

    .rewards-stats-list {
      .stats-item {
        background: #1f1f1f;
        border-radius: 12px;
        padding: 16px;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        gap: 16px;

        .stats-icon {
          width: 60px;
          height: 60px;
          font-size: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .stats-info {
          flex: 1;

          .stats-label {
            color: #999;
            font-size: 14px;
            margin-bottom: 4px;
          }

          .stats-amount {
            color: #fdb927;
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 4px;
          }

          .stats-claimed {
            color: #999;
            font-size: 12px;
          }
        }
      }
    }
  }

  // 赚钱方式
  .make-money-section {
    margin: 0 16px 24px;

    .make-money-card {
      background: #552583;
      border-radius: 16px;
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 20px;

      .make-money-icon {
        width: 80px;
        height: 80px;
        font-size: 56px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .make-money-content {
        flex: 1;
        text-align: center;

        h3 {
          color: #fff;
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 12px;
        }

        .money-amount {
          color: #fdb927;
          font-size: 32px;
          font-weight: bold;
          margin-bottom: 8px;
        }

        .money-label {
          color: rgba(255, 255, 255, 0.9);
          font-size: 14px;
        }
      }
    }
  }

  // 奖金支付时间
  .bonus-payment-section {
    margin: 0 16px 24px;

    .section-title-large {
      color: #fff;
      font-size: 20px;
      font-weight: bold;
      text-align: center;
      margin-bottom: 16px;
    }

    .social-platforms {
      background: #1f1f1f;
      border-radius: 16px;
      padding: 24px;
      display: flex;
      justify-content: space-around;
      align-items: center;

      .platform-icon {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;

        &.facebook {
          background: #1877f2;
        }

        &.telegram {
          background: #0088cc;
        }

        &.whatsapp {
          background: #25d366;
        }

        &.instagram {
          background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888);
        }

        &.tiktok {
          background: #000;
        }
      }
    }
  }
}
</style>

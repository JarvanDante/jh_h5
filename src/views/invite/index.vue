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
      <div class="share-row">
        <div class="social-icons">
        <div class="social-icon facebook" @click="shareToSocial('facebook')">
          <img class="social-img" :src="socialIcons.facebook" alt="Facebook" />
        </div>
        <div class="social-icon twitter" @click="shareToSocial('twitter')">
          <img class="social-img" :src="socialIcons.twitter" alt="X" />
        </div>
        <div class="social-icon telegram" @click="shareToSocial('telegram')">
          <img class="social-img" :src="socialIcons.telegram" alt="Telegram" />
        </div>
        <div class="social-icon whatsapp" @click="shareToSocial('whatsapp')">
          <img class="social-img" :src="socialIcons.whatsapp" alt="WhatsApp" />
        </div>
        <div class="social-icon wechat" @click="shareToSocial('wechat')">
          <img class="social-img" :src="socialIcons.wechat" alt="WeChat" />
        </div>
        <div class="social-icon line" @click="shareToSocial('line')">
          <img class="social-img" :src="socialIcons.line" alt="LINE" />
        </div>
        <div class="social-icon share" @click="shareToSocial('more')">
          <img class="social-img" :src="socialIcons.share" alt="Share" />
        </div>
        </div>
      </div>
      <div class="invite-link">
        <div class="link-icon">
          <img class="link-img" :src="linkIcon" alt="Link" />
        </div>
        <input type="text" :value="inviteLink" readonly class="link-input" />
        <van-button size="small" color="#5b7cff" @click="copyLink">Copy</van-button>
      </div>
    </div>

    <!-- 排行榜 + 奖励领取记录（合并卡片） -->
    <div class="leaderboard-section">
      <div class="leaderboard-card">
        <h2 class="section-title-large">Leaderboard</h2>
        <div class="leaderboard-podium">
          <div class="podium-item second">
            <div class="rank-badge">2</div>
            <div class="avatar">
              <span class="avatar-label">2ND</span>
            </div>
            <div class="username">aw*****7</div>
            <div class="amount">₱ 916,093.27</div>
          </div>
          <div class="podium-item first">
            <div class="rank-badge">1</div>
            <div class="avatar">
              <span class="avatar-label">TOP</span>
            </div>
            <div class="username">ch*****0</div>
            <div class="amount">₱ 4,515,890.01</div>
          </div>
          <div class="podium-item third">
            <div class="rank-badge">3</div>
            <div class="avatar">
              <span class="avatar-label">3RD</span>
            </div>
            <div class="username">iv*****s</div>
            <div class="amount">₱ 849,602.96</div>
          </div>
        </div>

        <div class="card-divider"></div>

        <h3 class="section-title-sub">Who received the rewards</h3>
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

  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { userApi } from '@/api/modules/user'

const router = useRouter()

// 统计数据
const todayIncome = ref('0.00')
const yesterdayIncome = ref('0.00')
const registers = ref('0')
const validReferral = ref('0')

// 邀请链接
const inviteLink = ref('')

const socialIcons = {
  facebook: 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/facebook.svg',
  twitter: 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/x.svg',
  telegram: 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/telegram.svg',
  whatsapp: 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/whatsapp.svg',
  wechat: 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/wechat.svg',
  line: 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/line.svg',
  share: 'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6/svgs/solid/share-nodes.svg',
} as const

const linkIcon = 'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6/svgs/solid/link.svg'

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

const normalizeText = (value: unknown, fallback = '0') => {
  if (value === null || value === undefined || value === '') return fallback
  return String(value)
}

const buildInviteLink = (path: string) => {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return `${window.location.origin}${path}`
}

const loadInviteInfo = async () => {
  try {
    const data = await userApi.getInviteInfo()
    // 映射字段 - API 返回的字段名
    todayIncome.value = normalizeText(data.today_income, '0.00')
    yesterdayIncome.value = normalizeText(data.yesterday_income, '0.00')
    registers.value = normalizeText(data.registers ?? data.total_invites, '0')
    validReferral.value = normalizeText(data.valid_referral ?? data.today_invites, '0')
    inviteLink.value = buildInviteLink(data.invite_url)
  } catch (error: any) {
    showToast(error?.message || 'Failed to load invite info')
  }
}

const shareToSocial = (platform: string) => {
  if (!inviteLink.value) {
    showToast('Please wait, link is loading')
    return
  }

  const link = encodeURIComponent(inviteLink.value)
  const text = encodeURIComponent('Join me')

  const openUrl = (url: string) => {
    window.open(url, '_blank')
  }

  switch (platform) {
    case 'facebook':
      openUrl(`https://www.facebook.com/sharer/sharer.php?u=${link}`)
      break
    case 'twitter':
      openUrl(`https://twitter.com/intent/tweet?url=${link}`)
      break
    case 'telegram':
      openUrl(`https://t.me/share/url?url=${link}&text=${text}`)
      break
    case 'whatsapp':
      openUrl(`https://wa.me/?text=${text}%20${link}`)
      break
    case 'line':
      openUrl(`https://social-plugins.line.me/lineit/share?url=${link}`)
      break
    case 'wechat':
      copyLink()
      showToast('Link copied, open WeChat to share')
      break
    default:
      if (navigator.share) {
        navigator.share({ title: 'Invite', text: 'Join me', url: inviteLink.value })
        return
      }
      copyLink()
      break
  }
}

const copyLink = () => {
  navigator.clipboard.writeText(inviteLink.value)
  showToast('Link copied!')
}

onMounted(() => {
  loadInviteInfo()
})
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.invite-page {
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

  // 统计卡片网格
  .stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    padding: 16px;

    .stat-card {
      background: linear-gradient(135deg, #552583 0%, #7b3fa8 100%);
      padding: 20px 16px;
      border-radius: 16px;
      text-align: center;
      box-shadow: 0 4px 12px rgba(85, 37, 131, 0.4);
      transition: all 0.3s ease;

      &:active {
        transform: scale(0.98);
      }

      .stat-label {
        color: rgba(255, 255, 255, 0.9);
        font-size: 13px;
        margin-bottom: 8px;
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
    padding: 16px;
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 8px 20px rgba(12, 18, 66, 0.08);
    border: 1px solid #edf0ff;

    .section-title {
      color: #4b4b90;
      font-size: 18px;
      font-weight: 700;
      text-align: center;
      margin-bottom: 12px;
    }

    .share-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-bottom: 12px;
      flex-wrap: wrap;
    }

    .social-icons {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      justify-content: flex-start;

      .social-icon {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.18);

        &:active {
          transform: scale(0.94);
        }

        &.facebook {
          background: #1877f2;
        }

        &.twitter {
          background: #000;
        }

        &.telegram {
          background: #229ed9;
        }

        &.whatsapp {
          background: #25d366;
        }

        &.wechat {
          background: #09b83e;
        }

        &.line {
          background: #00b900;
        }

        &.share {
          background: #4f6cff;
        }

        .social-img {
          width: 18px;
          height: 18px;
          filter: brightness(0) invert(1);
        }
      }
    }

    .invite-link {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 10px;
      background: #f3f5ff;
      border: 1px solid #e2e6ff;
      border-radius: 12px;

      .link-input {
        flex: 1;
        min-width: 0;
        border: none;
        outline: none;
        font-size: 12px;
        color: #4b4b90;
        background: transparent;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
      }

      :deep(.van-button) {
        flex-shrink: 0;
        background: linear-gradient(135deg, #5b7cff 0%, #6a5cff 100%);
        border: none;
        border-radius: 10px;
        font-weight: 600;
        font-size: 12px;
        box-shadow: 0 4px 10px rgba(91, 124, 255, 0.3);
        padding: 0 10px;
        min-width: 50px;
        height: 28px;
      }

      :deep(.van-icon) {
        flex-shrink: 0;
        color: #6a6fb4;
      }
    }

    .link-icon {
      width: 26px;
      height: 26px;
      border-radius: 8px;
      background: #5b7cff;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid #4f6cff;
    }

    .link-img {
      width: 14px;
      height: 14px;
      filter: brightness(0) invert(1);
    }
  }

  // 排行榜 + 奖励领取记录
  .leaderboard-section {
    margin: 0 16px 24px;

    .leaderboard-card {
      background: linear-gradient(135deg, #552583 0%, #7b3fa8 100%);
      border-radius: 16px;
      padding: 20px 16px 16px;
      box-shadow: 0 6px 16px rgba(85, 37, 131, 0.35);
    }

    .section-title-large {
      color: #fff;
      font-size: 20px;
      font-weight: bold;
      text-align: center;
      margin-bottom: 16px;
    }

    .section-title-sub {
      color: #fdb927;
      font-size: 16px;
      font-weight: 700;
      text-align: center;
      margin: 8px 0 12px;
    }

    .card-divider {
      height: 1px;
      background: rgba(255, 255, 255, 0.18);
      margin: 8px 0 12px;
    }

    .leaderboard-podium {
      background: transparent;
      border-radius: 16px;
      padding: 10px 0 12px;
      display: flex;
      justify-content: center;
      align-items: flex-end;
      gap: 16px;
      box-shadow: none;

      .podium-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;

        .rank-badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #fdb927, #ff9800);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 16px;
          color: #fff;
          box-shadow: 0 2px 8px rgba(253, 185, 39, 0.6);
        }

        .avatar {
          margin-bottom: 8px;
          border-radius: 50%;
          overflow: hidden;
          border: 3px solid #fdb927;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          background:
            radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.35), transparent 45%),
            radial-gradient(circle at 70% 70%, rgba(255, 255, 255, 0.2), transparent 50%),
            rgba(255, 255, 255, 0.08);

          .avatar-label {
            color: #fff;
            font-size: 16px;
            font-weight: 800;
            letter-spacing: 1px;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.35);
          }
        }

        .username {
          color: #fff;
          font-size: 13px;
          margin-bottom: 4px;
        }

        .amount {
          color: #fdb927;
          font-size: 14px;
          font-weight: bold;
        }

        &.first {
          .avatar {
            width: 100px;
            height: 100px;

            .avatar-label {
              font-size: 20px;
              color: #fdb927;
            }
          }

          .rank-badge {
            width: 36px;
            height: 36px;
            font-size: 18px;
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

    .rewards-list {
      background: #ffffff;
      border-radius: 14px;
      padding: 12px;
      height: 240px;
      overflow: hidden;
      position: relative;
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.2);

      .rewards-scroll-container {
        animation: continuousScroll 20s linear infinite;
      }

      .reward-item {
        background: #f0edff;
        border: 1px solid rgba(91, 58, 164, 0.12);
        border-radius: 24px;
        padding: 12px 16px;
        margin-bottom: 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: 0 2px 8px rgba(36, 24, 76, 0.08);
        position: relative;

        .reward-username {
          color: #2f2f60;
          font-size: 13px;
          font-weight: 600;
          flex: 1;
        }

        .reward-status {
          color: #9aa0c5;
          font-size: 12px;
          margin: 0 12px;
        }

        .reward-prize {
          color: #5b3aa4;
          font-size: 13px;
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
      color: #333;
      font-size: 20px;
      font-weight: bold;
      text-align: center;
      margin-bottom: 16px;
    }

    .rewards-stats-list {
      .stats-item {
        background: #fff;
        border-radius: 16px;
        padding: 20px;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        gap: 16px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        transition: all 0.3s ease;

        &:active {
          transform: scale(0.98);
        }

        .stats-icon {
          width: 64px;
          height: 64px;
          font-size: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          background: linear-gradient(135deg, #f5f5f5, #e5e5e5);
          border-radius: 16px;
        }

        .stats-info {
          flex: 1;

          .stats-label {
            color: #666;
            font-size: 14px;
            margin-bottom: 6px;
            font-weight: 500;
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

}
</style>

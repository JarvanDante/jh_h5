<template>
  <div class="deposit-act">
    <!-- 顶部紫色渐变区域（header + hero 一体） -->
    <div class="top-zone">
      <div class="header">
        <div class="back-btn" @click="$router.back()">
          <van-icon name="arrow-left" size="20" color="#fff" />
        </div>
        <div class="title-area">
          <div class="title">💰 {{ t('activityDeposit.title') }} 💰</div>
          <div class="subtitle">{{ t('activityDeposit.subtitle') }}</div>
        </div>
      </div>

      <!-- 核心数据展示 -->
      <div class="hero-stats">
        <div class="stat-main">
          <div class="stat-badge">{{ t('activityDeposit.limitedTime') }}</div>
          <div class="stat-label">{{ t('activityDeposit.bonusUpTo') }}</div>
          <div class="stat-percent">+100%</div>
          <div class="stat-max">{{ t('activityDeposit.maxBonus') }}</div>
        </div>
        <div class="stat-row">
          <div class="stat-item">
            <div class="stat-num">{{ claimedCount }}</div>
            <div class="stat-desc">{{ t('activityDeposit.claimedToday') }}</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-num countdown">{{ countdown }}</div>
            <div class="stat-desc">{{ t('activityDeposit.endsIn') }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 浮起的档位卡片区域 -->
    <div class="tiers-wrapper">
      <div class="section-title">🎁 {{ t('activityDeposit.tiersTitle') }}</div>
      <div class="tier-scroll">
        <div v-for="(tier, i) in tiers" :key="i" class="tier-card" :class="{ best: tier.best }">
          <div v-if="tier.best" class="best-tag">⭐ {{ t('activityDeposit.best') }}</div>
          <div v-else-if="tier.hot" class="hot-tag">🔥 {{ t('activityDeposit.hot') }}</div>
          <div class="tier-top" :style="{ background: tier.gradient }">
            <div class="tier-percent-big">+{{ tier.percent }}%</div>
            <div class="tier-deposit-label">{{ t('activityDeposit.depositAmount', { amount: tier.deposit }) }}</div>
          </div>
          <div class="tier-bottom">
            <div class="tier-bonus-label">{{ t('activityDeposit.youGet') }}</div>
            <div class="tier-bonus-amount">₱{{ tier.bonus }}</div>
            <div class="tier-total">{{ t('activityDeposit.total', { amount: tier.total }) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- CTA 按钮 -->
    <div class="cta-area">
      <div class="cta-btn" @click="goDeposit">💎 {{ t('activityDeposit.depositNow') }}</div>
      <div class="cta-hint">{{ t('activityDeposit.bonusHint') }}</div>
    </div>

    <!-- 中奖滚动 -->
    <div class="winner-marquee">
      <div class="marquee-label">🏆 {{ t('activityDeposit.recentWinners') }}</div>
      <div class="marquee-viewport">
        <div class="marquee-vertical">
          <div v-for="(w, i) in [...depositWinners, ...depositWinners]" :key="i" class="winner-row">
            <span class="winner-name">{{ w.name }}</span>
            <span class="winner-text">{{ t('activityDeposit.depositedGot', { deposit: w.deposit }) }}</span>
            <span class="winner-amount">+₱{{ w.bonus }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 规则 -->
    <div class="rules-section">
      <div class="rules-title">📋 {{ t('activityDeposit.rules') }}</div>
      <div class="rules-list">
        <div class="rule-item">1. Bonus is credited instantly to your account</div>
        <div class="rule-item">2. Each tier can be claimed once per user</div>
        <div class="rule-item">3. Bonus requires 3x wagering before withdrawal</div>
        <div class="rule-item">4. This promotion cannot be combined with other offers</div>
        <div class="rule-item">
          5. Management reserves the right to modify or cancel this promotion
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { getDepositBonusRecentWinners } from '@/api/modules/balance'

const router = useRouter()
const { t } = useI18n()

const tiers = [
  {
    deposit: '100',
    bonus: '50',
    total: '150',
    percent: 50,
    hot: false,
    best: false,
    gradient: 'linear-gradient(135deg, #3a1a5c, #552583)',
  },
  {
    deposit: '500',
    bonus: '300',
    total: '800',
    percent: 60,
    hot: false,
    best: false,
    gradient: 'linear-gradient(135deg, #452070, #6b2fa0)',
  },
  {
    deposit: '1,000',
    bonus: '800',
    total: '1,800',
    percent: 80,
    hot: true,
    best: false,
    gradient: 'linear-gradient(135deg, #552583, #7b3fb8)',
  },
  {
    deposit: '3,000',
    bonus: '3,000',
    total: '6,000',
    percent: 100,
    hot: false,
    best: true,
    gradient: 'linear-gradient(135deg, #fdb927, #f4a020)',
  },
  {
    deposit: '5,000',
    bonus: '5,000',
    total: '10,000',
    percent: 100,
    hot: false,
    best: false,
    gradient: 'linear-gradient(135deg, #6b2fa0, #8b4fc0)',
  },
  {
    deposit: '10,000',
    bonus: '8,888',
    total: '18,888',
    percent: 88,
    hot: false,
    best: false,
    gradient: 'linear-gradient(135deg, #552583, #3a1a5c)',
  },
]

function maskName(name: string): string {
  const stars = '*'.repeat(3 + Math.floor(Math.random() * 3))
  return name.slice(0, 3) + stars + name.slice(-3)
}

interface DepositWinnerDisplay {
  name: string
  deposit: string
  bonus: string
}

const depositWinners = ref<DepositWinnerDisplay[]>([
  { name: maskName('Johnson'), deposit: '1,000', bonus: '800' },
  { name: maskName('Maria12'), deposit: '5,000', bonus: '5,000' },
  { name: maskName('Kingg56'), deposit: '3,000', bonus: '3,000' },
  { name: maskName('Alexxx4'), deposit: '500', bonus: '300' },
  { name: maskName('Ricard7'), deposit: '10,000', bonus: '8,888' },
  { name: maskName('Daniel1'), deposit: '1,000', bonus: '800' },
  { name: maskName('Mickel5'), deposit: '3,000', bonus: '3,000' },
  { name: maskName('Jasone9'), deposit: '500', bonus: '300' },
])

const claimedCount = ref(1283)
const countdown = ref('23:59:59')
let countdownTimer: ReturnType<typeof setInterval>

function startCountdown() {
  const now = new Date()
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  countdownTimer = setInterval(() => {
    const diff = endOfDay.getTime() - Date.now()
    if (diff <= 0) {
      countdown.value = '00:00:00'
      return
    }
    const h = String(Math.floor(diff / 3600000)).padStart(2, '0')
    const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0')
    const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0')
    countdown.value = `${h}:${m}:${s}`
  }, 1000)
}

onMounted(() => startCountdown())
onUnmounted(() => clearInterval(countdownTimer))

function formatAmount(value: number): string {
  const amount = Number(value || 0)
  if (Number.isInteger(amount)) {
    return amount.toLocaleString('en-US', { maximumFractionDigits: 0 })
  }
  return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function resolveWinnerName(maskNameValue: string, userId: number): string {
  const trimmed = (maskNameValue || '').trim()
  if (trimmed) {
    return trimmed
  }
  return `U***${String(userId || 0).slice(-3)}`
}

async function fetchDepositBonusWinners() {
  try {
    const res = await getDepositBonusRecentWinners({ limit: 20 })
    if (!res?.success || !Array.isArray(res.list) || res.list.length === 0) {
      return
    }
    depositWinners.value = res.list.map((item) => ({
      name: resolveWinnerName(item.mask_name, item.user_id),
      deposit: formatAmount(Number(item.deposit_amount || 0)),
      bonus: formatAmount(Number(item.bonus_amount || 0)),
    }))
  } catch {
    // 保持默认展示
  }
}

onMounted(() => {
  fetchDepositBonusWinners()
})

function goDeposit() {
  router.push('/deposit')
}
</script>

<style lang="scss" scoped>
.deposit-act {
  min-height: 100vh;
  background: linear-gradient(180deg, #1a0a2e 0%, #0d0520 50%, #1a0a2e 100%);
  padding-bottom: 80px;
}

// 顶部一体化紫色区域
.top-zone {
  position: relative;
  background: linear-gradient(180deg, #552583 0%, #3a1a5c 60%, transparent 100%);
  padding-bottom: 40px;
  border-radius: 0 0 28px 28px;
  overflow: hidden;

  .header {
    display: flex;
    align-items: center;
    padding: 16px;
    position: relative;
    z-index: 2;
    .back-btn {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.15);
    }
    .title-area {
      flex: 1;
      text-align: center;
      margin-right: 36px;
      .title {
        font-size: 20px;
        font-weight: 900;
        color: #fdb927;
        letter-spacing: 1px;
      }
      .subtitle {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.6);
        margin-top: 2px;
      }
    }
  }

  .hero-stats {
    position: relative;
    z-index: 2;
    text-align: center;
    padding: 0 20px;

    .stat-main {
      margin-bottom: 16px;
      .stat-badge {
        display: inline-block;
        background: linear-gradient(135deg, #ff4757, #ff6b81);
        color: #fff;
        font-size: 10px;
        font-weight: 900;
        padding: 3px 14px;
        border-radius: 20px;
        letter-spacing: 2px;
        margin-bottom: 8px;
        animation: badgePulse 2s ease-in-out infinite;
      }
      .stat-label {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.6);
        letter-spacing: 3px;
        font-weight: 600;
      }
      .stat-percent {
        font-size: 60px;
        font-weight: 900;
        color: #fdb927;
        text-shadow:
          0 0 40px rgba(253, 185, 39, 0.5),
          0 4px 8px rgba(0, 0, 0, 0.3);
        line-height: 1.1;
        margin: 4px 0;
      }
      .stat-max {
        font-size: 13px;
        color: rgba(255, 255, 255, 0.5);
      }
    }

    .stat-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 20px;
      background: rgba(0, 0, 0, 0.2);
      backdrop-filter: blur(8px);
      border-radius: 12px;
      padding: 12px 20px;
      border: 1px solid rgba(255, 255, 255, 0.08);

      .stat-divider {
        width: 1px;
        height: 28px;
        background: rgba(255, 255, 255, 0.15);
      }
      .stat-item {
        text-align: center;
      }
      .stat-num {
        font-size: 20px;
        font-weight: 900;
        color: #fff;
        &.countdown {
          color: #ff4757;
          font-family: monospace;
          letter-spacing: 2px;
        }
      }
      .stat-desc {
        font-size: 10px;
        color: rgba(255, 255, 255, 0.45);
        margin-top: 2px;
      }
    }
  }

  .particles {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    z-index: 1;
    .particle {
      position: absolute;
      font-size: 16px;
      opacity: 0;
      animation: floatUp 4.5s ease-in-out infinite;
    }
  }
}

@keyframes badgePulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}
@keyframes floatUp {
  0% {
    bottom: -20px;
    opacity: 0;
    transform: rotate(0deg);
  }
  25% {
    opacity: 0.5;
  }
  100% {
    bottom: 110%;
    opacity: 0;
    transform: rotate(360deg);
  }
}

// 档位卡片 - 横向滚动
.tiers-wrapper {
  margin-top: -20px;
  position: relative;
  z-index: 3;
  padding: 0 0 16px;

  .section-title {
    font-size: 14px;
    font-weight: 900;
    color: #fdb927;
    text-align: center;
    letter-spacing: 0.5px;
    margin: 0 16px 14px;
  }

  .tier-scroll {
    display: flex;
    gap: 12px;
    overflow-x: auto;
    padding: 0 16px 8px;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    &::-webkit-scrollbar {
      display: none;
    }
  }

  .tier-card {
    flex: 0 0 130px;
    border-radius: 14px;
    overflow: hidden;
    scroll-snap-align: start;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.03);
    position: relative;
    transition: all 0.2s;

    &.best {
      border-color: rgba(253, 185, 39, 0.5);
      box-shadow: 0 0 24px rgba(253, 185, 39, 0.2);
      flex: 0 0 140px;
    }

    .best-tag,
    .hot-tag {
      position: absolute;
      top: 6px;
      right: 6px;
      font-size: 8px;
      font-weight: 900;
      padding: 2px 8px;
      border-radius: 8px;
      z-index: 2;
    }
    .best-tag {
      background: linear-gradient(135deg, #fdb927, #f4a020);
      color: #1a0a2e;
    }
    .hot-tag {
      background: linear-gradient(135deg, #ff4757, #ff6b81);
      color: #fff;
    }

    .tier-top {
      padding: 16px 10px 12px;
      text-align: center;
      .tier-percent-big {
        font-size: 28px;
        font-weight: 900;
        color: #fff;
        text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        line-height: 1;
      }
      .tier-deposit-label {
        font-size: 10px;
        color: rgba(255, 255, 255, 0.7);
        margin-top: 4px;
      }
    }

    .tier-bottom {
      padding: 10px;
      text-align: center;
      background: rgba(0, 0, 0, 0.15);
      .tier-bonus-label {
        font-size: 9px;
        color: rgba(255, 255, 255, 0.4);
      }
      .tier-bonus-amount {
        font-size: 20px;
        font-weight: 900;
        color: #fdb927;
        margin: 2px 0;
      }
      .tier-total {
        font-size: 9px;
        color: rgba(255, 255, 255, 0.3);
      }
    }
  }
}

// CTA
.cta-area {
  margin: 0 16px 20px;
  .cta-btn {
    text-align: center;
    padding: 16px;
    border-radius: 14px;
    font-size: 16px;
    font-weight: 900;
    background: linear-gradient(135deg, #fdb927 0%, #f4a020 100%);
    color: #1a0a2e;
    letter-spacing: 0.5px;
    cursor: pointer;
    box-shadow: 0 4px 24px rgba(253, 185, 39, 0.4);
    animation: ctaGlow 2s ease-in-out infinite;
    &:active {
      transform: scale(0.97);
    }
  }
  .cta-hint {
    text-align: center;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.35);
    margin-top: 8px;
  }
}

@keyframes ctaGlow {
  0%,
  100% {
    box-shadow: 0 4px 24px rgba(253, 185, 39, 0.4);
  }
  50% {
    box-shadow: 0 4px 36px rgba(253, 185, 39, 0.7);
  }
}

// 中奖滚动
.winner-marquee {
  margin: 0 16px 16px;
  padding: 14px 16px;
  background: rgba(253, 185, 39, 0.06);
  border-radius: 12px;
  border: 1px solid rgba(253, 185, 39, 0.12);
  overflow: hidden;

  .marquee-label {
    font-size: 13px;
    color: #fdb927;
    font-weight: bold;
    margin-bottom: 12px;
    text-align: center;
    letter-spacing: 1px;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(253, 185, 39, 0.1);
  }
  .marquee-viewport {
    height: 120px;
    overflow: hidden;
  }
  .marquee-vertical {
    display: flex;
    flex-direction: column;
    align-items: center;
    animation: scrollUp 14s linear infinite;
    .winner-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 6px 0;
      font-size: 12px;
      white-space: nowrap;
      .winner-name {
        color: rgba(255, 255, 255, 0.7);
        font-weight: 600;
        width: 100px;
        text-align: left;
      }
      .winner-text {
        color: rgba(255, 255, 255, 0.4);
      }
      .winner-amount {
        color: #fdb927;
        font-weight: bold;
      }
    }
  }
}

@keyframes scrollUp {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-50%);
  }
}

// 规则
.rules-section {
  margin: 0 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  .rules-title {
    font-size: 14px;
    font-weight: bold;
    color: #fdb927;
    margin-bottom: 10px;
  }
  .rule-item {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.4);
    line-height: 2;
  }
}
</style>

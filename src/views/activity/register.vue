<template>
  <div class="register-act">
    <!-- 顶部一体化紫色区域 -->
    <div class="hero-section">
      <div class="hero-bg"></div>
      <div class="header">
        <div class="back-btn" @click="$router.back()">
          <van-icon name="arrow-left" size="20" color="#fff" />
        </div>
        <div class="title-area">
          <div class="title">🎁 REGISTER BONUS 🎁</div>
          <div class="subtitle">Sign up and get free money!</div>
        </div>
      </div>
      <div class="gift-float">
        <div class="gift-ring ring-1"></div>
        <div class="gift-ring ring-2"></div>
        <div class="gift-icon">🎁</div>
      </div>
      <div class="amount-card">
        <div class="amount-badge">NEW MEMBER BONUS</div>
        <div class="amount-row">
          <span class="amount-currency">₱</span>
          <span class="amount-num">{{ bonusAmount }}</span>
        </div>
        <div class="amount-desc">Register now and claim your welcome gift!</div>
        <div class="amount-tag">FREE — No Deposit Required</div>
      </div>
    </div>

    <!-- 3步领取 -->
    <div class="steps-section">
      <div class="section-title">✨ 3 Easy Steps</div>
      <div class="steps-list">
        <div v-for="(step, i) in steps" :key="i" class="step-card">
          <div class="step-num">{{ i + 1 }}</div>
          <div class="step-icon">{{ step.icon }}</div>
          <div class="step-title">{{ step.title }}</div>
          <div class="step-desc">{{ step.desc }}</div>
        </div>
      </div>
    </div>

    <!-- 已领取人数 -->
    <div class="social-proof">
      <div class="proof-icon">🔥</div>
      <div class="proof-text">
        <span class="proof-count">{{ claimedCount.toLocaleString() }}</span> players already claimed
      </div>
      <div class="proof-live"><span class="live-dot"></span> LIVE</div>
    </div>

    <!-- 注册按钮 -->
    <div class="cta-area">
      <div class="cta-btn" @click="goRegister">🚀 Register Now & Get ₱{{ bonusAmount }} FREE</div>
      <div class="cta-hint">Takes less than 30 seconds</div>
    </div>

    <!-- 中奖滚动 -->
    <div class="winner-marquee">
      <div class="marquee-label">🏆 New Members Who Claimed</div>
      <div class="marquee-viewport">
        <div class="marquee-vertical">
          <div v-for="(w, i) in [...regWinners, ...regWinners]" :key="i" class="winner-row">
            <span class="winner-name">{{ w.name }}</span>
            <span class="winner-text">claimed</span>
            <span class="winner-amount">₱{{ w.amount }}</span>
            <span class="winner-time">{{ w.time }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 奖励明细 -->
    <div class="bonus-detail">
      <div class="detail-title">🎯 Bonus Breakdown</div>
      <div class="detail-list">
        <div v-for="(item, i) in bonusItems" :key="i" class="detail-item">
          <span class="detail-icon">{{ item.icon }}</span>
          <span class="detail-label">{{ item.label }}</span>
          <span class="detail-value">₱{{ item.value }}</span>
        </div>
      </div>
    </div>

    <!-- 规则 -->
    <div class="rules-section">
      <div class="rules-title">📋 Rules</div>
      <div class="rules-list">
        <div class="rule-item">1. Each new user can claim the bonus once</div>
        <div class="rule-item">2. Bonus is credited instantly after registration</div>
        <div class="rule-item">3. Bonus requires 1x wagering before withdrawal</div>
        <div class="rule-item">4. Must complete phone verification to claim</div>
        <div class="rule-item">5. Management reserves the right to modify this promotion</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const bonusAmount = '188'

const confettiColors = ['#fdb927', '#ff4757', '#2ed573', '#1e90ff', '#ff6b81', '#ffa502']
const confettiIcons = ['🎉', '✨', '💰', '🪙', '🎊', '💎']

const steps = [
  { icon: '📱', title: 'Register', desc: 'Create your account in seconds' },
  { icon: '✅', title: 'Verify', desc: 'Verify your phone number' },
  { icon: '💰', title: 'Claim', desc: 'Get ₱188 bonus instantly' },
]

const bonusItems = [
  { icon: '🎁', label: 'Welcome Bonus', value: '88' },
  { icon: '🎰', label: 'Free Spin Tickets ×5', value: '50' },
  { icon: '💎', label: 'VIP Trial Bonus', value: '50' },
]

function maskName(name: string): string {
  const stars = '*'.repeat(3 + Math.floor(Math.random() * 3))
  return name.slice(0, 3) + stars + name.slice(-3)
}

const regWinners = ref([
  { name: maskName('Paulxx8'), amount: '188', time: '2min ago' },
  { name: maskName('Jamesz3'), amount: '188', time: '5min ago' },
  { name: maskName('Angelx1'), amount: '188', time: '8min ago' },
  { name: maskName('Markxx7'), amount: '188', time: '12min ago' },
  { name: maskName('Rosaxx4'), amount: '188', time: '15min ago' },
  { name: maskName('Kevinx9'), amount: '188', time: '18min ago' },
  { name: maskName('Graceq2'), amount: '188', time: '22min ago' },
  { name: maskName('Brianx6'), amount: '188', time: '25min ago' },
])

const claimedCount = ref(28463)

function goRegister() {
  router.push('/register')
}
</script>

<style lang="scss" scoped>
.register-act {
  min-height: 100vh;
  background: linear-gradient(180deg, #1a0a2e 0%, #0d0520 50%, #1a0a2e 100%);
  padding-bottom: 80px;
}

// 分层 hero 区域
.hero-section {
  position: relative;
  margin-bottom: 16px;
  padding-bottom: 30px;

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

  .hero-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 280px;
    background: linear-gradient(180deg, #552583 0%, #3a1a5c 60%, transparent 100%);
    border-radius: 0 0 28px 28px;
    border-radius: 0 0 32px 32px;
    z-index: 0;
  }

  .gift-float {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-top: 20px;
    margin-bottom: -10px;

    .gift-icon {
      font-size: 56px;
      position: relative;
      z-index: 3;
      animation: giftBounce 2.5s ease-in-out infinite;
      filter: drop-shadow(0 8px 16px rgba(253, 185, 39, 0.3));
    }
    .gift-ring {
      position: absolute;
      border-radius: 50%;
      border: 2px solid rgba(253, 185, 39, 0.15);
      &.ring-1 {
        width: 90px;
        height: 90px;
        animation: ringPulse 3s ease-in-out infinite;
      }
      &.ring-2 {
        width: 120px;
        height: 120px;
        animation: ringPulse 3s ease-in-out infinite 0.5s;
      }
    }
  }

  .amount-card {
    position: relative;
    z-index: 2;
    margin: 0 20px;
    padding: 20px;
    background: rgba(26, 10, 46, 0.85);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    border: 1px solid rgba(253, 185, 39, 0.25);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
    text-align: center;

    .amount-badge {
      font-size: 10px;
      color: rgba(255, 255, 255, 0.5);
      letter-spacing: 4px;
      font-weight: 700;
      margin-bottom: 4px;
    }
    .amount-row {
      display: flex;
      align-items: baseline;
      justify-content: center;
      gap: 4px;
      margin: 4px 0 10px;
      .amount-currency {
        font-size: 28px;
        font-weight: 900;
        color: #fdb927;
        opacity: 0.7;
      }
      .amount-num {
        font-size: 56px;
        font-weight: 900;
        color: #fdb927;
        line-height: 1;
        text-shadow:
          0 0 40px rgba(253, 185, 39, 0.5),
          0 4px 8px rgba(0, 0, 0, 0.4);
      }
    }
    .amount-desc {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.6);
      margin-bottom: 10px;
    }
    .amount-tag {
      display: inline-block;
      background: linear-gradient(135deg, #2ed573, #7bed9f);
      color: #1a0a2e;
      font-size: 11px;
      font-weight: 900;
      padding: 4px 16px;
      border-radius: 20px;
      letter-spacing: 1px;
    }
  }

  .confetti {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 200px;
    pointer-events: none;
    z-index: 1;
    overflow: hidden;
    .confetti-piece {
      position: absolute;
      font-size: 14px;
      opacity: 0;
      animation: confettiFall 5s ease-in-out infinite;
    }
  }
}

@keyframes giftBounce {
  0%,
  100% {
    transform: translateY(0) rotate(-3deg);
  }
  50% {
    transform: translateY(-12px) rotate(3deg);
  }
}
@keyframes ringPulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.15);
    opacity: 0.1;
  }
}
@keyframes confettiFall {
  0% {
    top: -10%;
    opacity: 0;
    transform: rotate(0deg) scale(0.5);
  }
  20% {
    opacity: 0.8;
  }
  100% {
    top: 110%;
    opacity: 0;
    transform: rotate(720deg) scale(1);
  }
}

.steps-section {
  margin: 0 16px 16px;
  .section-title {
    font-size: 15px;
    font-weight: 900;
    color: #fdb927;
    margin-bottom: 12px;
    text-align: center;
    letter-spacing: 1px;
  }
  .steps-list {
    display: flex;
    gap: 10px;
  }
  .step-card {
    flex: 1;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 14px;
    padding: 16px 8px;
    text-align: center;
    position: relative;

    .step-num {
      position: absolute;
      top: -10px;
      left: 50%;
      transform: translateX(-50%);
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: linear-gradient(135deg, #fdb927, #f4a020);
      color: #1a0a2e;
      font-size: 12px;
      font-weight: 900;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .step-icon {
      font-size: 28px;
      margin: 8px 0 6px;
    }
    .step-title {
      font-size: 13px;
      font-weight: 800;
      color: #fff;
      margin-bottom: 4px;
    }
    .step-desc {
      font-size: 10px;
      color: rgba(255, 255, 255, 0.4);
      line-height: 1.4;
    }
  }
}

.social-proof {
  margin: 0 16px 16px;
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(253, 185, 39, 0.1), rgba(85, 37, 131, 0.2));
  border: 1px solid rgba(253, 185, 39, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 10px;

  .proof-icon {
    font-size: 24px;
  }
  .proof-text {
    flex: 1;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.7);
    .proof-count {
      color: #fdb927;
      font-weight: 900;
      font-size: 16px;
    }
  }
  .proof-live {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 10px;
    font-weight: 900;
    color: #ff4757;
    letter-spacing: 1px;
    .live-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #ff4757;
      animation: livePulse 1.5s ease-in-out infinite;
    }
  }
}

@keyframes livePulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.4;
    transform: scale(0.8);
  }
}

.cta-area {
  margin: 0 16px 20px;
  .cta-btn {
    text-align: center;
    padding: 16px;
    border-radius: 14px;
    font-size: 15px;
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
      gap: 10px;
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
      .winner-time {
        color: rgba(255, 255, 255, 0.25);
        font-size: 10px;
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

.bonus-detail {
  margin: 0 16px 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.06);

  .detail-title {
    font-size: 14px;
    font-weight: bold;
    color: #fdb927;
    margin-bottom: 12px;
  }
  .detail-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .detail-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    background: rgba(85, 37, 131, 0.15);
    border-radius: 10px;
    border: 1px solid rgba(85, 37, 131, 0.25);

    .detail-icon {
      font-size: 20px;
    }
    .detail-label {
      flex: 1;
      font-size: 13px;
      color: rgba(255, 255, 255, 0.7);
    }
    .detail-value {
      font-size: 16px;
      font-weight: 900;
      color: #fdb927;
    }
  }
}

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

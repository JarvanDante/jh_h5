<template>
  <div class="lucky-page">
    <!-- 顶部背景装饰 -->
    <div class="top-decoration">
      <div class="coins coin-1">💰</div>
      <div class="coins coin-2">🪙</div>
      <div class="coins coin-3">💎</div>
      <div class="coins coin-4">💰</div>
      <div class="coins coin-5">🪙</div>
    </div>

    <!-- 标题区域 -->
    <div class="header">
      <div class="back-btn" @click="goBack">
        <van-icon name="arrow-left" size="20" color="#fff" />
      </div>
      <div class="title-area">
        <div class="title">🎰 LUCKY SPIN 🎰</div>
        <div class="subtitle">Spin to Win Big Prizes!</div>
      </div>
    </div>

    <!-- 奖池金额 -->
    <div class="jackpot-banner">
      <div class="jackpot-label">💎 JACKPOT PRIZE 💎</div>
      <div class="jackpot-amount">₱ {{ jackpotDisplay }}</div>
      <div class="jackpot-glow"></div>
    </div>

    <!-- 转盘区域 -->
    <div class="wheel-container">
      <!-- 外圈灯泡 -->
      <div class="wheel-lights">
        <div
          v-for="i in 20"
          :key="i"
          class="light-dot"
          :class="{ on: lightOn === (i % 2 === 0) }"
          :style="{ transform: `rotate(${i * 18}deg) translateY(-154px)` }"
        ></div>
      </div>

      <!-- 转盘主体 -->
      <div class="wheel-outer">
        <div class="wheel" :style="{ transform: `rotate(${wheelRotation}deg)` }">
          <div
            v-for="(prize, index) in prizes"
            :key="index"
            class="wheel-segment"
            :style="getSegmentStyle(index)"
          >
            <div class="segment-content" :style="getContentStyle(index)">
              <span class="prize-icon">{{ prize.icon }}</span>
              <span class="prize-text">{{ prize.label }}</span>
            </div>
          </div>
        </div>

        <!-- 中心按钮 -->
        <div class="wheel-center" :class="{ disabled: isSpinning }" @click="spin">
          <div class="center-inner">
            <span class="spin-text">{{ isSpinning ? '...' : 'SPIN' }}</span>
          </div>
        </div>

        <!-- 指针 -->
        <div class="wheel-pointer">▼</div>
      </div>
    </div>

    <!-- 剩余次数 -->
    <div class="spin-info">
      <div class="spin-count">
        <span class="label">Free Spins</span>
        <span class="value">{{ freeSpins }}</span>
      </div>
      <div class="divider"></div>
      <div class="spin-count">
        <span class="label">Total Won</span>
        <span class="value gold">₱{{ totalWon }}</span>
      </div>
    </div>

    <!-- 中奖记录滚动 -->
    <div class="winner-marquee">
      <div class="marquee-label">🏆 Recent Winners</div>
      <div class="marquee-track">
        <div class="marquee-content">
          <span v-for="(winner, i) in winners" :key="i" class="winner-item">
            {{ winner.name }} won <em>₱{{ winner.amount }}</em>
          </span>
        </div>
      </div>
    </div>

    <!-- 规则说明 -->
    <div class="rules-section">
      <div class="rules-title">📋 Activity Rules</div>
      <div class="rules-list">
        <div class="rule-item">1. Each deposit of ₱100+ earns 1 free spin</div>
        <div class="rule-item">2. Prizes are credited instantly to your account</div>
        <div class="rule-item">3. Maximum win per spin: ₱88,888</div>
        <div class="rule-item">4. No wagering requirement on prizes under ₱500</div>
      </div>
    </div>

    <!-- 中奖弹窗 -->
    <teleport to="body">
      <div v-if="showPrizeDialog" class="prize-overlay" @click="closePrizeDialog">
        <div class="prize-dialog" @click.stop>
          <div class="prize-fireworks">🎆🎇🎆</div>
          <div class="prize-congrats">🎉 Congratulations! 🎉</div>
          <div class="prize-won-label">You Won</div>
          <div class="prize-won-amount">{{ wonPrize?.icon }} {{ wonPrize?.label }}</div>
          <div class="prize-btn" @click="closePrizeDialog">Collect</div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.back()
}

// 奖品配置
const prizes = ref([
  { icon: '💰', label: '₱88,888', value: 88888 },
  { icon: '🎁', label: '₱50', value: 50 },
  { icon: '💎', label: '₱8,888', value: 8888 },
  { icon: '🪙', label: '₱20', value: 20 },
  { icon: '🏆', label: '₱1,888', value: 1888 },
  { icon: '🎁', label: '₱100', value: 100 },
  { icon: '💰', label: '₱5,888', value: 5888 },
  { icon: '🪙', label: '₱10', value: 10 },
])

// 状态
const isSpinning = ref(false)
const wheelRotation = ref(0)
const freeSpins = ref(3)
const totalWon = ref('0.00')
const showPrizeDialog = ref(false)
const wonPrize = ref<{ icon: string; label: string; value: number } | null>(null)
const lightOn = ref(true)

// 奖池显示
const jackpotDisplay = ref('1,288,563.00')

// 中奖记录
const winners = ref([
  { name: 'Joh***', amount: '8,888.00' },
  { name: 'Mar***', amount: '1,888.00' },
  { name: 'Kin***', amount: '5,888.00' },
  { name: 'Jas***', amount: '88,888.00' },
  { name: 'Ale***', amount: '100.00' },
  { name: 'Ric***', amount: '1,888.00' },
  { name: 'Dan***', amount: '50.00' },
  { name: 'Mic***', amount: '5,888.00' },
])

// 灯泡闪烁
let lightTimer: ReturnType<typeof setInterval>
onMounted(() => {
  lightTimer = setInterval(() => {
    lightOn.value = !lightOn.value
  }, 500)
})
onUnmounted(() => {
  clearInterval(lightTimer)
})

// 转盘样式
const segmentAngle = 360 / prizes.value.length
const colors = [
  '#552583',
  '#3a1a5c',
  '#6b2fa0',
  '#3a1a5c',
  '#552583',
  '#3a1a5c',
  '#6b2fa0',
  '#3a1a5c',
]

const getSegmentStyle = (index: number) => {
  const angle = segmentAngle * index
  return {
    transform: `rotate(${angle}deg)`,
    borderColor: `${colors[index % colors.length]} transparent`,
  }
}

const getContentStyle = (index: number) => {
  return {
    transform: `rotate(${segmentAngle / 2}deg)`,
  }
}

// 抽奖
const spin = () => {
  if (isSpinning.value || freeSpins.value <= 0) return

  isSpinning.value = true
  freeSpins.value--

  // 随机中奖
  const prizeIndex = Math.floor(Math.random() * prizes.value.length)
  const targetAngle = 360 - prizeIndex * segmentAngle - segmentAngle / 2
  const totalRotation = wheelRotation.value + 360 * 6 + targetAngle

  wheelRotation.value = totalRotation

  setTimeout(() => {
    isSpinning.value = false
    wonPrize.value = prizes.value[prizeIndex]
    showPrizeDialog.value = true
    const won = parseFloat(totalWon.value) + prizes.value[prizeIndex].value
    totalWon.value = won.toFixed(2)
  }, 4500)
}

const closePrizeDialog = () => {
  showPrizeDialog.value = false
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.lucky-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #1a0a2e 0%, #0d0520 40%, #1a0a2e 100%);
  padding-bottom: 80px;
  overflow: hidden;
  position: relative;
}

// 顶部飘落装饰
.top-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 300px;
  pointer-events: none;
  overflow: hidden;

  .coins {
    position: absolute;
    font-size: 24px;
    animation: floatDown 4s ease-in-out infinite;
    opacity: 0.6;
  }
  .coin-1 {
    left: 10%;
    top: -20px;
    animation-delay: 0s;
  }
  .coin-2 {
    left: 30%;
    top: -30px;
    animation-delay: 0.8s;
  }
  .coin-3 {
    left: 55%;
    top: -10px;
    animation-delay: 1.6s;
  }
  .coin-4 {
    left: 75%;
    top: -25px;
    animation-delay: 2.4s;
  }
  .coin-5 {
    left: 90%;
    top: -15px;
    animation-delay: 3.2s;
  }
}

@keyframes floatDown {
  0% {
    transform: translateY(-30px) rotate(0deg);
    opacity: 0;
  }
  20% {
    opacity: 0.7;
  }
  100% {
    transform: translateY(300px) rotate(360deg);
    opacity: 0;
  }
}

// 顶部
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
    background: rgba(255, 255, 255, 0.1);
  }

  .title-area {
    flex: 1;
    text-align: center;
    margin-right: 36px;

    .title {
      font-size: 22px;
      font-weight: 900;
      color: #fdb927;
      text-shadow: 0 0 20px rgba(253, 185, 39, 0.5);
      letter-spacing: 2px;
    }
    .subtitle {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.6);
      margin-top: 2px;
    }
  }
}

// 奖池
.jackpot-banner {
  text-align: center;
  margin: 8px 20px 20px;
  padding: 16px;
  background: linear-gradient(135deg, rgba(253, 185, 39, 0.15) 0%, rgba(85, 37, 131, 0.3) 100%);
  border: 1px solid rgba(253, 185, 39, 0.3);
  border-radius: 16px;
  position: relative;
  overflow: hidden;

  .jackpot-label {
    font-size: 12px;
    color: #fdb927;
    letter-spacing: 3px;
    font-weight: bold;
  }
  .jackpot-amount {
    font-size: 32px;
    font-weight: 900;
    color: #fdb927;
    text-shadow:
      0 0 30px rgba(253, 185, 39, 0.6),
      0 2px 4px rgba(0, 0, 0, 0.5);
    margin-top: 4px;
    animation: pulse 2s ease-in-out infinite;
  }
  .jackpot-glow {
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(ellipse, rgba(253, 185, 39, 0.08) 0%, transparent 70%);
    animation: glowRotate 6s linear infinite;
  }
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.03);
  }
}

@keyframes glowRotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

// 转盘容器
.wheel-container {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  margin: 0 auto;
  width: 320px;
  height: 320px;
}

// 灯泡
.wheel-lights {
  position: absolute;
  width: 320px;
  height: 320px;
  top: 0;
  left: 0;

  .light-dot {
    position: absolute;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #555;
    top: 50%;
    left: 50%;
    margin: -4px 0 0 -4px;
    transition: all 0.3s;

    &.on {
      background: #fdb927;
      box-shadow:
        0 0 8px #fdb927,
        0 0 16px rgba(253, 185, 39, 0.4);
    }
  }
}

// 转盘外圈
.wheel-outer {
  width: 290px;
  height: 290px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fdb927, #f4a020);
  padding: 6px;
  box-shadow:
    0 0 40px rgba(253, 185, 39, 0.3),
    0 0 80px rgba(85, 37, 131, 0.3),
    inset 0 0 20px rgba(0, 0, 0, 0.2);
  position: relative;
}

// 转盘
.wheel {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  position: relative;
  overflow: hidden;
  transition: transform 4.5s cubic-bezier(0.17, 0.67, 0.12, 0.99);
  background: #552583;

  .wheel-segment {
    position: absolute;
    width: 0;
    height: 0;
    top: 50%;
    left: 50%;
    border-style: solid;
    border-width: 139px 60px 0;
    margin-left: -60px;
    margin-top: -139px;
    transform-origin: 60px 139px;

    .segment-content {
      position: absolute;
      top: -130px;
      left: -30px;
      width: 60px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;

      .prize-icon {
        font-size: 20px;
      }
      .prize-text {
        font-size: 10px;
        font-weight: 800;
        color: #fdb927;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
        white-space: nowrap;
      }
    }
  }
}

// 中心按钮
.wheel-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fdb927 0%, #f4a020 100%);
  box-shadow:
    0 4px 15px rgba(0, 0, 0, 0.4),
    0 0 20px rgba(253, 185, 39, 0.4);
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:active:not(.disabled) {
    transform: translate(-50%, -50%) scale(0.95);
  }

  &.disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .center-inner {
    width: 58px;
    height: 58px;
    border-radius: 50%;
    background: linear-gradient(135deg, #552583 0%, #6b2fa0 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid rgba(253, 185, 39, 0.5);

    .spin-text {
      color: #fdb927;
      font-size: 16px;
      font-weight: 900;
      letter-spacing: 1px;
    }
  }
}

// 指针
.wheel-pointer {
  position: absolute;
  top: -2px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 28px;
  color: #fdb927;
  z-index: 11;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
}

// 抽奖信息
.spin-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  margin: 24px 20px 0;
  padding: 14px 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);

  .divider {
    width: 1px;
    height: 32px;
    background: rgba(255, 255, 255, 0.15);
  }

  .spin-count {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;

    .label {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.5);
    }
    .value {
      font-size: 22px;
      font-weight: 900;
      color: #fff;

      &.gold {
        color: #fdb927;
      }
    }
  }
}

// 中奖滚动
.winner-marquee {
  margin: 20px 20px 0;
  padding: 12px 16px;
  background: rgba(253, 185, 39, 0.08);
  border-radius: 12px;
  border: 1px solid rgba(253, 185, 39, 0.15);
  overflow: hidden;

  .marquee-label {
    font-size: 12px;
    color: #fdb927;
    font-weight: bold;
    margin-bottom: 8px;
  }

  .marquee-track {
    overflow: hidden;
  }

  .marquee-content {
    display: flex;
    gap: 24px;
    animation: marquee 20s linear infinite;
    white-space: nowrap;

    .winner-item {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.6);

      em {
        color: #fdb927;
        font-style: normal;
        font-weight: bold;
      }
    }
  }
}

@keyframes marquee {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}

// 规则
.rules-section {
  margin: 20px 20px 0;
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
    color: rgba(255, 255, 255, 0.45);
    line-height: 2;
  }
}

// 中奖弹窗
.prize-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.prize-dialog {
  text-align: center;
  padding: 40px 32px 32px;
  background: linear-gradient(180deg, #2a1050 0%, #1a0a2e 100%);
  border: 2px solid rgba(253, 185, 39, 0.4);
  border-radius: 20px;
  width: 300px;
  box-shadow: 0 0 60px rgba(253, 185, 39, 0.2);
  animation: dialogPop 0.4s ease;

  .prize-fireworks {
    font-size: 32px;
    margin-bottom: 8px;
  }
  .prize-congrats {
    font-size: 20px;
    font-weight: 900;
    color: #fdb927;
    margin-bottom: 16px;
  }
  .prize-won-label {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.5);
  }
  .prize-won-amount {
    font-size: 28px;
    font-weight: 900;
    color: #fff;
    margin: 8px 0 24px;
    text-shadow: 0 0 20px rgba(253, 185, 39, 0.4);
  }
  .prize-btn {
    background: linear-gradient(135deg, #fdb927 0%, #f4a020 100%);
    color: #1a0a2e;
    font-size: 16px;
    font-weight: 900;
    padding: 12px 0;
    border-radius: 12px;
    cursor: pointer;
    letter-spacing: 1px;

    &:active {
      transform: scale(0.97);
    }
  }
}

@keyframes dialogPop {
  from {
    transform: scale(0.7);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>

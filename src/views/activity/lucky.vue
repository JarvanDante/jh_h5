<template>
  <div class="lucky-page">
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
            <div class="segment-content" :style="getContentStyle()">
              <span class="prize-icon">{{ prize.icon }}</span>
              <span class="prize-text">{{ prize.label }}</span>
            </div>
          </div>
        </div>

        <!-- 中心按钮 -->
        <div
          class="wheel-center"
          :class="{ disabled: isSpinning || !activityActive || freeSpins <= 0 }"
          @click="spin"
        >
          <div class="center-inner">
            <span class="spin-text">{{
              isSpinning ? '...' : freeSpins <= 0 ? 'NO SPIN' : 'SPIN'
            }}</span>
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
    <div class="spin-meta">Today Spins: {{ todaySpinCount }}</div>

    <!-- 我的记录 -->
    <div class="my-records">
      <div class="records-title">🧾 My Recent Spins</div>
      <div v-if="recordList.length === 0" class="records-empty">No spin records yet</div>
      <div v-else class="records-list">
        <div v-for="item in recordList.slice(0, 5)" :key="item.trade_no" class="record-row">
          <span class="record-time">{{ item.created_at || '-' }}</span>
          <span class="record-prize">{{ item.prize_name || 'Segment #' + item.segment_no }}</span>
          <span class="record-amount">₱{{ formatMoney(item.reward_amount || 0) }}</span>
        </div>
      </div>
    </div>

    <!-- 中奖记录滚动（垂直从下往上） -->
    <div class="winner-marquee">
      <div class="marquee-label">🏆 Recent Winners</div>
      <div class="marquee-viewport">
        <div class="marquee-vertical">
          <div v-for="(winner, i) in [...winners, ...winners]" :key="i" class="winner-row">
            <span class="winner-name">{{ winner.name }}</span>
            <span class="winner-text">won</span>
            <span class="winner-amount">₱{{ winner.amount }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 规则说明 -->
    <div class="rules-section">
      <div class="rules-title">📋 Activity Rules</div>
      <div class="rules-list">
        <div class="rule-item">1. Register successfully to get 1 free spin</div>
        <div class="rule-item">2. Each successful deposit earns 1 free spin</div>
        <div class="rule-item">3. Each VIP level upgrade earns 1 free spin</div>
        <div class="rule-item">
          4. Spins = 1(Register) + Deposit Count + VIP Upgrade Count - Used Spins
        </div>
        <div class="rule-item">5. Prizes are credited instantly to your account</div>
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
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { showToast } from 'vant'
import { useRouter } from 'vue-router'
import {
  getLuckySpinInfo,
  getLuckySpinRecentWinners,
  getLuckySpinRecords,
  luckySpin,
  type LuckySpinPrizeItem,
  type LuckySpinRecordItem,
  type LuckySpinResponse,
} from '@/api/modules/balance'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

interface WheelDisplayPrize {
  segmentNo: number
  icon: string
  label: string
  prizeName: string
  rewardAmount: number
  weight: number
  userDailyWinLimit: number
  minVipLevel: number
}

interface WinnerDisplayItem {
  name: string
  amount: string
}

const goBack = () => {
  router.back()
}

const luckyWheelSegmentCount = 8
const segmentFallbackIcons = ['💰', '💵', '🎁', '💎', '💰', '🏆', '👑', '🚀']

function formatMoney(value: number): string {
  return Number(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function formatPrizeAmount(value: number): string {
  const amount = Number(value || 0)
  if (Number.isInteger(amount)) {
    return amount.toLocaleString('en-US', { maximumFractionDigits: 0 })
  }
  return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function buildDefaultPrizes(): WheelDisplayPrize[] {
  return Array.from({ length: luckyWheelSegmentCount }, (_, idx) => ({
    segmentNo: idx + 1,
    icon: segmentFallbackIcons[idx] || '🎁',
    label: 'Coming Soon',
    prizeName: '',
    rewardAmount: 0,
    weight: 0,
    userDailyWinLimit: 0,
    minVipLevel: 0,
  }))
}

function normalizePrizeItem(raw?: LuckySpinPrizeItem): WheelDisplayPrize {
  const segmentNo = Number(raw?.segment_no || 0)
  const rewardAmount = Number(raw?.reward_amount || 0)
  const prizeName = (raw?.prize_name || '').trim()
  const icon = (raw?.icon || '').trim() || (rewardAmount > 0 ? '💰' : '🙈')
  const label = prizeName || (rewardAmount > 0 ? `₱${formatPrizeAmount(rewardAmount)}` : 'Thanks')

  return {
    segmentNo,
    icon,
    label,
    prizeName,
    rewardAmount,
    weight: Number(raw?.weight || 0),
    userDailyWinLimit: Number(raw?.user_daily_win_limit || 0),
    minVipLevel: Number(raw?.min_vip_level || 0),
  }
}

function applyPrizeList(rawList: LuckySpinPrizeItem[]) {
  const bySegment = new Map<number, LuckySpinPrizeItem>()
  for (const item of rawList || []) {
    const segment = Number(item?.segment_no || 0)
    if (segment >= 1 && segment <= luckyWheelSegmentCount) {
      bySegment.set(segment, item)
    }
  }

  const merged: WheelDisplayPrize[] = []
  for (let segment = 1; segment <= luckyWheelSegmentCount; segment++) {
    const item = bySegment.get(segment) || {
      segment_no: segment,
      prize_name: '',
      reward_amount: 0,
      weight: 0,
      user_daily_win_limit: 0,
      min_vip_level: 0,
      icon: segmentFallbackIcons[segment - 1] || '🎁',
    }
    merged.push(normalizePrizeItem(item))
  }
  prizes.value = merged
}

// 状态
const activityActive = ref(false)
const isSpinning = ref(false)
const wheelRotation = ref(0)
const freeSpins = ref(0)
const freeSpinsPerDay = ref(0)
const todaySpinCount = ref(0)
const totalWonAmount = ref(0)
const showPrizeDialog = ref(false)
const wonPrize = ref<WheelDisplayPrize | null>(null)
const lightOn = ref(true)
const prizes = ref<WheelDisplayPrize[]>(buildDefaultPrizes())
const recordList = ref<LuckySpinRecordItem[]>([])
const totalWon = computed(() => formatMoney(totalWonAmount.value))

// 奖池显示
const jackpotAmount = ref(0)
const jackpotDisplay = computed(() => formatMoney(jackpotAmount.value))

// 中奖记录
const winners = ref<WinnerDisplayItem[]>([
  { name: 'U***123', amount: '88.00' },
  { name: 'U***456', amount: '20.00' },
  { name: 'U***789', amount: '10.00' },
])

function parseWinnerName(name: string, userId: number): string {
  const trimmed = (name || '').trim()
  if (trimmed) {
    return trimmed
  }
  return `U***${String(userId || 0).slice(-3)}`
}

function resolveMessage(payload: any, fallback: string): string {
  return payload?.message || payload?.msg || fallback
}

async function fetchLuckyInfo(showErrorToast = false) {
  try {
    const res = await getLuckySpinInfo()
    if (!res?.success) {
      activityActive.value = false
      freeSpins.value = 0
      freeSpinsPerDay.value = 0
      todaySpinCount.value = 0
      if (showErrorToast) {
        showToast(resolveMessage(res, 'Failed to load lucky spin info'))
      }
      return
    }

    activityActive.value = !!res.active
    freeSpinsPerDay.value = Number(res.free_spins_per_day || 0)
    freeSpins.value = Number(res.free_spins_left || 0)
    todaySpinCount.value = Number(res.today_spin_count || 0)
    jackpotAmount.value = Number(res.jackpot_amount || 0)
    totalWonAmount.value = Number(res.total_won || 0)
    applyPrizeList(res.prize_list || [])
  } catch (e: any) {
    if (showErrorToast) {
      showToast(e?.message || 'Failed to load lucky spin info')
    }
  }
}

async function fetchRecentWinners(showErrorToast = false) {
  try {
    const res = await getLuckySpinRecentWinners({ limit: 20 })
    if (!res?.success) {
      if (showErrorToast) {
        showToast(resolveMessage(res, 'Failed to load winner list'))
      }
      return
    }

    const list = (res.list || []).map((item) => ({
      name: parseWinnerName(item.mask_name, item.user_id),
      amount: formatMoney(Number(item.reward_amount || 0)),
    }))

    if (list.length > 0) {
      winners.value = list
    }
  } catch (e: any) {
    if (showErrorToast) {
      showToast(e?.message || 'Failed to load winner list')
    }
  }
}

async function fetchSpinRecords(showErrorToast = false) {
  try {
    const res = await getLuckySpinRecords({ page: 1, size: 20 })
    if (!res?.success) {
      if (showErrorToast) {
        showToast(resolveMessage(res, 'Failed to load spin records'))
      }
      return
    }
    recordList.value = res.list || []
  } catch (e: any) {
    if (showErrorToast) {
      showToast(e?.message || 'Failed to load spin records')
    }
  }
}

// 灯泡闪烁
let lightTimer: ReturnType<typeof setInterval>
onMounted(() => {
  lightTimer = setInterval(() => {
    lightOn.value = !lightOn.value
  }, 500)

  fetchLuckyInfo()
  fetchRecentWinners()
  fetchSpinRecords()
})
onUnmounted(() => {
  clearInterval(lightTimer)
})

// 转盘样式
const segmentAngle = computed(() =>
  prizes.value.length > 0 ? 360 / prizes.value.length : 360 / luckyWheelSegmentCount,
)
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
  const angle = segmentAngle.value * index
  return {
    transform: `rotate(${angle}deg)`,
    borderColor: `${colors[index % colors.length]} transparent`,
  }
}

const getContentStyle = () => {
  return {
    transform: `rotate(${segmentAngle.value / 2}deg)`,
  }
}

function findPrizeIndex(segmentNo: number): number {
  const index = prizes.value.findIndex((item) => item.segmentNo === segmentNo)
  return index >= 0 ? index : 0
}

// 抽奖
const spin = async () => {
  if (isSpinning.value) return
  if (!userStore.isLogin) {
    showToast('Please login first')
    return
  }
  if (!activityActive.value) {
    showToast('Activity is not available')
    return
  }
  if (freeSpins.value <= 0) {
    showToast('No free spins left today')
    return
  }

  isSpinning.value = true

  let result: LuckySpinResponse | null = null
  try {
    const res = await luckySpin()
    if (!res?.success) {
      isSpinning.value = false
      showToast(resolveMessage(res, 'Spin failed'))
      await fetchLuckyInfo(false)
      return
    }
    result = res
  } catch (e: any) {
    isSpinning.value = false
    showToast(e?.message || 'Spin failed')
    return
  }
  if (!result) {
    isSpinning.value = false
    showToast('Spin failed')
    return
  }

  const prizeIndex = findPrizeIndex(Number(result.segment_no || 0))

  // 安全边距：距离扇区边界至少 6 度，避免指针落在分界线上
  const safeMargin = 6
  const safeRange = Math.max(segmentAngle.value - safeMargin * 2, 0)
  const randomOffset = safeRange > 0 ? Math.random() * safeRange - safeRange / 2 : 0
  const targetAngle = 360 - prizeIndex * segmentAngle.value + randomOffset

  // 确保至少转 6 整圈 + 目标角度，且相对上次旋转是正向增量
  const baseRotation = wheelRotation.value - (wheelRotation.value % 360) + 360 * 6
  wheelRotation.value = baseRotation + targetAngle

  setTimeout(async () => {
    isSpinning.value = false
    freeSpins.value = Number(result.free_spins_left || 0)
    todaySpinCount.value = Number(result.today_spin_count || 0)
    totalWonAmount.value = Number(result.total_won || 0)

    const hitPrize = prizes.value[prizeIndex]
    wonPrize.value =
      hitPrize ||
      normalizePrizeItem({
        segment_no: result.segment_no,
        prize_name: result.prize_name,
        reward_amount: result.reward_amount,
        weight: 0,
        user_daily_win_limit: 0,
        min_vip_level: 0,
        icon: '',
      })
    showPrizeDialog.value = true

    await Promise.all([fetchRecentWinners(false), fetchSpinRecords(false)])
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
  transform: translateZ(0);
  backface-visibility: hidden;

  .wheel-segment {
    position: absolute;
    width: 0;
    height: 0;
    top: 50%;
    left: 50%;
    border-style: solid;
    // 8扇区时，每个扇区45deg，半角22.5deg。
    // base = height * tan(22.5deg) ≈ 139 * 0.4142 ≈ 57.6，取58可显著减少拼接缝。
    border-width: 139px 58px 0;
    margin-left: -58px;
    margin-top: -139px;
    transform-origin: 58px 139px;
    backface-visibility: hidden;

    .segment-content {
      position: absolute;
      top: -130px;
      left: -29px;
      width: 58px;
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
    opacity: 0.85;
    cursor: not-allowed;
    background: linear-gradient(135deg, #888 0%, #666 100%);
    box-shadow:
      0 4px 15px rgba(0, 0, 0, 0.3),
      0 0 10px rgba(100, 100, 100, 0.2);

    .center-inner {
      background: linear-gradient(135deg, #3a3a3a 0%, #555 100%);
      border-color: rgba(255, 255, 255, 0.15);

      .spin-text {
        color: rgba(255, 255, 255, 0.6);
        font-size: 11px;
        letter-spacing: 0.5px;
      }
    }
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

.spin-meta {
  text-align: center;
  margin-top: 8px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}

// 我的记录
.my-records {
  margin: 14px 20px 0;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);

  .records-title {
    font-size: 13px;
    color: #fdb927;
    font-weight: 700;
    margin-bottom: 10px;
  }

  .records-empty {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.45);
    text-align: center;
    padding: 8px 0;
  }

  .records-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .record-row {
    display: flex;
    align-items: center;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.65);
    gap: 8px;

    .record-time {
      flex: 1;
      min-width: 120px;
      color: rgba(255, 255, 255, 0.4);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .record-prize {
      flex: 1;
      color: rgba(255, 255, 255, 0.8);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .record-amount {
      color: #fdb927;
      font-weight: 700;
      min-width: 70px;
      text-align: right;
    }
  }
}

// 中奖滚动（垂直）
.winner-marquee {
  margin: 20px 20px 0;
  padding: 12px 16px 16px;
  background: rgba(253, 185, 39, 0.08);
  border-radius: 12px;
  border: 1px solid rgba(253, 185, 39, 0.15);
  overflow: hidden;

  .marquee-label {
    font-size: 14px;
    color: #fdb927;
    font-weight: bold;
    margin-bottom: 14px;
    text-align: center;
    letter-spacing: 2px;
    padding: 4px 0;
    border-bottom: 1px solid rgba(253, 185, 39, 0.12);
  }

  .marquee-viewport {
    height: 120px;
    overflow: hidden;
    position: relative;
  }

  .marquee-vertical {
    display: flex;
    flex-direction: column;
    align-items: center;
    animation: scrollUp 12s linear infinite;

    .winner-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 20px;
      padding: 6px 0;
      font-size: 13px;
      white-space: nowrap;
      width: 260px;

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
        width: 100px;
        text-align: right;
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

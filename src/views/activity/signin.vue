<template>
  <div class="signin-page">
    <!-- 顶部 -->
    <div class="header">
      <div class="back-btn" @click="$router.back()">
        <van-icon name="arrow-left" size="20" color="#fff" />
      </div>
      <div class="title-area">
        <div class="title">📅 DAILY CHECK-IN</div>
        <div class="subtitle">Sign in every day, earn rewards!</div>
      </div>
    </div>

    <!-- 连续签到奖励条 -->
    <div class="streak-bar">
      <div class="streak-label">
        🔥 Consecutive Days: <em>{{ streakDays }}</em>
      </div>
      <div class="streak-progress">
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: (streakDays / 7) * 100 + '%' }"></div>
        </div>
        <div class="milestones">
          <div
            v-for="m in milestones"
            :key="m.day"
            class="milestone"
            :class="{ reached: streakDays >= m.day }"
            :style="{ left: (m.day / 7) * 100 + '%' }"
          >
            <div class="ms-icon">{{ streakDays >= m.day ? '🎁' : '🔒' }}</div>
            <div class="ms-day">{{ m.day }}d</div>
            <div class="ms-reward">₱{{ m.reward }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 本月累计 -->
    <div class="monthly-summary">
      <div class="summary-item">
        <div class="s-value gold">{{ signedDays }}</div>
        <div class="s-label">Signed Days</div>
      </div>
      <div class="summary-divider"></div>
      <div class="summary-item">
        <div class="s-value gold">₱{{ totalEarned }}</div>
        <div class="s-label">Total Earned</div>
      </div>
      <div class="summary-divider"></div>
      <div class="summary-item">
        <div class="s-value">{{ daysLeft }}</div>
        <div class="s-label">Days Left</div>
      </div>
    </div>

    <!-- 日历区域 -->
    <div class="calendar-section">
      <div class="calendar-header">
        <div class="month-title">{{ monthName }} {{ year }}</div>
      </div>

      <!-- 星期标题 -->
      <div class="weekday-row">
        <div v-for="w in weekdays" :key="w" class="weekday-cell">{{ w }}</div>
      </div>

      <!-- 日期格子 -->
      <div class="date-grid">
        <!-- 空白占位 -->
        <div v-for="i in firstDayOffset" :key="'e' + i" class="date-cell empty"></div>
        <!-- 日期 -->
        <div
          v-for="day in totalDaysInMonth"
          :key="day"
          class="date-cell"
          :class="{
            signed: isSignedDay(day),
            today: isToday(day),
            future: isFuture(day),
            'can-sign': canSign(day),
          }"
          @click="handleSign(day)"
        >
          <div class="cell-inner">
            <span class="day-num">{{ day }}</span>
            <span v-if="isSignedDay(day)" class="signed-icon">✅</span>
            <span v-else-if="canSign(day)" class="reward-tag">₱{{ getDayReward(day) }}</span>
            <span v-else-if="!isFuture(day)" class="missed-icon">—</span>
            <span v-else class="reward-tag dim">₱{{ getDayReward(day) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 签到按钮 -->
    <div class="sign-btn-area">
      <div class="sign-btn" :class="{ disabled: todaySigned }" @click="handleSignToday">
        {{ todaySigned ? '✅ Signed Today' : '🎁 Sign In Now — Earn ₱' + todayReward }}
      </div>
    </div>

    <!-- 奖励说明 -->
    <div class="reward-table">
      <div class="table-title">💰 Daily Rewards</div>
      <div class="table-grid">
        <div v-for="(r, i) in rewardTiers" :key="i" class="tier-item">
          <div class="tier-day">Day {{ r.day }}</div>
          <div class="tier-amount">₱{{ r.amount }}</div>
        </div>
      </div>
    </div>

    <!-- 规则 -->
    <div class="rules-section">
      <div class="rules-title">📋 Rules</div>
      <div class="rules-list">
        <div class="rule-item">1. Sign in daily to receive bonus rewards</div>
        <div class="rule-item">2. Consecutive sign-ins unlock milestone bonuses</div>
        <div class="rule-item">3. Missing a day resets your streak counter</div>
        <div class="rule-item">4. Rewards are credited instantly to your balance</div>
        <div class="rule-item">5. Monthly sign-in resets on the 1st of each month</div>
      </div>
    </div>

    <!-- 签到成功弹窗 -->
    <teleport to="body">
      <div v-if="showSignDialog" class="sign-overlay" @click="showSignDialog = false">
        <div class="sign-dialog" @click.stop>
          <div class="dialog-icon">🎉</div>
          <div class="dialog-title">Check-in Successful!</div>
          <div class="dialog-reward">+ ₱{{ lastReward }}</div>
          <div class="dialog-streak">🔥 {{ streakDays }} day streak</div>
          <div class="dialog-btn" @click="showSignDialog = false">OK</div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const now = new Date()
const year = now.getFullYear()
const month = now.getMonth() // 0-indexed
const today = now.getDate()

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]
const monthName = monthNames[month]

// 本月天数
const totalDaysInMonth = new Date(year, month + 1, 0).getDate()
// 本月第一天是星期几
const firstDayOffset = new Date(year, month, 1).getDay()
// 剩余天数
const daysLeft = totalDaysInMonth - today

// 签到数据（模拟）
const signedDaysSet = ref(new Set<number>())
// 模拟已签到的天（今天之前随机几天）
for (let d = 1; d < today; d++) {
  if (Math.random() > 0.2) signedDaysSet.value.add(d)
}

const streakDays = ref(3)
const totalEarned = ref('156.00')
const showSignDialog = ref(false)
const lastReward = ref('0')

const signedDays = computed(() => signedDaysSet.value.size)
const todaySigned = computed(() => signedDaysSet.value.has(today))
const todayReward = computed(() => getDayReward(today))

// 连续签到里程碑
const milestones = [
  { day: 3, reward: '28' },
  { day: 5, reward: '58' },
  { day: 7, reward: '188' },
]

// 每日奖励梯度
const rewardTiers = [
  { day: '1', amount: '5' },
  { day: '2', amount: '8' },
  { day: '3', amount: '12' },
  { day: '4', amount: '15' },
  { day: '5', amount: '20' },
  { day: '6', amount: '28' },
  { day: '7+', amount: '38' },
]

function getDayReward(day: number): string {
  const dayOfWeek = new Date(year, month, day).getDay()
  // 周末奖励翻倍
  const base = [5, 8, 12, 15, 20, 28, 38]
  const idx = Math.min((day - 1) % 7, 6)
  const amount = base[idx]
  return dayOfWeek === 0 || dayOfWeek === 6 ? String(amount * 2) : String(amount)
}

function isSignedDay(day: number) {
  return signedDaysSet.value.has(day)
}
function isToday(day: number) {
  return day === today
}
function isFuture(day: number) {
  return day > today
}
function canSign(day: number) {
  return day === today && !todaySigned.value
}

function handleSign(day: number) {
  if (canSign(day)) handleSignToday()
}

function handleSignToday() {
  if (todaySigned.value) return
  signedDaysSet.value.add(today)
  streakDays.value++
  lastReward.value = todayReward.value
  const earned = parseFloat(totalEarned.value) + parseFloat(todayReward.value)
  totalEarned.value = earned.toFixed(2)
  showSignDialog.value = true
}
</script>

<style lang="scss" scoped>
.signin-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #1a0a2e 0%, #0d0520 50%, #1a0a2e 100%);
  padding-bottom: 80px;
}

.header {
  display: flex;
  align-items: center;
  padding: 16px;

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
      font-size: 20px;
      font-weight: 900;
      color: #fdb927;
      text-shadow: 0 0 20px rgba(253, 185, 39, 0.4);
      letter-spacing: 1px;
    }
    .subtitle {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.5);
      margin-top: 2px;
    }
  }
}

// 连续签到
.streak-bar {
  margin: 0 16px 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 14px;
  border: 1px solid rgba(253, 185, 39, 0.15);

  .streak-label {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 16px;
    em {
      color: #fdb927;
      font-style: normal;
      font-weight: 900;
      font-size: 18px;
    }
  }

  .streak-progress {
    position: relative;
    padding-bottom: 36px;
  }

  .progress-track {
    height: 6px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 3px;
    overflow: hidden;
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #552583, #fdb927);
      border-radius: 3px;
      transition: width 0.5s ease;
    }
  }

  .milestones {
    position: relative;
    height: 36px;
  }

  .milestone {
    position: absolute;
    top: 6px;
    transform: translateX(-50%);
    text-align: center;
    .ms-icon {
      font-size: 18px;
    }
    .ms-day {
      font-size: 10px;
      color: rgba(255, 255, 255, 0.4);
    }
    .ms-reward {
      font-size: 10px;
      color: #fdb927;
      font-weight: bold;
    }
    &.reached {
      .ms-day {
        color: #fdb927;
      }
    }
  }
}

// 月度统计
.monthly-summary {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 16px 16px;
  padding: 16px;
  background: linear-gradient(135deg, rgba(85, 37, 131, 0.3), rgba(253, 185, 39, 0.08));
  border-radius: 14px;
  border: 1px solid rgba(253, 185, 39, 0.15);

  .summary-divider {
    width: 1px;
    height: 36px;
    background: rgba(255, 255, 255, 0.1);
    margin: 0 20px;
  }

  .summary-item {
    text-align: center;
    .s-value {
      font-size: 22px;
      font-weight: 900;
      color: #fff;
      &.gold {
        color: #fdb927;
      }
    }
    .s-label {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.45);
      margin-top: 2px;
    }
  }
}

// 日历
.calendar-section {
  margin: 0 16px 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.06);

  .calendar-header {
    text-align: center;
    margin-bottom: 12px;
    .month-title {
      font-size: 16px;
      font-weight: 800;
      color: #fff;
    }
  }
}

.weekday-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 6px;
  .weekday-cell {
    text-align: center;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.35);
    font-weight: 600;
    padding: 4px 0;
  }
}

.date-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;

  .date-cell {
    aspect-ratio: 1;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.03);
    transition: all 0.2s;
    cursor: default;

    &.empty {
      background: transparent;
    }

    &.signed {
      background: linear-gradient(135deg, rgba(85, 37, 131, 0.5), rgba(85, 37, 131, 0.3));
      border: 1px solid rgba(85, 37, 131, 0.5);
    }

    &.today {
      border: 1.5px solid #fdb927;
      box-shadow: 0 0 12px rgba(253, 185, 39, 0.2);
    }

    &.can-sign {
      background: linear-gradient(135deg, rgba(253, 185, 39, 0.15), rgba(253, 185, 39, 0.05));
      border: 1.5px solid #fdb927;
      cursor: pointer;
      animation: todayPulse 2s ease-in-out infinite;
    }

    &.future {
      opacity: 0.4;
    }

    .cell-inner {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1px;
      .day-num {
        font-size: 12px;
        font-weight: 700;
        color: #fff;
      }
      .signed-icon {
        font-size: 10px;
      }
      .reward-tag {
        font-size: 8px;
        color: #fdb927;
        font-weight: 700;
        &.dim {
          opacity: 0.5;
        }
      }
      .missed-icon {
        font-size: 10px;
        color: rgba(255, 255, 255, 0.15);
      }
    }
  }
}

@keyframes todayPulse {
  0%,
  100% {
    box-shadow: 0 0 12px rgba(253, 185, 39, 0.2);
  }
  50% {
    box-shadow: 0 0 20px rgba(253, 185, 39, 0.4);
  }
}

// 签到按钮
.sign-btn-area {
  margin: 0 16px 16px;

  .sign-btn {
    text-align: center;
    padding: 14px;
    border-radius: 14px;
    font-size: 15px;
    font-weight: 900;
    background: linear-gradient(135deg, #fdb927 0%, #f4a020 100%);
    color: #1a0a2e;
    letter-spacing: 0.5px;
    cursor: pointer;
    box-shadow: 0 4px 20px rgba(253, 185, 39, 0.3);
    transition: all 0.2s;

    &:active:not(.disabled) {
      transform: scale(0.98);
    }
    &.disabled {
      background: rgba(255, 255, 255, 0.08);
      color: rgba(255, 255, 255, 0.4);
      box-shadow: none;
      cursor: default;
    }
  }
}

// 奖励表
.reward-table {
  margin: 0 16px 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.06);

  .table-title {
    font-size: 14px;
    font-weight: bold;
    color: #fdb927;
    margin-bottom: 12px;
  }

  .table-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    .tier-item {
      text-align: center;
      padding: 10px 4px;
      background: rgba(85, 37, 131, 0.2);
      border-radius: 10px;
      border: 1px solid rgba(85, 37, 131, 0.3);
      .tier-day {
        font-size: 10px;
        color: rgba(255, 255, 255, 0.5);
      }
      .tier-amount {
        font-size: 14px;
        font-weight: 900;
        color: #fdb927;
        margin-top: 2px;
      }
    }
  }
}

// 规则
.rules-section {
  margin: 0 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 14px;
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

// 签到弹窗
.sign-overlay {
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

.sign-dialog {
  text-align: center;
  padding: 36px 32px 28px;
  width: 280px;
  background: linear-gradient(180deg, #2a1050 0%, #1a0a2e 100%);
  border: 2px solid rgba(253, 185, 39, 0.4);
  border-radius: 20px;
  box-shadow: 0 0 60px rgba(253, 185, 39, 0.15);
  animation: dialogPop 0.35s ease;

  .dialog-icon {
    font-size: 48px;
    margin-bottom: 8px;
  }
  .dialog-title {
    font-size: 18px;
    font-weight: 900;
    color: #fff;
    margin-bottom: 12px;
  }
  .dialog-reward {
    font-size: 32px;
    font-weight: 900;
    color: #fdb927;
    text-shadow: 0 0 20px rgba(253, 185, 39, 0.5);
    margin-bottom: 8px;
  }
  .dialog-streak {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.5);
    margin-bottom: 20px;
  }
  .dialog-btn {
    background: linear-gradient(135deg, #fdb927, #f4a020);
    color: #1a0a2e;
    font-size: 15px;
    font-weight: 900;
    padding: 12px;
    border-radius: 12px;
    cursor: pointer;
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

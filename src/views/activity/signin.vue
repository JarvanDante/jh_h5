<template>
  <div class="signin-page">
    <!-- 顶部 -->
    <div class="header">
      <div class="back-btn" @click="$router.back()">
        <van-icon name="arrow-left" size="20" color="#fff" />
      </div>
      <div class="title-area">
        <div class="title">📅 {{ t('activitySignin.title') }}</div>
        <div class="subtitle">{{ t('activitySignin.subtitle') }}</div>
      </div>
    </div>

    <!-- 签到天数进度 -->
    <div class="streak-bar">
      <div class="streak-label">
        🔥 {{ t('activitySignin.signedDays', { n: signedDays }) }}
      </div>
      <div class="streak-progress">
        <div class="progress-track">
          <div
            class="progress-fill"
            :style="{ width: Math.min((signedDays / totalDaysInMonth) * 100, 100) + '%' }"
          ></div>
        </div>
      </div>
    </div>

    <!-- 本月累计 -->
    <div class="monthly-summary">
      <div class="summary-item">
        <div class="s-value gold">{{ signedDays }}</div>
        <div class="s-label">{{ t('activitySignin.signedDaysLabel') }}</div>
      </div>
      <div class="summary-divider"></div>
      <div class="summary-item">
        <div class="s-value gold">₱{{ totalEarned }}</div>
        <div class="s-label">{{ t('activitySignin.totalEarned') }}</div>
      </div>
      <div class="summary-divider"></div>
      <div class="summary-item">
        <div class="s-value">{{ daysLeft }}</div>
        <div class="s-label">{{ t('activitySignin.daysLeft') }}</div>
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
      <div
        class="sign-btn"
        :class="{ disabled: !active || todaySigned || isSubmitting }"
        @click="handleSignToday"
      >
        {{ signBtnText }}
      </div>
    </div>

    <!-- 奖励说明 -->
    <div class="reward-table">
      <div class="table-title">💰 {{ t('activitySignin.dailyRewards') }}</div>
      <div class="table-grid">
        <div v-for="(r, i) in rewardTiers" :key="i" class="tier-item">
          <div class="tier-day">{{ t('activitySignin.day', { n: r.day }) }}</div>
          <div class="tier-amount">₱{{ r.amount }}</div>
        </div>
      </div>
    </div>

    <!-- 规则 -->
    <div class="rules-section">
      <div class="rules-title">📋 {{ t('activitySignin.rules') }}</div>
      <div class="rules-list">
        <div class="rule-item">1. {{ t('activitySignin.rule1') }}</div>
        <div class="rule-item">2. {{ t('activitySignin.rule2') }}</div>
        <div class="rule-item">3. {{ t('activitySignin.rule3') }}</div>
        <div class="rule-item">4. {{ t('activitySignin.rule4') }}</div>
        <div class="rule-item">5. {{ t('activitySignin.rule5') }}</div>
      </div>
    </div>

    <!-- 签到成功弹窗 -->
    <teleport to="body">
      <div v-if="showSignDialog" class="sign-overlay" @click="showSignDialog = false">
        <div class="sign-dialog" @click.stop>
          <div class="dialog-icon">🎉</div>
          <div class="dialog-title">{{ t('activitySignin.checkInSuccess') }}</div>
          <div class="dialog-reward">+ ₱{{ lastReward }}</div>
          <div class="dialog-streak">🔥 {{ t('activitySignin.dayStreak', { n: streakDays }) }}</div>
          <div class="dialog-btn" @click="showSignDialog = false">{{ t('common.ok') }}</div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { showToast } from 'vant'
import { claimSigninReward, getSigninActivityInfo, type SigninDayInfo } from '@/api/modules/balance'

const { t, tm } = useI18n()

const weekdays = computed(() => tm('activitySignin.weekdays') as string[])
const monthNames = computed(() => tm('activitySignin.months') as string[])

const now = new Date()
const year = ref(now.getFullYear())
const month = ref(now.getMonth() + 1)
const today = ref(now.getDate())
const active = ref(false)

const signedDaysSet = ref(new Set<number>())
const dayRewardMap = ref<Record<number, number>>({})

const signedDays = ref(0)
const totalEarned = ref('0.00')
const showSignDialog = ref(false)
const lastReward = ref('0.00')
const isSubmitting = ref(false)

const monthName = computed(() => monthNames.value[month.value - 1] || '')
const totalDaysInMonth = computed(() => new Date(year.value, month.value, 0).getDate())
const firstDayOffset = computed(() => new Date(year.value, month.value - 1, 1).getDay())
const daysLeft = computed(() => Math.max(totalDaysInMonth.value - today.value, 0))
const streakDays = computed(() => signedDays.value)

const todaySigned = computed(() => signedDaysSet.value.has(today.value))
const todayReward = computed(() => formatMoney(dayRewardMap.value[today.value] || 0))

const signBtnText = computed(() => {
  if (!active.value) return t('activitySignin.activityNotAvailable')
  if (isSubmitting.value) return t('common.processing')
  if (todaySigned.value) return `✅ ${t('activitySignin.signedToday')}`
  return `🎁 ${t('activitySignin.signInNow', { amount: todayReward.value })}`
})

const rewardTiers = computed(() => {
  const list = Object.entries(dayRewardMap.value)
    .map(([day, amount]) => ({
      day,
      amount: formatMoney(amount),
    }))
    .sort((a, b) => Number(a.day) - Number(b.day))
  return list
})

function formatMoney(value: number): string {
  return Number(value || 0).toFixed(2)
}

function applySigninData(dayList: SigninDayInfo[]) {
  const rewardMap: Record<number, number> = {}
  const signedSet = new Set<number>()

  for (let day = 1; day <= totalDaysInMonth.value; day++) {
    rewardMap[day] = 0
  }

  for (const item of dayList || []) {
    if (!item || item.day_no < 1 || item.day_no > 31) continue
    rewardMap[item.day_no] = Number(item.reward_amount || 0)
    if (item.signed) {
      signedSet.add(item.day_no)
    }
  }

  dayRewardMap.value = rewardMap
  signedDaysSet.value = signedSet
}

async function fetchSigninInfo(showErrorToast = true) {
  try {
    const res = await getSigninActivityInfo()
    if (!res?.success) {
      active.value = false
      if (showErrorToast) showToast(res?.message || t('activitySignin.loadInfoFailed'))
      return
    }

    active.value = !!res.active
    year.value = Number(res.year) || now.getFullYear()
    month.value = Number(res.month) || now.getMonth() + 1
    today.value = Number(res.today) || now.getDate()
    signedDays.value = Number(res.signed_days) || 0
    totalEarned.value = formatMoney(Number(res.signed_amount) || 0)
    applySigninData(res.day_list || [])
  } catch (e: any) {
    active.value = false
    if (showErrorToast) showToast(e?.message || t('activitySignin.loadInfoFailed'))
  }
}

function getDayReward(day: number): string {
  return formatMoney(dayRewardMap.value[day] || 0)
}

function isSignedDay(day: number) {
  return signedDaysSet.value.has(day)
}
function isToday(day: number) {
  return day === today.value
}
function isFuture(day: number) {
  return day > today.value
}
function canSign(day: number) {
  return active.value && day === today.value && !todaySigned.value
}

function handleSign(day: number) {
  if (canSign(day)) handleSignToday()
}

async function handleSignToday() {
  if (!active.value) {
    showToast(t('activitySignin.activityNotAvailable'))
    return
  }
  if (todaySigned.value || isSubmitting.value) return

  isSubmitting.value = true
  try {
    const res = await claimSigninReward()
    if (!res?.success) {
      showToast(res?.message || t('activitySignin.signInFailed'))
      return
    }

    lastReward.value = formatMoney(Number(res.reward_amount) || 0)
    showSignDialog.value = true
    await fetchSigninInfo(false)
  } catch (e: any) {
    showToast(e?.message || t('activitySignin.signInFailed'))
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  fetchSigninInfo()
})
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

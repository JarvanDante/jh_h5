<template>
  <div class="vip-page">
    <!-- 顶部导航栏 -->
    <div class="top-bar">
      <van-icon name="arrow-left" size="24" color="#fff" @click="$router.back()" />
      <span class="title">{{ t('vip.title') }}</span>
      <div class="placeholder"></div>
    </div>

    <!-- 当前VIP卡片 -->
    <div class="current-vip-card" v-if="currentGrade">
      <div class="card-bg">
        <div class="card-top">
          <div class="card-vip-name">👑 {{ displayCurrentGradeName }}</div>
          <div class="card-user">ID: {{ userStore.userInfo?.id || '--' }}</div>
        </div>
        <div class="card-bottom">
          <div class="card-stat">
            <span class="stat-label">{{ t('vip.eGameRebate') }}</span>
            <span class="stat-value">{{ currentGrade.rebate_percent_egame }}%</span>
          </div>
          <div class="card-stat">
            <span class="stat-label">{{ t('vip.upgradeBonus') }}</span>
            <span class="stat-value green">₱{{ currentGrade.money_limit }}</span>
          </div>
        </div>
        <div class="card-glow"></div>
      </div>
    </div>

    <!-- 升级进度 -->
    <div class="section" v-if="showProgressSection">
      <div class="section-title">📊 {{ t('vip.upgradeProgress') }}</div>
      <div class="progress-card">
        <div class="progress-grid">
          <div class="progress-item">
            <span class="pi-label">{{ t('common.deposit') }}</span>
            <span class="pi-value">₱{{ formatMoney(vipProgress.deposit_amount) }}</span>
            <span class="pi-target" v-if="!vipProgress.is_max_grade">
              / ₱{{ formatMoney(vipProgress.next_payment_limit) }}
            </span>
          </div>
          <div class="progress-item">
            <span class="pi-label">{{ t('common.bet') }}</span>
            <span class="pi-value">₱{{ formatMoney(vipProgress.bet_amount) }}</span>
            <span class="pi-target" v-if="!vipProgress.is_max_grade">
              / ₱{{ formatMoney(vipProgress.next_bet_limit) }}
            </span>
          </div>
        </div>
        <div class="progress-row">
          <div class="progress-head">
            <span>{{ t('vip.depositProgress') }}</span>
            <strong>{{ formatPercent(vipProgress.deposit_progress) }}%</strong>
          </div>
          <div class="progress-track">
            <div
              class="progress-fill deposit"
              :style="{ width: `${Math.min(Math.max(vipProgress.deposit_progress, 0), 100)}%` }"
            ></div>
          </div>
        </div>
        <div class="progress-row">
          <div class="progress-head">
            <span>{{ t('vip.betProgress') }}</span>
            <strong>{{ formatPercent(vipProgress.bet_progress) }}%</strong>
          </div>
          <div class="progress-track">
            <div
              class="progress-fill bet"
              :style="{ width: `${Math.min(Math.max(vipProgress.bet_progress, 0), 100)}%` }"
            ></div>
          </div>
        </div>
        <div class="progress-overall" v-if="!vipProgress.is_max_grade">
          <span>{{ t('vip.overall') }}</span>
          <strong>{{ formatPercent(vipProgress.progress) }}%</strong>
        </div>
      </div>
    </div>

    <!-- 升级要求 -->
    <div class="section" v-if="showNextLevelSection">
      <div class="section-title">🚀 {{ t('vip.nextLevel', { name: displayNextGradeName }) }}</div>
      <div class="upgrade-card">
        <div class="upgrade-row">
          <span class="upgrade-label">{{ t('vip.depositRequired') }}</span>
          <span class="upgrade-val">₱{{ displayNextPaymentLimit }}</span>
        </div>
        <div class="upgrade-row">
          <span class="upgrade-label">{{ t('vip.betRequired') }}</span>
          <span class="upgrade-val">₱{{ displayNextBetLimit }}</span>
        </div>
        <div class="upgrade-row">
          <span class="upgrade-label">{{ t('vip.upgradeBonus') }}</span>
          <span class="upgrade-val green">₱{{ displayNextBonus }}</span>
        </div>
        <div class="upgrade-row">
          <span class="upgrade-label">{{ t('vip.eGameRebate') }}</span>
          <span class="upgrade-val gold">{{ displayNextRebate }}</span>
        </div>
      </div>
    </div>
    <div class="section" v-else-if="showMaxLevelSection">
      <div class="max-level-card">🎉 {{ t('vip.maxLevel') }}</div>
    </div>

    <!-- 全部VIP等级 -->
    <div class="section">
      <div class="section-title">👑 {{ t('vip.allLevels') }}</div>
      <div class="grade-table">
        <div class="table-header">
          <span class="th">{{ t('vip.level') }}</span>
          <span class="th">{{ t('vip.rebate') }}</span>
          <span class="th">{{ t('common.bonus') }}</span>
          <span class="th">{{ t('common.deposit') }}</span>
          <span class="th">{{ t('common.bet') }}</span>
        </div>
        <div
          v-for="(grade, index) in gradeList"
          :key="grade.id"
          class="table-row"
          :class="{ current: grade.id === userGradeId }"
        >
          <span class="td">
            <span class="level-badge" :style="getBadgeStyle(index)">{{ grade.name }}</span>
          </span>
          <span class="td gold">{{ grade.rebate_percent_egame }}%</span>
          <span class="td green">₱{{ grade.money_limit }}</span>
          <span class="td">₱{{ grade.payment_limit }}</span>
          <span class="td">₱{{ grade.bet_limit }}</span>
        </div>
      </div>
    </div>

    <!-- VIP规则 -->
    <div class="section">
      <div class="section-title">📋 {{ t('vip.vipRules') }}</div>
      <div class="rules-card">
        <div class="rule-item">1. {{ t('vip.rule1') }}</div>
        <div class="rule-item">2. {{ t('vip.rule2') }}</div>
        <div class="rule-item">3. {{ t('vip.rule3') }}</div>
        <div class="rule-item">4. {{ t('vip.rule4') }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'
import { getVipUpgradeProgress, type VipUpgradeProgressResponse } from '@/api/modules/balance'
import { userApi } from '@/api/modules/user'
import type { GradeInfo } from '@/api/modules/user'

const { t } = useI18n()
const userStore = useUserStore()
const userGradeId = computed(() => userStore.userInfo?.grade_id || 1)

const gradeList = ref<GradeInfo[]>([])
const currentGrade = computed(() => gradeList.value.find((g) => g.id === userGradeId.value))

const vipProgress = ref<VipUpgradeProgressResponse>({
  success: false,
  message: '',
  current_grade_id: 0,
  current_grade_name: '',
  next_grade_id: 0,
  next_grade_name: '',
  deposit_amount: 0,
  bet_amount: 0,
  next_payment_limit: 0,
  next_bet_limit: 0,
  deposit_progress: 0,
  bet_progress: 0,
  progress: 0,
  is_max_grade: false,
})

const displayCurrentGradeName = computed(() => {
  return vipProgress.value.current_grade_name || currentGrade.value?.name || 'VIP0'
})

const nextGrade = computed(() => {
  if (vipProgress.value.next_grade_id > 0) {
    const matched = gradeList.value.find((g) => g.id === vipProgress.value.next_grade_id)
    if (matched) return matched
  }
  const idx = gradeList.value.findIndex((g) => g.id === userGradeId.value)
  if (idx >= 0 && idx < gradeList.value.length - 1) {
    return gradeList.value[idx + 1]
  }
  return null
})

const showProgressSection = computed(() => vipProgress.value.success)

const showNextLevelSection = computed(() => {
  if (vipProgress.value.success) {
    return !vipProgress.value.is_max_grade
  }
  return !!nextGrade.value
})

const showMaxLevelSection = computed(() => {
  if (vipProgress.value.success) {
    return vipProgress.value.is_max_grade
  }
  return !!currentGrade.value && !nextGrade.value
})

const displayNextGradeName = computed(() => {
  if (nextGrade.value?.name) return nextGrade.value.name
  if (vipProgress.value.next_grade_name) return vipProgress.value.next_grade_name
  if (vipProgress.value.next_grade_id > 0) return `VIP${vipProgress.value.next_grade_id}`
  return '--'
})

const displayNextPaymentLimit = computed(() => {
  if (vipProgress.value.success) return formatMoney(vipProgress.value.next_payment_limit)
  return nextGrade.value?.payment_limit || '0.00'
})

const displayNextBetLimit = computed(() => {
  if (vipProgress.value.success) return formatMoney(vipProgress.value.next_bet_limit)
  return nextGrade.value?.bet_limit || '0.00'
})

const displayNextBonus = computed(() => {
  return nextGrade.value?.money_limit || '0.00'
})

const displayNextRebate = computed(() => {
  const rebate = nextGrade.value?.rebate_percent_egame || '0.00'
  return `${rebate}%`
})

const badgeGradients: string[] = [
  'linear-gradient(135deg, #6b7280, #9ca3af)',
  'linear-gradient(135deg, #552583, #7b3fa8)',
  'linear-gradient(135deg, #2563eb, #3b82f6)',
  'linear-gradient(135deg, #0891b2, #22d3ee)',
  'linear-gradient(135deg, #059669, #34d399)',
  'linear-gradient(135deg, #65a30d, #a3e635)',
  'linear-gradient(135deg, #d97706, #fbbf24)',
  'linear-gradient(135deg, #ea580c, #fb923c)',
  'linear-gradient(135deg, #dc2626, #f87171)',
  'linear-gradient(135deg, #4f46e5, #818cf8)',
  'linear-gradient(135deg, #9333ea, #c084fc)',
  'linear-gradient(135deg, #7c3aed, #a78bfa)',
  'linear-gradient(135deg, #be185d, #f472b6)',
  'linear-gradient(135deg, #b45309, #fcd34d)',
  'linear-gradient(135deg, #dc2626, #fdb927)',
]

function getBadgeStyle(index: number) {
  return { background: badgeGradients[index] || badgeGradients[0] }
}

function formatMoney(value: number): string {
  return Number(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function formatPercent(value: number): string {
  const normalized = Math.round(Number(value || 0) * 100) / 100
  return normalized.toString()
}

async function fetchGradeList() {
  try {
    const res = await userApi.getGradeList()
    if (res?.list) {
      gradeList.value = res.list
    }
  } catch (e) {
    console.error('获取等级列表失败:', e)
  }
}

async function fetchVipProgress() {
  try {
    const res = await getVipUpgradeProgress()
    if (res) {
      vipProgress.value = {
        ...vipProgress.value,
        ...res,
      }
      if (res.current_grade_id) {
        const baseUserInfo = userStore.userInfo || { id: 0, username: '' }
        userStore.setUserInfo({
          ...baseUserInfo,
          grade_id: res.current_grade_id,
          grade_name: res.current_grade_name || baseUserInfo.grade_name || '',
        })
      }
    }
  } catch (e) {
    console.error('获取VIP升级进度失败:', e)
  }
}

async function refreshUserInfo() {
  if (!userStore.isLogin) return
  try {
    const res = await userApi.getUserInfo()
    if (res) {
      userStore.setUserInfo({
        ...userStore.userInfo,
        ...res,
        id: (res as any).user_id || userStore.userInfo?.id || 0,
      })
    }
  } catch (e) {
    console.error('刷新用户信息失败:', e)
  }
}

onMounted(() => {
  fetchGradeList()
  refreshUserInfo()
  fetchVipProgress()
})
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.vip-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 80px;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: $gradient-purple;
  box-shadow: $shadow-md;

  .title {
    color: #fff;
    font-size: 20px;
    font-weight: bold;
  }
  .placeholder {
    width: 24px;
  }
  .van-icon {
    cursor: pointer;
    &:active {
      transform: scale(0.9);
    }
  }
}

// 当前VIP卡片
.current-vip-card {
  margin: 16px;

  .card-bg {
    padding: 24px 20px;
    border-radius: 16px;
    background: linear-gradient(135deg, #552583 0%, #3a1a5c 50%, #6b2fa0 100%);
    position: relative;
    overflow: hidden;
    box-shadow: $shadow-lg;
  }

  .card-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .card-vip-name {
    font-size: 24px;
    font-weight: 900;
    color: #fdb927;
    text-shadow: 0 0 20px rgba(253, 185, 39, 0.5);
    letter-spacing: 1px;
  }

  .card-user {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.6);
    background: rgba(255, 255, 255, 0.1);
    padding: 4px 12px;
    border-radius: 20px;
  }

  .card-bottom {
    display: flex;
    gap: 24px;
  }

  .card-stat {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .stat-label {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.5);
    }
    .stat-value {
      font-size: 20px;
      font-weight: 900;
      color: #fdb927;
      &.green {
        color: #4ade80;
      }
    }
  }

  .card-glow {
    position: absolute;
    top: -40%;
    right: -20%;
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, rgba(253, 185, 39, 0.12) 0%, transparent 70%);
    border-radius: 50%;
  }
}

// 通用 section
.section {
  margin: 0 16px 16px;

  .section-title {
    font-size: 16px;
    font-weight: 900;
    color: $primary-color;
    margin-bottom: 12px;
  }
}

// 升级要求卡片
.upgrade-card {
  background: #fff;
  border-radius: 14px;
  padding: 16px;
  border: 1px solid #e5e5e5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  .upgrade-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .upgrade-label {
      font-size: 13px;
      color: #666;
    }
    .upgrade-val {
      font-size: 15px;
      font-weight: 800;
      color: $primary-color;
      &.green {
        color: $success-color;
      }
      &.gold {
        color: #d97706;
      }
    }
  }
}

// 升级进度卡片
.progress-card {
  background: #fff;
  border-radius: 14px;
  padding: 16px;
  border: 1px solid #e5e5e5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.progress-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 14px;
}

.progress-item {
  background: linear-gradient(135deg, rgba(85, 37, 131, 0.06), rgba(253, 185, 39, 0.06));
  border: 1px solid #ede4f8;
  border-radius: 10px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;

  .pi-label {
    font-size: 11px;
    color: #8c7a9f;
  }

  .pi-value {
    font-size: 20px;
    font-weight: 900;
    color: #552583;
    line-height: 1.1;
  }

  .pi-target {
    font-size: 11px;
    color: #9a9a9a;
  }
}

.progress-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;

  span {
    font-size: 12px;
    color: #666;
  }

  strong {
    font-size: 14px;
    color: #552583;
    font-weight: 800;
  }
}

.progress-row {
  margin-bottom: 12px;

  &:last-of-type {
    margin-bottom: 0;
  }
}

.progress-track {
  width: 100%;
  height: 8px;
  border-radius: 999px;
  background: #ece7f4;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #6f3db0 0%, #fdb927 100%);
  transition: width 0.25s ease;

  &.deposit {
    background: linear-gradient(90deg, #6f3db0 0%, #9f67de 100%);
  }

  &.bet {
    background: linear-gradient(90deg, #cc7a1a 0%, #fdb927 100%);
  }
}

.progress-overall {
  margin-top: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #6e6e6e;

  strong {
    font-size: 13px;
    font-weight: 800;
    color: #552583;
  }
}

// 最高等级
.max-level-card {
  background: #fff;
  border-radius: 14px;
  padding: 20px;
  text-align: center;
  font-size: 15px;
  font-weight: 700;
  color: $primary-color;
  border: 1px solid #e5e5e5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

// 等级表格
.grade-table {
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid #e5e5e5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  .table-header {
    display: flex;
    background: linear-gradient(135deg, #552583, #7b3fa8);
    padding: 10px 8px;

    .th {
      flex: 1;
      text-align: center;
      font-size: 11px;
      font-weight: 700;
      color: rgba(255, 255, 255, 0.9);
    }
  }

  .table-row {
    display: flex;
    padding: 10px 8px;
    border-bottom: 1px solid #f0f0f0;
    align-items: center;
    transition: background 0.2s;

    &:last-child {
      border-bottom: none;
    }

    &.current {
      background: rgba(85, 37, 131, 0.05);
      border-left: 3px solid $secondary-color;
    }

    .td {
      flex: 1;
      text-align: center;
      font-size: 12px;
      color: #666;
      font-weight: 500;

      &.gold {
        color: #d97706;
        font-weight: 800;
      }
      &.green {
        color: $success-color;
        font-weight: 800;
      }
    }

    .level-badge {
      display: inline-block;
      font-size: 10px;
      font-weight: 900;
      padding: 2px 8px;
      border-radius: 12px;
      color: #fff;
    }
  }
}

// 规则
.rules-card {
  background: #fff;
  border-radius: 14px;
  padding: 16px;
  border: 1px solid #e5e5e5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  .rule-item {
    font-size: 12px;
    color: #999;
    line-height: 2;
  }
}
</style>

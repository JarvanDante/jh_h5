<template>
  <div class="rebate-page">
    <!-- 紫色背景区域 -->
    <div class="header-bg">
      <div class="top-bar">
        <van-icon name="arrow-left" size="24" color="#fff" @click="$router.back()" />
        <span class="title">Rebate Center</span>
        <div class="placeholder"></div>
      </div>
      <!-- VIP信息 -->
      <div class="vip-hero">
        <div class="vip-left">
          <div class="vip-badge">👑 {{ currentGrade?.name || 'VIP0' }}</div>
          <div class="vip-sub">Your current rebate level</div>
        </div>
        <div class="vip-stats">
          <div class="stat-item">
            <span class="stat-val">{{ currentGrade?.rebate_percent_egame || '0.00' }}%</span>
            <span class="stat-label">E-Game Rebate</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-val green">₱{{ currentGrade?.money_limit || '0' }}</span>
            <span class="stat-label">Upgrade Bonus</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 额度卡片（浮在紫色背景下方） -->
    <div class="quota-card">
      <div class="quota-top">
        <span class="quota-label">Valid Bet Amount</span>
        <span class="quota-time" v-if="quota.last_rebate_time">{{ quota.last_rebate_time }}</span>
      </div>
      <div class="quota-amount">₱{{ formatMoney(quota.valid_bet_amount) }}</div>
      <div
        class="wash-btn"
        :class="{ disabled: isWashing || quota.valid_bet_amount <= 0 }"
        @click="handleWashCode"
      >
        {{ isWashing ? 'Processing...' : '💰 Claim Rebate' }}
      </div>
    </div>

    <!-- VIP等级列表 -->
    <div class="vip-section">
      <div class="section-header">
        <span class="section-title">VIP Rebate Rates</span>
        <span class="section-hint">Swipe to view all →</span>
      </div>
      <div class="vip-list" ref="vipListRef">
        <div
          v-for="(grade, index) in gradeList"
          :key="grade.id"
          class="vip-card"
          :class="{ current: grade.id === userGradeId }"
        >
          <div class="card-top" :style="getBadgeStyle(index)">
            <span class="card-name">{{ grade.name }}</span>
            <span v-if="grade.id === userGradeId" class="current-tag">✓ You</span>
          </div>
          <div class="card-body">
            <div class="cb-row">
              <span class="cb-label">Rebate</span>
              <span class="cb-val">{{ grade.rebate_percent_egame }}%</span>
            </div>
            <div class="cb-row">
              <span class="cb-label">Bonus</span>
              <span class="cb-val bonus">₱{{ grade.money_limit }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 规则 -->
    <div class="rules-section">
      <div class="rules-title">Rules</div>
      <div class="rules-list">
        <div class="rule-item">
          <span class="rule-num">1</span>
          <span class="rule-text">Rebate is calculated based on your valid bet amount</span>
        </div>
        <div class="rule-item">
          <span class="rule-num">2</span>
          <span class="rule-text">Higher VIP level = higher rebate percentage</span>
        </div>
        <div class="rule-item">
          <span class="rule-num">3</span>
          <span class="rule-text">Rebate is credited instantly to your balance</span>
        </div>
        <div class="rule-item">
          <span class="rule-num">4</span>
          <span class="rule-text">Wash code resets after each claim</span>
        </div>
      </div>
    </div>

    <!-- 洗码成功弹窗 -->
    <teleport to="body">
      <div v-if="showResultDialog" class="result-overlay" @click="closeResultDialog">
        <div class="result-dialog" @click.stop>
          <div class="rd-check">✅</div>
          <div class="rd-title">Rebate Claimed!</div>
          <div class="rd-amount">₱{{ formatMoneyPrecise(washResult.rebate_amount) }}</div>
          <div class="rd-sub">has been credited to your balance</div>
          <div class="rd-info">
            <div class="rd-row">
              <span>Valid Bet</span><em>₱{{ formatMoney(washResult.valid_bet_amount) }}</em>
            </div>
            <div class="rd-row">
              <span>Rate</span><em>{{ washResult.rebate_percent }}%</em>
            </div>
          </div>
          <div class="rd-btn" @click="closeResultDialog">Done</div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { showToast } from 'vant'
import { useUserStore } from '@/stores/user'
import { userApi } from '@/api/modules/user'
import { gameApi } from '@/api/modules/game'
import { washCodeRebate } from '@/api/modules/balance'
import type { GradeInfo } from '@/api/modules/user'
import type { WashCodeQuotaResponse } from '@/api/modules/game'
import type { WashCodeRebateResponse } from '@/api/modules/balance'

const userStore = useUserStore()
const userGradeId = computed(() => userStore.userInfo?.grade_id || 1)

const gradeList = ref<GradeInfo[]>([])
const currentGrade = computed(() => gradeList.value.find((g) => g.id === userGradeId.value))

const quota = ref<WashCodeQuotaResponse>({
  success: false,
  message: '',
  valid_bet_amount: 0,
  max_bet_id: 0,
  last_rebate_time: '',
})

const isWashing = ref(false)
const showResultDialog = ref(false)
const washResult = ref<WashCodeRebateResponse>({
  success: false,
  message: '',
  trade_no: '',
  valid_bet_amount: 0,
  rebate_percent: 0,
  rebate_amount: 0,
  grade_name: '',
  max_bet_id: 0,
})

function formatMoney(val: number): string {
  return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatMoneyPrecise(val: number): string {
  return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })
}

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

// 关闭结果弹窗并刷新额度
function closeResultDialog() {
  showResultDialog.value = false
  fetchQuota()
}

// 获取等级列表
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

// 获取可洗码额度
async function fetchQuota() {
  try {
    const res = await gameApi.getWashCodeQuota()
    if (res) {
      quota.value = res
    }
  } catch (e) {
    console.error('获取洗码额度失败:', e)
  }
}

// 执行洗码
async function handleWashCode() {
  if (isWashing.value || quota.value.valid_bet_amount <= 0) return

  if (!userStore.isLogin) {
    showToast('Please login first')
    return
  }

  isWashing.value = true
  try {
    const res = await washCodeRebate()
    if (res?.success) {
      washResult.value = res
      showResultDialog.value = true
    } else {
      showToast(res?.message || 'Wash code failed')
    }
  } catch (e: any) {
    showToast(e?.message || 'Wash code failed')
  } finally {
    isWashing.value = false
  }
}

onMounted(() => {
  fetchGradeList()
  fetchQuota()
  refreshUserInfo()
  initDragScroll()
})

// 刷新用户信息，确保VIP等级是最新的
async function refreshUserInfo() {
  if (!userStore.isLogin) return
  try {
    const res = await userApi.getUserInfo()
    if (res) {
      userStore.setUserInfo(res)
    }
  } catch (e) {
    console.error('刷新用户信息失败:', e)
  }
}

// 鼠标拖拽滑动
const vipListRef = ref<HTMLElement | null>(null)
let isDragging = false
let startX = 0
let scrollLeft = 0

function initDragScroll() {
  const el = vipListRef.value
  if (!el) return

  el.addEventListener('mousedown', (e: MouseEvent) => {
    isDragging = true
    startX = e.pageX - el.offsetLeft
    scrollLeft = el.scrollLeft
    el.style.cursor = 'grabbing'
  })
  el.addEventListener('mouseleave', () => {
    isDragging = false
    el.style.cursor = 'grab'
  })
  el.addEventListener('mouseup', () => {
    isDragging = false
    el.style.cursor = 'grab'
  })
  el.addEventListener('mousemove', (e: MouseEvent) => {
    if (!isDragging) return
    e.preventDefault()
    const x = e.pageX - el.offsetLeft
    const walk = (x - startX) * 1.5
    el.scrollLeft = scrollLeft - walk
  })
}

onBeforeUnmount(() => {
  // 事件监听器会随元素销毁自动清理
})
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.rebate-page {
  min-height: 100vh;
  background: $background-color-light;
  padding-bottom: 80px;
}

// ===== 紫色头部背景 =====
.header-bg {
  background: linear-gradient(180deg, #552583 0%, #6b2fa0 60%, #7b3fa8 100%);
  padding-bottom: 50px;
  border-radius: 0 0 24px 24px;
}

.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  color: #fff;
  .title {
    font-size: 18px;
    font-weight: 600;
  }
  .placeholder {
    width: 24px;
  }
}

.vip-hero {
  padding: 0 20px;
  .vip-left {
    margin-bottom: 14px;
  }
  .vip-badge {
    font-size: 24px;
    font-weight: 900;
    color: #fdb927;
    text-shadow: 0 2px 12px rgba(253, 185, 39, 0.4);
  }
  .vip-sub {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.5);
    margin-top: 2px;
  }
  .vip-stats {
    display: flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(8px);
    border-radius: 12px;
    padding: 10px 0;
    .stat-item {
      flex: 1;
      text-align: center;
      .stat-val {
        display: block;
        font-size: 18px;
        font-weight: 900;
        color: #fdb927;
        &.green {
          color: #4ade80;
        }
      }
      .stat-label {
        display: block;
        font-size: 10px;
        color: rgba(255, 255, 255, 0.55);
        margin-top: 2px;
      }
    }
    .stat-divider {
      width: 1px;
      height: 28px;
      background: rgba(255, 255, 255, 0.15);
      flex-shrink: 0;
    }
  }
}

// ===== 额度卡片（上浮层次感） =====
.quota-card {
  margin: -30px 16px 0;
  position: relative;
  z-index: 2;
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(85, 37, 131, 0.12);
  text-align: center;
  .quota-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
    .quota-label {
      font-size: 12px;
      color: $text-color-secondary;
      font-weight: 500;
    }
    .quota-time {
      font-size: 10px;
      color: #bbb;
    }
  }
  .quota-amount {
    font-size: 34px;
    font-weight: 900;
    color: $primary-color;
    margin: 4px 0 16px;
    letter-spacing: -0.5px;
  }
  .wash-btn {
    padding: 12px;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 800;
    cursor: pointer;
    background: linear-gradient(135deg, #552583 0%, #7b3fa8 100%);
    color: #fff;
    letter-spacing: 0.3px;
    box-shadow: 0 4px 16px rgba(85, 37, 131, 0.3);
    transition: all 0.2s;
    &:active:not(.disabled) {
      transform: scale(0.98);
      box-shadow: 0 2px 8px rgba(85, 37, 131, 0.3);
    }
    &.disabled {
      background: #e5e7eb;
      color: #9ca3af;
      box-shadow: none;
      cursor: default;
    }
  }
}

// ===== VIP等级列表 =====
.vip-section {
  margin: 20px 16px 16px;
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  .section-title {
    font-size: 16px;
    font-weight: 800;
    color: $text-color;
  }
  .section-hint {
    font-size: 11px;
    color: #bbb;
  }
  .vip-list {
    display: flex;
    gap: 10px;
    overflow-x: auto;
    padding-bottom: 4px;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    cursor: grab;
    user-select: none;
    &::-webkit-scrollbar {
      display: none;
    }
  }
  .vip-card {
    min-width: 140px;
    flex-shrink: 0;
    border-radius: 12px;
    background: #fff;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    border: 1px solid #f0f0f0;
    transition: all 0.2s;
    &.current {
      border-color: $primary-color;
      box-shadow: 0 2px 12px rgba(85, 37, 131, 0.18);
    }
    .card-top {
      padding: 8px 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      .card-name {
        font-size: 13px;
        font-weight: 900;
        color: #fff;
        letter-spacing: 0.5px;
      }
      .current-tag {
        font-size: 9px;
        color: rgba(255, 255, 255, 0.9);
        background: rgba(255, 255, 255, 0.2);
        padding: 1px 6px;
        border-radius: 8px;
        font-weight: 600;
      }
    }
    .card-body {
      padding: 10px 12px;
      .cb-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 2px 0;
        .cb-label {
          font-size: 11px;
          color: #999;
        }
        .cb-val {
          font-size: 13px;
          font-weight: 800;
          color: $primary-color;
          &.bonus {
            color: #059669;
          }
        }
      }
    }
  }
}

// ===== 规则 =====
.rules-section {
  margin: 0 16px 16px;
  padding: 16px;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  .rules-title {
    font-size: 15px;
    font-weight: 800;
    color: $text-color;
    margin-bottom: 12px;
  }
  .rule-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin-bottom: 10px;
    &:last-child {
      margin-bottom: 0;
    }
    .rule-num {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: linear-gradient(135deg, #552583, #7b3fa8);
      color: #fff;
      font-size: 10px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .rule-text {
      font-size: 12px;
      color: $text-color-secondary;
      line-height: 1.6;
    }
  }
}

// ===== 成功弹窗 =====
.result-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}
.result-dialog {
  text-align: center;
  padding: 28px 24px 20px;
  width: 300px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15);
  animation: dialogPop 0.3s ease;
  .rd-check {
    font-size: 40px;
    margin-bottom: 4px;
  }
  .rd-title {
    font-size: 18px;
    font-weight: 900;
    color: $text-color;
    margin-bottom: 4px;
  }
  .rd-amount {
    font-size: 28px;
    font-weight: 900;
    color: $primary-color;
    margin: 4px 0;
  }
  .rd-sub {
    font-size: 12px;
    color: #999;
    margin-bottom: 16px;
  }
  .rd-info {
    background: $background-color-light;
    border-radius: 10px;
    padding: 10px 14px;
    margin-bottom: 16px;
    .rd-row {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
      span {
        font-size: 12px;
        color: $text-color-secondary;
      }
      em {
        font-size: 12px;
        font-style: normal;
        font-weight: 700;
        color: $text-color;
      }
    }
  }
  .rd-btn {
    background: linear-gradient(135deg, #552583, #7b3fa8);
    color: #fff;
    font-size: 15px;
    font-weight: 800;
    padding: 11px;
    border-radius: 12px;
    cursor: pointer;
    &:active {
      transform: scale(0.97);
    }
  }
}

@keyframes dialogPop {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>

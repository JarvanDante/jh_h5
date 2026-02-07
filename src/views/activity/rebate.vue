<template>
  <div class="rebate-page">
    <!-- 顶部导航栏 -->
    <div class="top-bar">
      <van-icon name="arrow-left" size="24" color="#fff" @click="$router.back()" />
      <span class="title">Rebate Center</span>
      <div class="placeholder"></div>
    </div>

    <!-- VIP + 洗码额度合并卡片 -->
    <div class="combo-card">
      <!-- 上半：VIP信息 -->
      <div class="combo-vip">
        <div class="vip-badge">👑 {{ currentGrade?.name || 'VIP0' }}</div>
        <div class="vip-right">
          <div class="vip-rate">
            <span class="rate-label">🎰 E-Game</span>
            <span class="rate-value">{{ currentGrade?.rebate_percent_egame || '0.00' }}%</span>
          </div>
          <div class="vip-money">
            <span class="money-label">🎁 Bonus</span>
            <span class="money-value">₱{{ currentGrade?.money_limit || '0' }}</span>
          </div>
        </div>
        <div class="vip-glow"></div>
      </div>
      <!-- 下半：额度信息（叠上去） -->
      <div class="combo-quota">
        <div class="quota-label">Valid Bet Amount</div>
        <div class="quota-amount">₱{{ formatMoney(quota.valid_bet_amount) }}</div>
        <div class="quota-time" v-if="quota.last_rebate_time">
          Last rebate: {{ quota.last_rebate_time }}
        </div>
      </div>
    </div>

    <!-- 洗码按钮 -->
    <div class="wash-btn-area">
      <div
        class="wash-btn"
        :class="{ disabled: isWashing || quota.valid_bet_amount <= 0 }"
        @click="handleWashCode"
      >
        {{ isWashing ? 'Processing...' : '💰 Wash Code Now' }}
      </div>
    </div>

    <!-- VIP等级列表 -->
    <div class="vip-section">
      <div class="section-title">👑 VIP Rebate Rates</div>
      <div class="vip-list" ref="vipListRef">
        <div
          v-for="(grade, index) in gradeList"
          :key="grade.id"
          class="vip-card"
          :class="{ current: grade.id === userGradeId }"
        >
          <div class="card-header">
            <span class="card-badge" :style="getBadgeStyle(index)">{{ grade.name }}</span>
            <span v-if="grade.id === userGradeId" class="current-tag">Current</span>
          </div>
          <div class="card-rates">
            <div class="cr-row">
              <span class="cr-label">🎰 E-Game Rebate</span>
              <span class="cr-val">{{ grade.rebate_percent_egame }}%</span>
            </div>
            <div class="cr-row">
              <span class="cr-label">🎁 Upgrade Bonus</span>
              <span class="cr-val bonus">₱{{ grade.money_limit }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 规则 -->
    <div class="rules-section">
      <div class="rules-title">📋 Rules</div>
      <div class="rules-list">
        <div class="rule-item">1. Rebate is calculated based on your valid bet amount</div>
        <div class="rule-item">2. Higher VIP level = higher rebate percentage</div>
        <div class="rule-item">3. Rebate is credited instantly to your balance</div>
        <div class="rule-item">4. Wash code resets after each claim</div>
      </div>
    </div>

    <!-- 洗码成功弹窗 -->
    <teleport to="body">
      <div v-if="showResultDialog" class="result-overlay" @click="closeResultDialog">
        <div class="result-dialog" @click.stop>
          <div class="rd-icon">🎉</div>
          <div class="rd-title">Rebate Successful!</div>
          <div class="rd-info">
            <div class="rd-row">
              <span>Valid Bet</span><em>₱{{ formatMoney(washResult.valid_bet_amount) }}</em>
            </div>
            <div class="rd-row">
              <span>Rate</span><em>{{ washResult.rebate_percent }}%</em>
            </div>
            <div class="rd-row highlight">
              <span>Rebate Amount</span><em>₱{{ formatMoneyPrecise(washResult.rebate_amount) }}</em>
            </div>
          </div>
          <div class="rd-btn" @click="closeResultDialog">OK</div>
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

// 顶部导航栏 - 和report页面一致的紫色渐变
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: $gradient-purple;
  color: $text-color-light;

  .title {
    font-size: 18px;
    font-weight: 600;
  }

  .placeholder {
    width: 24px;
  }
}

// 合并卡片
.combo-card {
  margin: 16px 16px 12px;
  border-radius: 16px;
  overflow: visible;
  box-shadow: $shadow-md;

  .combo-vip {
    padding: 16px 20px 20px;
    background: linear-gradient(135deg, #552583 0%, #3a1a5c 50%, #6b2fa0 100%);
    border-radius: 16px 16px 0 0;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .vip-badge {
      font-size: 22px;
      font-weight: 900;
      color: #fdb927;
      text-shadow: 0 0 20px rgba(253, 185, 39, 0.5);
      letter-spacing: 1px;
      flex-shrink: 0;
      margin-left: 8px;
    }

    .vip-right {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 2px;
    }

    .vip-rate {
      display: flex;
      align-items: center;
      gap: 6px;
      .rate-label {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.6);
      }
      .rate-value {
        font-size: 16px;
        font-weight: 800;
        color: #fdb927;
      }
    }

    .vip-money {
      display: flex;
      align-items: center;
      gap: 6px;
      .money-label {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.6);
      }
      .money-value {
        font-size: 14px;
        font-weight: 800;
        color: #4ade80;
      }
    }

    .vip-glow {
      position: absolute;
      top: -50%;
      right: -30%;
      width: 200px;
      height: 200px;
      background: radial-gradient(circle, rgba(253, 185, 39, 0.1) 0%, transparent 70%);
      border-radius: 50%;
    }
  }

  .combo-quota {
    margin-top: -14px;
    position: relative;
    z-index: 1;
    padding: 20px;
    background: $background-color;
    border-radius: 16px;
    border: 1px solid $border-color;
    text-align: center;

    .quota-label {
      font-size: 12px;
      color: $text-color-secondary;
    }
    .quota-amount {
      font-size: 36px;
      font-weight: 900;
      color: $primary-color;
      margin: 6px 0;
    }
    .quota-time {
      font-size: 11px;
      color: #999;
    }
  }
}

// 洗码按钮
.wash-btn-area {
  margin: 0 16px 16px;

  .wash-btn {
    text-align: center;
    padding: 14px;
    border-radius: 14px;
    font-size: 16px;
    font-weight: 900;
    cursor: pointer;
    background: linear-gradient(135deg, #fdb927 0%, #f4a020 100%);
    color: #1a0a2e;
    letter-spacing: 0.5px;
    box-shadow: 0 4px 20px rgba(253, 185, 39, 0.3);
    transition: all 0.2s;

    &:active:not(.disabled) {
      transform: scale(0.98);
    }
    &.disabled {
      background: #d1d5db;
      color: #9ca3af;
      box-shadow: none;
      cursor: default;
    }
  }
}

// VIP等级列表
.vip-section {
  margin: 0 16px 16px;

  .section-title {
    font-size: 16px;
    font-weight: 900;
    color: $primary-color;
    margin-bottom: 12px;
  }

  .vip-list {
    display: flex;
    gap: 10px;
    overflow-x: auto;
    padding-bottom: 8px;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    cursor: grab;
    user-select: none;
    &::-webkit-scrollbar {
      display: none;
    }
  }

  .vip-card {
    min-width: 160px;
    flex-shrink: 0;
    padding: 14px;
    border-radius: 14px;
    background: $background-color;
    border: 1px solid $border-color;
    transition: all 0.2s;

    &.current {
      background: $background-color;
      border-color: $primary-color;
      box-shadow: 0 0 12px rgba(85, 37, 131, 0.15);
    }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;

      .card-badge {
        font-size: 13px;
        font-weight: 900;
        padding: 3px 10px;
        border-radius: 20px;
        color: #fff;
      }

      .current-tag {
        font-size: 10px;
        color: $primary-color;
        font-weight: 700;
        background: rgba(85, 37, 131, 0.1);
        padding: 2px 8px;
        border-radius: 10px;
      }
    }

    .card-rates {
      .cr-row {
        display: flex;
        justify-content: space-between;
        padding: 3px 0;
        .cr-label {
          font-size: 11px;
          color: #999;
        }
        .cr-val {
          font-size: 12px;
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

// 规则
.rules-section {
  margin: 0 16px;
  padding: 16px;
  background: $background-color;
  border-radius: 14px;
  border: 1px solid $border-color;
  .rules-title {
    font-size: 14px;
    font-weight: bold;
    color: $primary-color;
    margin-bottom: 10px;
  }
  .rule-item {
    font-size: 12px;
    color: $text-color-secondary;
    line-height: 2;
  }
}

// 洗码成功弹窗
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
  padding: 32px 24px 24px;
  width: 300px;
  background: $background-color;
  border-radius: 20px;
  box-shadow: $shadow-lg;
  animation: dialogPop 0.35s ease;

  .rd-icon {
    font-size: 48px;
    margin-bottom: 8px;
  }
  .rd-title {
    font-size: 18px;
    font-weight: 900;
    color: $primary-color;
    margin-bottom: 16px;
  }

  .rd-info {
    background: $background-color-light;
    border-radius: 12px;
    padding: 12px;
    margin-bottom: 20px;
    .rd-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      span {
        font-size: 13px;
        color: $text-color-secondary;
      }
      em {
        font-size: 13px;
        font-style: normal;
        font-weight: 700;
        color: $text-color;
      }
      &.highlight em {
        color: $primary-color;
        font-size: 18px;
      }
    }
  }

  .rd-btn {
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

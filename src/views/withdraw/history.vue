<template>
  <div class="history-page">
    <!-- 顶部导航栏 -->
    <div class="top-bar">
      <van-icon name="arrow-left" size="24" color="#fff" @click="goBack" />
      <div class="tabs">
        <div
          class="tab"
          :class="{ active: activeTab === 'withdrawals' }"
          @click="activeTab = 'withdrawals'"
        >
          Record of withdrawals
        </div>
        <div class="tab" :class="{ active: activeTab === 'audit' }" @click="activeTab = 'audit'">
          Audit logs
        </div>
      </div>
    </div>

    <!-- 提现记录 Tab -->
    <div v-if="activeTab === 'withdrawals'" class="content">
      <!-- 时间筛选和累计提现 -->
      <div class="filter-section">
        <div class="accumulated">
          <span class="label">Total Withdraw:</span>
          <span class="amount">{{ accumulatedWithdraw }}</span>
        </div>
        <div class="custom-select" @click="showPeriodPicker = !showPeriodPicker">
          <span class="select-value">{{ getPeriodText(selectedPeriod) }}</span>
          <van-icon name="arrow-down" size="14" />
          <div v-if="showPeriodPicker" class="select-dropdown">
            <div
              v-for="option in periodOptions"
              :key="option.value"
              class="select-option"
              :class="{ active: selectedPeriod === option.value }"
              @click.stop="selectPeriodOption(option.value)"
            >
              {{ option.text }}
            </div>
          </div>
        </div>
      </div>

      <!-- 时间段快捷选择 -->
      <div class="period-buttons">
        <div
          v-for="period in periods"
          :key="period.value"
          class="period-btn"
          :class="{ active: selectedPeriod === period.value }"
          @click="selectPeriod(period.value)"
        >
          {{ period.label }}
        </div>
      </div>

      <!-- 记录列表 -->
      <van-list
        v-model:loading="loading"
        :finished="finished"
        :immediate-check="false"
        finished-text="No more records"
        @load="onLoad"
      >
        <div v-if="withdrawalRecords.length === 0 && !loading" class="empty-state">
          <van-icon name="search" size="80" color="#4b5563" />
          <div class="empty-text">No Record</div>
        </div>

        <div class="record-list">
          <div v-for="record in withdrawalRecords" :key="record.id" class="record-item">
            <!-- 金额 - Amount 和金额在一行 -->
            <div class="amount-row">
              <span class="amount-label">Amount:</span>
              <span class="amount-value">₱{{ record.amount }}</span>
            </div>

            <!-- 时间 -->
            <div class="time-row">
              <span class="time-label">Time:</span>
              <span class="time-value">{{ record.time }}</span>
            </div>

            <!-- 订单号 + 复制按钮 + 状态 -->
            <div class="order-row">
              <div class="order-info">
                <span class="order-no">{{ record.orderNo }}</span>
                <div class="copy-btn" @click="copyOrderNo(record.orderNo)">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="8"
                      y="8"
                      width="12"
                      height="12"
                      rx="2"
                      stroke="#552583"
                      stroke-width="2"
                    />
                    <path
                      d="M16 8V6C16 4.89543 15.1046 4 14 4H6C4.89543 4 4 4.89543 4 6V14C4 15.1046 4.89543 16 6 16H8"
                      stroke="#552583"
                      stroke-width="2"
                    />
                  </svg>
                </div>
              </div>
              <span class="status" :class="record.statusClass">{{ record.statusText }}</span>
            </div>
          </div>
        </div>
      </van-list>
    </div>

    <!-- 审计日志 Tab -->
    <div v-if="activeTab === 'audit'" class="content">
      <!-- 待审计金额和筛选 -->
      <div class="audit-header">
        <div class="audit-info">
          <div class="audit-amount-inline">
            <span class="label">Amount to be audited:</span>
            <span class="amount">{{ auditAmount }}</span>
          </div>
          <div class="custom-select" @click="showAuditPicker = !showAuditPicker">
            <span class="select-value">{{ getAuditTypeText(selectedAuditType) }}</span>
            <van-icon name="arrow-down" size="14" />
            <div v-if="showAuditPicker" class="select-dropdown">
              <div
                v-for="option in auditTypeOptions"
                :key="option.value"
                class="select-option"
                :class="{ active: selectedAuditType === option.value }"
                @click.stop="selectAuditType(option.value)"
              >
                {{ option.text }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 记录列表 -->
      <van-list
        v-model:loading="flowLoading"
        :finished="flowFinished"
        :immediate-check="false"
        finished-text="No more records"
        @load="onLoadFlow"
      >
        <div v-if="flowRequirements.length === 0 && !flowLoading" class="empty-state">
          <van-icon name="search" size="80" color="#4b5563" />
          <div class="empty-text">No Record</div>
        </div>

        <div class="record-list">
          <div
            v-for="item in flowRequirements"
            :key="item.id"
            class="record-item flow-item"
            @click="openFlowDetail(item)"
          >
            <div class="record-header">
              <span class="type-badge">{{ getFlowTypeText(item.source_type) }}</span>
              <span class="status" :class="getFlowStatusClass(item.status)">{{
                getFlowStatusText(item.status)
              }}</span>
            </div>
            <div class="record-body">
              <div class="info-row">
                <span class="label">Required Flow:</span>
                <span class="value">₱{{ formatAmount(item.required_flow) }}</span>
              </div>
              <div class="info-row">
                <span class="label">Completed:</span>
                <span class="value">₱{{ formatAmount(item.completed_flow) }}</span>
              </div>
              <div class="info-row">
                <span class="label">Remaining:</span>
                <span class="value">₱{{ formatAmount(item.remaining_flow) }}</span>
              </div>
              <div class="info-row small order-row">
                <span class="label">Order No:</span>
                <span class="value order-no">{{ item.trade_no }}</span>
                <button class="copy-btn" @click.stop="copyOrderNo(item.trade_no)">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="8"
                      y="8"
                      width="12"
                      height="12"
                      rx="2"
                      stroke="#552583"
                      stroke-width="2"
                    />
                    <path
                      d="M16 8V6C16 4.89543 15.1046 4 14 4H6C4.89543 4 4 4.89543 4 6V14C4 15.1046 4.89543 16 6 16H8"
                      stroke="#552583"
                      stroke-width="2"
                    />
                  </svg>
                </button>
              </div>
              <div class="progress-row">
                <van-progress
                  :percentage="formatProgress(item.progress)"
                  stroke-width="6"
                  color="#07c160"
                  pivot-text=""
                />
                <span class="progress-text">{{ formatProgress(item.progress).toFixed(2) }}%</span>
              </div>
            </div>
          </div>
        </div>
      </van-list>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import {
  getBalanceLog,
  getUserFlowRequirements,
  type BalanceLogItem,
  type UserFlowRequirement,
} from '@/api/modules/balance'

const router = useRouter()
const route = useRoute()

// 当前激活的 tab
const activeTab = ref<'withdrawals' | 'audit'>('withdrawals')

// 组件挂载时检查 URL 参数
  onMounted(() => {
    const tab = route.query.tab
    if (tab === 'audit') {
      activeTab.value = 'audit'
    } else {
      // 默认加载提现记录
      onLoad()
    }
  })

// 下拉选择器显示状态
const showPeriodPicker = ref(false)
const showAuditPicker = ref(false)

// 提现记录相关
const selectedPeriod = ref(0)
const accumulatedWithdraw = ref('0.00')
const loading = ref(false)
const finished = ref(false)
const isLoadingRecords = ref(false)
const currentPage = ref(1)
const pageSize = 5

const periodOptions = [
  { text: 'Today', value: 0 },
  { text: 'Last 3 Days', value: 3 },
  { text: 'Last 5 Days', value: 5 },
  { text: 'Last 7 Days', value: 7 },
]

const periods = [
  { label: 'Today', value: 0 },
  { label: 'Last 3 Days', value: 3 },
  { label: 'Last 5 Days', value: 5 },
  { label: 'Last 7 Days', value: 7 },
]

const withdrawalRecords = ref<any[]>([])

// 审计日志相关（改为流水要求）
const auditAmount = ref('0.00')
const selectedAuditType = ref(-1)
const flowLoading = ref(false)
const flowFinished = ref(false)
const flowPage = ref(1)
const flowPageSize = 10
const isLoadingFlowRecords = ref(false)

const auditTypeOptions = [
  { text: 'All', value: -1 },
  { text: 'In Progress', value: 1 },
  { text: 'Completed', value: 2 },
  { text: 'Expired', value: 3 },
  { text: 'Closed', value: 4 },
]

const flowRequirements = ref<UserFlowRequirement[]>([])

// 获取日期范围
const getDateRange = (days: number) => {
  const now = new Date()

  let start: Date
  let end: Date

  if (days === 0) {
    // Today: 当天开始时间 00:00:00 到当天结束时间 23:59:59
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
    end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
  } else {
    // Last N Days: N天前的开始时间 00:00:00 到今天的结束时间 23:59:59
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - days, 0, 0, 0)
    end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
  }

  return {
    start: formatDateTime(start),
    end: formatDateTime(end),
  }
}

// 格式化日期时间
const formatDateTime = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 加载提现记录
const loadWithdrawRecords = async (isLoadMore = false) => {
  try {
    const { start, end } = getDateRange(selectedPeriod.value)

    const res = await getBalanceLog({
      start,
      end,
      type: 2, // 提现
      page: currentPage.value,
      size: pageSize,
    })

    // 更新累计提现金额（只在第一页时更新）
    if (currentPage.value === 1) {
      accumulatedWithdraw.value = res.total_withdraw?.toFixed(2) || '0.00'
    }

    // 转换记录格式
    const newRecords = (res.list || []).map((item: BalanceLogItem) => ({
      id: item.trade_no,
      orderNo: item.trade_no,
      amount: item.money.toFixed(2),
      method: item.channel || item.remark || 'Bank Transfer',
      time: item.time,
      status: item.status,
      statusText: getStatusText(item.status),
      statusClass: getStatusClass(item.status),
    }))

    // 如果是加载更多，追加数据；否则替换数据
    if (isLoadMore) {
      withdrawalRecords.value = [...withdrawalRecords.value, ...newRecords]
    } else {
      withdrawalRecords.value = newRecords
    }

    // 判断是否还有更多数据
    if (newRecords.length < pageSize || withdrawalRecords.value.length >= res.count) {
      finished.value = true
    } else {
      finished.value = false
    }
  } catch (error: any) {
    showToast(error.message || 'Failed to load records')
  } finally {
    loading.value = false
  }
}

// 瀑布流加载更多
const onLoad = async () => {
  if (isLoadingRecords.value || finished.value) {
    console.log('已经没有更多数据了')
    return
  }

  isLoadingRecords.value = true
  loading.value = true

  // 加载当前页数据
  await loadWithdrawRecords(currentPage.value > 1)

  // 加载完成后，页码+1，准备下次加载
  currentPage.value++
  isLoadingRecords.value = false
}

// 获取状态文本
const getStatusText = (status: number) => {
  switch (status) {
    case 1:
      return 'Pending'
    case 2:
      return 'Processing'
    case 3:
      return 'Success'
    case 4:
      return 'Failed'
    default:
      return 'Unknown'
  }
}

// 获取状态样式类
const getStatusClass = (status: number) => {
  switch (status) {
    case 1:
      return 'pending'
    case 2:
      return 'processing'
    case 3:
      return 'success'
    case 4:
      return 'failed'
    default:
      return ''
  }
}

// 获取时间段文本
const getPeriodText = (value: number) => {
  const option = periodOptions.find((o) => o.value === value)
  return option ? option.text : 'Today'
}

// 获取审计类型文本
const getAuditTypeText = (value: number) => {
  const option = auditTypeOptions.find((o) => o.value === value)
  return option ? option.text : 'All'
}

// 选择时间段（从下拉选择器）
const selectPeriodOption = (value: number) => {
  selectedPeriod.value = value
  showPeriodPicker.value = false
  // 重置分页
  currentPage.value = 1
  finished.value = false
  withdrawalRecords.value = []
  loading.value = false
  // 手动触发加载
  onLoad()
}

// 选择审计类型
const selectAuditType = (value: number) => {
  selectedAuditType.value = value
  showAuditPicker.value = false
  flowPage.value = 1
  flowFinished.value = false
  flowRequirements.value = []
  loadFlowRequirements()
}

// 选择时间段（从快捷按钮）
const selectPeriod = (value: number) => {
  selectedPeriod.value = value
  // 重置分页
  currentPage.value = 1
  finished.value = false
  withdrawalRecords.value = []
  loading.value = false
  // 手动触发加载
  onLoad()
}

// 复制订单号
const copyOrderNo = async (orderNo: string) => {
  try {
    await navigator.clipboard.writeText(orderNo)
    showToast('Copied!')
  } catch (error) {
    console.error('复制失败:', error)
    showToast('Copy failed')
  }
}

// 返回
const goBack = () => {
  router.back()
}

// 监听 tab 切换
watch(activeTab, (newTab) => {
  if (newTab === 'withdrawals' && withdrawalRecords.value.length === 0) {
    // 切换到提现记录 tab 且没有数据时，加载数据
    currentPage.value = 1
    finished.value = false
    withdrawalRecords.value = []
    loading.value = false
    onLoad()
  }
  if (newTab === 'audit') {
    if (flowRequirements.value.length === 0) {
      flowPage.value = 1
      flowFinished.value = false
      loadFlowRequirements()
    }
  }
})

const formatAmount = (value: number) => {
  if (value === undefined || value === null) return '0.00'
  return Number(value).toFixed(2)
}

const formatProgress = (value: number) => {
  const num = Number(value || 0)
  if (Number.isNaN(num)) return 0
  return Math.max(0, Math.min(100, num))
}

const getFlowTypeText = (type: number) => {
  switch (type) {
    case 1:
      return 'Deposit Flow'
    case 2:
      return 'Bonus Flow'
    case 3:
      return 'Rebate Flow'
    case 4:
      return 'Manual Add Flow'
    case 5:
      return 'Register Bonus'
    case 6:
      return 'Recharge Bonus'
    case 7:
      return 'Upgrade Bonus'
    case 8:
      return 'Daily Sign'
    case 9:
      return 'Lucky Spin'
    default:
      return 'Flow'
  }
}

const getFlowStatusText = (status: number) => {
  switch (status) {
    case 1:
      return 'In Progress'
    case 2:
      return 'Completed'
    case 3:
      return 'Expired'
    case 4:
      return 'Closed'
    default:
      return 'Unknown'
  }
}

const getFlowStatusClass = (status: number) => {
  switch (status) {
    case 1:
      return 'processing'
    case 2:
      return 'success'
    case 3:
      return 'failed'
    case 4:
      return 'pending'
    default:
      return ''
  }
}

const loadFlowRequirements = async (isLoadMore = false) => {
  try {
    flowLoading.value = true
    const res = await getUserFlowRequirements({
      status: selectedAuditType.value,
      page: flowPage.value,
      size: flowPageSize,
    })
    const list = res.list || []
    if (isLoadMore) {
      flowRequirements.value = [...flowRequirements.value, ...list]
    } else {
      flowRequirements.value = list
    }
    const totalRemaining = flowRequirements.value.reduce(
      (sum, item) => sum + Number(item.remaining_flow || 0),
      0,
    )
    auditAmount.value = totalRemaining.toFixed(2)

    if (list.length < flowPageSize) {
      flowFinished.value = true
    } else if (res.count && flowRequirements.value.length >= res.count) {
      flowFinished.value = true
    } else {
      flowFinished.value = false
    }
  } catch (error: any) {
    showToast(error.message || 'Failed to load flow requirements')
  } finally {
    flowLoading.value = false
  }
}

const onLoadFlow = async () => {
  if (isLoadingFlowRecords.value || flowFinished.value) return
  isLoadingFlowRecords.value = true
  await loadFlowRequirements(flowPage.value > 1)
  flowPage.value += 1
  isLoadingFlowRecords.value = false
}

const openFlowDetail = (item: UserFlowRequirement) => {
  sessionStorage.setItem('flow_requirement_detail', JSON.stringify(item))
  router.push('/withdraw/audit-detail')
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.history-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 50px;

  .top-bar {
    background: $gradient-purple;
    padding: 12px 16px;
    display: flex;
    align-items: center;
    gap: 16px;
    box-shadow: $shadow-md;

    .tabs {
      flex: 1;
      display: flex;
      gap: 24px;

      .tab {
        color: rgba(255, 255, 255, 0.6);
        font-size: 16px;
        font-weight: 600;
        padding-bottom: 8px;
        border-bottom: 3px solid transparent;
        cursor: pointer;
        transition: all 0.3s;
        white-space: nowrap;
        touch-action: manipulation;
        user-select: none;
        -webkit-tap-highlight-color: transparent;

        &.active {
          color: #fff;
          border-bottom-color: $secondary-color;
        }

        &:active {
          opacity: 0.7;
        }
      }
    }
  }

  .content {
    padding: 16px;
  }

  // 筛选区域
  .filter-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    background: #fff;
    padding: 12px 16px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    position: relative;

    .accumulated {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      flex-shrink: 0;
      min-width: 0;

      .label {
        color: #666;
        white-space: nowrap;
      }

      .amount {
        color: $success-color;
        font-weight: bold;
        font-size: 16px;
        white-space: nowrap;
      }
    }

    .custom-select {
      position: relative;
      display: flex;
      align-items: center;
      gap: 8px;
      background: #fff;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      padding: 10px 12px;
      cursor: pointer;
      touch-action: manipulation;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
      flex-shrink: 0;
      min-width: 120px;
      max-width: 200px;

      .select-value {
        color: $primary-color;
        font-size: 14px;
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .select-dropdown {
        position: absolute;
        top: calc(100% + 8px);
        right: 0;
        background: linear-gradient(
          135deg,
          rgba(85, 37, 131, 0.95) 0%,
          rgba(75, 30, 115, 0.95) 100%
        );
        border: 2px solid $secondary-color;
        border-radius: 12px;
        padding: 8px;
        min-width: 180px;
        box-shadow: 0 4px 16px rgba(85, 37, 131, 0.4);
        z-index: 100;

        .select-option {
          padding: 12px 16px;
          color: rgba(255, 255, 255, 0.8);
          font-size: 14px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          touch-action: manipulation;
          user-select: none;
          -webkit-tap-highlight-color: transparent;

          &.active {
            background: rgba(255, 215, 0, 0.2);
            color: $secondary-color;
            font-weight: 600;
          }

          &:active {
            background: rgba(255, 215, 0, 0.1);
          }
        }
      }
    }
  }

  // 时间段按钮
  .period-buttons {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 24px;

    .period-btn {
      background: #fff;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      padding: 12px;
      text-align: center;
      color: $primary-color;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      touch-action: manipulation;
      user-select: none;
      -webkit-tap-highlight-color: transparent;

      &.active {
        background: $gradient-purple;
        border: 2px solid $secondary-color;
        color: #fff;
        box-shadow:
          0 0 0 2px $secondary-color,
          0 4px 16px rgba(85, 37, 131, 0.4);
      }

      &:active {
        transform: scale(0.95);
      }
    }
  }

  // 审计头部
  .audit-header {
    margin-bottom: 24px;

    .audit-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      background: #fff;
      padding: 16px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      position: relative;

      .audit-amount-inline {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        flex-shrink: 0;
        min-width: 0;

        .label {
          color: #666;
          white-space: nowrap;
        }

        .amount {
          color: $secondary-color;
          font-weight: bold;
          font-size: 18px;
          white-space: nowrap;
        }
      }

      .custom-select {
        position: relative;
        display: flex;
        align-items: center;
        gap: 8px;
        background: #fff;
        border: 2px solid #e5e7eb;
        border-radius: 8px;
        padding: 10px 12px;
        cursor: pointer;
        touch-action: manipulation;
        user-select: none;
        -webkit-tap-highlight-color: transparent;
        flex-shrink: 0;
        min-width: 120px;
        max-width: 200px;

        .select-value {
          color: $primary-color;
          font-size: 14px;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .select-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          background: linear-gradient(
            135deg,
            rgba(85, 37, 131, 0.95) 0%,
            rgba(75, 30, 115, 0.95) 100%
          );
          border: 2px solid $secondary-color;
          border-radius: 12px;
          padding: 8px;
          min-width: 200px;
          box-shadow: 0 4px 16px rgba(85, 37, 131, 0.4);
          z-index: 100;

          .select-option {
            padding: 12px 16px;
            color: rgba(255, 255, 255, 0.8);
            font-size: 14px;
            text-align: center;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
            touch-action: manipulation;
            user-select: none;
            -webkit-tap-highlight-color: transparent;

            &.active {
              background: rgba(255, 215, 0, 0.2);
              color: $secondary-color;
              font-weight: 600;
            }

            &:active {
              background: rgba(255, 215, 0, 0.1);
            }
          }
        }
      }
    }
  }

  // 空状态
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 20px;
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

    .van-icon {
      opacity: 0.3;
    }

    .empty-text {
      color: #999;
      font-size: 16px;
      margin-top: 16px;
    }
  }

  // 记录列表
  .record-list {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .record-item {
      background: #fff;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      padding: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      display: flex;
      flex-direction: column;
      gap: 10px;

      // 金额行 - Amount 和金额在一行
      .amount-row {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .amount-label {
          color: #666;
          font-size: 14px;
          font-weight: 500;
        }

        .amount-value {
          color: $primary-color;
          font-size: 20px;
          font-weight: bold;
        }
      }

      // 时间行
      .time-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 10px;
        border-bottom: 1px solid #f0f0f0;

        .time-label {
          color: #666;
          font-size: 13px;
        }

        .time-value {
          color: #999;
          font-size: 13px;
        }
      }

      // 订单号 + 复制 + 状态行
      .order-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;

        .order-info {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
          min-width: 0;

          .order-no {
            color: $primary-color;
            font-size: 11px;
            font-weight: 600;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .copy-btn {
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 30px;
            height: 30px;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s;
            background: transparent;

            svg {
              display: block;
            }

            &:active {
              background: rgba(85, 37, 131, 0.1);
              transform: scale(0.95);
            }

            &:hover {
              background: rgba(85, 37, 131, 0.05);
            }
          }
        }

        .status {
          padding: 4px 12px;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 600;
          flex-shrink: 0;

          &.pending {
            background: rgba(255, 151, 106, 0.2);
            color: $warning-color;
          }

          &.processing {
            background: rgba(85, 37, 131, 0.2);
            color: $primary-color;
          }

          &.success {
            background: rgba(7, 193, 96, 0.2);
            color: $success-color;
          }

          &.failed {
            background: rgba(238, 10, 36, 0.2);
            color: $danger-color;
          }
        }
      }

      .record-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        padding-bottom: 12px;
        border-bottom: 2px solid #f5f5f5;

        .type-badge {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          background: rgba(85, 37, 131, 0.2);
          color: $primary-color;
        }

        .time {
          color: #999;
          font-size: 12px;
        }
      }

      .record-body {
        display: flex;
        flex-direction: column;
        gap: 8px;

        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 14px;

          .label {
            color: #666;
          }

          .value {
            color: #333;
            font-weight: 500;
          }
        }

        .info-row.small {
          font-size: 12px;

          &.order-row {
            align-items: center;
            gap: 6px;
          }

          .order-no {
            max-width: 230px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            color: #666;
            flex: 1;
          }

          .copy-btn {
            flex-shrink: 0;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 26px;
            height: 26px;
            border-radius: 6px;
            border: none;
            background: transparent;
            padding: 0;
            cursor: pointer;

            &:active {
              background: rgba(85, 37, 131, 0.1);
              transform: scale(0.95);
            }
          }
        }

        .progress-row {
          display: flex;
          align-items: center;
          gap: 8px;

          :deep(.van-progress) {
            flex: 1;
          }

          .progress-text {
            font-size: 12px;
            color: #666;
            width: 60px;
            text-align: right;
          }
        }
      }
    }

    .flow-item {
      .record-header {
        .status {
          padding: 4px 10px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 600;

          &.processing {
            background: rgba(255, 193, 7, 0.2);
            color: #f59e0b;
          }

          &.success {
            background: rgba(7, 193, 96, 0.2);
            color: $success-color;
          }

          &.failed {
            background: rgba(238, 10, 36, 0.2);
            color: $danger-color;
          }

          &.pending {
            background: rgba(148, 163, 184, 0.2);
            color: #64748b;
          }
        }
      }
    }
  }

}
</style>

<template>
  <div class="report-page">
    <!-- 顶部导航栏 -->
    <div class="top-bar">
      <van-icon name="arrow-left" size="24" color="#fff" @click="goBack" />
      <span class="title">Report</span>
      <div class="placeholder"></div>
    </div>

    <!-- 标签页 -->
    <van-tabs
      v-model:active="activeTab"
      class="report-tabs"
      color="#FDB927"
      title-active-color="#FDB927"
      scrollable
      swipeable
    >
      <van-tab title="Deposit" name="deposit">
        <div class="content">
          <!-- 时间筛选和累计充值 -->
          <div class="filter-section">
            <div class="accumulated">
              <span class="label">Total Deposit:</span>
              <span class="amount">₱{{ totalDeposit.toFixed(2) }}</span>
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

          <!-- 充值记录列表 -->
          <van-list
            v-model:loading="depositLoading"
            :finished="depositFinished"
            :immediate-check="false"
            finished-text="No more records"
            @load="onDepositLoad"
          >
            <div v-if="depositList.length === 0 && !depositLoading" class="empty-state">
              <van-icon name="search" size="80" color="#4b5563" />
              <div class="empty-text">No Record</div>
            </div>

            <div class="record-list">
              <div v-for="record in depositList" :key="record.id" class="record-item">
                <!-- 金额 -->
                <div class="amount-row">
                  <span class="amount-label">Amount:</span>
                  <span class="amount-value">₱{{ record.amount.toFixed(2) }}</span>
                </div>

                <!-- 时间 -->
                <div class="time-row">
                  <span class="time-label">Time:</span>
                  <span class="time-value">{{ record.date }}</span>
                </div>

                <!-- 订单号 + 复制按钮 + 状态 -->
                <div class="order-row">
                  <div class="order-info">
                    <span class="order-no">{{ record.tradeNo }}</span>
                    <div class="copy-btn" @click="copyOrderNo(record.tradeNo)">
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
      </van-tab>

      <van-tab title="Withdraw" name="withdraw">
        <div class="content">
          <!-- 时间筛选和累计提现 -->
          <div class="filter-section">
            <div class="accumulated">
              <span class="label">Total Withdraw:</span>
              <span class="amount">₱{{ totalWithdraw.toFixed(2) }}</span>
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

          <!-- 提现记录列表 -->
          <van-list
            v-model:loading="withdrawLoading"
            :finished="withdrawFinished"
            :immediate-check="false"
            finished-text="No more records"
            @load="onWithdrawLoad"
          >
            <div v-if="withdrawList.length === 0 && !withdrawLoading" class="empty-state">
              <van-icon name="search" size="80" color="#4b5563" />
              <div class="empty-text">No Record</div>
            </div>

            <div class="record-list">
              <div v-for="record in withdrawList" :key="record.id" class="record-item">
                <!-- 金额 -->
                <div class="amount-row">
                  <span class="amount-label">Amount:</span>
                  <span class="amount-value">₱{{ record.amount.toFixed(2) }}</span>
                </div>

                <!-- 时间 -->
                <div class="time-row">
                  <span class="time-label">Time:</span>
                  <span class="time-value">{{ record.date }}</span>
                </div>

                <!-- 订单号 + 复制按钮 + 状态 -->
                <div class="order-row">
                  <div class="order-info">
                    <span class="order-no">{{ record.tradeNo }}</span>
                    <div class="copy-btn" @click="copyOrderNo(record.tradeNo)">
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
      </van-tab>

      <van-tab title="Bonus" name="bonus">
        <div class="content">
          <!-- 时间筛选和累计奖金 -->
          <div class="filter-section">
            <div class="accumulated">
              <span class="label">Total Bonus:</span>
              <span class="amount">₱{{ totalBonusAmount.toFixed(2) }}</span>
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

          <!-- 奖金记录列表 -->
          <van-list
            v-model:loading="bonusLoading"
            :finished="bonusFinished"
            :immediate-check="false"
            finished-text="No more records"
            @load="onBonusLoad"
          >
            <div v-if="bonusList.length === 0 && !bonusLoading" class="empty-state">
              <van-icon name="search" size="80" color="#4b5563" />
              <div class="empty-text">No Record</div>
            </div>

            <div class="record-list">
              <div v-for="record in bonusList" :key="record.id" class="record-item">
                <!-- 金额 -->
                <div class="amount-row">
                  <span class="amount-label">Amount:</span>
                  <span class="amount-value">₱{{ record.amount.toFixed(2) }}</span>
                </div>

                <!-- 时间 -->
                <div class="time-row">
                  <span class="time-label">Time:</span>
                  <span class="time-value">{{ record.date }}</span>
                </div>

                <!-- 订单号 + 复制按钮 + 状态 -->
                <div class="order-row">
                  <div class="order-info">
                    <span class="order-no">{{ record.tradeNo }}</span>
                    <div class="copy-btn" @click="copyOrderNo(record.tradeNo)">
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
      </van-tab>

      <van-tab title="Rebate" name="rebate">
        <div class="content">
          <!-- 时间筛选和累计返水 -->
          <div class="filter-section">
            <div class="accumulated">
              <span class="label">Total Rebate:</span>
              <span class="amount">₱{{ totalRebateAmount.toFixed(2) }}</span>
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

          <!-- 返水记录列表 -->
          <van-list
            v-model:loading="rebateLoading"
            :finished="rebateFinished"
            :immediate-check="false"
            finished-text="No more records"
            @load="onRebateLoad"
          >
            <div v-if="rebateList.length === 0 && !rebateLoading" class="empty-state">
              <van-icon name="search" size="80" color="#4b5563" />
              <div class="empty-text">No Record</div>
            </div>

            <div class="record-list">
              <div v-for="record in rebateList" :key="record.id" class="record-item">
                <!-- 金额 -->
                <div class="amount-row">
                  <span class="amount-label">Amount:</span>
                  <span class="amount-value">₱{{ record.amount.toFixed(2) }}</span>
                </div>

                <!-- 时间 -->
                <div class="time-row">
                  <span class="time-label">Time:</span>
                  <span class="time-value">{{ record.date }}</span>
                </div>

                <!-- 订单号 + 复制按钮 + 状态 -->
                <div class="order-row">
                  <div class="order-info">
                    <span class="order-no">{{ record.tradeNo }}</span>
                    <div class="copy-btn" @click="copyOrderNo(record.tradeNo)">
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
      </van-tab>

      <van-tab title="Bets" name="bet">
        <div class="content">
          <!-- 时间筛选 -->
          <div class="filter-section">
            <div class="accumulated">
              <span class="label">Total Bets:</span>
              <span class="amount">{{ betList.length }}</span>
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

          <!-- 投注记录列表 -->
          <van-list
            v-model:loading="betLoading"
            :finished="betFinished"
            :immediate-check="false"
            finished-text="No more records"
            @load="onBetLoad"
          >
            <div v-if="betList.length === 0 && !betLoading" class="empty-state">
              <van-icon name="search" size="80" color="#4b5563" />
              <div class="empty-text">No Record</div>
            </div>

            <div class="record-list">
              <div v-for="record in betList" :key="record.id" class="record-item bet-record">
                <!-- 游戏名称和状态 -->
                <div class="game-name-row">
                  <span class="game-name">{{ record.gameName }}</span>
                  <span class="bet-status" :class="record.statusClass">{{
                    record.statusText
                  }}</span>
                </div>

                <!-- 有效投注和赢取金额 -->
                <div class="bet-amounts-row">
                  <div class="valid-bet">
                    <span class="label">Valid Bet:</span>
                    <span class="value">₱{{ record.validAmount.toFixed(2) }}</span>
                  </div>
                  <div class="win-amount">
                    <span class="label">Win Amount:</span>
                    <span class="value">₱{{ record.winAmount.toFixed(2) }}</span>
                  </div>
                </div>

                <!-- 净盈亏 -->
                <div class="net-amount-row">
                  <span class="net-label">Net Amount:</span>
                  <span class="net-value" :class="record.netClass">
                    {{ record.netAmount < 0 ? '-' : '+' }}₱{{
                      Math.abs(record.netAmount).toFixed(2)
                    }}
                  </span>
                </div>

                <!-- 时间和订单号 -->
                <div class="bet-footer">
                  <span class="bet-time">{{ record.betTime }}</span>
                  <div class="order-info">
                    <span class="order-no">{{ record.orderNo }}</span>
                    <div class="copy-btn" @click="copyOrderNo(record.orderNo)">
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
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </van-list>
        </div>
      </van-tab>
    </van-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { getBalanceLog, type BalanceLogItem } from '@/api/modules/balance'
import { gameApi, type BetHistoryItem } from '@/api/modules/game'

const router = useRouter()

const goBack = () => {
  router.back()
}

const activeTab = ref('deposit')

const showPeriodPicker = ref(false)
const selectedPeriod = ref(0)

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

// 充值记录
const depositList = ref<any[]>([])
const depositLoading = ref(false)
const depositFinished = ref(false)
const depositPage = ref(1)
const pageSize = 5

// 提现记录
const withdrawList = ref<any[]>([])
const withdrawLoading = ref(false)
const withdrawFinished = ref(false)
const withdrawPage = ref(1)

// 投注记录
const betList = ref<any[]>([])
const betLoading = ref(false)
const betFinished = ref(false)
const betPage = ref(1)

// 奖金记录
const bonusList = ref<any[]>([])
const bonusLoading = ref(false)
const bonusFinished = ref(false)
const bonusPage = ref(1)

// 返水记录
const rebateList = ref<any[]>([])
const rebateLoading = ref(false)
const rebateFinished = ref(false)
const rebatePage = ref(1)

// 统计数据
const totalDeposit = ref(0)
const totalWithdraw = ref(0)
const totalBonus = ref(0)
const totalBonusAmount = ref(0)
const totalRebateAmount = ref(0)

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

// 获取投注状态文本
const getBetStatusText = (status: number) => {
  switch (status) {
    case 1:
      return 'Settled'
    case 0:
      return 'Pending'
    default:
      return 'Unknown'
  }
}

// 获取投注状态样式类
const getBetStatusClass = (status: number) => {
  switch (status) {
    case 1:
      return 'settled'
    case 0:
      return 'pending'
    default:
      return ''
  }
}

// 加载充值记录
const loadDepositRecords = async (isLoadMore = false) => {
  depositLoading.value = true
  try {
    const { start, end } = getDateRange(selectedPeriod.value)

    const res = await getBalanceLog({
      start,
      end,
      type: 1, // 充值
      page: depositPage.value,
      size: pageSize,
    })

    // 更新统计数据（只在第一页时更新）
    if (depositPage.value === 1) {
      totalDeposit.value = res.total_recharge || 0
      totalWithdraw.value = res.total_withdraw || 0
      totalBonus.value = res.total_bonus || 0
    }

    // 转换记录格式
    const newRecords = (res.list || []).map((item: BalanceLogItem) => ({
      id: item.trade_no,
      tradeNo: item.trade_no,
      amount: item.money,
      date: item.time,
      status: item.status,
      statusText: getStatusText(item.status),
      statusClass: getStatusClass(item.status),
    }))

    // 如果是加载更多，追加数据；否则替换数据
    if (isLoadMore) {
      depositList.value = [...depositList.value, ...newRecords]
    } else {
      depositList.value = newRecords
    }

    // 判断是否还有更多数据
    if (newRecords.length < pageSize || depositList.value.length >= res.count) {
      depositFinished.value = true
    } else {
      depositFinished.value = false
    }
  } catch (error: any) {
    showToast(error.message || 'Failed to load deposit records')
  } finally {
    depositLoading.value = false
  }
}

// 加载提现记录
const loadWithdrawRecords = async (isLoadMore = false) => {
  withdrawLoading.value = true
  try {
    const { start, end } = getDateRange(selectedPeriod.value)

    const res = await getBalanceLog({
      start,
      end,
      type: 2, // 提现
      page: withdrawPage.value,
      size: pageSize,
    })

    // 更新统计数据（只在第一页时更新）
    if (withdrawPage.value === 1) {
      totalDeposit.value = res.total_recharge || 0
      totalWithdraw.value = res.total_withdraw || 0
      totalBonus.value = res.total_bonus || 0
    }

    // 转换记录格式
    const newRecords = (res.list || []).map((item: BalanceLogItem) => ({
      id: item.trade_no,
      tradeNo: item.trade_no,
      amount: item.money,
      date: item.time,
      status: item.status,
      statusText: getStatusText(item.status),
      statusClass: getStatusClass(item.status),
    }))

    // 如果是加载更多，追加数据；否则替换数据
    if (isLoadMore) {
      withdrawList.value = [...withdrawList.value, ...newRecords]
    } else {
      withdrawList.value = newRecords
    }

    // 判断是否还有更多数据
    if (newRecords.length < pageSize || withdrawList.value.length >= res.count) {
      withdrawFinished.value = true
    } else {
      withdrawFinished.value = false
    }
  } catch (error: any) {
    showToast(error.message || 'Failed to load withdraw records')
  } finally {
    withdrawLoading.value = false
  }
}

// 瀑布流加载更多 - 充值
const onDepositLoad = async () => {
  if (depositFinished.value) {
    return
  }

  // 加载当前页数据
  await loadDepositRecords(depositPage.value > 1)

  // 加载完成后，页码+1，准备下次加载
  depositPage.value++
}

// 瀑布流加载更多 - 提现
const onWithdrawLoad = async () => {
  if (withdrawFinished.value) {
    return
  }

  // 加载当前页数据
  await loadWithdrawRecords(withdrawPage.value > 1)

  // 加载完成后，页码+1，准备下次加载
  withdrawPage.value++
}

// 加载投注记录
const loadBetRecords = async (isLoadMore = false) => {
  betLoading.value = true
  try {
    const { start, end } = getDateRange(selectedPeriod.value)

    const res = await gameApi.getBetHistory({
      start_time: start,
      end_time: end,
      page: betPage.value,
      size: pageSize,
    })

    // 转换记录格式
    const newRecords = (res.list || []).map((item: BetHistoryItem) => {
      const netAmount = item.net_amount
      return {
        id: item.order_no,
        gameName: item.game_name,
        validAmount: item.valid_amount,
        winAmount: item.win_amount,
        netAmount: netAmount,
        betTime: item.bet_time,
        orderNo: item.order_no,
        status: item.status,
        statusText: getBetStatusText(item.status),
        statusClass: getBetStatusClass(item.status),
        winClass: item.win_amount > 0 ? 'positive' : 'neutral',
        netClass: netAmount > 0 ? 'positive' : netAmount < 0 ? 'negative' : 'neutral',
      }
    })

    // 如果是加载更多，追加数据；否则替换数据
    if (isLoadMore) {
      betList.value = [...betList.value, ...newRecords]
    } else {
      betList.value = newRecords
    }

    // 判断是否还有更多数据
    if (newRecords.length < pageSize || betList.value.length >= res.total) {
      betFinished.value = true
    } else {
      betFinished.value = false
    }
  } catch (error: any) {
    showToast(error.message || 'Failed to load bet records')
  } finally {
    betLoading.value = false
  }
}

// 瀑布流加载更多 - 投注
const onBetLoad = async () => {
  if (betFinished.value) {
    return
  }

  // 加载当前页数据
  await loadBetRecords(betPage.value > 1)

  // 加载完成后，页码+1，准备下次加载
  betPage.value++
}

// 加载奖金记录
const loadBonusRecords = async (isLoadMore = false) => {
  bonusLoading.value = true
  try {
    const { start, end } = getDateRange(selectedPeriod.value)

    const res = await getBalanceLog({
      start,
      end,
      type: 3, // 奖金
      page: bonusPage.value,
      size: pageSize,
    })

    // 更新统计数据（只在第一页时更新）
    if (bonusPage.value === 1) {
      totalBonusAmount.value = res.total_bonus || 0
    }

    // 转换记录格式
    const newRecords = (res.list || []).map((item: BalanceLogItem) => ({
      id: item.trade_no,
      tradeNo: item.trade_no,
      amount: item.money,
      date: item.time,
      status: item.status,
      statusText: getStatusText(item.status),
      statusClass: getStatusClass(item.status),
    }))

    // 如果是加载更多，追加数据；否则替换数据
    if (isLoadMore) {
      bonusList.value = [...bonusList.value, ...newRecords]
    } else {
      bonusList.value = newRecords
    }

    // 判断是否还有更多数据
    if (newRecords.length < pageSize || bonusList.value.length >= res.count) {
      bonusFinished.value = true
    } else {
      bonusFinished.value = false
    }
  } catch (error: any) {
    showToast(error.message || 'Failed to load bonus records')
  } finally {
    bonusLoading.value = false
  }
}

// 瀑布流加载更多 - 奖金
const onBonusLoad = async () => {
  if (bonusFinished.value) {
    return
  }

  // 加载当前页数据
  await loadBonusRecords(bonusPage.value > 1)

  // 加载完成后，页码+1，准备下次加载
  bonusPage.value++
}

// 加载返水记录
const loadRebateRecords = async (isLoadMore = false) => {
  rebateLoading.value = true
  try {
    const { start, end } = getDateRange(selectedPeriod.value)

    const res = await getBalanceLog({
      start,
      end,
      type: 4, // 返水
      page: rebatePage.value,
      size: pageSize,
    })

    // 更新统计数据（只在第一页时更新）
    if (rebatePage.value === 1) {
      totalRebateAmount.value = res.total_rebate || 0
    }

    // 转换记录格式
    const newRecords = (res.list || []).map((item: BalanceLogItem) => ({
      id: item.trade_no,
      tradeNo: item.trade_no,
      amount: item.money,
      date: item.time,
      status: item.status,
      statusText: getStatusText(item.status),
      statusClass: getStatusClass(item.status),
    }))

    // 如果是加载更多，追加数据；否则替换数据
    if (isLoadMore) {
      rebateList.value = [...rebateList.value, ...newRecords]
    } else {
      rebateList.value = newRecords
    }

    // 判断是否还有更多数据
    if (newRecords.length < pageSize || rebateList.value.length >= res.count) {
      rebateFinished.value = true
    } else {
      rebateFinished.value = false
    }
  } catch (error: any) {
    showToast(error.message || 'Failed to load rebate records')
  } finally {
    rebateLoading.value = false
  }
}

// 瀑布流加载更多 - 返水
const onRebateLoad = async () => {
  if (rebateFinished.value) {
    return
  }

  // 加载当前页数据
  await loadRebateRecords(rebatePage.value > 1)

  // 加载完成后，页码+1，准备下次加载
  rebatePage.value++
}

// 获取时间段文本
const getPeriodText = (value: number) => {
  const option = periodOptions.find((o) => o.value === value)
  return option ? option.text : 'Today'
}

// 选择时间段（从下拉选择器）
const selectPeriodOption = (value: number) => {
  selectedPeriod.value = value
  showPeriodPicker.value = false
  // 重置分页并重新加载当前标签页的数据
  if (activeTab.value === 'deposit') {
    depositPage.value = 1
    depositFinished.value = false
    depositList.value = []
    depositLoading.value = false
    onDepositLoad()
  } else if (activeTab.value === 'withdraw') {
    withdrawPage.value = 1
    withdrawFinished.value = false
    withdrawList.value = []
    withdrawLoading.value = false
    onWithdrawLoad()
  } else if (activeTab.value === 'bonus') {
    bonusPage.value = 1
    bonusFinished.value = false
    bonusList.value = []
    bonusLoading.value = false
    onBonusLoad()
  } else if (activeTab.value === 'rebate') {
    rebatePage.value = 1
    rebateFinished.value = false
    rebateList.value = []
    rebateLoading.value = false
    onRebateLoad()
  } else if (activeTab.value === 'bet') {
    betPage.value = 1
    betFinished.value = false
    betList.value = []
    betLoading.value = false
    onBetLoad()
  }
}

// 选择时间段（从快捷按钮）
const selectPeriod = (value: number) => {
  selectedPeriod.value = value
  // 重置分页并重新加载当前标签页的数据
  if (activeTab.value === 'deposit') {
    depositPage.value = 1
    depositFinished.value = false
    depositList.value = []
    depositLoading.value = false
    onDepositLoad()
  } else if (activeTab.value === 'withdraw') {
    withdrawPage.value = 1
    withdrawFinished.value = false
    withdrawList.value = []
    withdrawLoading.value = false
    onWithdrawLoad()
  } else if (activeTab.value === 'bonus') {
    bonusPage.value = 1
    bonusFinished.value = false
    bonusList.value = []
    bonusLoading.value = false
    onBonusLoad()
  } else if (activeTab.value === 'rebate') {
    rebatePage.value = 1
    rebateFinished.value = false
    rebateList.value = []
    rebateLoading.value = false
    onRebateLoad()
  } else if (activeTab.value === 'bet') {
    betPage.value = 1
    betFinished.value = false
    betList.value = []
    betLoading.value = false
    onBetLoad()
  }
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

// 监听标签页切换
watch(activeTab, (newTab) => {
  if (newTab === 'deposit' && depositList.value.length === 0) {
    onDepositLoad()
  } else if (newTab === 'withdraw' && withdrawList.value.length === 0) {
    onWithdrawLoad()
  } else if (newTab === 'bonus' && bonusList.value.length === 0) {
    onBonusLoad()
  } else if (newTab === 'rebate' && rebateList.value.length === 0) {
    onRebateLoad()
  } else if (newTab === 'bet' && betList.value.length === 0) {
    onBetLoad()
  }
})

// 页面加载时获取数据
onMounted(() => {
  onDepositLoad()
})
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.report-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 70px;

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
      transition: transform 0.2s;

      &:active {
        transform: scale(0.9);
      }
    }
  }

  .report-tabs {
    :deep(.van-tabs__wrap) {
      background: linear-gradient(135deg, #552583 0%, #7b3fa8 100%);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    :deep(.van-tabs__nav) {
      background: transparent;
    }

    :deep(.van-tab) {
      color: rgba(255, 255, 255, 0.6);
      font-size: 15px;
      font-weight: 500;

      &.van-tab--active {
        color: #fdb927;
        font-weight: 600;
      }
    }

    :deep(.van-tabs__line) {
      background: #fdb927;
      height: 3px;
      border-radius: 2px;
    }

    :deep(.van-tab__panel) {
      background: transparent;
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
    gap: 10px;

    .record-item {
      background: #fff;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      padding: 10px 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      display: flex;
      flex-direction: column;
      gap: 6px;

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
            background: rgba(138, 43, 226, 0.2);
            color: #8a2be2;
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
    }
  }

  // 投注记录特殊样式
  .bet-record {
    .game-name-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;

      .game-name {
        font-size: 14px;
        font-weight: 600;
        color: #333;
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        padding-right: 8px;
      }

      .bet-status {
        padding: 2px 8px;
        border-radius: 8px;
        font-size: 10px;
        font-weight: 600;
        flex-shrink: 0;

        &.settled {
          background: rgba(7, 193, 96, 0.2);
          color: $success-color;
        }

        &.pending {
          background: rgba(255, 151, 106, 0.2);
          color: $warning-color;
        }
      }
    }

    .bet-amounts-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
      padding-bottom: 6px;
      border-bottom: 1px solid #f0f0f0;

      .valid-bet,
      .win-amount {
        display: flex;
        flex-direction: column;
        gap: 2px;

        .label {
          color: #999;
          font-size: 10px;
        }

        .value {
          color: $primary-color;
          font-size: 13px;
          font-weight: 600;
        }
      }

      .win-amount {
        text-align: right;
      }
    }

    .net-amount-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 3px 0;
      margin-bottom: 4px;

      .net-label {
        color: #999;
        font-size: 10px;
      }

      .net-value {
        font-size: 14px;
        font-weight: bold;

        &.positive {
          color: $success-color;
        }

        &.negative {
          color: $danger-color;
        }

        &.neutral {
          color: #666;
        }
      }
    }

    .bet-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
      padding-top: 4px;
      border-top: 1px solid #f0f0f0;

      .bet-time {
        color: #999;
        font-size: 10px;
        flex-shrink: 0;
      }

      .order-info {
        display: flex;
        align-items: center;
        gap: 6px;
        flex: 1;
        min-width: 0;
        justify-content: flex-end;

        .order-no {
          color: $primary-color;
          font-size: 9px;
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
          width: 24px;
          height: 24px;
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
    }
  }

  .empty-tab {
    min-height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 60px 0;
    background: #fff;

    :deep(.van-empty) {
      background: transparent;

      .van-empty__image {
        width: 120px;
        height: 120px;
      }

      .van-empty__description {
        color: #999;
        font-size: 14px;
      }
    }
  }
}
</style>

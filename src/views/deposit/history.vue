<template>
  <div class="history-page">
    <!-- 顶部导航栏 -->
    <div class="top-bar">
      <van-icon name="arrow-left" size="24" color="#fff" @click="goBack" />
      <span class="title">Deposit Record</span>
      <div class="placeholder"></div>
    </div>

    <div class="content">
      <!-- 时间筛选和累计充值 -->
      <div class="filter-section">
        <div class="accumulated">
          <span class="label">Total Deposit:</span>
          <span class="amount">{{ accumulatedDeposit }}</span>
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
        <div v-if="depositRecords.length === 0 && !loading" class="empty-state">
          <van-icon name="search" size="80" color="#4b5563" />
          <div class="empty-text">No Record</div>
        </div>

        <div class="record-list">
          <div v-for="record in depositRecords" :key="record.id" class="record-item">
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { getBalanceLog, type BalanceLogItem } from '@/api/modules/balance'

const router = useRouter()

// 下拉选择器显示状态
const showPeriodPicker = ref(false)

// 充值记录相关
const selectedPeriod = ref(0)
const accumulatedDeposit = ref('0')
const loading = ref(false)
const finished = ref(false)
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

const depositRecords = ref<any[]>([])

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

// 加载充值记录
const loadDepositRecords = async (isLoadMore = false) => {
  loading.value = true
  try {
    const { start, end } = getDateRange(selectedPeriod.value)

    const res = await getBalanceLog({
      start,
      end,
      type: 1, // 充值
      page: currentPage.value,
      size: pageSize,
    })

    // 更新累计充值金额（只在第一页时更新）
    if (currentPage.value === 1) {
      accumulatedDeposit.value = res.total_recharge?.toFixed(2) || '0.00'
    }

    // 转换记录格式
    const newRecords = (res.list || []).map((item: BalanceLogItem) => ({
      id: item.trade_no,
      orderNo: item.trade_no,
      amount: item.money.toFixed(2),
      method: item.remark || 'Online Payment',
      time: item.time,
      status: item.status,
      statusText: getStatusText(item.status),
      statusClass: getStatusClass(item.status),
    }))

    // 如果是加载更多，追加数据；否则替换数据
    if (isLoadMore) {
      depositRecords.value = [...depositRecords.value, ...newRecords]
    } else {
      depositRecords.value = newRecords
    }

    // 判断是否还有更多数据
    if (newRecords.length < pageSize || depositRecords.value.length >= res.count) {
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
  if (finished.value) {
    console.log('已经没有更多数据了')
    return
  }

  // 加载当前页数据
  await loadDepositRecords(currentPage.value > 1)

  // 加载完成后，页码+1，准备下次加载
  currentPage.value++
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

// 选择时间段（从下拉选择器）
const selectPeriodOption = (value: number) => {
  selectedPeriod.value = value
  showPeriodPicker.value = false
  // 重置分页
  currentPage.value = 1
  finished.value = false
  depositRecords.value = []
  loading.value = false
  // 手动触发加载
  onLoad()
}

// 选择时间段（从快捷按钮）
const selectPeriod = (value: number) => {
  selectedPeriod.value = value
  // 重置分页
  currentPage.value = 1
  finished.value = false
  depositRecords.value = []
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

// 页面加载时获取数据
onMounted(() => {
  // 手动触发第一次加载
  onLoad()
})
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
    justify-content: space-between;
    box-shadow: $shadow-md;

    .title {
      color: #fff;
      font-size: 20px;
      font-weight: bold;
    }

    .placeholder {
      width: 24px;
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
}
</style>

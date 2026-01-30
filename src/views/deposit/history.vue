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
          <span class="label">Accumulated Deposit:</span>
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
      <div v-if="depositRecords.length === 0" class="empty-state">
        <van-icon name="search" size="80" color="#4b5563" />
        <div class="empty-text">No Record</div>
      </div>

      <div v-else class="record-list">
        <div v-for="record in depositRecords" :key="record.id" class="record-item">
          <div class="record-header">
            <span class="order-no">{{ record.orderNo }}</span>
            <span class="status" :class="record.statusClass">{{ record.statusText }}</span>
          </div>
          <div class="record-body">
            <div class="info-row">
              <span class="label">Amount:</span>
              <span class="value">₱{{ record.amount }}</span>
            </div>
            <div class="info-row">
              <span class="label">Method:</span>
              <span class="value">{{ record.method }}</span>
            </div>
            <div class="info-row">
              <span class="label">Time:</span>
              <span class="value">{{ record.time }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 下拉选择器显示状态
const showPeriodPicker = ref(false)

// 充值记录相关
const selectedPeriod = ref(0)
const accumulatedDeposit = ref('0')

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

// 获取时间段文本
const getPeriodText = (value: number) => {
  const option = periodOptions.find((o) => o.value === value)
  return option ? option.text : 'Today'
}

// 选择时间段（从下拉选择器）
const selectPeriodOption = (value: number) => {
  selectedPeriod.value = value
  showPeriodPicker.value = false
  // TODO: 调用 API 获取对应时间段的记录
}

// 选择时间段（从快捷按钮）
const selectPeriod = (value: number) => {
  selectedPeriod.value = value
  // TODO: 调用 API 获取对应时间段的记录
}

// 返回
const goBack = () => {
  router.back()
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

      .record-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        padding-bottom: 12px;
        border-bottom: 2px solid #f5f5f5;

        .order-no {
          color: $primary-color;
          font-size: 14px;
          font-weight: 600;
        }

        .status {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;

          &.pending {
            background: rgba(255, 151, 106, 0.2);
            color: $warning-color;
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
      }
    }
  }
}
</style>

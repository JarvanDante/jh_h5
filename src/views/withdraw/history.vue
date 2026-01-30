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
          <span class="label">Accumulated Withdraw:</span>
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
      <div v-if="withdrawalRecords.length === 0" class="empty-state">
        <van-icon name="search" size="80" color="#4b5563" />
        <div class="empty-text">No Record</div>
      </div>

      <div v-else class="record-list">
        <div v-for="record in withdrawalRecords" :key="record.id" class="record-item">
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
      <div v-if="auditRecords.length === 0" class="empty-state">
        <van-icon name="search" size="80" color="#4b5563" />
        <div class="empty-text">No Record</div>
      </div>

      <div v-else class="record-list">
        <div v-for="record in auditRecords" :key="record.id" class="record-item">
          <div class="record-header">
            <span class="type-badge" :class="record.typeClass">{{ record.type }}</span>
            <span class="time">{{ record.time }}</span>
          </div>
          <div class="record-body">
            <div class="info-row">
              <span class="label">Amount:</span>
              <span class="value">₱{{ record.amount }}</span>
            </div>
            <div class="info-row">
              <span class="label">Description:</span>
              <span class="value">{{ record.description }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 当前激活的 tab
const activeTab = ref<'withdrawals' | 'audit'>('withdrawals')

// 组件挂载时检查 URL 参数
onMounted(() => {
  const tab = route.query.tab
  if (tab === 'audit') {
    activeTab.value = 'audit'
  }
})

// 下拉选择器显示状态
const showPeriodPicker = ref(false)
const showAuditPicker = ref(false)

// 提现记录相关
const selectedPeriod = ref(0)
const accumulatedWithdraw = ref('0')

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

// 审计日志相关
const auditAmount = ref('0.00')
const selectedAuditType = ref('all')

const auditTypeOptions = [
  { text: 'All', value: 'all' },
  { text: 'Member Deposit', value: 'deposit' },
  { text: 'Event', value: 'event' },
  { text: 'System audit', value: 'system' },
]

const auditRecords = ref<any[]>([])

// 获取时间段文本
const getPeriodText = (value: number) => {
  const option = periodOptions.find((o) => o.value === value)
  return option ? option.text : 'Today'
}

// 获取审计类型文本
const getAuditTypeText = (value: string) => {
  const option = auditTypeOptions.find((o) => o.value === value)
  return option ? option.text : 'All'
}

// 选择时间段（从下拉选择器）
const selectPeriodOption = (value: number) => {
  selectedPeriod.value = value
  showPeriodPicker.value = false
  // TODO: 调用 API 获取对应时间段的记录
}

// 选择审计类型
const selectAuditType = (value: string) => {
  selectedAuditType.value = value
  showAuditPicker.value = false
  // TODO: 调用 API 获取对应类型的记录
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
      }
    }
  }
}
</style>

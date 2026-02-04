<template>
  <div class="audit-detail-page">
    <div class="top-bar">
      <van-icon name="arrow-left" size="22" color="#fff" @click="goBack" />
      <div class="title">Audit details</div>
      <div class="spacer" />
    </div>

    <div v-if="detail" class="detail-card">
      <div class="detail-row">
        <span class="label">Type of transaction</span>
        <span class="value">{{ getFlowTypeText(detail.source_type) }}</span>
      </div>
      <div class="detail-row">
        <span class="label">Audit status</span>
        <span class="value status" :class="getFlowStatusClass(detail.status)">
          {{ getFlowStatusText(detail.status) }}
        </span>
      </div>
      <div class="detail-row">
        <span class="label">Transaction amount</span>
        <span class="value">₱{{ formatAmount(detail.amount) }}</span>
      </div>
      <div class="detail-row">
        <span class="label">Audit multiplier</span>
        <span class="value">{{ formatInteger(detail.flow_multiple) }}</span>
      </div>
      <div class="detail-row">
        <span class="label">Audit amount</span>
        <span class="value">₱{{ formatAmount(detail.required_flow) }}</span>
      </div>
      <div class="detail-row">
        <span class="label">Unaudited amount</span>
        <span class="value">₱{{ formatAmount(detail.remaining_flow) }}</span>
      </div>
      <div class="detail-row">
        <span class="label">Audited amount</span>
        <span class="value">₱{{ formatAmount(detail.completed_flow) }}</span>
      </div>
      <div class="detail-row">
        <span class="label">Order No</span>
        <span class="value mono">{{ detail.trade_no || '-' }}</span>
      </div>
      <div class="detail-row">
        <span class="label">Creation time</span>
        <span class="value">{{ detail.start_time || '-' }}</span>
      </div>
      <div class="detail-row">
        <span class="label">Completion time</span>
        <span class="value">{{ detail.complete_time || '-' }}</span>
      </div>
      <div class="detail-row">
        <span class="label">Expire time</span>
        <span class="value">{{ detail.expire_time || '-' }}</span>
      </div>
    </div>

    <div v-else class="empty-state">
      <van-icon name="search" size="80" color="#4b5563" />
      <div class="empty-text">No Record</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { UserFlowRequirement } from '@/api/modules/balance'

const router = useRouter()
const detail = ref<UserFlowRequirement | null>(null)

onMounted(() => {
  const raw = sessionStorage.getItem('flow_requirement_detail')
  if (raw) {
    try {
      detail.value = JSON.parse(raw)
    } catch (error) {
      detail.value = null
    }
  }
})

const goBack = () => {
  router.back()
}

const formatAmount = (value: number) => {
  if (value === undefined || value === null) return '0.0000'
  return Number(value).toFixed(4)
}

const formatInteger = (value: number) => {
  if (value === undefined || value === null) return '0'
  const num = Number(value)
  if (Number.isNaN(num)) return '0'
  return String(Math.trunc(num))
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
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.audit-detail-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40px;

  .top-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: $gradient-purple;
    color: #fff;

    .title {
      flex: 1;
      text-align: center;
      font-size: 16px;
      font-weight: 600;
    }

    .spacer {
      width: 22px;
    }
  }

  .detail-card {
    margin: 16px;
    background: #ffffff;
    border-radius: 14px;
    padding: 14px 16px;
    color: #1f2937;
    border: 1px solid #e5e7eb;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);

      .detail-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 0;
      border-bottom: 1px solid #e5e7eb;
        font-size: 13px;

      &:last-child {
        border-bottom: none;
      }

      .label {
        color: #6b7280;
      }

      .value {
        color: #111827;
        text-align: right;
      }

      .mono {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
          'Courier New', monospace;
        font-size: 12px;
      }

      .status.processing {
        color: #f59e0b;
      }

      .status.success {
        color: $success-color;
      }

      .status.failed {
        color: $danger-color;
      }

      .status.pending {
        color: #94a3b8;
      }
    }
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 20px;
    margin: 16px;
    background: #ffffff;
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
}
</style>

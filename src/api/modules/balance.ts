import { request } from '@/utils/request'

// 支付渠道信息
export interface PaymentChannel {
  id: number
  site_id: number
  payment_id: number
  name: string
  code: string
  gateway: number
  each_min: number
  each_max: number
  sort: number
  money_list: string[]
  is_input: number
  remark: string
  logo: string
  status: number
}

// 提现渠道信息
export interface WithdrawChannel {
  id: number
  site_id: number
  withdraw_id: number
  name: string
  code: string
  gateway: number
  each_min: number
  each_max: number
  sort: number
  money_list: string[]
  is_input: number
  remark: string
  logo: string
  status: number
}

// 获取支付渠道列表
export function getPaymentList() {
  return request.get<{ list: PaymentChannel[] }>('/frontend/balance/payment-list')
}

// 获取提现渠道列表
export function getWithdrawList() {
  return request.get<{ list: WithdrawChannel[] }>('/frontend/balance/withdraw-list')
}

// 刷新用户余额
export interface RefreshBalanceResponse {
  balance: string
  balance_frozen: string
  points: number
}

export function refreshBalance() {
  return request.get<RefreshBalanceResponse>('/frontend/balance/refresh-balance')
}

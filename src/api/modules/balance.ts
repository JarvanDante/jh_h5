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

// 银行卡信息
export interface BankCard {
  id: number
  type: number // 1=GCASH 2=Maya
  card_account: string
  card_no: string
  is_default: number // 0=否 1=是
  created_at: string
}

// 获取银行卡列表
export function getBankCardList() {
  return request.get<{ list: BankCard[] }>('/frontend/balance/bank-card-list')
}

// 添加银行卡
export interface AddBankCardParams {
  type: number
  card_account: string
  card_no: string
}

export function addBankCard(params: AddBankCardParams) {
  return request.post<{ success: boolean; message: string }>(
    '/frontend/balance/add-bank-card',
    params,
  )
}

// 删除银行卡
export function deleteBankCard(id: number) {
  return request.post<{ success: boolean; message: string }>('/frontend/balance/delete-bank-card', {
    id,
  })
}

// 设置默认银行卡
export function setDefaultBankCard(id: number) {
  return request.post<{ success: boolean; message: string }>(
    '/frontend/balance/set-default-bank-card',
    { id },
  )
}

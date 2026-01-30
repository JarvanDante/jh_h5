import { request } from '@/utils/request'

// 提现方式
export interface WithdrawMethod {
  id: number
  name: string
  code: string
  gateway: number
  logo: string
  each_min: number
  each_max: number
  money_list: string
  is_input: number
  status: number
  sort: number
}

// 提现账户
export interface WithdrawAccount {
  id: number
  user_id: number
  withdraw_id: number
  bank_name: string
  account_name: string
  account_number: string
  is_default: number
  status: number
  created_at: string
}

// 提现记录
export interface WithdrawRecord {
  id: number
  order_no: string
  user_id: number
  withdraw_id: number
  amount: number
  fee: number
  actual_amount: number
  status: number
  status_name: string
  bank_name: string
  account_number: string
  created_at: string
  updated_at: string
}

// 用户余额信息
export interface BalanceInfo {
  balance: number
  frozen_balance: number
  rollover_requirement: number
}

// 提现方式列表响应
export interface WithdrawMethodListResponse {
  list: WithdrawMethod[]
}

// 提现账户列表响应
export interface WithdrawAccountListResponse {
  list: WithdrawAccount[]
}

// 提现记录列表响应
export interface WithdrawRecordListResponse {
  list: WithdrawRecord[]
  total: number
  page: number
  size: number
}

// 提现请求参数
export interface WithdrawParams {
  withdraw_id: number
  account_id: number
  amount: number
}

// 提现响应
export interface WithdrawResponse {
  order_no: string
  message: string
}

// 添加提现账户参数
export interface AddWithdrawAccountParams {
  withdraw_id: number
  bank_name: string
  account_name: string
  account_number: string
  is_default?: number
}

// 提现 API
export const withdrawApi = {
  // 获取用户余额信息
  getBalanceInfo(): Promise<BalanceInfo> {
    return request.get('/frontend/balance/info')
  },

  // 获取提现方式列表
  getWithdrawMethods(): Promise<WithdrawMethodListResponse> {
    return request.get('/frontend/withdraw/methods')
  },

  // 获取提现账户列表
  getWithdrawAccounts(): Promise<WithdrawAccountListResponse> {
    return request.get('/frontend/withdraw/accounts')
  },

  // 添加提现账户
  addWithdrawAccount(data: AddWithdrawAccountParams): Promise<{ id: number }> {
    return request.post('/frontend/withdraw/add-account', data)
  },

  // 删除提现账户
  deleteWithdrawAccount(accountId: number): Promise<void> {
    return request.post('/frontend/withdraw/delete-account', { account_id: accountId })
  },

  // 设置默认提现账户
  setDefaultAccount(accountId: number): Promise<void> {
    return request.post('/frontend/withdraw/set-default-account', { account_id: accountId })
  },

  // 提交提现申请
  submitWithdraw(data: WithdrawParams): Promise<WithdrawResponse> {
    return request.post('/frontend/withdraw/submit', data)
  },

  // 获取提现记录
  getWithdrawRecords(page: number = 1, size: number = 20): Promise<WithdrawRecordListResponse> {
    return request.get('/frontend/withdraw/records', { params: { page, size } })
  },

  // 取消提现
  cancelWithdraw(orderId: number): Promise<void> {
    return request.post('/frontend/withdraw/cancel', { order_id: orderId })
  },
}

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

// 获取充值 nonce
export interface DepositNonceResponse {
  expires_in: number
  nonce: string
  timestamp: number
}

export function getDepositNonce() {
  return request.get<DepositNonceResponse>('/frontend/balance/deposit-nonce')
}

// 创建充值订单
export interface CreateDepositOrderParams {
  payment_id: number
  order_type: string
  money: number
  nonce: string
}

export interface CreateDepositOrderResponse {
  channel_card_no: string
  channel_name: string
  image_url: string
  order_sn: string
  result: string
  sys_trade_no: string
}

export function createDepositOrder(params: CreateDepositOrderParams) {
  return request.post<CreateDepositOrderResponse>('/frontend/balance/deposit-order', params)
}

// 账户明细项
export interface BalanceLogItem {
  trade_no: string
  money: number
  remark: string
  type: number // 1=充值 2=提款 3=红利 4=返水 5=转账
  symbol: string // +/-
  status: number // 1=待处理 2=成功 3=失败
  time: string
  change_type: number // 1=转入 2=转出
  channel?: string // 支付渠道
}

// 获取账户明细参数
export interface GetBalanceLogParams {
  start: string
  end: string
  type?: number // 1=充值 2=提款 3=红利 4=返水 5=转账
  status?: number // 1=待处理 2=成功 3=失败
  page?: number
  size?: number
}

// 获取账户明细响应
export interface GetBalanceLogResponse {
  total_recharge: number
  total_withdraw: number
  total_bonus: number
  total_rebate: number
  list: BalanceLogItem[]
  count: number
}

export function getBalanceLog(params: GetBalanceLogParams) {
  return request.get<GetBalanceLogResponse>('/frontend/balance/balance-log', { params })
}

// 用户流水要求
export interface UserFlowRequirement {
  id: number
  source_type: number
  trade_no: string
  amount: number
  bonus_amount: number
  flow_multiple: number
  required_flow: number
  completed_flow: number
  remaining_flow: number
  status: number
  progress: number
  start_time: string
  expire_time: string
  complete_time: string
  remark: string
  created_at: string
}

export interface GetUserFlowRequirementsParams {
  status?: number
  page?: number
  size?: number
}

export interface GetUserFlowRequirementsResponse {
  list: UserFlowRequirement[]
  count: number
}

export function getUserFlowRequirements(params: GetUserFlowRequirementsParams) {
  return request.get<GetUserFlowRequirementsResponse>('/frontend/balance/my-flow-requirements', {
    params,
  })
}

// 获取提现 nonce
export interface WithdrawNonceResponse {
  expires_in: number
  nonce: string
  timestamp: number
}

export function getWithdrawNonce() {
  return request.get<WithdrawNonceResponse>('/frontend/balance/withdraw-nonce')
}

// 提现申请参数
export interface WithdrawParams {
  nonce: string
  money: number
  withdraw_id: number
  bank_card_id: number
}

// 提现申请响应
export interface WithdrawResponse {
  success: boolean
  message: string
}

export function withdraw(params: WithdrawParams) {
  return request.post<WithdrawResponse>('/frontend/balance/withdraw', params)
}

// 一键回收游戏余额响应
export interface RecallGameBalanceResponse {
  success: boolean
  message: string
  recalled_amount: string
}

export function recallGameBalance() {
  return request.post<RecallGameBalanceResponse>('/frontend/game/recall-balance')
}

// 洗码返水响应
export interface WashCodeRebateResponse {
  success: boolean
  message: string
  trade_no: string
  valid_bet_amount: number
  rebate_percent: number
  rebate_amount: number
  grade_name: string
  max_bet_id: number
}

// 执行洗码返水
export function washCodeRebate() {
  return request.post<WashCodeRebateResponse>('/frontend/balance/wash-code-rebate')
}

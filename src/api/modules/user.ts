import { request } from '@/utils/request'
import type { UserInfo } from '@/stores/user'

// 登录参数
export interface LoginParams {
  username: string
  password: string
}

// 注册参数
export interface RegisterParams {
  username: string
  password: string
  time: string // 时间戳字符串
  code: string
  invite_code?: string // 邀请码（可选）
}

// 快速注册参数
export interface QuickRegisterParams {
  time: string // 时间戳字符串
  domain: string
}

// 登录响应
export interface LoginResponse {
  token: string
  userInfo: UserInfo
}

// 注册响应
export interface RegisterResponse {
  token: string
  userInfo: UserInfo
  message?: string
}

// 验证码响应
export interface CaptchaResponse {
  code: string
  image: string // base64 图片
}

// 广告项
export interface AdItem {
  before_login: number
  image: string
  name: string
  position: number
  sort: number
  type: number
  url: string
}

// 广告列表响应
export interface AdListResponse {
  code: number
  msg: string
  data: {
    list: AdItem[]
  }
}

// 公告项
export interface NoticeItem {
  content: string
  created_at: string
  title: string
  url: string
}

// 公告列表响应
export interface NoticeListResponse {
  code: number
  msg: string
  data: {
    list: NoticeItem[]
  }
}

// 绑定手机参数
export interface BindMobileParams {
  mobile: string
}

// 绑定邮箱参数
export interface BindEmailParams {
  email: string
}

// 绑定响应
export interface BindResponse {
  message: string
}

// 修改登录密码参数
export interface ChangeLoginPasswordParams {
  old_password: string
  new_password: string
}

// 绑定登录密码参数
export interface BindLoginPasswordParams {
  new_password: string
}

// 设置支付密码参数
export interface SetPayPasswordParams {
  pay_password: string
}

// 修改支付密码参数
export interface ChangePayPasswordParams {
  old_pay_password: string
  new_pay_password: string
}

// 修改密码响应
export interface ChangePasswordResponse {
  message: string
}

// 邀请信息响应
export interface InviteInfoResponse {
  invite_code: string
  invite_url: string
  total_invites: number
  today_invites: number
  total_reward: string
  today_income: string
  yesterday_income: string
  registers: number
  valid_referral: number
}

// 邀请列表响应
export interface InviteListResponse {
  list: Array<{
    user_id: number
    username: string
    register_time: string
    total_bet: string
    total_recharge: string
    status: number
  }>
  total: number
  page: number
  page_size: number
}

// VIP等级信息
export interface GradeInfo {
  id: number
  name: string
  rebate_percent_sports: string
  rebate_percent_lottery: string
  rebate_percent_live: string
  rebate_percent_egame: string
  rebate_percent_poker: string
  payment_limit: string
  bet_limit: string
  money_limit: string
}

export interface GradeListResponse {
  list: GradeInfo[]
}


// 站点设置响应
export interface SiteSettingResponse {
  url_tg?: string
  site_name?: string
  mobile_url?: string
  switch_register?: number
  service_url?: string
  close?: number
  min_withdraw?: string
  max_withdraw?: string
  mobile_logo?: string
  close_reason?: string
}

// 用户 API
export const userApi = {
  // 登录
  login(data: LoginParams): Promise<LoginResponse> {
    return request.post('/user/login', data)
  },

  // 获取验证码
  getCaptcha(time: number): Promise<CaptchaResponse> {
    return request.get(`/frontend/app/captcha?time=${time}`)
  },

  // 注册
  register(data: RegisterParams): Promise<RegisterResponse> {
    return request.post('/frontend/app/register', data)
  },

  // 快速注册
  quickRegister(data: QuickRegisterParams): Promise<RegisterResponse> {
    return request.post('/frontend/app/quickRegister', data)
  },

  // 获取用户信息
  getUserInfo(token?: string): Promise<UserInfo> {
    const url = token ? `/frontend/app/user-info?token=${token}` : '/frontend/app/user-info'
    return request.get(url)
  },

  // 登出
  logout(): Promise<void> {
    return request.post('/user/logout')
  },

  // 获取广告列表
  getAdList(): Promise<AdListResponse> {
    return request.get('/frontend/app/ad-list')
  },

  // 获取公告列表
  getNoticeList(): Promise<NoticeListResponse> {
    return request.get('/frontend/app/notice-list')
  },

  // 绑定手机
  bindMobile(data: BindMobileParams): Promise<BindResponse> {
    return request.post('/frontend/app/bind-mobile', data)
  },

  // 绑定邮箱
  bindEmail(data: BindEmailParams): Promise<BindResponse> {
    return request.post('/frontend/app/bind-email', data)
  },

  // 修改登录密码
  changeLoginPassword(data: ChangeLoginPasswordParams): Promise<ChangePasswordResponse> {
    return request.post('/frontend/app/change-login-password', data)
  },

  // 绑定登录密码
  bindLoginPassword(data: BindLoginPasswordParams): Promise<ChangePasswordResponse> {
    return request.post('/frontend/app/bind-login-password', data)
  },

  // 修改支付密码
  changePayPassword(data: ChangePayPasswordParams): Promise<ChangePasswordResponse> {
    return request.post('/frontend/app/change-pay-password', data)
  },

  // 设置支付密码
  setPayPassword(data: SetPayPasswordParams): Promise<ChangePasswordResponse> {
    return request.post('/frontend/app/set-pay-password', data)
  },

  // 获取邀请信息
  getInviteInfo(): Promise<InviteInfoResponse> {
    return request.get('/frontend/app/invite-info')
  },

  // 获取邀请列表
  getInviteList(page = 1, pageSize = 20): Promise<InviteListResponse> {
    return request.get('/frontend/app/invite-list', { params: { page, page_size: pageSize } })
  },

  // 获取会员等级列表
  getGradeList(): Promise<GradeListResponse> {
    return request.get('/frontend/app/grade-list')
  },


  // 获取站点设置
  getSiteSetting(): Promise<SiteSettingResponse> {
    return request.get('/frontend/app/setting-site')
  },

  // 获取站点活动列表
  getSiteActivityList(): Promise<any> {
    return request.get('/frontend/app/site-activity-list')
  },

  // 获取消息列表
  getMessageList(): Promise<any> {
    return request.get('/frontend/app/app-user-messages')
  },

  // 获取未读消息数量
  getUnreadCount(): Promise<any> {
    return request.get('/frontend/app/app-unread-count')
  },

  // 标记消息已读
  readMessage(messageId: number): Promise<any> {
    return request.post('/frontend/app/app-read-message', { message_id: messageId })
  },
}

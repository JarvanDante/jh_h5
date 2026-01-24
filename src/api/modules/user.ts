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
  confirmPassword: string
  inviteCode?: string
}

// 快速注册参数
export interface QuickRegisterParams {
  username: string
  password: string
  invite_code?: string
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

// 用户 API
export const userApi = {
  // 登录
  login(data: LoginParams): Promise<LoginResponse> {
    return request.post('/user/login', data)
  },

  // 注册
  register(data: RegisterParams): Promise<RegisterResponse> {
    return request.post('/user/register', data)
  },

  // 快速注册
  quickRegister(data: QuickRegisterParams): Promise<RegisterResponse> {
    return request.post('/frontend/app/quickRegister', data)
  },

  // 获取用户信息
  getUserInfo(): Promise<UserInfo> {
    return request.get('/user/info')
  },

  // 登出
  logout(): Promise<void> {
    return request.post('/user/logout')
  },
}

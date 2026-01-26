import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface UserInfo {
  id: number
  username: string
  nickname?: string
  avatar?: string
  mobile?: string
  email?: string
  balance?: string
  realname?: string
  grade_name?: string
}

export const useUserStore = defineStore(
  'user',
  () => {
    const token = ref<string>('')
    const refreshToken = ref<string>('')
    const userInfo = ref<UserInfo | null>(null)

    // 是否登录
    const isLogin = computed(() => !!token.value)

    // 设置 token
    const setToken = (newToken: string) => {
      token.value = newToken
      localStorage.setItem('user_token', newToken)
    }

    // 设置 refresh token
    const setRefreshToken = (newRefreshToken: string) => {
      refreshToken.value = newRefreshToken
      localStorage.setItem('refresh_token', newRefreshToken)
    }

    // 设置用户信息
    const setUserInfo = (info: UserInfo) => {
      userInfo.value = info
      localStorage.setItem('user_info', JSON.stringify(info))
    }

    // 登出
    const logout = () => {
      token.value = ''
      refreshToken.value = ''
      userInfo.value = null
      localStorage.removeItem('user_token')
      localStorage.removeItem('user_info')
      localStorage.removeItem('refresh_token')
    }

    return {
      token,
      refreshToken,
      userInfo,
      isLogin,
      setToken,
      setRefreshToken,
      setUserInfo,
      logout,
    }
  },
  {
    persist: true,
  },
)

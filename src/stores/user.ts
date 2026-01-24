import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface UserInfo {
  id: number
  username: string
  nickname?: string
  avatar?: string
  mobile?: string
  email?: string
}

export const useUserStore = defineStore(
  'user',
  () => {
    const token = ref<string>('')
    const userInfo = ref<UserInfo | null>(null)

    // 是否登录
    const isLogin = computed(() => !!token.value)

    // 设置 token
    const setToken = (newToken: string) => {
      token.value = newToken
    }

    // 设置用户信息
    const setUserInfo = (info: UserInfo) => {
      userInfo.value = info
    }

    // 登出
    const logout = () => {
      token.value = ''
      userInfo.value = null
    }

    return {
      token,
      userInfo,
      isLogin,
      setToken,
      setUserInfo,
      logout,
    }
  },
  {
    persist: true, // 持久化存储
  },
)

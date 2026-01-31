const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api'

class Request {
  private isRefreshing = false
  private refreshSubscribers: Array<(token: string) => void> = []

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    const token = localStorage.getItem('user_token')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    return headers
  }

  // 订阅 token 刷新
  private subscribeTokenRefresh(callback: (token: string) => void) {
    this.refreshSubscribers.push(callback)
  }

  // 通知所有订阅者 token 已刷新
  private onTokenRefreshed(token: string) {
    this.refreshSubscribers.forEach((callback) => callback(token))
    this.refreshSubscribers = []
  }

  // 刷新 token
  private async refreshToken(): Promise<string | null> {
    try {
      // 从 localStorage 获取用户信息
      const userStr = localStorage.getItem('user')
      if (!userStr) {
        return null
      }

      const user = JSON.parse(userStr)
      const refreshToken = user.refreshToken

      if (!refreshToken) {
        return null
      }

      // 调用刷新 token 接口
      const response = await fetch(`${apiBaseUrl}/frontend/app/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: refreshToken,
        }),
      })

      const result = await response.json()

      if (result.code === 0 && result.data) {
        const { token, refresh_token } = result.data

        // 更新 localStorage 中的 token
        localStorage.setItem('user_token', token)

        // 更新 user 对象中的 refreshToken
        const updatedUser = {
          ...user,
          token,
          refreshToken: refresh_token,
        }
        localStorage.setItem('user', JSON.stringify(updatedUser))

        return token
      }

      return null
    } catch (error) {
      console.error('Token refresh failed:', error)
      return null
    }
  }

  // 处理响应
  private async handleResponse<T>(
    response: Response,
    url: string,
    options?: RequestInit,
  ): Promise<T> {
    const result = await response.json()

    // 检查是否是 401 错误
    if (result.code === 401) {
      // 如果正在刷新 token，等待刷新完成
      if (this.isRefreshing) {
        return new Promise((resolve, reject) => {
          this.subscribeTokenRefresh(async (token: string) => {
            try {
              // 使用新 token 重试请求
              const retryResponse = await fetch(`${apiBaseUrl}${url}`, {
                ...options,
                headers: {
                  ...options?.headers,
                  Authorization: `Bearer ${token}`,
                },
              })
              const retryResult = await retryResponse.json()
              resolve(retryResult.data || retryResult)
            } catch (error) {
              reject(error)
            }
          })
        })
      }

      // 开始刷新 token
      this.isRefreshing = true

      try {
        const newToken = await this.refreshToken()

        if (newToken) {
          // 通知所有等待的请求
          this.onTokenRefreshed(newToken)

          // 使用新 token 重试当前请求
          const retryResponse = await fetch(`${apiBaseUrl}${url}`, {
            ...options,
            headers: {
              ...options?.headers,
              Authorization: `Bearer ${newToken}`,
            },
          })
          const retryResult = await retryResponse.json()
          return retryResult.data || retryResult
        } else {
          // 刷新失败，清除登录信息并跳转到登录页
          localStorage.removeItem('user_token')
          localStorage.removeItem('user')
          window.location.href = '/login'
          throw new Error('Token refresh failed')
        }
      } finally {
        this.isRefreshing = false
      }
    }

    // 正常返回数据
    return result.data || result
  }

  async get<T = any>(url: string, options?: { params?: Record<string, any> }): Promise<T> {
    // 构建 query 参数
    let fullUrl = url
    if (options?.params) {
      const queryString = new URLSearchParams(
        Object.entries(options.params).reduce(
          (acc, [key, value]) => {
            if (value !== undefined && value !== null) {
              acc[key] = String(value)
            }
            return acc
          },
          {} as Record<string, string>,
        ),
      ).toString()
      fullUrl = `${url}?${queryString}`
    }

    const requestOptions: RequestInit = {
      headers: this.getHeaders(),
    }

    const response = await fetch(`${apiBaseUrl}${fullUrl}`, requestOptions)
    return this.handleResponse<T>(response, fullUrl, requestOptions)
  }

  async post<T = any>(url: string, data?: any): Promise<T> {
    const options: RequestInit = {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    }

    const response = await fetch(`${apiBaseUrl}${url}`, options)
    return this.handleResponse<T>(response, url, options)
  }
}

export const request = new Request()

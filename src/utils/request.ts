const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api'
const apiSignAppId = import.meta.env.VITE_API_SIGN_APP_ID || 'h5'
const apiSignSecret = import.meta.env.VITE_API_SIGN_SECRET || ''

function toPathWithQuery(url: string): string {
  const parsed = new URL(url, window.location.origin)
  return `${parsed.pathname}${parsed.search}`
}

function getTimestamp(): string {
  return Math.floor(Date.now() / 1000).toString()
}

function getNonce(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

function toBodyText(body?: BodyInit | null): string {
  if (!body) return ''
  if (typeof body === 'string') return body
  if (body instanceof URLSearchParams) return body.toString()
  return ''
}

function encodeHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

async function sha256Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return encodeHex(new Uint8Array(digest))
}

async function hmacSha256Hex(text: string, secret: string): Promise<string> {
  const keyData = new TextEncoder().encode(secret)
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(text))
  return encodeHex(new Uint8Array(signature))
}

async function addSignatureHeaders(url: string, options: RequestInit): Promise<Headers> {
  const headers = new Headers(options.headers || {})
  if (!apiSignSecret) {
    return headers
  }

  const contentType = headers.get('Content-Type') || ''
  if (contentType.toLowerCase().startsWith('multipart/form-data')) {
    return headers
  }

  const method = (options.method || 'GET').toUpperCase()
  const timestamp = getTimestamp()
  const nonce = getNonce()
  const bodyText = toBodyText(options.body)
  const bodyHash = await sha256Hex(bodyText)
  const payload = [method, toPathWithQuery(url), timestamp, nonce, bodyHash].join('\n')
  const sign = await hmacSha256Hex(payload, apiSignSecret)

  headers.set('X-App-Id', apiSignAppId)
  headers.set('X-Timestamp', timestamp)
  headers.set('X-Nonce', nonce)
  headers.set('X-Sign', sign)
  return headers
}

export async function signedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const signedHeaders = await addSignatureHeaders(url, options)
  return fetch(url, {
    ...options,
    headers: signedHeaders,
  })
}

class Request {
  private isRefreshing = false
  private refreshSubscribers: Array<(token: string) => void> = []

  private normalizeMessage(message?: string): string | undefined {
    if (!message) return message
    const match = message.match(/desc\s*=\s*(.*)$/)
    if (match && match[1]) {
      return match[1].trim()
    }
    return message
  }

  private getHeaders(tokenOverride?: string): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    const token = tokenOverride || localStorage.getItem('user_token')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    return headers
  }

  private async doFetch(url: string, options: RequestInit): Promise<Response> {
    return signedFetch(`${apiBaseUrl}${url}`, options)
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
      const userStr = localStorage.getItem('user')
      if (!userStr) {
        return null
      }

      const user = JSON.parse(userStr)
      const refreshToken = user.refreshToken
      if (!refreshToken) {
        return null
      }

      const response = await this.doFetch('/frontend/app/refresh-token', {
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
        localStorage.setItem('user_token', token)

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

    if (result.code === 401) {
      if (this.isRefreshing) {
        return new Promise((resolve, reject) => {
          this.subscribeTokenRefresh(async (token: string) => {
            try {
              const retryResponse = await this.doFetch(url, {
                ...options,
                headers: {
                  ...(options?.headers || {}),
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

      this.isRefreshing = true

      try {
        const newToken = await this.refreshToken()

        if (newToken) {
          this.onTokenRefreshed(newToken)

          const retryResponse = await this.doFetch(url, {
            ...options,
            headers: {
              ...(options?.headers || {}),
              Authorization: `Bearer ${newToken}`,
            },
          })
          const retryResult = await retryResponse.json()
          return retryResult.data || retryResult
        } else {
          localStorage.removeItem('user_token')
          localStorage.removeItem('user')
          window.location.href = '/login'
          throw new Error('Token refresh failed')
        }
      } finally {
        this.isRefreshing = false
      }
    }

    if (result && typeof result === 'object') {
      if (result.msg) {
        result.msg = this.normalizeMessage(result.msg)
      }
      if (result.message) {
        result.message = this.normalizeMessage(result.message)
      }
    }
    return result.data || result
  }

  async get<T = any>(url: string, options?: { params?: Record<string, any> }): Promise<T> {
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

    const response = await this.doFetch(fullUrl, requestOptions)
    return this.handleResponse<T>(response, fullUrl, requestOptions)
  }

  async post<T = any>(url: string, data?: any): Promise<T> {
    const options: RequestInit = {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    }

    const response = await this.doFetch(url, options)
    return this.handleResponse<T>(response, url, options)
  }
}

export const request = new Request()

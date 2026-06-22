import { showToast } from 'vant'
import i18n, { getStoredLocale, toLanguageHeader } from '@/i18n'

function getLanguageHeader(): string {
  return toLanguageHeader(getStoredLocale())
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api'
const apiSignAppId = import.meta.env.VITE_API_SIGN_APP_ID || 'h5'
const signSkipPathSuffixes = ['/login', '/logout', '/refresh-token', '/captcha', '/sign-session']
const signSessionRenewSkewMs = 30 * 1000
const allowInsecureNoSign =
  import.meta.env.VITE_ALLOW_INSECURE_NO_SIGN === '1' ||
  (import.meta.env.DEV && import.meta.env.VITE_DEV_ALLOW_INSECURE_NO_SIGN === '1')

type SignSession = {
  keyId: string
  signKey: string
  appId: string
  expiresAt: number
  tokenSnapshot: string
}

let currentSignSession: SignSession | null = null
let signSessionPromise: Promise<SignSession | null> | null = null
let last429ToastAt = 0

function isInvalidTokenMessage(message?: string): boolean {
  if (!message) return false
  const text = message.toLowerCase()
  return text.includes('invalid token') || text.includes('please login') || text.includes('未登录')
}

function toPathWithQuery(url: string): string {
  const parsed = new URL(url, window.location.origin)
  return `${parsed.pathname}${parsed.search}`
}

function toPathName(url: string): string {
  const parsed = new URL(url, window.location.origin)
  return parsed.pathname
}

function getUserToken(): string {
  return localStorage.getItem('user_token') || ''
}

function shouldSkipSignatureByPath(url: string): boolean {
  const pathName = toPathName(url)
  return signSkipPathSuffixes.some((suffix) => pathName.endsWith(suffix))
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
  if (!globalThis.crypto?.subtle) {
    throw new Error('WebCrypto is unavailable in current context')
  }
  const data = new TextEncoder().encode(text)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return encodeHex(new Uint8Array(digest))
}

async function hmacSha256Hex(text: string, secret: string): Promise<string> {
  if (!globalThis.crypto?.subtle) {
    throw new Error('WebCrypto is unavailable in current context')
  }
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

function isSignSessionValid(session: SignSession | null, tokenSnapshot: string): boolean {
  if (!session) return false
  if (session.tokenSnapshot !== tokenSnapshot) return false
  return Date.now() + signSessionRenewSkewMs < session.expiresAt
}

async function requestSignSession(force = false, tokenOverride = ''): Promise<SignSession | null> {
  const tokenSnapshot = tokenOverride || getUserToken()

  if (!force && isSignSessionValid(currentSignSession, tokenSnapshot)) {
    return currentSignSession
  }

  if (signSessionPromise) {
    return signSessionPromise
  }

  signSessionPromise = (async () => {
    const fetchSignSession = async (token?: string) => {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        language: getLanguageHeader(),
      }
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch(`${apiBaseUrl}/frontend/app/sign-session`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ app_id: apiSignAppId }),
      })

      const result = await response.json().catch(() => null)
      return { response, result }
    }

    // 先尝试携带当前 token 获取签名会话
    let { result } = await fetchSignSession(tokenSnapshot || undefined)

    // token 无效时，回退为匿名签名会话，避免首页等公共接口完全不可用
    if (
      tokenSnapshot &&
      (result?.code === 401 || isInvalidTokenMessage(result?.msg))
    ) {
      localStorage.removeItem('user_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user_info')
      localStorage.removeItem('user')
      clearSignSession()
      ;({ result } = await fetchSignSession())
    }

    if (result?.code !== 0 || !result?.data?.key_id || !result?.data?.sign_key) {
      currentSignSession = null
      return null
    }

    const expiresIn = Number(result.data.expires_in || 0)
    const finalTokenSnapshot = getUserToken()
    currentSignSession = {
      keyId: String(result.data.key_id),
      signKey: String(result.data.sign_key),
      appId: String(result.data.app_id || apiSignAppId),
      expiresAt: Date.now() + Math.max(60, expiresIn) * 1000,
      tokenSnapshot: finalTokenSnapshot,
    }
    return currentSignSession
  })()

  try {
    return await signSessionPromise
  } finally {
    signSessionPromise = null
  }
}

function clearSignSession() {
  currentSignSession = null
}

let slowLoadingRefCount = 0
let loadingResetBound = false

if (typeof window !== 'undefined' && !loadingResetBound) {
  window.addEventListener('app:global-loading-reset', () => {
    slowLoadingRefCount = 0
  })
  loadingResetBound = true
}

function emitGlobalLoadingStart() {
  if (slowLoadingRefCount === 0) {
    window.dispatchEvent(new CustomEvent('app:global-loading-start'))
  }
  slowLoadingRefCount += 1
}

function emitGlobalLoadingEnd() {
  slowLoadingRefCount = Math.max(0, slowLoadingRefCount - 1)
  if (slowLoadingRefCount === 0) {
    window.dispatchEvent(new CustomEvent('app:global-loading-end'))
  }
}

async function addSignatureHeaders(url: string, options: RequestInit): Promise<Headers> {
  const headers = new Headers(options.headers || {})
  headers.set('language', getLanguageHeader())
  if (shouldSkipSignatureByPath(url)) {
    return headers
  }

  // 开发环境兜底：非安全上下文下 WebCrypto 不可用，允许临时跳过签名
  if (allowInsecureNoSign && (!window.isSecureContext || !globalThis.crypto?.subtle)) {
    console.warn('[request] skip signature in insecure context:', url)
    return headers
  }

  const contentType = headers.get('Content-Type') || ''
  if (contentType.toLowerCase().startsWith('multipart/form-data')) {
    return headers
  }

  const signSession = await requestSignSession()
  if (!signSession) {
    throw new Error('Failed to get sign session')
  }

  const method = (options.method || 'GET').toUpperCase()
  const timestamp = getTimestamp()
  const nonce = getNonce()
  const bodyText = toBodyText(options.body)
  const bodyHash = await sha256Hex(bodyText)
  const payload = [method, toPathWithQuery(url), timestamp, nonce, bodyHash].join('\n')
  const sign = await hmacSha256Hex(payload, signSession.signKey)

  headers.set('X-App-Id', signSession.appId || apiSignAppId)
  headers.set('X-Key-Id', signSession.keyId)
  headers.set('X-Timestamp', timestamp)
  headers.set('X-Nonce', nonce)
  headers.set('X-Sign', sign)
  return headers
}

export async function signedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  emitGlobalLoadingStart()
  try {
    const signedHeaders = await addSignatureHeaders(url, options)
    return await fetch(url, {
      ...options,
      headers: signedHeaders,
    })
  } finally {
    emitGlobalLoadingEnd()
  }
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

  private isSignatureError(message?: string): boolean {
    if (!message) return false
    return (
      message.includes('签名') ||
      message.includes('nonce') ||
      message.includes('请求已过期') ||
      message.includes('replay')
    )
  }

  private getHeaders(tokenOverride?: string): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      language: getLanguageHeader(),
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
        try {
          await requestSignSession(true, token)
        } catch (error) {
          clearSignSession()
          console.warn('Sign session refresh failed after token refresh:', error)
        }

        return token
      }

      return null
    } catch (error) {
      console.error('Token refresh failed:', error)
      clearSignSession()
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
    const resultCode = Number(result?.code)
    const resultMessage = this.normalizeMessage(result?.msg || result?.message)

    if (resultCode === 429) {
      const message = i18n.global.t('common.systemBusy')
      result.msg = message
      result.message = message

      const now = Date.now()
      if (now - last429ToastAt > 2000) {
        showToast(message)
        last429ToastAt = now
      }
    }

    if (resultCode === 401) {
      const customOptions = (options || {}) as RequestInit & { _signRetried?: boolean }
      if (!customOptions._signRetried && this.isSignatureError(resultMessage)) {
        await requestSignSession(true)
        const retryOptions = {
          ...customOptions,
          _signRetried: true,
        } as RequestInit & { _signRetried?: boolean }
        const retryResponse = await this.doFetch(url, retryOptions as RequestInit)
        return this.handleResponse<T>(retryResponse, url, retryOptions as RequestInit)
      }

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
          clearSignSession()
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

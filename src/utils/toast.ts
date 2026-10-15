import { showToast } from 'vant'

const USELESS_MESSAGES = new Set([
  'success',
  'ok',
  'fail',
  'failed',
  'error',
  '成功',
  '失败',
])

function readRawMessage(payload: unknown): string {
  if (typeof payload === 'string') return payload
  if (!payload || typeof payload !== 'object') return ''

  const record = payload as Record<string, unknown>
  const candidates = [record.message, record.msg]
  for (const item of candidates) {
    if (typeof item === 'string' && item.trim()) return item
  }
  return ''
}

export function pickToastMessage(payload: unknown, fallback: string): string {
  const text = readRawMessage(payload).trim()
  if (!text) return fallback
  if (USELESS_MESSAGES.has(text.toLowerCase())) return fallback
  return text
}

export function showAppToast(
  payload: unknown,
  fallback = '',
  options?: { type?: 'success' | 'fail' | 'loading'; duration?: number },
) {
  const message = pickToastMessage(payload, fallback)
  if (!message) return

  if (options?.type) {
    showToast({
      type: options.type,
      message,
      duration: options.duration,
    })
    return
  }

  showToast(message)
}

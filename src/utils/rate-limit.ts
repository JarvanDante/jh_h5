export const RATE_LIMIT_PATH = '/rate-limited'

let locked = false

export function notifyRateLimited() {
  if (typeof window === 'undefined') return
  if (locked) return
  if (window.location.pathname === RATE_LIMIT_PATH) return
  locked = true
  window.dispatchEvent(new CustomEvent('app:rate-limited'))
}

export function notifyIfRateLimited(code: unknown) {
  if (Number(code) !== 429) return false
  notifyRateLimited()
  return true
}

export function unlockRateLimited() {
  locked = false
}

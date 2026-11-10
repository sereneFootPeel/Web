const DENIED = 'archive-denied'

/** 登录失败或打开没有权限的页面时，让背景短暂换成黑色调。 */
export function signalDenied() {
  window.dispatchEvent(new Event(DENIED))
}

export function onDenied(listener: () => void) {
  window.addEventListener(DENIED, listener)
  return () => window.removeEventListener(DENIED, listener)
}

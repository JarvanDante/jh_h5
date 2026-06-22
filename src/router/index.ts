import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { showToast } from 'vant'
import i18n from '@/i18n'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/home/index.vue'),
    meta: {
      titleKey: 'route.home',
      keepAlive: true,
    },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: {
      titleKey: 'route.login',
    },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/register/index.vue'),
    meta: {
      titleKey: 'route.register',
    },
  },
  {
    path: '/user',
    name: 'User',
    component: () => import('@/views/user/index.vue'),
    meta: {
      titleKey: 'route.profile',
      requiresAuth: true,
    },
  },
  {
    path: '/messages',
    name: 'Messages',
    component: () => import('@/views/messages/index.vue'),
    meta: {
      titleKey: 'route.messages',
      requiresAuth: true,
    },
  },
  {
    path: '/support',
    name: 'Support',
    component: () => import('@/views/support/index.vue'),
    meta: {
      titleKey: 'route.support',
      requiresAuth: true,
    },
  },
  {
    path: '/game',
    name: 'Game',
    component: () => import('@/views/game/index.vue'),
    meta: {
      titleKey: 'route.games',
    },
  },
  {
    path: '/promotion',
    name: 'Promotion',
    component: () => import('@/views/promotion/index.vue'),
    meta: {
      titleKey: 'route.promotions',
      requiresAuth: true,
    },
  },
  {
    path: '/lucky_activity',
    name: 'LuckyActivity',
    component: () => import('@/views/activity/lucky.vue'),
    meta: { titleKey: 'route.luckySpin', requiresAuth: true },
  },
  {
    path: '/signin_activity',
    name: 'SigninActivity',
    component: () => import('@/views/activity/signin.vue'),
    meta: { titleKey: 'route.dailyCheckIn', requiresAuth: true },
  },
  {
    path: '/deposit_activity',
    name: 'DepositActivity',
    component: () => import('@/views/activity/deposit.vue'),
    meta: { titleKey: 'route.depositBonus', requiresAuth: true },
  },
  {
    path: '/register_activity',
    name: 'RegisterActivity',
    component: () => import('@/views/activity/register.vue'),
    meta: { titleKey: 'route.registrationBonus', requiresAuth: true },
  },
  {
    path: '/rebate',
    name: 'RebateActivity',
    component: () => import('@/views/activity/rebate.vue'),
    meta: { titleKey: 'route.rebate', requiresAuth: true },
  },
  {
    path: '/vip',
    name: 'Vip',
    component: () => import('@/views/vip/index.vue'),
    meta: { titleKey: 'route.vip' },
  },
  {
    path: '/invite_activity',
    name: 'InviteActivityOffline',
    component: () => import('@/views/error/404.vue'),
    meta: {
      titleKey: 'route.notFound',
    },
  },
  {
    path: '/deposit',
    name: 'Deposit',
    component: () => import('@/views/deposit/index.vue'),
    meta: {
      titleKey: 'route.deposit',
      requiresAuth: true,
    },
  },
  {
    path: '/deposit/history',
    name: 'DepositHistory',
    component: () => import('@/views/deposit/history.vue'),
    meta: {
      titleKey: 'route.depositHistory',
      requiresAuth: true,
    },
  },
  {
    path: '/deposit/payment',
    name: 'DepositPayment',
    component: () => import('@/views/deposit/payment.vue'),
    meta: {
      titleKey: 'route.payment',
      requiresAuth: true,
    },
  },
  {
    path: '/withdraw',
    name: 'Withdraw',
    component: () => import('@/views/withdraw/index.vue'),
    meta: {
      titleKey: 'route.withdraw',
      requiresAuth: true,
    },
  },
  {
    path: '/withdraw/set-password',
    name: 'WithdrawSetPassword',
    component: () => import('@/views/withdraw/set-password.vue'),
    meta: {
      titleKey: 'route.setWithdrawPassword',
      requiresAuth: true,
    },
  },
  {
    path: '/withdraw/account',
    name: 'WithdrawAccount',
    component: () => import('@/views/withdraw/account.vue'),
    meta: {
      titleKey: 'route.myAccount',
      requiresAuth: true,
    },
  },
  {
    path: '/withdraw/add-account',
    name: 'WithdrawAddAccount',
    component: () => import('@/views/withdraw/add-account.vue'),
    meta: {
      titleKey: 'route.addWithdrawAccount',
      requiresAuth: true,
    },
  },
  {
    path: '/withdraw/history',
    name: 'WithdrawHistory',
    component: () => import('@/views/withdraw/history.vue'),
    meta: {
      titleKey: 'route.withdrawHistory',
      requiresAuth: true,
    },
  },
  {
    path: '/withdraw/audit-detail',
    name: 'WithdrawAuditDetail',
    component: () => import('@/views/withdraw/audit-detail.vue'),
    meta: {
      titleKey: 'route.auditDetails',
      requiresAuth: true,
    },
  },
  {
    path: '/report',
    name: 'Report',
    component: () => import('@/views/report/index.vue'),
    meta: {
      titleKey: 'route.report',
      requiresAuth: true,
    },
  },
  {
    path: '/security',
    name: 'Security',
    component: () => import('@/views/security/index.vue'),
    meta: {
      titleKey: 'route.securityCenter',
      requiresAuth: true,
    },
  },
  {
    path: '/security/bind-phone',
    name: 'SecurityBindPhone',
    component: () => import('@/views/security/bind-phone.vue'),
    meta: {
      titleKey: 'route.bindPhone',
      requiresAuth: true,
    },
  },
  {
    path: '/security/bind-email',
    name: 'SecurityBindEmail',
    component: () => import('@/views/security/bind-email.vue'),
    meta: {
      titleKey: 'route.bindEmail',
      requiresAuth: true,
    },
  },
  {
    path: '/security/bind-login-password',
    name: 'SecurityBindLoginPassword',
    component: () => import('@/views/security/bind-login-password.vue'),
    meta: {
      titleKey: 'route.bindLoginPassword',
      requiresAuth: true,
    },
  },
  {
    path: '/security/bind-pay-password',
    name: 'SecurityBindPayPassword',
    component: () => import('@/views/security/bind-pay-password.vue'),
    meta: {
      titleKey: 'route.bindAssetsPassword',
      requiresAuth: true,
    },
  },
  {
    path: '/security/change-login-password',
    name: 'SecurityChangeLoginPassword',
    component: () => import('@/views/security/change-login-password.vue'),
    meta: {
      titleKey: 'route.changeLoginPassword',
      requiresAuth: true,
    },
  },
  {
    path: '/security/change-assets-password',
    name: 'SecurityChangeAssetsPassword',
    component: () => import('@/views/security/change-assets-password.vue'),
    meta: {
      titleKey: 'route.changeAssetsPassword',
      requiresAuth: true,
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: {
      titleKey: 'route.notFound',
    },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  window.dispatchEvent(new CustomEvent('app:global-loading-start'))

  const titleKey = to.meta.titleKey as string | undefined
  document.title = titleKey ? i18n.global.t(titleKey) : 'JH H5'

  // 检查是否需要登录
  if (to.meta.requiresAuth) {
    const userStore = useUserStore()
    if (!userStore.isLogin) {
      showToast(i18n.global.t('common.pleaseLoginFirst'))
      next({
        path: '/login',
        query: { redirect: to.fullPath },
      })
      return
    }
  }

  next()
})

router.afterEach(() => {
  window.dispatchEvent(new CustomEvent('app:global-loading-end'))
  // 路由成功后清理一次性刷新标记
  sessionStorage.removeItem('h5:chunk-reload-once')
})

router.onError((error: any) => {
  window.dispatchEvent(new CustomEvent('app:global-loading-end'))

  // 打印真实错误，避免黑屏时无日志可查
  console.error('[router.onError]', error)

  // 懒加载 chunk 失败（常见于发布后缓存不一致）时，自动刷新一次自愈
  const message = String(error?.message || error || '').toLowerCase()
  const isChunkLoadError =
    message.includes('failed to fetch dynamically imported module') ||
    message.includes('importing a module script failed') ||
    message.includes('loading chunk') ||
    message.includes('chunkloaderror')

  if (!isChunkLoadError) return

  const reloadKey = 'h5:chunk-reload-once'
  if (sessionStorage.getItem(reloadKey) === '1') {
    // 已自动刷新过，避免死循环
    return
  }

  sessionStorage.setItem(reloadKey, '1')
  window.location.reload()
})

export default router

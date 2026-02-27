import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { showToast } from 'vant'

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
      title: '首页',
      keepAlive: true,
    },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: {
      title: '登录',
    },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/register/index.vue'),
    meta: {
      title: '注册',
    },
  },
  {
    path: '/user',
    name: 'User',
    component: () => import('@/views/user/index.vue'),
    meta: {
      title: '个人中心',
      requiresAuth: true,
    },
  },
  {
    path: '/messages',
    name: 'Messages',
    component: () => import('@/views/messages/index.vue'),
    meta: {
      title: '消息中心',
      requiresAuth: true,
    },
  },
  {
    path: '/support',
    name: 'Support',
    component: () => import('@/views/support/index.vue'),
    meta: {
      title: 'Support',
      requiresAuth: true,
    },
  },
  {
    path: '/game',
    name: 'Game',
    component: () => import('@/views/game/index.vue'),
    meta: {
      title: '游戏',
    },
  },
  {
    path: '/promotion',
    name: 'Promotion',
    component: () => import('@/views/promotion/index.vue'),
    meta: {
      title: '促销活动',
      requiresAuth: true,
    },
  },
  {
    path: '/lucky_activity',
    name: 'LuckyActivity',
    component: () => import('@/views/activity/lucky.vue'),
    meta: { title: '大转盘活动', requiresAuth: true },
  },
  {
    path: '/signin_activity',
    name: 'SigninActivity',
    component: () => import('@/views/activity/signin.vue'),
    meta: { title: '每日签到活动', requiresAuth: true },
  },
  {
    path: '/deposit_activity',
    name: 'DepositActivity',
    component: () => import('@/views/activity/deposit.vue'),
    meta: { title: '充值送活动', requiresAuth: true },
  },
  {
    path: '/register_activity',
    name: 'RegisterActivity',
    component: () => import('@/views/activity/register.vue'),
    meta: { title: '注册送活动', requiresAuth: true },
  },
  {
    path: '/rebate',
    name: 'RebateActivity',
    component: () => import('@/views/activity/rebate.vue'),
    meta: { title: '洗码活动', requiresAuth: true },
  },
  {
    path: '/vip',
    name: 'Vip',
    component: () => import('@/views/vip/index.vue'),
    meta: { title: 'VIP权益' },
  },
  {
    path: '/invite_activity',
    name: 'InviteActivityOffline',
    component: () => import('@/views/error/404.vue'),
    meta: {
      title: '页面不存在',
    },
  },
  {
    path: '/deposit',
    name: 'Deposit',
    component: () => import('@/views/deposit/index.vue'),
    meta: {
      title: '存款',
      requiresAuth: true,
    },
  },
  {
    path: '/deposit/history',
    name: 'DepositHistory',
    component: () => import('@/views/deposit/history.vue'),
    meta: {
      title: '充值记录',
      requiresAuth: true,
    },
  },
  {
    path: '/deposit/payment',
    name: 'DepositPayment',
    component: () => import('@/views/deposit/payment.vue'),
    meta: {
      title: '支付',
      requiresAuth: true,
    },
  },
  {
    path: '/withdraw',
    name: 'Withdraw',
    component: () => import('@/views/withdraw/index.vue'),
    meta: {
      title: '提现',
      requiresAuth: true,
    },
  },
  {
    path: '/withdraw/set-password',
    name: 'WithdrawSetPassword',
    component: () => import('@/views/withdraw/set-password.vue'),
    meta: {
      title: '设置提现密码',
      requiresAuth: true,
    },
  },
  {
    path: '/withdraw/account',
    name: 'WithdrawAccount',
    component: () => import('@/views/withdraw/account.vue'),
    meta: {
      title: '我的账户',
      requiresAuth: true,
    },
  },
  {
    path: '/withdraw/add-account',
    name: 'WithdrawAddAccount',
    component: () => import('@/views/withdraw/add-account.vue'),
    meta: {
      title: '添加提现账户',
      requiresAuth: true,
    },
  },
  {
    path: '/withdraw/history',
    name: 'WithdrawHistory',
    component: () => import('@/views/withdraw/history.vue'),
    meta: {
      title: '提现记录',
      requiresAuth: true,
    },
  },
  {
    path: '/withdraw/audit-detail',
    name: 'WithdrawAuditDetail',
    component: () => import('@/views/withdraw/audit-detail.vue'),
    meta: {
      title: 'Audit details',
      requiresAuth: true,
    },
  },
  {
    path: '/report',
    name: 'Report',
    component: () => import('@/views/report/index.vue'),
    meta: {
      title: 'Report',
      requiresAuth: true,
    },
  },
  {
    path: '/security',
    name: 'Security',
    component: () => import('@/views/security/index.vue'),
    meta: {
      title: 'Security Center',
      requiresAuth: true,
    },
  },
  {
    path: '/security/bind-phone',
    name: 'SecurityBindPhone',
    component: () => import('@/views/security/bind-phone.vue'),
    meta: {
      title: 'Bind Phone',
      requiresAuth: true,
    },
  },
  {
    path: '/security/bind-email',
    name: 'SecurityBindEmail',
    component: () => import('@/views/security/bind-email.vue'),
    meta: {
      title: 'Bind Email',
      requiresAuth: true,
    },
  },
  {
    path: '/security/bind-login-password',
    name: 'SecurityBindLoginPassword',
    component: () => import('@/views/security/bind-login-password.vue'),
    meta: {
      title: 'Bind Login Password',
      requiresAuth: true,
    },
  },
  {
    path: '/security/bind-pay-password',
    name: 'SecurityBindPayPassword',
    component: () => import('@/views/security/bind-pay-password.vue'),
    meta: {
      title: 'Bind Assets Password',
      requiresAuth: true,
    },
  },
  {
    path: '/security/change-login-password',
    name: 'SecurityChangeLoginPassword',
    component: () => import('@/views/security/change-login-password.vue'),
    meta: {
      title: 'Change Login Password',
      requiresAuth: true,
    },
  },
  {
    path: '/security/change-assets-password',
    name: 'SecurityChangeAssetsPassword',
    component: () => import('@/views/security/change-assets-password.vue'),
    meta: {
      title: 'Change Assets Password',
      requiresAuth: true,
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: {
      title: '页面不存在',
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

  // 设置页面标题
  document.title = (to.meta.title as string) || 'JH H5'

  // 检查是否需要登录
  if (to.meta.requiresAuth) {
    const userStore = useUserStore()
    if (!userStore.isLogin) {
      showToast('Please login first')
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

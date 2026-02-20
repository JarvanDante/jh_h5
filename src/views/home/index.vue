<template>
  <div class="home-page">
    <!-- 顶部导航栏 -->
    <div class="top-bar">
      <div class="logo">
        <div class="logo-img">🎰</div>
        <span class="logo-text">JILIEVO.CC</span>
      </div>
      <div class="top-actions">
        <!-- 未登录状态：不显示顶部Login按钮 -->
        <template v-if="!isLogin"> </template>

        <!-- 已登录状态 -->
        <template v-else>
          <div class="notification" @click="goToMessages">
            <van-badge :content="notificationCount" max="99">
              <van-icon name="envelop-o" size="24" color="#fff" />
            </van-badge>
          </div>
          <div class="user-info" @click="goToUser">
            <van-icon name="user-circle-o" size="24" color="#fff" />
            <div class="user-balance">
              <span class="username">{{ username }}</span>
              <div class="balance-row">
                <span class="balance">₱{{ displayBalance }}</span>
                <van-icon
                  name="replay"
                  size="16"
                  color="#fdb927"
                  :class="{ rotating: isRefreshing }"
                  @click.stop="refreshBalance"
                />
              </div>
            </div>
          </div>
        </template>

        <div class="language">
          <div class="flag-circle">
            <img src="/flag.jpg" alt="PH" class="flag-img" />
          </div>
        </div>
        <van-icon name="wap-nav" size="24" color="#fff" @click="showMenu" />
      </div>
    </div>

    <!-- 存款/提款 或 登录/注册 按钮 -->
    <div class="action-buttons">
      <template v-if="isLogin">
        <van-button class="deposit-btn" block @click="handleDeposit"> Deposit </van-button>
        <van-button class="withdrawal-btn" block @click="handleWithdrawal"> Withdrawal </van-button>
      </template>
      <template v-else>
        <van-button class="deposit-btn" block @click="goToLogin"> Login </van-button>
        <van-button class="withdrawal-btn" block @click="goToRegister"> Register </van-button>
      </template>
    </div>

    <!-- 轮播图 -->
    <div class="banner-section">
      <van-swipe :autoplay="3000" indicator-color="#ffd700">
        <van-swipe-item v-for="(banner, index) in banners" :key="index">
          <img
            :src="normalizeAssetUrl(banner.image)"
            :alt="banner.name || `banner-${index}`"
            class="banner-img"
            @click="handleBannerClick(banner)"
            @error="handleImageError"
            @load="handleImageLoad"
          />
        </van-swipe-item>
      </van-swipe>
    </div>

    <!-- 邀请好友横幅 -->
    <div class="invite-banner" @click="handleInvite">
      <van-icon name="volume-o" size="18" color="#552583" />
      <div class="notice-marquee">
        <div class="notice-text">{{ noticeText }}</div>
      </div>
    </div>

    <!-- Jackpot 显示 -->
    <div class="jackpot-section">
      <div class="jackpot-avatar">
        <img src="/lucky777.png" alt="jackpot" class="jackpot-avatar-img" />
      </div>
      <div class="jackpot-content">
        <div class="jackpot-title-wrap">
          <span class="star">★</span>
          <div class="jackpot-title">JACKPOT</div>
          <span class="star">★</span>
        </div>
        <div class="jackpot-amount">
          <template v-for="digitInfo in jackpotDigits" :key="digitInfo.key">
            <span v-if="digitInfo.separator" class="digit-separator">{{ digitInfo.value }}</span>
            <div v-else class="digit-wrapper">
              <div class="digit-scroll" :class="{ 'digit-rolling': digitInfo.changed }">
                <template v-if="digitInfo.changed">
                  <span class="digit">{{ digitInfo.prev }}</span>
                  <span class="digit">{{ digitInfo.value }}</span>
                </template>
                <template v-else>
                  <span class="digit">{{ digitInfo.value }}</span>
                </template>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- 搜索栏和游戏区域 -->
    <div ref="mainContentRef" class="main-content" :class="{ 'sidebar-is-fixed': sidebarFixed }">
      <!-- 左侧游戏厅类型 -->
      <div ref="sidebarRef" class="game-hall-sidebar" :class="{ 'sidebar-fixed': sidebarFixed }">
        <div
          v-for="hall in gameHalls"
          :key="hall.id"
          class="hall-item"
          :class="{ active: activeHall === hall.id }"
          @click="selectHall(hall.id)"
        >
          <van-icon
            :name="hall.icon"
            size="32"
            :color="activeHall === hall.id ? '#FDB927' : '#552583'"
          />
          <span>{{ hall.name }}</span>
        </div>
      </div>

      <!-- 右侧内容区域 -->
      <div class="game-content">
        <!-- 搜索栏 -->
        <div class="search-bar">
          <van-search
            v-model="searchValue"
            placeholder="Search"
            shape="round"
            background="transparent"
          />
        </div>

        <!-- 游戏列表 -->
        <div class="game-grid">
          <div
            v-for="game in filteredGames"
            :key="game.id"
            class="game-card"
            @click="handleGameClick(game)"
          >
            <div class="game-image-wrapper">
              <img :src="normalizeAssetUrl(game.img || game.cover)" :alt="game.name" class="game-cover" />
              <div class="game-overlay">
                <van-icon name="play-circle" size="40" color="#fff" />
              </div>
            </div>
            <div class="game-info">
              <div class="game-vendor">{{ game.vendor }}</div>
              <div class="game-name">{{ game.name }}</div>
            </div>
            <van-icon
              name="like"
              :color="isGameFavorite(game.id) ? '#ff6b6b' : '#999'"
              size="20"
              class="favorite-icon"
              @click.stop="toggleFavorite(game)"
            />
            <!-- 热门标签 -->
            <div v-if="game.hot === 1" class="game-badge hot-badge">HOT</div>
            <!-- 新游戏标签 -->
            <div v-if="game.is_new === 1" class="game-badge new-badge">NEW</div>
            <!-- 推荐标签 -->
            <div v-if="game.recommend === 1" class="game-badge recommend-badge">⭐</div>
          </div>

          <!-- 加载中提示 -->
          <div v-if="gameListLoading" class="loading-wrapper">
            <van-loading type="spinner" size="24px">加载中...</van-loading>
          </div>

          <!-- 空状态 -->
          <div v-if="!gameListLoading && filteredGames.length === 0" class="empty-wrapper">
            <van-empty description="暂无游戏" />
          </div>
        </div>
      </div>
    </div>

    <!-- 浮动活动入口 -->
    <div v-if="showFloatActivity" class="float-activity" @click="router.push('/lucky_activity')">
      <div class="float-activity-close" @click.stop="showFloatActivity = false">✕</div>
      <div class="float-activity-icon">
        <img src="/luck-wheel.png" alt="Lucky Wheel" class="wheel-img" />
      </div>
    </div>

    <!-- 右侧悬浮按钮 -->
    <div class="float-buttons">
      <div class="float-btn telegram" @click="handleTelegram">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="#fff">
          <path
            d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"
          />
        </svg>
      </div>
      <div class="float-btn whatsapp" @click="handleWhatsapp">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="#fff">
          <path
            d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
          />
        </svg>
      </div>
      <div class="float-btn service" @click="handleService">
        <van-icon name="service-o" size="18" color="#fff" />
      </div>
    </div>

    <!-- 广告弹窗 -->
    <AdPopup v-model:show="showAdPopup" :ads="popupAds" @click="handleAdPopupClick" />

    <!-- 右侧抽屉菜单 -->
    <div v-if="menuVisible" class="drawer-overlay" @click="menuVisible = false"></div>
    <transition name="drawer-slide">
      <div v-if="menuVisible" class="drawer-panel" @click.stop>
        <div class="drawer-header">
          <div class="drawer-logo">
            <div class="drawer-logo-img">🎰</div>
            <span class="drawer-logo-text">JILIEVO.CC</span>
          </div>
          <van-icon name="cross" size="20" color="#fdb927" @click="menuVisible = false" />
        </div>
        <div class="drawer-menu">
          <div
            v-for="item in menuItems"
            :key="item.path"
            class="drawer-menu-item"
            @click="handleMenuClick(item.path)"
          >
            <van-icon :name="item.icon" size="22" color="#fdb927" />
            <span>{{ item.label }}</span>
          </div>
        </div>
        <div class="drawer-footer">
          <div v-if="isLogin" class="logout-btn" @click="handleLogout">
            <van-icon name="revoke" size="20" color="#fdb927" />
            <span>Logout</span>
          </div>
          <div v-else class="logout-btn" @click="handleMenuClick('/login')">
            <van-icon name="manager-o" size="20" color="#fdb927" />
            <span>Login / Register</span>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useUserStore } from '@/stores/user'
import { userApi } from '@/api/modules/user'
import { gameApi } from '@/api/modules/game'
import { refreshBalance as refreshBalanceApi } from '@/api'
import { signedFetch } from '@/utils/request'
import type { AdItem, NoticeItem } from '@/api/modules/user'
import type { GameCategory, GameItem } from '@/api/modules/game'
import AdPopup from '@/components/AdPopup.vue'

const router = useRouter()
const userStore = useUserStore()

const normalizeAssetUrl = (rawUrl?: string) => {
  const url = (rawUrl || '').trim()
  if (!url) return ''

  if (url.startsWith('data:') || url.startsWith('blob:')) return url

  const host = window.location.hostname
  const port = window.location.port

  if (url.startsWith('//')) {
    return `${window.location.protocol}${url}`
  }

  if (url.startsWith('/')) {
    return `${window.location.origin}${url}`
  }

  // 本地调试时，把 127.0.0.1 / localhost / 10.0.2.2 自动替换成当前访问主机
  return url.replace(/https?:\/\/(127\.0\.0\.1|localhost|10\.0\.2\.2)(:\d+)?/gi, (m, _h, p) => {
    const protocol = m.startsWith('https') ? 'https' : 'http'
    const usePort = p || (port ? `:${port}` : '')
    return `${protocol}://${host}${usePort}`
  })
}

// 状态
const activeTab = ref(0)
const searchValue = ref('')
const notificationCount = ref(0)
const jackpotValue = ref(2476515.21)
const activeHall = ref('hot')

// 游戏分类列表（从接口获取）
const gameCategories = ref<GameCategory[]>([])

// 游戏列表（从接口获取）
const gameList = ref<GameItem[]>([])
const gameListTotal = ref(0)
const gameListLoading = ref(false)

// 游戏厅类型（固定的 Hot 和 favorite + 动态的平台列表）
const gameHalls = computed(() => {
  const fixedHalls = [
    { id: 'hot', name: 'Hot', icon: 'fire', platform: '' },
    { id: 'favorite', name: 'favorite', icon: 'star', platform: '' },
  ]

  // 从接口获取的平台列表
  const platformHalls = gameCategories.value.map((category) => ({
    id: category.platform.toLowerCase(),
    name: category.platform,
    icon: 'apps-o', // 可以根据 image_code 或 platform 设置不同图标
    platform: category.platform,
  }))

  return [...fixedHalls, ...platformHalls]
})

// 登录状态
const isLogin = computed(() => userStore.isLogin)

// 用户信息
const username = computed(() => userStore.userInfo?.username || 'Guest')
const balance = computed(() => {
  // 优先从 localStorage 中的 user_balance 获取余额
  try {
    const userBalance = localStorage.getItem('user_balance')
    if (userBalance) {
      const balanceData = JSON.parse(userBalance)
      return balanceData.balance || '0.00'
    }
  } catch (error) {
    console.error('Failed to parse user_balance from localStorage:', error)
  }

  // 如果没有余额数据，从用户信息中获取
  return userStore.userInfo?.balance || '0.00'
})

// 轮播图
const banners = ref<AdItem[]>([])
const adList = ref<AdItem[]>([])

// 广告弹窗
const showAdPopup = ref(false)
const popupAds = ref<AdItem[]>([])

// 浮动活动入口
const showFloatActivity = ref(true)

// 左侧边栏固定
const sidebarRef = ref<HTMLElement | null>(null)
const mainContentRef = ref<HTMLElement | null>(null)
const sidebarFixed = ref(false)

// 公告列表
const noticeList = ref<NoticeItem[]>([])
const noticeText = computed(() => {
  if (noticeList.value.length === 0) return 'Welcome to JILIEVO.CC'
  return noticeList.value.map((notice) => notice.title).join('  •  ')
})

// Jackpot 数字
const previousJackpotValue = ref(2476515.21)
const jackpotRollTick = ref(0)

const formatJackpot = (value: number) => {
  const safeValue = Math.max(0, value)
  const [intPart, decimalPart] = safeValue.toFixed(2).split('.')
  return `${Number(intPart).toLocaleString('en-US')}.${decimalPart}`
}

const jackpotDigits = computed(() => {
  const current = formatJackpot(jackpotValue.value).split('')
  const previous = formatJackpot(previousJackpotValue.value).split('')

  while (current.length < previous.length) current.unshift('0')
  while (previous.length < current.length) previous.unshift('0')

  return current.map((digit, index) => ({
    value: digit,
    prev: previous[index],
    separator: digit === ',' || digit === '.',
    changed: digit !== ',' && digit !== '.' && digit !== previous[index],
    key: `${index}-${jackpotRollTick.value}`,
  }))
})

// 游戏列表
const games = ref([
  {
    id: 1,
    name: 'Super Ace',
    provider: 'JILI',
    cover: 'https://via.placeholder.com/375x320/9C27B0/FFFFFF?text=Super+Ace',
    isFavorite: false,
  },
  {
    id: 2,
    name: 'Wild Bounty Showdown',
    provider: 'Pocket Gaming',
    cover: 'https://via.placeholder.com/375x320/795548/FFFFFF?text=Wild+Bounty',
    isFavorite: false,
  },
  {
    id: 3,
    name: 'Royal Ace',
    provider: 'YELLOW',
    cover: 'https://via.placeholder.com/375x320/E91E63/FFFFFF?text=Royal+Ace',
    isFavorite: false,
  },
  {
    id: 4,
    name: 'NBA',
    provider: 'JILI',
    cover: 'https://via.placeholder.com/375x320/212121/FFFFFF?text=NBA',
    isFavorite: false,
  },
  {
    id: 5,
    name: 'Big Win',
    provider: 'Pocket Gaming',
    cover: 'https://via.placeholder.com/375x320/4CAF50/FFFFFF?text=Big+Win',
    isFavorite: false,
  },
  {
    id: 6,
    name: 'Lucky 7',
    provider: 'YELLOW',
    cover: 'https://via.placeholder.com/375x320/FF9800/FFFFFF?text=Lucky+7',
    isFavorite: false,
  },
])

// 收藏状态由后端返回 is_favorite 字段

// 是否正在刷新余额
const isRefreshing = ref(false)

// 余额显示（用于动画）
const displayBalance = ref('0.00')

const fetchUnreadCount = async () => {
  if (!isLogin.value) {
    notificationCount.value = 0
    return
  }
  try {
    const res = await userApi.getUnreadCount()
    if (res && typeof res.count === 'number') {
      notificationCount.value = res.count
    } else {
      notificationCount.value = 0
    }
  } catch (error) {
    console.error('获取未读消息数量失败:', error)
  }
}

// 监听 balance 变化，同步更新 displayBalance（非刷新按钮触发的情况）
watch(balance, (newVal) => {
  // 只在非刷新状态下同步更新（避免干扰动画）
  if (!isRefreshing.value) {
    displayBalance.value = newVal
  }
})

watch(isLogin, (val) => {
  if (val) {
    fetchUnreadCount()
  } else {
    notificationCount.value = 0
  }
})

// 数字滚动动画 - 简单的数字递增效果
const animateBalance = (oldValue: string, newValue: string) => {
  const oldNum = parseFloat(oldValue) || 0
  const newNum = parseFloat(newValue) || 0
  const duration = 800 // 动画持续时间
  const steps = 30 // 动画步数
  const stepDuration = duration / steps
  const increment = (newNum - oldNum) / steps

  let currentStep = 0
  const timer = setInterval(() => {
    currentStep++
    if (currentStep >= steps) {
      displayBalance.value = newValue
      clearInterval(timer)
    } else {
      const currentValue = oldNum + increment * currentStep
      displayBalance.value = currentValue.toFixed(2)
    }
  }, stepDuration)
}

// 过滤游戏列表
const filteredGames = computed(() => {
  let result = gameList.value

  // 根据选中的游戏厅过滤
  if (activeHall.value === 'favorite') {
    // 显示收藏的游戏
    result = result.filter((game) => Number(game.is_favorite || 0) === 1)
  } else if (activeHall.value === 'hot') {
    // 显示热门游戏
    result = result.filter((game) => game.hot === 1)
  } else if (activeHall.value !== 'hot') {
    // 如果选中的是平台，按平台过滤
    const selectedHall = gameHalls.value.find((hall) => hall.id === activeHall.value)
    if (selectedHall && selectedHall.platform) {
      result = result.filter((game) => game.platform === selectedHall.platform)
    }
  }

  // 根据搜索关键词过滤
  if (searchValue.value) {
    const keyword = searchValue.value.toLowerCase()
    result = result.filter(
      (game) =>
        game.name.toLowerCase().includes(keyword) || game.vendor.toLowerCase().includes(keyword),
    )
  }

  return result
})

// 选择游戏厅
const selectHall = (hallId: string) => {
  activeHall.value = hallId
  // 切换游戏厅时重新加载游戏列表
  fetchGameList()
}

// 方法
const goToLogin = () => {
  router.push('/login')
}

const goToRegister = () => {
  router.push('/register')
}

const goToUser = () => {
  if (!isLogin.value) {
    showToast('Please login first')
    router.push('/login')
    return
  }
  router.push('/user')
}

const goToMessages = () => {
  if (!isLogin.value) {
    showToast('Please login first')
    router.push('/login')
    return
  }
  router.push('/messages')
}

const showMenu = () => {
  menuVisible.value = true
}

const menuVisible = ref(false)

const menuItems = [
  { icon: 'gift-o', label: 'Promotion', path: '/promotion' },
  { icon: 'friends-o', label: 'Invite', path: '/invite_activity' },
  { icon: 'gold-coin-o', label: 'Deposit', path: '/deposit' },
  { icon: 'card', label: 'Withdraw', path: '/withdraw' },
  { icon: 'bar-chart-o', label: 'Report', path: '/report' },
  { icon: 'shield-o', label: 'Security', path: '/security' },
  { icon: 'manager-o', label: 'Profile', path: '/user' },
]

const handleMenuClick = (path: string) => {
  menuVisible.value = false
  router.push(path)
}

const handleLogout = () => {
  menuVisible.value = false
  userStore.logout()
  showToast('Logged out')
  router.push('/login')
}

const handleDeposit = () => {
  if (!isLogin.value) {
    showToast('Please login first')
    router.push('/login')
    return
  }
  router.push('/deposit')
}

const handleWithdrawal = () => {
  if (!isLogin.value) {
    showToast('Please login first')
    router.push('/login')
    return
  }
  router.push('/withdraw')
}

const handleInvite = () => {
  if (!isLogin.value) {
    showToast('Please login first')
    router.push('/login')
    return
  }
  showToast('邀请好友')
}

const handleHot = () => {
  showToast('热门游戏')
}

const handleCategory = (category: string) => {
  showToast(`分类: ${category}`)
}

const handleGameClick = (game: GameItem) => {
  // 检查是否有 game_id
  if (!game.game_id) {
    showToast('游戏暂不可用')
    return
  }

  // 跳转到游戏页面
  router.push({
    path: '/game',
    query: {
      game_id: game.game_id,
      key: game.code,
    },
  })
}

const toggleFavorite = async (game: GameItem) => {
  if (!isLogin.value) {
    showToast('Please login first')
    router.push('/login')
    return
  }

  try {
    const res = await gameApi.toggleFavoriteGame({
      platform: game.platform,
      game_code: game.code,
      game_id: game.game_id,
      game_name: game.name,
      vendor: game.vendor,
      style: game.style,
      game_img: game.img || game.img1 || '',
    })
    game.is_favorite = Number(res?.is_favorite || 0)
    showToast(game.is_favorite === 1 ? '已添加到收藏' : '已取消收藏')
  } catch (error) {
    console.error('收藏操作失败:', error)
    showToast('操作失败，请重试')
  }
}

// 检查游戏是否被收藏
const isGameFavorite = (gameId: number) => {
  const game = gameList.value.find((it) => Number(it.id) === Number(gameId))
  return Number(game?.is_favorite || 0) === 1
}

const handleTelegram = () => {
  const siteUrl = window.location.origin
  window.open(
    `https://t.me/share/url?url=${encodeURIComponent(siteUrl)}&text=${encodeURIComponent('Join now and win big prizes!')}`,
    '_blank',
  )
}

const handleWhatsapp = () => {
  const siteUrl = window.location.origin
  window.open(
    `https://wa.me/?text=${encodeURIComponent('Join now and win big prizes! ' + siteUrl)}`,
    '_blank',
  )
}

const handleService = () => {
  showToast('联系客服')
}

// 刷新余额
const refreshBalance = async () => {
  if (!isLogin.value) {
    showToast('Please login first')
    router.push('/login')
    return
  }

  if (isRefreshing.value) {
    return // 防止重复点击
  }

  isRefreshing.value = true
  const oldBalance = displayBalance.value

  try {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api'

    // 先调用刷新余额接口
    const refreshBalanceUrl = `${apiBaseUrl}/frontend/balance/refresh-balance`
    const refreshBalanceResponse = await signedFetch(refreshBalanceUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${userStore.token}`,
      },
    })

    const refreshBalanceResult = await refreshBalanceResponse.json()

    // 检查 token 是否过期
    if (refreshBalanceResult.code === 401 || refreshBalanceResult.code === 403) {
      // Token 过期，尝试刷新
      const refreshToken = userStore.refreshToken
      if (refreshToken) {
        const refreshUrl = `${apiBaseUrl}/frontend/app/refresh-token`
        const refreshResponse = await signedFetch(refreshUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            refresh_token: refreshToken,
          }),
        })

        const refreshResult = await refreshResponse.json()

        if (refreshResult.code === 0 && refreshResult.data?.token) {
          // 更新 token
          userStore.setToken(refreshResult.data.token)
          if (refreshResult.data.refresh_token) {
            userStore.setRefreshToken(refreshResult.data.refresh_token)
          }

          // 使用新 token 重新请求余额
          const retryResponse = await signedFetch(refreshBalanceUrl, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${refreshResult.data.token}`,
            },
          })

          const retryResult = await retryResponse.json()

          if (retryResult.code === 0 && retryResult.data) {
            // 保存余额信息到 localStorage
            localStorage.setItem('user_balance', JSON.stringify(retryResult.data))

            // 更新用户信息中的余额
            if (userStore.userInfo) {
              // 从 localStorage 获取完整的 user_info（包含 grade_id 和 is_pay_password）
              let fullUserInfo = { ...userStore.userInfo }
              try {
                const storedUserInfo = localStorage.getItem('user_info')
                if (storedUserInfo) {
                  fullUserInfo = JSON.parse(storedUserInfo)
                }
              } catch (error) {
                console.error('Failed to parse user_info:', error)
              }

              userStore.setUserInfo({
                ...fullUserInfo,
                balance: retryResult.data.balance || '0.000',
              })
            }

            // 触发余额动画
            animateBalance(oldBalance, retryResult.data.balance || '0.000')
          }
        } else {
          // 刷新失败，跳转到登录页
          userStore.logout()
          showToast('Login expired, please login again')
          router.push('/login')
        }
      } else {
        // 没有 refresh_token，跳转到登录页
        userStore.logout()
        showToast('Please login again')
        router.push('/login')
      }
      isRefreshing.value = false
      return
    }

    if (refreshBalanceResult.code === 0 && refreshBalanceResult.data) {
      // 保存余额信息到 localStorage
      localStorage.setItem('user_balance', JSON.stringify(refreshBalanceResult.data))

      // 更新用户信息中的余额
      if (userStore.userInfo) {
        // 从 localStorage 获取完整的 user_info（包含 grade_id 和 is_pay_password）
        let fullUserInfo = { ...userStore.userInfo }
        try {
          const storedUserInfo = localStorage.getItem('user_info')
          if (storedUserInfo) {
            fullUserInfo = JSON.parse(storedUserInfo)
          }
        } catch (error) {
          console.error('Failed to parse user_info:', error)
        }

        userStore.setUserInfo({
          ...fullUserInfo,
          balance: refreshBalanceResult.data.balance || '0.000',
        })
      }

      // 触发余额动画
      animateBalance(oldBalance, refreshBalanceResult.data.balance || '0.000')
    } else {
      showToast(refreshBalanceResult.msg || 'Failed to refresh balance')
    }
  } catch (error) {
    console.error('Failed to refresh balance:', error)
    showToast('Failed to refresh balance')
  } finally {
    setTimeout(() => {
      isRefreshing.value = false
    }, 1000) // 确保动画完成后才允许再次点击
  }
}

// 获取广告列表
const fetchAdList = async () => {
  try {
    const res = await userApi.getAdList()
    console.log('广告列表响应:', res)

    // 响应拦截器已经处理过，直接返回data部分
    if (res?.list && res.list.length > 0) {
      adList.value = res.list

      // position=1 的是 banner 轮播
      const bannerAds = res.list
        .filter((ad: AdItem) => ad.position === 1)
        .sort((a: AdItem, b: AdItem) => (b.sort ?? 0) - (a.sort ?? 0))
      if (bannerAds.length > 0) {
        banners.value = bannerAds.map((ad: AdItem) => ({
          ...ad,
          image: normalizeAssetUrl(ad.image),
        }))
      }

      // position=2 的是弹窗广告
      const popupAdList = res.list
        .filter((ad: AdItem) => ad.position === 2)
        .map((ad: AdItem) => ({
          ...ad,
          image: normalizeAssetUrl(ad.image),
        }))
      const adPopupShown = sessionStorage.getItem('ad_popup_shown')
      const adPopupResume = localStorage.getItem('ad_popup_resume') === '1'
      if ((adPopupResume || !adPopupShown) && popupAdList.length > 0) {
        popupAds.value = popupAdList
        setTimeout(() => {
          showAdPopup.value = true
          sessionStorage.setItem('ad_popup_shown', '1')
          if (adPopupResume) {
            localStorage.removeItem('ad_popup_resume')
          }
        }, 500)
      }

      console.log('Banner图片列表:', banners.value)
    } else {
      console.log('接口没有返回数据，使用默认图片')
      // 如果接口没有数据，使用默认图片
      banners.value = [
        {
          before_login: 0,
          image: 'https://via.placeholder.com/750x360/552583/FDB927?text=Welcome+Bonus',
          name: 'Welcome Bonus',
          position: 1,
          sort: 1,
          type: 1,
          url: '/promotion',
        },
        {
          before_login: 0,
          image: 'https://via.placeholder.com/750x360/FDB927/552583?text=Daily+Rewards',
          name: 'Daily Rewards',
          position: 1,
          sort: 2,
          type: 1,
          url: '/activity/lucky',
        },
        {
          before_login: 0,
          image: 'https://via.placeholder.com/750x360/552583/FFFFFF?text=VIP+Club',
          name: 'VIP Club',
          position: 1,
          sort: 3,
          type: 1,
          url: '/invite',
        },
      ]
    }
  } catch (error) {
    console.error('获取广告列表失败:', error)
    // 失败时使用默认图片
    banners.value = [
      {
        before_login: 0,
        image: 'https://via.placeholder.com/750x360/552583/FDB927?text=Welcome+Bonus',
        name: 'Welcome Bonus',
        position: 1,
        sort: 1,
        type: 1,
        url: '/promotion',
      },
      {
        before_login: 0,
        image: 'https://via.placeholder.com/750x360/FDB927/552583?text=Daily+Rewards',
        name: 'Daily Rewards',
        position: 1,
        sort: 2,
        type: 1,
        url: '/activity/lucky',
      },
      {
        before_login: 0,
        image: 'https://via.placeholder.com/750x360/552583/FFFFFF?text=VIP+Club',
        name: 'VIP Club',
        position: 1,
        sort: 3,
        type: 1,
        url: '/invite',
      },
    ]
  }
}

// 获取公告列表
const fetchNoticeList = async () => {
  try {
    const res = await userApi.getNoticeList()
    console.log('公告列表响应:', res)

    if (res?.list && res.list.length > 0) {
      noticeList.value = res.list
    }
  } catch (error) {
    console.error('获取公告列表失败:', error)
  }
}

const handleAdPopupClick = () => {
  // 如果未登录点击了弹窗，记录需要回到首页后再次弹出
  if (!userStore.isLogin) {
    localStorage.setItem('ad_popup_resume', '1')
  }
}

const handleBannerClick = (ad: AdItem) => {
  if (!ad?.url) return

  const url = ad.url.trim()
  if (!url) return

  // 外链直接跳转
  if (/^https?:\/\//i.test(url)) {
    window.location.href = url
    return
  }

  // 站内路由跳转
  const routePath = url.startsWith('/') ? url : `/${url}`
  router.push(routePath)
}

// 获取游戏分类列表
const fetchGameCategories = async () => {
  try {
    const res = await gameApi.getGameCategories()
    console.log('游戏分类响应:', res)

    if (res?.categories && res.categories.length > 0) {
      gameCategories.value = res.categories
      console.log('游戏分类列表:', gameCategories.value)
    }
  } catch (error) {
    console.error('获取游戏分类失败:', error)
  }
}

// 获取游戏列表
const fetchGameList = async () => {
  try {
    gameListLoading.value = true

    // 收藏大厅走专用接口
    if (activeHall.value === 'favorite') {
      if (!isLogin.value) {
        gameList.value = []
        gameListTotal.value = 0
        return
      }
      const favRes = await gameApi.getFavoriteGameList()
      console.log('收藏游戏列表响应:', favRes)
      if (favRes?.list && favRes.list.length > 0) {
        gameList.value = favRes.list.map((game: any) => ({
          ...game,
          is_favorite: 1,
          img: normalizeAssetUrl(game.img || game.cover),
          cover: normalizeAssetUrl(game.cover || game.img),
        }))
        gameListTotal.value = favRes.total || favRes.list.length
      } else {
        gameList.value = []
        gameListTotal.value = 0
      }
      return
    }

    // 根据当前选中的游戏厅构建请求参数
    const params: any = {
      page: 1,
      size: 100, // 一次加载更多游戏
    }

    if (activeHall.value === 'hot') {
      params.hot = 1
    } else {
      // 如果选中的是平台
      const selectedHall = gameHalls.value.find((hall) => hall.id === activeHall.value)
      if (selectedHall && selectedHall.platform) {
        params.platform = selectedHall.platform
      }
    }

    const res = await gameApi.getGameList(params)
    console.log('游戏列表响应:', res)

    if (res?.list && res.list.length > 0) {
      gameList.value = res.list.map((game: any) => ({
        ...game,
        img: normalizeAssetUrl(game.img || game.cover),
        cover: normalizeAssetUrl(game.cover || game.img),
      }))
      gameListTotal.value = res.total
      console.log('游戏列表:', gameList.value)
    } else {
      gameList.value = []
      gameListTotal.value = 0
    }
  } catch (error) {
    console.error('获取游戏列表失败:', error)
    gameList.value = []
    gameListTotal.value = 0
  } finally {
    gameListLoading.value = false
  }
}

// Jackpot 数字滚动效果
onMounted(() => {
  // 初始化显示余额
  displayBalance.value = balance.value

  // 获取广告列表
  fetchAdList()

  // 获取公告列表
  fetchNoticeList()

  // 获取游戏分类列表
  fetchGameCategories()

  // 获取游戏列表
  fetchGameList()

  // 如果已登录，尝试从 localStorage 刷新余额显示
  if (isLogin.value) {
    fetchUnreadCount()
    try {
      const userBalance = localStorage.getItem('user_balance')
      if (userBalance) {
        const balanceData = JSON.parse(userBalance)
        // 触发响应式更新
        if (userStore.userInfo && balanceData.balance) {
          // 从 localStorage 获取完整的 user_info（包含 grade_id 和 is_pay_password）
          let fullUserInfo = { ...userStore.userInfo }
          try {
            const storedUserInfo = localStorage.getItem('user_info')
            if (storedUserInfo) {
              fullUserInfo = JSON.parse(storedUserInfo)
            }
          } catch (error) {
            console.error('Failed to parse user_info:', error)
          }

          userStore.setUserInfo({
            ...fullUserInfo,
            balance: balanceData.balance,
          })

          // 更新显示余额
          displayBalance.value = balanceData.balance
        }
      }
    } catch (error) {
      console.error('Failed to load balance from localStorage:', error)
    }
  }

  // Jackpot 滚动（更平滑，接近赌场数字翻牌效果）
  setInterval(() => {
    previousJackpotValue.value = jackpotValue.value
    jackpotValue.value += Math.floor(Math.random() * 20) + Math.round(Math.random() * 99) / 100
    if (jackpotValue.value >= 9999999.99) {
      jackpotValue.value = 1000000 + Math.round(Math.random() * 8999999 * 100) / 100
    }
    jackpotRollTick.value += 1
  }, 1200)

  // 监听滚动，固定左侧边栏
  const scrollContainer = document.querySelector('.app-container')
  if (scrollContainer) {
    scrollContainer.addEventListener('scroll', handleScroll)
  }
})

const handleScroll = () => {
  if (!mainContentRef.value) return
  const rect = mainContentRef.value.getBoundingClientRect()
  // 当 main-content 的顶部滚动到导航栏下方时，固定侧边栏
  sidebarFixed.value = rect.top <= 72
}

onUnmounted(() => {
  const scrollContainer = document.querySelector('.app-container')
  if (scrollContainer) {
    scrollContainer.removeEventListener('scroll', handleScroll)
  }
})
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.home-page {
  position: relative;
  min-height: 100vh;
  overflow-x: hidden;
  padding-top: 64px;
  background: linear-gradient(
    135deg,
    #ffffff 0%,
    #f8f8f8 40%,
    #e8d5f0 70%,
    #d4b5e8 85%,
    #c8a5e0 100%
  );
  padding-bottom: 50px;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: repeating-linear-gradient(
      45deg,
      transparent,
      transparent 10px,
      rgba(255, 255, 255, 0.03) 10px,
      rgba(255, 255, 255, 0.03) 20px
    );
    backdrop-filter: blur(1px);
    pointer-events: none;
  }

  > * {
    position: relative;
    z-index: 1;
  }

  // 顶部导航栏
  .top-bar {
    position: fixed;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 414px;
    z-index: 100;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: $gradient-purple;
    box-shadow: $shadow-md;

    @media (max-width: 414px) {
      left: 0;
      transform: none;
      max-width: 100%;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 8px;

      .logo-img {
        width: 40px;
        height: 40px;
        border-radius: 8px;
        background: #fdb927;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
      }

      .logo-text {
        color: #fdb927;
        font-weight: bold;
        font-size: 16px;
      }
    }

    .top-actions {
      display: flex;
      align-items: center;
      gap: 16px;

      .login-btn {
        font-weight: bold;
        border-radius: $border-radius-md;
        padding: 8px 20px;
        background: #fdb927;
        color: #1f1f1f;
      }

      .user-info {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;

        .user-balance {
          display: flex;
          flex-direction: column;
          align-items: flex-start;

          .username {
            color: #fff;
            font-size: 14px;
          }

          .balance-row {
            margin-top: 3px;
            display: flex;
            align-items: center;
            gap: 6px;

            .balance {
              color: #fdb927;
              font-size: 12px;
              font-weight: bold;
            }

            .van-icon {
              cursor: pointer;
              transition: opacity 0.3s;

              &:active {
                opacity: 0.7;
              }

              &.rotating {
                animation: rotate 1s linear;
              }
            }
          }
        }
      }

      .flag-circle {
        width: 22px;
        height: 22px;
        border-radius: 50%;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;

        .flag-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
    }
  }

  // 存款/提款按钮
  .action-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    padding: 8px 16px;

    .deposit-btn {
      background: transparent;
      color: #fdb927;
      border: 2px solid #fdb927;
      border-radius: 20px;
      font-weight: bold;
      font-size: 13px;
      height: 32px;
      transition: $transition-base;

      &:active {
        background: rgba(253, 185, 39, 0.1);
      }
    }

    .withdrawal-btn {
      background: #fdb927;
      color: #1f1f1f;
      border: none;
      border-radius: 20px;
      font-weight: bold;
      font-size: 13px;
      height: 32px;
      transition: $transition-base;

      &:active {
        opacity: 0.9;
      }
    }
  }

  // 轮播图
  .banner-section {
    padding: 0;
    margin-bottom: 8px;

    .banner-img {
      width: 100%;
      height: 200px;
      border-radius: 0;
      object-fit: cover;
    }
  }

  // 邀请好友横幅（公告跑马灯）
  .invite-banner {
    margin: 0 12px 6px;
    padding: 4px 10px;
    background: rgba(253, 185, 39, 0.1);
    border: 1px solid #fdb927;
    border-radius: 20px;
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    transition: $transition-base;
    overflow: hidden;

    &:active {
      background: rgba(253, 185, 39, 0.2);
    }

    .notice-marquee {
      flex: 1;
      overflow: hidden;
      position: relative;
      height: 18px;
      display: flex;
      align-items: center;

      .notice-text {
        display: inline-block;
        white-space: nowrap;
        color: #7a49ba;
        font-size: 11px;
        font-weight: 600;
        line-height: 18px;
        animation: marquee 20s linear infinite;
        padding-left: 100%;
      }
    }
  }

  @keyframes marquee {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-100%);
    }
  }

  // Jackpot 显示（参考赌场风格）
  .jackpot-section {
    margin: 0 10px 8px;
    padding: 1px 10px 1px;
    background: linear-gradient(90deg, #3a1f62 0%, #6b37a7 52%, #43226f 100%);
    border: 1px solid #ffcf5a;
    border-radius: 10px;
    display: flex;
    align-items: center;
    gap: 8px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 4px 10px rgba(31, 15, 50, 0.45);

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at 70% 50%, rgba(189, 133, 255, 0.22) 0%, transparent 62%);
      pointer-events: none;
    }

    .jackpot-avatar {
      width: 64px;
      height: 64px;
      border-radius: 0;
      background: transparent;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: none;
      z-index: 1;
      overflow: visible;

      .jackpot-avatar-img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: block;
        transform: scale(1.14);
      }
    }

    .jackpot-content {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 4px;
      z-index: 1;
    }

    .jackpot-title-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;

      .star {
        color: #ffdf7a;
        font-size: 10px;
      }
    }

    .jackpot-title {
      color: #ffe083;
      font-size: 16px;
      font-weight: 900;
      line-height: 1;
      letter-spacing: 0.5px;
      text-shadow: 0 1px 0 #8d5a1b, 0 0 10px rgba(179, 122, 255, 0.75);
    }

    .jackpot-amount {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 2px;
      flex-wrap: nowrap;
      overflow: hidden;

      .digit-separator {
        color: #ffe08a;
        font-size: 20px;
        font-weight: 800;
        line-height: 24px;
        margin: 0 1px;
        text-shadow: 0 0 6px rgba(85, 37, 131, 0.6);
      }

      .digit-wrapper {
        width: 18px;
        height: 24px;
        background: linear-gradient(180deg, #fff8da 0%, #f9da7b 45%, #e6b63d 100%);
        border-radius: 4px;
        border: 1px solid #9b6a1b;
        box-shadow:
          inset 0 1px 0 rgba(255, 255, 255, 0.82),
          inset 0 -1px 0 rgba(166, 103, 10, 0.35),
          0 1px 3px rgba(86, 44, 145, 0.35);
        overflow: hidden;
      }

      .digit-scroll {
        display: flex;
        flex-direction: column;
        transform: translateY(0);

        &.digit-rolling {
          animation: rollStep 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
      }

      .digit {
        display: block;
        width: 100%;
        height: 24px;
        color: #161616;
        font-size: 16px;
        font-weight: 900;
        text-align: center;
        line-height: 24px;
      }
    }
  }

  @keyframes rollStep {
    0% {
      transform: translateY(0);
    }
    100% {
      transform: translateY(-24px);
    }
  }

  // 主内容区域（左侧边栏 + 右侧游戏区）
  .main-content {
    display: flex;
    gap: 8px;
    padding: 0 8px 16px;
    min-height: 400px;

    &.sidebar-is-fixed {
      padding-left: 96px;
    }
  }

  // 左侧游戏厅类型边栏
  .game-hall-sidebar {
    width: 80px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;

    &.sidebar-fixed {
      position: fixed;
      top: 72px;
      left: calc(50% - 207px + 8px);
      width: 80px;
      max-height: calc(100vh - 64px - 60px);
      overflow-y: auto;
      z-index: 99;
      scrollbar-width: none;
      &::-webkit-scrollbar {
        display: none;
      }

      @media (max-width: 414px) {
        left: 8px;
      }
    }

    .hall-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 12px 8px;
      background: #552583;
      border: 2px solid #552583;
      border-radius: 12px;
      cursor: pointer;
      transition: $transition-base;
      box-shadow: 0 2px 8px rgba(85, 37, 131, 0.3);

      &.active {
        border: 3px solid #fdb927;
        box-shadow: 0 0 12px rgba(253, 185, 39, 0.6);
      }

      &:active {
        transform: scale(0.95);
      }

      :deep(.van-icon) {
        color: #fdb927 !important;
      }

      span {
        color: #fff;
        font-size: 11px;
        font-weight: 600;
        text-align: center;
        line-height: 1.2;
      }
    }
  }

  // 右侧游戏内容区域
  .game-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-width: 0;
    overflow: hidden;
  }

  // 搜索栏
  .search-bar {
    :deep(.van-search) {
      padding: 0;

      .van-search__content {
        background: #1f1f1f;
        border: 2px solid #552583;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(85, 37, 131, 0.2);
      }

      input {
        color: #fff;
        font-size: 14px;

        &::placeholder {
          color: #666;
        }
      }

      .van-icon {
        color: #fdb927;
      }
    }
  }

  // 游戏网格（一行3个）
  .game-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
    overflow: hidden;

    .game-card {
      position: relative;
      border-radius: 8px;
      overflow: hidden !important;
      cursor: pointer;
      box-shadow: $shadow-sm;
      background: $background-color;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

      // 点击动态效果
      &:active {
        transform: scale(0.95);
        box-shadow: 0 2px 8px rgba(85, 37, 131, 0.3);

        .game-image-wrapper {
          .game-overlay {
            opacity: 1;
          }
        }
      }

      // 悬停效果（PC端）
      @media (hover: hover) {
        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 16px rgba(85, 37, 131, 0.2);

          .game-image-wrapper {
            .game-overlay {
              opacity: 1;
            }
          }
        }
      }

      .game-image-wrapper {
        position: relative;
        width: 100%;
        height: 100px;
        overflow: hidden;

        .game-cover {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .game-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(85, 37, 131, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
      }

      &:active .game-image-wrapper .game-cover {
        transform: scale(1.1);
      }

      .game-info {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 6px;
        background: linear-gradient(to top, rgba(31, 31, 31, 0.95), transparent);

        .game-vendor {
          color: #fdb927;
          font-size: 9px;
          margin-bottom: 2px;
          font-weight: 600;
        }

        .game-name {
          color: $text-color-light;
          font-size: 11px;
          font-weight: bold;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }

      .favorite-icon {
        position: absolute;
        top: 4px;
        right: 4px;
        background: rgba(255, 255, 255, 0.9);
        padding: 4px;
        border-radius: 50%;
        transition: all 0.3s ease;
        z-index: 2;

        &:active {
          transform: scale(1.2);
        }
      }

      // 游戏标签
      .game-badge {
        position: absolute;
        top: 4px;
        left: 4px;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 9px;
        font-weight: bold;
        z-index: 2;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }

      .hot-badge {
        background: #ff4757;
        color: #fff;
      }

      .new-badge {
        background: #44a08d;
        color: #fff;
      }

      .recommend-badge {
        background: #fdb927;
        color: #1f1f1f;
        top: 24px;
      }
    }

    .loading-wrapper {
      grid-column: 1 / -1;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 40px 0;
    }

    .empty-wrapper {
      grid-column: 1 / -1;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 40px 0;
    }
  }

  // 搜索栏（旧版，已删除）
  .search-section {
    padding: 0 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;

    .hot-icon {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      cursor: pointer;

      span {
        color: $text-color;
        font-size: 12px;
      }
    }

    :deep(.van-search) {
      flex: 1;
      padding: 0;

      .van-search__content {
        background: $background-color-light;
        border: 1px solid $border-color;
      }

      input {
        color: $text-color;

        &::placeholder {
          color: $text-color-secondary;
        }
      }
    }
  }

  // 游戏分类（旧版，已删除）
  .category-section {
    display: none;
  }

  // 游戏列表（旧版，已删除）
  .game-list {
    display: none;
  }

  // 右侧悬浮按钮
  // 浮动活动入口
  .float-activity {
    position: fixed;
    right: calc(50% - 207px + 2px);
    top: 400px;
    z-index: 998;

    @media (max-width: 414px) {
      right: 2px;
    }
    width: 56px;
    height: 56px;
    border-radius: 14px;
    background: transparent;
    border: none;
    box-shadow: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    animation: floatBounce 3s ease-in-out infinite;

    .float-activity-close {
      position: absolute;
      top: -8px;
      left: -8px;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.6);
      color: #fff;
      font-size: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2;
    }

    .float-activity-icon {
      line-height: 1;

      .wheel-img {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        object-fit: cover;
      }
    }

    .float-activity-label {
      font-size: 8px;
      color: #fdb927;
      font-weight: 900;
      margin-top: 2px;
      letter-spacing: 0.5px;
    }
  }

  @keyframes floatBounce {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-6px);
    }
  }

  .float-buttons {
    position: fixed;
    right: calc(50% - 207px + 8px);
    bottom: 120px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    z-index: 999;

    @media (max-width: 414px) {
      right: 8px;
    }

    .float-btn {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      transition: transform 0.3s;

      &:active {
        transform: scale(0.9);
      }

      &.telegram {
        background: linear-gradient(135deg, #2aabee, #0088cc);
        border: 2px solid rgba(255, 215, 0, 0.5);
      }

      &.whatsapp {
        background: linear-gradient(135deg, #25d366, #128c7e);
        border: 2px solid rgba(255, 215, 0, 0.5);
      }

      &.service {
        background: #552583;
        border: 2px solid rgba(255, 215, 0, 0.5);
      }
    }
  }
}

// 抽屉菜单样式
.drawer-overlay {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 414px;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9998;

  @media (max-width: 414px) {
    left: 0;
    transform: none;
    max-width: 100%;
  }
}

.drawer-panel {
  position: fixed;
  top: 0;
  right: calc(50% - 207px);
  width: 200px;
  height: 100%;
  background: linear-gradient(180deg, #552583 0%, #3a1a5e 100%);
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.4);
  z-index: 9999;
  overflow: hidden;

  @media (max-width: 414px) {
    right: 0;
  }
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 16px 16px;
  border-bottom: 1px solid rgba(253, 185, 39, 0.15);
}

.drawer-logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.drawer-logo-img {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #fdb927;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

.drawer-logo-text {
  color: #fdb927;
  font-size: 18px;
  font-weight: bold;
}

.drawer-menu {
  flex: 1;
  overflow-y: auto;
  padding: 20px 0 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.drawer-menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 0;
  width: 120px;
  cursor: pointer;
  transition: background 0.2s;

  &:active {
    background: rgba(253, 185, 39, 0.1);
  }

  :deep(.van-icon) {
    color: #fdb927 !important;
  }

  span {
    font-size: 14px;
    color: #fdb927;
    font-weight: 500;
  }
}

.drawer-footer {
  padding: 16px;
  border-top: 1px solid rgba(253, 185, 39, 0.15);
}

.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 0;
  cursor: pointer;

  span {
    font-size: 14px;
    color: #fdb927;
    font-weight: 500;
  }
}

.drawer-slide-enter-active {
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.drawer-slide-leave-active {
  transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.drawer-slide-enter-from {
  width: 0 !important;
}

.drawer-slide-leave-to {
  width: 0 !important;
}
</style>

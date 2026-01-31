<template>
  <div class="home-page">
    <!-- 顶部导航栏 -->
    <div class="top-bar">
      <div class="logo">
        <div class="logo-img">🎰</div>
        <span class="logo-text">JILIEVO.CC</span>
      </div>
      <div class="top-actions">
        <!-- 未登录状态 -->
        <template v-if="!isLogin">
          <van-button size="small" color="#FDB927" @click="goToLogin" class="login-btn">
            Login
          </van-button>
        </template>

        <!-- 已登录状态 -->
        <template v-else>
          <div class="notification">
            <van-badge :content="notificationCount" max="99">
              <van-icon name="bell" size="24" color="#fff" />
            </van-badge>
          </div>
          <div class="user-info" @click="goToUser">
            <van-icon name="user-circle-o" size="24" color="#fff" />
            <div class="user-balance">
              <span class="username">{{ username }}</span>
              <div class="balance-row">
                <span class="balance">₱{{ balance }}</span>
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
          <span class="flag-icon">🇵🇭</span>
        </div>
        <van-icon name="wap-nav" size="24" color="#fff" @click="showMenu" />
      </div>
    </div>

    <!-- 存款/提款按钮 -->
    <div class="action-buttons">
      <van-button class="deposit-btn" block @click="handleDeposit"> Deposit </van-button>
      <van-button class="withdrawal-btn" block @click="handleWithdrawal"> Withdrawal </van-button>
    </div>

    <!-- 轮播图 -->
    <div class="banner-section">
      <van-swipe :autoplay="3000" indicator-color="#ffd700">
        <van-swipe-item v-for="(banner, index) in banners" :key="index">
          <img :src="banner" class="banner-img" @error="handleImageError" @load="handleImageLoad" />
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
      <div class="jackpot-icon">💰</div>
      <div class="jackpot-content">
        <div class="jackpot-title">JACKPOT</div>
        <div class="jackpot-amount">
          <div v-for="digitInfo in jackpotDigits" :key="digitInfo.key" class="digit-wrapper">
            <div class="digit-scroll" :class="{ 'digit-rolling': digitInfo.changed }">
              <template v-if="digitInfo.changed">
                <span class="digit">0</span>
                <span class="digit">1</span>
                <span class="digit">2</span>
                <span class="digit">3</span>
                <span class="digit">4</span>
                <span class="digit">5</span>
                <span class="digit">6</span>
                <span class="digit">7</span>
                <span class="digit">8</span>
                <span class="digit">9</span>
              </template>
              <span class="digit">{{ digitInfo.value }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索栏和游戏区域 -->
    <div class="main-content">
      <!-- 左侧游戏厅类型 -->
      <div class="game-hall-sidebar">
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
              <img :src="game.img" :alt="game.name" class="game-cover" />
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

    <!-- 右侧悬浮按钮 -->
    <div class="float-buttons">
      <div class="float-btn telegram" @click="handleTelegram">
        <van-icon name="chat-o" size="24" color="#fff" />
      </div>
      <div class="float-btn whatsapp" @click="handleWhatsapp">
        <van-icon name="chat-o" size="24" color="#fff" />
      </div>
      <div class="float-btn service" @click="handleService">
        <van-icon name="service-o" size="24" color="#fff" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useUserStore } from '@/stores/user'
import { userApi } from '@/api/modules/user'
import { gameApi } from '@/api/modules/game'
import { refreshBalance as refreshBalanceApi } from '@/api'
import type { AdItem, NoticeItem } from '@/api/modules/user'
import type { GameCategory, GameItem } from '@/api/modules/game'

const router = useRouter()
const userStore = useUserStore()

// 状态
const activeTab = ref(0)
const searchValue = ref('')
const notificationCount = ref(3)
const jackpotValue = ref(2476515210800)
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
const banners = ref<string[]>([])
const adList = ref<AdItem[]>([])

// 公告列表
const noticeList = ref<NoticeItem[]>([])
const noticeText = computed(() => {
  if (noticeList.value.length === 0) return 'Welcome to JILIEVO.CC'
  return noticeList.value.map((notice) => notice.title).join('  •  ')
})

// Jackpot 数字
const previousJackpotValue = ref(2476515210800)
const jackpotDigits = computed(() => {
  const current = jackpotValue.value.toString().split('')
  const previous = previousJackpotValue.value.toString().split('')

  // 补齐位数，确保长度一致
  while (current.length < previous.length) {
    current.unshift('0')
  }
  while (previous.length < current.length) {
    previous.unshift('0')
  }

  return current.map((digit, index) => ({
    value: digit,
    changed: digit !== previous[index],
    key: `${index}-${digit}-${digit !== previous[index] ? Date.now() : 'static'}`,
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

// 收藏的游戏ID列表
const favoriteGameIds = ref<number[]>([])

// 是否正在刷新余额
const isRefreshing = ref(false)

// 过滤游戏列表
const filteredGames = computed(() => {
  let result = gameList.value

  // 根据选中的游戏厅过滤
  if (activeHall.value === 'favorite') {
    // 显示收藏的游戏
    result = result.filter((game) => favoriteGameIds.value.includes(game.id))
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

const goToUser = () => {
  if (!isLogin.value) {
    showToast('Please login first')
    router.push('/login')
    return
  }
  router.push('/user')
}

const showMenu = () => {
  showToast('打开菜单')
}

const handleDeposit = () => {
  if (!isLogin.value) {
    showToast('Please login first')
    router.push('/login')
    return
  }
  showToast('存款')
}

const handleWithdrawal = () => {
  if (!isLogin.value) {
    showToast('Please login first')
    router.push('/login')
    return
  }
  showToast('提款')
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

const toggleFavorite = (game: GameItem) => {
  const index = favoriteGameIds.value.indexOf(game.id)
  if (index > -1) {
    favoriteGameIds.value.splice(index, 1)
    showToast('已取消收藏')
  } else {
    favoriteGameIds.value.push(game.id)
    showToast('已添加到收藏')
  }
}

// 检查游戏是否被收藏
const isGameFavorite = (gameId: number) => {
  return favoriteGameIds.value.includes(gameId)
}

const handleTelegram = () => {
  showToast('打开 Telegram')
}

const handleWhatsapp = () => {
  showToast('打开 WhatsApp')
}

const handleService = () => {
  showToast('联系客服')
}

// 刷新余额
const refreshBalance = async () => {
  if (isRefreshing.value) return

  isRefreshing.value = true

  try {
    const res = await refreshBalanceApi()

    // 更新用户store中的余额
    if (userStore.userInfo) {
      userStore.setUserInfo({
        ...userStore.userInfo,
        balance: res.balance || '0.00',
      })
    }

    showToast('Balance refreshed')
  } catch (error) {
    console.error('Failed to refresh balance:', error)
    showToast('Failed to refresh balance')
  } finally {
    // 动画持续1秒后才能再次点击
    setTimeout(() => {
      isRefreshing.value = false
    }, 1000)
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
      banners.value = res.list.map((ad) => ad.image)
      console.log('Banner图片列表:', banners.value)
    } else {
      console.log('接口没有返回数据，使用默认图片')
      // 如果接口没有数据，使用默认图片
      banners.value = [
        'https://via.placeholder.com/750x360/552583/FDB927?text=Welcome+Bonus',
        'https://via.placeholder.com/750x360/FDB927/552583?text=Daily+Rewards',
        'https://via.placeholder.com/750x360/552583/FFFFFF?text=VIP+Club',
      ]
    }
  } catch (error) {
    console.error('获取广告列表失败:', error)
    // 失败时使用默认图片
    banners.value = [
      'https://via.placeholder.com/750x360/552583/FDB927?text=Welcome+Bonus',
      'https://via.placeholder.com/750x360/FDB927/552583?text=Daily+Rewards',
      'https://via.placeholder.com/750x360/552583/FFFFFF?text=VIP+Club',
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

    // 根据当前选中的游戏厅构建请求参数
    const params: any = {
      page: 1,
      size: 100, // 一次加载更多游戏
    }

    if (activeHall.value === 'hot') {
      params.hot = 1
    } else if (activeHall.value !== 'favorite') {
      // 如果选中的是平台
      const selectedHall = gameHalls.value.find((hall) => hall.id === activeHall.value)
      if (selectedHall && selectedHall.platform) {
        params.platform = selectedHall.platform
      }
    }

    const res = await gameApi.getGameList(params)
    console.log('游戏列表响应:', res)

    if (res?.list && res.list.length > 0) {
      gameList.value = res.list
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
        }
      }
    } catch (error) {
      console.error('Failed to load balance from localStorage:', error)
    }
  }

  // Jackpot 滚动
  setInterval(() => {
    previousJackpotValue.value = jackpotValue.value
    jackpotValue.value += Math.floor(Math.random() * 100)
  }, 2000)
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
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: $gradient-purple;
    box-shadow: $shadow-md;

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

      .flag-icon {
        font-size: 24px;
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
      height: 180px;
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
      height: 16px;

      .notice-text {
        display: inline-block;
        white-space: nowrap;
        color: #fdb927;
        font-size: 11px;
        font-weight: 500;
        line-height: 16px;
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

  // Jackpot 显示
  .jackpot-section {
    margin: 0 12px 8px;
    padding: 6px 10px;
    background: #552583;
    border: 2px solid #fdb927;
    border-radius: $border-radius-lg;
    display: flex;
    align-items: center;
    gap: 8px;
    position: relative;
    overflow: hidden;
    box-shadow: $shadow-lg;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(circle at 50% 50%, rgba(253, 185, 39, 0.2) 0%, transparent 70%);
      opacity: 0.5;
    }

    .jackpot-icon {
      width: 24px;
      height: 24px;
      font-size: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      z-index: 1;
    }

    .jackpot-content {
      flex: 1;
      min-width: 0;
      z-index: 1;
      display: flex;
      align-items: center;
      gap: 24px;
    }

    .jackpot-title {
      color: #fdb927;
      font-size: 11px;
      font-weight: bold;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      flex-shrink: 0;
    }

    .jackpot-amount {
      display: flex;
      justify-content: flex-start;
      gap: 1px;
      flex-wrap: nowrap;
      overflow: hidden;
      flex: 1;

      .digit-wrapper {
        min-width: 16px;
        max-width: 20px;
        flex: 0 1 auto;
        height: 20px;
        background: #fdb927;
        border-radius: 2px;
        box-shadow: $shadow-md;
        overflow: hidden;
        position: relative;
      }

      .digit-scroll {
        display: flex;
        flex-direction: column;
        transition: transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);

        &.digit-rolling {
          animation: rollToTarget 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
      }

      .digit {
        display: block;
        width: 100%;
        height: 20px;
        color: #1f1f1f;
        font-size: 13px;
        font-weight: bold;
        text-align: center;
        line-height: 20px;
        flex-shrink: 0;
      }
    }
  }

  @keyframes rollToTarget {
    0% {
      transform: translateY(0);
    }
    100% {
      transform: translateY(-360px);
    }
  }

  // 主内容区域（左侧边栏 + 右侧游戏区）
  .main-content {
    display: flex;
    gap: 8px;
    padding: 0 8px 16px;
    min-height: 400px;
  }

  // 左侧游戏厅类型边栏
  .game-hall-sidebar {
    width: 80px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;

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
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    min-height: 200px;

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
  .float-buttons {
    position: fixed;
    right: calc(50% - 207px + 16px); // 414px / 2 = 207px，然后加上右边距
    bottom: 120px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    z-index: 999;

    .float-btn {
      width: 48px;
      height: 48px;
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
        background: #0088cc;
      }

      &.whatsapp {
        background: #25d366;
      }

      &.service {
        background: #552583;
      }
    }

    // 移动设备适配
    @media (max-width: 414px) {
      right: 16px;
    }
  }
}
</style>

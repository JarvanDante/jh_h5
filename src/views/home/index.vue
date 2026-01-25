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
              <span class="balance">₱{{ balance }}</span>
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

    <!-- 搜索栏 -->
    <div class="search-section">
      <div class="hot-icon" @click="handleHot">
        <van-icon name="fire" size="32" color="#FDB927" />
        <span>Hot</span>
      </div>
      <van-search
        v-model="searchValue"
        placeholder="Search"
        shape="round"
        background="transparent"
      />
    </div>

    <!-- 游戏分类 -->
    <div class="category-section">
      <div class="category-item" @click="handleCategory('favorite')">
        <van-icon name="star" size="32" color="#552583" />
        <span>My favorite</span>
      </div>
      <div class="category-item" @click="handleCategory('slots')">
        <van-icon name="apps-o" size="32" color="#552583" />
        <span>Slots</span>
      </div>
    </div>

    <!-- 游戏列表 -->
    <div class="game-list">
      <div v-for="game in games" :key="game.id" class="game-item" @click="handleGameClick(game)">
        <img :src="game.cover" :alt="game.name" class="game-cover" />
        <div class="game-info">
          <div class="game-provider">{{ game.provider }}</div>
          <div class="game-name">{{ game.name }}</div>
        </div>
        <van-icon
          name="like"
          :color="game.isFavorite ? '#ff6b6b' : '#999'"
          size="20"
          class="favorite-icon"
          @click.stop="toggleFavorite(game)"
        />
      </div>
    </div>

    <!-- 底部导航栏 -->
    <van-tabbar v-model="activeTab" fixed placeholder active-color="#552583">
      <van-tabbar-item icon="home-o">Home</van-tabbar-item>
      <van-tabbar-item icon="gift-o">Promotion</van-tabbar-item>
      <van-tabbar-item icon="friends-o">Invite</van-tabbar-item>
      <van-tabbar-item icon="gold-coin-o">Deposit</van-tabbar-item>
      <van-tabbar-item icon="manager-o" to="/user">Members</van-tabbar-item>
    </van-tabbar>

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
import type { AdItem, NoticeItem } from '@/api/modules/user'

const router = useRouter()
const userStore = useUserStore()

// 状态
const activeTab = ref(0)
const searchValue = ref('')
const notificationCount = ref(3)
const jackpotValue = ref(24765152108)

// 登录状态
const isLogin = computed(() => userStore.isLogin)

// 用户信息
const username = computed(() => userStore.userInfo?.username || 'Guest')
const balance = computed(() => (userStore.userInfo ? '0.00' : '0.00'))

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
const previousJackpotValue = ref(24765152108)
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

// 方法
const goToLogin = () => {
  router.push('/login')
}

const goToUser = () => {
  if (!isLogin.value) {
    showToast('请先登录')
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
    showToast('请先登录')
    router.push('/login')
    return
  }
  showToast('存款')
}

const handleWithdrawal = () => {
  if (!isLogin.value) {
    showToast('请先登录')
    router.push('/login')
    return
  }
  showToast('提款')
}

const handleInvite = () => {
  if (!isLogin.value) {
    showToast('请先登录')
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

const handleGameClick = (game: any) => {
  showToast(`打开游戏: ${game.name}`)
}

const toggleFavorite = (game: any) => {
  game.isFavorite = !game.isFavorite
  showToast(game.isFavorite ? '已添加到收藏' : '已取消收藏')
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

// Jackpot 数字滚动效果
onMounted(() => {
  // 获取广告列表
  fetchAdList()

  // 获取公告列表
  fetchNoticeList()

  // Jackpot 滚动
  setInterval(() => {
    previousJackpotValue.value = jackpotValue.value
    jackpotValue.value += Math.floor(Math.random() * 100)
  }, 2000)
})
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.home-page {
  min-height: 100vh;
  background: $background-color;
  padding-bottom: 50px;

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
        background: $gradient-gold;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
      }

      .logo-text {
        color: $secondary-color;
        font-weight: bold;
        font-size: 14px;
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
        color: $text-color;
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

          .balance {
            color: $secondary-color;
            font-size: 12px;
            font-weight: bold;
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
    gap: 12px;
    padding: 12px 16px;

    .deposit-btn {
      background: $background-color;
      color: $primary-color;
      border: 2px solid $primary-color;
      border-radius: $border-radius-md;
      font-weight: bold;
      font-size: 16px;
      height: 48px;
      transition: $transition-base;

      &:active {
        background: rgba(85, 37, 131, 0.1);
      }
    }

    .withdrawal-btn {
      background: $gradient-gold;
      color: $text-color;
      border: none;
      border-radius: $border-radius-md;
      font-weight: bold;
      font-size: 16px;
      height: 48px;
      transition: $transition-base;

      &:active {
        opacity: 0.9;
      }
    }
  }

  // 轮播图
  .banner-section {
    padding: 0 16px;
    margin-bottom: 12px;

    .banner-img {
      width: 100%;
      height: 180px;
      border-radius: 12px;
      object-fit: cover;
    }
  }

  // 邀请好友横幅（公告跑马灯）
  .invite-banner {
    margin: 0 16px 12px;
    padding: 12px 16px;
    background: rgba(253, 185, 39, 0.1);
    border: 1px solid $secondary-color;
    border-radius: 24px;
    display: flex;
    align-items: center;
    gap: 8px;
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
      height: 20px;

      .notice-text {
        display: inline-block;
        white-space: nowrap;
        color: $primary-color;
        font-size: 13px;
        font-weight: 500;
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
    margin: 0 16px 16px;
    padding: 16px;
    background: $gradient-purple;
    border: 2px solid $secondary-color;
    border-radius: $border-radius-lg;
    display: flex;
    align-items: center;
    gap: 12px;
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
      width: 50px;
      height: 50px;
      font-size: 40px;
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
    }

    .jackpot-title {
      color: $secondary-color;
      font-size: 14px;
      font-weight: bold;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      margin-bottom: 8px;
      text-align: center;
    }

    .jackpot-amount {
      display: flex;
      justify-content: center;
      gap: 2px;
      flex-wrap: nowrap;
      overflow: hidden;

      .digit-wrapper {
        min-width: 20px;
        max-width: 28px;
        flex: 0 1 auto;
        height: 36px;
        background: $gradient-gold;
        border-radius: 4px;
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
        height: 36px;
        color: $text-color;
        font-size: 20px;
        font-weight: bold;
        text-align: center;
        line-height: 36px;
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

  // 搜索栏
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

  // 游戏分类
  .category-section {
    display: flex;
    gap: 16px;
    padding: 0 16px;
    margin-bottom: 16px;

    .category-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 16px;
      background: $background-color;
      border: 2px solid $primary-color;
      border-radius: $border-radius-lg;
      cursor: pointer;
      transition: $transition-base;
      box-shadow: $shadow-sm;

      &:active {
        transform: scale(0.95);
        background: rgba(85, 37, 131, 0.05);
      }

      span {
        color: $text-color;
        font-size: 13px;
        font-weight: 500;
      }
    }
  }

  // 游戏列表
  .game-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    padding: 0 16px;

    .game-item {
      position: relative;
      border-radius: 12px;
      overflow: hidden;
      cursor: pointer;
      transition: transform 0.3s;
      box-shadow: $shadow-sm;

      &:active {
        transform: scale(0.95);
      }

      .game-cover {
        width: 100%;
        height: 160px;
        object-fit: cover;
      }

      .game-info {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 8px;
        background: linear-gradient(to top, rgba(31, 31, 31, 0.9), transparent);

        .game-provider {
          color: $secondary-color;
          font-size: 11px;
          margin-bottom: 2px;
        }

        .game-name {
          color: $text-color-light;
          font-size: 13px;
          font-weight: bold;
        }
      }

      .favorite-icon {
        position: absolute;
        top: 8px;
        right: 8px;
        background: rgba(255, 255, 255, 0.9);
        padding: 6px;
        border-radius: 50%;
      }
    }
  }

  // 右侧悬浮按钮
  .float-buttons {
    position: fixed;
    right: 16px;
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
        background: $gradient-purple-gold;
      }
    }
  }

  // 底部导航栏样式
  :deep(.van-tabbar) {
    background: $background-color;
    border-top: 1px solid $border-color;
    box-shadow: 0 -2px 8px rgba(85, 37, 131, 0.1);

    .van-tabbar-item__text {
      font-size: 11px;
    }

    .van-tabbar-item--active {
      color: $primary-color;
    }
  }
}
</style>

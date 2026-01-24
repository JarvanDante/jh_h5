<template>
  <div class="user-page">
    <van-nav-bar
      title="Members"
      fixed
      placeholder
      :style="{ background: 'linear-gradient(135deg, #552583 0%, #7B3FA8 100%)' }"
    />

    <div class="user-info">
      <van-image
        round
        width="80"
        height="80"
        :src="userStore.userInfo?.avatar || 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'"
      />
      <div class="info">
        <div class="nickname">
          {{ userStore.userInfo?.nickname || 'Guest' }}
        </div>
        <div class="username">@{{ userStore.userInfo?.username || '-' }}</div>
        <div class="balance">Balance: ₱0.00</div>
      </div>
    </div>

    <van-cell-group inset>
      <van-cell title="My Orders" is-link icon="orders-o" />
      <van-cell title="My Favorites" is-link icon="star-o" />
      <van-cell title="Transaction History" is-link icon="balance-list-o" />
      <van-cell title="Account Settings" is-link icon="setting-o" />
    </van-cell-group>

    <van-cell-group inset>
      <van-cell title="About Us" is-link icon="info-o" />
      <van-cell title="Help Center" is-link icon="question-o" />
      <van-cell title="Contact Support" is-link icon="service-o" />
    </van-cell-group>

    <div class="logout-button">
      <van-button block color="#552583" @click="handleLogout"> Logout </van-button>
    </div>

    <van-tabbar v-model="active" fixed placeholder active-color="#552583">
      <van-tabbar-item icon="home-o" to="/home">Home</van-tabbar-item>
      <van-tabbar-item icon="gift-o">Promotion</van-tabbar-item>
      <van-tabbar-item icon="friends-o">Invite</van-tabbar-item>
      <van-tabbar-item icon="gold-coin-o">Deposit</van-tabbar-item>
      <van-tabbar-item icon="manager-o">Members</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showConfirmDialog, showToast } from 'vant'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const active = ref(4)

const handleLogout = async () => {
  try {
    await showConfirmDialog({
      title: 'Confirm',
      message: 'Are you sure you want to logout?',
    })

    userStore.logout()
    showToast('Logged out successfully')
    router.replace('/home')
  } catch (error) {
    // 用户取消
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.user-page {
  min-height: 100vh;
  background: $background-color;

  :deep(.van-nav-bar) {
    .van-nav-bar__title {
      color: #fff;
    }
  }

  .user-info {
    display: flex;
    align-items: center;
    padding: 24px 16px;
    background: $gradient-purple;
    margin-bottom: 12px;
    box-shadow: $shadow-md;

    .info {
      margin-left: 16px;
      flex: 1;

      .nickname {
        font-size: 20px;
        font-weight: bold;
        margin-bottom: 4px;
        color: #fff;
      }

      .username {
        font-size: 14px;
        color: rgba(255, 255, 255, 0.8);
        margin-bottom: 8px;
      }

      .balance {
        font-size: 16px;
        color: $secondary-color;
        font-weight: bold;
      }
    }
  }

  .logout-button {
    margin: 24px 16px;
  }

  :deep(.van-cell-group) {
    margin-bottom: 12px;
  }

  :deep(.van-cell) {
    .van-icon {
      color: $primary-color;
    }
  }
}
</style>

<template>
  <div class="user-page">
    <van-nav-bar title="个人中心" fixed placeholder />

    <div class="user-info">
      <van-image
        round
        width="80"
        height="80"
        :src="
          userStore.userInfo?.avatar ||
          'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'
        "
      />
      <div class="info">
        <div class="nickname">
          {{ userStore.userInfo?.nickname || "未登录" }}
        </div>
        <div class="username">@{{ userStore.userInfo?.username || "-" }}</div>
      </div>
    </div>

    <van-cell-group inset>
      <van-cell title="我的订单" is-link />
      <van-cell title="我的收藏" is-link />
      <van-cell title="账户设置" is-link />
    </van-cell-group>

    <van-cell-group inset>
      <van-cell title="关于我们" is-link />
      <van-cell title="帮助中心" is-link />
    </van-cell-group>

    <div class="logout-button">
      <van-button block type="danger" @click="handleLogout"
        >退出登录</van-button
      >
    </div>

    <van-tabbar v-model="active" fixed placeholder>
      <van-tabbar-item icon="home-o" to="/home">首页</van-tabbar-item>
      <van-tabbar-item icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { showConfirmDialog, showToast } from "vant";
import { useUserStore } from "@/stores/user";

const router = useRouter();
const userStore = useUserStore();
const active = ref(1);

const handleLogout = async () => {
  try {
    await showConfirmDialog({
      title: "提示",
      message: "确定要退出登录吗？",
    });

    userStore.logout();
    showToast("已退出登录");
    router.replace("/login");
  } catch (error) {
    // 用户取消
  }
};
</script>

<style lang="scss" scoped>
.user-page {
  min-height: 100vh;
  background-color: #f7f8fa;

  .user-info {
    display: flex;
    align-items: center;
    padding: 24px 16px;
    background-color: #fff;
    margin-bottom: 12px;

    .info {
      margin-left: 16px;

      .nickname {
        font-size: 18px;
        font-weight: 500;
        margin-bottom: 4px;
      }

      .username {
        font-size: 14px;
        color: #969799;
      }
    }
  }

  .logout-button {
    margin: 24px 16px;
  }
}
</style>

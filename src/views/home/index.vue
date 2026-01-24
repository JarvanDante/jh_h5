<template>
  <div class="home-page">
    <van-nav-bar title="首页" fixed placeholder />

    <div class="content">
      <van-cell-group inset>
        <van-cell title="欢迎使用 JH H5" />
        <van-cell title="Vue 3 + Vite + Vant 4" />
      </van-cell-group>

      <div class="button-group">
        <van-button type="primary" block @click="goToUser">个人中心</van-button>
        <van-button type="success" block @click="showMessage"
          >显示提示</van-button
        >
      </div>
    </div>

    <van-tabbar v-model="active" fixed placeholder>
      <van-tabbar-item icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item icon="user-o" to="/user">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { showToast } from "vant";

const router = useRouter();
const active = ref(0);

const goToUser = () => {
  router.push("/user");
};

const showMessage = () => {
  showToast("这是一个提示消息");
};
</script>

<style lang="scss" scoped>
.home-page {
  min-height: 100vh;
  background-color: #f7f8fa;

  .content {
    padding: 16px;

    .button-group {
      margin-top: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
  }
}
</style>

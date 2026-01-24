<template>
  <div class="login-page">
    <van-nav-bar title="登录" left-arrow @click-left="onClickLeft" />

    <div class="login-form">
      <div class="logo">
        <h1>JH H5</h1>
      </div>

      <van-form @submit="onSubmit">
        <van-cell-group inset>
          <van-field
            v-model="formData.username"
            name="username"
            label="用户名"
            placeholder="请输入用户名"
            :rules="[{ required: true, message: '请输入用户名' }]"
          />
          <van-field
            v-model="formData.password"
            type="password"
            name="password"
            label="密码"
            placeholder="请输入密码"
            :rules="[{ required: true, message: '请输入密码' }]"
          />
        </van-cell-group>

        <div class="submit-button">
          <van-button
            round
            block
            type="primary"
            native-type="submit"
            :loading="loading"
          >
            登录
          </van-button>
        </div>
      </van-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { useRouter, useRoute } from "vue-router";
import { showToast } from "vant";
import { useUserStore } from "@/stores/user";
import { userApi, type LoginParams } from "@/api";

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const loading = ref(false);
const formData = reactive<LoginParams>({
  username: "",
  password: "",
});

const onClickLeft = () => {
  router.back();
};

const onSubmit = async () => {
  try {
    loading.value = true;
    const res = await userApi.login(formData);

    userStore.setToken(res.token);
    userStore.setUserInfo(res.userInfo);

    showToast("登录成功");

    // 跳转到之前的页面或首页
    const redirect = route.query.redirect as string;
    router.replace(redirect || "/home");
  } catch (error) {
    console.error("登录失败:", error);
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  background-color: #f7f8fa;

  .login-form {
    padding: 40px 16px;

    .logo {
      text-align: center;
      margin-bottom: 40px;

      h1 {
        font-size: 32px;
        color: #1989fa;
      }
    }

    .submit-button {
      margin-top: 24px;
      padding: 0 16px;
    }
  }
}
</style>

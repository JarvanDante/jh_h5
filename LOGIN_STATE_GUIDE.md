# 登录状态管理指南

## 概述

本项目使用 Pinia 进行统一的登录状态管理，所有页面和组件都通过 `useUserStore` 来判断用户的登录状态。

## Pinia Store 结构

### User Store (`src/stores/user.ts`)

```typescript
export const useUserStore = defineStore(
  'user',
  () => {
    const token = ref<string>('')
    const userInfo = ref<UserInfo | null>(null)

    // 计算属性：是否登录
    const isLogin = computed(() => !!token.value)

    // 设置 token
    const setToken = (newToken: string) => {
      token.value = newToken
    }

    // 设置用户信息
    const setUserInfo = (info: UserInfo) => {
      userInfo.value = info
    }

    // 登出
    const logout = () => {
      token.value = ''
      userInfo.value = null
    }

    return {
      token,
      userInfo,
      isLogin,
      setToken,
      setUserInfo,
      logout,
    }
  },
  {
    persist: true, // 持久化到 localStorage
  },
)
```

## 登录状态判断

### 1. 在组件中使用

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 获取登录状态
const isLogin = computed(() => userStore.isLogin)

// 获取用户信息
const username = computed(() => userStore.userInfo?.username || 'Guest')
const balance = computed(() => (userStore.userInfo ? '0.00' : '0.00'))
</script>

<template>
  <!-- 根据登录状态显示不同内容 -->
  <div v-if="isLogin">
    <p>欢迎，{{ username }}</p>
  </div>
  <div v-else>
    <button @click="goToLogin">请登录</button>
  </div>
</template>
```

### 2. 在方法中检查登录状态

```typescript
const handleDeposit = () => {
  if (!isLogin.value) {
    showToast('请先登录')
    router.push('/login')
    return
  }
  // 执行存款逻辑
  showToast('存款')
}
```

## 首页登录状态展示

### 未登录状态

显示内容：

- ✅ Logo 和网站名称
- ✅ 登录按钮
- ✅ 语言切换
- ✅ 菜单按钮
- ❌ 通知图标（隐藏）
- ❌ 用户信息（隐藏）
- ❌ 余额（隐藏）

```vue
<template v-if="!isLogin">
  <van-button size="small" color="#FDB927" @click="goToLogin" class="login-btn"> Login </van-button>
</template>
```

### 已登录状态

显示内容：

- ✅ Logo 和网站名称
- ✅ 通知图标（带徽章）
- ✅ 用户头像
- ✅ 用户名
- ✅ 余额
- ✅ 语言切换
- ✅ 菜单按钮

```vue
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
```

## 需要登录的功能

以下功能在未登录时会提示用户登录：

### 1. 存款 (Deposit)

```typescript
const handleDeposit = () => {
  if (!isLogin.value) {
    showToast('请先登录')
    router.push('/login')
    return
  }
  showToast('存款')
}
```

### 2. 提款 (Withdrawal)

```typescript
const handleWithdrawal = () => {
  if (!isLogin.value) {
    showToast('请先登录')
    router.push('/login')
    return
  }
  showToast('提款')
}
```

### 3. 邀请好友 (Invite)

```typescript
const handleInvite = () => {
  if (!isLogin.value) {
    showToast('请先登录')
    router.push('/login')
    return
  }
  showToast('邀请好友')
}
```

### 4. 个人中心 (User)

```typescript
const goToUser = () => {
  if (!isLogin.value) {
    showToast('请先登录')
    router.push('/login')
    return
  }
  router.push('/user')
}
```

## 登录流程

### 1. 用户点击登录按钮

```typescript
const goToLogin = () => {
  router.push('/login')
}
```

### 2. 登录页面提交表单

```typescript
const onSubmit = async () => {
  try {
    loading.value = true

    // 调用登录 API
    const res = await userApi.login(formData)

    // 保存 token 和用户信息
    userStore.setToken(res.token)
    userStore.setUserInfo(res.userInfo)

    showToast('登录成功')

    // 跳转到之前的页面或首页
    const redirect = route.query.redirect as string
    router.replace(redirect || '/home')
  } catch (error) {
    console.error('登录失败:', error)
    showToast('登录失败')
  } finally {
    loading.value = false
  }
}
```

### 3. 快速登录（测试用）

```typescript
const quickLogin = () => {
  formData.username = 'karson'
  formData.password = '123456'
  onSubmit()
}
```

## 登出流程

### 1. 用户点击登出按钮

```typescript
const handleLogout = async () => {
  try {
    await showConfirmDialog({
      title: 'Confirm',
      message: 'Are you sure you want to logout?',
    })

    // 清除 token 和用户信息
    userStore.logout()

    showToast('Logged out successfully')

    // 跳转到首页
    router.replace('/home')
  } catch (error) {
    // 用户取消
  }
}
```

### 2. Store 清除数据

```typescript
const logout = () => {
  token.value = ''
  userInfo.value = null
}
```

## 路由守卫

在 `src/router/index.ts` 中配置路由守卫，自动检查登录状态：

```typescript
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  // 需要登录的页面
  if (to.meta.requiresAuth && !userStore.isLogin) {
    showToast('请先登录')
    next({
      path: '/login',
      query: { redirect: to.fullPath },
    })
    return
  }

  next()
})
```

## 持久化存储

使用 `pinia-plugin-persistedstate` 插件，登录状态会自动保存到 `localStorage`：

```typescript
export const useUserStore = defineStore(
  'user',
  () => {
    // ...
  },
  {
    persist: true, // 开启持久化
  },
)
```

存储的数据：

- `token`: 用户令牌
- `userInfo`: 用户信息（用户名、昵称、头像等）

## 测试登录功能

### 方法 1：使用快速登录按钮

1. 访问登录页面 `/login`
2. 点击 "Quick Login (Test)" 按钮
3. 自动填充用户名 `karson` 和密码 `123456`
4. 自动提交登录

### 方法 2：手动输入

1. 访问登录页面 `/login`
2. 输入任意用户名和密码
3. 点击 "Login" 按钮
4. 模拟登录成功

### 测试登出

1. 登录后访问个人中心 `/user`
2. 点击 "Logout" 按钮
3. 确认登出
4. 返回首页，显示未登录状态

## 常见问题

### Q1: 如何判断用户是否登录？

使用 `userStore.isLogin` 计算属性：

```typescript
const isLogin = computed(() => userStore.isLogin)
```

### Q2: 如何获取用户信息？

```typescript
const username = computed(() => userStore.userInfo?.username)
const nickname = computed(() => userStore.userInfo?.nickname)
```

### Q3: 登录状态丢失怎么办？

检查以下几点：

1. 确保 `pinia-plugin-persistedstate` 已安装
2. 确保 Store 配置了 `persist: true`
3. 检查浏览器是否禁用了 localStorage

### Q4: 如何在 API 请求中携带 token？

在 `src/utils/request.ts` 的请求拦截器中：

```typescript
request.interceptors.request.use((config) => {
  const userStore = useUserStore()
  if (userStore.token) {
    config.headers.Authorization = `Bearer ${userStore.token}`
  }
  return config
})
```

### Q5: Token 过期怎么处理？

在响应拦截器中处理 401 错误：

```typescript
request.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const userStore = useUserStore()
      userStore.logout()
      showToast('登录已过期，请重新登录')
      router.push('/login')
    }
    return Promise.reject(error)
  },
)
```

## 最佳实践

### 1. 统一使用 Pinia Store

❌ 不要在组件中直接操作 localStorage：

```typescript
// 错误示例
localStorage.setItem('token', token)
```

✅ 使用 Store 方法：

```typescript
// 正确示例
userStore.setToken(token)
```

### 2. 使用计算属性

❌ 不要直接访问 token：

```typescript
// 错误示例
if (userStore.token) {
}
```

✅ 使用 isLogin 计算属性：

```typescript
// 正确示例
if (userStore.isLogin) {
}
```

### 3. 统一错误处理

在需要登录的功能中，统一提示并跳转：

```typescript
if (!isLogin.value) {
  showToast('请先登录')
  router.push('/login')
  return
}
```

### 4. 路由守卫配合使用

对于需要登录的页面，在路由配置中添加 `requiresAuth: true`：

```typescript
{
  path: '/user',
  meta: { requiresAuth: true }
}
```

## 总结

✅ **统一管理**：所有登录状态通过 Pinia Store 管理
✅ **持久化**：登录状态自动保存到 localStorage
✅ **响应式**：登录状态变化自动更新 UI
✅ **安全性**：Token 自动携带在 API 请求中
✅ **用户体验**：未登录时提示并引导登录

记住：**始终使用 `userStore.isLogin` 来判断登录状态！**

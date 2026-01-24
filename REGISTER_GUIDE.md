# 注册功能指南

## 概述

注册页面采用深色主题，使用紫金配色方案，提供快速注册功能。

## 功能特性

### 1. 注册表单

- ✅ 用户名输入（必填）
- ✅ 密码输入（必填，最少6位）
- ✅ 确认密码（必填，需与密码一致）
- ✅ 邀请码（可选）
- ✅ 协议勾选（必须同意才能注册）

### 2. 表单验证

```typescript
// 用户名验证
{ required: true, message: 'Please enter username' }

// 密码验证
{ required: true, message: 'Please enter password' }
{ min: 6, message: 'Password must be at least 6 characters' }

// 确认密码验证
{ required: true, message: 'Please confirm password' }
{ validator: validatePassword, message: 'Passwords do not match' }
```

### 3. 快速注册接口

**接口地址**: `POST /api/frontend/app/quickRegister`

**请求参数**:

```typescript
{
  username: string;      // 用户名
  password: string;      // 密码
  invite_code?: string;  // 邀请码（可选）
}
```

**响应数据**:

```typescript
{
  token: string;         // 登录令牌
  userInfo: {           // 用户信息
    id: number;
    username: string;
    nickname: string;
    avatar: string;
    mobile: string;
    email: string;
  };
  message?: string;     // 提示信息
}
```

## 页面设计

### 1. 布局结构

```
┌─────────────────────────────┐
│  ← 返回按钮                  │
│                              │
│      🎰 Logo                 │
│    JILIEVO.CC               │
│                              │
│  ┌──────────────────────┐   │
│  │     Register         │   │
│  │                      │   │
│  │  * Username          │   │
│  │  * Password          │   │
│  │  * Confirm password  │   │
│  │    Invite code       │   │
│  │                      │   │
│  │  ☑ I am 18 years... │   │
│  │                      │   │
│  │  [Register Button]   │   │
│  │                      │   │
│  │  Tips: Invite...     │   │
│  │                      │   │
│  │  One-Click Login     │   │
│  │   [F] [G] [T]       │   │
│  │                      │   │
│  │  Already have...     │   │
│  └──────────────────────┘   │
│                              │
│                      [×] [↑] │
└─────────────────────────────┘
```

### 2. 配色方案

- **背景**: 深色渐变 `linear-gradient(180deg, #2d1a3d 0%, #1a0f1e 100%)`
- **表单背景**: 半透明黑色 `rgba(0, 0, 0, 0.4)` + 毛玻璃效果
- **边框**: 金色半透明 `rgba(253, 185, 39, 0.2)`
- **注册按钮**: 金色渐变 `$gradient-gold`
- **文字**: 白色和金色

### 3. 交互效果

- 按钮点击缩放效果
- Logo 弹跳动画
- 表单输入聚焦效果
- 加载状态显示

## 使用流程

### 1. 用户注册

```typescript
const onSubmit = async () => {
  // 1. 检查协议勾选
  if (!agreed.value) {
    showToast('Please agree to the terms & conditions')
    return
  }

  try {
    loading.value = true

    // 2. 调用快速注册接口
    const res = await userApi.quickRegister({
      username: formData.username,
      password: formData.password,
      invite_code: formData.inviteCode || undefined,
    })

    // 3. 保存 token 和用户信息
    if (res.token) {
      userStore.setToken(res.token)
    }

    if (res.userInfo) {
      userStore.setUserInfo(res.userInfo)
    }

    // 4. 显示成功提示
    showToast(res.message || 'Registration successful!')

    // 5. 跳转到首页
    setTimeout(() => {
      router.replace('/home')
    }, 1000)
  } catch (error) {
    // 6. 错误处理
    const errorMsg = error?.response?.data?.message || 'Registration failed'
    showToast(errorMsg)
  } finally {
    loading.value = false
  }
}
```

### 2. 跳转到登录

```typescript
const goToLogin = () => {
  router.push('/login')
}
```

## API 集成

### 1. API 模块定义

在 `src/api/modules/user.ts` 中定义：

```typescript
// 快速注册参数
export interface QuickRegisterParams {
  username: string;
  password: string;
  invite_code?: string;
}

// 注册响应
export interface RegisterResponse {
  token: string;
  userInfo: UserInfo;
  message?: string;
}

// 快速注册
quickRegister(data: QuickRegisterParams): Promise<RegisterResponse> {
  return request.post("/frontend/app/quickRegister", data);
}
```

### 2. 环境配置

在 `.env.development` 中配置 API 地址：

```bash
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

### 3. 请求拦截器

在 `src/utils/request.ts` 中自动处理：

```typescript
// 请求拦截器
request.interceptors.request.use((config) => {
  config.baseURL = import.meta.env.VITE_API_BASE_URL
  return config
})

// 响应拦截器
request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // 错误处理
    return Promise.reject(error)
  },
)
```

## 路由配置

在 `src/router/index.ts` 中添加：

```typescript
{
  path: "/register",
  name: "Register",
  component: () => import("@/views/register/index.vue"),
  meta: {
    title: "注册",
  },
}
```

## 页面入口

### 1. 从登录页跳转

登录页底部有"Register"链接：

```vue
<div class="extra-links">
  <a href="#" class="link">Forgot Password?</a>
  <a @click="goToRegister" class="link">Register</a>
</div>
```

### 2. 直接访问

访问 `/register` 路由即可。

## 错误处理

### 1. 表单验证错误

- 用户名为空
- 密码为空或少于6位
- 确认密码不一致
- 未勾选协议

### 2. API 错误

```typescript
catch (error: any) {
  const errorMsg = error?.response?.data?.message ||
                   error?.message ||
                   'Registration failed'
  showToast(errorMsg)
}
```

### 3. 常见错误提示

- "Please enter username" - 用户名为空
- "Password must be at least 6 characters" - 密码太短
- "Passwords do not match" - 密码不一致
- "Please agree to the terms & conditions" - 未勾选协议
- "Username already exists" - 用户名已存在（后端返回）

## 测试步骤

### 1. 正常注册流程

1. 访问 `/register` 页面
2. 输入用户名（如：testuser）
3. 输入密码（如：123456）
4. 确认密码（如：123456）
5. 可选：输入邀请码
6. 勾选协议
7. 点击"Register"按钮
8. 等待注册成功
9. 自动跳转到首页

### 2. 表单验证测试

- 不输入用户名，点击注册 → 提示"Please enter username"
- 密码少于6位 → 提示"Password must be at least 6 characters"
- 确认密码不一致 → 提示"Passwords do not match"
- 不勾选协议 → 提示"Please agree to the terms & conditions"

### 3. API 测试

使用 curl 测试接口：

```bash
curl -X POST http://127.0.0.1:8000/api/frontend/app/quickRegister \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "123456",
    "invite_code": "ABC123"
  }'
```

## 样式特点

### 1. 深色主题

- 深紫色渐变背景
- 半透明表单容器
- 毛玻璃效果（backdrop-filter）

### 2. 紫金配色

- Logo 文字：金色渐变
- 注册按钮：金色渐变
- 提示信息：金色背景
- 边框：金色半透明

### 3. 动画效果

```scss
// Logo 弹跳动画
@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

// 按钮点击效果
&:active {
  transform: scale(0.98);
}
```

## 优化建议

### 1. 用户体验

- ✅ 自动聚焦到用户名输入框
- ✅ 密码强度提示
- ✅ 实时验证用户名是否可用
- ✅ 记住邀请码（URL 参数）

### 2. 安全性

- ✅ 密码加密传输（HTTPS）
- ✅ 防止重复提交
- ✅ 验证码（可选）
- ✅ 限制注册频率

### 3. 功能扩展

- ✅ 手机号注册
- ✅ 邮箱注册
- ✅ 第三方登录（Facebook、Google、Telegram）
- ✅ 短信验证码

## 常见问题

### Q1: 注册后自动登录吗？

是的，注册成功后会自动保存 token 和用户信息，并跳转到首页。

### Q2: 邀请码是必填的吗？

不是，邀请码是可选的。如果有邀请码可以填写，没有可以留空。

### Q3: 密码有什么要求？

密码最少6位，建议包含字母和数字。

### Q4: 注册失败怎么办？

检查以下几点：

1. 用户名是否已存在
2. 密码是否符合要求
3. 网络连接是否正常
4. API 服务是否启动

### Q5: 如何修改 API 地址？

修改 `.env.development` 文件中的 `VITE_API_BASE_URL`。

## 总结

注册页面特点：

✅ **美观**: 深色主题 + 紫金配色
✅ **易用**: 简洁的表单，清晰的提示
✅ **安全**: 密码确认，协议勾选
✅ **快速**: 快速注册接口，自动登录
✅ **响应式**: 适配各种屏幕尺寸
✅ **动画**: 流畅的交互动画

记住：注册成功后会自动登录并跳转到首页！

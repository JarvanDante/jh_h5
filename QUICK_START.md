# 快速开始指南

## 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0（推荐）或 npm >= 9.0.0

## 安装步骤

### 1. 安装依赖

```bash
# 使用 pnpm（推荐）
pnpm install

# 或使用 npm
npm install

# 或使用 yarn
yarn install
```

### 2. 配置环境变量

项目已经包含了默认的环境变量配置：

- `.env` - 基础配置
- `.env.development` - 开发环境（默认使用）
- `.env.production` - 生产环境

如需修改 API 地址，编辑对应的 `.env.*` 文件：

```bash
# .env.development
VITE_API_BASE_URL=http://localhost:8080/api
```

### 3. 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:5173

## 开发命令

```bash
# 启动开发服务器
pnpm dev

# 代码检查和自动修复
pnpm lint

# 代码格式化
pnpm format

# 构建生产版本
pnpm build

# 预览生产构建
pnpm preview
```

## 项目结构说明

```
jh_h5/
├── src/
│   ├── api/              # API 接口
│   │   ├── modules/      # 按模块划分（user.ts, game.ts 等）
│   │   └── index.ts      # 统一导出
│   ├── assets/           # 静态资源（图片、字体等）
│   ├── components/       # 公共组件
│   ├── router/           # 路由配置
│   │   └── index.ts      # 路由定义和守卫
│   ├── stores/           # Pinia 状态管理
│   │   ├── app.ts        # 应用状态
│   │   └── user.ts       # 用户状态
│   ├── styles/           # 全局样式
│   │   ├── index.scss    # 全局样式入口
│   │   └── variables.scss # 样式变量
│   ├── utils/            # 工具函数
│   │   └── request.ts    # Axios 封装
│   ├── views/            # 页面组件
│   │   ├── home/         # 首页
│   │   ├── login/        # 登录页
│   │   ├── user/         # 个人中心
│   │   └── error/        # 错误页面
│   ├── App.vue           # 根组件
│   ├── main.ts           # 入口文件
│   └── vite-env.d.ts     # 类型声明
├── .env                  # 环境变量（基础）
├── .env.development      # 开发环境变量
├── .env.production       # 生产环境变量
├── .gitignore            # Git 忽略文件
├── .nvmrc                # Node 版本
├── .prettierrc           # Prettier 配置
├── .prettierignore       # Prettier 忽略文件
├── eslint.config.js      # ESLint 配置
├── index.html            # HTML 模板
├── package.json          # 项目配置
├── tsconfig.json         # TypeScript 配置
├── tsconfig.node.json    # Node TypeScript 配置
└── vite.config.ts        # Vite 配置
```

## 核心功能使用

### 1. API 调用

在 `src/api/modules/` 下创建 API 模块：

```typescript
// src/api/modules/user.ts
import { request } from '@/utils/request'

export const userApi = {
  // 登录
  login(data: { username: string; password: string }) {
    return request.post('/user/login', data)
  },

  // 获取用户信息
  getUserInfo() {
    return request.get('/user/info')
  },
}
```

在组件中使用：

```vue
<script setup lang="ts">
import { api } from '@/api'

const handleLogin = async () => {
  const res = await api.user.login({ username: 'admin', password: '123456' })
  console.log(res)
}
</script>
```

### 2. 状态管理

使用 Pinia Store：

```typescript
// src/stores/user.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore(
  'user',
  () => {
    const token = ref('')
    const userInfo = ref(null)

    const setToken = (newToken: string) => {
      token.value = newToken
    }

    const logout = () => {
      token.value = ''
      userInfo.value = null
    }

    return {
      token,
      userInfo,
      setToken,
      logout,
    }
  },
  {
    persist: true, // 开启持久化
  },
)
```

在组件中使用：

```vue
<script setup lang="ts">
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 访问状态
console.log(userStore.token)

// 修改状态
userStore.setToken('new-token')
</script>
```

### 3. 路由配置

在 `src/router/index.ts` 中配置路由：

```typescript
const routes = [
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/home/index.vue'),
    meta: {
      title: '首页',
      requiresAuth: false, // 不需要登录
      keepAlive: true, // 缓存页面
    },
  },
  {
    path: '/user',
    name: 'User',
    component: () => import('@/views/user/index.vue'),
    meta: {
      title: '个人中心',
      requiresAuth: true, // 需要登录
    },
  },
]
```

### 4. Vant 组件使用

Vant 组件已配置自动按需引入，直接使用即可：

```vue
<template>
  <van-button type="primary" @click="handleClick">按钮</van-button>
  <van-field v-model="username" label="用户名" placeholder="请输入用户名" />
</template>

<script setup lang="ts">
import { ref } from 'vue'

const username = ref('')

const handleClick = () => {
  console.log('clicked')
}
</script>
```

## 开发建议

### 1. VSCode 扩展推荐

- **Vue - Official** (Vue.volar) - Vue 3 语言支持
- **ESLint** - 代码检查
- **Prettier** - 代码格式化
- **i18n Ally** - 国际化支持
- **Iconify IntelliSense** - 图标智能提示

### 2. 代码规范

- 使用 TypeScript 编写代码
- 使用 Composition API + `<script setup>` 语法
- 组件名使用 PascalCase（大驼峰）
- 文件名使用 kebab-case（小写短横线）
- 提交前运行 `pnpm lint` 检查代码

### 3. 性能优化

- 路由懒加载：使用 `() => import()` 动态导入
- 组件懒加载：使用 `defineAsyncComponent`
- 页面缓存：在路由 meta 中设置 `keepAlive: true`
- 图片优化：使用 WebP 格式，添加懒加载

### 4. 移动端适配

- 使用 Vant 的 rem 适配方案（已配置）
- 使用 Vant 组件，自动适配移动端
- 测试时使用浏览器的移动设备模拟器

## 常见问题

### Q1: 如何修改 API 地址？

编辑 `.env.development` 或 `.env.production` 文件：

```bash
VITE_API_BASE_URL=http://your-api-server.com/api
```

### Q2: 如何添加新页面？

1. 在 `src/views/` 下创建页面组件
2. 在 `src/router/index.ts` 中添加路由配置
3. 在需要的地方使用 `router.push()` 跳转

### Q3: 如何处理 Token 过期？

在 `src/utils/request.ts` 的响应拦截器中已经处理了 401 错误，会自动跳转到登录页。

### Q4: 如何禁用页面缓存？

在路由配置的 meta 中设置 `keepAlive: false` 或不设置该字段。

### Q5: ESLint 报错怎么办？

运行 `pnpm lint` 自动修复大部分问题，无法自动修复的需要手动调整。

## 部署

### 构建

```bash
pnpm build
```

构建产物在 `dist` 目录。

### Nginx 配置

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/jh_h5/dist;
    index index.html;

    # SPA 路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api {
        proxy_pass http://your-backend-server;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## 技术支持

如有问题，请查看：

- [Vue 3 文档](https://cn.vuejs.org/)
- [Vite 文档](https://cn.vitejs.dev/)
- [Vant 4 文档](https://vant-ui.github.io/vant/)
- [Pinia 文档](https://pinia.vuejs.org/zh/)
- [Vue Router 文档](https://router.vuejs.org/zh/)

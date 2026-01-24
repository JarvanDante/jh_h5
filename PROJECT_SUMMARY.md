# JH H5 项目总结

## 项目概述

JH H5 是一个基于 Vue 3 + Vite + Vant 4 的现代化移动端 H5 项目，使用最新的技术栈和最佳实践。

## 技术栈（2025-2026 最新版本）

### 核心框架

- **Vue 3.5.13** - 最新稳定版，性能优化和响应式系统改进
- **Vite 6.0.5** - 最新构建工具，更快的开发体验
- **TypeScript 5.7.2** - 最新 TypeScript，更好的类型支持

### UI 和状态管理

- **Vant 4.9.14** - 移动端组件库，自动按需引入
- **Pinia 2.3.0** - 状态管理，支持持久化
- **Vue Router 4.5.0** - 路由管理，支持路由守卫

### 工具库

- **Axios 1.7.9** - HTTP 客户端，已封装拦截器
- **Sass 1.83.0** - CSS 预处理器
- **ESLint 9.17.0** - 代码检查（Flat Config）
- **Prettier 3.4.2** - 代码格式化

## 项目结构

```
jh_h5/
├── src/
│   ├── api/                    # API 接口模块
│   │   ├── modules/           # 按业务模块划分
│   │   │   └── user.ts        # 用户相关 API
│   │   └── index.ts           # 统一导出
│   ├── assets/                # 静态资源
│   ├── components/            # 公共组件
│   ├── router/                # 路由配置
│   │   └── index.ts           # 路由定义和守卫
│   ├── stores/                # Pinia 状态管理
│   │   ├── app.ts             # 应用状态（缓存视图）
│   │   └── user.ts            # 用户状态（token、用户信息）
│   ├── styles/                # 全局样式
│   │   ├── index.scss         # 全局样式入口
│   │   └── variables.scss     # 样式变量
│   ├── utils/                 # 工具函数
│   │   └── request.ts         # Axios 封装
│   ├── views/                 # 页面组件
│   │   ├── home/              # 首页（带底部导航）
│   │   ├── login/             # 登录页（表单验证）
│   │   ├── user/              # 个人中心（需要登录）
│   │   └── error/             # 错误页面（404）
│   ├── App.vue                # 根组件
│   ├── main.ts                # 入口文件
│   └── vite-env.d.ts          # 类型声明
├── public/                    # 公共静态资源
├── .env                       # 环境变量（基础）
├── .env.development           # 开发环境变量
├── .env.production            # 生产环境变量
├── .gitignore                 # Git 忽略文件
├── .nvmrc                     # Node 版本（18.20.0）
├── .prettierrc                # Prettier 配置
├── .prettierignore            # Prettier 忽略文件
├── eslint.config.js           # ESLint 配置（Flat Config）
├── index.html                 # HTML 模板
├── package.json               # 项目配置
├── tsconfig.json              # TypeScript 配置
├── tsconfig.node.json         # Node TypeScript 配置
├── vite.config.ts             # Vite 配置
├── CHANGELOG.md               # 更新日志
├── QUICK_START.md             # 快速开始指南
├── VERSION_COMPARISON.md      # 版本对比说明
└── README.md                  # 项目文档
```

## 核心功能

### 1. API 模块化管理

```typescript
// src/api/modules/user.ts
export const userApi = {
  login(data) {
    return request.post('/user/login', data)
  },
  getUserInfo() {
    return request.get('/user/info')
  },
}

// 使用
import { api } from '@/api'
const res = await api.user.login({ username, password })
```

### 2. Axios 请求封装

- ✅ 请求拦截器：自动添加 token
- ✅ 响应拦截器：统一错误处理
- ✅ 401 自动跳转登录
- ✅ 错误提示（Toast）
- ✅ TypeScript 类型支持

### 3. Pinia 状态管理

```typescript
// src/stores/user.ts
export const useUserStore = defineStore(
  'user',
  () => {
    const token = ref('')
    const userInfo = ref(null)

    return { token, userInfo }
  },
  {
    persist: true, // 持久化到 localStorage
  },
)
```

### 4. 路由守卫

- ✅ 登录验证：`requiresAuth: true`
- ✅ 页面标题：自动设置 `document.title`
- ✅ 页面缓存：`keepAlive: true`
- ✅ 未登录自动跳转登录页

### 5. Vant 组件按需引入

使用 `unplugin-vue-components` 自动按需引入，无需手动导入：

```vue
<template>
  <van-button type="primary">按钮</van-button>
  <van-field v-model="value" label="标签" />
</template>
```

### 6. 移动端适配

- ✅ Vant rem 适配方案
- ✅ 375px 设计稿基准
- ✅ 自动转换 px 到 rem
- ✅ 支持 PC 端触摸模拟

### 7. 环境变量配置

```bash
# .env.development
VITE_API_BASE_URL=http://localhost:8080/api

# .env.production
VITE_API_BASE_URL=https://api.example.com
```

使用：

```typescript
const apiUrl = import.meta.env.VITE_API_BASE_URL
```

## 示例页面

### 1. 首页（/home）

- 底部导航栏（首页、分类、购物车、我的）
- 页面缓存（keep-alive）
- 下拉刷新示例

### 2. 登录页（/login）

- 表单验证
- 登录逻辑
- Token 存储
- 登录后跳转

### 3. 个人中心（/user）

- 需要登录访问
- 显示用户信息
- 退出登录功能

### 4. 404 页面

- 路由不存在时显示
- 返回首页按钮

## 开发命令

```bash
# 安装依赖
pnpm install

# 启动开发服务器（http://localhost:5173）
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

## 代码规范

### 命名规范

- **文件名**: kebab-case（小写短横线）
  - `user-info.vue`
  - `api-service.ts`

- **组件名**: PascalCase（大驼峰）
  - `UserInfo.vue`
  - `NavBar.vue`

- **变量名**: camelCase（小驼峰）
  - `userName`
  - `apiUrl`

- **常量名**: UPPER_SNAKE_CASE（大写下划线）
  - `API_BASE_URL`
  - `MAX_COUNT`

### 代码风格

- 使用 TypeScript
- 使用 Composition API
- 使用 `<script setup>` 语法
- 使用 ESLint + Prettier
- 单引号、无分号、尾逗号

### Git 提交规范

```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
perf: 性能优化
test: 测试相关
chore: 构建/工具链相关
```

## 性能优化

### 1. 路由懒加载

```typescript
{
  path: '/home',
  component: () => import('@/views/home/index.vue'),
}
```

### 2. 组件懒加载

```typescript
import { defineAsyncComponent } from 'vue'

const AsyncComp = defineAsyncComponent(() => import('./components/AsyncComponent.vue'))
```

### 3. 页面缓存

```typescript
{
  path: '/home',
  meta: {
    keepAlive: true, // 缓存页面
  },
}
```

### 4. Vant 按需引入

自动按需引入，减小打包体积。

### 5. 图片优化

- 使用 WebP 格式
- 添加图片懒加载
- 压缩图片资源

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
        proxy_pass http://backend-server;
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

## 项目亮点

### 1. 最新技术栈

- 所有依赖都是 2025-2026 年最新稳定版本
- Vue 3.5、Vite 6、ESLint 9 等最新工具
- 性能更好、开发体验更佳

### 2. 完整的工程化配置

- TypeScript 全面支持
- ESLint + Prettier 代码规范
- Git 提交规范
- 环境变量配置

### 3. 模块化设计

- API 模块化管理
- Store 模块化管理
- 路由模块化管理
- 清晰的目录结构

### 4. 开箱即用

- 完整的示例页面
- 封装好的工具函数
- 配置好的开发环境
- 详细的文档说明

### 5. 最佳实践

- Composition API + `<script setup>`
- Pinia 状态管理 + 持久化
- Axios 请求封装 + 拦截器
- 路由守卫 + 页面缓存
- 移动端适配方案

## 扩展建议

### 1. 国际化（i18n）

可以添加 `vue-i18n` 支持多语言：

```bash
pnpm add vue-i18n
```

### 2. 图标库

可以添加 `@iconify/vue` 或 `vant/icons`：

```bash
pnpm add @iconify/vue
```

### 3. 数据可视化

可以添加 `echarts` 或 `chart.js`：

```bash
pnpm add echarts
```

### 4. 工具库

可以添加 `lodash-es` 或 `dayjs`：

```bash
pnpm add lodash-es dayjs
```

### 5. 测试

可以添加 `vitest` 进行单元测试：

```bash
pnpm add -D vitest @vue/test-utils
```

## 常见问题

### Q1: 如何修改 API 地址？

编辑 `.env.development` 或 `.env.production` 文件。

### Q2: 如何添加新页面？

1. 在 `src/views/` 创建页面组件
2. 在 `src/router/index.ts` 添加路由
3. 使用 `router.push()` 跳转

### Q3: 如何添加新的 API？

在 `src/api/modules/` 下创建或编辑模块文件。

### Q4: 如何禁用页面缓存？

在路由 meta 中设置 `keepAlive: false`。

### Q5: ESLint 报错怎么办？

运行 `pnpm lint` 自动修复。

## 技术支持

- [Vue 3 文档](https://cn.vuejs.org/)
- [Vite 文档](https://cn.vitejs.dev/)
- [Vant 4 文档](https://vant-ui.github.io/vant/)
- [Pinia 文档](https://pinia.vuejs.org/zh/)
- [Vue Router 文档](https://router.vuejs.org/zh/)

## 总结

JH H5 是一个现代化、工程化、模块化的移动端 H5 项目模板，具有：

✅ 最新的技术栈（2025-2026）
✅ 完整的工程化配置
✅ 清晰的目录结构
✅ 丰富的示例代码
✅ 详细的文档说明
✅ 开箱即用的开发环境

可以直接用于生产环境，也可以作为学习 Vue 3 + Vite + Vant 的参考项目。

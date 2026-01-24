# JH H5

基于 Vue 3 + Vite + Vant 4 + Pinia + Axios 的移动端 H5 项目。

## 技术栈

- **Vue 3.5.13** - 渐进式 JavaScript 框架（最新稳定版）
- **Vite 6.0.5** - 下一代前端构建工具
- **Vant 4.9.14** - 轻量、可靠的移动端组件库
- **Pinia 2.3.0** - Vue 3 状态管理
- **Axios 1.7.9** - HTTP 客户端
- **TypeScript 5.7.2** - JavaScript 的超集
- **Vue Router 4.5.0** - Vue.js 官方路由
- **Sass 1.83.0** - CSS 预处理器
- **ESLint 9.17.0** - 代码质量检查工具

## 项目结构

```
jh_h5/
├── public/                 # 静态资源
├── src/
│   ├── api/               # API 接口
│   │   ├── modules/      # 按模块划分
│   │   └── index.ts      # 统一导出
│   ├── assets/           # 资源文件
│   ├── components/       # 公共组件
│   ├── router/           # 路由配置
│   ├── stores/           # Pinia 状态管理
│   ├── styles/           # 全局样式
│   ├── utils/            # 工具函数
│   ├── views/            # 页面组件
│   ├── App.vue           # 根组件
│   ├── main.ts           # 入口文件
│   └── vite-env.d.ts     # 类型声明
├── .env                   # 环境变量
├── .env.development       # 开发环境变量
├── .env.production        # 生产环境变量
├── .gitignore            # Git 忽略文件
├── index.html            # HTML 模板
├── package.json          # 项目配置
├── tsconfig.json         # TypeScript 配置
├── tsconfig.node.json    # Node TypeScript 配置
└── vite.config.ts        # Vite 配置
```

## 功能特性

- ✅ Vue 3 Composition API
- ✅ TypeScript 支持
- ✅ Vant 4 组件按需引入
- ✅ Pinia 状态管理 + 持久化
- ✅ Axios 请求封装 + 拦截器
- ✅ Vue Router 路由守卫
- ✅ 移动端适配
- ✅ 页面缓存 (keep-alive)
- ✅ 环境变量配置
- ✅ 代码规范 (ESLint)

## 开发指南

### 安装依赖

```bash
npm install
# 或
pnpm install
# 或
yarn install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173

### 代码检查

```bash
npm run lint
```

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 目录说明

### API 模块

`src/api/modules/` 目录下按业务模块划分 API 接口：

```typescript
// src/api/modules/user.ts
export const userApi = {
  login(data) {
    return request.post('/user/login', data)
  },
}
```

### Pinia Store

`src/stores/` 目录下定义状态管理：

```typescript
// src/stores/user.ts
export const useUserStore = defineStore(
  'user',
  () => {
    const token = ref('')
    return { token }
  },
  {
    persist: true, // 持久化
  },
)
```

### 路由配置

`src/router/index.ts` 配置路由：

```typescript
const routes = [
  {
    path: '/home',
    component: () => import('@/views/home/index.vue'),
    meta: {
      title: '首页',
      requiresAuth: false,
    },
  },
]
```

### 请求封装

`src/utils/request.ts` 封装 Axios：

```typescript
import { request } from '@/utils/request'

// GET 请求
request.get('/api/user')

// POST 请求
request.post('/api/login', { username, password })
```

## 开发规范

### 命名规范

- **文件名**: 使用 kebab-case (小写短横线)
- **组件名**: 使用 PascalCase (大驼峰)
- **变量名**: 使用 camelCase (小驼峰)
- **常量名**: 使用 UPPER_SNAKE_CASE (大写下划线)

### 代码风格

- 使用 TypeScript
- 使用 Composition API
- 使用 `<script setup>` 语法
- 使用 ESLint 进行代码检查

### Git 提交规范

```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
perf: 性能优化
test: 测试相关
chore: 构建/工具链相关
```

## 常见问题

### 1. Vant 组件按需引入

项目已配置 `unplugin-vue-components`，Vant 组件会自动按需引入，无需手动导入。

### 2. 移动端适配

使用 Vant 的 `rem` 适配方案，已在 `vite.config.ts` 中配置。

### 3. 环境变量

- 开发环境: `.env.development`
- 生产环境: `.env.production`
- 使用: `import.meta.env.VITE_API_BASE_URL`

### 4. 状态持久化

使用 `pinia-plugin-persistedstate` 插件，在 store 中配置 `persist: true` 即可。

## 部署

### 构建

```bash
npm run build
```

构建产物在 `dist` 目录。

### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/jh_h5/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend-server;
    }
}
```

## License

MIT

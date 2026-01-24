# 更新日志

## [1.0.0] - 2026-01-25

### 初始化项目

#### 核心依赖（最新稳定版本）

- **Vue 3.5.13** - Vue 3.5 是 2025 年的稳定版本，带来了性能优化和新特性
- **Vite 6.0.5** - 最新的构建工具，更快的冷启动和热更新
- **Vant 4.9.14** - 最新的移动端组件库
- **Pinia 2.3.0** - 最新的状态管理库
- **Vue Router 4.5.0** - 最新的路由库
- **Axios 1.7.9** - 最新的 HTTP 客户端
- **TypeScript 5.7.2** - 最新的 TypeScript 版本

#### 开发工具

- **ESLint 9.17.0** - 使用最新的 Flat Config 格式
- **Prettier 3.4.2** - 代码格式化工具
- **@typescript-eslint 8.18.2** - TypeScript ESLint 插件
- **eslint-plugin-vue 9.32.0** - Vue ESLint 插件

#### 项目特性

- ✅ Vue 3 Composition API + `<script setup>` 语法
- ✅ TypeScript 全面支持
- ✅ Vant 4 组件自动按需引入
- ✅ Pinia 状态管理 + 持久化插件
- ✅ Axios 请求封装（拦截器、错误处理）
- ✅ Vue Router 路由守卫（登录验证）
- ✅ 移动端适配（Vant rem 方案）
- ✅ 页面缓存（keep-alive）
- ✅ 环境变量配置（开发/生产）
- ✅ ESLint + Prettier 代码规范
- ✅ 完整的项目结构和示例页面

#### 目录结构

```
jh_h5/
├── src/
│   ├── api/              # API 接口模块化管理
│   ├── assets/           # 静态资源
│   ├── components/       # 公共组件
│   ├── router/           # 路由配置
│   ├── stores/           # Pinia 状态管理
│   ├── styles/           # 全局样式
│   ├── utils/            # 工具函数
│   ├── views/            # 页面组件
│   ├── App.vue           # 根组件
│   └── main.ts           # 入口文件
├── .env                  # 环境变量
├── .prettierrc           # Prettier 配置
├── eslint.config.js      # ESLint 配置（Flat Config）
├── vite.config.ts        # Vite 配置
└── package.json          # 项目配置
```

#### 示例页面

- 首页（带底部导航）
- 登录页（表单验证）
- 个人中心（需要登录）
- 404 页面

### 技术亮点

1. **最新技术栈**: 所有依赖都使用 2025-2026 年的最新稳定版本
2. **ESLint Flat Config**: 使用 ESLint 9 的新配置格式，更简洁易维护
3. **模块化设计**: API、Store、Router 都采用模块化设计
4. **类型安全**: 全面使用 TypeScript，提供完整的类型定义
5. **开发体验**: 配置了 ESLint 和 Prettier，保证代码质量和风格统一

### 安装说明

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 代码检查
pnpm lint

# 代码格式化
pnpm format

# 构建生产版本
pnpm build
```

### 注意事项

- Node.js 版本要求: >= 18.0.0
- 推荐使用 pnpm 作为包管理器
- ESLint 9 使用新的 Flat Config 格式，不再使用 `.eslintrc` 文件
- 所有依赖都使用 `^` 版本范围，可以自动更新到兼容的最新版本

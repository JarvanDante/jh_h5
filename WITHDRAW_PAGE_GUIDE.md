# 提现页面实现指南

## 已完成的功能

### 1. 页面结构

- ✅ 顶部导航栏（标题 + 历史记录图标）
- ✅ 账户余额和流水要求卡片（带刷新按钮）
- ✅ 提现方式选择（Gcash、Maya）
- ✅ 快捷金额选择（9个金额按钮）
- ✅ 金额范围显示
- ✅ 提现账户管理区域
- ✅ 提现按钮

### 2. 交互功能

- ✅ 提现方式切换（高亮选中状态）
- ✅ 快捷金额选择（高亮选中状态）
- ✅ 余额刷新
- ✅ 流水要求刷新和详情查看
- ✅ 无账户时显示添加账户提示
- ✅ 有账户时显示账户信息
- ✅ 提现金额验证（最小/最大金额、余额不足）
- ✅ 提现确认弹窗

### 3. API 接口定义

已创建 `src/api/modules/withdraw.ts`，包含以下接口：

- `getBalanceInfo()` - 获取用户余额信息
- `getWithdrawMethods()` - 获取提现方式列表
- `getWithdrawAccounts()` - 获取提现账户列表
- `addWithdrawAccount()` - 添加提现账户
- `deleteWithdrawAccount()` - 删除提现账户
- `setDefaultAccount()` - 设置默认账户
- `submitWithdraw()` - 提交提现申请
- `getWithdrawRecords()` - 获取提现记录
- `cancelWithdraw()` - 取消提现

### 4. 路由配置

已添加路由：`/withdraw`

- 需要登录才能访问（requiresAuth: true）

## 页面访问

```
http://localhost:5173/withdraw
```

## 需要对接的后端接口

### 1. 获取余额信息

```
GET /frontend/balance/info
Response: {
  balance: number,
  frozen_balance: number,
  rollover_requirement: number
}
```

### 2. 获取提现方式列表

```
GET /frontend/withdraw/methods
Response: {
  list: [
    {
      id: number,
      name: string,
      code: string,
      gateway: number,
      logo: string,
      each_min: number,
      each_max: number,
      money_list: string,
      is_input: number,
      status: number,
      sort: number
    }
  ]
}
```

### 3. 获取提现账户列表

```
GET /frontend/withdraw/accounts
Response: {
  list: [
    {
      id: number,
      user_id: number,
      withdraw_id: number,
      bank_name: string,
      account_name: string,
      account_number: string,
      is_default: number,
      status: number,
      created_at: string
    }
  ]
}
```

### 4. 提交提现申请

```
POST /frontend/withdraw/submit
Body: {
  withdraw_id: number,
  account_id: number,
  amount: number
}
Response: {
  order_no: string,
  message: string
}
```

## 待完善功能

### 1. 数据对接

- [ ] 对接余额查询接口
- [ ] 对接提现方式列表接口
- [ ] 对接提现账户列表接口
- [ ] 对接提现提交接口

### 2. 页面跳转

- [ ] 实现提现历史页面
- [ ] 实现账户管理页面（我的账户）
- [ ] 实现添加账户页面
- [ ] 实现编辑账户页面

### 3. 功能增强

- [ ] 添加自定义金额输入
- [ ] 添加提现手续费计算
- [ ] 添加实际到账金额显示
- [ ] 添加提现规则说明
- [ ] 添加提现时间说明

## 样式说明

页面采用深蓝色渐变背景，与图片设计一致：

- 主色调：深蓝色渐变（#1e3a8a → #1e293b）
- 强调色：金黄色（#fbbf24）、蓝色（#3b82f6）
- 卡片：半透明深色背景 + 蓝色边框
- 按钮：蓝色渐变

## 文件结构

```
jh_h5/
├── src/
│   ├── views/
│   │   └── withdraw/
│   │       └── index.vue          # 提现页面
│   ├── api/
│   │   ├── index.ts               # API 统一导出
│   │   └── modules/
│   │       └── withdraw.ts        # 提现相关 API
│   └── router/
│       └── index.ts               # 路由配置（已添加 /withdraw）
```

## 使用示例

在其他页面跳转到提现页面：

```vue
<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goToWithdraw = () => {
  router.push('/withdraw')
}
</script>

<template>
  <van-button @click="goToWithdraw">提现</van-button>
</template>
```

## 注意事项

1. 页面需要登录后才能访问
2. 提现前需要先添加提现账户
3. 提现金额需要在最小和最大金额范围内
4. 提现金额不能超过账户余额
5. 需要满足流水要求才能提现（根据业务规则）

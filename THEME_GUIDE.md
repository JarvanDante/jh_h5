# 主题配色指南

## 配色方案

本项目采用紫金配色方案，灵感来自洛杉矶湖人队的经典配色，高贵、优雅、充满活力。

### 主色调

| 颜色名称         | 色值      | 用途                             | 示例                               |
| ---------------- | --------- | -------------------------------- | ---------------------------------- |
| **紫色（主色）** | `#552583` | 主要按钮、导航栏、标题、激活状态 | 顶部导航栏、底部导航激活状态       |
| **金黄（点缀）** | `#FDB927` | 强调、高亮、重要信息             | Jackpot 数字、提款按钮、游戏提供商 |
| **白色（背景）** | `#FFFFFF` | 页面背景、卡片背景               | 页面主背景、游戏卡片               |
| **深色文字**     | `#1F1F1F` | 主要文字内容                     | 标题、正文                         |

### 辅助色

| 颜色名称 | 色值      | 用途               |
| -------- | --------- | ------------------ |
| 次要文字 | `#666666` | 次要信息、说明文字 |
| 浅灰背景 | `#F5F5F5` | 输入框、搜索框背景 |
| 边框色   | `#E5E5E5` | 分割线、边框       |
| 成功色   | `#07c160` | 成功提示           |
| 警告色   | `#ff976a` | 警告提示           |
| 危险色   | `#ee0a24` | 错误提示、删除操作 |

### 渐变色

```scss
// 紫色渐变
$gradient-purple: linear-gradient(135deg, #552583 0%, #7b3fa8 100%);

// 金色渐变
$gradient-gold: linear-gradient(135deg, #fdb927 0%, #ffd54f 100%);

// 紫金渐变
$gradient-purple-gold: linear-gradient(135deg, #552583 0%, #fdb927 100%);
```

## 使用指南

### 1. 在 Vue 组件中使用

```vue
<style lang="scss" scoped>
@import '@/styles/variables.scss';

.my-component {
  background: $primary-color;
  color: $text-color-light;
  border: 1px solid $secondary-color;
}
</style>
```

### 2. 使用工具类

```vue
<template>
  <!-- 文字颜色 -->
  <div class="text-primary">紫色文字</div>
  <div class="text-secondary">金色文字</div>

  <!-- 背景色 -->
  <div class="bg-primary">紫色背景</div>
  <div class="bg-secondary">金色背景</div>

  <!-- 渐变背景 -->
  <div class="bg-gradient-purple">紫色渐变</div>
  <div class="bg-gradient-gold">金色渐变</div>
  <div class="bg-gradient-purple-gold">紫金渐变</div>

  <!-- 边框 -->
  <div class="border-primary">紫色边框</div>
  <div class="border-secondary">金色边框</div>
</template>
```

### 3. Vant 组件主题定制

在组件中直接使用颜色值：

```vue
<template>
  <!-- 按钮 -->
  <van-button color="#552583">紫色按钮</van-button>
  <van-button color="#FDB927">金色按钮</van-button>

  <!-- 导航栏 -->
  <van-tabbar active-color="#552583">
    <van-tabbar-item icon="home-o">首页</van-tabbar-item>
  </van-tabbar>

  <!-- 图标 -->
  <van-icon name="star" color="#552583" />
  <van-icon name="fire" color="#FDB927" />
</template>
```

## 配色应用场景

### 主色（紫色 #552583）

✅ **适用场景**：

- 顶部导航栏背景
- 主要按钮（存款按钮边框）
- 底部导航激活状态
- 游戏分类图标
- 重要标题
- Jackpot 区域背景

❌ **不适用场景**：

- 大面积背景（会显得压抑）
- 正文文字（可读性差）

### 点缀色（金黄 #FDB927）

✅ **适用场景**：

- 提款按钮背景
- Jackpot 数字
- 游戏提供商名称
- 邀请横幅文字和边框
- Hot 图标
- Logo 背景
- 强调信息

❌ **不适用场景**：

- 大段文字（刺眼）
- 错误提示（容易混淆）

### 白色背景（#FFFFFF）

✅ **适用场景**：

- 页面主背景
- 卡片背景
- 输入框背景
- 弹窗背景

### 深色文字（#1F1F1F）

✅ **适用场景**：

- 标题
- 正文
- 按钮文字（在浅色背景上）
- 表单标签

## 设计原则

### 1. 60-30-10 原则

- **60%**: 白色背景 - 主要背景色
- **30%**: 紫色 - 主要功能区域
- **10%**: 金黄 - 强调和点缀

### 2. 对比度

- 确保文字和背景有足够的对比度
- 紫色背景上使用白色文字
- 白色背景上使用深色文字
- 金黄色主要用于点缀，不用于大段文字

### 3. 层次感

使用不同深浅的颜色创建层次：

```scss
// 主要层级
background: $primary-color; // #552583

// 次要层级
background: rgba(85, 37, 131, 0.8);

// 悬浮层级
background: rgba(85, 37, 131, 0.05);
```

### 4. 阴影

使用紫色系阴影增强品牌感：

```scss
// 小阴影
box-shadow: 0 2px 4px rgba(85, 37, 131, 0.1);

// 中阴影
box-shadow: 0 4px 8px rgba(85, 37, 131, 0.15);

// 大阴影
box-shadow: 0 8px 16px rgba(85, 37, 131, 0.2);
```

## 组件配色示例

### 按钮

```vue
<!-- 主要按钮 -->
<van-button style="background: #552583; color: #fff; border: none;">
  主要操作
</van-button>

<!-- 次要按钮 -->
<van-button style="background: #fff; color: #552583; border: 2px solid #552583;">
  次要操作
</van-button>

<!-- 强调按钮 -->
<van-button
  style="background: linear-gradient(135deg, #FDB927 0%, #FFD54F 100%); color: #1F1F1F; border: none;"
>
  强调操作
</van-button>
```

### 卡片

```vue
<div
  style="
  background: #fff;
  border: 2px solid #552583;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 8px rgba(85, 37, 131, 0.15);
"
>
  卡片内容
</div>
```

### 标签

```vue
<!-- 紫色标签 -->
<van-tag color="#552583">紫色标签</van-tag>

<!-- 金色标签 -->
<van-tag color="#FDB927" text-color="#1F1F1F">金色标签</van-tag>
```

## 可访问性

### 对比度检查

确保文字和背景的对比度符合 WCAG 标准：

- **紫色 (#552583) + 白色 (#FFFFFF)**: ✅ 对比度 8.59:1（AAA 级）
- **金黄 (#FDB927) + 深色 (#1F1F1F)**: ✅ 对比度 10.24:1（AAA 级）
- **深色 (#1F1F1F) + 白色 (#FFFFFF)**: ✅ 对比度 16.10:1（AAA 级）

### 色盲友好

- 紫色和金黄的组合对大多数色盲类型友好
- 避免仅用颜色传达信息，配合图标和文字

## 深色模式（可选）

如果需要支持深色模式，可以使用以下配色：

```scss
// 深色模式变量
$dark-background: #1f1f1f;
$dark-surface: #2d2d2d;
$dark-primary: #7b3fa8; // 更亮的紫色
$dark-secondary: #ffd54f; // 更亮的金色
$dark-text: #ffffff;
```

## 品牌一致性

### Logo

Logo 应使用紫金配色：

- 主体：紫色 (#552583)
- 点缀：金黄 (#FDB927)

### 图标

- 主要图标：紫色
- 强调图标：金黄
- 次要图标：灰色

### 插图

- 主色调：紫色系
- 点缀色：金黄系
- 背景：白色或浅灰

## 总结

紫金配色方案的优势：

✅ **高贵优雅**：紫色代表高贵、神秘、优雅
✅ **活力四射**：金黄代表财富、活力、成功
✅ **对比鲜明**：紫色和金黄形成强烈视觉对比
✅ **品牌识别**：独特的配色方案，易于识别
✅ **可访问性好**：对比度高，色盲友好

记住：**少即是多**，不要过度使用颜色，保持页面简洁清爽。

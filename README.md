# FCC Dashboard

一个为 兽展日历 定制的内容管理系统仪表板，用于管理展会、展商、地区等信息。

## 技术栈

- **前端框架**: React 19 + TypeScript
- **构建工具**: Rsbuild
- **UI 组件库**: Mantine + Ant Design + Tailwind CSS
- **状态管理**: Zustand + TanStack Query
- **表单处理**: Mantine Form + Zod
- **路由**: React Router DOM
- **样式**: Tailwind CSS + PostCSS

## 开发环境要求

- Node.js 18+ 
- Yarn 4.4.1+

## 快速开始

### 1. 环境准备

确保你已经使用了正确的 Node.js 版本和 Yarn，如果不确定，请运行：

```bash
nvm use
corepack enable
```

### 2. 安装依赖

```bash
yarn install
```

### 3. 环境配置

创建环境变量文件（如需要）：

```bash
cp .env.example .env.local
```

### 4. 启动开发服务器

```bash
yarn dev
```

应用将在 http://localhost:3001 启动

### 5. 构建生产版本

```bash
yarn build
```

### 6. 预览生产版本

```bash
yarn preview
```

## 可用脚本

- `yarn dev` - 启动开发服务器（端口 3001）
- `yarn build` - 构建生产版本
- `yarn preview` - 预览生产版本
- `yarn format` - 格式化代码

## 项目结构

```
src/
├── api/              # API 调用相关
│   ├── auth/         # 认证相关 API
│   └── dashboard/    # 仪表板相关 API
├── components/       # 可复用组件
├── pages/           # 页面组件
│   ├── auth/        # 认证相关页面
│   └── dashboard/   # 仪表板页面
├── stores/          # 状态管理
├── types/           # TypeScript 类型定义
├── utils/           # 工具函数
└── styles/          # 样式文件
```
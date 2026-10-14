# FCC Dashboard

一个为 兽展日历 定制的内容管理系统仪表板，用于管理展会、展商、地区等信息。

## 技术栈

- **前端框架**: React 19 + TypeScript
- **构建工具**: Rsbuild
- **UI 组件库**: Ant Design + Tailwind CSS
- **状态管理**: Zustand + TanStack Query
- **表单处理**: React Hook Form + Zod
- **路由**: React Router DOM
- **样式**: Tailwind CSS + PostCSS

## 开发环境要求

- Node.js 24 LTS
- Yarn 4

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

应用将在 http://localhost:3001 启动。

Rsbuild 2 默认仅监听本机。如需从局域网设备访问，运行 `yarn dev --host 0.0.0.0`。

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

## 组织创建接口

- 管理员和编辑均可创建组织，统一调用 `POST /cms/organization`；普通用户不显示新建入口，直接访问新建页面显示 403。
- 创建请求包含名称、Slug、状态及可选的类型、描述、联系邮箱、链接和创立日期；Slug 仅接受小写英文字母、数字和连字符，长度为 1–64。
- 创建时即可上传并裁剪组织头像，创建成功后进入编辑页面。创建操作不会自动授予创建者组织 Owner 身份。
- 后端已移除 `POST /cms/organization/owned`；已有组织的编辑权限仍由服务端检查。
- 管理员和编辑均可删除组织、审核组织认领，前端入口与后端平台内容权限保持一致。

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

# T3-Elegance

一个现代化的全栈 TypeScript 应用，展示了端到端类型安全、Monorepo 架构和最佳实践。

## 📑 目录

- [项目架构](#️-项目架构)
  - [架构特点](#架构特点)
  - [数据流架构](#数据流架构)
- [技术栈](#️-技术栈)
  - [前端 (Client)](#前端-client)
  - [后端 (Server)](#后端-server)
  - [共享层 (Common)](#共享层-common)
- [端到端类型安全实现](#-端到端类型安全实现)
- [包管理和依赖关系](#-包管理和依赖关系)
- [快速开始](#-快速开始)
  - [前置要求](#前置要求)
  - [安装依赖](#安装依赖)
  - [数据库设置](#数据库设置)
  - [启动开发服务器](#启动开发服务器)
  - [Prisma 常用命令](#prisma-常用命令)
- [项目结构详解](#-项目结构详解)
  - [Client Package](#client-package)
  - [Server Package](#server-package)
  - [Common Package](#common-package)
- [TypeScript 配置策略](#-typescript-配置策略)
- [核心技术实现](#-核心技术实现)
  - [tRPC 工作流程](#1-trpc-工作流程)
  - [React Query 集成](#2-react-query-集成)
  - [Zod 运行时验证](#3-zod-运行时验证)
- [CORS 配置](#-cors-配置)
- [开发工具和脚本](#-开发工具和脚本)
- [最佳实践](#-最佳实践)
- [数据库架构](#️-数据库架构)
  - [Prisma + SQLite 集成](#prisma--sqlite-集成)
  - [数据模型](#数据模型)
  - [数据库工作流](#数据库工作流)
- [避免循环依赖的架构设计](#-避免循环依赖的架构设计)
- [扩展建议](#-扩展建议)
- [常见问题和解决方案](#-常见问题和解决方案)
- [项目统计](#-项目统计)
- [学习路径建议](#-学习路径建议)
- [学习资源](#-学习资源)
- [贡献指南](#-贡献指南)
- [许可证](#-许可证)

---

## 🏗️ 项目架构

本项目采用 **Monorepo** 架构，使用 **pnpm workspaces** 管理多个相互依赖的包：

```
t3-elegance/
├── packages/
│   ├── client/          # React 前端应用 (Vite + React 19)
│   │   ├── src/
│   │   │   ├── App.tsx
│   │   │   ├── main.tsx
│   │   │   └── trpc.ts  # tRPC 客户端配置
│   │   └── vite.config.ts
│   ├── server/          # Express + tRPC + Prisma 后端服务
│   │   ├── src/
│   │   │   ├── server.ts      # Express 入口
│   │   │   ├── context.ts     # Prisma Context
│   │   │   └── routers/
│   │   │       ├── trpc.ts    # tRPC 基础构建块
│   │   │       ├── _app.ts    # 路由聚合器
│   │   │       └── user.ts    # 用户路由
│   │   ├── prisma/
│   │   │   ├── schema.prisma  # 数据库 Schema
│   │   │   └── migrations/    # 迁移历史
│   │   └── .env               # 环境变量
│   └── common/          # 共享类型定义
│       └── src/types.ts
├── tsconfig.base.json   # 基础 TypeScript 配置
├── pnpm-workspace.yaml  # pnpm workspace 配置
└── package.json         # 根项目配置
```

### 架构特点

- **端到端类型安全**：通过 tRPC 实现前后端类型共享，无需手动维护 API 契约
- **Monorepo 管理**：使用 pnpm workspaces 统一管理依赖和构建流程
- **TypeScript Project References**：利用 TypeScript 项目引用实现增量编译和类型检查
- **模块化设计**：清晰的关注点分离，共享代码通过 `common` 包复用
- **数据库集成**：Prisma ORM 提供类型安全的数据库访问
- **避免循环依赖**：三层架构设计（基础层 → 路由层 → 聚合层）

### 数据流架构

```
┌──────────────────────────────────────────────────────────────────┐
│                        Frontend (Client)                         │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────────┐ │
│  │   App.tsx    │────▶│   trpc.ts    │────▶│  React Query     │ │
│  │  (UI 组件)   │     │(tRPC Client) │     │   (数据缓存)     │ │
│  └──────────────┘     └──────────────┘     └──────────────────┘ │
└─────────────────────────────┬────────────────────────────────────┘
                              │ HTTP/JSON
                              │ (类型安全的 RPC 调用)
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                        Backend (Server)                          │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────────┐ │
│  │  server.ts   │────▶│   _app.ts    │────▶│    user.ts       │ │
│  │  (Express)   │     │  (路由聚合)  │     │   (业务逻辑)     │ │
│  └──────────────┘     └──────────────┘     └────────┬─────────┘ │
│                                                      │            │
│  ┌──────────────┐     ┌──────────────┐              │            │
│  │  context.ts  │────▶│   trpc.ts    │◀─────────────┘            │
│  │ (Prisma注入) │     │  (tRPC基础)  │                            │
│  └──────┬───────┘     └──────────────┘                            │
│         │                                                          │
└─────────┼──────────────────────────────────────────────────────────┘
          │
          ▼
┌──────────────────────────────────────────────────────────────────┐
│                     Database (Prisma + SQLite)                   │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────────┐ │
│  │schema.prisma │────▶│  migrations  │────▶│     dev.db       │ │
│  │  (数据模型)  │     │  (版本控制)  │     │  (SQLite 文件)   │ │
│  └──────────────┘     └──────────────┘     └──────────────────┘ │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                         Shared (Common)                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  types.ts - 共享类型定义 (User, ApiResponse, etc.)        │  │
│  └───────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

## 🛠️ 技术栈

### 前端 (Client)

| 技术 | 版本 | 用途 |
|------|------|------|
| **React** | 19.2.0 | UI 框架 |
| **Vite** | 7.2.2 | 构建工具和开发服务器 |
| **TypeScript** | 5.9.3 | 类型安全 |
| **tRPC Client** | 10.45.2 | 类型安全的 API 客户端 |
| **TanStack React Query** | 4.18.00 | 数据获取和缓存管理 |
| **ESLint** | 9.39.1 | 代码质量检查 |

**关键特性：**
- **Vite HMR**：快速热模块替换，提升开发体验
- **React Query 集成**：自动处理加载状态、错误处理和缓存
- **路径别名**：通过 `@server/*` 直接导入后端类型定义

### 后端 (Server)

| 技术 | 版本 | 用途 |
|------|------|------|
| **Express** | 4.21.2 | Web 服务器框架 |
| **tRPC Server** | 10.45.2 | 类型安全的 RPC 框架 |
| **Prisma** | 6.19.0 | 现代化 ORM 数据库工具 |
| **SQLite** | - | 轻量级嵌入式数据库 |
| **Zod** | 3.25.76 | 运行时数据验证 |
| **CORS** | 2.8.5 | 跨域资源共享 |
| **ts-node** | 10.9.2 | TypeScript 运行时 |
| **dotenv-cli** | 11.0.0 | 环境变量管理 |

**关键特性：**
- **tRPC Procedures**：定义类型安全的 API 端点
- **Prisma ORM**：类型安全的数据库访问和迁移管理
- **Context 注入**：通过 tRPC Context 将 Prisma 客户端注入到所有 procedures
- **Zod 验证**：输入输出的运行时验证
- **Express 中间件**：通过 `@trpc/server/adapters/express` 集成
- **数据库迁移**：使用 Prisma Migrate 管理数据库 schema 变更

### 共享层 (Common)

- **共享类型定义**：`User`、`ApiResponse<T>`、`UserProfileOutput`
- **类型复用**：前后端共享同一套类型定义，确保一致性

## 🔄 端到端类型安全实现

### 1. 后端定义 tRPC 路由和 Prisma 集成

```typescript
// packages/server/src/routers/trpc.ts - 基础构建块
import { initTRPC } from '@trpc/server';
import { Context } from '../context';

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
```

```typescript
// packages/server/src/routers/user.ts - 用户路由
import { z } from 'zod';
import { router, publicProcedure } from './trpc';

export const userRouter = router({
  createUser: publicProcedure
    .input(z.object({ name: z.string().min(2), email: z.string().email() }))
    .mutation(async ({ input, ctx }) => {
      return await ctx.prisma.user.create({
        data: { name: input.name, email: input.email }
      });
    }),

  getUserDetails: publicProcedure
    .input(z.object({ userId: z.string().cuid() }))
    .query(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: input.userId },
        include: { posts: true }
      });
      return {
        success: true,
        data: { ...user, totalPosts: user.posts.length }
      };
    }),
});
```

```typescript
// packages/server/src/routers/_app.ts - 主路由聚合
import { router } from './trpc';
import { userRouter } from './user';

export const appRouter = router({
  user: userRouter,
});

export type AppRouter = typeof appRouter;  // 导出类型供前端使用
```

### 2. Prisma Context 注入

```typescript
// packages/server/src/context.ts
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'error', 'warn']
    : ['error'],
});

export function createContext({ req, res }) {
  return { req, res, prisma };  // 注入 Prisma 客户端
}

export type Context = Awaited<ReturnType<typeof createContext>>;
```

### 3. 前端导入后端类型

```typescript
// packages/client/src/trpc.ts
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@server/routers/_app';

export const trpc = createTRPCReact<AppRouter>();
```

### 4. 类型安全的 API 调用

```typescript
// packages/client/src/App.tsx
const { data, isLoading, isError } = trpc.user.getUserDetails.useQuery({
  userId: 'user-001'
});
// data 的类型自动推断为 UserProfileOutput
// 完整的智能提示和类型检查
```

**优势：**
- ✅ 自动补全和类型检查（从数据库到前端）
- ✅ 重构时自动更新所有引用
- ✅ 编译时发现 API 不匹配
- ✅ 无需手动维护 API 文档
- ✅ Prisma 提供的类型安全数据库访问
- ✅ 避免循环依赖的模块化架构

## 📦 包管理和依赖关系

### Workspace 依赖图

```
client  ──┬──> common
          └──> server (仅类型)
          
server  ────> common

common  (无依赖)
```

### pnpm Workspace 配置

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
```

**优势：**
- 统一的依赖版本管理
- 高效的磁盘空间利用（符号链接）
- 快速的安装速度
- 支持 workspace 协议 (`workspace:^`)

## 🚀 快速开始

### 前置要求

- Node.js >= 16
- pnpm >= 10.14.0

### 安装依赖

```bash
cd t3-elegance
pnpm install
```

### 数据库设置

```bash
# 进入 server 目录
cd packages/server

# 生成 Prisma 客户端
pnpm run prisma:generate

# 运行数据库迁移（首次运行或 schema 变更后）
pnpm run prisma:migrate
```

### 启动开发服务器

```bash
# 同时启动前端和后端
pnpm run start
```

这将启动：
- **后端服务器**: http://localhost:3000
- **前端应用**: http://localhost:5173
- **tRPC 端点**: http://localhost:3000/trpc

### 单独启动

```bash
# 仅启动后端
cd packages/server
pnpm start

# 仅启动前端
cd packages/client
pnpm start
```

### 构建生产版本

```bash
# 构建所有包
pnpm run build

# 运行生产服务器
cd packages/server
pnpm serve
```

### Prisma 常用命令

```bash
# 在 packages/server 目录下执行

# 生成 Prisma 客户端（修改 schema 后必须执行）
pnpm run prisma:generate

# 创建新的迁移
pnpm run prisma:migrate

# 打开 Prisma Studio（可视化数据库管理工具）
npx prisma studio

# 重置数据库（警告：会删除所有数据）
npx prisma migrate reset
```

## 📁 项目结构详解

### Client Package

```
packages/client/
├── src/
│   ├── App.tsx           # 主应用组件
│   ├── main.tsx          # 应用入口
│   ├── trpc.ts           # tRPC 客户端配置
│   └── assets/           # 静态资源
├── vite.config.ts        # Vite 配置（含路径别名）
├── tsconfig.json         # TypeScript 配置
└── package.json
```

**关键配置：**

```typescript
// vite.config.ts - 路径别名配置
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@server': path.resolve(__dirname, '../server/src'),
    },
  },
});
```

### Server Package

```
packages/server/
├── src/
│   ├── server.ts         # Express 服务器入口
│   ├── context.ts        # Prisma 客户端和 tRPC Context 定义
│   ├── routers/
│   │   ├── trpc.ts       # tRPC 基础构建块（避免循环依赖）
│   │   ├── _app.ts       # 主路由聚合器
│   │   └── user.ts       # 用户相关的 tRPC 路由
│   └── types.ts          # 服务器特定类型
├── prisma/
│   ├── schema.prisma     # Prisma 数据库 schema
│   ├── migrations/       # 数据库迁移历史
│   └── dev.db            # SQLite 数据库文件（开发环境）
├── prisma.config.ts      # Prisma 配置文件
├── .env                  # 环境变量（DATABASE_URL）
├── .gitignore            # Git 忽略文件
├── tsconfig.json         # TypeScript 配置
└── package.json
```

**关键配置：**

```typescript
// server.ts - tRPC 与 Express 集成
import { createContext } from './context';

app.use('/trpc', trpcExpress.createExpressMiddleware({
  router: appRouter,
  createContext,  // 注入 Prisma 客户端
}));
```

**Prisma Schema 示例：**

```prisma
// prisma/schema.prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  posts     Post[]
}

model Post {
  id       String @id @default(cuid())
  title    String
  content  String?
  author   User   @relation(fields: [authorId], references: [id])
  authorId String
}
```

### Common Package

```
packages/common/
├── src/
│   └── types.ts          # 共享类型定义
├── tsconfig.json         # TypeScript 配置
└── package.json
```

**共享类型示例：**

```typescript
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export type UserProfileOutput = ApiResponse<User & { totalPosts: number }>;
```

## 🔧 TypeScript 配置策略

### 项目引用 (Project References)

本项目使用 TypeScript 的项目引用功能实现：

1. **增量编译**：只重新编译修改的包
2. **类型检查优化**：并行类型检查
3. **强制依赖顺序**：确保正确的构建顺序

```json
// packages/client/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "references": [
    {"path": "../common"},
    {"path": "../server"}  // 仅用于类型导入
  ]
}
```

### 基础配置继承

```json
// tsconfig.base.json
{
  "compilerOptions": {
    "target": "ES2020",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "composite": true,      // 启用项目引用
    "declaration": true,    // 生成类型声明文件
    "declarationMap": true  // 生成声明映射
  }
}
```

## 🎯 核心技术实现

### 1. tRPC 工作流程

```
┌─────────┐                    ┌─────────┐
│ Client  │                    │ Server  │
└────┬────┘                    └────┬────┘
     │                              │
     │  1. 调用 trpc.getUserDetails.useQuery()
     ├─────────────────────────────>│
     │                              │
     │                         2. 验证输入 (Zod)
     │                              │
     │                         3. 执行查询逻辑
     │                              │
     │                         4. 验证输出 (Zod)
     │                              │
     │  5. 返回类型安全的数据
     │<─────────────────────────────┤
     │                              │
     │  6. React Query 缓存和状态管理
     │                              │
```

### 2. React Query 集成

tRPC 与 React Query 深度集成，提供：

- **自动缓存**：避免重复请求
- **后台重新验证**：保持数据新鲜
- **乐观更新**：提升用户体验
- **状态管理**：`isLoading`、`isError`、`data` 等

```typescript
const { data, isLoading, isError } = trpc.getUserDetails.useQuery(
  { userId: 'user-001' },
  {
    staleTime: 5000,        // 5秒内认为数据是新鲜的
    cacheTime: 10 * 60000,  // 缓存10分钟
    refetchOnWindowFocus: true,
  }
);
```

### 3. Zod 运行时验证

虽然 TypeScript 提供编译时类型检查，但运行时验证同样重要：

```typescript
// 输入验证
.input(z.object({
  userId: z.string().min(1)
}))

// 输出验证
.output(z.custom<UserProfileOutput>())
```

**优势：**
- 防止恶意输入
- 验证外部数据源
- 提供清晰的错误信息
- 与 TypeScript 类型同步

## 🔐 CORS 配置

```typescript
// packages/server/src/server.ts
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173']
}));
```

**生产环境建议：**
- 使用环境变量配置允许的源
- 启用凭证支持（如需要）
- 限制允许的 HTTP 方法

## 📊 开发工具和脚本

### 根目录脚本

```json
{
  "scripts": {
    "start": "pnpm --filter ./packages/* --parallel start",
    "build": "pnpm --filter ./packages/* --parallel build",
    "typecheck": "tsc --noEmit"
  }
}
```

### 包级脚本

**Server:**
- `start`: 使用 ts-node 启动开发服务器
- `build`: 编译 TypeScript 到 `dist/`
- `serve`: 运行编译后的生产代码

**Client:**
- `start` / `dev`: 启动 Vite 开发服务器
- `build`: 构建生产版本
- `preview`: 预览生产构建
- `lint`: 运行 ESLint

## 🚦 最佳实践

### 1. 类型安全

✅ **推荐：**
- 始终导出后端的 `AppRouter` 类型
- 使用 Zod 进行输入输出验证
- 利用 TypeScript 的 `strict` 模式

❌ **避免：**
- 使用 `any` 类型
- 绕过类型检查
- 手动维护 API 接口定义

### 2. 代码组织

✅ **推荐：**
- 按功能模块组织路由（如 `user.ts`、`post.ts`）
- 共享类型放在 `common` 包
- 使用路径别名简化导入

❌ **避免：**
- 所有路由放在一个文件
- 在多处重复定义类型
- 使用相对路径导入跨包模块

### 3. 性能优化

✅ **推荐：**
- 使用 React Query 的缓存策略
- 启用 tRPC 的批量请求（`httpBatchLink`）
- 利用 Vite 的代码分割

❌ **避免：**
- 过度请求相同数据
- 忽略加载和错误状态
- 打包所有依赖到一个文件

## �️ 数据库架构

### Prisma + SQLite 集成

本项目使用 **Prisma** 作为 ORM，**SQLite** 作为开发数据库。Prisma 提供：

- **类型安全的数据库访问**：自动生成的 TypeScript 类型
- **迁移管理**：版本控制的数据库 schema 变更
- **直观的查询 API**：比原生 SQL 更易读和维护
- **Prisma Studio**：内置的数据库可视化工具

### 数据模型

当前项目包含两个模型：

**User 模型：**
- `id`: CUID 主键
- `email`: 唯一邮箱
- `name`: 可选用户名
- `createdAt` / `updatedAt`: 自动时间戳
- `posts`: 与 Post 的一对多关系

**Post 模型：**
- `id`: CUID 主键
- `title`: 文章标题
- `content`: 可选内容
- `author` / `authorId`: 与 User 的多对一关系

### 数据库工作流

1. **修改 Schema**：编辑 `packages/server/prisma/schema.prisma`
2. **创建迁移**：运行 `pnpm run prisma:migrate`
3. **生成客户端**：运行 `pnpm run prisma:generate`
4. **在代码中使用**：通过 `ctx.prisma` 访问数据库

```typescript
// 示例：在 tRPC procedure 中使用 Prisma
.query(async ({ input, ctx }) => {
  const user = await ctx.prisma.user.findUnique({
    where: { id: input.userId },
    include: { posts: true },  // 包含关联数据
  });
  return user;
})
```

## 🔐 避免循环依赖的架构设计

### 问题背景

在 tRPC 项目中，常见的循环依赖问题：
- `user.ts` 需要从 `_app.ts` 导入 `router` 和 `publicProcedure`
- `_app.ts` 需要从 `user.ts` 导入 `userRouter`
- 导致运行时错误：`Cannot read properties of undefined`

### 解决方案：三层架构

```
trpc.ts (基础层)
   ↓
user.ts (路由层)
   ↓
_app.ts (聚合层)
```

**1. 基础层 (`trpc.ts`)**：定义 tRPC 构建块
```typescript
export const router = t.router;
export const publicProcedure = t.procedure;
```

**2. 路由层 (`user.ts`)**：从基础层导入，定义具体路由
```typescript
import { router, publicProcedure } from './trpc';
export const userRouter = router({ ... });
```

**3. 聚合层 (`_app.ts`)**：从基础层和路由层导入，组合所有路由
```typescript
import { router } from './trpc';
import { userRouter } from './user';
export const appRouter = router({ user: userRouter });
```

**优势：**
- ✅ 清晰的单向依赖流
- ✅ 避免循环依赖
- ✅ 易于扩展新路由
- ✅ 符合关注点分离原则

## 🔮 扩展建议

### 切换到 PostgreSQL/MySQL

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"  // 或 "mysql"
  url      = env("DATABASE_URL")
}
```

```bash
# .env
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
```

### 添加身份验证

```typescript
// 扩展 Context 以包含用户信息
export function createContext({ req, res }) {
  const user = getUserFromToken(req.headers.authorization);
  return { req, res, prisma, user };
}

// 创建受保护的 procedure
const protectedProcedure = publicProcedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

// 使用受保护的 procedure
export const userRouter = router({
  getMyProfile: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findUnique({
      where: { id: ctx.user.id }
    });
  }),
});
```

### 添加更多路由

```typescript
// packages/server/src/routers/post.ts
export const postRouter = router({
  create: publicProcedure.mutation(...),
  list: publicProcedure.query(...),
});

// packages/server/src/routers/_app.ts
export const appRouter = router({
  user: userRouter,
  post: postRouter,
  comment: commentRouter,
});
```

### 添加实时订阅（WebSocket）

```typescript
// 使用 tRPC subscriptions
export const userRouter = router({
  onUserUpdate: publicProcedure
    .subscription(() => {
      return observable<User>((emit) => {
        // 实现订阅逻辑
      });
    }),
});
```

## � 常见问题和解决方案

### 1. Prisma 客户端未生成

**问题**：`Module '@prisma/client' has no exported member 'PrismaClient'`

**解决方案**：
```bash
cd packages/server
pnpm run prisma:generate
```

### 2. 数据库连接错误

**问题**：`PrismaConfigEnvError: Missing required environment variable: DATABASE_URL`

**解决方案**：
- 确保 `packages/server/.env` 文件存在
- 检查 `DATABASE_URL="file:./dev.db"` 配置正确

### 3. tRPC 循环依赖错误

**问题**：`Cannot read properties of undefined (reading 'input')`

**解决方案**：
- 确保使用三层架构（`trpc.ts` → `user.ts` → `_app.ts`）
- 路由文件应从 `./trpc` 导入，而不是从 `_app.ts` 导入

### 4. pnpm 工作区依赖问题

**问题**：前端无法找到后端类型

**解决方案**：
```bash
# 在根目录重新安装依赖
pnpm install

# 确保 tsconfig.json 中的 references 配置正确
```

### 5. TypeScript 编译错误

**问题**：`skipLibCheck` 相关错误

**解决方案**：
- 在 `packages/server/tsconfig.json` 中添加 `"skipLibCheck": true`
- 添加 `ts-node` 配置：`"transpileOnly": true`

## 📊 项目统计

- **总代码行数**：~500 行（不含 node_modules）
- **包数量**：3 个（client, server, common）
- **依赖数量**：~20 个核心依赖
- **数据库表**：2 个（User, Post）
- **API 端点**：2 个（createUser, getUserDetails）
- **类型安全覆盖率**：100%

## 🎓 学习路径建议

### 初学者
1. 理解 Monorepo 概念和 pnpm workspaces
2. 学习 TypeScript 基础和类型系统
3. 了解 tRPC 的基本用法
4. 掌握 React Query 的数据获取模式

### 进阶
1. 深入 Prisma ORM 和数据库设计
2. 实现身份验证和授权
3. 添加中间件和错误处理
4. 优化性能（缓存、批量请求）

### 高级
1. 实现实时功能（WebSocket subscriptions）
2. 添加测试（单元测试、集成测试）
3. 部署到生产环境
4. 监控和日志系统

## �📚 学习资源

### 官方文档
- [tRPC 官方文档](https://trpc.io/) - 类型安全的 RPC 框架
- [Prisma 文档](https://www.prisma.io/docs) - 现代化 ORM
- [React Query 文档](https://tanstack.com/query/latest) - 数据获取和缓存
- [Zod 文档](https://zod.dev/) - TypeScript 优先的 schema 验证
- [pnpm Workspaces](https://pnpm.io/workspaces) - 高效的包管理器
- [TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)

### 推荐教程
- [T3 Stack](https://create.t3.gg/) - 类似架构的全栈框架
- [Prisma 快速入门](https://www.prisma.io/docs/getting-started)
- [tRPC 完整教程](https://trpc.io/docs/quickstart)

## 🤝 贡献指南

欢迎贡献！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/amazing-feature`
3. 提交更改：`git commit -m 'Add amazing feature'`
4. 推送到分支：`git push origin feature/amazing-feature`
5. 提交 Pull Request

**代码规范：**
- 使用 TypeScript strict 模式
- 遵循 ESLint 规则
- 为新功能添加类型定义
- 保持代码简洁和可读

## 📝 许可证

ISC

## 👥 作者

T3-Elegance 项目团队

---

**最后更新**: 2025-11-18
**TypeScript 版本**: 5.9.3
**Prisma 版本**: 6.19.0
**架构模式**: Monorepo + End-to-End Type Safety + Prisma ORM

**核心特性：**
- ✅ 完整的端到端类型安全
- ✅ Prisma ORM 数据库集成
- ✅ 避免循环依赖的模块化架构
- ✅ React Query 数据管理
- ✅ pnpm Workspaces Monorepo
- ✅ 生产就绪的项目结构


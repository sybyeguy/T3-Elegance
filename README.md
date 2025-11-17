# Fullstack TypeScript Application

一个现代化的全栈 TypeScript 应用，展示了端到端类型安全、Monorepo 架构和最佳实践。

## 🏗️ 项目架构

本项目采用 **Monorepo** 架构，使用 **pnpm workspaces** 管理多个相互依赖的包：

```
fullstack-ts-app/
├── packages/
│   ├── client/          # React 前端应用
│   ├── server/          # Express + tRPC 后端服务
│   └── common/          # 共享类型定义
├── tsconfig.base.json   # 基础 TypeScript 配置
├── pnpm-workspace.yaml  # pnpm workspace 配置
└── package.json         # 根项目配置
```

### 架构特点

- **端到端类型安全**：通过 tRPC 实现前后端类型共享，无需手动维护 API 契约
- **Monorepo 管理**：使用 pnpm workspaces 统一管理依赖和构建流程
- **TypeScript Project References**：利用 TypeScript 项目引用实现增量编译和类型检查
- **模块化设计**：清晰的关注点分离，共享代码通过 `common` 包复用

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
| **Zod** | 3.25.76 | 运行时数据验证 |
| **CORS** | 2.8.5 | 跨域资源共享 |
| **ts-node** | 10.9.2 | TypeScript 运行时 |

**关键特性：**
- **tRPC Procedures**：定义类型安全的 API 端点
- **Zod 验证**：输入输出的运行时验证
- **Express 中间件**：通过 `@trpc/server/adapters/express` 集成

### 共享层 (Common)

- **共享类型定义**：`User`、`ApiResponse<T>`、`UserProfileOutput`
- **类型复用**：前后端共享同一套类型定义，确保一致性

## 🔄 端到端类型安全实现

### 1. 后端定义 API 和类型

```typescript
// packages/server/src/routers/user.ts
export const appRouter = t.router({
  getUserDetails: t.procedure
    .input(z.object({ userId: z.string() }))
    .output(z.custom<UserProfileOutput>())
    .query(({ input }): UserProfileOutput => {
      // 实现逻辑
    }),
});

export type AppRouter = typeof appRouter;  // 导出类型
```

### 2. 前端导入后端类型

```typescript
// packages/client/src/trpc.ts
import type { AppRouter } from '@server/routers/user';
export const trpc = createTRPCReact<AppRouter>();
```

### 3. 类型安全的 API 调用

```typescript
// packages/client/src/App.tsx
const { data, isLoading, isError } = trpc.getUserDetails.useQuery({ 
  userId: 'user-001' 
});
// data 的类型自动推断为 UserProfileOutput
```

**优势：**
- ✅ 自动补全和类型检查
- ✅ 重构时自动更新所有引用
- ✅ 编译时发现 API 不匹配
- ✅ 无需手动维护 API 文档

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
cd fullstack-ts-app
pnpm install
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
│   ├── routers/
│   │   └── user.ts       # tRPC 路由定义
│   └── types.ts          # 服务器特定类型
├── tsconfig.json         # TypeScript 配置
└── package.json
```

**关键配置：**

```typescript
// server.ts - tRPC 与 Express 集成
app.use('/trpc', trpcExpress.createExpressMiddleware({
  router: appRouter,
}));
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

## 🔮 扩展建议

### 添加数据库

```bash
# 安装 Prisma
pnpm add -D prisma
pnpm add @prisma/client

# 初始化
npx prisma init
```

### 添加身份验证

```typescript
// 创建 tRPC context
const createContext = ({ req, res }: CreateExpressContextOptions) => {
  return {
    user: req.user,  // 从 session/JWT 获取
  };
};

// 使用 context
.query(({ ctx, input }) => {
  if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED' });
  // ...
})
```

### 添加更多路由

```typescript
// packages/server/src/routers/index.ts
export const appRouter = t.router({
  user: userRouter,
  post: postRouter,
  comment: commentRouter,
});
```

## 📚 学习资源

- [tRPC 官方文档](https://trpc.io/)
- [React Query 文档](https://tanstack.com/query/latest)
- [Zod 文档](https://zod.dev/)
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)

## 📝 许可证

ISC

---

**构建时间**: 2025-11-17
**TypeScript 版本**: 5.9.3
**架构模式**: Monorepo + End-to-End Type Safety


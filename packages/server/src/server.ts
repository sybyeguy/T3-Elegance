// packages/server/src/server.ts

import express from 'express';
import cors from 'cors';
// 导入 tRPC 适配器，用于将 tRPC 挂载到 Express
import * as trpcExpress from '@trpc/server/adapters/express'; 

// 从您的 tRPC 路由文件导入 appRouter
import { appRouter } from './routers/user'; 

const app = express();
const port = 3000;

// 1. 设置 CORS
// 允许前端（如 localhost:5173）访问后端 API
app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }));
app.use(express.json());

// 2. 挂载 tRPC 路由器
// tRPC 请求的路径将是 http://localhost:3000/trpc
app.use(
  '/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    // context: () => ({}), // 通常用于传递身份验证信息、数据库连接等
  }),
);

// 3. 基础测试路由 (可选，用于确认 Express 仍在运行)
app.get('/', (req, res) => {
  res.send('TypeScript Server is running with tRPC mounted at /trpc!');
});

// 启动服务器
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
  console.log(`tRPC endpoint is at http://localhost:${port}/trpc`);
});
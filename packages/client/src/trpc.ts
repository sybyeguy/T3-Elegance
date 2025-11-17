// packages/client/src/trpc.ts
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@server/routers/user'; // 从后端导入类型

// 这里的 AppRouter 类型就是从后端导出的，实现了类型安全连接！
export const trpc = createTRPCReact<AppRouter>();
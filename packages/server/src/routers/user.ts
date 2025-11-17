// packages/server/src/routers/user.ts
import { initTRPC } from '@trpc/server';
import { z } from 'zod';
// 导入共享类型
import { User, UserProfileOutput } from '@fullstack-ts-app/common';

const t = initTRPC.create(); // 初始化 tRPC

export const appRouter = t.router({
    // 1. 定义 API 过程
    getUserDetails: t.procedure
        // 2. 运行时输入验证
        .input(z.object({ userId: z.string() })) 
        // 3. 约束输出类型 (确保返回结构与共享类型一致)
        .output(z.custom<UserProfileOutput>()) 
        .query(({ input }): UserProfileOutput => {
            console.log(`Fetching details for user: ${input.userId}`);
            
            // 模拟数据库查询结果
            const userData: User = { 
                id: input.userId, 
                name: 'Alice Ts', 
                email: 'alice@ts.com' 
            };
            
            return {
                success: true,
                data: { ...userData, totalPosts: 10 }
            };
        }),
});
// 导出类型供前端使用 (最关键的一步)
export type AppRouter = typeof appRouter;
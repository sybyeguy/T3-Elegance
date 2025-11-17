// packages/client/src/App.tsx

import { trpc } from './trpc'; // 导入我们配置的 tRPC 客户端
import './App.css'; // 保留或移除 CSS 导入

// -----------------------------------------------------------------
// 1. 定义核心组件：用于展示从后端获取的用户数据
// -----------------------------------------------------------------

const UserProfile = () => {
  // 核心：使用 trpc 客户端调用后端的 'getUserDetails' 过程
  // 注意：这里的 'user' 和 'getUserDetails' 路径是根据您后端 tRPC 定义的
  const { data, isLoading, isError } = trpc.getUserDetails.useQuery({ userId: 'user-001' });

  // 状态处理
  if (isLoading) {
    return <div className="loading">Loading user profile...</div>;
  }
  if (isError) {
    // 由于后端返回 ApiResponse 结构，我们尝试显示错误信息
    return <div className="error">An error occurred while fetching user data.</div>;
  }
  if (!data || !data.data) {
    return <div className="empty">No user data found.</div>;
  }

  // 解构出类型安全的数据
  const { id, name, email, totalPosts } = data.data;

  return (
    <div className="card">
      <h2>Welcome, {name}!</h2>
      <p>ID: {id}</p>
      <p>Email: {email}</p>
      <p>Total Posts: **{totalPosts}**</p>
      <p className="read-the-docs">
        Data is guaranteed type-safe by TypeScript and tRPC.
      </p>
    </div>
  );
};

// -----------------------------------------------------------------
// 2. 顶层 App 组件：包裹 QueryClientProvider
// -----------------------------------------------------------------

// 为了让 trpc.useQuery (React Query) 工作，我们需要提供 Provider
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import React from 'react';

// 初始化 React Query 客户端
const queryClient = new QueryClient();

// 初始化 tRPC 客户端配置
const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      // 这里的 URL 应该指向您的后端 Express 服务器地址
      url: 'http://localhost:3000/trpc', 
    }),
  ],
});


function App() {
  return (
    // 使用 Provider 包裹，使子组件能够访问 tRPC 和 QueryClient
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <div className="App">
          <h1>Fullstack TS with tRPC Demo</h1>
          <UserProfile />
        </div>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

export default App;
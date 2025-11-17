// packages/common/src/types.ts
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
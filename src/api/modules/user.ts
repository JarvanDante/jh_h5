import { request } from "@/utils/request";
import type { UserInfo } from "@/stores/user";

// 登录参数
export interface LoginParams {
  username: string;
  password: string;
}

// 登录响应
export interface LoginResponse {
  token: string;
  userInfo: UserInfo;
}

// 用户 API
export const userApi = {
  // 登录
  login(data: LoginParams): Promise<LoginResponse> {
    return request.post("/user/login", data);
  },

  // 获取用户信息
  getUserInfo(): Promise<UserInfo> {
    return request.get("/user/info");
  },

  // 登出
  logout(): Promise<void> {
    return request.post("/user/logout");
  },
};

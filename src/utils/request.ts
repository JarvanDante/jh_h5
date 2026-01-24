import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";
import { showToast, showLoadingToast, closeToast } from "vant";
import { useUserStore } from "@/stores/user";
import router from "@/router";

// 创建 axios 实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json;charset=UTF-8",
  },
});

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 显示加载提示
    if (config.headers?.showLoading !== false) {
      showLoadingToast({
        message: "加载中...",
        forbidClick: true,
        duration: 0,
      });
    }

    // 添加 token
    const userStore = useUserStore();
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`;
    }

    return config;
  },
  (error) => {
    closeToast();
    console.error("请求错误:", error);
    return Promise.reject(error);
  },
);

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    closeToast();

    const { code, data, msg } = response.data;

    // 根据业务状态码处理
    if (code === 0 || code === 200) {
      return data;
    }

    // token 失效
    if (code === 401) {
      showToast("登录已过期，请重新登录");
      const userStore = useUserStore();
      userStore.logout();
      router.push("/login");
      return Promise.reject(new Error(msg || "登录已过期"));
    }

    // 其他错误
    showToast(msg || "请求失败");
    return Promise.reject(new Error(msg || "请求失败"));
  },
  (error) => {
    closeToast();

    console.error("响应错误:", error);

    if (error.response) {
      const { status, data } = error.response;
      switch (status) {
        case 401:
          showToast("登录已过期，请重新登录");
          const userStore = useUserStore();
          userStore.logout();
          router.push("/login");
          break;
        case 403:
          showToast("没有权限访问");
          break;
        case 404:
          showToast("请求的资源不存在");
          break;
        case 500:
          showToast("服务器错误");
          break;
        default:
          showToast(data?.msg || "请求失败");
      }
    } else if (error.request) {
      showToast("网络错误，请检查网络连接");
    } else {
      showToast("请求失败");
    }

    return Promise.reject(error);
  },
);

// 封装请求方法
export const request = {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return service.get(url, config);
  },

  post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return service.post(url, data, config);
  },

  put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return service.put(url, data, config);
  },

  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return service.delete(url, config);
  },
};

export default service;

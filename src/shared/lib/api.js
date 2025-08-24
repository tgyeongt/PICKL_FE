import axios from "axios";

const BASE_URL = import.meta.env.VITE_SERVER_BASE_URL;

// 공용 API 인스턴스 (토큰이 필요 없는 경우)
const publicAPI = axios.create({
  baseURL: BASE_URL,
});

// 인증 API 인스턴스 (토큰이 필요한 경우)
const privateAPI = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,
});

// accessToken을 자동으로 Authorization 헤더에 삽입
privateAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// refresh 토큰 요청 로직
privateAPI.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      (error.response?.status === 401 || error.response?.status === 500) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        localStorage.clear();
        window.location.href = "/";
        return Promise.reject(error);
      }

      try {
        const res = await publicAPI.post("/auth/refresh", {
          refreshToken,
        });

        const newAccessToken = res.data?.accessToken;
        if (newAccessToken) {
          localStorage.setItem("accessToken", newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return privateAPI(originalRequest);
        }
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = "/";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const APIService = {
  // 공용 API 메서드 (토큰 불필요)
  public: {
    get: async (url, config = {}) => {
      const response = await publicAPI.get(url, config);
      return response.data;
    },
    post: async (url, data = {}, config = {}) => {
      const response = await publicAPI.post(url, data, config);
      return response.data;
    },
  },

  // 인증 API 메서드 (토큰 필요)
  private: {
    get: async (url, config = {}) => {
      const response = await privateAPI.get(url, config);
      return response.data;
    },
    post: async (url, data = {}, config = {}) => {
      const response = await privateAPI.post(url, data, config);
      return response.data;
    },
    put: async (url, data = {}, config = {}) => {
      const response = await privateAPI.put(url, data, config);
      return response.data;
    },
    delete: async (url, config = {}) => {
      const response = await privateAPI.delete(url, config);
      return response.data;
    },
    patch: async (url, data = {}, config = {}) => {
      const response = await privateAPI.patch(url, data, config);
      return response.data;
    },
  },
};

export { publicAPI, privateAPI };

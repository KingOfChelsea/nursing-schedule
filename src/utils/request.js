import axios from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useUserStore } from '@/stores/user';
import router from '@/router';

// 创建 axios 实例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
  },
});

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 从 store 中获取 token
    const userStore = useUserStore();
    const token = userStore.token;

    // 如果有 token 则添加到请求头
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 如果是 FormData 类型，移除 Content-Type 让浏览器自动设置
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  },
);

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    const res = response.data;

    // 如果后端返回了 code，根据 code 判断
    if (res.code !== undefined) {
      if (res.code === 0 || res.code === 200) {
        return res;
      }

      // token 过期或无效
      if (res.code === 401) {
        ElMessageBox.confirm('登录状态已失效，请重新登录', '提示', {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning',
        }).then(() => {
          const userStore = useUserStore();
          userStore.resetToken();
          router.push('/login');
        });
        return Promise.reject(new Error(res.message || '登录状态已失效'));
      }

      // 权限不足
      if (res.code === 403) {
        ElMessage.error('没有权限执行此操作');
        return Promise.reject(new Error(res.message || '权限不足'));
      }

      // 其他错误
      ElMessage.error(res.message || '请求失败');
      return Promise.reject(new Error(res.message || '请求失败'));
    }

    // 如果后端没有返回 code，直接返回数据
    return res;
  },
  (error) => {
    console.error('响应错误:', error);

    let message = '网络错误';

    if (error.response) {
      switch (error.response.status) {
        case 400:
          message = '请求参数错误';
          break;
        case 401:
          message = '未授权，请重新登录';
          break;
        case 403:
          message = '拒绝访问';
          break;
        case 404:
          message = '请求的资源不存在';
          break;
        case 405:
          message = '请求方法不允许';
          break;
        case 408:
          message = '请求超时';
          break;
        case 500:
          message = '服务器内部错误';
          break;
        case 502:
          message = '网关错误';
          break;
        case 503:
          message = '服务不可用';
          break;
        case 504:
          message = '网关超时';
          break;
        default:
          message = `请求失败 (${error.response.status})`;
      }
    } else if (error.code === 'ECONNABORTED') {
      message = '请求超时，请稍后重试';
    } else if (error.message.includes('Network Error')) {
      message = '网络连接异常，请检查网络';
    }

    ElMessage.error(message);
    return Promise.reject(error);
  },
);

// 封装 GET 请求
export function get(url, params = {}, config = {}) {
  return service({
    url,
    method: 'get',
    params,
    ...config,
  });
}

// 封装 POST 请求
export function post(url, data = {}, config = {}) {
  return service({
    url,
    method: 'post',
    data,
    ...config,
  });
}

// 封装 PUT 请求
export function put(url, data = {}, config = {}) {
  return service({
    url,
    method: 'put',
    data,
    ...config,
  });
}

// 封装 DELETE 请求
export function del(url, params = {}, config = {}) {
  return service({
    url,
    method: 'delete',
    params,
    ...config,
  });
}

// 封装文件上传
export function upload(url, file, config = {}) {
  const formData = new FormData();
  formData.append('file', file);

  return service({
    url,
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    ...config,
  });
}

// 封装文件下载
export function download(url, params = {}, filename = '') {
  return service({
    url,
    method: 'get',
    params,
    responseType: 'blob',
  }).then((response) => {
    // 从响应头中获取文件名
    const contentDisposition = response.headers['content-disposition'];
    let fileName = filename;

    if (contentDisposition) {
      const match = contentDisposition.match(/filename=(.+)/);
      if (match) {
        fileName = decodeURIComponent(match[1]);
      }
    }

    // 创建 Blob 对象
    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);

    // 创建下载链接
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || 'download';
    document.body.appendChild(link);
    link.click();

    // 清理
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return response;
  });
}

export default service;


// 默认地址，优先从本地存储读取，方便用户在 UI 中修改
const getBaseUrl = () => {
  return localStorage.getItem('zenplan_api_url') || 'http://127.0.0.1:5000';
};

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

export const apiClient = async (endpoint: string, options: RequestOptions = {}) => {
  const { params, headers, ...rest } = options;
  const token = localStorage.getItem('zenplan_token');
  const baseUrl = getBaseUrl();

  let url = `${baseUrl}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...rest,
      mode: 'cors', // 显式声明跨域模式
      headers: {
        ...defaultHeaders,
        ...headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      // 抛出后端返回的错误信息
      throw new Error(data.message || `请求失败: ${response.status}`);
    }

    return data;
  } catch (err: any) {
    // 如果没有 response 说明是浏览器层面的网络错误（通常是 CORS 或地址不通）
    if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
      throw new Error(`无法连接到服务器 (${baseUrl})。请检查后端是否启动，并已开启 CORS。`);
    }
    throw err;
  }
};

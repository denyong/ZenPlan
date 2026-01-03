
// 默认地址，优先从本地存储读取
const getBaseUrl = () => {
  let url = localStorage.getItem('zenplan_api_url') || 'http://127.0.0.1:5000';
  // 移除末尾多余的斜杠
  return url.replace(/\/+$/, '');
};

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

export const apiClient = async (endpoint: string, options: RequestOptions = {}) => {
  const { params, headers, ...rest } = options;
  const token = localStorage.getItem('zenplan_token');
  const baseUrl = getBaseUrl();

  // 确保 endpoint 以 / 开头
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  let url = `${baseUrl}${path}`;

  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...rest,
      mode: 'cors',
      headers: {
        ...defaultHeaders,
        ...headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `请求失败: ${response.status}`);
    }

    return data;
  } catch (err: any) {
    console.error(`[API Error] URL: ${url}`, err);
    
    if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
      // 针对 "Redirect is not allowed for a preflight request" 的特别诊断
      throw new Error(`连接失败。请检查：\n1. 后端是否已启动并在 ${baseUrl} 监听。\n2. 后端是否允许跨域 (CORS)。\n3. 如果报错重定向，请尝试在地址末尾添加或删除斜杠。`);
    }
    throw err;
  }
};

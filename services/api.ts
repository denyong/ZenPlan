
const getBaseUrl = () => {
  return localStorage.getItem('calmexec_api_url') || 'http://127.0.0.1:5000';
};

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
  onStream?: (chunk: string) => void; // 新增：流式回调
}

export const apiClient = async (endpoint: string, options: RequestOptions = {}) => {
  const { params, headers, onStream, ...rest } = options;
  const token = localStorage.getItem('calmexec_token');
  const baseUrl = getBaseUrl();

  const baseWithSlash = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  let finalUrlObj: URL;
  try {
    finalUrlObj = new URL(cleanEndpoint, baseWithSlash);
  } catch (e) {
    finalUrlObj = new URL(`${baseWithSlash}${cleanEndpoint}`);
  }

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        finalUrlObj.searchParams.append(key, String(value));
      }
    });
  }

  const url = finalUrlObj.toString();

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

    // 核心逻辑：401 处理
    if (response.status === 401) {
      console.warn("[CalmExec] Token 过期或无效，正在跳转登录...");
      localStorage.removeItem('calmexec_token');
      localStorage.removeItem('calmexec_user');
      // 强制跳转到登录页 (Hash 路由)
      window.location.hash = '#/auth';
      // 抛出错误以中断当前业务逻辑
      throw new Error("会话已过期，请重新登录。");
    }

    // 处理流式输出逻辑
    if (onStream && response.body && response.ok) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value, { stream: !done });
        if (chunkValue) {
          onStream(chunkValue);
        }
      }
      return { data: { success: true } }; // 流式结束返回简单标志
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `请求失败: ${response.status}`);
    }

    return data;
  } catch (err: any) {
    console.error(`[CalmExec API Error] 目标 URL: ${url}`, err);
    
    // 如果是 401 触发的 Error 不再展示诊断提示，由 UI 或路由处理
    if (err.message.includes("重新登录")) throw err;

    if (err.name === 'TypeError' && (err.message === 'Failed to fetch' || err.message.includes('CORS'))) {
      const diagnosis = `连接失败。请确保后端服务在 ${baseUrl} 运行且允许跨域请求。`;
      throw new Error(diagnosis);
    }
    throw err;
  }
};

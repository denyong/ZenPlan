
const getBaseUrl = () => {
  const DEFAULT_URL = 'http://127.0.0.1:5000/';
  let rawUrl = localStorage.getItem('calmexec_api_url');
  
  if (!rawUrl || typeof rawUrl !== 'string' || rawUrl.trim() === '') {
    return DEFAULT_URL;
  }
  
  let url = rawUrl.trim();
  
  // 补全协议头
  if (!/^https?:\/\//i.test(url)) {
    url = 'http://' + url;
  }

  try {
    const parsed = new URL(url);
    // 基础校验：必须有 hostname
    if (!parsed.hostname) return DEFAULT_URL;
    
    // 移除路径末尾多余的斜杠并重新添加一个，确保作为 Base URL 时表现一致
    const cleanPath = parsed.origin + parsed.pathname.replace(/\/+$/, '');
    return cleanPath + '/';
  } catch (e) {
    console.warn("[CalmExec] API URL 格式非法，回退到默认地址:", url);
    return DEFAULT_URL;
  }
};

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
  onStream?: (chunk: string) => void; 
}

export const apiClient = async (endpoint: string, options: RequestOptions = {}) => {
  const { params, headers, onStream, ...rest } = options;
  const token = localStorage.getItem('calmexec_token');
  const baseWithSlash = getBaseUrl();

  // 1. 防御性检查：确保 endpoint 是字符串
  const safeEndpoint = String(endpoint || '');
  
  // 2. 规范化 Endpoint：移除开头的斜杠
  const cleanEndpoint = safeEndpoint.startsWith('/') ? safeEndpoint.slice(1) : safeEndpoint;
  
  let finalUrlObj: URL;
  try {
    // 采用标准化的 URL 构造方式
    // 如果 cleanEndpoint 是绝对路径（如 http://...），它会忽略 baseWithSlash
    finalUrlObj = new URL(cleanEndpoint, baseWithSlash);
  } catch (e) {
    console.error("[CalmExec] 无法构造 URL。Endpoint:", cleanEndpoint, "Base:", baseWithSlash);
    // 最后的防御：如果解析彻底失败，抛出带有诊断信息的错误，而不是让系统静默崩溃
    throw new Error(`请求地址格式无效。请在设置中检查服务器地址配置。 (Endpoint: ${cleanEndpoint})`);
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

    if (response.status === 401) {
      console.warn("[CalmExec] Token 过期或无效，正在跳转登录...");
      localStorage.removeItem('calmexec_token');
      localStorage.removeItem('calmexec_user');
      window.location.hash = '#/auth';
      throw new Error("会话已过期，请重新登录。");
    }

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
      return { data: { success: true } };
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `请求失败: ${response.status}`);
    }

    return data;
  } catch (err: any) {
    console.error(`[CalmExec API Error] 目标 URL: ${url}`, err);
    
    if (err.message && err.message.includes("重新登录")) throw err;

    if (err.name === 'TypeError' && (err.message === 'Failed to fetch' || err.message.includes('CORS'))) {
      const diagnosis = `连接失败。请确保后端服务在 ${baseWithSlash} 运行且允许跨域请求。`;
      throw new Error(diagnosis);
    }
    throw err;
  }
};

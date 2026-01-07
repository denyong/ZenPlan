
const getBaseUrl = () => {
  const DEFAULT_URL = 'http://127.0.0.1:5000/';
  let rawUrl = localStorage.getItem('calmexec_api_url');
  
  // 1. 基本非空校验
  if (!rawUrl || typeof rawUrl !== 'string' || rawUrl.trim() === '') {
    return DEFAULT_URL;
  }
  
  let url = rawUrl.trim();
  
  // 2. 补全协议头，确保符合 URL 规范
  if (!/^https?:\/\//i.test(url)) {
    // 处理类似 ://example.com 的非法情况
    if (url.startsWith('://')) {
      url = 'http' + url;
    } else {
      url = 'http://' + url;
    }
  }

  try {
    const parsed = new URL(url);
    // 基础校验：必须包含有效的 hostname
    if (!parsed.hostname || parsed.hostname === 'null') return DEFAULT_URL;
    
    // 移除路径末尾多余的斜杠并重新添加一个，确保作为 Base URL 时表现一致
    // 这样在使用 new URL(relative, base) 时表现最稳定
    const cleanOriginAndPath = parsed.origin + parsed.pathname.replace(/\/+$/, '');
    return cleanOriginAndPath + '/';
  } catch (e) {
    console.warn("[CalmExec] API URL 格式解析失败，回退到默认地址:", url);
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

  // 1. 防御性检查：确保 endpoint 是合法字符串
  const safeEndpoint = String(endpoint || '').trim();
  
  // 2. 规范化 Endpoint：移除可能导致解析冲突的开头斜杠
  const cleanEndpoint = safeEndpoint.startsWith('/') ? safeEndpoint.slice(1) : safeEndpoint;
  
  let finalUrlObj: URL;
  try {
    /**
     * URL 构造逻辑:
     * 如果 cleanEndpoint 是绝对路径，baseWithSlash 会被忽略。
     * 如果 cleanEndpoint 是相对路径，会基于 baseWithSlash 进行拼接。
     */
    finalUrlObj = new URL(cleanEndpoint, baseWithSlash);
  } catch (e) {
    console.error("[CalmExec] 构造 URL 对象失败:", { endpoint: cleanEndpoint, base: baseWithSlash });
    // 抛出带有上下文的错误，便于用户在设置页修复配置
    throw new Error(`请求地址构造失败。请检查服务器地址配置是否正确 (当前配置: ${baseWithSlash})`);
  }

  // 3. 动态添加查询参数
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        try {
          finalUrlObj.searchParams.append(key, String(value));
        } catch (e) {
          console.warn(`[CalmExec] 无法添加参数 ${key}:`, value);
        }
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
      const diagnosis = `网络连接失败。请检查后端服务是否在 ${baseWithSlash} 运行，并确保其允许跨域(CORS)请求。`;
      throw new Error(diagnosis);
    }
    throw err;
  }
};

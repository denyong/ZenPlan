
/**
 * 获取基础 API 地址
 * 默认使用 http://127.0.0.1:5000
 */
const getBaseUrl = () => {
  return localStorage.getItem('zenplan_api_url') || 'http://127.0.0.1:5000';
};

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

/**
 * 核心 API 调用工具
 * 自动处理 Token 注入、URL 拼接及预检错误诊断
 */
export const apiClient = async (endpoint: string, options: RequestOptions = {}) => {
  const { params, headers, ...rest } = options;
  const token = localStorage.getItem('zenplan_token');
  const baseUrl = getBaseUrl();

  // 使用 URL 对象进行健壮的路径拼接
  // 确保 baseUrl 以 / 结尾，endpoint 不以 / 开头
  const baseWithSlash = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  let finalUrlObj: URL;
  try {
    finalUrlObj = new URL(cleanEndpoint, baseWithSlash);
  } catch (e) {
    // 降级处理：手动拼接
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

    const data = await response.json();

    if (!response.ok) {
      // 抛出包含后端返回消息的错误
      throw new Error(data.message || `请求失败: ${response.status}`);
    }

    return data;
  } catch (err: any) {
    console.error(`[ZenPlan API Error] 目标 URL: ${url}`, err);
    
    // 核心排错逻辑：诊断 "Redirect is not allowed for a preflight request"
    if (err.name === 'TypeError' && (err.message === 'Failed to fetch' || err.message.includes('CORS'))) {
      const diagnosis = `
检测到网络连接失败 (ERR_FAILED)。这通常由以下原因引起：
1. 后端服务未启动：请确保 Flask/FastAPI/Node 在 ${baseUrl} 运行。
2. 跨域拦截 (CORS)：后端未允许来自 http://127.0.0.1:3000 的请求。
3. 预检重定向：如果报错包含 "Redirect not allowed for preflight"，请尝试：
   - 在设置中将地址改为：${baseUrl}/ (添加斜杠)
   - 或检查后端路由是否强制要求末尾斜杠。
      `.trim();
      throw new Error(diagnosis);
    }
    throw err;
  }
};

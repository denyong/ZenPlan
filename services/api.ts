
const getBaseUrl = () => {
  return localStorage.getItem('calmexec_api_url') || 'http://127.0.0.1:5000';
};

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

export const apiClient = async (endpoint: string, options: RequestOptions = {}) => {
  const { params, headers, ...rest } = options;
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

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `请求失败: ${response.status}`);
    }

    return data;
  } catch (err: any) {
    console.error(`[CalmExec API Error] 目标 URL: ${url}`, err);
    
    if (err.name === 'TypeError' && (err.message === 'Failed to fetch' || err.message.includes('CORS'))) {
      const diagnosis = `
检测到网络连接失败 (ERR_FAILED)。这通常由以下原因引起：
1. 后端服务未启动：请确保 Flask/FastAPI/Node 在 ${baseUrl} 运行。
2. 跨域拦截 (CORS)：后端未允许来自当前域名的请求。
3. 预检重定向：请检查后端路由是否强制要求末尾斜杠。
      `.trim();
      throw new Error(diagnosis);
    }
    throw err;
  }
};

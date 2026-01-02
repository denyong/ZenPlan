
const BASE_URL = 'http://127.0.0.1:5000';

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

export const apiClient = async (endpoint: string, options: RequestOptions = {}) => {
  const { params, headers, ...rest } = options;
  const token = localStorage.getItem('zenplan_token');

  let url = `${BASE_URL}${endpoint}`;
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

  const response = await fetch(url, {
    ...rest,
    headers: {
      ...defaultHeaders,
      ...headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'API Request Failed');
  }

  return data;
};

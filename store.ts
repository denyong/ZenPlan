
import { create } from 'zustand';
import { Goal, Todo, WeeklyReview, GoalLevel, Status, Priority, User } from './types.ts';
import { apiClient } from './services/api.ts';

interface AppState {
  user: User | null;
  token: string | null;
  goals: Goal[];
  todos: Todo[];
  reviews: WeeklyReview[];
  stats: any | null;
  loading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
  setApiUrl: (url: string) => void;

  fetchGoals: (filters?: any) => Promise<void>;
  addGoal: (goal: Partial<Goal>) => Promise<void>;
  updateGoal: (id: string | number, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string | number) => Promise<void>;

  fetchTodos: (filters?: any) => Promise<void>;
  addTodo: (todo: Partial<Todo>) => Promise<void>;
  toggleTodo: (id: string | number) => Promise<void>;
  updateTodo: (id: string | number, updates: Partial<Todo>) => Promise<void>;
  deleteTodo: (id: string | number) => Promise<void>;

  fetchReviews: () => Promise<void>;
  saveReview: (review: Partial<WeeklyReview>) => Promise<void>;
  fetchTrendReport: () => Promise<string>;

  fetchTaskAnalysis: (onStream?: (chunk: string) => void) => Promise<any>;
  fetchGoalBreakdown: (title: string, description: string) => Promise<any>;

  fetchStats: () => Promise<void>;
}

const getInitialUser = (): User | null => {
  try {
    const userStr = localStorage.getItem('calmexec_user');
    if (userStr && userStr !== "undefined") return JSON.parse(userStr);
  } catch (e) { console.error(e); }
  return null;
};

// 离线数据加载辅助
const getCachedData = <T>(key: string, defaultValue: T): T => {
  try {
    const cached = localStorage.getItem(`calmexec_cache_${key}`);
    if (cached) return JSON.parse(cached);
  } catch (e) { console.error(e); }
  return defaultValue;
};

export const useStore = create<AppState>((set, get) => ({
  user: getInitialUser(),
  token: localStorage.getItem('calmexec_token'),
  goals: getCachedData<Goal[]>('goals', []),
  todos: getCachedData<Todo[]>('todos', []),
  reviews: getCachedData<WeeklyReview[]>('reviews', []),
  stats: getCachedData<any>('stats', null),
  loading: false,
  error: null,

  setApiUrl: (url: string) => {
    localStorage.setItem('calmexec_api_url', url);
  },

  checkAuth: () => {
    const token = localStorage.getItem('calmexec_token');
    const user = getInitialUser();
    if (token && user) set({ token, user });
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      const { token, user } = res.data || {};
      localStorage.setItem('calmexec_token', token);
      localStorage.setItem('calmexec_user', JSON.stringify(user));
      set({ token, user, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  register: async (username, email, password) => {
    set({ loading: true, error: null });
    try {
      await apiClient('/api/v1/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password }),
      });
      set({ loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('calmexec_token');
    localStorage.removeItem('calmexec_user');
    set({ user: null, token: null, goals: [], todos: [], reviews: [], stats: null });
    window.location.hash = '#/auth';
  },

  fetchGoals: async (filters) => {
    set({ loading: true });
    try {
      const res = await apiClient('/api/v1/goals', { params: filters });
      const goals = res.data?.goals || res.data || [];
      localStorage.setItem('calmexec_cache_goals', JSON.stringify(goals));
      set({ goals, loading: false, error: null });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  addGoal: async (goal) => {
    await apiClient('/api/v1/goals', { method: 'POST', body: JSON.stringify(goal) });
    get().fetchGoals();
  },

  updateGoal: async (id, updates) => {
    await apiClient(`/api/v1/goals/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
    get().fetchGoals();
  },

  deleteGoal: async (id) => {
    await apiClient(`/api/v1/goals/${id}`, { method: 'DELETE' });
    get().fetchGoals();
  },

  fetchTodos: async (filters) => {
    set({ loading: true });
    try {
      const res = await apiClient('/api/v1/todos', { params: filters });
      const todos = res.data?.todos || res.data || [];
      localStorage.setItem('calmexec_cache_todos', JSON.stringify(todos));
      set({ todos, loading: false, error: null });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  addTodo: async (todo) => {
    await apiClient('/api/v1/todos', { method: 'POST', body: JSON.stringify(todo) });
    get().fetchTodos();
  },

  toggleTodo: async (id) => {
    await apiClient(`/api/v1/todos/${id}/toggle`, { method: 'PATCH' });
    get().fetchTodos();
  },

  updateTodo: async (id, updates) => {
    await apiClient(`/api/v1/todos/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
    get().fetchTodos();
  },

  deleteTodo: async (id) => {
    await apiClient(`/api/v1/todos/${id}`, { method: 'DELETE' });
    get().fetchTodos();
  },

  fetchReviews: async () => {
    try {
      const res = await apiClient('/api/v1/reviews');
      const reviews = res.data?.reviews || res.data || [];
      localStorage.setItem('calmexec_cache_reviews', JSON.stringify(reviews));
      set({ reviews });
    } catch (err: any) {}
  },

  saveReview: async (review) => {
    await apiClient('/api/v1/reviews', { method: 'POST', body: JSON.stringify(review) });
    get().fetchReviews();
  },

  fetchTrendReport: async () => {
    try {
      const res = await apiClient('/api/v1/reviews/analysis/trends');
      return res.data?.report || res.data?.analysis_report || "暂无报告。";
    } catch (err: any) {
      throw new Error("无法从服务器获取报告，请检查连接。");
    }
  },

  fetchTaskAnalysis: async (onStream) => {
    try {
      const res = await apiClient('/api/v1/analysis/tasks', { onStream });
      return res.data;
    } catch (err: any) {
      throw new Error("后端分析服务暂不可用。");
    }
  },

  fetchGoalBreakdown: async (title, description) => {
    try {
      const res = await apiClient('/api/v1/analysis/breakdown', {
        method: 'POST',
        body: JSON.stringify({ title, description }),
      });
      return res.data;
    } catch (err: any) {
      throw new Error("无法进行目标拆解，请重试。");
    }
  },

  fetchStats: async () => {
    try {
      const res = await apiClient('/api/v1/stats/dashboard/summary');
      localStorage.setItem('calmexec_cache_stats', JSON.stringify(res.data));
      set({ stats: res.data });
    } catch (err: any) {}
  },
}));

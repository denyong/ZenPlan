
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

  // Auth Actions
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
  setApiUrl: (url: string) => void;

  // Goal Actions
  fetchGoals: (filters?: any) => Promise<void>;
  addGoal: (goal: Partial<Goal>) => Promise<void>;
  updateGoal: (id: string | number, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string | number) => Promise<void>;

  // Todo Actions
  fetchTodos: (filters?: any) => Promise<void>;
  addTodo: (todo: Partial<Todo>) => Promise<void>;
  toggleTodo: (id: string | number) => Promise<void>;
  updateTodo: (id: string | number, updates: Partial<Todo>) => Promise<void>;
  deleteTodo: (id: string | number) => Promise<void>;

  // Review Actions
  fetchReviews: () => Promise<void>;
  saveReview: (review: Partial<WeeklyReview>) => Promise<void>;
  fetchTrendReport: () => Promise<string>;

  // AI Logic (Strictly Backend-based)
  fetchTaskAnalysis: (onStream?: (chunk: string) => void) => Promise<any>;
  fetchGoalBreakdown: (title: string, description: string) => Promise<any>;

  // Stats Actions
  fetchStats: () => Promise<void>;
}

const getInitialUser = (): User | null => {
  try {
    const userStr = localStorage.getItem('calmexec_user');
    if (userStr && userStr !== "undefined") {
      return JSON.parse(userStr);
    }
  } catch (e) {
    console.error("Failed to parse initial user", e);
  }
  return null;
};

export const useStore = create<AppState>((set, get) => ({
  user: getInitialUser(),
  token: localStorage.getItem('calmexec_token'),
  goals: [],
  todos: [],
  reviews: [],
  stats: null,
  loading: false,
  error: null,

  setApiUrl: (url: string) => {
    localStorage.setItem('calmexec_api_url', url);
  },

  checkAuth: () => {
    try {
      const token = localStorage.getItem('calmexec_token');
      const user = getInitialUser();
      if (token && user) {
        set({ token, user });
      }
    } catch (e) {
      localStorage.removeItem('calmexec_token');
      localStorage.removeItem('calmexec_user');
    }
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
      set({ goals: res.data?.goals || res.data || [], loading: false, error: null });
    } catch (err: any) {
      set({ error: err.message, loading: false, goals: [] });
    }
  },

  addGoal: async (goal) => {
    try {
      await apiClient('/api/v1/goals', { method: 'POST', body: JSON.stringify(goal) });
      get().fetchGoals();
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  updateGoal: async (id, updates) => {
    try {
      await apiClient(`/api/v1/goals/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
      get().fetchGoals();
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  deleteGoal: async (id) => {
    try {
      await apiClient(`/api/v1/goals/${id}`, { method: 'DELETE' });
      get().fetchGoals();
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  fetchTodos: async (filters) => {
    set({ loading: true });
    try {
      const res = await apiClient('/api/v1/todos', { params: filters });
      set({ todos: res.data?.todos || res.data || [], loading: false, error: null });
    } catch (err: any) {
      set({ error: err.message, loading: false, todos: [] });
    }
  },

  addTodo: async (todo) => {
    try {
      await apiClient('/api/v1/todos', { method: 'POST', body: JSON.stringify(todo) });
      get().fetchTodos();
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  toggleTodo: async (id) => {
    try {
      await apiClient(`/api/v1/todos/${id}/toggle`, { method: 'PATCH' });
      get().fetchTodos();
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  updateTodo: async (id, updates) => {
    try {
      await apiClient(`/api/v1/todos/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
      get().fetchTodos();
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  deleteTodo: async (id) => {
    try {
      await apiClient(`/api/v1/todos/${id}`, { method: 'DELETE' });
      get().fetchTodos();
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  fetchReviews: async () => {
    try {
      const res = await apiClient('/api/v1/reviews');
      set({ reviews: res.data?.reviews || res.data || [] });
    } catch (err: any) {}
  },

  saveReview: async (review) => {
    try {
      await apiClient('/api/v1/reviews', { method: 'POST', body: JSON.stringify(review) });
      get().fetchReviews();
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  fetchTrendReport: async () => {
    try {
      const res = await apiClient('/api/v1/reviews/analysis/trends');
      return res.data?.report || res.data?.analysis_report || "暂无趋势分析数据。";
    } catch (err: any) {
      throw new Error(err.message || "无法获取分析报告");
    }
  },

  fetchTaskAnalysis: async (onStream) => {
    try {
      const res = await apiClient('/api/v1/analysis/tasks', { onStream });
      return res.data;
    } catch (err: any) {
      throw new Error(err.message || "AI 诊断请求失败，请检查后端接口。");
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
      throw new Error(err.message || "目标拆解失败。");
    }
  },

  fetchStats: async () => {
    try {
      const res = await apiClient('/api/v1/stats/dashboard/summary');
      set({ stats: res.data });
    } catch (err: any) {}
  },
}));

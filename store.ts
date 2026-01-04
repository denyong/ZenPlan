
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

  // Stats Actions
  fetchStats: () => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  token: null,
  goals: [],
  todos: [],
  reviews: [],
  stats: null,
  loading: false,
  error: null,

  setApiUrl: (url: string) => {
    localStorage.setItem('zenplan_api_url', url);
  },

  checkAuth: () => {
    try {
      const token = localStorage.getItem('zenplan_token');
      const userStr = localStorage.getItem('zenplan_user');
      if (token && userStr && userStr !== "undefined") {
        set({ token, user: JSON.parse(userStr) });
      }
    } catch (e) {
      console.error("Auth check failed", e);
      localStorage.removeItem('zenplan_token');
      localStorage.removeItem('zenplan_user');
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
      
      if (!token) throw new Error("响应中缺少有效 Token");
      
      localStorage.setItem('zenplan_token', token);
      localStorage.setItem('zenplan_user', JSON.stringify(user));
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
    localStorage.removeItem('zenplan_token');
    localStorage.removeItem('zenplan_user');
    set({ user: null, token: null, goals: [], todos: [], reviews: [], stats: null });
  },

  fetchGoals: async (filters) => {
    set({ loading: true });
    try {
      const res = await apiClient('/api/v1/goals', { params: filters });
      // 适配后端返回结构: { data: { goals: [] } } 或 { data: [] }
      const goalsData = res.data?.goals || res.data || [];
      set({ goals: Array.isArray(goalsData) ? goalsData : [], loading: false, error: null });
    } catch (err: any) {
      set({ error: err.message, loading: false, goals: [] });
    }
  },

  addGoal: async (goal) => {
    try {
      await apiClient('/api/v1/goals', {
        method: 'POST',
        body: JSON.stringify(goal),
      });
      get().fetchGoals();
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  updateGoal: async (id, updates) => {
    try {
      await apiClient(`/api/v1/goals/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
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
      const todosData = res.data?.todos || res.data || [];
      set({ todos: Array.isArray(todosData) ? todosData : [], loading: false, error: null });
    } catch (err: any) {
      set({ error: err.message, loading: false, todos: [] });
    }
  },

  addTodo: async (todo) => {
    try {
      await apiClient('/api/v1/todos', {
        method: 'POST',
        body: JSON.stringify(todo),
      });
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
      await apiClient(`/api/v1/todos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
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
      const reviews = res.data?.reviews || res.data || [];
      set({ reviews: Array.isArray(reviews) ? reviews : [] });
    } catch (err: any) {
      console.error("Reviews fetch error:", err);
    }
  },

  saveReview: async (review) => {
    try {
      await apiClient('/api/v1/reviews', {
        method: 'POST',
        body: JSON.stringify(review),
      });
      get().fetchReviews();
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  fetchTrendReport: async () => {
    try {
      const res = await apiClient('/api/v1/reviews/analysis/trends');
      return res.data?.report || res.data?.analysis_report || "暂无分析数据";
    } catch (err: any) {
      throw new Error(err.message || "无法获取分析报告");
    }
  },

  fetchStats: async () => {
    try {
      const res = await apiClient('/api/v1/stats/dashboard/summary');
      set({ stats: res.data });
    } catch (err: any) {
      console.error("Stats fetch error:", err);
    }
  },
}));

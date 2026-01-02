
import { create } from 'zustand';
import { Goal, Todo, WeeklyReview, GoalLevel, Status, Priority, User } from './types.ts';
import { apiClient } from './services/api.ts';

interface AppState {
  user: User | null;
  token: string | null;
  goals: Goal[];
  todos: Todo[];
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
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;

  // Todo Actions
  fetchTodos: (filters?: any) => Promise<void>;
  addTodo: (todo: Partial<Todo>) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
  updateTodo: (id: string, updates: Partial<Todo>) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;

  // Review Actions
  saveReview: (review: Partial<WeeklyReview>) => Promise<void>;

  // Stats Actions
  fetchStats: () => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  token: null,
  goals: [],
  todos: [],
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
    set({ user: null, token: null, goals: [], todos: [], stats: null });
  },

  fetchGoals: async (filters) => {
    set({ loading: true });
    try {
      const res = await apiClient('/api/v1/goals', { params: filters });
      // 防御性编程：确保 goals 始终是数组
      const goalsData = Array.isArray(res.data) ? res.data : [];
      set({ goals: goalsData, loading: false });
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
      // 防御性编程：确保 todos 始终是数组
      const todosData = Array.isArray(res.data) ? res.data : [];
      set({ todos: todosData, loading: false });
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

  saveReview: async (review) => {
    try {
      await apiClient('/api/v1/reviews', {
        method: 'POST',
        body: JSON.stringify(review),
      });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  fetchStats: async () => {
    try {
      const res = await apiClient('/api/v1/stats/dashboard/summary');
      set({ stats: res.data });
    } catch (err: any) {
      set({ error: err.message });
    }
  },
}));

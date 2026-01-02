
import { create } from 'zustand';
import { Goal, Todo, WeeklyReview, GoalLevel, Status, Priority } from './types';
import { apiClient } from './services/api';

interface User {
  id: string;
  username: string;
  email: string;
}

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

  checkAuth: () => {
    const token = localStorage.getItem('zenplan_token');
    const userStr = localStorage.getItem('zenplan_user');
    if (token && userStr) {
      set({ token, user: JSON.parse(userStr) });
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      const { token, user } = res.data;
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
      set({ goals: res.data || [], loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
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
      // Assuming GET /todos based on docs
      const res = await apiClient('/api/v1/todos', { params: filters });
      set({ todos: res.data || [], loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
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

  fetchStats: async () => {
    try {
      const res = await apiClient('/api/v1/stats/dashboard/summary');
      set({ stats: res.data });
    } catch (err: any) {
      set({ error: err.message });
    }
  },
}));

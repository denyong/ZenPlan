
import { create } from 'zustand';
import { Goal, Todo, GoalLevel, Status, Priority } from './types';

interface AppState {
  goals: Goal[];
  todos: Todo[];
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'progress' | 'status'> & { progress?: number }) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  addTodo: (todo: Omit<Todo, 'id' | 'completed'>) => void;
  toggleTodo: (id: string) => void;
  updateTodo: (id: string, updates: Partial<Todo>) => void;
  deleteTodo: (id: string) => void;
}

// 初始模拟数据 - 中文版
const initialGoals: Goal[] = [
  { id: 'g1', title: '成为资深全栈工程师', description: '精通云架构、分布式系统和高级 React 模式', level: GoalLevel.LONG, progress: 35, status: Status.PENDING, createdAt: '2023-01-01' },
  { id: 'g2', title: '上线个人 SaaS 产品', description: '从 0 到 1 构建并部署一个功能完备的生产力工具', level: GoalLevel.MID, progress: 60, status: Status.PENDING, createdAt: '2023-06-01', parentId: 'g1' },
  { id: 'g3', title: '掌握 Gemini API 应用', description: '将前沿 AI 能力集成到当前的所有项目中', level: GoalLevel.SHORT, progress: 85, status: Status.PENDING, createdAt: '2024-05-01', parentId: 'g2' },
];

const initialTodos: Todo[] = [
  { id: 't1', title: '观看 Gemini Pro 1.5 进阶教程', goalId: 'g3', dueDate: new Date().toISOString(), priority: Priority.HIGH, estimatedTime: 45, completed: false },
  { id: 't2', title: '绘制系统架构拓扑图', goalId: 'g2', dueDate: new Date().toISOString(), priority: Priority.MEDIUM, estimatedTime: 90, completed: true, completedAt: new Date().toISOString() },
  { id: 't3', title: '配置 Zustand 状态管理库', goalId: 'g2', dueDate: new Date().toISOString(), priority: Priority.HIGH, estimatedTime: 30, completed: false },
];

export const useStore = create<AppState>((set) => ({
  goals: initialGoals,
  todos: initialTodos,
  addGoal: (goal) => set((state) => ({
    goals: [...state.goals, { 
      id: Math.random().toString(36).substr(2, 9), 
      createdAt: new Date().toISOString(), 
      progress: goal.progress || 0, 
      status: Status.PENDING,
      description: goal.description,
      level: goal.level,
      title: goal.title
    }]
  })),
  updateGoal: (id, updates) => set((state) => ({
    goals: state.goals.map((g) => g.id === id ? { ...g, ...updates } : g)
  })),
  deleteGoal: (id) => set((state) => ({
    goals: state.goals.filter((g) => g.id !== id),
    // 删除目标时可选处理：也将关联的待办事项的 goalId 置空
    todos: state.todos.map(t => t.goalId === id ? { ...t, goalId: undefined } : t)
  })),
  addTodo: (todo) => set((state) => ({
    todos: [...state.todos, { ...todo, id: Math.random().toString(36).substr(2, 9), completed: false }]
  })),
  toggleTodo: (id) => set((state) => ({
    todos: state.todos.map((t) => t.id === id ? { ...t, completed: !t.completed, completedAt: !t.completed ? new Date().toISOString() : undefined } : t)
  })),
  updateTodo: (id, updates) => set((state) => ({
    todos: state.todos.map((t) => t.id === id ? { ...t, ...updates } : t)
  })),
  deleteTodo: (id) => set((state) => ({
    todos: state.todos.filter((t) => t.id !== id)
  })),
}));

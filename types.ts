
export enum GoalLevel {
  LONG = 'long',
  MID = 'mid',
  SHORT = 'short'
}

export enum Priority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export enum Status {
  PENDING = 'pending',
  COMPLETED = 'completed',
  DELAYED = 'delayed',
  ABANDONED = 'abandoned'
}

export interface User {
  id: string | number;
  username: string;
  email: string;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string;
  level: GoalLevel;
  parentId?: string;
  progress: number;
  status: Status;
  deadline?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Todo {
  id: string;
  userId: string;
  goalId?: string;
  title: string;
  description?: string;
  priority: Priority;
  estimatedTime: number; // 分钟
  isCompleted: boolean;
  dueDate: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyReview {
  id: string;
  userId: string;
  year: number;
  weekNumber: number;
  winsContent: string;
  obstaclesContent: string;
  nextFocusContent: string;
  summaryAi?: string;
  createdAt: string;
}

export interface StatCompareItem {
  label: string;
  current: number;
  previous: number;
  changeRate: number;
}

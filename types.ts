
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

export interface Goal {
  id: string;
  title: string;
  description: string;
  level: GoalLevel;
  parentId?: string;
  progress: number;
  status: Status;
  createdAt: string;
  deadline?: string;
}

export interface Todo {
  id: string;
  title: string;
  description?: string;
  goalId?: string;
  dueDate: string;
  priority: Priority;
  estimatedTime: number; // in minutes
  completed: boolean;
  completedAt?: string;
}

export interface StatCompareItem {
  label: string;
  current: number;
  previous: number;
  changeRate: number;
}

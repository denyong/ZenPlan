
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
  avatar_url?: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string;
  level: GoalLevel;
  parent_id?: string;
  progress: number;
  status: Status;
  deadline?: string;
  created_at: string;
  updated_at: string;
}

export interface Todo {
  id: string;
  user_id: string;
  goal_id?: string;
  title: string;
  description?: string;
  priority: Priority;
  estimated_time: number; // 分钟
  is_completed: boolean;
  due_date: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface WeeklyReview {
  id: string;
  user_id: string;
  year: number;
  week_number: number;
  wins_content: string;
  obstacles_content: string;
  next_focus_content: string;
  summary_ai?: string;
  created_at: string;
}

export interface StatCompareItem {
  label: string;
  current: number;
  previous: number;
  changeRate: number;
}

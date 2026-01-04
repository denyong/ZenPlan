
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
  id: string | number;
  user_id: string | number;
  title: string;
  description: string;
  level: GoalLevel;
  parent_id?: string | number;
  progress: number;
  status: Status;
  deadline?: string;
  created_at: string;
  updated_at: string;
}

export interface Todo {
  id: string | number;
  user_id: string | number;
  goal_id?: string | number;
  title: string;
  description?: string;
  priority: Priority;
  estimated_time: number; // 分钟
  is_completed: boolean | number; // 兼容 tinyint(1)
  due_date: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface WeeklyReview {
  id: string | number;
  user_id: string | number;
  year: number;
  week_number: number;
  wins_content: string;
  obstacles_content: string;
  next_focus_content: string;
  summary_ai?: string;
  created_at: string;
}

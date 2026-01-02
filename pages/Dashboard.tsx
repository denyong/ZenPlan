
import React, { useEffect } from 'react';
import { useStore } from '../store';
import { Target, CheckCircle2, Flame, TrendingUp, Clock, ChevronRight, Activity, Loader2 } from 'lucide-react';
import { GoalLevel, Status, Priority } from '../types';

const StatCard = ({ title, value, subtext, icon: Icon, color }: { title: string, value: string | number, subtext: string, icon: any, color: string }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-2 rounded-xl ${color}`}>
        <Icon className="text-white" size={24} />
      </div>
      <div className="flex items-center gap-1 text-emerald-600 font-medium text-sm">
        <TrendingUp size={14} />
        <span>+12%</span>
      </div>
    </div>
    <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
    <div className="flex items-baseline gap-2 mt-1">
      <span className="text-2xl font-bold">{value}</span>
      <span className="text-slate-400 text-xs">{subtext}</span>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const { goals, todos, toggleTodo, fetchGoals, fetchTodos, fetchStats, stats, loading, user } = useStore();
  
  useEffect(() => {
    fetchGoals();
    fetchTodos();
    fetchStats();
  }, [fetchGoals, fetchTodos, fetchStats]);

  const activeGoals = goals.filter(g => g.status === Status.PENDING).slice(0, 3);
  const todayTodos = todos.filter(t => !t.isCompleted).slice(0, 5);
  const completedToday = todos.filter(t => t.isCompleted).length; // Placeholder logic as per API docs
  
  const weeklyCompletionRate = Math.round((todos.filter(t => t.isCompleted).length / (todos.length || 1)) * 100);

  if (loading && goals.length === 0) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
        <p className="text-slate-400 font-medium">同步云端数据中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">欢迎回来, {user?.username}</h1>
          <p className="text-slate-500">规划你的战略愿景，掌控每一天的执行细节。</p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full font-medium">
          <Flame size={20} className="fill-indigo-700" />
          <span>连续达标 {stats?.streak_days || 0} 天</span>
        </div>
      </div>

      {/* 核心指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="战略目标" value={stats?.total_goals || goals.length} subtext="项正在进行" icon={Target} color="bg-indigo-600" />
        <StatCard title="今日执行" value={stats?.completed_todos_today || completedToday} subtext="项已完成" icon={CheckCircle2} color="bg-emerald-500" />
        <StatCard title="平均效能" value={`${stats?.weekly_efficiency || weeklyCompletionRate}%`} subtext="本周胜率" icon={Activity} color="bg-orange-500" />
        <StatCard title="主攻进展" value={`${Math.round(goals[0]?.progress || 0)}%`} subtext="核心目标" icon={TrendingUp} color="bg-indigo-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 今日聚焦任务 */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Clock size={20} className="text-indigo-600" />
              今日聚焦
            </h2>
            <button className="text-indigo-600 text-sm font-medium hover:underline">去待办列表</button>
          </div>
          <div className="divide-y divide-slate-50 flex-1">
            {todayTodos.map((todo) => (
              <div key={todo.id} className="group px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                <button 
                  onClick={() => toggleTodo(todo.id)}
                  className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                    todo.isCompleted 
                      ? 'bg-indigo-600 border-indigo-600' 
                      : 'border-slate-300 group-hover:border-indigo-400'
                  }`}
                >
                  {todo.isCompleted && <CheckCircle2 size={14} className="text-white" />}
                </button>
                <div className="flex-1 min-w-0">
                  <h4 className={`font-medium truncate ${todo.isCompleted ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                    {todo.title}
                  </h4>
                  <p className="text-xs text-slate-400 truncate mt-0.5">{todo.description || '暂无备注'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    todo.priority === Priority.HIGH ? 'bg-rose-50 text-rose-600' :
                    todo.priority === Priority.MEDIUM ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {todo.priority === Priority.HIGH ? '紧急' : todo.priority === Priority.MEDIUM ? '中等' : '普通'}
                  </span>
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-600 transition-colors" />
                </div>
              </div>
            ))}
            {todayTodos.length === 0 && (
              <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
                <div className="p-3 bg-slate-50 rounded-full text-slate-300">
                   <CheckCircle2 size={40} />
                </div>
                <div>
                  <p className="font-bold text-slate-500 text-lg">今日任务已全部清空</p>
                  <p className="text-slate-400 text-sm">享受成就感，或开始规划明天。</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 重点目标跟踪 */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Target size={20} className="text-indigo-600" />
            活跃目标跟踪
          </h2>
          <div className="space-y-8 flex-1">
            {activeGoals.map((goal) => (
              <div key={goal.id} className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-700 truncate pr-4">{goal.title}</span>
                  <span className="text-indigo-600 font-bold">{goal.progress}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${
                      goal.level === GoalLevel.LONG ? 'bg-indigo-600' : 
                      goal.level === GoalLevel.MID ? 'bg-blue-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${goal.progress}%` }}
                  ></div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${
                    goal.level === GoalLevel.LONG ? 'bg-purple-100 text-purple-700' :
                    goal.level === GoalLevel.MID ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {goal.level === GoalLevel.LONG ? '长期' : goal.level === GoalLevel.MID ? '中期' : '短期'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">最后更新: {new Date(goal.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
            {activeGoals.length === 0 && (
              <div className="text-center py-10 text-slate-400 text-sm italic">
                暂无活跃目标，去“目标管理”添加一个吧。
              </div>
            )}
          </div>
          <button className="w-full mt-8 py-3.5 rounded-xl bg-slate-50 text-slate-600 font-bold hover:bg-indigo-50 hover:text-indigo-600 transition-all flex items-center justify-center gap-2">
            战略规划
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

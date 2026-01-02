
import React from 'react';
import { useStore } from '../store';
import { Target, CheckCircle2, Flame, TrendingUp, Clock, ChevronRight } from 'lucide-react';
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
  const { goals, todos, toggleTodo } = useStore();
  
  const activeGoals = goals.filter(g => g.status === Status.PENDING);
  const todayTodos = todos.filter(t => t.completed === false).slice(0, 5);
  const completedToday = todos.filter(t => t.completed && t.completedAt?.startsWith(new Date().toISOString().split('T')[0])).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">早上好, Alex</h1>
          <p className="text-slate-500">今天你有 {todayTodos.length} 项待办任务和 3 个核心目标需要关注。</p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full font-medium">
          <Flame size={20} className="fill-indigo-700" />
          <span>连续达标 8 天</span>
        </div>
      </div>

      {/* 核心指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="目标总数" value={goals.length} subtext="正在追踪" icon={Target} color="bg-indigo-600" />
        <StatCard title="今日完成" value={completedToday} subtext="项任务" icon={CheckCircle2} color="bg-emerald-500" />
        <StatCard title="执行效率" value="84%" subtext="周平均" icon={Clock} color="bg-orange-500" />
        <StatCard title="核心进展" value={`${Math.round(goals[0]?.progress || 0)}%`} subtext="主攻目标" icon={TrendingUp} color="bg-indigo-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 今日聚焦 */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Clock size={20} className="text-indigo-600" />
              今日聚焦任务
            </h2>
            <button className="text-indigo-600 text-sm font-medium hover:underline">查看全部</button>
          </div>
          <div className="divide-y divide-slate-50">
            {todayTodos.map((todo) => (
              <div key={todo.id} className="group px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                <button 
                  onClick={() => toggleTodo(todo.id)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    todo.completed 
                      ? 'bg-indigo-600 border-indigo-600' 
                      : 'border-slate-300 group-hover:border-indigo-400'
                  }`}
                >
                  {todo.completed && <CheckCircle2 size={14} className="text-white" />}
                </button>
                <div className="flex-1">
                  <h4 className={`font-medium ${todo.completed ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                    {todo.title}
                  </h4>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                    <span className={`px-2 py-0.5 rounded-full ${
                      todo.priority === Priority.HIGH ? 'bg-rose-50 text-rose-600' :
                      todo.priority === Priority.MEDIUM ? 'bg-amber-50 text-amber-600' : 'bg-slate-100'
                    }`}>
                      {todo.priority === Priority.HIGH ? '紧急' : todo.priority === Priority.MEDIUM ? '中等' : '普通'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {todo.estimatedTime} 分钟
                    </span>
                  </div>
                </div>
                <ChevronRight size={18} className="text-slate-300 opacity-0 group-hover:opacity-100" />
              </div>
            ))}
            {todayTodos.length === 0 && (
              <div className="py-12 text-center text-slate-400">
                所有任务已完成！享受你的闲暇时光。
              </div>
            )}
          </div>
        </div>

        {/* 重点目标进度 */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-lg font-bold mb-6">活跃目标进展</h2>
          <div className="space-y-6">
            {activeGoals.map((goal) => (
              <div key={goal.id} className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-slate-700 truncate">{goal.title}</span>
                  <span className="text-indigo-600 font-bold">{goal.progress}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-600 transition-all duration-1000" 
                    style={{ width: `${goal.progress}%` }}
                  ></div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                    goal.level === GoalLevel.LONG ? 'bg-purple-100 text-purple-700' :
                    goal.level === GoalLevel.MID ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {goal.level === GoalLevel.LONG ? '长期' : goal.level === GoalLevel.MID ? '中期' : '短期'}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-3 rounded-xl bg-slate-50 text-slate-600 font-medium hover:bg-indigo-50 hover:text-indigo-600 transition-all">
            管理所有目标
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
